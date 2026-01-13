# 🤖 Como o Chat AI Funciona

## 📍 **Situação Atual**

### ✅ **Desenvolvimento Local (Funciona)**
1. Execute o servidor Flask:
   ```bash
   cd escrow-dapp/ai-agent
   python server.py
   ```
2. Abra `frontend/index.html` no navegador
3. O chat funcionará normalmente conectando em `http://localhost:5000`

### ❌ **GitHub Pages (NÃO Funciona)**
- O código do chat **vai junto** no push
- Mas o **backend Flask não roda** no GitHub Pages
- GitHub Pages só serve arquivos estáticos (HTML, CSS, JS)
- O chat mostrará mensagem informando que está disponível apenas localmente

---

## 🚀 **Para Funcionar em Produção**

Você precisa hospedar o backend Flask em um serviço de cloud:

### **Opções Recomendadas:**

1. **Render** (Grátis, fácil)
   - https://render.com
   - Conecta com GitHub
   - Deploy automático

2. **Railway** (Grátis, fácil)
   - https://railway.app
   - Deploy em 1 clique

3. **Heroku** (Pago, mas confiável)
   - https://heroku.com

### **Após Hospedar:**

1. Obtenha a URL do backend (ex: `https://deal-fi-ai.onrender.com`)
2. Atualize `ai-chat-service.js` linha ~15:
   ```javascript
   this.backendUrl = 'https://sua-url-aqui.com';
   ```
3. Faça push novamente

---

## 🔧 **Como Testar Localmente**

### **Terminal 1 - Backend:**
```bash
cd escrow-dapp/ai-agent
python server.py
```
**Resultado esperado:**
```
╔══════════════════════════════════════════╗
║       Deal-Fi AI Agent - Backend         ║
╠══════════════════════════════════════════╣
║  Modelo: gpt-4o                          ║
║  Porta:  5000                            ║
║  URL:    http://localhost:5000           ║
╚══════════════════════════════════════════╝
```

### **Terminal 2 - Frontend (opcional):**
```bash
cd escrow-dapp/frontend
# Abra index.html no navegador ou use:
npx serve .
```

### **Teste o Chat:**
- Abra o site no navegador
- Clique no ícone de chat (canto inferior direito)
- Digite: "Me leve para criar um contrato"
- Deve navegar automaticamente!

---

## 📝 **Resumo**

| Ambiente | Chat Funciona? | O que fazer |
|----------|----------------|-------------|
| **Local** | ✅ Sim | Rodar `python server.py` |
| **GitHub Pages** | ❌ Não | Hospedar backend em Render/Railway |
| **Produção** | ✅ Sim* | *Após hospedar backend |

---

## ⚠️ **Importante**

- O arquivo `.env` com `OPENAI_API_KEY` **NÃO** vai para o GitHub (está no `.gitignore`)
- Cada ambiente precisa ter seu próprio `.env`
- Nunca commite chaves de API!

