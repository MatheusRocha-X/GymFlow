import { useState, useEffect } from 'react';
import { Bell, Plus, Droplet, Trash2, Edit2, Clock, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import { db, type Reminder } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { telegramService } from '@/lib/telegram';
import { apiService } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HydrationOnboardingModal } from '@/components/HydrationOnboardingModal';
import { CreateReminderModal } from '@/components/CreateReminderModal';
import { TelegramConfigModal } from '@/components/TelegramConfigModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RemindersPage() {
  const [showHydrationOnboarding, setShowHydrationOnboarding] = useState(false);
  const [showCreateReminder, setShowCreateReminder] = useState(false);
  const [showTelegramConfig, setShowTelegramConfig] = useState(false);
  const [allRemindersPaused, setAllRemindersPaused] = useState(false);
  const [todayWaterIntake, setTodayWaterIntake] = useState(0);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const hydrationSettings = useLiveQuery(() => db.hydrationSettings.toArray().then(s => s[0]));
  const reminders = useLiveQuery(() => db.reminders.orderBy('time').toArray());
  
  useEffect(() => {
    const checkPriorities = async () => {
      // PRIORITY 1: Check if Telegram is configured
      const telegramSettings = await db.telegramSettings.toArray();
      if (telegramSettings.length === 0 || !telegramSettings[0].enabled) {
        setShowTelegramConfig(true);
        return; // Stop here, don't check hydration yet
      }

      // PRIORITY 2: Check if hydration onboarding should be shown (only if Telegram is OK)
      const hydrationSettings = await db.hydrationSettings.toArray();
      if (hydrationSettings.length > 0 && !hydrationSettings[0].onboardingCompleted) {
        setShowHydrationOnboarding(true);
      }
    };

    checkPriorities();
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
      // Get reminder info before deleting
      const reminder = await db.reminders.get(id);
      
      // Delete from database (local + backend)
      try {
        await apiService.deleteReminder(id);
      } catch (error: any) {
        console.error('Erro ao deletar lembrete:', error);
        alert(error.message || 'Erro ao deletar lembrete. Verifique se o backend está configurado.');
        return;
      }
      
      // Send Telegram confirmation
      if (reminder) {
        try {
          const emojiMap: Record<string, string> = {
            'hydration': '💧',
            'workout': '🏋️',
            'supplement': '💊',
            'stretching': '🧘',
            'custom': '⏰'
          };
          const emoji = emojiMap[reminder.type] || '⏰';
          
          await telegramService.sendReminder(
            '🗑️ Lembrete Apagado',
            `"${reminder.title}" foi removido com sucesso.`,
            emoji
          );
        } catch (error) {
          console.error('Erro ao enviar confirmação de exclusão via Telegram:', error);
        }
      }
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
    <div className="p-2 sm:p-3 space-y-2 sm:space-y-3 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold truncate">Lembretes</h1>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Hidratação e alertas</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAllReminders}
          className="gap-1.5 flex-shrink-0 h-7 sm:h-8 text-[10px] sm:text-xs button-press"
        >
          {allRemindersPaused ? (
            <>
              <ToggleLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Pausado</span>
            </>
          ) : (
            <>
              <ToggleRight className="w-4 h-4" />
              <span className="hidden sm:inline">Ativo</span>
            </>
          )}
        </Button>
      </div>

      {/* Important Notice */}
      {reminders && reminders.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 sm:p-3 animate-slide-up">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              <strong className="text-blue-500">Dica:</strong> Mantenha o app aberto (pode estar minimizado) para receber os lembretes no Telegram.
            </p>
          </div>
        </div>
      )}

      {/* Hydration Progress Card */}
      {hydrationSettings?.enabled && (
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 card-hover animate-scale-in">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Droplet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
              <span>Hidratação Hoje</span>
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">
              Meta: {hydrationSettings.dailyGoalLiters.toFixed(1)}L
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] sm:text-xs gap-2">
                <span>{(todayWaterIntake / 1000).toFixed(1)}L</span>
                <span className="text-muted-foreground truncate">
                  Faltam {getRemainingWater()}L
                </span>
                <span className="font-semibold">{getWaterProgress().toFixed(0)}%</span>
              </div>
              <div className="h-2 sm:h-3 bg-background/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${getWaterProgress()}%` }}
                />
              </div>
            </div>

            {/* Visual Cup Display */}
            <div className="flex items-center justify-center py-2 sm:py-3">
              <div className="relative w-16 h-24 sm:w-20 sm:h-28 border-4 border-blue-500 rounded-b-3xl rounded-t-lg overflow-hidden">
                <div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-cyan-400 transition-all duration-700 ease-out"
                  style={{ height: `${getWaterProgress()}%` }}
                />
              </div>
            </div>

            {/* Drink Button */}
            <Button
              onClick={handleDrinkWater}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white button-press h-10 sm:h-11"
            >
              <Droplet className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Bebi {hydrationSettings.glassSize}ml!
            </Button>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] sm:text-xs pt-2 border-t">
              <div>
                <p className="text-muted-foreground text-[9px] sm:text-[10px]">Copo</p>
                <p className="font-semibold">{hydrationSettings.glassSize}ml</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[9px] sm:text-[10px]">Intervalo</p>
                <p className="font-semibold">{hydrationSettings.reminderInterval}min</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[9px] sm:text-[10px]">Horário</p>
                <p className="font-semibold text-[9px] sm:text-[10px]">
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
        className="w-full button-press h-10 sm:h-11"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
        Adicionar Lembrete
      </Button>

      {/* Active Reminders */}
      <div className="space-y-2 sm:space-y-3">
        <h2 className="text-base sm:text-lg font-semibold">Lembretes Ativos</h2>
        {reminders && reminders.length > 0 ? (
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <Card key={reminder.id} className="hover:bg-accent/50 transition-all duration-200 card-hover">
                <CardContent className="p-2.5 sm:p-3">
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="flex items-start gap-1.5 sm:gap-2 flex-1 min-w-0">
                      <div className="mt-0.5 flex-shrink-0">
                        {getReminderTypeIcon(reminder.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <h3 className="font-semibold text-xs sm:text-sm truncate">{reminder.title}</h3>
                          <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-accent rounded-full text-muted-foreground flex-shrink-0">
                            {getReminderTypeLabel(reminder.type)}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                          {reminder.message || getReminderDefaultMessage(reminder.type)}
                        </p>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-1 text-[9px] sm:text-[10px] text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            {format(reminder.time, 'HH:mm', { locale: ptBR })}
                          </div>
                          <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full flex-shrink-0">
                            {getReminderRecurrence(reminder)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 button-press"
                        onClick={() => {
                          setEditingReminder(reminder);
                          setShowCreateReminder(true);
                        }}
                      >
                        <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive button-press"
                        onClick={() => reminder.id && deleteReminder(reminder.id)}
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="animate-scale-in">
            <CardContent className="p-4 sm:p-6 text-center text-muted-foreground">
              <Bell className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 opacity-50" />
              <p className="text-xs sm:text-sm">Nenhum lembrete ativo</p>
              <p className="text-[10px] sm:text-xs mt-1.5">
                Toque no botão acima para criar seu primeiro lembrete
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      {hydrationSettings?.enabled && (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Estatísticas de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-accent/50 rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-blue-500">
                  {Math.floor(todayWaterIntake / hydrationSettings.glassSize)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Copos bebidos</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-accent/50 rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-green-500">
                  {(todayWaterIntake / 1000).toFixed(1)}L
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showTelegramConfig && (
        <TelegramConfigModal
          onClose={() => setShowTelegramConfig(false)}
          onComplete={async () => {
            setShowTelegramConfig(false);
            
            // After configuring Telegram, check if hydration onboarding should be shown
            const hydrationSettings = await db.hydrationSettings.toArray();
            if (hydrationSettings.length > 0 && !hydrationSettings[0].onboardingCompleted) {
              setShowHydrationOnboarding(true);
            }
          }}
        />
      )}

      {showHydrationOnboarding && (
        <HydrationOnboardingModal
          onClose={() => {
            console.log('Fechando modal de hidratação');
            setShowHydrationOnboarding(false);
          }}
          onComplete={() => {
            console.log('Onboarding de hidratação concluído');
            setShowHydrationOnboarding(false);
            window.location.reload(); // Reload to show hydration card
          }}
        />
      )}

      {showCreateReminder && (
        <CreateReminderModal
          editReminder={editingReminder || undefined}
          onClose={() => {
            console.log('Modal fechado');
            setShowCreateReminder(false);
            setEditingReminder(null);
          }}
          onComplete={() => {
            console.log('Lembrete criado/editado - fechando modal');
            setShowCreateReminder(false);
            setEditingReminder(null);
          }}
        />
      )}
    </div>
  );
}
