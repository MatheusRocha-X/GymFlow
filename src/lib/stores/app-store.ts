import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type View = 'home' | 'workouts' | 'exercises' | 'history' | 'progress' | 'reminders' | 'settings';

interface NavigationState {
  currentView: View;
  setView: (view: View) => void;
}

export const useNavigation = create<NavigationState>()(
  persist(
    (set) => ({
      currentView: 'home',
      setView: (view) => set({ currentView: view })
    }),
    {
      name: 'navigation-storage'
    }
  )
);

interface AppState {
  isOnline: boolean;
  installPromptEvent: any;
  showInstallPrompt: boolean;
  notificationPermission: NotificationPermission;
  
  setOnline: (isOnline: boolean) => void;
  setInstallPromptEvent: (event: any) => void;
  setShowInstallPrompt: (show: boolean) => void;
  setNotificationPermission: (permission: NotificationPermission) => void;
}

export const useAppState = create<AppState>((set) => ({
  isOnline: navigator.onLine,
  installPromptEvent: null,
  showInstallPrompt: false,
  notificationPermission: 'default',

  setOnline: (isOnline) => set({ isOnline }),
  setInstallPromptEvent: (event) => set({ installPromptEvent: event, showInstallPrompt: !!event }),
  setShowInstallPrompt: (show) => set({ showInstallPrompt: show }),
  setNotificationPermission: (permission) => set({ notificationPermission: permission })
}));
