import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (você pode trocar por MongoDB depois)
let reminders = [];
let userSettings = new Map(); // chatId -> settings

// ==================== API ENDPOINTS ====================

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'GymApp Backend Running',
    reminders: reminders.length,
    users: userSettings.size
  });
});

// Salvar configurações do Telegram
app.post('/api/telegram/config', (req, res) => {
  const { chatId, dailyMotivationEnabled, dailyMotivationTime } = req.body;
  
  userSettings.set(chatId, {
    chatId,
    dailyMotivationEnabled: dailyMotivationEnabled ?? true,
    dailyMotivationTime: dailyMotivationTime ?? '07:00',
    lastMotivationalMessage: null
  });
  
  res.json({ success: true, message: 'Configurações salvas' });
});

// Criar/atualizar lembrete
app.post('/api/reminders', (req, res) => {
  const reminder = {
    id: req.body.id || Date.now(),
    chatId: req.body.chatId,
    type: req.body.type,
    title: req.body.title,
    message: req.body.message,
    time: req.body.time,
    recurrence: req.body.recurrence,
    enabled: req.body.enabled ?? true,
    nextTrigger: req.body.nextTrigger || req.body.time,
    daysOfWeek: req.body.daysOfWeek,
    createdAt: req.body.createdAt || new Date().toISOString()
  };
  
  // Se tem ID, atualiza; senão, cria novo
  const index = reminders.findIndex(r => r.id === reminder.id);
  if (index >= 0) {
    reminders[index] = reminder;
  } else {
    reminders.push(reminder);
  }
  
  res.json({ success: true, reminder });
});

// Listar lembretes de um usuário
app.get('/api/reminders/:chatId', (req, res) => {
  const { chatId } = req.params;
  const userReminders = reminders.filter(r => r.chatId === chatId);
  res.json(userReminders);
});

// Deletar lembrete
app.delete('/api/reminders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = reminders.findIndex(r => r.id === id);
  
  if (index >= 0) {
    const deleted = reminders[index];
    reminders.splice(index, 1);
    res.json({ success: true, deleted });
  } else {
    res.status(404).json({ success: false, message: 'Lembrete não encontrado' });
  }
});

// ==================== TELEGRAM BOT ====================

async function sendTelegramMessage(chatId, text, emoji = '🔔') {
  if (!BOT_TOKEN) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN não configurado');
    return false;
  }
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `${emoji} ${text}`,
        parse_mode: 'HTML'
      })
    });
    
    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error('Erro ao enviar Telegram:', error);
    return false;
  }
}

// ==================== CRON JOBS ====================

// Verificar lembretes a cada minuto
cron.schedule('* * * * *', async () => {
  const now = new Date();
  console.log(`⏰ Verificando lembretes às ${now.toISOString()}`);
  
  for (const reminder of reminders) {
    if (!reminder.enabled) continue;
    
    const nextTrigger = new Date(reminder.nextTrigger);
    const timeDiffMs = now.getTime() - nextTrigger.getTime();
    const timeDiffSec = timeDiffMs / 1000;
    
    // Disparar se estiver dentro da janela de 60 segundos
    if (timeDiffSec >= 0 && timeDiffSec <= 60) {
      console.log(`🔔 Disparando lembrete: ${reminder.title}`);
      
      // Enviar mensagem
      const emojiMap = {
        'hydration': '💧',
        'workout': '🏋️',
        'supplement': '💊',
        'stretching': '🧘',
        'custom': '⏰'
      };
      const emoji = emojiMap[reminder.type] || '⏰';
      
      await sendTelegramMessage(
        reminder.chatId,
        `<b>${reminder.title}</b>\n${reminder.message}`,
        emoji
      );
      
      // Atualizar próximo disparo
      updateNextTrigger(reminder, now);
    }
  }
});

// Mensagens motivacionais diárias às 7h
cron.schedule('0 7 * * *', async () => {
  console.log('✨ Enviando mensagens motivacionais...');
  
  for (const [chatId, settings] of userSettings.entries()) {
    if (!settings.dailyMotivationEnabled) continue;
    
    const quote = getRandomMotivationalQuote();
    await sendTelegramMessage(
      chatId,
      `<b>💪 Bom dia!</b>\n\n${quote.text}${quote.author ? `\n\n— ${quote.author}` : ''}`,
      '✨'
    );
    
    settings.lastMotivationalMessage = new Date().toISOString();
  }
});

// ==================== HELPERS ====================

function updateNextTrigger(reminder, now) {
  const reminderTime = new Date(reminder.time);
  let nextTrigger;
  
  switch (reminder.recurrence) {
    case 'daily':
      nextTrigger = new Date(reminderTime);
      nextTrigger.setDate(now.getDate());
      nextTrigger.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0, 0);
      
      if (nextTrigger <= now) {
        nextTrigger.setDate(nextTrigger.getDate() + 1);
      }
      break;
      
    case 'weekly':
      nextTrigger = new Date(reminderTime);
      nextTrigger.setDate(now.getDate());
      nextTrigger.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0, 0);
      
      if (nextTrigger <= now) {
        nextTrigger.setDate(nextTrigger.getDate() + 7);
      }
      break;
      
    case 'monthly':
      nextTrigger = new Date(reminderTime);
      nextTrigger.setMonth(now.getMonth());
      nextTrigger.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0, 0);
      
      if (nextTrigger <= now) {
        nextTrigger.setMonth(nextTrigger.getMonth() + 1);
      }
      break;
      
    default:
      // Para 'none', desabilita após disparar
      reminder.enabled = false;
      return;
  }
  
  reminder.nextTrigger = nextTrigger.toISOString();
}

function getRandomMotivationalQuote() {
  const quotes = [
    { text: "A dor que você sente hoje será a força que você sentirá amanhã." },
    { text: "O corpo alcança o que a mente acredita." },
    { text: "Não importa quão devagar você vá, desde que não pare.", author: "Confúcio" },
    { text: "Seu corpo pode aguentar quase tudo. É sua mente que você precisa convencer." },
    { text: "A motivação é o que te faz começar. O hábito é o que te mantém." },
    { text: "Você não precisa ser extremo, apenas consistente." },
    { text: "Transpire agora, brilhe depois." },
    { text: "Todo campeão foi uma vez um competidor que se recusou a desistir." },
    { text: "Você é mais forte do que pensa." },
    { text: "Grandes coisas nunca vêm de zonas de conforto." }
  ];
  
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Status: http://localhost:${PORT}/`);
  
  if (!BOT_TOKEN) {
    console.warn('⚠️  AVISO: TELEGRAM_BOT_TOKEN não definido!');
    console.warn('   Configure a variável de ambiente TELEGRAM_BOT_TOKEN');
  } else {
    console.log('✅ Telegram Bot configurado');
  }
});
