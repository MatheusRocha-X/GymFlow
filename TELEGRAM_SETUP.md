# Telegram Integration Guide

## Configurando o Bot do Telegram

### 1. Criar um Bot no Telegram

1. Abra o Telegram e procure por `@BotFather`
2. Envie o comando `/newbot`
3. Siga as instruções:
   - Escolha um nome para seu bot (ex: "GymFlow Notifications")
   - Escolha um username único que termine com "bot" (ex: "GymFlowNotificationsBot")
4. O BotFather enviará seu **Bot Token** - guarde-o com segurança!

### 2. Configurar as Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edite o arquivo `.env` e adicione seu Bot Token:
   ```
   VITE_TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   VITE_TELEGRAM_BOT_USERNAME=GymFlowNotificationsBot
   ```

### 3. Configurar no App (Para Usuários)

Cada usuário do app precisa configurar seu próprio Chat ID:

1. Abra o GymFlow
2. Vá em **Configurações**
3. Clique em **Configurar Telegram**
4. Siga as instruções na tela:
   - Abra o `@userinfobot` ou `@getidsbot` no Telegram
   - Envie qualquer mensagem
   - Copie seu **Chat ID**
   - Cole no campo de configuração do GymFlow
   - Clique em **Testar Conexão**
   - Se funcionar, clique em **Salvar e Ativar**

### 4. Recursos Disponíveis

✅ **Lembretes via Telegram**
- Receba todos os seus lembretes diretamente no Telegram
- Mais confiável que notificações web
- Funciona mesmo com o app fechado

✅ **Mensagens Motivacionais Diárias**
- Receba uma frase motivacional toda manhã
- Configurável para o horário que você preferir
- Automático e personalizado

✅ **Lembretes de Hidratação**
- Receba lembretes para beber água
- Com emojis e mensagens amigáveis

✅ **Lembretes de Treino**
- Não esqueça seus treinos
- Notificações pontuais

### Segurança

⚠️ **IMPORTANTE:**
- Nunca compartilhe seu Bot Token
- Use variáveis de ambiente para o token
- Em produção, armazene o token no backend, não no frontend
- O Chat ID do usuário é armazenado apenas localmente no dispositivo

### Implementação para Produção

Para um ambiente de produção seguro:

1. **Crie um Backend/Serverless Function:**
   ```javascript
   // API endpoint: /api/send-telegram
   export async function POST(request) {
     const { chatId, message } = await request.json();
     const botToken = process.env.TELEGRAM_BOT_TOKEN; // Armazenado no servidor
     
     const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         chat_id: chatId,
         text: message,
         parse_mode: 'Markdown'
       })
     });
     
     return response.json();
   }
   ```

2. **Atualize o telegram.ts:**
   ```typescript
   // Em vez de usar o token diretamente:
   const response = await fetch('/api/send-telegram', {
     method: 'POST',
     body: JSON.stringify({
       chatId: config.chatId,
       message: message
     })
   });
   ```

### Opções de Deploy

**Opção 1: Vercel Serverless Functions**
- Crie `/api/send-telegram.ts` na pasta `api/`
- Configure a env var no painel da Vercel
- Automático e gratuito (limite de 100GB de uso)

**Opção 2: Netlify Functions**
- Crie `/netlify/functions/send-telegram.js`
- Configure a env var no painel da Netlify
- Simples e direto

**Opção 3: Backend Node.js**
- Crie uma API REST com Express
- Proteja com autenticação
- Mais controle e flexibilidade

### Testes

Para testar o bot manualmente:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "<YOUR_CHAT_ID>", "text": "Teste do GymFlow!"}'
```

### Troubleshooting

**Problema: "Bot token not configured"**
- Verifique se o `.env` está correto
- Reinicie o servidor de desenvolvimento

**Problema: "Failed to send message"**
- Verifique se o Chat ID está correto
- Confirme que iniciou conversa com o bot
- Teste o bot token manualmente

**Problema: "Forbidden"**
- O usuário precisa iniciar conversa com o bot primeiro
- Envie qualquer mensagem para o bot no Telegram

### Comandos Úteis do BotFather

- `/setdescription` - Definir descrição do bot
- `/setabouttext` - Texto sobre o bot
- `/setuserpic` - Foto do bot
- `/setcommands` - Comandos disponíveis 
- `/deletebot` - Deletar o bot

Exemplo de comandos para configurar:
```
start - Iniciar notificações do GymFlow
help - Ajuda e informações
stop - Parar notificações
```
