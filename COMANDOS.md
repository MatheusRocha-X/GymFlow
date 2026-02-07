# 🛠️ Comandos Úteis - GymFlow

## 📦 NPM Scripts

### Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento (hot reload)
npm run dev

# Acessa em: http://localhost:5173 (ou próxima porta disponível)
```

### Build
```bash
# Build para produção
npm run build

# Preview da build (testar antes de deploy)
npm run preview

# Build + Preview em um comando
npm run build && npm run preview
```

### Linting
```bash
# Verificar erros de lint
npm run lint

# Auto-fix (se configurado)
npm run lint -- --fix
```

### Type Checking
```bash
# Verificar tipos TypeScript
npx tsc --noEmit
```

## 🔧 Comandos Úteis do Sistema

### Git
```bash
# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "🎉 Initial commit - GymFlow PWA"

# Criar branch de desenvolvimento
git checkout -b develop

# Push para GitHub
git remote add origin <seu-repo>
git push -u origin main
```

### Limpeza
```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpar cache do Vite
rm -rf .vite

# Limpar build
rm -rf dist
```

## 🗃️ Banco de Dados (IndexedDB)

### Via DevTools (Chrome/Edge)

1. Abrir DevTools (F12)
2. Application → Storage → IndexedDB → GymFlowDB
3. Ver tabelas: exercises, workoutRoutines, etc.

### Limpar dados no navegador
```javascript
// No console do navegador:

// Deletar todo o banco
indexedDB.deleteDatabase('GymFlowDB');

// Depois recarregue a página (F5)
```

### Backup manual
```javascript
// No console do navegador:

// Exportar exercícios
await db.exercises.toArray().then(data => {
  console.log(JSON.stringify(data, null, 2));
  // Copie o resultado
});

// Exportar rotinas
await db.workoutRoutines.toArray().then(data => {
  console.log(JSON.stringify(data, null, 2));
});
```

## 🌐 PWA - Service Worker

### Limpar cache do Service Worker
```javascript
// No console do navegador:

// Desregistrar service worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});

// Limpar cache
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});

// Depois recarregue a página (Ctrl+Shift+R)
```

### Forçar atualização do SW
```bash
# Durante desenvolvimento, use Shift+F5 ou Ctrl+Shift+R
# Ou no DevTools: Application → Service Workers → Update
```

## 📱 Testar PWA no Mobile

### Android (Chrome)
```bash
# 1. Encontre seu IP local
ipconfig  # Windows

# 2. Inicie o dev server com --host
npm run dev -- --host

# 3. Acesse no celular: http://SEU_IP:5173
```

### iOS (Safari)
- Mesmo processo
- Atenção: iOS tem algumas limitações com PWA

### Testar instalação
1. Abra no navegador mobile
2. Menu → "Instalar aplicativo" ou "Add to Home Screen"
3. App aparece como ícone nativo

## 🐛 Debug

### Ver logs do Service Worker
```bash
Chrome: chrome://serviceworker-internals/
Edge: edge://serviceworker-internals/
```

### Lighthouse (Performance)
```bash
# Chrome DevTools: Tab Lighthouse
# Ou via CLI:
npm install -g lighthouse
lighthouse http://localhost:5173 --view
```

### Network throttling
```bash
# DevTools → Network → Throttling
# Teste com "Slow 3G" para simular conexão ruim
```

## 🚀 Deploy

### Netlify
```bash
# 1. Build
npm run build

# 2. Instalar Netlify CLI
npm install -g netlify-cli

# 3. Deploy
netlify deploy --prod
```

### Vercel
```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod
```

### GitHub Pages
```bash
# 1. Instalar gh-pages
npm install -D gh-pages

# 2. Adicionar no package.json:
"homepage": "https://seu-usuario.github.io/gymflow",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# 3. Deploy
npm run deploy
```

## 📊 Análise de Bundle

```bash
# Analisar tamanho do bundle
npm run build -- --mode analyze

# Ou instalar plugin
npm install -D rollup-plugin-visualizer
```

## 🔒 Segurança

```bash
# Verificar vulnerabilidades
npm audit

# Corrigir automaticamente (se possível)
npm audit fix

# Ver outdated packages
npm outdated

# Atualizar pacotes
npm update
```

## 🎨 Ícones PWA (Produção)

```bash
# Instalar pwa-asset-generator
npm install -g pwa-asset-generator

# Gerar ícones a partir de um logo SVG
pwa-asset-generator logo.svg ./public \
  --icon-only \
  --background "#0f172a" \
  --padding "20%" \
  --path-override ""

# Gerar splash screens também
pwa-asset-generator logo.svg ./public \
  --background "#0f172a" \
  --padding "20%"
```

## 📝 Adicionar Mais Exercícios

### Método 1: Via código
```typescript
// Edite src/lib/db.ts, adicione no array seedExercises

{
  name: 'Supino Inclinado com Barra',
  primaryMuscle: 'Peito',
  secondaryMuscles: ['Ombros', 'Tríceps'],
  type: 'compound',
  equipment: 'Barra',
  instructions: [
    'Ajuste o banco em 30-45 graus',
    'Segure a barra na largura dos ombros',
    'Desça controladamente até o peito',
    'Empurre de volta até estender os braços'
  ],
  tips: [
    'Não arquear demais as costas',
    'Contraia o peito no topo'
  ]
}
```

### Método 2: Via console (temporário)
```javascript
// No console do navegador:

await db.exercises.add({
  name: 'Novo Exercício',
  primaryMuscle: 'Peito',
  secondaryMuscles: ['Ombros'],
  type: 'compound',
  equipment: 'Barra',
  instructions: ['Passo 1', 'Passo 2'],
  tips: ['Dica 1'],
  isCustom: true
});
```

## 🔄 Resetar App (Desenvolvimento)

```bash
# Resetar tudo
rm -rf node_modules dist .vite package-lock.json
npm install
npm run dev

# No navegador:
# - Limpar IndexedDB
# - Limpar Service Worker
# - Limpar cache
# - Hard reload (Ctrl+Shift+R)
```

## 📐 Estrutura de Componente Padrão

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  title: string;
  onAction: () => void;
}

export default function MeuComponente({ title, onAction }: Props) {
  const [state, setState] = useState(false);

  return (
    <Card>
      <CardContent>
        <h2>{title}</h2>
        <Button onClick={onAction}>Ação</Button>
      </CardContent>
    </Card>
  );
}
```

## 🎯 Hotkeys (Atalhos)

Durante desenvolvimento:
- `Ctrl/Cmd + S` - Salvar (hot reload automático)
- `F5` - Reload página
- `Ctrl/Cmd + Shift + R` - Hard reload (limpa cache)
- `F12` - DevTools

No App (futuro):
- `Space` - Pausar timer
- `Enter` - Completar série
- `→` - Próximo exercício
- `←` - Exercício anterior

---

**Comandos prontos para copiar e usar! 🚀**
