# GymFlow 💪

Aplicativo PWA completo para gerenciamento de treinos de academia, focado em mobile-first e funcionamento offline.

## ✨ Funcionalidades

### ✅ Implementadas
- 📱 **PWA Instalável** - Funciona offline com service worker
- 🏋️ **Biblioteca de 50+ Exercícios** - Com instruções detalhadas, músculos e equipamentos
- 📋 **Criação de Rotinas** - Crie treinos personalizados com múltiplos dias
- 💪 **Realizar Treinos** - Timer, descanso entre séries, registro de peso/reps
- 📊 **Histórico Completo** - Todos os treinos salvos localmente
- 📈 **Progresso & Gráficos** - Volume por músculo, evolução do peso
- 🧮 **Calculadora de 1RM** - Estimativa de carga máxima
- 🌙 **Dark Mode** - Interface escura por padrão
- 💾 **100% Offline** - Tudo salvo no IndexedDB

### 🎯 Tecnologias
- React 18 + TypeScript
- Vite
- Tailwind CSS 3
- Zustand (state management com persist)
- Dexie.js (IndexedDB wrapper)
- vite-plugin-pwa
- Recharts (gráficos)
- date-fns
- lucide-react (ícones)

## 🚀 Como Usar

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
```

### Preview da Build
```bash
npm run preview
```

## 📱 Instalando como PWA

1. Abra o app no navegador
2. Clique no banner "Instalar GymFlow"
3. Ou use o menu do navegador → "Instalar aplicativo"
4. Pronto! Agora funciona como app nativo

## 🎨 Páginas

- **Início** - Dashboard com stats e início rápido
- **Treinos** - Gerenciar rotinas e iniciar treinos
- **Exercícios** - Biblioteca completa com busca e filtros
- **Histórico** - Todos os treinos realizados
- **Progresso** - Gráficos, medidas corporais, 1RM

## 🔋 Features Offline

- Todos os dados salvos localmente
- Funciona sem internet
- Service Worker para cache de assets
- Notificações (quando implementadas)

## 📝 Próximas Features

- [ ] Sistema de lembretes com notificações
- [ ] Fotos de progresso
- [ ] Exportar/importar dados
- [ ] Sync multi-dispositivo (opcional com Supabase)
- [ ] Templates de treino prontos
- [ ] Mais exercícios (meta: 200+)

## 🏗️ Estrutura do Projeto

```
src/
├── components/        # Componentes reutilizáveis
│   ├── ui/           # Componentes base (Button, Card, etc)
│   ├── BottomNav.tsx
│   ├── ActiveWorkout.tsx
│   └── CreateRoutineModal.tsx
├── pages/            # Páginas principais
│   ├── HomePage.tsx
│   ├── WorkoutsPage.tsx
│   ├── ExercisesPage.tsx
│   ├── HistoryPage.tsx
│   └── ProgressPage.tsx
├── lib/              # Utilitários e lógica
│   ├── db.ts         # Dexie database + seed
│   ├── utils.ts      # Funções helper
│   └── stores/       # Zustand stores
└── App.tsx           # App principal
```

## 🎯 Como Usar o App

### Criar uma Rotina
1. Vá em "Treinos"
2. Clique em "Nova Rotina"
3. Dê um nome (ex: PPL, Full Body)
4. Adicione dias de treino
5. Selecione exercícios para cada dia
6. Configure séries, reps e descanso

### Realizar um Treino
1. Na página "Início" ou "Treinos"
2. Clique em "Iniciar" na rotina desejada
3. Registre peso e reps para cada série
4. Marque como completo ✓
5. Timer de descanso inicia automaticamente
6. Finalize e salve o treino

### Ver Progresso
1. Vá em "Progresso"
2. Veja gráficos de volume por músculo
3. Acompanhe evolução do peso corporal
4. Use a calculadora de 1RM

---

**Desenvolvido com ❤️ para quem treina sério!**
