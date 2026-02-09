# 🚀 Deploy Completo no Vercel (Frontend + Backend)

## ✅ VANTAGENS

- **Frontend + Backend juntos** no mesmo projeto
- **Deploy automático** com cada push no GitHub
- **100% Gratuito** (Hobby plan)
- **HTTPS** automático
- **Cron jobs** nativos do Vercel

---

## 📋 PASSO A PASSO

### 1. Preparar o Repositório

```bash
# Certifique-se de que tudo está commitado
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

### 2. Deploy do Backend

#### A. Acessar Vercel
- Vá para: https://vercel.com
- Login com GitHub
- Clique em **"Add New..."** → **"Project"**

#### B. Importar Repositório
- Selecione o repositório `GymAPP`
- **Framework Preset**: Vite
- **Root Directory**: Deixe em branco (raiz)

#### C. Configurar Build Settings

**Build & Development Settings:**
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install

Root Directory: (deixar vazio)
```

**Environment Variables:**

Adicione estas variáveis:

1. `TELEGRAM_BOT_TOKEN`
   - Valor: Seu token do @BotFather
   - Scope: Production, Preview, Development

2. `CRON_SECRET`
   - Valor: Uma senha aleatória (ex: `meu-secret-123`)
   - Scope: Production, Preview, Development

3. `VITE_API_URL`
   - Valor: `https://seu-projeto.vercel.app`
   - Scope: Production, Preview, Development
   - ⚠️ **IMPORTANTE**: Você receberá essa URL após o primeiro deploy!

#### D. Deploy!
- Clique em **"Deploy"**
- Aguarde 2-3 minutos
- Anote a URL (ex: `https://gym-app-xyz.vercel.app`)

### 3. Configurar a URL da API

Após o primeiro deploy:

1. Vá em **"Settings"** → **"Environment Variables"**
2. Edite `VITE_API_URL`
3. Coloque a URL do seu projeto: `https://gym-app-xyz.vercel.app`
4. Salve
5. Vá em **"Deployments"**
6. Clique em "..." no último deploy → **"Redeploy"**

### 4. Testar

#### Frontend
```
https://seu-projeto.vercel.app
```

#### Backend API
```
https://seu-projeto.vercel.app/api
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "GymApp Backend Running",
  "reminders": 0,
  "users": 0
}
```

#### Cron Job
```
https://seu-projeto.vercel.app/api/cron
```

⚠️ Ao acessar diretamente, retornará "Unauthorized". Isso é normal - o cron é executado automaticamente pelo Vercel a cada minuto.

---

## 🔧 ESTRUTURA DO PROJETO

```
GymAPP/
├── src/                    # Frontend (Vite + React)
├── public/                 # Assets estáticos
├── server/
│   ├── api/
│   │   ├── index.js       # API principal (rotas)
│   │   └── cron.js        # Endpoint para cron jobs
│   ├── vercel.json        # Config do Vercel
│   └── package.json
├── dist/                   # Build do frontend (gerado)
└── vercel.json            # Config global (se houver)
```

---

## ⚙️ COMO FUNCIONA

### Frontend (Vite)
- Vercel detecta automaticamente
- Build: `npm run build` → gera `dist/`
- Servido como site estático

### Backend (Serverless Functions)
- Arquivos em `server/api/` viram endpoints
- `server/api/index.js` → `https://seu-app.vercel.app/api`
- `server/api/cron.js` → `https://seu-app.vercel.app/api/cron`

### Cron Jobs
```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "* * * * *"  // A cada minuto
    }
  ]
}
```

Vercel chama `/api/cron` automaticamente a cada minuto.

---

## 🔐 SEGURANÇA

### Proteger endpoint do cron

O endpoint `/api/cron` verifica o header `Authorization`:

```javascript
const authHeader = req.headers.authorization;
const expectedAuth = process.env.CRON_SECRET;

if (authHeader !== `Bearer ${expectedAuth}`) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

Apenas o Vercel Cron (que passa o token correto automaticamente) consegue executar.

---

## 🐛 TROUBLESHOOTING

### "Backend não disponível"

1. Verifique se `VITE_API_URL` está configurado:
   ```
   VITE_API_URL=https://seu-projeto.vercel.app
   ```

2. Redeploy após adicionar a variável

3. Teste a API:
   ```bash
   curl https://seu-projeto.vercel.app/api
   ```

### Lembretes não chegam

1. Verifique se `TELEGRAM_BOT_TOKEN` está configurado
2. Verifique os logs:
   - Vercel Dashboard → Seu projeto → **"Logs"**
   - Veja se o cron está rodando a cada minuto
   - Verifique erros

3. Teste manualmente (com Bearer token):
   ```bash
   curl -H "Authorization: Bearer seu-cron-secret" \
     https://seu-projeto.vercel.app/api/cron
   ```

### Cron not running

1. **Hobby Plan**: Cron só funciona em plano pago
2. **Solução gratuita**: Use https://cron-job.org
   - Configure para chamar `https://seu-app.vercel.app/api/cron`
   - Header: `Authorization: Bearer seu-secret`
   - Frequência: A cada 1 minuto

---

## 💰 CUSTOS

### Vercel Hobby (Gratuito)
- ✅ 100GB bandwidth/mês
- ✅ Builds ilimitados
- ✅ Serverless functions
- ❌ Cron jobs (requer Pro)

### Vercel Pro ($20/mês)
- ✅ Tudo do Hobby
- ✅ **Cron jobs nativos**
- ✅ Mais bandwidth
- ✅ Analytics avançado

### Solução 100% Gratuita
- **Frontend + API**: Vercel Hobby
- **Cron**: cron-job.org (gratuito)

---

## 🔄 ATUALIZAÇÕES AUTOMÁTICAS

Toda vez que você fizer push no GitHub:
```bash
git add .
git commit -m "Update feature"
git push
```

Vercel automaticamente:
1. Detecta o push
2. Faz rebuild
3. Deploy em produção
4. URL permanece a mesma

---

## 📊 MONITORAMENTO

### Logs em Tempo Real
1. Acesse Vercel Dashboard
2. Seu projeto → **"Logs"**
3. Filtre por:
   - `/api` - Ver chamadas da API
   - `/api/cron` - Ver execuções do cron

### Analytics
- Dashboard → Seu projeto → **"Analytics"**
- Métricas de uso, performance, erros

---

## ✅ CHECKLIST FINAL

- [ ] Repositório no GitHub atualizado
- [ ] Projeto criado no Vercel
- [ ] `TELEGRAM_BOT_TOKEN` configurado
- [ ] `CRON_SECRET` configurado
- [ ] `VITE_API_URL` configurado (após primeiro deploy)
- [ ] Redesployado após adicionar `VITE_API_URL`
- [ ] API testada (`/api` retorna "ok")
- [ ] Frontend abrindo corretamente
- [ ] Telegram configurado no app
- [ ] Lembrete de teste criado
- [ ] Lembrete recebido no Telegram! 🎉

---

## 🎉 PRONTO!

Seu GymApp está rodando 100% na nuvem!

**URLs:**
- App: `https://seu-projeto.vercel.app`
- API: `https://seu-projeto.vercel.app/api`

**Funcionamento:**
- ✅ Frontend servido globalmente (CDN)
- ✅ Backend serverless (escala automaticamente)
- ✅ Lembretes verificados a cada minuto
- ✅ Mensagens motivacionais diárias
- ✅ Tudo gratuito (ou $20/mês para cron nativo)

---

**Desenvolvido por:** Matheus do Nascimento Rocha
**Data:** Fevereiro 2026
