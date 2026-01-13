# 🌐 Alternativa: Usar Túnel (Apenas para Testes)

## ⚠️ **IMPORTANTE: Isso é apenas para testes!**

Você **PODE** usar um túnel para expor seu servidor local na internet, mas:

### ❌ **Desvantagens:**
- Seu PC precisa estar ligado 24/7
- URL muda a cada reinício (com plano grátis)
- Lento (roda pelo túnel)
- Não é profissional para produção
- Consome sua internet/recursos

### ✅ **Vantagens:**
- Funciona sem hospedar backend
- Bom para testes rápidos
- Grátis (planos básicos)

---

## 🚀 **Como Usar ngrok (Exemplo)**

### **1. Instalar ngrok:**
```bash
# Windows (via Chocolatey)
choco install ngrok

# Ou baixe em: https://ngrok.com/download
```

### **2. Rodar seu servidor Flask:**
```bash
cd escrow-dapp/ai-agent
python server.py
```

### **3. Em outro terminal, criar túnel:**
```bash
ngrok http 5000
```

**Resultado:**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:5000
```

### **4. Atualizar o código para usar a URL do túnel:**

No `ai-chat-service.js`, temporariamente:
```javascript
// TEMPORÁRIO - apenas para testes
this.backendUrl = 'https://abc123.ngrok.io';
```

### **5. Fazer push:**
- O GitHub Pages vai conectar no túnel
- Funciona enquanto ngrok estiver rodando

---

## 🔄 **Problemas com Túnel:**

1. **URL muda:** A cada reinício do ngrok, URL muda
2. **Precisa atualizar código:** Tem que fazer push toda vez
3. **PC ligado:** Seu computador precisa estar sempre ligado
4. **Lento:** Latência maior que servidor hospedado
5. **Limite de conexões:** Planos grátis têm limites

---

## 💡 **Recomendação:**

**Para desenvolvimento:** Use localhost (como está agora) ✅

**Para produção:** Hospede em Render/Railway (5 minutos de setup) ✅

**Para testes rápidos:** Use túnel (ngrok) ⚠️

---

## 🎯 **Conclusão:**

Túnel funciona, mas **não é solução profissional**. 
Melhor hospedar o backend uma vez e esquecer! 🚀

