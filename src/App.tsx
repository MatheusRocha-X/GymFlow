import { useEffect } from 'react';
import { useNavigation, useAppState } from '@/lib/stores/app-store';
import { initializeDatabase } from '@/lib/db';
import { notificationService } from '@/lib/notifications';
import { BottomNav } from '@/components/BottomNav';
import HomePage from '@/pages/HomePage';
import WorkoutsPage from '@/pages/WorkoutsPage';
import ExercisesPage from '@/pages/ExercisesPage';
import HistoryPage from '@/pages/HistoryPage';
import ProgressPage from '@/pages/ProgressPage';
import RemindersPage from '@/pages/RemindersPage';
import SettingsPage from '@/pages/SettingsPage';

function App() {
  const { currentView } = useNavigation();
  const { setOnline, setInstallPromptEvent, setNotificationPermission } = useAppState();

  useEffect(() => {
    // Initialize database
    initializeDatabase();

    // Setup online/offline listeners
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Setup PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      // Start notification monitoring if permission granted
      if (Notification.permission === 'granted') {
        notificationService.startMonitoring();
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      notificationService.stopMonitoring();
    };
  }, [setOnline, setInstallPromptEvent, setNotificationPermission]);

  const renderPage = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'workouts':
        return <WorkoutsPage />;
      case 'exercises':
        return <ExercisesPage />;
      case 'reminders':
        return <RemindersPage />;
      case 'history':
        return <HistoryPage />;
      case 'progress':
        return <ProgressPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="max-w-screen-lg mx-auto">
        {renderPage()}
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
