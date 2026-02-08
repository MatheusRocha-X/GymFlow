// Telegram Bot Service for sending reminders and motivational messages

export interface TelegramConfig {
  chatId: string;
  botToken?: string; // Optional: can be configured server-side
}

export class TelegramService {
  private static instance: TelegramService;
  private config: TelegramConfig | null = null;
  private apiUrl = 'https://api.telegram.org/bot';

  private constructor() {}

  static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  /**
   * Configure the Telegram service with user's chat ID
   * Bot token should be stored server-side or in environment variables
   */
  setConfig(config: TelegramConfig) {
    this.config = config;
    localStorage.setItem('telegram_config', JSON.stringify(config));
  }

  getConfig(): TelegramConfig | null {
    if (this.config) return this.config;
    
    const stored = localStorage.getItem('telegram_config');
    if (stored) {
      this.config = JSON.parse(stored);
      return this.config;
    }
    
    return null;
  }

  clearConfig() {
    this.config = null;
    localStorage.removeItem('telegram_config');
  }

  /**
   * Send a message via Telegram bot
   * Using a serverless function or backend API endpoint
   */
  async sendMessage(message: string, options?: {
    parseMode?: 'Markdown' | 'HTML';
    disableNotification?: boolean;
  }): Promise<boolean> {
    const config = this.getConfig();
    
    if (!config?.chatId) {
      console.error('Telegram not configured. Chat ID missing.');
      return false;
    }

    try {
      // In production, this should hit your backend API that securely stores the bot token
      // For now, we'll use a proxy endpoint or direct API call
      const botToken = config.botToken || import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      
      if (!botToken) {
        console.error('Bot token not configured');
        return false;
      }

      const response = await fetch(`${this.apiUrl}${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: message,
          parse_mode: options?.parseMode || 'Markdown',
          disable_notification: options?.disableNotification || false,
        }),
      });

      const result = await response.json();
      
      if (!result.ok) {
        console.error('Failed to send Telegram message:', result);
        
        // Provide helpful error messages
        if (result.description?.includes('chat not found')) {
          throw new Error('CHAT_NOT_FOUND');
        } else if (result.description?.includes('bot was blocked')) {
          throw new Error('BOT_BLOCKED');
        } else if (result.description?.includes('Unauthorized')) {
          throw new Error('INVALID_TOKEN');
        }
        
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return false;
    }
  }

  /**
   * Send a reminder notification
   */
  async sendReminder(title: string, message?: string, emoji?: string): Promise<boolean> {
    const fullMessage = `${emoji || '⏰'} *${title}*\n\n${message || 'Hora do seu lembrete!'}`;
    return this.sendMessage(fullMessage);
  }

  /**
   * Send a motivational message
   */
  async sendMotivationalMessage(quote: string, author?: string): Promise<boolean> {
    const message = `💪 *Mensagem Motivacional*\n\n_"${quote}"_${author ? `\n\n— ${author}` : ''}`;
    return this.sendMessage(message);
  }

  /**
   * Send hydration reminder
   */
  async sendHydrationReminder(waterAmount: number): Promise<boolean> {
    const message = `💧 *Hora de Hidratar!*\n\nBeba ${waterAmount}ml de água agora.\n\nManter-se hidratado é essencial para o desempenho! 🚰`;
    return this.sendMessage(message);
  }

  /**
   * Send workout reminder
   */
  async sendWorkoutReminder(workoutName: string, time?: string): Promise<boolean> {
    const message = `🏋️ *Treino de Hoje*\n\n${workoutName}\n${time ? `Horário: ${time}` : ''}\n\nVamos treinar! 💪`;
    return this.sendMessage(message);
  }

  /**
   * Test the connection by sending a test message
   */
  async testConnection(): Promise<boolean> {
    return this.sendMessage('✅ *Telegram configurado com sucesso!*\n\nVocê receberá seus lembretes e mensagens motivacionais aqui. 🎯');
  }

  /**
   * Get the Telegram setup URL for users
   */
  getBotSetupUrl(): string {
    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'YourGymFlowBot';
    return `https://t.me/${botUsername}`;
  }

  /**
   * Generate instructions for users to get their chat ID
   */
  getSetupInstructions(): string[] {
    return [
      '1. Abra o Telegram e busque por @userinfobot ou @getidsbot',
      '2. Inicie uma conversa com o bot',
      '3. O bot enviará seu Chat ID',
      '4. Copie o número do Chat ID',
      '5. Cole aqui na configuração do GymFlow',
      '6. Opcionalmente, inicie uma conversa com @GymFlowBot para ativar as notificações'
    ];
  }
}

export const telegramService = TelegramService.getInstance();
