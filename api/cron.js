import { checkRemindersJob, checkDailyMotivationJob } from './index.js';

export default async function handler(req, res) {
  // Verificar se tem autorização (opcional, para segurança)
  const authHeader = req.headers.authorization;
  const expectedAuth = process.env.CRON_SECRET || 'your-secret-key';
  
  if (authHeader !== `Bearer ${expectedAuth}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const reminderResults = await checkRemindersJob();
    const motivationResults = await checkDailyMotivationJob();
    
    res.status(200).json({
      success: true,
      reminders: reminderResults,
      motivation: motivationResults,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro no cron:', error);
    res.status(500).json({ error: error.message });
  }
}
