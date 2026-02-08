import { Home, Dumbbell, TrendingUp, Bell, Settings, List } from 'lucide-react';
import { useNavigation } from '@/lib/stores/app-store';
import { cn } from '@/lib/utils';

type View = 'home' | 'workouts' | 'exercises' | 'history' | 'progress' | 'reminders' | 'settings';

const navItems: Array<{ id: View; label: string; icon: React.ComponentType<any> }> = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'workouts', label: 'Treinos', icon: Dumbbell },
  { id: 'progress', label: 'Progresso', icon: TrendingUp },
  { id: 'exercises', label: 'Exercícios', icon: List },
  { id: 'reminders', label: 'Lembretes', icon: Bell },
  { id: 'settings', label: 'Config', icon: Settings }
];

export function BottomNav() {
  const { currentView, setView } = useNavigation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around h-14 sm:h-16 max-w-screen-lg mx-auto px-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full gap-0.5 sm:gap-1 transition-all duration-200 no-select min-w-0 relative group',
              currentView === id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {/* Active indicator */}
            {currentView === id && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-0.5 bg-primary rounded-full" />
            )}
            
            {/* Icon with background */}
            <div className={cn(
              'p-1.5 sm:p-2 rounded-lg transition-all duration-200',
              currentView === id 
                ? 'bg-primary/10' 
                : 'group-hover:bg-primary/5'
            )}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            </div>
            
            {/* Label */}
            <span className={cn(
              "text-[9px] sm:text-[10px] font-medium truncate w-full text-center px-0.5 transition-all duration-200",
              currentView === id && 'font-bold'
            )}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
