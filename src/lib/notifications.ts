import { db, type Reminder } from './db';

export class NotificationService {
  private static instance: NotificationService;
  private checkInterval: number | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  async startMonitoring() {
    // Request permission first
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return;
    }

    // Check reminders every minute
    this.checkInterval = window.setInterval(() => {
      this.checkReminders();
    }, 60000); // Check every 1 minute

    // Also check immediately
    this.checkReminders();

    // Register service worker for background notifications
    this.registerServiceWorker();
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
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
      // In production, use service worker for better notification support
      const isProduction = import.meta.env.MODE === 'production';
      
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller && isProduction) {
        // Use service worker for better notification support (production only)
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(reminder.title, {
            body: reminder.message,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: `reminder-${reminder.id}`,
            data: {
              reminderId: reminder.id,
              type: reminder.type
            }
          });
        });
      } else {
        // Fallback to regular notification
        new Notification(reminder.title, {
          body: reminder.message,
          icon: '/icon-192x192.png',
          tag: `reminder-${reminder.id}`
        });
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

  private async registerServiceWorker() {
    // Only register service worker in production
    const isProduction = import.meta.env.MODE === 'production';
    
    if ('serviceWorker' in navigator && isProduction) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);

        // Handle notification clicks
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'NOTIFICATION_CLICK') {
            this.handleNotificationAction(event.data);
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    } else {
      console.log('Service Worker registration skipped (development mode)');
    }
  }

  private async handleNotificationAction(data: any) {
    if (data.action === 'drink' && data.reminderId) {
      // Log water intake
      const settings = await db.hydrationSettings.toArray();
      if (settings.length > 0) {
        await db.hydrationLogs.add({
          date: new Date(),
          time: new Date(),
          amount: settings[0].glassSize
        });
      }
    } else if (data.action === 'snooze' && data.reminderId) {
      // Snooze for 15 minutes
      const reminder = await db.reminders.get(data.reminderId);
      if (reminder) {
        const nextTrigger = new Date();
        nextTrigger.setMinutes(nextTrigger.getMinutes() + 15);
        await db.reminders.update(data.reminderId, { nextTrigger });
      }
    }
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
