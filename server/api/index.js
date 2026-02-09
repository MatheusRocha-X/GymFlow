import fetch from 'node-fetch';

// In-memory storage (ideal usar banco de dados real em produção)
let reminders = [];
let userSettings = new Map();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

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

// ==================== CRON JOB (Manual Trigger) ====================

export async function checkRemindersJob() {
  const now = new Date();
  console.log(`⏰ Verificando lembretes às ${now.toISOString()}`);
  
  let processed = 0;
  
  for (const reminder of reminders) {
    if (!reminder.enabled) continue;
    
    const nextTrigger = new Date(reminder.nextTrigger);
    const timeDiffMs = now.getTime() - nextTrigger.getTime();
    const timeDiffSec = timeDiffMs / 1000;
    
    if (timeDiffSec >= 0 && timeDiffSec <= 60) {
      console.log(`🔔 Disparando lembrete: ${reminder.title}`);
      
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
      
      updateNextTrigger(reminder, now);
      processed++;
    }
  }
  
  return { processed, total: reminders.length };
}

export async function checkDailyMotivationJob() {
  const now = new Date();
  const currentHour = now.getHours();
  
  console.log(`✨ Verificando mensagens motivacionais às ${currentHour}h`);
  
  let sent = 0;
  
  for (const [chatId, settings] of userSettings.entries()) {
    if (!settings.dailyMotivationEnabled) continue;
    
    const [targetHour] = settings.dailyMotivationTime.split(':').map(Number);
    
    if (currentHour === targetHour) {
      const lastSent = settings.lastMotivationalMessage;
      const today = new Date().setHours(0, 0, 0, 0);
      
      if (!lastSent || new Date(lastSent).getTime() < today) {
        const quote = getRandomMotivationalQuote();
        await sendTelegramMessage(
          chatId,
          `<b>💪 Bom dia!</b>\n\n${quote.text}${quote.author ? `\n\n— ${quote.author}` : ''}`,
          '✨'
        );
        
        settings.lastMotivationalMessage = new Date().toISOString();
        sent++;
      }
    }
  }
  
  return { sent };
}

// ==================== API HANDLER ====================

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, url } = req;
  const path = url?.split('?')[0] || '/';

  // Health check
  if (method === 'GET' && path === '/api') {
    return res.status(200).json({
      status: 'ok',
      message: 'GymApp Backend Running',
      reminders: reminders.length,
      users: userSettings.size
    });
  }

  // Telegram config
  if (method === 'POST' && path === '/api/telegram/config') {
    const { chatId, dailyMotivationEnabled, dailyMotivationTime } = req.body;
    
    userSettings.set(chatId, {
      chatId,
      dailyMotivationEnabled: dailyMotivationEnabled ?? true,
      dailyMotivationTime: dailyMotivationTime ?? '07:00',
      lastMotivationalMessage: null
    });
    
    return res.status(200).json({ success: true, message: 'Configurações salvas' });
  }

  // Create/Update reminder
  if (method === 'POST' && path === '/api/reminders') {
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
    
    const index = reminders.findIndex(r => r.id === reminder.id);
    if (index >= 0) {
      reminders[index] = reminder;
    } else {
      reminders.push(reminder);
    }
    
    return res.status(200).json({ success: true, reminder });
  }

  // List reminders
  if (method === 'GET' && path.startsWith('/api/reminders/')) {
    const chatId = path.split('/').pop();
    const userReminders = reminders.filter(r => r.chatId === chatId);
    return res.status(200).json(userReminders);
  }

  // Delete reminder
  if (method === 'DELETE' && path.startsWith('/api/reminders/')) {
    const id = parseInt(path.split('/').pop() || '0');
    const index = reminders.findIndex(r => r.id === id);
    
    if (index >= 0) {
      const deleted = reminders[index];
      reminders.splice(index, 1);
      return res.status(200).json({ success: true, deleted });
    } else {
      return res.status(404).json({ success: false, message: 'Lembrete não encontrado' });
    }
  }

  res.status(404).json({ error: 'Not found' });
}

// Export data accessors for cron
export { reminders, userSettings };
