import { useState } from 'react';
import { Droplet, X, Bell } from 'lucide-react';
import { db } from '@/lib/db';
import { telegramService } from '@/lib/telegram';
import { apiService } from '@/lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface HydrationOnboardingModalProps {
  onClose: () => void;
  onComplete: () => void;
}

export function HydrationOnboardingModal({ onClose, onComplete }: HydrationOnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [dailyGoal, setDailyGoal] = useState('3.0');
  const [glassSize, setGlassSize] = useState(300);
  const [reminderInterval, setReminderInterval] = useState(60);
  const [startHour, setStartHour] = useState(7);
  const [endHour, setEndHour] = useState(22);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Este navegador não suporta notificações');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  const handleActivate = async () => {
    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
      alert('Precisamos de permissão para enviar notificações de hidratação.');
      return;
    }

    // Update hydration settings
    const settings = await db.hydrationSettings.toArray();
    if (settings.length > 0) {
      await db.hydrationSettings.update(settings[0].id!, {
        enabled: true,
        dailyGoalLiters: parseFloat(dailyGoal),
        glassSize: glassSize,
        reminderInterval: reminderInterval,
        startHour: startHour,
        endHour: endHour,
        onboardingCompleted: true
      });
    } else {
      await db.hydrationSettings.add({
        enabled: true,
        dailyGoalLiters: parseFloat(dailyGoal),
        glassSize: glassSize,
        reminderInterval: reminderInterval,
        startHour: startHour,
        endHour: endHour,
        onboardingCompleted: true
      });
    }

    // Create hydration reminders
    await createHydrationReminders();

    // Show success notification
    new Notification('💧 Lembretes de hidratação ativados!', {
      body: `Você receberá lembretes a cada ${reminderInterval} minutos para beber água.`,
      icon: '/icon-192x192.png'
    });

    onComplete();
  };

  const createHydrationReminders = async () => {
    // Create recurring hydration reminder starting at user's preferred time
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(startHour, 0, 0, 0); // Use user's start hour
    
    // If the start hour already passed today, set for tomorrow
    if (reminderTime < now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    let id: number;
    try {
      id = await apiService.saveReminder({
        type: 'hydration',
        title: 'Hora de hidratar!',
        message: `Beba 1 copo (${glassSize}ml) de água agora.`,
        time: reminderTime,
        recurrence: 'daily',
        enabled: true,
        createdAt: now,
        nextTrigger: reminderTime
      }) as number;
    } catch (error: any) {
      console.error('Erro ao criar lembrete de hidratação:', error);
      alert(error.message || 'Erro ao criar lembrete. Verifique se o backend está configurado.');
      return;
    }
    
    console.log(`💧 Lembrete de hidratação criado com ID ${id} para ${startHour}:00h todos os dias`);
    console.log(`📅 Próximo disparo: ${reminderTime.toISOString()}`);
    
    // Verify it was saved
    const saved = await db.reminders.get(id);
    console.log('🔍 Lembrete salvo:', {
      id: saved?.id,
      enabled: saved?.enabled,
      nextTrigger: saved?.nextTrigger
    });
    
    // Send Telegram confirmation
    try {
      await telegramService.sendReminder(
        '✅ Lembrete de Hidratação Criado',
        `Você será lembrado de beber água a cada ${reminderInterval} minutos, das ${startHour}h às ${endHour}h.\nCopo: ${glassSize}ml\nMeta diária: ${dailyGoal}L`,
        '💧'
      );
    } catch (error) {
      console.error('Erro ao enviar confirmação via Telegram:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Droplet className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Vamos te ajudar a bater sua meta de água!</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Passo {step} de 3
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Step 1: Introduction */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm leading-relaxed">
                  <strong className="text-blue-500">Hidratação é essencial!</strong><br />
                  Beber água regularmente melhora recuperação muscular, energia durante os treinos
                  e seus resultados na academia. Vamos configurar lembretes automáticos para você.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 my-6">
                <div className="text-center p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="text-3xl mb-2">💪</div>
                  <p className="text-xs font-medium">Melhor recuperação</p>
                </div>
                <div className="text-center p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="text-3xl mb-2">⚡</div>
                  <p className="text-xs font-medium">Mais energia</p>
                </div>
                <div className="text-center p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="text-3xl mb-2">📈</div>
                  <p className="text-xs font-medium">Melhores resultados</p>
                </div>
              </div>

              <Button onClick={() => setStep(2)} className="w-full" size="lg">
                Continuar
              </Button>
            </div>
          )}

          {/* Step 2: Set Daily Goal */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Quanto você quer beber por dia? (Litros)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(e.target.value)}
                  className="text-2xl h-16 text-center font-bold"
                  placeholder="3.0"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Recomendação: 2.5L - 4.0L por dia dependendo do seu peso e atividade
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tamanho do seu copo habitual
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[200, 300, 500].map((size) => (
                    <Button
                      key={size}
                      variant={glassSize === size ? 'default' : 'outline'}
                      onClick={() => setGlassSize(size)}
                      className="h-16"
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold">{size}</div>
                        <div className="text-xs">ml</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  Voltar
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Set Reminder Interval */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Com que frequência quer ser lembrado?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 45, label: '45 min' },
                    { value: 60, label: '1 hora' },
                    { value: 90, label: '1.5 horas' },
                    { value: 120, label: '2 horas' }
                  ].map((interval) => (
                    <Button
                      key={interval.value}
                      variant={reminderInterval === interval.value ? 'default' : 'outline'}
                      onClick={() => setReminderInterval(interval.value)}
                      className="h-16 text-lg"
                    >
                      {interval.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Horário dos lembretes
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Começar às</label>
                    <select
                      value={startHour}
                      onChange={(e) => setStartHour(Number(e.target.value))}
                      className="w-full h-12 px-3 rounded-md border border-input bg-background text-center font-semibold"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{i}:00</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Parar às</label>
                    <select
                      value={endHour}
                      onChange={(e) => setEndHour(Number(e.target.value))}
                      className="w-full h-12 px-3 rounded-md border border-input bg-background text-center font-semibold"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{i}:00</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Os lembretes funcionarão:</p>
                    <ul className="space-y-1">
                      <li>• Das {startHour}h às {endHour}h</li>
                      <li>• A cada {reminderInterval} minutos</li>
                      <li>• Mesmo com o app fechado</li>
                      <li>• Você pode pausar quando quiser</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                  Voltar
                </Button>
                <Button 
                  onClick={handleActivate} 
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                  size="lg"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Ativar Lembretes
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
