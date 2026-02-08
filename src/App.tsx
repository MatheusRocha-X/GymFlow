import { useEffect, useState } from 'react';
import { useNavigation, useAppState } from '@/lib/stores/app-store';
import { initializeDatabase, db } from '@/lib/db';
import { notificationService } from '@/lib/notifications';
import { BottomNav } from '@/components/BottomNav';
import { TelegramOnboarding } from '@/components/TelegramOnboarding';
import HomePage from '@/pages/HomePage';
import WorkoutsPage from '@/pages/WorkoutsPage';
import ExercisesPage from '@/pages/ExercisesPage';
import HistoryPage from '@/pages/HistoryPage';
import ProgressPage from '@/pages/ProgressPage';
import RemindersPage from '@/pages/RemindersPage';
import SettingsPage from '@/pages/SettingsPage';

function App() {
  const { currentView } = useNavigation();
  const { setOnline, setInstallPromptEvent } = useAppState();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Check for onboarding status
  useEffect(() => {
    const checkOnboarding = async () => {
      await initializeDatabase();
      const settings = await db.telegramSettings.toArray();
      
      if (settings.length === 0) {
        setShowOnboarding(true);
      }
      setCheckingOnboarding(false);
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
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

    // Start notification monitoring (using Telegram)
    // Will only start if Telegram is configured
    notificationService.startMonitoring();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      notificationService.stopMonitoring();
    };
  }, [setOnline, setInstallPromptEvent]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  if (checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/10">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium text-muted-foreground">Carregando GymFlow...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <TelegramOnboarding onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />;
  }

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
