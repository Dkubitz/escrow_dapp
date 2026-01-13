# 🤖 Deal-Fi AI Agent

Agente conversacional que opera a interface do Deal-Fi usando GPT-4o e Function Calling.

## 📋 Funcionalidades

### Fase 1 (MVP) - Navegação
- [x] Navegar entre páginas (home, create, manage)
- [x] Voltar para página inicial
- [x] Informar página atual

### Fase 1.5 - Interação com Formulário ✅ NOVO
- [x] Obter informações dos campos do formulário
- [x] Preencher campos do formulário (endereço recebedor, valor, prazo)
- [x] Visualizar marcos de pagamento
- [x] Adicionar marcos de pagamento
- [x] Remover marcos de pagamento
- [x] Atualizar percentuais dos marcos

### Fase 1.6 - Conexão de Carteira ✅ NOVO
- [x] Conectar carteira MetaMask
- [x] Verificar status da conexão (conectada/desconectada, endereço)

### Fase 2 - Carteira (Futuro)
- [ ] Verificar status da carteira
- [ ] Solicitar conexão da carteira

### Fase 3 - Contratos (Futuro)
- [ ] Criar contratos via chat (submeter formulário)
- [ ] Listar contratos do usuário
- [ ] Executar ações em contratos

## 🚀 Como Executar

### 1. Instalar dependências Python
```bash
cd escrow-dapp/ai-agent
pip install -r requirements.txt
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com sua chave da OpenAI
```

### 3. Iniciar o servidor
```bash
python server.py
```

### 4. Abrir o frontend
Abra `escrow-dapp/frontend/index.html` no navegador.
O chat estará disponível no canto inferior direito.

## 🏗️ Arquitetura

```
Frontend (Deal-Fi)
    ↓ Envia mensagem
Backend Flask (ai-agent/server.py)
    ↓ Chama OpenAI
GPT-4o decide ação
    ↓ Retorna tool_calls
Frontend executa função
    ↓ Atualiza interface
GPT responde ao usuário
```

## 🔧 Tools Disponíveis

### Navegação
| Tool | Descrição |
|------|-----------|
| `navigate_to_page` | Navega para home, create ou manage |
| `go_home` | Volta para página inicial |
| `get_current_page` | Retorna página atual |

### Formulário de Criação de Contrato
| Tool | Descrição |
|------|-----------|
| `get_form_fields` | Obtém valores atuais dos campos do formulário |
| `fill_form_field` | Preenche um campo específico (payeeAddress, amount, duration) |
| `get_milestones` | Obtém informações sobre os marcos de pagamento |
| `add_milestone` | Adiciona um novo marco de pagamento |
| `update_milestone` | Atualiza o percentual de um marco específico |
| `remove_milestone` | Remove um marco de pagamento |

### Carteira
| Tool | Descrição |
|------|-----------|
| `connect_wallet` | Conecta a carteira MetaMask do usuário |
| `get_wallet_status` | Obtém status da conexão (conectada/desconectada, endereço) |

## 📁 Estrutura de Arquivos

```
ai-agent/
├── server.py           # Backend Flask + OpenAI
├── requirements.txt    # Dependências
├── .env.example        # Template de config
└── README.md          # Esta documentação

frontend/src/
├── services/
│   └── ai-chat-service.js    # Comunicação com backend
└── components/
    └── ai-chat-component.js  # Widget de chat
```

## ⚠️ Requisitos

- Python 3.8+
- Chave de API da OpenAI (com acesso ao GPT-4o)
- Navegador moderno

## 💡 Exemplos de Uso

### Navegação
**Usuário:** "Me leve para criar um contrato"  
**Agente:** "Navegando para a página de criação!" *(navega automaticamente)*

**Usuário:** "Voltar para o início"  
**Agente:** "Voltando para a página inicial!" *(navega para home)*

**Usuário:** "Onde estou?"  
**Agente:** "Você está na página de criação de contratos."

### Preenchimento de Formulário
**Usuário:** "Preencha o endereço do recebedor com 0x1234567890123456789012345678901234567890"  
**Agente:** "Preenchendo endereço do recebedor: 0x1234..." *(preenche o campo)*

**Usuário:** "Configure o valor para 500 USDC"  
**Agente:** "Valor configurado: 500 USDC" *(preenche o campo)*

**Usuário:** "Qual o estado do formulário?"  
**Agente:** "📋 Estado do Formulário: [mostra todos os campos e marcos]"

**Usuário:** "Adicione um marco de 30%"  
**Agente:** "Marco adicionado! [mostra estado atualizado dos marcos]"

### Conexão de Carteira
**Usuário:** "Quero conectar minha carteira"  
**Agente:** "Conectando sua carteira MetaMask..." *(abre MetaMask para aprovação)*

**Usuário:** "Minha carteira está conectada?"  
**Agente:** "✅ Carteira conectada. Endereço: 0x1234...5678"
