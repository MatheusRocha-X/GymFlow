import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Trash2, AlertTriangle, Info, Send, CheckCircle2, XCircle, Dumbbell, Zap, Smartphone, Wifi, WifiOff, Heart, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';
import { apiService } from '@/lib/api';
import { TelegramConfigModal } from '@/components/TelegramConfigModal';
import { useLiveQuery } from 'dexie-react-hooks';

export default function SettingsPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [showTelegramConfig, setShowTelegramConfig] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [checkingBackend, setCheckingBackend] = useState(true);
  const [pixCopied, setPixCopied] = useState(false);

  const telegramSettings = useLiveQuery(() => db.telegramSettings.toArray().then(s => s[0]));

  const pixCode = '00020126400014br.gov.bcb.pix0118quiquaza@gmail.com5204000053039865802BR5925MATHEUS DO NASCIMENTO ROC6009Sao Paulo62290525REC69895CDA3E1A92183541966304948F';

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    setCheckingBackend(true);
    const isOnline = await apiService.checkBackendAvailability();
    setBackendOnline(isOnline);
    setCheckingBackend(false);
  };

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 3000);
    } catch (error) {
      console.error('Erro ao copiar PIX:', error);
      alert('Código PIX: ' + pixCode);
    }
  };

  const handleOpenPix = () => {
    // Tenta abrir no app do banco (alguns navegadores/sistemas suportam)
    // Se não funcionar, copia automaticamente
    const pixUrl = `https://nubank.com.br/pagar/${btoa(pixCode)}`;
    
    // Tenta abrir em nova aba
    const newWindow = window.open(pixUrl, '_blank');
    
    // Se não conseguir abrir (bloqueado), copia o código
    if (!newWindow) {
      handleCopyPix();
    } else {
      // Também copia para facilitar
      navigator.clipboard.writeText(pixCode).catch(() => {});
    }
  };

  const handleClearAllData = async () => {
    const confirmed = window.confirm(
      '⚠️ ATENÇÃO!\n\nIsto irá apagar TODOS os seus dados:\n• Rotinas de treino\n• Histórico de treinos\n• Lembretes\n• Configurações de hidratação\n• Logs de água\n• Configurações do Telegram\n\nEsta ação NÃO pode ser desfeita!\n\nDeseja realmente continuar?'
    );

    if (!confirmed) return;

    // Double confirmation for safety
    const doubleConfirm = window.confirm(
      'Tem certeza absoluta?\n\nÚltima chance antes de apagar tudo!'
    );

    if (!doubleConfirm) return;

    setIsClearing(true);

    try {
      // Clear all tables including telegram settings
      await db.workoutRoutines.clear();
      await db.workoutSessions.clear();
      await db.reminders.clear();
      await db.hydrationSettings.clear();
      await db.hydrationLogs.clear();
      await db.telegramSettings.clear();
      
      // Note: We keep exercises as they are base data
      
      alert('✅ Todos os dados foram apagados com sucesso!');
      
      // Reload page to show onboarding again
      window.location.reload();
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('❌ Erro ao apagar dados. Tente novamente.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleDisableTelegram = async () => {
    const confirmed = window.confirm('Deseja desativar as notificações do Telegram?');
    if (!confirmed) return;

    try {
      const settings = await db.telegramSettings.toArray();
      if (settings.length > 0) {
        await db.telegramSettings.update(settings[0].id!, { enabled: false });
      }
    } catch (error) {
      console.error('Error disabling Telegram:', error);
      alert('Erro ao desativar Telegram');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="p-3 sm:p-6 space-y-3 sm:space-y-4 pb-20 max-w-4xl mx-auto animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 rounded-lg bg-primary">
              <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold">Configurações</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Personalize seu app</p>
            </div>
          </div>

          {/* Backend Status */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  {backendOnline ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-orange-500" />}
                </div>
                Status do Servidor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checkingBackend ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Verificando conexão...
                </div>
              ) : backendOnline ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-600">✅ Servidor Online</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Os lembretes funcionarão 24/7 mesmo com o app fechado!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-orange-600">⚠️ Servidor Offline</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Os lembretes NÃO funcionarão com o app fechado. Configure o backend primeiro.
                      </p>
                    </div>
                  </div>
                  <div className="bg-muted/50 border rounded-lg p-3">
                    <p className="text-xs font-semibold mb-2">🚀 Como configurar:</p>
                    <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Leia o arquivo <code className="bg-background px-1 py-0.5 rounded">BACKEND_SETUP.md</code></li>
                      <li>Faça deploy no Railway ou Render (gratuito)</li>
                      <li>Configure a variável <code className="bg-background px-1 py-0.5 rounded">VITE_API_URL</code></li>
                      <li>Rebuild o frontend</li>
                    </ol>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkBackend}
                    className="w-full"
                  >
                    🔄 Verificar Novamente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Telegram Configuration */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Send className="w-4 h-4 text-primary" />
                </div>
                Notificações via Telegram
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Receba seus lembretes e mensagens motivacionais diretamente no Telegram. 
                Mais confiável que notificações web! 🚀
              </p>

              {/* Important Notice */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400">
                      ⚠️ Importante: Mantenha o app aberto!
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Devido a limitações técnicas dos navegadores, os lembretes só funcionam <strong>enquanto o app estiver aberto</strong> (pode estar minimizado).
                    </p>
                  </div>
                </div>
              </div>

              {telegramSettings?.enabled ? (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl">
                    <div className="p-2 rounded-lg bg-green-500/20 flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-semibold text-green-600 mb-1">Telegram Ativo ✓</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Chat ID: {telegramSettings.chatId}</p>
                    </div>
                  </div>

                  {telegramSettings.dailyMotivationEnabled && (
                    <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                      <div className="text-2xl">✨</div>
                      <div className="text-xs sm:text-sm">
                        <span className="font-medium">Mensagem motivacional diária</span>
                        <br />
                        <span className="text-muted-foreground">Todos os dias às {telegramSettings.dailyMotivationTime}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowTelegramConfig(true)}
                    >
                      Reconfigurar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={handleDisableTelegram}
                    >
                      Desativar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-start gap-3 p-4 bg-muted/50 border rounded-xl">
                    <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-semibold mb-1">Telegram não configurado</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Configure para receber notificações confiáveis</p>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    onClick={() => setShowTelegramConfig(true)}
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Configurar Telegram Agora
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* App Info */}
          <Card className="border-0 shadow-lg animate-scale-in">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                </div>
                Como usar os lembretes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold mb-1">📱 Instale como app</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      No menu do navegador, escolha "Instalar app" ou "Adicionar à tela inicial"
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold mb-1">💬 Configure o Telegram</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Siga os passos acima para vincular seu Telegram
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold mb-1">✅ Mantenha o app aberto</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Não precisa ficar na tela, mas mantenha o app rodando em segundo plano (minimizado)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-1">
                      🔋 Dica: Economize bateria
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Conecte o celular na tomada quando for dormir. O app consome muito pouca bateria em segundo plano.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card className="border-0 shadow-lg animate-scale-in">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                Sobre o App
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Dumbbell className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">GymFlow</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Versão 1.0.0</p>
                  <p className="text-xs text-muted-foreground mt-1">Seu companheiro de treinos</p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Desenvolvido por</p>
                <p className="text-sm sm:text-base font-semibold">Matheus do Nascimento Rocha</p>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  © 2026 GymFlow. Todos os direitos reservados.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Support Developer */}
          <Card className="border-0 shadow-lg animate-scale-in bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-primary/10">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                Apoie o Desenvolvedor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm sm:text-base leading-relaxed">
                  Olá! 👋 Se você está gostando do GymFlow, considere fazer uma contribuição via PIX.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Seu apoio me ajuda a comprar <strong>ferramentas de desenvolvimento melhores</strong>, investir em <strong>servidores mais rápidos</strong> e dedicar mais tempo criando recursos incríveis para você! 🚀
                </p>
                <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg p-4">
                  <p className="text-xs font-semibold text-center mb-2 text-pink-600 dark:text-pink-400">
                    ❤️ Cada contribuição faz diferença!
                  </p>
                  <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
                    <strong>Matheus do Nascimento Rocha</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleOpenPix}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold shadow-lg transition-all duration-300"
                  size="lg"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Fazer um PIX ❤️
                </Button>

                <Button
                  onClick={handleCopyPix}
                  variant="outline"
                  className="flex-1 border-pink-500/30 hover:bg-pink-500/10"
                  size="lg"
                >
                  {pixCopied ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Copiar Código
                    </>
                  )}
                </Button>
              </div>

              <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
                Clique em "Fazer um PIX" para tentar abrir no seu app de banco, ou copie o código manualmente
              </p>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-destructive/5 to-destructive/10 animate-scale-in">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-destructive">
                <div className="p-2 rounded-lg bg-destructive/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                Zona de Perigo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-background/50 rounded-xl border border-destructive/20">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                  ⚠️ <strong>Atenção:</strong> Esta ação é permanente e não pode ser desfeita. 
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Todos os seus treinos, rotinas, histórico e lembretes serão perdidos para sempre.
                </p>
              </div>
              
              <Button
                variant="destructive"
                className="w-full h-12"
                onClick={handleClearAllData}
                disabled={isClearing}
              >
                {isClearing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Apagando dados...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Apagar Todos os Dados
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Telegram Config Modal */}
      {showTelegramConfig && (
        <TelegramConfigModal
          onClose={() => setShowTelegramConfig(false)}
          onComplete={() => {
            setShowTelegramConfig(false);
            alert('✅ Telegram configurado com sucesso!');
          }}
        />
      )}
    </>
  );
}
