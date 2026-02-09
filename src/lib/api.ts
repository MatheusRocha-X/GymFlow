// API Service - Gerencia comunicação com backend
// Fallback para IndexedDB local se API não estiver disponível

import { db, type Reminder } from './db';

const API_URL = import.meta.env.VITE_API_URL || '';

class ApiService {
  private useBackend: boolean = false;
  private checking: boolean = false;

  constructor() {
    this.checkBackendAvailability();
  }

  /**
   * Verifica se o backend está disponível
   */
  async checkBackendAvailability(): Promise<boolean> {
    if (this.checking) return this.useBackend;
    if (!API_URL) {
      console.log('📴 API_URL não configurada - usando modo offline');
      return false;
    }

    this.checking = true;

    try {
      const response = await fetch(`${API_URL}/api`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
      });
      
      const data = await response.json();
      this.useBackend = data.status === 'ok';
      
      if (this.useBackend) {
        console.log('✅ Backend online - lembretes funcionarão 24/7');
      }
    } catch (error) {
      console.log('📴 Backend offline - usando modo local');
      this.useBackend = false;
    }

    this.checking = false;
    return this.useBackend;
  }

  /**
   * Salvar configurações do Telegram
   */
  async saveTelegramConfig(chatId: string, settings: any): Promise<void> {
    await this.checkBackendAvailability();

    if (!this.useBackend) {
      throw new Error('❌ Backend não disponível! Configure VITE_API_URL e faça deploy do servidor.');
    }

    try {
      await fetch(`${API_URL}/api/telegram/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, ...settings })
      });
      console.log('✅ Configurações salvas no backend');
    } catch (error) {
      console.error('Erro ao salvar no backend:', error);
      throw new Error('❌ Falha ao conectar com o servidor. Verifique sua conexão e tente novamente.');
    }
    
    // Também salvar localmente para exibição no app
    await this.saveTelegramConfigLocal(settings);
  }

  private async saveTelegramConfigLocal(settings: any): Promise<void> {
    const existing = await db.telegramSettings.toArray();
    if (existing.length > 0) {
      await db.telegramSettings.update(existing[0].id!, settings);
    } else {
      await db.telegramSettings.add(settings);
    }
  }

  /**
   * Criar ou atualizar lembrete
   */
  async saveReminder(reminder: Partial<Reminder>): Promise<number | void> {
    await this.checkBackendAvailability();

    if (!this.useBackend) {
      throw new Error('❌ Backend não disponível! Os lembretes não funcionarão com o app fechado. Configure o servidor primeiro.');
    }

    // Pegar chatId das configurações do Telegram
    const telegramSettings = await db.telegramSettings.toArray();
    const chatId = telegramSettings[0]?.chatId;

    if (!chatId) {
      throw new Error('❌ Configure o Telegram primeiro!');
    }

    try {
      const response = await fetch(`${API_URL}/api/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reminder, chatId })
      });
      
      if (!response.ok) {
        throw new Error(`Servidor retornou erro: ${response.status}`);
      }
      
      await response.json();
      console.log('✅ Lembrete salvo no backend');
      
      // Também salvar localmente para exibição
      return await this.saveReminderLocal(reminder);
    } catch (error) {
      console.error('Erro ao salvar no backend:', error);
      throw new Error('❌ Falha ao salvar no servidor. Verifique se o backend está rodando e tente novamente.');
    }
  }

  private async saveReminderLocal(reminder: Partial<Reminder>): Promise<number> {
    if (reminder.id) {
      await db.reminders.update(reminder.id, reminder);
      return reminder.id;
    } else {
      return await db.reminders.add(reminder as any);
    }
  }

  /**
   * Deletar lembrete
   */
  async deleteReminder(id: number): Promise<void> {
    await this.checkBackendAvailability();

    if (!this.useBackend) {
      throw new Error('❌ Backend não disponível! Não é possível deletar lembretes.');
    }

    try {
      const response = await fetch(`${API_URL}/api/reminders/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Servidor retornou erro: ${response.status}`);
      }
      
      console.log('✅ Lembrete deletado no backend');
    } catch (error) {
      console.error('Erro ao deletar no backend:', error);
      throw new Error('❌ Falha ao deletar no servidor. Verifique sua conexão e tente novamente.');
    }
    
    // Também deletar localmente
    await db.reminders.delete(id);
  }

  /**
   * Sincronizar lembretes locais com o backend
   */
  async syncReminders(): Promise<void> {
    await this.checkBackendAvailability();

    if (!this.useBackend) {
      console.log('Backend offline - sincronização cancelada');
      return;
    }

    try {
      // Pegar chatId
      const telegramSettings = await db.telegramSettings.toArray();
      const chatId = telegramSettings[0]?.chatId;

      if (!chatId) {
        console.log('ChatId não encontrado - configure o Telegram primeiro');
        return;
      }

      // Pegar lembretes locais
      const localReminders = await db.reminders.toArray();

      // Enviar todos para o backend
      for (const reminder of localReminders) {
        await fetch(`${API_URL}/api/reminders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...reminder, chatId })
        });
      }

      console.log(`✅ ${localReminders.length} lembretes sincronizados com o backend`);
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    }
  }

  /**
   * Verificar se está usando backend
   */
  isUsingBackend(): boolean {
    return this.useBackend;
  }
}

// Export singleton
export const apiService = new ApiService();
