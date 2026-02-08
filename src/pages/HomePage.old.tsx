import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Play, Plus, Calendar, Zap, TrendingUp, Download, WifiOff, Bell, Sparkles, Dumbbell, Trophy, Target, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';
import { useActiveWorkout } from '@/lib/stores/workout-store';
import { useAppState, useNavigation } from '@/lib/stores/app-store';
import { startOfWeek, endOfWeek, startOfMonth, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ActiveWorkout from '@/components/ActiveWorkout';
import { getDailyQuote } from '@/lib/motivational-quotes';

export default function HomePage() {
  const { isActive } = useActiveWorkout();
  const { isOnline, installPromptEvent, setInstallPromptEvent, showInstallPrompt, setShowInstallPrompt } = useAppState();
  const { setView } = useNavigation();
  const [userName] = useState('Atleta');
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

  const handleInstallPWA = async () => {
    if (!installPromptEvent) return;

    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
      setInstallPromptEvent(null);
    }
  };

  if (isActive) {
    return <ActiveWorkout />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.02] to-background">
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
              GymFlow
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground truncate mt-1">Olá, {userName}! 💪</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="icon" variant="ghost" onClick={() => setView('reminders')} className="h-10 w-10 sm:h-12 sm:w-12 hover:bg-primary/10">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            {!isOnline && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                <span className="hidden sm:inline">Offline</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Motivational Quote */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/5 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
          <CardContent className="p-4 sm:p-6 relative z-10">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-primary to-purple-500 flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base sm:text-lg font-semibold italic leading-relaxed mb-2">
                  "{dailyQuote.text}"
                </p>
                {dailyQuote.author && (
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                    — {dailyQuote.author}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Install PWA Prompt */}
        {showInstallPrompt && installPromptEvent && (
          <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-purple-500/10 shadow-md">
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 rounded-full bg-primary/20 flex-shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base">Instalar GymFlow</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Acesso rápido e funciona offline</p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={handleInstallPWA} 
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
              >
                Instalar Agora
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid - Enhanced */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
                <Badge variant="secondary" className="text-xs">Hoje</Badge>
              </div>
              <p className="text-3xl sm:text-4xl font-bold mb-1">{todayWorkouts?.length || 0}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">treinos completos</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <Badge variant="secondary" className="text-xs">Semana</Badge>
              </div>
              <p className="text-3xl sm:text-4xl font-bold mb-1">{thisWeekWorkouts?.length || 0}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">treinos realizados</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <Badge variant="secondary" className="text-xs">Mês</Badge>
              </div>
              <p className="text-3xl sm:text-4xl font-bold mb-1">{thisMonthWorkouts?.length || 0}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">treinos no mês</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <Badge variant="secondary" className="text-xs">Sequência</Badge>
              </div>
              <p className="text-3xl sm:text-4xl font-bold mb-1">{workoutStreak}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">dias esta semana</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Routines */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                Minhas Rotinas
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setView('workouts')} className="text-xs sm:text-sm">
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeRoutines && activeRoutines.length > 0 ? (
              activeRoutines.slice(0, 3).map((routine) => (
                <Button
                  key={routine.id}
                  className="w-full justify-start h-auto py-4 sm:py-5 text-left hover:shadow-md transition-all border-0 bg-gradient-to-r from-primary/5 to-purple-500/5 hover:from-primary/10 hover:to-purple-500/10"
                  variant="outline"
                  onClick={() => setView('workouts')}
                >
                  <div className="flex items-center justify-between w-full gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-primary/20 flex-shrink-0">
                        <Play className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="font-semibold text-sm sm:text-base truncate">{routine.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {routine.days.length} dias • {routine.days.reduce((sum, d) => sum + d.exercises.length, 0)} exercícios
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0 text-xs">Ativa</Badge>
                  </div>
                </Button>
              ))
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="mb-4 inline-block p-4 rounded-full bg-muted">
                  <Dumbbell className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 font-medium">
                  Nenhuma rotina ativa ainda
                </p>
                <Button onClick={() => setView('workouts')} size="sm" className="bg-gradient-to-r from-primary to-purple-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Rotina
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 pb-4">
          <Button 
            variant="outline" 
            className="h-24 sm:h-32 flex-col text-xs sm:text-sm border-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:from-blue-500/20 hover:to-blue-500/10 shadow-md hover:shadow-lg transition-all" 
            onClick={() => setView('exercises')}
          >
            <div className="p-2 sm:p-3 rounded-full bg-blue-500/20 mb-2 sm:mb-3">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <span className="font-semibold">Treino Rápido</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-24 sm:h-32 flex-col text-xs sm:text-sm border-0 bg-gradient-to-br from-green-500/10 to-green-500/5 hover:from-green-500/20 hover:to-green-500/10 shadow-md hover:shadow-lg transition-all" 
            onClick={() => setView('progress')}
          >
            <div className="p-2 sm:p-3 rounded-full bg-green-500/20 mb-2 sm:mb-3">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <span className="font-semibold">Ver Progresso</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
