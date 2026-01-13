# Deal-Fi - Escrow dApp na Polygon

Plataforma descentralizada de contratos escrow com pagamento por marcos na blockchain Polygon.

## 🚀 Início Rápido

### Desenvolvimento Local

1. **Frontend:**
   ```bash
   cd escrow-dapp/frontend
   # Abra index.html no navegador
   ```

2. **AI Agent (Backend):**
   ```bash
   cd escrow-dapp/ai-agent
   pip install -r requirements.txt
   cp env-example.txt .env
   # Edite .env com sua OPENAI_API_KEY
   python server.py
   ```

### Deploy em Produção

📖 **Veja o guia completo:** [`DEPLOY-SIMPLES.md`](./DEPLOY-SIMPLES.md)

**Resumo:**
- **Frontend** → Vercel (grátis)
- **AI Agent** → Railway (quase grátis)
- **Smart Contracts** → Já na Polygon

## 📁 Estrutura do Projeto

```
Deal-Fi/
├── escrow-dapp/
│   ├── frontend/          # Interface web (Vercel)
│   ├── ai-agent/          # Backend Flask + GPT (Railway)
│   └── backend/           # Smart contracts Solidity
├── DEPLOY-SIMPLES.md      # Guia de deploy
└── README.md              # Este arquivo
```

## 🎯 Funcionalidades

- ✅ Criação de contratos escrow com múltiplos marcos
- ✅ Pagamento por etapas (milestones)
- ✅ Assistente AI para navegação e preenchimento de formulários
- ✅ Integração com MetaMask
- ✅ Rede Polygon (custos baixos)

## 🔧 Tecnologias

- **Frontend:** JavaScript Vanilla, HTML5, CSS3
- **Backend AI:** Flask, OpenAI GPT-4o
- **Blockchain:** Solidity, Polygon, ethers.js
- **Deploy:** Vercel (frontend), Railway (backend)

## 📚 Documentação

- [`DEPLOY-SIMPLES.md`](./DEPLOY-SIMPLES.md) - Guia completo de deploy
- [`escrow-dapp/ai-agent/README.md`](./escrow-dapp/ai-agent/README.md) - Documentação do AI Agent
- [`escrow-dapp/frontend/`](./escrow-dapp/frontend/) - Código do frontend

## ⚠️ Importante

- **Nunca commite** arquivos `.env` com chaves de API
- Use variáveis de ambiente nos serviços de deploy
- Smart contracts já estão deployados na Polygon

## 📝 Licença

Este projeto é privado.
