import { useState } from 'react';
import { X, Bell, Droplet, Dumbbell, Pill, Activity } from 'lucide-react';
import { db, type Reminder } from '@/lib/db';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';

interface CreateReminderModalProps {
  onClose: () => void;
  onComplete: () => void;
  editReminder?: Reminder;
}

const reminderTypes = [
  { id: 'hydration', label: 'Hidratação', icon: Droplet, color: 'blue' },
  { id: 'workout', label: 'Treino', icon: Dumbbell, color: 'orange' },
  { id: 'supplement', label: 'Suplemento', icon: Pill, color: 'green' },
  { id: 'stretching', label: 'Alongamento', icon: Activity, color: 'purple' },
  { id: 'custom', label: 'Outro', icon: Bell, color: 'gray' }
] as const;

const recurrenceOptions = [
  { id: 'none', label: 'Apenas uma vez' },
  { id: 'daily', label: 'Todos os dias' },
  { id: 'weekly', label: 'Semanal' },
  { id: 'monthly', label: 'Mensal' }
] as const;

const weekDays = [
  { id: 0, label: 'Dom' },
  { id: 1, label: 'Seg' },
  { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' },
  { id: 4, label: 'Qui' },
  { id: 5, label: 'Sex' },
  { id: 6, label: 'Sáb' }
];

export function CreateReminderModal({ onClose, onComplete, editReminder }: CreateReminderModalProps) {
  const [type, setType] = useState<Reminder['type']>(editReminder?.type || 'custom');
  const [title, setTitle] = useState(editReminder?.title || '');
  const [message, setMessage] = useState(editReminder?.message || '');
  const [time, setTime] = useState(
    editReminder?.time 
      ? new Date(editReminder.time).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [recurrence, setRecurrence] = useState<Reminder['recurrence']>(
    editReminder?.recurrence || 'none'
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(editReminder?.daysOfWeek || []);
  const [loading, setLoading] = useState(false);

  console.log('CreateReminderModal montado', { showModal: true });

  const toggleWeekDay = (dayId: number) => {
    setSelectedDays(prev =>
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId].sort()
    );
  };

  const getPlaceholders = () => {
    switch (type) {
      case 'hydration':
        return {
          title: 'Hora de hidratar!',
          message: 'Beba um copo de água agora 💧'
        };
      case 'workout':
        return {
          title: 'Treino de hoje',
          message: 'Não esqueça do seu treino de pernas 💪'
        };
      case 'supplement':
        return {
          title: 'Suplemento',
          message: 'Tomar whey protein pós-treino'
        };
      case 'stretching':
        return {
          title: 'Alongamento',
          message: 'Faça 10 minutos de alongamento 🧘'
        };
      default:
        return {
          title: 'Lembrete',
          message: 'Descrição do lembrete...'
        };
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit chamado', { title, message, time, recurrence, type });
    
    if (!title.trim()) {
      alert('Por favor, insira um título para o lembrete');
      return;
    }

    if (recurrence === 'weekly' && selectedDays.length === 0) {
      alert('Selecione pelo menos um dia da semana');
      return;
    }

    setLoading(true);

    try {
      const reminderData: Omit<Reminder, 'id'> = {
        type,
        title: title.trim(),
        message: message.trim() || undefined,
        time: new Date(time),
        recurrence: recurrence as Reminder['recurrence'],
        daysOfWeek: recurrence === 'weekly' ? selectedDays : undefined,
        enabled: true,
        createdAt: new Date(),
        nextTrigger: new Date(time)
      };

      console.log('Salvando lembrete:', reminderData);

      if (editReminder?.id) {
        await db.reminders.update(editReminder.id, reminderData);
      } else {
        const id = await db.reminders.add(reminderData);
        console.log('Lembrete criado com ID:', id);
      }

      // Request notification permission if not granted
      if ('Notification' in window && Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }

      // Show confirmation notification
      if (Notification.permission === 'granted') {
        new Notification('✅ Lembrete criado!', {
          body: `"${title}" foi ${editReminder ? 'atualizado' : 'criado'} com sucesso.`,
          icon: '/icon-192x192.png'
        });
      }

      console.log('Chamando onComplete');
      onComplete();
    } catch (error) {
      console.error('Erro ao salvar lembrete:', error);
      alert('Erro ao salvar lembrete. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const placeholders = getPlaceholders();

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {editReminder ? 'Editar Lembrete' : 'Novo Lembrete'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Reminder Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Lembrete</label>
            <div className="grid grid-cols-3 gap-2">
              {reminderTypes.map(({ id, label, icon: Icon, color }) => (
                <Button
                  key={id}
                  variant={type === id ? 'default' : 'outline'}
                  onClick={() => setType(id as Reminder['type'])}
                  className={cn(
                    'h-20 flex-col gap-2',
                    type === id && `bg-${color}-500 hover:bg-${color}-600`
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-2 block">Título *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={placeholders.title}
              className="text-lg"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium mb-2 block">Mensagem (opcional)</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholders.message}
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div>
            <label className="text-sm font-medium mb-2 block">Data e Hora *</label>
            <Input
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Recurrence */}
          <div>
            <label className="text-sm font-medium mb-2 block">Recorrência</label>
            <div className="grid grid-cols-2 gap-2">
              {recurrenceOptions.map(({ id, label }) => (
                <Button
                  key={id}
                  variant={recurrence === id ? 'default' : 'outline'}
                  onClick={() => setRecurrence(id as Reminder['recurrence'])}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Week Days (only for weekly recurrence) */}
          {recurrence === 'weekly' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Dias da Semana *</label>
              <div className="flex gap-1">
                {weekDays.map(({ id, label }) => (
                  <Button
                    key={id}
                    variant={selectedDays.includes(id) ? 'default' : 'outline'}
                    onClick={() => toggleWeekDay(id)}
                    className="flex-1"
                    size="sm"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-accent rounded-lg text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Bell className="w-4 h-4 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Sobre as notificações:</p>
                <ul className="space-y-1">
                  <li>• As notificações funcionam mesmo com o app fechado</li>
                  <li>• Você pode editar ou excluir lembretes a qualquer momento</li>
                  <li>• Use o botão "Pausar todos" para desativar temporariamente</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1" disabled={loading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Salvando...' : editReminder ? 'Atualizar' : 'Criar Lembrete'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
