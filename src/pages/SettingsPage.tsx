import { useState } from 'react';
import { Settings as SettingsIcon, Trash2, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';
import { useNavigation } from '@/lib/stores/app-store';

export default function SettingsPage() {
  const [isClearing, setIsClearing] = useState(false);
  const { setView } = useNavigation();

  const handleClearAllData = async () => {
    const confirmed = window.confirm(
      '⚠️ ATENÇÃO!\n\nIsto irá apagar TODOS os seus dados:\n• Rotinas de treino\n• Histórico de treinos\n• Lembretes\n• Configurações de hidratação\n• Logs de água\n\nEsta ação NÃO pode ser desfeita!\n\nDeseja realmente continuar?'
    );

    if (!confirmed) return;

    // Double confirmation for safety
    const doubleConfirm = window.confirm(
      'Tem certeza absoluta?\n\nÚltima chance antes de apagar tudo!'
    );

    if (!doubleConfirm) return;

    setIsClearing(true);

    try {
      // Clear all tables
      await db.workoutRoutines.clear();
      await db.workoutSessions.clear();
      await db.reminders.clear();
      await db.hydrationSettings.clear();
      await db.hydrationLogs.clear();
      
      // Note: We keep exercises as they are base data
      
      alert('✅ Todos os dados foram apagados com sucesso!');
      
      // Navigate to home
      setView('home');
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('❌ Erro ao apagar dados. Tente novamente.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie seu aplicativo</p>
        </div>
      </div>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5" />
            Sobre o App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-semibold text-lg">GymFlow</p>
            <p className="text-sm text-muted-foreground">Versão 1.0.0</p>
          </div>
          <div className="pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground mb-1">Desenvolvido por</p>
            <p className="font-medium">Matheus do Nascimento Rocha</p>
          </div>
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              © 2026 GymFlow. Todos os direitos reservados.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Zona de Perigo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Esta ação é permanente e não pode ser desfeita. Todos os seus dados serão perdidos.
            </p>
            
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleClearAllData}
              disabled={isClearing}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isClearing ? 'Apagando...' : 'Apagar Todos os Dados'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recursos do App</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Criação de rotinas personalizadas de treino</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Biblioteca com 220+ exercícios</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Acompanhamento de treinos em tempo real</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Histórico completo de treinos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Sistema de lembretes e hidratação</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Funciona offline (PWA)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Gráficos de progresso e estatísticas</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
