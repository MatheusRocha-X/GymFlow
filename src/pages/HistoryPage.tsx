import { useLiveQuery } from 'dexie-react-hooks';
import { Calendar as CalendarIcon, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


export default function HistoryPage() {
  const workoutSessions = useLiveQuery(() =>
    db.workoutSessions.orderBy('startTime').reverse().toArray()
  );

  const totalWorkouts = workoutSessions?.length || 0;
  const avgDuration = workoutSessions && workoutSessions.length > 0
    ? Math.round(workoutSessions.reduce((sum, w) => sum + (w.duration || 0), 0) / workoutSessions.length)
    : 0;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Histórico de Treinos</h1>
        <p className="text-muted-foreground">Acompanhe seu progresso</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{totalWorkouts}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{avgDuration}</p>
            <p className="text-xs text-muted-foreground">min/treino</p>
          </CardContent>
        </Card>
      </div>

      {/* Workout History */}
      {workoutSessions && workoutSessions.length > 0 ? (
        <div className="space-y-4">
          <h2 className="font-semibold">Treinos Realizados</h2>
          {workoutSessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{session.routineName}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(session.startTime), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  {session.duration && (
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      {session.duration}min
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Exercícios</span>
                  <span className="font-medium">{session.exercises.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Volume Total</span>
                  <span className="font-medium">{Math.round(session.totalVolume)} kg</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Séries</span>
                  <span className="font-medium">
                    {session.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0)}
                  </span>
                </div>

                {/* Exercises done */}
                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-medium mb-2">Exercícios realizados:</p>
                  <div className="space-y-1">
                    {session.exercises.map((ex, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">
                        • {ex.exerciseName} ({ex.sets.filter(s => s.completed).length} séries)
                      </div>
                    ))}
                  </div>
                </div>

                {session.notes && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm font-medium mb-1">Observações</p>
                    <p className="text-sm text-muted-foreground">{session.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhum treino realizado ainda
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Comece seu primeiro treino na página inicial!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
