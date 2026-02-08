import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Play, Edit, Trash2, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';
import { useActiveWorkout } from '@/lib/stores/workout-store';
import { useNavigation } from '@/lib/stores/app-store';
import CreateRoutineModal from '@/components/CreateRoutineModal';

export default function WorkoutsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<number | undefined>();
  const { startWorkout } = useActiveWorkout();
  const { setView } = useNavigation();

  const routines = useLiveQuery(() => 
    db.workoutRoutines.orderBy('createdAt').reverse().toArray()
  );

  const handleStartWorkout = async (routineId: number) => {
    const routine = await db.workoutRoutines.get(routineId);
    if (!routine || routine.days.length === 0) return;

    // For simplicity, start first day
    const firstDay = routine.days[0];
    const exercises = await Promise.all(
      firstDay.exercises.map(async (ex) => {
        const exercise = await db.exercises.get(ex.exerciseId);
        return {
          exerciseId: ex.exerciseId,
          exerciseName: exercise?.name || 'Exercício',
          sets: ex.sets,
          restSeconds: ex.restSeconds
        };
      })
    );

    startWorkout(routineId, `${routine.name} - ${firstDay.name}`, exercises);
    setView('home');
  };

  const handleDeleteRoutine = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta rotina?')) {
      await db.workoutRoutines.delete(id);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: number) => {
    await db.workoutRoutines.update(id, { isActive: currentStatus === 1 ? 0 : 1 });
  };

  const handleEditRoutine = (id: number) => {
    setEditingRoutineId(id);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingRoutineId(undefined);
  };

  return (
    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">Minhas Rotinas</h1>
        <Button onClick={() => setShowCreateModal(true)} size="sm" className="h-8 text-xs sm:text-sm">
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Nova Rotina
        </Button>
      </div>

      {/* Routines List */}
      {routines && routines.length > 0 ? (
        <div className="space-y-2 sm:space-y-3">
          {routines.map((routine) => (
            <Card key={routine.id} className="border-border/50">
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg mb-1 truncate">{routine.name}</CardTitle>
                    {routine.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{routine.description}</p>
                    )}
                  </div>
                  {routine.isActive === 1 && (
                    <Badge className="ml-2 flex-shrink-0 text-[10px] sm:text-xs px-2 py-0.5">Ativa</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 pt-0">
                {/* Days */}
                <div className="space-y-1.5 sm:space-y-2">
                  {routine.days.map((day) => (
                    <div key={day.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{day.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {day.exercises.length} exercícios
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleStartWorkout(routine.id!)}
                        className="h-7 sm:h-8 text-xs px-2 sm:px-3 flex-shrink-0"
                      >
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Iniciar
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 sm:gap-2 pt-1 sm:pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 sm:h-8 text-xs"
                    onClick={() => handleToggleActive(routine.id!, routine.isActive)}
                  >
                    {routine.isActive === 1 ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 sm:h-8 px-2 sm:px-3"
                    onClick={() => handleEditRoutine(routine.id!)}
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 sm:h-8 px-2 sm:px-3"
                    onClick={() => handleDeleteRoutine(routine.id!)}
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="text-center py-8 sm:py-12">
            <Dumbbell className="w-12 h-12 sm:w-14 sm:h-14 text-muted-foreground mb-3 sm:mb-4 mx-auto" />
            <p className="text-base sm:text-lg text-muted-foreground mb-1 sm:mb-2">
              Nenhuma rotina criada ainda
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Use o botão "Nova Rotina" acima para começar
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Routine Modal */}
      {showCreateModal && (
        <CreateRoutineModal 
          onClose={handleCloseModal}
          onComplete={() => {
            handleCloseModal();
            setView('home');
          }}
          routineId={editingRoutineId}
        />
      )}
    </div>
  );
}
