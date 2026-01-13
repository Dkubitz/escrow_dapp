# 🚀 Guia Simples de Deploy - Deal-Fi

## 📋 O Que Você Precisa Saber

**Resumo em 3 linhas:**
1. **Frontend** (site) → Vercel (grátis, fácil)
2. **AI Agent** (chat GPT) → Railway (quase grátis, fácil)
3. **Smart Contracts** → Já estão na blockchain Polygon (não precisa deploy)

---

## 🎯 Estrutura do Projeto

```
Deal-Fi/
├── escrow-dapp/
│   ├── frontend/     → Vai para VERCEL
│   ├── ai-agent/    → Vai para RAILWAY
│   └── backend/      → Smart contracts (já deployados na Polygon)
```

---

## 📦 PARTE 1: Deploy do Frontend no Vercel

### Passo 1: Criar Conta no Vercel
1. Acesse: https://vercel.com
2. Clique em "Sign Up" → "Continue with GitHub"
3. Autorize o Vercel a acessar seu GitHub

### Passo 2: Criar Projeto
1. No dashboard do Vercel, clique em **"Add New..."** → **"Project"**
2. Selecione seu repositório do GitHub
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `escrow-dapp/frontend`
   - **Build Command**: (deixe vazio)
   - **Output Directory**: `.` (ponto)
4. Clique em **"Deploy"**

### Passo 3: Aguardar Deploy
- Vercel vai fazer o deploy automaticamente
- Você receberá uma URL tipo: `https://seu-projeto.vercel.app`
- ✅ **Pronto! Frontend no ar!**

---

## 🤖 PARTE 2: Deploy do AI Agent no Railway

### Passo 1: Criar Conta no Railway
1. Acesse: https://railway.app
2. Clique em "Login" → "GitHub"
3. Autorize o Railway a acessar seu GitHub

### Passo 2: Criar Projeto
1. No dashboard, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha seu repositório
4. Railway vai detectar automaticamente

### Passo 3: Configurar Root Directory
1. No projeto criado, vá em **"Settings"**
2. Em **"Source"**, configure:
   - **Root Directory**: `escrow-dapp/ai-agent`
3. Salve

### Passo 4: Configurar Variáveis de Ambiente
1. Vá em **"Variables"**
2. Adicione:
   ```
   OPENAI_API_KEY=sua-chave-aqui
   OPENAI_MODEL=gpt-4o
   PORT=5000
   ```
3. Salve

### Passo 5: Aguardar Deploy
- Railway vai fazer o deploy automaticamente
- Você receberá uma URL tipo: `https://seu-projeto.up.railway.app`
- ✅ **Pronto! Backend no ar!**

---

## 🔗 PARTE 3: Conectar Frontend com Backend

### Passo 1: Copiar URL do Railway
- No Railway, vá em **"Settings"** → **"Domains"**
- Copie a URL gerada (ex: `https://seu-projeto.up.railway.app`)

### Passo 2: Atualizar Frontend
1. Abra o arquivo: `escrow-dapp/frontend/index.html`
2. Encontre a linha ~104 (onde tem o comentário sobre Railway)
3. Adicione ANTES do script do chat:

```html
<script>
    // URL do backend Railway
    window.AI_BACKEND_URL = 'https://SUA-URL-DO-RAILWAY.up.railway.app';
</script>
```

4. Salve e faça commit:
```bash
git add escrow-dapp/frontend/index.html
git commit -m "Configure Railway backend URL"
git push
```

### Passo 3: Aguardar Deploy Automático
- Vercel vai detectar o push e fazer deploy automático
- ✅ **Pronto! Tudo conectado!**

---

## ✅ Checklist Final

- [ ] Frontend deployado no Vercel
- [ ] AI Agent deployado no Railway
- [ ] Variáveis de ambiente configuradas no Railway
- [ ] URL do Railway adicionada no `index.html`
- [ ] Commit e push feitos
- [ ] Testado no navegador (chat funcionando)

---

## 💰 Custos

### Vercel
- ✅ **Grátis** para projetos pessoais
- Sem limites razoáveis para seu projeto

### Railway
- ✅ **$1 crédito grátis/mês** (plano free)
- Seu backend usa ~$0.20-1.00/mês
- **Praticamente grátis!**

---

## 🆘 Problemas Comuns

### Chat não funciona
- Verifique se `window.AI_BACKEND_URL` está configurado
- Verifique se a URL do Railway está correta
- Abra o console do navegador (F12) e veja erros

### Backend não responde
- Verifique logs no Railway
- Confirme que `OPENAI_API_KEY` está configurada
- Teste a URL diretamente: `https://sua-url.railway.app/`

### Frontend não atualiza
- Vercel faz deploy automático em ~2 minutos
- Verifique se o commit foi feito corretamente
- Force um redeploy no Vercel se necessário

---

## 📝 Resumo

**1 repo GitHub → 2 deploys:**
- Vercel (frontend) → Site estático
- Railway (ai-agent) → API Flask

**Tempo total:** ~15-20 minutos

**Custo:** Praticamente grátis! 🎉
