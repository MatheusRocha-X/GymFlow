import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Play, Calendar, Trophy, Target, Flame, TrendingUp, Award, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';
import { useActiveWorkout } from '@/lib/stores/workout-store';
import { useNavigation } from '@/lib/stores/app-store';
import { startOfWeek, endOfWeek, startOfMonth, format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ActiveWorkout from '@/components/ActiveWorkout';
import { getDailyQuote } from '@/lib/motivational-quotes';

export default function HomePage() {
  const { isActive } = useActiveWorkout();
  const { setView } = useNavigation();
  const dailyQuote = getDailyQuote();

  const now = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => startOfWeek(now, { locale: ptBR }), [now]);
  const weekEnd = useMemo(() => endOfWeek(now, { locale: ptBR }), [now]);
  const monthStart = useMemo(() => startOfMonth(now), [now]);

  const activeRoutines = useLiveQuery(() => 
    db.workoutRoutines.where('isActive').equals(1).toArray()
  );

  const thisWeekWorkouts = useLiveQuery(() =>
    db.workoutSessions
      .where('startTime')
      .between(weekStart, weekEnd, true, true)
      .toArray()
  );

  const todayWorkouts = useLiveQuery(() =>
    db.workoutSessions
      .where('startTime')
      .between(
        new Date(new Date().setHours(0, 0, 0, 0)),
        new Date(new Date().setHours(23, 59, 59, 999)),
        true,
        true
      )
      .toArray()
  );

  const thisMonthWorkouts = useLiveQuery(() =>
    db.workoutSessions
      .where('startTime')
      .between(monthStart, now, true, true)
      .toArray()
  );

  // Calculate streak
  const workoutStreak = useMemo(() => {
    if (!thisWeekWorkouts) return 0;
    const uniqueDays = new Set(thisWeekWorkouts.map(w => format(w.startTime, 'yyyy-MM-dd')));
    return uniqueDays.size;
  }, [thisWeekWorkouts]);

  // Calculate days since last workout
  const daysSinceLastWorkout = useMemo(() => {
    if (!thisWeekWorkouts || thisWeekWorkouts.length === 0) return null;
    const lastWorkout = thisWeekWorkouts[thisWeekWorkouts.length - 1];
    return differenceInDays(now, lastWorkout.startTime);
  }, [thisWeekWorkouts, now]);

  if (isActive) {
    return <ActiveWorkout />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in max-w-7xl mx-auto pb-20">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 p-4 sm:p-6">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGM2LjYyNyAwIDEyIDUuMzczIDEyIDEycy01LjM3MyAxMi0xMiAxMi0xMi01LjM3My0xMi0xMiA1LjM3My0xMiAxMi0xMnoiIHN0cm9rZT0iI0ZCQzAyRCIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-primary mb-1 tracking-tight">
                  GYMFLOW
                </h1>
                <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">FORÇA • DISCIPLINA • RESULTADO</p>
              </div>
              {daysSinceLastWorkout !== null && daysSinceLastWorkout === 0 && (
                <Badge className="bg-primary text-primary-foreground border-0 px-2 py-0.5 text-[10px] sm:text-xs font-bold">
                  <Flame className="w-3 h-3 mr-1" />
                  ON FIRE
                </Badge>
              )}
            </div>

            {/* Motivational Quote */}
            <div className="mt-4 p-3 sm:p-4 bg-card/60 backdrop-blur-sm rounded-lg border border-border">
              <div className="flex gap-2 sm:gap-3">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm sm:text-base font-semibold text-foreground italic leading-relaxed mb-1">
                    "{dailyQuote.text}"
                  </p>
                  {dailyQuote.author && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                      — {dailyQuote.author}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative group hover:bg-card/80 transition-all">
            <CardContent className="p-3 sm:p-4 relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Hoje</p>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-primary">{todayWorkouts?.length || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative group hover:bg-card/80 transition-all">
            <CardContent className="p-3 sm:p-4 relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Semana</p>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-primary">{thisWeekWorkouts?.length || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative group hover:bg-card/80 transition-all">
            <CardContent className="p-3 sm:p-4 relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Mês</p>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-primary">{thisMonthWorkouts?.length || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative group hover:bg-card/80 transition-all">
            <CardContent className="p-3 sm:p-4 relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Sequência</p>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-primary">{workoutStreak}</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Routines */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">Suas Rotinas</h2>
              </div>
              {activeRoutines && activeRoutines.length > 0 && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setView('workouts')}
                  className="text-primary hover:text-primary/80 hover:bg-primary/10 text-xs h-7"
                >
                  Ver todas →
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-3 sm:p-4">
            {activeRoutines && activeRoutines.length > 0 ? (
              <div className="space-y-2">
                {activeRoutines.slice(0, 3).map((routine) => (
                  <button
                    key={routine.id}
                    className="w-full p-3 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all group"
                    onClick={() => setView('workouts')}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <p className="font-bold text-sm sm:text-base text-foreground truncate">{routine.name}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                            {routine.days.length} dias • {routine.days.reduce((sum, d) => sum + d.exercises.length, 0)} exercícios
                          </p>
                        </div>
                      </div>
                      <Zap className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="mb-4 inline-flex p-4 rounded-full bg-primary/10">
                  <Award className="w-8 h-8 sm:w-10 sm:h-10 text-primary/50" />
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 font-medium">
                  Crie sua primeira rotina de treino
                </p>
                <Button 
                  onClick={() => setView('workouts')} 
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 sm:h-10"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Começar Agora
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            className="h-20 sm:h-24 flex-col border-border bg-card/30 hover:bg-card/60 text-foreground hover:text-foreground group" 
            onClick={() => setView('progress')}
          >
            <div className="p-2 sm:p-2.5 rounded-lg bg-primary/10 mb-2 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <span className="font-bold text-xs sm:text-sm">Ver Progresso</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-20 sm:h-24 flex-col border-border bg-card/30 hover:bg-card/60 text-foreground hover:text-foreground group" 
            onClick={() => setView('workouts')}
          >
            <div className="p-2 sm:p-2.5 rounded-lg bg-primary/10 mb-2 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <span className="font-bold text-xs sm:text-sm">Treino Rápido</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
