import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Play, Plus, Calendar, Zap, TrendingUp, Download, WifiOff, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';
import { useActiveWorkout } from '@/lib/stores/workout-store';
import { useAppState, useNavigation } from '@/lib/stores/app-store';
import { startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ActiveWorkout from '@/components/ActiveWorkout';

export default function HomePage() {
  const { isActive } = useActiveWorkout();
  const { isOnline, installPromptEvent, setInstallPromptEvent, showInstallPrompt, setShowInstallPrompt } = useAppState();
  const { setView } = useNavigation();
  const [userName] = useState('Atleta');

  const activeRoutines = useLiveQuery(() => 
    db.workoutRoutines.where('isActive').equals(1).toArray()
  );

  const weekStart = startOfWeek(new Date(), { locale: ptBR });
  const weekEnd = endOfWeek(new Date(), { locale: ptBR });

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

  const totalWorkouts = useLiveQuery(() => db.workoutSessions.count());

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
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GymFlow</h1>
          <p className="text-muted-foreground">Bem-vindo, {userName}! 💪</p>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="outline" onClick={() => setView('reminders')}>
            <Bell className="w-5 h-5" />
          </Button>
          {!isOnline && (
            <Badge variant="secondary">
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
      </div>

      {/* Install PWA Prompt */}
      {showInstallPrompt && installPromptEvent && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Instalar GymFlow</p>
                <p className="text-sm text-muted-foreground">Acesso rápido e funciona offline</p>
              </div>
            </div>
            <Button size="sm" onClick={handleInstallPWA}>
              Instalar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <p className="text-sm text-muted-foreground">Hoje</p>
            </div>
            <p className="text-2xl font-bold">{todayWorkouts?.length || 0}</p>
            <p className="text-xs text-muted-foreground">treinos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">Semana</p>
            </div>
            <p className="text-2xl font-bold">{thisWeekWorkouts?.length || 0}</p>
            <p className="text-xs text-muted-foreground">treinos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-4 h-4 text-purple-500" />
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <p className="text-2xl font-bold">{totalWorkouts || 0}</p>
            <p className="text-xs text-muted-foreground">treinos</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start Workout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rotinas Ativas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeRoutines && activeRoutines.length > 0 ? (
            activeRoutines.map((routine) => (
              <Button
                key={routine.id}
                className="w-full justify-start h-auto py-4"
                variant="outline"
                onClick={() => {
                  // Will implement start workout logic
                  setView('workouts');
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <p className="font-semibold">{routine.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {routine.days.length} dias • {routine.days.reduce((sum, d) => sum + d.exercises.length, 0)} exercícios
                    </p>
                  </div>
                  <Play className="w-5 h-5" />
                </div>
              </Button>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">Nenhuma rotina ativa</p>
              <Button onClick={() => setView('workouts')}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Rotina
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-24 flex-col" onClick={() => setView('exercises')}>
          <Zap className="w-6 h-6 mb-2" />
          <span>Treino Rápido</span>
        </Button>

        <Button variant="outline" className="h-24 flex-col" onClick={() => setView('progress')}>
          <TrendingUp className="w-6 h-6 mb-2" />
          <span>Ver Progresso</span>
        </Button>
      </div>
    </div>
  );
}
