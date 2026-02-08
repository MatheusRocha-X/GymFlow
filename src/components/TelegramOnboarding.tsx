import { useState } from 'react';
import { Send, Check, ExternalLink, Sparkles, Bell, Trophy, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { db } from '@/lib/db';
import { telegramService } from '@/lib/telegram';

interface TelegramOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function TelegramOnboarding({ onComplete, onSkip }: TelegramOnboardingProps) {
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [tested, setTested] = useState(false);
  const [error, setError] = useState('');

  const handleTest = async () => {
    if (!chatId.trim()) {
      setError('Por favor, insira seu Chat ID do Telegram');
      return;
    }

    setLoading(true);
    setError('');

    try {
      telegramService.setConfig({ chatId: chatId.trim() });
      const success = await telegramService.testConnection();

      if (success) {
        setTested(true);
        setError('');
      } else {
        setError('Não foi possível enviar a mensagem. Verifique o Chat ID e tente novamente.');
        telegramService.clearConfig();
      }
    } catch (err: any) {
      console.error('Error testing Telegram:', err);
      
      // Provide user-friendly error messages
      if (err.message === 'CHAT_NOT_FOUND') {
        setError('❌ Chat não encontrado! Você precisa primeiro enviar /start para o bot @' + import.meta.env.VITE_TELEGRAM_BOT_USERNAME + ' no Telegram.');
      } else if (err.message === 'BOT_BLOCKED') {
        setError('❌ Você bloqueou o bot. Desbloqueie-o no Telegram e tente novamente.');
      } else if (err.message === 'INVALID_TOKEN') {
        setError('❌ Token do bot inválido. Entre em contato com o suporte.');
      } else {
        setError('❌ Erro ao testar conexão. Verifique seu Chat ID e tente novamente.');
      }
      
      telegramService.clearConfig();
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!tested) {
      setError('Por favor, teste a conexão primeiro');
      return;
    }

    setLoading(true);

    try {
      await db.telegramSettings.add({
        enabled: true,
        chatId: chatId.trim(),
        dailyMotivationEnabled: true,
        dailyMotivationTime: '08:00',
        setupCompleted: true
      });

      onComplete();
    } catch (err) {
      console.error('Error saving Telegram settings:', err);
      setError('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await db.telegramSettings.add({
        enabled: false,
        chatId: '',
        dailyMotivationEnabled: false,
        dailyMotivationTime: '08:00',
        setupCompleted: true
      });
      onSkip();
    } catch (err) {
      console.error('Error skipping telegram setup:', err);
      onSkip();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-gradient-to-br from-primary/20 via-background to-primary/10 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-4 sm:my-8">
        <Card className="border-2 border-primary/20 shadow-2xl backdrop-blur-sm bg-background/95">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="flex justify-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Send className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                Bem-vindo ao GymFlow! 💪
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Configure notificações via Telegram para nunca perder seus treinos
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="flex flex-col items-center p-2 sm:p-3 bg-primary/5 rounded-lg border border-primary/20">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-1 sm:mb-2" />
                <p className="text-[10px] sm:text-xs font-medium text-center">Lembretes</p>
              </div>
              <div className="flex flex-col items-center p-2 sm:p-3 bg-primary/5 rounded-lg border border-primary/20">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-1 sm:mb-2" />
                <p className="text-[10px] sm:text-xs font-medium text-center">Motivação</p>
              </div>
              <div className="flex flex-col items-center p-2 sm:p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mb-1 sm:mb-2" />
                <p className="text-[10px] sm:text-xs font-medium text-center">Metas</p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3 sm:space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 sm:space-y-3 flex-1">
                      <p className="text-xs sm:text-sm font-medium">Como configurar (3 passos):</p>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-[10px] sm:text-xs font-bold">1</div>
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm font-medium mb-1">Inicie conversa com o bot</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">
                              Abra o Telegram: <strong>@{import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'seu_bot'}</strong>
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full sm:w-auto text-xs h-8"
                              onClick={() => window.open(`https://t.me/${import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'GymFlowNotify_bot'}`, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Abrir Bot
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-[10px] sm:text-xs font-bold">2</div>
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm font-medium mb-1">Envie /start</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              Isso permite que o bot envie mensagens
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-[10px] sm:text-xs font-bold">3</div>
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm font-medium mb-1">Obtenha seu Chat ID</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">Use um bot para descobrir:</p>
                            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full sm:w-auto text-xs h-8"
                                onClick={() => window.open('https://t.me/userinfobot', '_blank')}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                @userinfobot
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full sm:w-auto text-xs h-8"
                                onClick={() => window.open('https://t.me/getidsbot', '_blank')}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                @getidsbot
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <label className="text-xs sm:text-sm font-medium">Cole seu Chat ID:</label>
                  <Input
                    type="text"
                    placeholder="Ex: 123456789"
                    value={chatId}
                    onChange={(e) => {
                      setChatId(e.target.value);
                      setTested(false);
                      setError('');
                    }}
                    className="text-sm sm:text-base font-mono h-10 sm:h-12"
                    disabled={loading}
                  />
                  
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 sm:p-3">
                    <p className="text-[10px] sm:text-xs text-primary">
                      ⚠️ <strong>Importante:</strong> Certifique-se de enviar <code className="bg-primary/20 px-1 rounded">/start</code> para o bot <strong>@{import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'seu_bot'}</strong> ANTES de testar!
                    </p>
                  </div>
                  
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2 sm:p-3">
                      <p className="text-[10px] sm:text-xs text-destructive font-medium">{error}</p>
                    </div>
                  )}
                </div>

                {tested && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-green-500">Conexão testada!</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Você recebeu uma mensagem no Telegram</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                  <Button
                    variant="ghost"
                    className="w-full sm:w-auto order-2 sm:order-1 h-9 text-xs sm:text-sm"
                    onClick={handleSkip}
                    disabled={loading}
                  >
                    Pular por enquanto
                  </Button>
                  
                  {!tested ? (
                    <Button
                      className="w-full sm:flex-1 order-1 sm:order-2 h-10 sm:h-12 text-sm"
                      onClick={handleTest}
                      disabled={loading || !chatId.trim()}
                    >
                      {loading ? (
                        'Testando...'
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Testar Conexão
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="w-full sm:flex-1 order-1 sm:order-2 h-10 sm:h-12 bg-primary hover:bg-primary/90 text-sm"
                      onClick={handleComplete}
                      disabled={loading}
                    >
                      {loading ? (
                        'Salvando...'
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Concluir
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

            {/* Footer */}
            <div className="text-center pt-3 sm:pt-4 border-t">
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                🔒 Informações armazenadas apenas no seu dispositivo
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
