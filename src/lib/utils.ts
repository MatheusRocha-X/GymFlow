import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function calculateOneRepMax(weight: number, reps: number): number {
  // Epley formula
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function estimateWeight(oneRepMax: number, reps: number): number {
  // Reverse Epley formula
  if (reps === 1) return oneRepMax;
  return Math.round(oneRepMax / (1 + reps / 30));
}

export function getMuscleColor(muscle: string): string {
  const colors: Record<string, string> = {
    'Peito': 'bg-red-500',
    'Costas': 'bg-blue-500',
    'Pernas': 'bg-green-500',
    'Ombros': 'bg-sky-500',
    'Bíceps': 'bg-purple-500',
    'Tríceps': 'bg-pink-500',
    'Core': 'bg-blue-600',
    'Glúteos': 'bg-indigo-500',
    'Posterior': 'bg-teal-500',
    'Quadríceps': 'bg-lime-500',
    'Panturrilha': 'bg-cyan-500',
    'Trapézio': 'bg-blue-500',
    'Antebraço': 'bg-violet-500',
    'Braquial': 'bg-fuchsia-500'
  };

  return colors[muscle] || 'bg-gray-500';
}

export function getMuscleBgClass(muscle: string): string {
  const colors: Record<string, string> = {
    'Peito': 'bg-red-500/10 border-red-500/20',
    'Costas': 'bg-blue-500/10 border-blue-500/20',
    'Pernas': 'bg-green-500/10 border-green-500/20',
    'Ombros': 'bg-sky-500/10 border-sky-500/20',
    'Bíceps': 'bg-purple-500/10 border-purple-500/20',
    'Tríceps': 'bg-pink-500/10 border-pink-500/20',
    'Core': 'bg-blue-600/10 border-blue-600/20',
    'Glúteos': 'bg-indigo-500/10 border-indigo-500/20',
    'Posterior': 'bg-teal-500/10 border-teal-500/20',
    'Quadríceps': 'bg-lime-500/10 border-lime-500/20',
    'Panturrilha': 'bg-cyan-500/10 border-cyan-500/20',
    'Trapézio': 'bg-blue-500/10 border-blue-500/20',
    'Antebraço': 'bg-violet-500/10 border-violet-500/20',
    'Braquial': 'bg-fuchsia-500/10 border-fuchsia-500/20'
  };

  return colors[muscle] || 'bg-gray-500/10 border-gray-500/20';
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('Notificações não suportadas');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      ...options
    });
  }
}

export function scheduleNotification(reminder: {
  id: number;
  title: string;
  message?: string;
  time: Date;
}) {
  const now = Date.now();
  const reminderTime = reminder.time.getTime();
  const delay = reminderTime - now;

  if (delay > 0) {
    setTimeout(() => {
      showNotification(reminder.title, {
        body: reminder.message,
        tag: `reminder-${reminder.id}`,
        requireInteraction: true
      });
    }, delay);
  }
}
