import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { X, Plus, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db, type Exercise, type WorkoutDay, type RoutineExercise } from '@/lib/db';
import { getMuscleColor } from '@/lib/utils';

interface Props {
  onClose: () => void;
  onComplete?: () => void;
  routineId?: number; // Se fornecido, edita a rotina existente
}

export default function CreateRoutineModal({ onClose, onComplete, routineId }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState<WorkoutDay[]>([
    {
      id: '1',
      name: 'Treino A',
      exercises: [],
      dayOfWeek: []
    }
  ]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');

  const exercises = useLiveQuery(() => db.exercises.orderBy('name').toArray());

  // Carregar rotina existente se estiver editando
  useEffect(() => {
    if (routineId) {
      db.workoutRoutines.get(routineId).then(routine => {
        if (routine) {
          setName(routine.name);
          setDescription(routine.description || '');
          setDays(routine.days);
        }
      });
    }
  }, [routineId]);

  const filteredExercises = exercises?.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = muscleFilter === 'all' || ex.primaryMuscle === muscleFilter;
    const matchesType = typeFilter === 'all' || ex.type === typeFilter;
    const matchesEquipment = equipmentFilter === 'all' || ex.equipment === equipmentFilter;
    
    return matchesSearch && matchesMuscle && matchesType && matchesEquipment;
  }).sort((a, b) => {
    // Ordenar por músculo primeiro, depois por nome
    const muscleCompare = a.primaryMuscle.localeCompare(b.primaryMuscle);
    if (muscleCompare !== 0) return muscleCompare;
    return a.name.localeCompare(b.name);
  });

  // Listas únicas para filtros
  const muscleGroups = Array.from(new Set(exercises?.map(ex => ex.primaryMuscle) || [])).sort();
  const equipmentTypes = Array.from(new Set(exercises?.map(ex => ex.equipment) || [])).sort();

  const handleAddDay = () => {
    setDays([
      ...days,
      {
        id: String(days.length + 1),
        name: `Treino ${String.fromCharCode(65 + days.length)}`,
        exercises: [],
        dayOfWeek: []
      }
    ]);
  };

  const handleRemoveDay = (index: number) => {
    if (days.length > 1) {
      setDays(days.filter((_, i) => i !== index));
      if (currentDayIndex >= days.length - 1) {
        setCurrentDayIndex(Math.max(0, days.length - 2));
      }
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    setMuscleFilter('all');
    setTypeFilter('all');
    setEquipmentFilter('all');
    const newExercise: RoutineExercise = {
      exerciseId: exercise.id!,
      sets: 3,
      repsMin: 8,
      repsMax: 12,
      restSeconds: exercise.type === 'compound' ? 90 : 60,
      order: days[currentDayIndex].exercises.length
    };

    const updatedDays = [...days];
    updatedDays[currentDayIndex].exercises.push(newExercise);
    setDays(updatedDays);
    setShowExercisePicker(false);
    setSearchQuery('');
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    const updatedDays = [...days];
    updatedDays[currentDayIndex].exercises = updatedDays[currentDayIndex].exercises.filter(
      (_, i) => i !== exerciseIndex
    );
    setDays(updatedDays);
  };

  const handleUpdateExercise = (exerciseIndex: number, field: keyof RoutineExercise, value: any) => {
    const updatedDays = [...days];
    updatedDays[currentDayIndex].exercises[exerciseIndex] = {
      ...updatedDays[currentDayIndex].exercises[exerciseIndex],
      [field]: value
    };
    setDays(updatedDays);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Digite um nome para a rotina');
      return;
    }

    if (days.every(d => d.exercises.length === 0)) {
      alert('Adicione pelo menos um exercício');
      return;
    }

    if (routineId) {
      // Atualizar rotina existente
      await db.workoutRoutines.update(routineId, {
        name: name.trim(),
        description: description.trim(),
        days,
        updatedAt: new Date()
      });
    } else {
      // Criar nova rotina
      await db.workoutRoutines.add({
        name: name.trim(),
        description: description.trim(),
        days,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: 1
      });
    }

    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-card w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-xl font-bold">
            {step === 1 ? (routineId ? 'Editar Rotina' : 'Nova Rotina') : 'Adicionar Exercícios'}
          </h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20 sm:pb-0">
          {step === 1 ? (
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nome da Rotina *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: PPL, Full Body, ABC..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Descrição (opcional)</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o objetivo desta rotina..."
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Dias de Treino</label>
                  <Button size="sm" variant="outline" onClick={handleAddDay}>
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Dia
                  </Button>
                </div>

                <div className="space-y-2">
                  {days.map((day, index) => (
                    <div key={day.id} className="flex items-center gap-2">
                      <Input
                        value={day.name}
                        onChange={(e) => {
                          const updatedDays = [...days];
                          updatedDays[index].name = e.target.value;
                          setDays(updatedDays);
                        }}
                        placeholder={`Nome do treino ${index + 1}`}
                      />
                      {days.length > 1 && (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleRemoveDay(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Day Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {days.map((day, index) => (
                  <Button
                    key={day.id}
                    size="sm"
                    variant={currentDayIndex === index ? 'default' : 'outline'}
                    onClick={() => setCurrentDayIndex(index)}
                    className="whitespace-nowrap"
                  >
                    {day.name} ({day.exercises.length})
                  </Button>
                ))}
              </div>

              {/* Exercise List */}
              <div className="space-y-3">
                {days[currentDayIndex].exercises.map((routineEx, index) => {
                  const exercise = exercises?.find(ex => ex.id === routineEx.exerciseId);
                  if (!exercise) return null;

                  return (
                    <Card key={index}>
                      <CardContent className="p-3 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{exercise.name}</p>
                            <Badge className={`${getMuscleColor(exercise.primaryMuscle)} mt-1`}>
                              {exercise.primaryMuscle}
                            </Badge>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveExercise(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground">Séries</label>
                            <Input
                              type="number"
                              value={routineEx.sets || ''}
                              onChange={(e) => handleUpdateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Reps</label>
                            <div className="flex gap-1">
                              <Input
                                type="number"
                                value={routineEx.repsMin || ''}
                                onChange={(e) => handleUpdateExercise(index, 'repsMin', parseInt(e.target.value) || 0)}
                                className="h-8 w-12"
                              />
                              <span className="text-xs self-center">-</span>
                              <Input
                                type="number"
                                value={routineEx.repsMax || ''}
                                onChange={(e) => handleUpdateExercise(index, 'repsMax', parseInt(e.target.value) || 0)}
                                className="h-8 w-12"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Descanso (s)</label>
                            <Input
                              type="number"
                              value={routineEx.restSeconds || ''}
                              onChange={(e) => handleUpdateExercise(index, 'restSeconds', parseInt(e.target.value) || 60)}
                              className="h-8"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowExercisePicker(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Exercício
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="fixed sm:static bottom-0 left-0 right-0 p-4 border-t border-border bg-card flex gap-3 flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] sm:shadow-none z-10">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={onClose} className="flex-1 h-12 sm:h-10">
                Cancelar
              </Button>
              <Button 
                onClick={() => setStep(2)} 
                className="flex-1 h-12 sm:h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold" 
                disabled={!name.trim()}
              >
                Próximo
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 sm:h-10">
                Voltar
              </Button>
              <Button 
                onClick={handleSave} 
                className="flex-1 h-12 sm:h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                Salvar Rotina
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center"
          onClick={() => setShowExercisePicker(false)}
        >
          <div
            className="bg-card w-full h-[80vh] sm:max-w-lg sm:rounded-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base">Selecionar Exercício</h3>
                <Button size="icon" variant="ghost" onClick={() => setShowExercisePicker(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar exercício..."
                  className="pl-9 h-9"
                />
              </div>

              {/* Filters */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  <select
                    value={muscleFilter}
                    onChange={(e) => setMuscleFilter(e.target.value)}
                    className="flex-1 min-w-[100px] h-8 text-xs rounded-md border border-input bg-background px-2 py-1"
                  >
                    <option value="all">Todos os músculos</option>
                    {muscleGroups.map(muscle => (
                      <option key={muscle} value={muscle}>{muscle}</option>
                    ))}
                  </select>
                  
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="flex-1 min-w-[100px] h-8 text-xs rounded-md border border-input bg-background px-2 py-1"
                  >
                    <option value="all">Todos os tipos</option>
                    <option value="compound">Compostos</option>
                    <option value="isolation">Isolamento</option>
                  </select>
                </div>

                <select
                  value={equipmentFilter}
                  onChange={(e) => setEquipmentFilter(e.target.value)}
                  className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 py-1"
                >
                  <option value="all">Todos os equipamentos</option>
                  {equipmentTypes.map(equipment => (
                    <option key={equipment} value={equipment}>{equipment}</option>
                  ))}
                </select>
                
                {(muscleFilter !== 'all' || typeFilter !== 'all' || equipmentFilter !== 'all') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setMuscleFilter('all');
                      setTypeFilter('all');
                      setEquipmentFilter('all');
                    }}
                    className="w-full h-7 text-xs"
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredExercises && filteredExercises.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum exercício encontrado
                </div>
              )}
              
              {filteredExercises?.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => handleAddExercise(exercise)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <p className="font-medium text-sm">{exercise.name}</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <Badge className={getMuscleColor(exercise.primaryMuscle)} style={{ fontSize: '9px', padding: '2px 6px' }}>
                      {exercise.primaryMuscle}
                    </Badge>
                    <Badge variant="outline" style={{ fontSize: '9px', padding: '2px 6px' }}>
                      {exercise.type === 'compound' ? 'Composto' : 'Isolamento'}
                    </Badge>
                    <Badge variant="secondary" style={{ fontSize: '9px', padding: '2px 6px' }}>
                      {exercise.equipment}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
