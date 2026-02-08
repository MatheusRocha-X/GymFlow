import { useState } from 'react';
import { X, Send, Check, ExternalLink, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { db } from '@/lib/db';
import { telegramService } from '@/lib/telegram';

interface TelegramConfigModalProps {
  onClose: () => void;
  onComplete: () => void;
}

export function TelegramConfigModal({ onClose, onComplete }: TelegramConfigModalProps) {
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
      // Configure telegram service
      telegramService.setConfig({ chatId: chatId.trim() });

      // Test connection
      const success = await telegramService.testConnection();

      if (success) {
        setTested(true);
      } else {
        setError('Falha ao enviar mensagem de teste. Verifique se o Chat ID está correto e se você iniciou uma conversa com o bot.');
        telegramService.clearConfig();
      }
    } catch (err) {
      console.error('Error testing Telegram:', err);
      setError('Erro ao testar conexão com Telegram');
      telegramService.clearConfig();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tested) {
      setError('Por favor, teste a conexão primeiro');
      return;
    }

    setLoading(true);

    try {
      // Save to database
      const existing = await db.telegramSettings.toArray();
      
      const settings = {
        enabled: true,
        chatId: chatId.trim(),
        dailyMotivationEnabled: true,
        dailyMotivationTime: '08:00', // 8 AM default
        setupCompleted: true
      };

      if (existing.length > 0) {
        await db.telegramSettings.update(existing[0].id!, settings);
      } else {
        await db.telegramSettings.add(settings);
      }

      onComplete();
    } catch (err) {
      console.error('Error saving Telegram settings:', err);
      setError('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-1.5 sm:gap-2">
                <span className="text-xl sm:text-2xl">📱</span> Configurar Telegram
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                Receba seus lembretes via Telegram
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 sm:p-3">
            <div className="flex gap-2 sm:gap-3">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-[10px] sm:text-xs">
                <p className="font-medium text-blue-500 mb-0.5 sm:mb-1">Por que Telegram?</p>
                <p className="text-muted-foreground">
                  Notificações web podem falhar. Telegram garante entrega confiável! 🚀
                </p>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="font-semibold text-sm sm:text-base">Como configurar:</h3>
            
            {/* Step 1 */}
            <div className="bg-card border rounded-lg p-2 sm:p-3">
              <div className="flex gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs sm:text-sm font-bold">1</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium mb-1 sm:mb-2 text-xs sm:text-sm">Abra o bot no Telegram</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">
                    Use @userinfobot ou @getidsbot
                  </p>
                  <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open('https://t.me/userinfobot', '_blank')}
                      className="h-8 text-[10px] sm:text-xs"
                    >
                      <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                      @userinfobot
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open('https://t.me/getidsbot', '_blank')}
                      className="h-8 text-[10px] sm:text-xs"
                    >
                      <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                      @getidsbot
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-card border rounded-lg p-2 sm:p-3">
              <div className="flex gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs sm:text-sm font-bold">2</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium mb-1 text-xs sm:text-sm">Inicie a conversa</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Envie qualquer mensagem. O bot responderá com seu Chat ID.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-card border rounded-lg p-2 sm:p-3">
              <div className="flex gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs sm:text-sm font-bold">3</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium mb-1 text-xs sm:text-sm">Copie seu Chat ID</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5">
                    Procure por <code className="bg-muted px-1 rounded text-[9px] sm:text-[10px]">Id</code> ou <code className="bg-muted px-1 rounded text-[9px] sm:text-[10px]">Chat ID</code>
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground italic">
                    Ex: 123456789
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-card border rounded-lg p-2 sm:p-3">
              <div className="flex gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs sm:text-sm font-bold">4</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium mb-2 text-xs sm:text-sm">Cole seu Chat ID</p>
                  <Input
                    type="text"
                    placeholder="Ex: 123456789"
                    value={chatId}
                    onChange={(e) => {
                      setChatId(e.target.value);
                      setTested(false);
                      setError('');
                    }}
                    className="font-mono h-9 sm:h-10 text-xs sm:text-sm"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2 sm:p-3">
              <p className="text-[10px] sm:text-xs text-destructive font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {tested && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-green-500 text-xs sm:text-sm">Conexão testada!</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                    Mensagem enviada para o Telegram
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-3">
            <Button
              variant="outline"
              className="flex-1 h-9 sm:h-10 text-xs sm:text-sm order-2 sm:order-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            
            {!tested ? (
              <Button
                className="flex-1 h-9 sm:h-10 text-xs sm:text-sm order-1 sm:order-2"
                onClick={handleTest}
                disabled={loading || !chatId.trim()}
              >
                {loading ? (
                  <>Testando...</>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Testar
                  </>
                )}
              </Button>
            ) : (
              <Button
                className="flex-1 h-9 sm:h-10 text-xs sm:text-sm order-1 sm:order-2"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <>Salvando...</>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Footer Note */}
          <div className="text-[9px] sm:text-[10px] text-muted-foreground text-center pt-2 border-t">
            <p>
              🔒 Dados armazenados localmente
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
