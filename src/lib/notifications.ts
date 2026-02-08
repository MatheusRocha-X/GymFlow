import { db, type Reminder } from './db';
import { telegramService } from './telegram';
import { getMorningMotivation } from './motivational-quotes';

export class NotificationService {
  private static instance: NotificationService;
  private checkInterval: number | null = null;
  private dailyMotivationInterval: number | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async startMonitoring() {
    // Check if Telegram is configured
    const telegramSettings = await db.telegramSettings.toArray();
    const hasTelegram = telegramSettings.length > 0 && telegramSettings[0].enabled;

    if (!hasTelegram) {
      console.warn('Telegram not configured. Reminders will not be sent.');
      return;
    }

    // Configure telegram service
    telegramService.setConfig({
      chatId: telegramSettings[0].chatId,
      botToken: telegramSettings[0].botToken
    });

    // Check reminders every minute
    this.checkInterval = window.setInterval(() => {
      this.checkReminders();
    }, 60000); // Check every 1 minute

    // Setup daily motivational messages
    if (telegramSettings[0].dailyMotivationEnabled) {
      this.setupDailyMotivation();
    }

    // Also check immediately
    this.checkReminders();
    this.checkDailyMotivation();
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (this.dailyMotivationInterval) {
      clearInterval(this.dailyMotivationInterval);
      this.dailyMotivationInterval = null;
    }
  }

  private setupDailyMotivation() {
    // Check every hour if it's time to send daily motivation
    this.dailyMotivationInterval = window.setInterval(() => {
      this.checkDailyMotivation();
    }, 3600000); // Check every hour
  }

  private async checkDailyMotivation() {
    try {
      const settings = await db.telegramSettings.toArray();
      if (settings.length === 0 || !settings[0].dailyMotivationEnabled) {
        return;
      }

      const now = new Date();
      const [hours] = settings[0].dailyMotivationTime.split(':').map(Number);
      
      // Check if it's the right time (within 1 hour window)
      if (now.getHours() === hours && now.getMinutes() < 60) {
        // Check if we already sent today
        const lastSent = settings[0].lastMotivationalMessage;
        const today = new Date().setHours(0, 0, 0, 0);
        
        if (!lastSent || new Date(lastSent).getTime() < today) {
          // Send motivational message
          const quote = getMorningMotivation();
          await telegramService.sendMotivationalMessage(quote.text, quote.author);
          
          // Update last sent time
          await db.telegramSettings.update(settings[0].id!, {
            lastMotivationalMessage: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error checking daily motivation:', error);
    }
  }

  private async checkReminders() {
    try {
      const now = new Date();
      const reminders = await db.reminders
        .where('enabled')
        .equals(1)
        .toArray();

      for (const reminder of reminders) {
        if (this.shouldTriggerReminder(reminder, now)) {
          await this.sendNotification(reminder);
          await this.updateNextTrigger(reminder);
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  private shouldTriggerReminder(reminder: Reminder, now: Date): boolean {
    const reminderTime = new Date(reminder.time);
    const nextTrigger = reminder.nextTrigger ? new Date(reminder.nextTrigger) : reminderTime;

    // Check if it's time to trigger
    if (now < nextTrigger) {
      return false;
    }

    // For weekly recurrence, check day of week
    if (reminder.recurrence === 'weekly' && reminder.daysOfWeek) {
      const currentDay = now.getDay();
      if (!reminder.daysOfWeek.includes(currentDay)) {
        return false;
      }
    }

    return true;
  }

  private async sendNotification(reminder: Reminder) {
    try {
      // Get reminder type emoji
      const emojiMap: Record<string, string> = {
        'hydration': '💧',
        'workout': '🏋️',
        'supplement': '💊',
        'stretching': '🧘',
        'custom': '⏰'
      };

      const emoji = emojiMap[reminder.type] || '⏰';

      // Send via Telegram
      const success = await telegramService.sendReminder(
        reminder.title,
        reminder.message,
        emoji
      );

      if (success) {
        console.log('Reminder sent via Telegram:', reminder.title);
      } else {
        console.error('Failed to send reminder via Telegram');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  private async updateNextTrigger(reminder: Reminder) {
    if (!reminder.id) return;

    const now = new Date();
    let nextTrigger: Date;

    switch (reminder.recurrence) {
      case 'daily':
        nextTrigger = new Date(reminder.time);
        nextTrigger.setDate(now.getDate() + 1);
        break;

      case 'weekly':
        nextTrigger = new Date(reminder.time);
        nextTrigger.setDate(now.getDate() + 7);
        break;

      case 'monthly':
        nextTrigger = new Date(reminder.time);
        nextTrigger.setMonth(now.getMonth() + 1);
        break;

      default:
        // For 'none', disable the reminder after triggering
        await db.reminders.update(reminder.id, { enabled: false });
        return;
    }

    await db.reminders.update(reminder.id, { nextTrigger });
  }

  async scheduleHydrationReminders() {
    const settings = await db.hydrationSettings.toArray();
    if (settings.length === 0 || !settings[0].enabled) {
      return;
    }

    const hydrationSettings = settings[0];
    const now = new Date();
    
    // Create reminder for next scheduled time
    const nextReminder = new Date();
    nextReminder.setHours(hydrationSettings.startHour, 0, 0, 0);
    
    if (nextReminder < now) {
      nextReminder.setDate(nextReminder.getDate() + 1);
    }

    // Check if hydration reminder already exists
    const existingReminders = await db.reminders
      .where('type')
      .equals('hydration')
      .toArray();

    if (existingReminders.length === 0) {
      await db.reminders.add({
        type: 'hydration',
        title: 'Hora de hidratar!',
        message: `Beba 1 copo (${hydrationSettings.glassSize}ml) de água agora.`,
        time: nextReminder,
        recurrence: 'daily',
        enabled: true,
        createdAt: now,
        nextTrigger: nextReminder
      });
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
