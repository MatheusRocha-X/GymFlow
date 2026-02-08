# ⚡ Configuração Rápida do Telegram Bot

## 🚀 Para Começar AGORA (5 minutos)

### 1️⃣ Criar o Bot no Telegram

1. Abra o Telegram e procure por **@BotFather**
2. Envie: `/newbot`
3. Nome do bot: `GymFlow Notifications` (ou qualquer nome)
4. Username do bot: `GymFlowBot` (deve terminar com "bot")
5. **Copie o TOKEN que o BotFather enviar** (algo como: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2️⃣ Configurar no Projeto

Edite o arquivo `.env` na raiz do projeto:

```env
VITE_TELEGRAM_BOT_TOKEN=COLE_SEU_TOKEN_AQUI
VITE_TELEGRAM_BOT_USERNAME=GymFlowBot
```

**Exemplo:**
```env
VITE_TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
VITE_TELEGRAM_BOT_USERNAME=GymFlowBot
```

### 3️⃣ Reiniciar o Servidor

```bash
# Pare o servidor (Ctrl+C) e reinicie
npm run dev
```

### 4️⃣ Configurar no App (Como Usuário)

1. Abra o GymFlow no navegador
2. Vá em **Configurações** (último ícone da barra inferior)
3. Clique em **Configurar Telegram**
4. No Telegram, procure por **@userinfobot** ou **@getidsbot**
5. Envie qualquer mensagem para o bot
6. Copie seu **Chat ID** (número que começa com números)
7. Cole no GymFlow
8. Clique em **Testar Conexão**
9. Se receber mensagem no Telegram, clique em **Salvar**

---

## 🏭 Para PRODUÇÃO (Deploy)

### Opção 1: Vercel (Recomendado - GRÁTIS)

1. **Commit seu código:**
   ```bash
   git add .
   git commit -m "Add Telegram bot"
   git push
   ```

2. **Deploy na Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Conecte seu repositório GitHub
   - Configure as variáveis de ambiente no painel da Vercel:
     - `VITE_TELEGRAM_BOT_TOKEN` = seu token
     - `VITE_TELEGRAM_BOT_USERNAME` = username do bot

⚠️ **IMPORTANTE**: O bot token ficará exposto no frontend. Para produção real, use a Opção 2.

### Opção 2: Backend API (Seguro - Recomendado para Produção)

#### Criar API na Vercel:

1. Crie a pasta `api/` na raiz do projeto
2. Crie o arquivo `api/telegram.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chatId, message } = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN; // Agora no servidor!

  if (!botToken || !chatId || !message) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      }
    );

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.description || 'Failed to send message');
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Telegram API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

3. **Instale as dependências da Vercel:**
   ```bash
   npm install @vercel/node
   ```

4. **Atualize o `src/lib/telegram.ts`** para usar a API:

```typescript
// Em vez de chamar a API do Telegram diretamente:
const response = await fetch(`${this.apiUrl}${botToken}/sendMessage`, { ... });

// Use sua API serverless:
const response = await fetch('/api/telegram', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId: config.chatId,
    message: message
  })
});
```

5. **Configure na Vercel:**
   - Variável de ambiente: `TELEGRAM_BOT_TOKEN` (SEM o prefixo VITE_)
   - Esta variável fica APENAS no servidor, não exposta ao frontend

---

## 🧪 Testar Localmente

### Teste Manual via cURL:

```bash
# Substitua SEU_TOKEN e SEU_CHAT_ID
curl -X POST "https://api.telegram.org/botSEU_TOKEN/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "SEU_CHAT_ID", "text": "Teste do GymFlow! 💪"}'
```

### Teste no PowerShell:

```powershell
$token = "SEU_TOKEN"
$chatId = "SEU_CHAT_ID"
$url = "https://api.telegram.org/bot$token/sendMessage"
$body = @{
    chat_id = $chatId
    text = "Teste do GymFlow! 💪"
} | ConvertTo-Json

Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
```

---

## 📋 Checklist Rápido

- [ ] Criar bot no @BotFather
- [ ] Copiar token do bot
- [ ] Colar no arquivo `.env`
- [ ] Reiniciar servidor (`npm run dev`)
- [ ] Obter Chat ID no @userinfobot
- [ ] Configurar no app (Configurações → Telegram)
- [ ] Testar conexão
- [ ] Criar um lembrete de teste
- [ ] Verificar se recebeu no Telegram

---

## ❓ Problemas Comuns

### "Bot token not configured"
- Verifique se o arquivo `.env` está na raiz do projeto
- Certifique-se que o nome da variável está correto: `VITE_TELEGRAM_BOT_TOKEN`
- Reinicie o servidor de desenvolvimento

### "Failed to send message"
- Verifique se o Chat ID está correto
- Certifique-se que já enviou uma mensagem para o bot
- Teste o token manualmente com cURL

### "Forbidden"
- O usuário precisa iniciar conversa com o bot primeiro
- Procure pelo username do seu bot no Telegram e envie `/start`

---

## 🎯 Próximos Passos

Depois de configurar:

1. ✅ Teste criando lembretes diferentes
2. ✅ Configure a mensagem motivacional diária
3. ✅ Personalize os horários
4. ✅ Faça deploy na Vercel ou Netlify

**Pronto! Seu sistema de notificações via Telegram está funcionando!** 🚀
