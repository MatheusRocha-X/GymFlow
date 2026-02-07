import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Play, Edit, Trash2 } from 'lucide-react';
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
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Minhas Rotinas</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Rotina
        </Button>
      </div>

      {/* Routines List */}
      {routines && routines.length > 0 ? (
        <div className="space-y-4">
          {routines.map((routine) => (
            <Card key={routine.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{routine.name}</CardTitle>
                    {routine.description && (
                      <p className="text-sm text-muted-foreground">{routine.description}</p>
                    )}
                  </div>
                  {routine.isActive === 1 && (
                    <Badge className="ml-2">Ativa</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Days */}
                <div className="space-y-2">
                  {routine.days.map((day) => (
                    <div key={day.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{day.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {day.exercises.length} exercícios
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleStartWorkout(routine.id!)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Iniciar
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleToggleActive(routine.id!, routine.isActive)}
                  >
                    {routine.isActive === 1 ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditRoutine(routine.id!)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRoutine(routine.id!)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Você ainda não tem nenhuma rotina de treino
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Rotina
            </Button>
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
