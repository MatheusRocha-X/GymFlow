# ⚡ Deploy do Backend - GymApp

## 🎯 Objetivo
Backend que roda 24/7 na nuvem para enviar lembretes mesmo com o app fechado.

---

## 🚀 Opção 1: Deploy no Railway (Recomendado - Mais Fácil)

### 1. Criar conta no Railway
- Acesse: https://railway.app
- Faça login com GitHub

### 2. Deploy Automático
```bash
# No terminal, dentro da pasta server/
npm install

# Fazer commit das mudanças
git add .
git commit -m "Add backend server"
git push
```

### 3. Configurar no Railway
1. Clique em **"New Project"**
2. Escolha **"Deploy from GitHub repo"**
3. Selecione seu repositório `GymAPP`
4. Railway detectará automaticamente o Node.js

### 4. Adicionar Variável de Ambiente
1. No projeto Railway, vá em **"Variables"**
2. Adicione:
   ```
   TELEGRAM_BOT_TOKEN=seu_token_aqui
   ```
3. Clique em **"Add"**

### 5. Deploy!
- Railway fará deploy automaticamente
- Você receberá uma URL tipo: `https://gymapp-production.up.railway.app`

**✅ Pronto! Seu backend está rodando 24/7 gratuitamente!**

---

## 🚀 Opção 2: Deploy no Render

### 1. Criar conta no Render
- Acesse: https://render.com
- Faça login com GitHub

### 2. Criar Web Service
1. Clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: `gymapp-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

### 3. Adicionar Variável de Ambiente
1. Na página do serviço, vá em **"Environment"**
2. Adicione:
   ```
   TELEGRAM_BOT_TOKEN=seu_token_aqui
   ```

### 4. Deploy
- Render fará deploy automaticamente
- URL tipo: `https://gymapp-backend.onrender.com`

---

## 🚀 Opção 3: Deploy no Vercel (Serverless)

**⚠️ ATENÇÃO:** Vercel usa funções serverless (não mantém estado em memória).
Você precisará adicionar um banco de dados (MongoDB, PostgreSQL, etc.).

### Para usar Vercel (avançado):
1. Instalar Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd server
vercel --prod
```

3. Adicionar variáveis:
```bash
vercel env add TELEGRAM_BOT_TOKEN
```

**Limitação:** Cron jobs não funcionam nativamente no Vercel.
Você precisará usar **Vercel Cron** ou serviços externos como **cron-job.org**.

---

## 📝 Após o Deploy

### 1. Teste seu backend
Acesse a URL do deploy (ex: `https://seu-app.railway.app/`)

Você deve ver:
```json
{
  "status": "ok",
  "message": "GymApp Backend Running",
  "reminders": 0,
  "users": 0
}
```

### 2. Configure o Frontend
No arquivo `src/lib/notifications.ts`, adicione a URL da API:

```typescript
const API_URL = 'https://seu-app.railway.app';
```

### 3. Teste um lembrete
Crie um lembrete no app e aguarde o horário configurado.

---

## 🔑 Como Obter o TELEGRAM_BOT_TOKEN

1. Abra o Telegram
2. Procure por `@BotFather`
3. Envie `/newbot`
4. Escolha um nome (ex: GymApp Bot)
5. Escolha um username (ex: @gymapp_reminders_bot)
6. Copie o token que aparecer (tipo: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

---

## 💰 Custos

| Plataforma | Tier Gratuito | Limitações |
|------------|---------------|------------|
| **Railway** | $5 crédito/mês | 500h execução, depois $0.000231/min |
| **Render** | Ilimitado | Dorme após 15min inatividade |
| **Vercel** | Ilimitado | Serverless (requer banco externo) |

**Recomendação:** Railway (mais simples) ou Render (totalmente gratuito).

---

## 🐛 Troubleshooting

### Lembretes não chegam
1. Verifique se o backend está rodando:
   ```
   curl https://seu-app.railway.app/
   ```
2. Verifique os logs no Railway/Render
3. Confirme que `TELEGRAM_BOT_TOKEN` está configurado

### Backend para de funcionar
- **Render:** Normal, ele "dorme" após 15min sem uso. Acorde com um ping:
  ```bash
  # Use cron-job.org para pingar a cada 10 minutos
  curl https://seu-app.onrender.com/
  ```

### Erro "TELEGRAM_BOT_TOKEN não configurado"
- Adicione a variável de ambiente no painel do Railway/Render

---

## 📊 Monitoramento

### Logs em Tempo Real

**Railway:**
```bash
railway logs
```

**Render:**
- Acesse o dashboard → Seu serviço → Logs

---

## 🎯 Próximos Passos (Opcional)

### 1. Adicionar Banco de Dados
Para persistir dados entre restarts:
- MongoDB Atlas (gratuito)
- PostgreSQL no Railway/Render

### 2. Adicionar Autenticação
Proteger API com JWT tokens

### 3. Sincronização
Sincronizar lembretes entre dispositivos

---

**✅ Seu backend está pronto para rodar 24/7!**

Agora os lembretes funcionarão **mesmo com o app fechado**! 🎉
