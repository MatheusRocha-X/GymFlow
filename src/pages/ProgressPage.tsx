import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, TrendingUp, Weight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function ProgressPage() {
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const bodyMeasurements = useLiveQuery(() =>
    db.bodyMeasurements.orderBy('date').reverse().limit(30).toArray()
  );

  const now = new Date();
  const periodStart = selectedPeriod === 'month' ? subMonths(now, 1) :
                      selectedPeriod === 'quarter' ? subMonths(now, 3) :
                      subMonths(now, 12);

  const workoutSessions = useLiveQuery(() =>
    db.workoutSessions
      .where('startTime')
      .between(periodStart, now, true, true)
      .toArray()
  );

  // Calculate volume by muscle group
  const volumeByMuscle = useMemo(() => {
    if (!workoutSessions) return [];

    const muscleVolume: Record<string, number> = {};

    workoutSessions.forEach(session => {
      session.exercises.forEach(async (ex) => {
        const exercise = await db.exercises.get(ex.exerciseId);
        if (!exercise) return;

        const volume = ex.sets
          .filter(s => s.completed)
          .reduce((sum, set) => sum + (set.reps * set.weight), 0);

        muscleVolume[exercise.primaryMuscle] = (muscleVolume[exercise.primaryMuscle] || 0) + volume;
      });
    });

    return Object.entries(muscleVolume).map(([muscle, volume]) => ({
      muscle,
      volume: Math.round(volume)
    })).sort((a, b) => b.volume - a.volume);
  }, [workoutSessions]);

  // Weight progress chart data
  const weightData = useMemo(() => {
    if (!bodyMeasurements) return [];
    return bodyMeasurements
      .filter(m => m.weight)
      .reverse()
      .map(m => ({
        date: format(new Date(m.date), 'dd/MM'),
        weight: m.weight
      }));
  }, [bodyMeasurements]);

  const latestMeasurement = bodyMeasurements?.[0];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Progresso</h1>
          <p className="text-muted-foreground">Acompanhe sua evolução</p>
        </div>
        <Button size="icon" onClick={() => setShowAddMeasurement(true)}>
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Latest Stats */}
      {latestMeasurement && (
        <div className="grid grid-cols-2 gap-4">
          {latestMeasurement.weight && (
            <Card>
              <CardContent className="p-4 text-center">
                <Weight className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{latestMeasurement.weight}</p>
                <p className="text-xs text-muted-foreground">kg</p>
              </CardContent>
            </Card>
          )}
          {latestMeasurement.bodyFat && (
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{latestMeasurement.bodyFat}</p>
                <p className="text-xs text-muted-foreground">% gordura</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Weight Progress Chart */}
      {weightData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evolução do Peso</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Volume by Muscle Group */}
      {volumeByMuscle.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Volume por Grupo Muscular</CardTitle>
              <div className="flex gap-2">
                {(['month', 'quarter', 'year'] as const).map(period => (
                  <Button
                    key={period}
                    size="sm"
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period === 'month' ? '1M' : period === 'quarter' ? '3M' : '1A'}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeByMuscle}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="muscle" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="volume" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 1RM Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calculadora de 1RM</CardTitle>
        </CardHeader>
        <CardContent>
          <OneRMCalculator />
        </CardContent>
      </Card>

      {/* Body Measurements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Medidas Corporais</CardTitle>
        </CardHeader>
        <CardContent>
          {bodyMeasurements && bodyMeasurements.length > 0 ? (
            <div className="space-y-3">
              {bodyMeasurements.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">
                      {format(new Date(m.date), "dd 'de' MMM yyyy", { locale: ptBR })}
                    </p>
                    {m.weight && (
                      <p className="text-sm text-muted-foreground">Peso: {m.weight}kg</p>
                    )}
                  </div>
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma medição registrada
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add Measurement Modal */}
      {showAddMeasurement && (
        <AddMeasurementModal onClose={() => setShowAddMeasurement(false)} />
      )}
    </div>
  );
}

function OneRMCalculator() {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [oneRM, setOneRM] = useState<number | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (w > 0 && r > 0) {
      // Epley formula
      const result = r === 1 ? w : w * (1 + r / 30);
      setOneRM(Math.round(result));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Peso (kg)</label>
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="100"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Repetições</label>
          <Input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="8"
          />
        </div>
      </div>
      <Button onClick={calculate} className="w-full">
        Calcular 1RM
      </Button>
      {oneRM !== null && (
        <div className="text-center p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Seu 1RM estimado:</p>
          <p className="text-3xl font-bold text-primary">{oneRM} kg</p>
        </div>
      )}
    </div>
  );
}

function AddMeasurementModal({ onClose }: { onClose: () => void }) {
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');

  const handleSave = async () => {
    await db.bodyMeasurements.add({
      date: new Date(),
      weight: weight ? parseFloat(weight) : undefined,
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-t-2xl sm:rounded-2xl max-w-md w-full animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold">Nova Medição</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Peso (kg)</label>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="75.5"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">% Gordura (opcional)</label>
            <Input
              type="number"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="15.5"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={!weight}>
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
