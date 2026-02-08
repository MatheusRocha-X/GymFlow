import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db, type Exercise } from '@/lib/db';
import { getMuscleColor } from '@/lib/utils';

const muscleGroups = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Core'];
const exerciseTypes = ['Todos', 'Composto', 'Isolado'];

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const exercises = useLiveQuery(() => db.exercises.orderBy('name').toArray());

  const filteredExercises = exercises?.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'Todos' || ex.primaryMuscle === selectedMuscle;
    const matchesType = selectedType === 'Todos' || 
      (selectedType === 'Composto' && ex.type === 'compound') ||
      (selectedType === 'Isolado' && ex.type === 'isolation');
    
    return matchesSearch && matchesMuscle && matchesType;
  }).sort((a, b) => {
    // Ordenar por músculo primeiro, depois por nome
    const muscleCompare = a.primaryMuscle.localeCompare(b.primaryMuscle);
    if (muscleCompare !== 0) return muscleCompare;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Biblioteca de Exercícios</h1>
            <Button size="icon" variant="ghost">
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar exercício..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 space-y-2">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {muscleGroups.map(muscle => (
              <Button
                key={muscle}
                size="sm"
                variant={selectedMuscle === muscle ? 'default' : 'outline'}
                onClick={() => setSelectedMuscle(muscle)}
                className="whitespace-nowrap"
              >
                {muscle}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            {exerciseTypes.map(type => (
              <Button
                key={type}
                size="sm"
                variant={selectedType === type ? 'default' : 'outline'}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground">
          {filteredExercises?.length || 0} exercícios encontrados
        </p>

        {filteredExercises?.map(exercise => (
          <Card
            key={exercise.id}
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setSelectedExercise(exercise)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{exercise.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={getMuscleColor(exercise.primaryMuscle)}>
                      {exercise.primaryMuscle}
                    </Badge>
                    <Badge variant="outline">
                      {exercise.type === 'compound' ? 'Composto' : 'Isolado'}
                    </Badge>
                    <Badge variant="secondary">
                      {exercise.equipment}
                    </Badge>
                  </div>
                  {exercise.secondaryMuscles.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Secundários: {exercise.secondaryMuscles.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelectedExercise(null)}
        >
          <div 
            className="bg-card rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{selectedExercise.name}</h2>
              <Button size="icon" variant="ghost" onClick={() => setSelectedExercise(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={getMuscleColor(selectedExercise.primaryMuscle)}>
                  {selectedExercise.primaryMuscle}
                </Badge>
                <Badge variant="outline">
                  {selectedExercise.type === 'compound' ? 'Composto' : 'Isolado'}
                </Badge>
                <Badge variant="secondary">
                  {selectedExercise.equipment}
                </Badge>
              </div>

              {selectedExercise.secondaryMuscles.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Músculos Secundários</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.secondaryMuscles.map(muscle => (
                      <Badge key={muscle} variant="outline">{muscle}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Instruções</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  {selectedExercise.instructions.map((instruction, i) => (
                    <li key={i}>{instruction}</li>
                  ))}
                </ol>
              </div>

              {selectedExercise.tips.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Dicas</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {selectedExercise.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
