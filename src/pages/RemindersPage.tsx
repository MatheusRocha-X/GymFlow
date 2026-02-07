import { useState, useEffect } from 'react';
import { Bell, Plus, Droplet, Trash2, Edit2, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { db, type Reminder } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HydrationOnboardingModal } from '@/components/HydrationOnboardingModal';
import { CreateReminderModal } from '@/components/CreateReminderModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RemindersPage() {
  const [showHydrationOnboarding, setShowHydrationOnboarding] = useState(false);
  const [showCreateReminder, setShowCreateReminder] = useState(false);
  const [allRemindersPaused, setAllRemindersPaused] = useState(false);
  const [todayWaterIntake, setTodayWaterIntake] = useState(0);

  const hydrationSettings = useLiveQuery(() => db.hydrationSettings.toArray().then(s => s[0]));
  const reminders = useLiveQuery(() => db.reminders.orderBy('time').toArray());
  
  useEffect(() => {
    // Check if hydration onboarding should be shown
    const checkOnboarding = async () => {
      const settings = await db.hydrationSettings.toArray();
      if (settings.length > 0 && !settings[0].onboardingCompleted) {
        setShowHydrationOnboarding(true);
      }
    };
    checkOnboarding();

    // Load today's water intake
    loadTodayWaterIntake();
  }, []);

  const loadTodayWaterIntake = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const logs = await db.hydrationLogs
      .where('date')
      .between(today, new Date())
      .toArray();
    
    const total = logs.reduce((sum, log) => sum + log.amount, 0);
    setTodayWaterIntake(total);
  };

  const handleDrinkWater = async () => {
    if (!hydrationSettings) return;

    await db.hydrationLogs.add({
      date: new Date(),
      time: new Date(),
      amount: hydrationSettings.glassSize
    });

    setTodayWaterIntake(prev => prev + hydrationSettings.glassSize);

    // Show notification confirmation
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('💧 Ótimo trabalho!', {
        body: `Você bebeu ${hydrationSettings.glassSize}ml. Continue assim!`,
        icon: '/icon-192x192.png'
      });
    }
  };

  const toggleAllReminders = () => {
    setAllRemindersPaused(!allRemindersPaused);
    // TODO: Implement actual pause logic
  };

  const deleteReminder = async (id: number) => {
    if (confirm('Deseja realmente excluir este lembrete?')) {
      await db.reminders.delete(id);
    }
  };

  const getWaterProgress = () => {
    if (!hydrationSettings) return 0;
    const goalMl = hydrationSettings.dailyGoalLiters * 1000;
    return Math.min((todayWaterIntake / goalMl) * 100, 100);
  };

  const getRemainingWater = () => {
    if (!hydrationSettings) return 0;
    const goalMl = hydrationSettings.dailyGoalLiters * 1000;
    const remaining = Math.max(goalMl - todayWaterIntake, 0);
    return (remaining / 1000).toFixed(1);
  };

  const getReminderTypeIcon = (type: string) => {
    switch (type) {
      case 'hydration':
        return <Droplet className="w-4 h-4 text-blue-500" />;
      case 'workout':
        return <span className="text-orange-500">💪</span>;
      case 'supplement':
        return <span className="text-green-500">💊</span>;
      case 'stretching':
        return <span className="text-purple-500">🧘</span>;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case 'hydration':
        return 'Hidratação';
      case 'workout':
        return 'Treino';
      case 'supplement':
        return 'Suplemento';
      case 'stretching':
        return 'Alongamento';
      default:
        return 'Personalizado';
    }
  };

  const getReminderDefaultMessage = (type: string) => {
    switch (type) {
      case 'hydration':
        return hydrationSettings 
          ? `Beba ${hydrationSettings.glassSize}ml de água agora!` 
          : 'Hora de se hidratar!';
      case 'workout':
        return 'Não esqueça do seu treino de hoje';
      case 'supplement':
        return 'Hora de tomar seu suplemento';
      case 'stretching':
        return 'Faça alguns minutos de alongamento';
      default:
        return '';
    }
  };

  const getReminderRecurrence = (reminder: Reminder) => {
    if (!reminder.recurrence || reminder.recurrence === 'none') return 'Único';
    if (reminder.recurrence === 'daily') return 'Diário';
    if (reminder.recurrence === 'weekly') return 'Semanal';
    if (reminder.recurrence === 'monthly') return 'Mensal';
    return '';
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lembretes</h1>
          <p className="text-muted-foreground">Hidratação e lembretes personalizados</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAllReminders}
          className="gap-2"
        >
          {allRemindersPaused ? (
            <>
              <ToggleLeft className="w-4 h-4" />
              Pausado
            </>
          ) : (
            <>
              <ToggleRight className="w-4 h-4" />
              Ativo
            </>
          )}
        </Button>
      </div>

      {/* Hydration Progress Card */}
      {hydrationSettings?.enabled && (
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-blue-500" />
              Hidratação Hoje
            </CardTitle>
            <CardDescription>
              Meta: {hydrationSettings.dailyGoalLiters.toFixed(1)}L
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{(todayWaterIntake / 1000).toFixed(1)}L</span>
                <span className="text-muted-foreground">
                  Faltam {getRemainingWater()}L
                </span>
                <span className="font-semibold">{getWaterProgress().toFixed(0)}%</span>
              </div>
              <div className="h-4 bg-background/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 rounded-full"
                  style={{ width: `${getWaterProgress()}%` }}
                />
              </div>
            </div>

            {/* Visual Cup Display */}
            <div className="flex items-center justify-center py-4">
              <div className="relative w-24 h-32 border-4 border-blue-500 rounded-b-3xl rounded-t-lg overflow-hidden">
                <div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-cyan-400 transition-all duration-500"
                  style={{ height: `${getWaterProgress()}%` }}
                />
              </div>
            </div>

            {/* Drink Button */}
            <Button
              onClick={handleDrinkWater}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              size="lg"
            >
              <Droplet className="w-5 h-5 mr-2" />
              Bebi {hydrationSettings.glassSize}ml!
            </Button>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-sm pt-2 border-t">
              <div>
                <p className="text-muted-foreground">Copo</p>
                <p className="font-semibold">{hydrationSettings.glassSize}ml</p>
              </div>
              <div>
                <p className="text-muted-foreground">Intervalo</p>
                <p className="font-semibold">{hydrationSettings.reminderInterval}min</p>
              </div>
              <div>
                <p className="text-muted-foreground">Horário</p>
                <p className="font-semibold">
                  {hydrationSettings.startHour}h-{hydrationSettings.endHour}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Reminder Button */}
      <Button
        onClick={() => {
          console.log('Botão clicado - abrindo modal de criar lembrete');
          setShowCreateReminder(true);
        }}
        className="w-full"
        size="lg"
      >
        <Plus className="w-5 h-5 mr-2" />
        Adicionar Lembrete
      </Button>

      {/* Active Reminders */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Lembretes Ativos</h2>
        {reminders && reminders.length > 0 ? (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <Card key={reminder.id} className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getReminderTypeIcon(reminder.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{reminder.title}</h3>
                          <span className="text-xs px-2 py-0.5 bg-accent rounded-full text-muted-foreground">
                            {getReminderTypeLabel(reminder.type)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {reminder.message || getReminderDefaultMessage(reminder.type)}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(reminder.time, 'HH:mm', { locale: ptBR })}
                          </div>
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            {getReminderRecurrence(reminder)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement edit
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => reminder.id && deleteReminder(reminder.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum lembrete ativo</p>
              <p className="text-sm mt-2">
                Toque no botão acima para criar seu primeiro lembrete
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      {hydrationSettings?.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estatísticas de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <p className="text-2xl font-bold text-blue-500">
                  {Math.floor(todayWaterIntake / hydrationSettings.glassSize)}
                </p>
                <p className="text-sm text-muted-foreground">Copos bebidos</p>
              </div>
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <p className="text-2xl font-bold text-green-500">
                  {(todayWaterIntake / 1000).toFixed(1)}L
                </p>
                <p className="text-sm text-muted-foreground">Total hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showHydrationOnboarding && (
        <HydrationOnboardingModal
          onClose={() => setShowHydrationOnboarding(false)}
          onComplete={() => {
            setShowHydrationOnboarding(false);
            window.location.reload(); // Reload to show hydration card
          }}
        />
      )}

      {showCreateReminder && (
        <CreateReminderModal
          onClose={() => {
            console.log('Modal fechado');
            setShowCreateReminder(false);
          }}
          onComplete={() => {
            console.log('Lembrete criado - fechando modal');
            setShowCreateReminder(false);
          }}
        />
      )}
    </div>
  );
}
