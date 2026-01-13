# 🚂 Guia Completo: Railway + GitHub Pages

## 💰 **Custo do Railway**

### **Plano Gratuito:**
- ✅ **$1 de crédito grátis por mês**
- ✅ Perfeito para projetos pequenos/testes
- ✅ Backend simples consome ~$0.10-0.50/mês
- ✅ **Pode durar meses sem pagar nada!**

### **Plano Hobby ($5/mês):**
- ✅ **$5 de créditos incluídos**
- ✅ Mais recursos e velocidade
- ✅ Ideal para produção
- ✅ Se usar menos de $5, não paga extra

### **Custo Real:**
Para um backend Flask simples como o seu:
- **Uso estimado:** $0.20 - $1.00/mês
- **Com plano grátis:** Funciona de graça por vários meses
- **Com plano Hobby:** Nunca passa de $5/mês

**Resumo:** Praticamente grátis para projetos pequenos! 🎉

---

## ✅ **GitHub Pages + Railway = Funciona Perfeitamente!**

### **Como Funciona:**

```
┌─────────────────────────────────────────────────┐
│  Usuário acessa GitHub Pages                    │
│  https://dkubitz.github.io/Deal-FiV2/           │
└──────────────────┬──────────────────────────────┘
                   │
                   │ JavaScript no navegador
                   │ faz fetch() para Railway
                   ▼
┌─────────────────────────────────────────────────┐
│  Railway Backend                                │
│  https://deal-fi-backend.railway.app            │
│  └─ Flask server rodando                        │
└─────────────────────────────────────────────────┘
```

**Sim, funciona!** O navegador do usuário faz requisições HTTP diretamente do GitHub Pages para o Railway. Não há bloqueio!

---

## 🚀 **Passo a Passo: Deploy no Railway**

### **1. Criar Conta no Railway**

1. Acesse: https://railway.app
2. Clique em "Login" → "GitHub"
3. Autorize o Railway a acessar seu GitHub

### **2. Criar Novo Projeto**

1. No dashboard, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha seu repositório `Deal-FiV2`
4. Selecione a pasta: `escrow-dapp/ai-agent`

### **3. Configurar Variáveis de Ambiente**

No Railway, vá em **"Variables"** e adicione:

```
OPENAI_API_KEY=sk-sua-chave-aqui
OPENAI_MODEL=gpt-4o
PORT=5000
```

**Importante:** Railway detecta automaticamente a porta, mas defina PORT=5000 mesmo assim.

### **4. Configurar Build e Start**

Railway detecta automaticamente que é Python, mas você pode configurar:

**Build Command (opcional):**
```bash
pip install -r requirements.txt
```

**Start Command:**
```bash
python server.py
```

### **5. Obter URL do Backend**

Após o deploy:
1. Vá em **"Settings"** → **"Domains"**
2. Railway gera uma URL automática: `https://seu-projeto.railway.app`
3. **Copie essa URL!**

### **6. Atualizar Frontend**

No arquivo `escrow-dapp/frontend/index.html`, adicione ANTES do script do chat:

```html
<script>
    // Configurar URL do backend Railway
    window.AI_BACKEND_URL = 'https://seu-projeto.railway.app';
</script>
```

Ou atualize diretamente no `ai-chat-service.js`:

```javascript
// Na linha ~26, substitua:
this.backendUrl = 'https://seu-projeto.railway.app';
this.isAvailable = true;
```

### **7. Fazer Push**

```bash
cd escrow-dapp/frontend
git add .
git commit -m "Configure Railway backend URL"
git push origin main
```

### **8. Testar**

1. Aguarde 2-5 minutos para GitHub Pages atualizar
2. Acesse: https://dkubitz.github.io/Deal-FiV2/
3. Abra o chat e teste!

---

## 🔧 **Configuração Avançada**

### **CORS (Já Configurado!)**

Seu `server.py` já tem:
```python
CORS(app)  # Permite requisições do GitHub Pages
```

✅ Funciona automaticamente!

### **HTTPS Automático**

Railway fornece HTTPS automático! Não precisa configurar nada.

### **Logs**

No Railway dashboard:
- **"Deployments"** → Veja logs do deploy
- **"Metrics"** → Veja uso de recursos
- **"Logs"** → Veja logs em tempo real

---

## 📊 **Monitoramento de Uso**

### **Ver Quanto Está Usando:**

1. Railway Dashboard → **"Usage"**
2. Veja créditos consumidos
3. Configure alertas se quiser

### **Economizar Créditos:**

- Railway pausa serviços inativos automaticamente
- Pode pausar manualmente quando não usar
- Backend simples usa muito pouco

---

## 🆚 **Railway vs Render**

| Aspecto | Railway | Render |
|---------|---------|--------|
| **Plano Grátis** | $1 crédito/mês | 750h grátis/mês |
| **HTTPS** | Automático | Automático |
| **Deploy** | GitHub/Git | GitHub/Git |
| **Facilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Velocidade** | Rápido | Rápido |

**Ambos são ótimos!** Railway é um pouco mais simples.

---

## ⚠️ **Problemas Comuns**

### **1. CORS Error**

**Sintoma:** Erro no console do navegador sobre CORS

**Solução:** Verifique se `CORS(app)` está no `server.py` ✅ (já está!)

### **2. Backend Não Responde**

**Sintoma:** Timeout ou erro 500

**Solução:**
- Verifique logs no Railway
- Confirme que `OPENAI_API_KEY` está configurada
- Verifique se porta está correta

### **3. URL Não Funciona**

**Sintoma:** 404 ou conexão recusada

**Solução:**
- Verifique se o deploy foi bem-sucedido
- Confirme a URL no Railway dashboard
- Teste a URL diretamente no navegador: `https://seu-projeto.railway.app/`

---

## 💡 **Dicas**

### **1. Domínio Customizado (Opcional)**

Railway permite usar seu próprio domínio:
- Settings → Domains → Add Custom Domain
- Configure DNS apontando para Railway

### **2. Variáveis de Ambiente Sensíveis**

Nunca commite `OPENAI_API_KEY` no código!
- Use sempre variáveis de ambiente
- Railway gerencia isso perfeitamente

### **3. Múltiplos Ambientes**

Pode criar:
- `production` (Railway)
- `staging` (outro projeto Railway)
- `local` (seu PC)

---

## 🎯 **Checklist de Deploy**

- [ ] Conta Railway criada
- [ ] Projeto criado e conectado ao GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy bem-sucedido
- [ ] URL do backend copiada
- [ ] Frontend atualizado com URL
- [ ] Push feito no GitHub
- [ ] Testado no GitHub Pages
- [ ] Chat funcionando! 🎉

---

## 📝 **Resumo**

### **Custo:**
- ✅ **Praticamente grátis** para projetos pequenos
- ✅ $1 crédito/mês no plano grátis
- ✅ Backend simples usa ~$0.20-1.00/mês

### **Funciona com GitHub Pages?**
- ✅ **SIM!** Perfeitamente!
- ✅ Navegador faz requisições HTTP diretas
- ✅ CORS já configurado
- ✅ HTTPS automático

### **Tempo de Setup:**
- ⏱️ **5-10 minutos** para configurar
- ⏱️ **2-5 minutos** para deploy
- ⏱️ **Total: ~15 minutos**

**Vale muito a pena!** 🚀

