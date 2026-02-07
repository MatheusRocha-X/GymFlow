import { Home, Dumbbell, Library, History, Bell, Settings } from 'lucide-react';
import { useNavigation } from '@/lib/stores/app-store';
import { cn } from '@/lib/utils';

type View = 'home' | 'workouts' | 'exercises' | 'history' | 'progress' | 'reminders' | 'settings';

const navItems: Array<{ id: View; label: string; icon: React.ComponentType<any> }> = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'workouts', label: 'Treinos', icon: Dumbbell },
  { id: 'exercises', label: 'Exercícios', icon: Library },
  { id: 'reminders', label: 'Lembretes', icon: Bell },
  { id: 'history', label: 'Histórico', icon: History },
  { id: 'settings', label: 'Config', icon: Settings }
];

export function BottomNav() {
  const { currentView, setView } = useNavigation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-screen-lg mx-auto">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors no-select',
              currentView === id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className={cn('w-5 h-5', currentView === id && 'scale-110')} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
