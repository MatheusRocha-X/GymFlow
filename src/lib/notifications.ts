import { db, type Reminder } from './db';
import { telegramService } from './telegram';
import { getMorningMotivation } from './motivational-quotes';

export class NotificationService {
  private static instance: NotificationService;
  private checkInterval: number | null = null;
  private dailyMotivationInterval: number | null = null;
  private isChecking: boolean = false;
  private processedReminders: Set<string> = new Set();

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async startMonitoring() {
    // Prevent starting multiple monitoring sessions
    if (this.checkInterval !== null) {
      console.log('⚠️ Notification monitoring already running');
      return;
    }

    console.log('Starting notification monitoring...');
    
    // Check if Telegram is configured
    const telegramSettings = await db.telegramSettings.toArray();
    const hasTelegram = telegramSettings.length > 0 && telegramSettings[0].enabled;

    if (!hasTelegram) {
      console.warn('Telegram not configured. Reminders will not be sent.');
      return;
    }

    console.log('Telegram configured. Setting up notification service...');

    // Configure telegram service
    telegramService.setConfig({
      chatId: telegramSettings[0].chatId,
      botToken: telegramSettings[0].botToken
    });

    // Clear any previously processed reminders when starting fresh
    this.processedReminders.clear();

    // Check reminders every 30 seconds for more responsiveness
    this.checkInterval = window.setInterval(() => {
      this.checkReminders();
    }, 30000); // Check every 30 seconds

    // Setup daily motivational messages
    if (telegramSettings[0].dailyMotivationEnabled) {
      this.setupDailyMotivation();
    }

    // Also check immediately
    console.log('Running initial reminder check...');
    await this.checkReminders();
    await this.checkDailyMotivation();
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
    this.isChecking = false;
    this.processedReminders.clear();
    console.log('🛑 Notification monitoring stopped');
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
    // Prevent concurrent checks
    if (this.isChecking) {
      console.log('⏸️ Already checking reminders, skipping...');
      return;
    }

    this.isChecking = true;

    try {
      const now = new Date();
      
      // Get ALL reminders and filter in code (more reliable than indexed query)
      const allReminders = await db.reminders.toArray();
      const reminders = allReminders.filter(r => r.enabled);

      console.log(`🔍 Found ${allReminders.length} total reminders, ${reminders.length} active at ${now.toISOString()}`);
      
      if (reminders.length > 0) {
        console.log('Active reminders:', reminders.map(r => ({
          id: r.id,
          title: r.title,
          enabled: r.enabled,
          nextTrigger: r.nextTrigger,
          recurrence: r.recurrence
        })));
      }

      for (const reminder of reminders) {
        // Generate unique key for this reminder + trigger time
        const reminderKey = `${reminder.id}-${reminder.nextTrigger}`;
        
        // Skip if already processed in this session
        if (this.processedReminders.has(reminderKey)) {
          console.log(`⏭️ Already processed: ${reminder.title}`);
          continue;
        }

        if (this.shouldTriggerReminder(reminder, now)) {
          console.log(`🔔 Triggering reminder NOW: ${reminder.title}`);
          
          // Mark as processed IMMEDIATELY
          this.processedReminders.add(reminderKey);
          
          // Update nextTrigger FIRST to prevent duplicates
          await this.updateNextTrigger(reminder);
          
          // Then send notification
          await this.sendNotification(reminder);
          
          // Clean up old processed reminders (keep only last 100)
          if (this.processedReminders.size > 100) {
            const entries = Array.from(this.processedReminders);
            this.processedReminders = new Set(entries.slice(-100));
          }
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    } finally {
      this.isChecking = false;
    }
  }

  private shouldTriggerReminder(reminder: Reminder, now: Date): boolean {
    const reminderTime = new Date(reminder.time);
    const nextTrigger = reminder.nextTrigger ? new Date(reminder.nextTrigger) : reminderTime;

    // Calculate time difference in seconds
    const timeDiffMs = now.getTime() - nextTrigger.getTime();
    const timeDiffSec = timeDiffMs / 1000;

    console.log(`Checking reminder: ${reminder.title}`, {
      now: now.toISOString(),
      nextTrigger: nextTrigger.toISOString(),
      timeDiffSec: timeDiffSec.toFixed(1) + 's',
      shouldTrigger: timeDiffSec >= 0 && timeDiffSec <= 60
    });

    // Trigger if we're within 60 seconds AFTER the scheduled time
    // This prevents: 
    //   - Triggering too early (negative timeDiff)
    //   - Triggering repeatedly if missed (more than 60s old)
    if (timeDiffSec < 0) {
      // Too early - not time yet
      return false;
    }

    if (timeDiffSec > 60) {
      // Too late - missed window, skip to avoid spam
      console.log(`⚠️ Reminder "${reminder.title}" missed trigger window (${timeDiffSec.toFixed(0)}s late). Skipping to next.`);
      // Update to next trigger without sending
      this.updateNextTrigger(reminder).catch(err => 
        console.error('Error updating missed reminder:', err)
      );
      return false;
    }

    // For weekly recurrence, check day of week
    if (reminder.recurrence === 'weekly' && reminder.daysOfWeek) {
      const currentDay = now.getDay();
      if (!reminder.daysOfWeek.includes(currentDay)) {
        console.log(`Skipping weekly reminder - wrong day. Current: ${currentDay}, Expected: ${reminder.daysOfWeek}`);
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
      console.log(`📤 Sending Telegram notification for: ${reminder.title}`);
      const success = await telegramService.sendReminder(
        reminder.title,
        reminder.message,
        emoji
      );

      if (success) {
        console.log('✅ Reminder sent via Telegram:', reminder.title);
      } else {
        console.error('❌ Failed to send reminder via Telegram');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  private async updateNextTrigger(reminder: Reminder) {
    if (!reminder.id) return;

    const now = new Date();
    const reminderTime = new Date(reminder.time);
    let nextTrigger: Date;

    console.log(`⏭️ Updating next trigger for: ${reminder.title}`);

    switch (reminder.recurrence) {
      case 'daily':
        // Set next trigger to same time tomorrow
        nextTrigger = new Date(reminderTime);
        nextTrigger.setDate(now.getDate());
        nextTrigger.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0, 0);
        
        // If already passed today, set for tomorrow
        if (nextTrigger <= now) {
          nextTrigger.setDate(nextTrigger.getDate() + 1);
        }
        break;

      case 'weekly':
        // Set next trigger to same time next week
        nextTrigger = new Date(reminderTime);
        nextTrigger.setDate(now.getDate());
        nextTrigger.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0, 0);
        
        // If already passed today, set for next week
        if (nextTrigger <= now) {
          nextTrigger.setDate(nextTrigger.getDate() + 7);
        }
        break;

      case 'monthly':
        // Set next trigger to same time next month
        nextTrigger = new Date(reminderTime);
        nextTrigger.setMonth(now.getMonth());
        nextTrigger.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0, 0);
        
        // If already passed this month, set for next month
        if (nextTrigger <= now) {
          nextTrigger.setMonth(nextTrigger.getMonth() + 1);
        }
        break;

      default:
        // For 'none', disable the reminder after triggering
        await db.reminders.update(reminder.id, { enabled: false });
        console.log(`🔕 One-time reminder completed and disabled: ${reminder.title}`);
        return;
    }

    console.log(`📅 Next trigger for "${reminder.title}":`);
    console.log(`   UTC: ${nextTrigger.toISOString()}`);
    console.log(`   Local: ${nextTrigger.toLocaleString('pt-BR')}`);
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
