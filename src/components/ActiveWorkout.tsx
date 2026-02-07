import { useState, useEffect } from 'react';
import { Check, X, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useActiveWorkout } from '@/lib/stores/workout-store';
import { db } from '@/lib/db';
import { formatTime, formatDuration } from '@/lib/utils';

export default function ActiveWorkout() {
  const {
    currentWorkout,
    currentExerciseIndex,
    restTimer,
    updateSet,
    nextExercise,
    previousExercise,
    startRestTimer,
    stopRestTimer,
    tickRestTimer,
    endWorkout,
    cancelWorkout
  } = useActiveWorkout();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [notes, setNotes] = useState('');

  // Workout timer
  useEffect(() => {
    if (!currentWorkout) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(currentWorkout.startTime).getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentWorkout]);

  // Rest timer
  useEffect(() => {
    if (!restTimer.isActive) return;

    const interval = setInterval(() => {
      tickRestTimer();
      if (restTimer.seconds <= 1) {
        // Play sound or notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Descanso terminado!', {
            body: 'Hora da próxima série',
            icon: '/pwa-192x192.png'
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer.isActive, restTimer.seconds, tickRestTimer]);

  if (!currentWorkout) return null;

  const currentExercise = currentWorkout.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === currentWorkout.exercises.length - 1;
  const isFirstExercise = currentExerciseIndex === 0;

  const handleFinishWorkout = async () => {
    const completedWorkout = endWorkout();
    if (completedWorkout) {
      await db.workoutSessions.add({
        ...completedWorkout,
        notes
      });
    }
  };

  const handleCancelWorkout = () => {
    if (confirm('Tem certeza que deseja cancelar este treino?')) {
      cancelWorkout();
    }
  };

  const handleSetChange = (setIndex: number, field: 'reps' | 'weight' | 'completed', value: any) => {
    updateSet(currentExerciseIndex, setIndex, { [field]: value });
  };

  const handleCompleteSet = (setIndex: number) => {
    const set = currentExercise.sets[setIndex];
    if (!set.completed && set.reps > 0 && set.weight >= 0) {
      updateSet(currentExerciseIndex, setIndex, { completed: true });
      // Auto-start rest timer using configured rest time
      const restSeconds = (currentExercise as any).restSeconds || 90;
      startRestTimer(restSeconds);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">{currentWorkout.routineName}</h1>
            <Button size="sm" variant="ghost" onClick={handleCancelWorkout}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Tempo: {formatDuration(elapsedTime)}</span>
            <span>•</span>
            <span>Exercício {currentExerciseIndex + 1}/{currentWorkout.exercises.length}</span>
          </div>
        </div>

        {/* Rest Timer */}
        {restTimer.isActive && (
          <div className="bg-primary/10 p-4 border-t border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Descanso</p>
                <p className="text-3xl font-bold text-primary">{formatTime(restTimer.seconds)}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={stopRestTimer}>
                  Pular
                </Button>
                <Button size="sm" onClick={() => startRestTimer(restTimer.seconds + 30)}>
                  +30s
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Exercise */}
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{currentExercise.exerciseName}</span>
              <Badge>{currentExercise.sets.filter((s: any) => s.completed).length}/{currentExercise.sets.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentExercise.sets.map((set: any, idx: number) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  set.completed
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-muted border-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Série {set.setNumber}</span>
                  {set.completed && (
                    <Badge variant="outline" className="ml-auto">
                      <Check className="w-3 h-3 mr-1" />
                      Completo
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Reps</label>
                    <Input
                      type="number"
                      value={set.reps || ''}
                      onChange={(e) => handleSetChange(idx, 'reps', parseInt(e.target.value) || 0)}
                      disabled={set.completed}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Peso (kg)</label>
                    <Input
                      type="number"
                      value={set.weight || ''}
                      onChange={(e) => handleSetChange(idx, 'weight', parseFloat(e.target.value) || 0)}
                      disabled={set.completed}
                      className="h-9"
                      step="0.5"
                    />
                  </div>
                  <div className="flex items-end">
                    {!set.completed ? (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteSet(idx)}
                        disabled={!set.reps || set.weight === undefined}
                        className="w-full"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetChange(idx, 'completed', false)}
                        className="w-full"
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Set */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const newSet = {
                  setNumber: currentExercise.sets.length + 1,
                  reps: 0,
                  weight: 0,
                  completed: false
                };
                currentExercise.sets.push(newSet);
              }}
            >
              + Adicionar Série
            </Button>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={previousExercise}
            disabled={isFirstExercise}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          {!isLastExercise ? (
            <Button onClick={nextExercise} className="flex-1">
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleFinishWorkout} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Finalizar
            </Button>
          )}
        </div>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações do Treino</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Como foi o treino hoje? Alguma observação?"
              rows={3}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
