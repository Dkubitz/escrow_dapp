# 🚀 Guia Completo: Deploy Vercel + Railway - Deal-Fi

## 📋 Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Decisões Arquiteturais](#decisões-arquiteturais)
4. [Fluxo de Trabalho (Commit e Push)](#fluxo-de-trabalho-commit-e-push)
5. [Deploy no Vercel (Frontend)](#deploy-no-vercel-frontend)
6. [Deploy no Railway (AI Agent)](#deploy-no-railway-ai-agent)
7. [Conectar Frontend com Backend](#conectar-frontend-com-backend)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Visão Geral da Arquitetura

### Decisão Principal: **1 Repositório → 2 Deploys**

**Por que essa escolha?**
- ✅ Código versionado junto (frontend + backend sincronizados)
- ✅ Um único histórico Git
- ✅ Facilita manutenção e releases
- ✅ Cada plataforma faz deploy apenas do seu "bounded context"

### Arquitetura de Deploy

```
GitHub Repository (escrow_dapp)
│
├── escrow-dapp/
│   ├── frontend/     → VERCEL (site estático)
│   ├── ai-agent/     → RAILWAY (API Flask)
│   └── backend/       → Smart contracts (já na Polygon, não precisa deploy)
│
└── Configurações:
    ├── .gitignore
    ├── vercel.json (em frontend/)
    └── Procfile (em ai-agent/)
```

**Fluxo:**
1. Desenvolvedor faz commit no GitHub
2. Vercel detecta mudanças em `escrow-dapp/frontend/` → Deploy automático
3. Railway detecta mudanças em `escrow-dapp/ai-agent/` → Deploy automático

---

## 📁 Estrutura do Projeto

### Organização de Pastas

```
Deal-Fi/
├── escrow-dapp/
│   ├── frontend/              # Interface web (Vercel)
│   │   ├── index.html        # Página principal
│   │   ├── vercel.json       # Config do Vercel
│   │   ├── src/              # Código JavaScript
│   │   │   ├── components/   # Componentes UI
│   │   │   ├── services/     # Serviços (wallet, contracts, AI chat)
│   │   │   └── contracts/     # ABI e bytecode dos smart contracts
│   │   └── assets/           # CSS, imagens, vídeos
│   │
│   ├── ai-agent/             # Backend Flask (Railway)
│   │   ├── server.py         # Servidor Flask + OpenAI
│   │   ├── requirements.txt  # Dependências Python
│   │   ├── Procfile          # Config do Railway
│   │   ├── .env              # Variáveis de ambiente (NÃO commitado)
│   │   └── env-example.txt   # Template de .env
│   │
│   └── backend/              # Smart contracts Solidity
│       └── *.sol            # Contratos já deployados na Polygon
│
├── .gitignore                # Arquivos ignorados pelo Git
├── README.md                 # Documentação principal
├── DEPLOY-SIMPLES.md         # Guia rápido de deploy
└── DEPLOY-VERCEL-RAILWAY-GUIDE.md  # Este arquivo
```

### Arquivos Importantes

**Frontend:**
- `escrow-dapp/frontend/index.html` - Página principal (configura URL do backend)
- `escrow-dapp/frontend/src/services/ai-chat-service.js` - Comunicação com backend
- `escrow-dapp/frontend/vercel.json` - Configuração do Vercel

**Backend:**
- `escrow-dapp/ai-agent/server.py` - Servidor Flask (deve escutar em 0.0.0.0)
- `escrow-dapp/ai-agent/Procfile` - Configuração do Railway
- `escrow-dapp/ai-agent/.env` - Variáveis de ambiente (NUNCA commitar!)

---

## 🎯 Decisões Arquiteturais

### 1. Por que Vercel para Frontend?

**Decisão:** Vercel para site estático (HTML/CSS/JS vanilla)

**Razões:**
- ✅ Grátis para projetos pessoais
- ✅ Deploy automático via GitHub
- ✅ HTTPS automático
- ✅ CDN global
- ✅ Perfeito para SPAs (Single Page Applications)

**Alternativas consideradas:**
- Netlify (similar, mas Vercel mais moderno)
- GitHub Pages (limitado, sem configurações avançadas)

### 2. Por que Railway para AI Agent?

**Decisão:** Railway para backend Flask

**Razões:**
- ✅ Quase grátis ($1 crédito/mês, uso ~$0.20-1.00/mês)
- ✅ Deploy automático via GitHub
- ✅ Suporta Python/Flask nativamente
- ✅ Variáveis de ambiente fáceis de configurar
- ✅ HTTPS automático

**Alternativas consideradas:**
- Render (similar, mas Railway mais simples)
- Heroku (pago, mais caro)
- AWS/GCP (complexo demais para este projeto)

### 3. Por que 1 Repositório?

**Decisão:** Um único repositório GitHub para tudo

**Razões:**
- ✅ Versionamento sincronizado (frontend + backend)
- ✅ Um único histórico Git
- ✅ Facilita releases coordenados
- ✅ Cada plataforma faz deploy apenas da pasta necessária

**Como funciona:**
- Vercel: Root Directory = `escrow-dapp/frontend`
- Railway: Root Directory = `escrow-dapp/ai-agent`

### 4. Por que Smart Contracts não vão para Deploy?

**Decisão:** `backend/` contém apenas código-fonte Solidity

**Razão:**
- Smart contracts já estão deployados na blockchain Polygon
- Não precisam de servidor web
- São imutáveis após deploy
- Código-fonte fica no repo apenas para referência

---

## 🔄 Fluxo de Trabalho (Commit e Push)

### ⚠️ REGRA DE OURO: Sempre verificar antes de commitar

```bash
# 1. Ver o que mudou
git status

# 2. Ver diferenças (opcional, mas recomendado)
git diff

# 3. Adicionar arquivos
git add .

# 4. Commit com mensagem descritiva
git commit -m "Descrição clara do que foi feito"

# 5. Push para GitHub
git push origin main
```

### 📝 Convenções de Commit

**Formato:**
```
Tipo: Descrição breve

Exemplos:
- "feat: Add wallet connection to AI agent"
- "fix: Correct CORS configuration in server.py"
- "refactor: Organize frontend components structure"
- "docs: Update deployment guide"
```

**Tipos comuns:**
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `refactor:` - Refatoração de código
- `docs:` - Documentação
- `style:` - Formatação (sem mudança de lógica)
- `chore:` - Tarefas de manutenção

### 🚫 O que NUNCA commitar

**Arquivos no .gitignore:**
- `.env` (variáveis de ambiente com chaves secretas)
- `__pycache__/` (cache Python)
- `node_modules/` (se usar no futuro)
- Arquivos temporários

**⚠️ IMPORTANTE:**
- **NUNCA** commite `OPENAI_API_KEY` ou outras chaves
- Use variáveis de ambiente nos serviços de deploy
- Se acidentalmente commitar, **ROTACIONAR A CHAVE IMEDIATAMENTE**

### 🔄 Fluxo Completo de Edição

#### Editando o Frontend:

```bash
# 1. Editar arquivos em escrow-dapp/frontend/
# Exemplo: escrow-dapp/frontend/src/components/ai-chat-component.js

# 2. Testar localmente
# Abra escrow-dapp/frontend/index.html no navegador

# 3. Commit e push
git add escrow-dapp/frontend/
git commit -m "feat: Update AI chat component UI"
git push origin main

# 4. Vercel faz deploy automático em ~2 minutos
```

#### Editando o AI Agent:

```bash
# 1. Editar arquivos em escrow-dapp/ai-agent/
# Exemplo: escrow-dapp/ai-agent/server.py

# 2. Testar localmente
cd escrow-dapp/ai-agent
python server.py
# Teste em http://localhost:5000

# 3. Commit e push
git add escrow-dapp/ai-agent/
git commit -m "feat: Add new tool to AI agent"
git push origin main

# 4. Railway faz deploy automático em ~3-5 minutos
```

#### Editando Ambos:

```bash
# 1. Editar arquivos em ambas as pastas

# 2. Testar localmente (frontend + backend)

# 3. Commit e push
git add .
git commit -m "feat: Update frontend and backend integration"
git push origin main

# 4. Ambos fazem deploy automático
```

---

## 🌐 Deploy no Vercel (Frontend)

### Configuração Inicial (Já Feita)

**Repositório:** `Dkubitz/escrow_dapp`  
**Root Directory:** `escrow-dapp/frontend`  
**Framework:** Other  
**Build Command:** (vazio)  
**Output Directory:** `.`

### Arquivo de Configuração

**`escrow-dapp/frontend/vercel.json`:**
```json
{
  "version": 2,
  "buildCommand": null,
  "outputDirectory": ".",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Como Funciona

1. **Push no GitHub** → Vercel detecta mudanças em `escrow-dapp/frontend/`
2. **Build automático** → Vercel faz deploy dos arquivos estáticos
3. **URL gerada** → `https://seu-projeto.vercel.app`

### Verificar Deploy

- Dashboard Vercel → **Deployments** → Veja status
- Logs mostram se build foi bem-sucedido
- URL funciona imediatamente após deploy

### Troubleshooting Vercel

**Erro 404:**
- Verificar se Root Directory está como `escrow-dapp/frontend`
- Verificar se `index.html` existe na pasta frontend
- Fazer redeploy manual

**Arquivos não atualizam:**
- Aguardar 2-3 minutos (cache)
- Forçar redeploy no dashboard
- Verificar se commit foi feito corretamente

---

## 🚂 Deploy no Railway (AI Agent)

### Configuração Inicial (Já Feita)

**Repositório:** `Dkubitz/escrow_dapp`  
**Root Directory:** `escrow-dapp/ai-agent`  
**Start Command:** `python server.py` (via Procfile)

### Arquivo de Configuração

**`escrow-dapp/ai-agent/Procfile`:**
```
web: python server.py
```

### Variáveis de Ambiente (Configuradas no Railway)

**No dashboard Railway → Variables:**
```
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o
PORT=5000
```

⚠️ **IMPORTANTE:** Essas variáveis são configuradas no dashboard do Railway, NÃO no código!

### Configuração do server.py (CRÍTICA)

**O servidor DEVE escutar em `0.0.0.0` para aceitar conexões externas:**

```python
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    # Railway precisa de 0.0.0.0, não 127.0.0.1
    app.run(host="0.0.0.0", port=port, debug=False)
```

**Por quê?**
- `127.0.0.1` = apenas conexões locais (não funciona no Railway)
- `0.0.0.0` = aceita conexões de qualquer IP (necessário para Railway)
- `debug=False` = modo produção (mais seguro)

### Como Funciona

1. **Push no GitHub** → Railway detecta mudanças em `escrow-dapp/ai-agent/`
2. **Build automático** → Railway instala dependências do `requirements.txt`
3. **Start automático** → Railway executa `python server.py`
4. **URL gerada** → `https://seu-projeto.up.railway.app`

### ⚠️ Evitar Deploys Desnecessários

**Problema:** Railway pode fazer deploy mesmo quando só o frontend muda.

**Solução:** Arquivo `.railwayignore` na raiz do projeto:

```
# Railway Ignore - Deploy apenas quando há mudanças em escrow-dapp/ai-agent/
/*
!escrow-dapp/
escrow-dapp/*
!escrow-dapp/ai-agent/
```

**Como funciona:**
- Railway ignora mudanças em todas as pastas
- EXCETO `escrow-dapp/ai-agent/`
- Assim, só faz deploy quando há mudanças no backend

### Verificar Deploy

- Dashboard Railway → **Deployments** → Veja status
- **Logs** mostram se servidor iniciou corretamente
- Deve aparecer: `Running on http://0.0.0.0:5000`
- Teste a URL: `https://sua-url.railway.app/` deve retornar JSON

### Troubleshooting Railway

**Erro "GitHub Repo not found":**
- Reconectar repositório no Railway
- Verificar permissões do GitHub
- Autorizar Railway a acessar repositórios privados

**Servidor não responde:**
- Verificar logs no Railway
- Confirmar que `OPENAI_API_KEY` está configurada
- Verificar se servidor está escutando em `0.0.0.0`

**Erro de porta:**
- Railway injeta `PORT` automaticamente
- Não precisa configurar porta manualmente
- Usar `os.getenv("PORT", 5000)` no código

---

## 🔗 Conectar Frontend com Backend

### Passo 1: Obter URL do Railway

1. No Railway dashboard → **Settings** → **Domains**
2. Copie a URL gerada (ex: `https://seu-projeto.up.railway.app`)

### Passo 2: Configurar no Frontend

**Editar `escrow-dapp/frontend/index.html`:**

Encontre a seção (~linha 104) onde tem comentário sobre Railway e adicione:

```html
<!-- ANTES do script do chat -->
<script>
    // URL do backend Railway
    window.AI_BACKEND_URL = 'https://seu-projeto.up.railway.app';
</script>

<!-- Depois vem o script do chat -->
<script src="src/services/ai-chat-service.js"></script>
```

### Passo 3: Commit e Push

```bash
git add escrow-dapp/frontend/index.html
git commit -m "config: Connect frontend to Railway backend"
git push origin main
```

### Passo 4: Aguardar Deploy

- Vercel faz deploy automático em ~2 minutos
- Frontend agora se conecta ao backend Railway
- Chat AI deve funcionar!

### Como Funciona

**`escrow-dapp/frontend/src/services/ai-chat-service.js`** detecta:

1. Se `window.AI_BACKEND_URL` está definido → usa essa URL
2. Se está em localhost → usa `http://localhost:5000`
3. Caso contrário → mostra mensagem de erro

**Fluxo:**
```
Usuário no Frontend (Vercel)
    ↓ Digita mensagem no chat
    ↓ JavaScript faz fetch()
Backend Railway (Flask)
    ↓ Recebe requisição
    ↓ Chama OpenAI GPT-4o
    ↓ Retorna resposta
Frontend (Vercel)
    ↓ Exibe resposta
    ↓ Executa ações (tool calls)
```

---

## 🔧 Troubleshooting

### Problema: Frontend não conecta com Backend

**Sintomas:**
- Chat mostra erro de conexão
- Console do navegador mostra erro CORS ou timeout

**Soluções:**
1. Verificar se `window.AI_BACKEND_URL` está configurado corretamente
2. Verificar se URL do Railway está correta (testar no navegador)
3. Verificar logs do Railway (servidor está rodando?)
4. Verificar CORS no `server.py` (deve ter `CORS(app)`)

### Problema: Backend não inicia no Railway

**Sintomas:**
- Deploy falha
- Logs mostram erro

**Soluções:**
1. Verificar se `requirements.txt` está correto
2. Verificar se `OPENAI_API_KEY` está configurada
3. Verificar se `server.py` escuta em `0.0.0.0`
4. Verificar logs completos no Railway

### Problema: Mudanças não aparecem após deploy

**Sintomas:**
- Fez commit e push, mas site não atualiza

**Soluções:**
1. Aguardar 2-5 minutos (cache)
2. Forçar redeploy no dashboard
3. Verificar se commit foi feito corretamente
4. Limpar cache do navegador (Ctrl+Shift+R)

### Problema: Erro 404 no Vercel

**Sintomas:**
- Site mostra erro 404

**Soluções:**
1. Verificar Root Directory = `escrow-dapp/frontend`
2. Verificar se `index.html` existe
3. Verificar `vercel.json` está correto
4. Fazer redeploy manual

---

## 📚 Referências Rápidas

### URLs Importantes

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Railway Dashboard:** https://railway.app/dashboard
- **GitHub Repository:** https://github.com/Dkubitz/escrow_dapp

### Comandos Úteis

```bash
# Ver status do Git
git status

# Ver diferenças
git diff

# Adicionar tudo
git add .

# Commit
git commit -m "mensagem"

# Push
git push origin main

# Ver histórico
git log --oneline

# Testar backend localmente
cd escrow-dapp/ai-agent
python server.py
```

### Arquivos de Configuração

- **Vercel:** `escrow-dapp/frontend/vercel.json`
- **Railway:** `escrow-dapp/ai-agent/Procfile`
- **Git:** `.gitignore`
- **Python:** `escrow-dapp/ai-agent/requirements.txt`

---

## ✅ Checklist de Deploy

### Deploy Inicial
- [ ] Repositório no GitHub criado
- [ ] Código commitado e pushado
- [ ] Vercel configurado (Root Directory = `escrow-dapp/frontend`)
- [ ] Railway configurado (Root Directory = `escrow-dapp/ai-agent`)
- [ ] Variáveis de ambiente configuradas no Railway
- [ ] URL do Railway obtida
- [ ] Frontend configurado com URL do Railway
- [ ] Testado end-to-end

### Após Edições
- [ ] Código testado localmente
- [ ] Commit com mensagem descritiva
- [ ] Push para GitHub
- [ ] Aguardar deploy automático
- [ ] Testar em produção

---

## 🎯 Resumo para Próximo Agente

### Estrutura Principal

1. **1 Repositório GitHub** → `Dkubitz/escrow_dapp`
2. **2 Deploys Automáticos:**
   - Vercel → `escrow-dapp/frontend/`
   - Railway → `escrow-dapp/ai-agent/`

### Fluxo de Trabalho

1. Editar código localmente
2. Testar localmente
3. `git add .` → `git commit -m "..."` → `git push`
4. Deploys automáticos em ~2-5 minutos

### Decisões Importantes

- ✅ Vercel para frontend (grátis, fácil)
- ✅ Railway para backend (quase grátis, fácil)
- ✅ 1 repo para tudo (sincronização)
- ✅ Smart contracts já na Polygon (não precisam deploy)

### Arquivos Críticos

- `escrow-dapp/frontend/index.html` - Configura URL do backend
- `escrow-dapp/ai-agent/server.py` - Deve escutar em `0.0.0.0`
- `escrow-dapp/ai-agent/.env` - NUNCA commitar!

### Próximos Passos Sugeridos

1. Testar chat AI em produção
2. Adicionar mais tools ao AI agent
3. Melhorar UI do frontend
4. Adicionar validações e tratamento de erros

---

**Última atualização:** Janeiro 2025  
**Mantido por:** Equipe Deal-Fi
