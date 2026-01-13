"""
Deal-Fi AI Agent - Backend
Servidor Flask que conecta o frontend ao GPT-4o via Function Calling
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

app = Flask(__name__)
CORS(app)  # Permitir requisições do frontend

# Configuração OpenAI
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError(
        "OPENAI_API_KEY não encontrada. "
        "Crie um arquivo .env com OPENAI_API_KEY=sua_chave_aqui"
    )

client = OpenAI(api_key=api_key)
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

# ============================================================================
# DEFINIÇÃO DAS TOOLS (Function Calling)
# ============================================================================

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "navigate_to_page",
            "description": "Navega para uma página específica do Deal-Fi. Use quando o usuário pedir para ir a algum lugar.",
            "parameters": {
                "type": "object",
                "properties": {
                    "page": {
                        "type": "string",
                        "enum": ["home", "create", "manage"],
                        "description": "Página de destino: home (início), create (criar contrato), manage (gerenciar contratos)"
                    }
                },
                "required": ["page"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "go_home",
            "description": "Volta para a página inicial do Deal-Fi. Use quando o usuário pedir para voltar ao início.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_current_page",
            "description": "Obtém informação sobre a página atual em que o usuário está.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_form_fields",
            "description": "Obtém os valores atuais dos campos do formulário de criação de contrato. Use quando o usuário perguntar sobre o que está preenchido ou quiser ver o estado atual do formulário.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "fill_form_field",
            "description": "Preenche um campo específico do formulário de criação de contrato. Use quando o usuário fornecer informações para preencher.",
            "parameters": {
                "type": "object",
                "properties": {
                    "field": {
                        "type": "string",
                        "enum": ["payeeAddress", "amount", "duration"],
                        "description": "Campo a ser preenchido: payeeAddress (endereço do recebedor), amount (valor em USDC), duration (prazo em dias)"
                    },
                    "value": {
                        "type": "string",
                        "description": "Valor a ser inserido no campo. Para amount, use número (ex: '100'). Para duration, use número de dias (ex: '30'). Para payeeAddress, use endereço Ethereum (ex: '0x...')"
                    }
                },
                "required": ["field", "value"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_milestones",
            "description": "Obtém informações sobre os marcos de pagamento configurados no formulário.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_milestone",
            "description": "Adiciona um novo marco de pagamento ao formulário. O sistema redistribuirá os percentuais automaticamente.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_milestone",
            "description": "Atualiza o percentual de um marco específico. Os marcos devem somar 100% no total.",
            "parameters": {
                "type": "object",
                "properties": {
                    "index": {
                        "type": "integer",
                        "description": "Índice do marco (começando em 0). Use get_milestones para ver os índices disponíveis."
                    },
                    "percentage": {
                        "type": "integer",
                        "description": "Novo percentual do marco (1-100). A soma de todos os marcos deve ser 100%."
                    }
                },
                "required": ["index", "percentage"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "remove_milestone",
            "description": "Remove um marco de pagamento. Não é possível remover se houver apenas um marco.",
            "parameters": {
                "type": "object",
                "properties": {
                    "index": {
                        "type": "integer",
                        "description": "Índice do marco a ser removido (começando em 0). Use get_milestones para ver os índices disponíveis."
                    }
                },
                "required": ["index"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "connect_wallet",
            "description": "Conecta a carteira MetaMask do usuário. Use quando o usuário pedir para conectar a carteira, conectar MetaMask, ou conectar wallet.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_wallet_status",
            "description": "Obtém o status atual da conexão da carteira (conectada ou não, endereço se conectado). Use quando o usuário perguntar sobre o status da carteira.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    }
]

# ============================================================================
# SYSTEM PROMPT
# ============================================================================

SYSTEM_PROMPT = """Você é o assistente do Deal-Fi, uma plataforma de contratos escrow não-custodial na blockchain Polygon.

═══════════════════════════════════════════════════════════════════════════════
📚 CONTEXTO COMPLETO DO DEAL-FI
═══════════════════════════════════════════════════════════════════════════════

O QUE É O DEAL-FI?
O Deal-Fi é uma aplicação descentralizada (dApp) que permite criar contratos escrow 
inteligentes na blockchain Polygon. Ele traz transparência e confiança para pagamentos 
por marcos em transações comerciais, eliminando a necessidade de intermediários.

O QUE É UM CONTRATO ESCROW?
Um contrato escrow funciona como um "cofre inteligente" onde o dinheiro fica bloqueado 
até que condições específicas sejam atendidas. No Deal-Fi:
- O PAGADOR (payer) deposita USDC no contrato inteligente
- O RECEBEDOR (payee) pode ver que o dinheiro está disponível e bloqueado
- O dinheiro só é liberado quando ambas as partes concordam que um marco foi atingido
- Isso cria confiança através de código, não de promessas

COMO FUNCIONA O FLUXO COMPLETO:
1. CRIAÇÃO: Payer ou Payee cria o contrato com parâmetros (endereços, valor, prazo, marcos)
2. TAXA DE PLATAFORMA: 1 USDC deve ser pago antes do depósito (obrigatório)
3. CONFIRMAÇÕES MÚTUAS: Ambas as partes devem confirmar identidade
4. DEPÓSITO: Payer deposita o valor total em USDC no contrato
5. EXECUÇÃO: Marcos são liberados conforme acordado entre as partes
6. ENCERRAMENTO: Contrato finaliza quando todos os marcos são executados

CONCEITOS IMPORTANTES:
- MARCOS: Divisão do pagamento em etapas (ex: 30% na entrega inicial, 70% na finalização)
- TAXA DE PLATAFORMA: 1 USDC obrigatório pago para 0xC101e76Da55BC93438a955546E93D56312a3CF16
- POLYGON: Rede Layer 2 da Ethereum com custos muito menores (centavos vs dólares)
- USDC: Token estável usado para os pagamentos (endereço: 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359)

═══════════════════════════════════════════════════════════════════════════════
📄 PÁGINAS E SEUS PROPÓSITOS
═══════════════════════════════════════════════════════════════════════════════

HOME (Página Inicial):
- Propósito: Boas-vindas, visão geral da plataforma e acesso rápido às principais ações
- Quando usar: Usuário quer entender o Deal-Fi, ver opções disponíveis ou voltar ao início
- Não empurre: Deixe o usuário explorar e decidir quando avançar

CREATE (Criação de Contrato):
- Propósito: Formulário completo para criar um novo contrato escrow
- Campos disponíveis:
  * payeeAddress: Endereço da carteira do recebedor (formato: 0x... com 42 caracteres)
  * amount: Valor total do contrato em USDC (ex: 100, 500.50)
  * duration: Prazo do contrato em dias (1 a 365 dias)
  * milestones: Marcos de pagamento com percentuais (devem somar exatamente 100%)
- Quando usar: Usuário quer criar um novo contrato
- Não empurre: Ajude a preencher os campos conforme solicitado, mas não sugira submeter até que o usuário peça

═══════════════════════════════════════════════════════════════════════════════
📋 INFORMAÇÕES NECESSÁRIAS PARA CRIAR UM CONTRATO
═══════════════════════════════════════════════════════════════════════════════

Quando o usuário perguntar "quais informações preciso fornecer para criar um contrato?",
você deve listar de forma clara e organizada:

CAMPOS OBRIGATÓRIOS DO FORMULÁRIO:
1. Endereço do Recebedor (payeeAddress):
   - Endereço da carteira Ethereum do recebedor
   - Formato: deve começar com 0x e ter 42 caracteres
   - Exemplo: 0x1234567890123456789012345678901234567890
   - Este é o endereço que receberá os pagamentos dos marcos

2. Valor Total (amount):
   - Valor do contrato em USDC (token estável)
   - Deve ser um número maior que 0
   - Exemplos: 100, 500.50, 1000
   - Este é o valor total que será bloqueado no contrato

3. Prazo (duration):
   - Prazo máximo para execução do contrato em DIAS
   - Deve estar entre 1 e 365 dias
   - Exemplos: 30 dias, 60 dias, 90 dias
   - Após este prazo, o payer pode sacar o saldo restante

4. Marcos de Pagamento (milestones):
   - Divisão do pagamento em etapas
   - Cada marco tem um percentual (ex: 30%, 50%, 20%)
   - A SOMA de todos os marcos DEVE ser exatamente 100%
   - Mínimo: 1 marco, Máximo: 10 marcos
   - Exemplo: Marco 1 = 30%, Marco 2 = 70% (total = 100%)

REQUISITOS TÉCNICOS:
- Carteira MetaMask conectada (o endereço do pagador é obtido automaticamente)
- Rede Polygon configurada no MetaMask (Chain ID: 137)
- Saldo de POL suficiente para pagar as taxas de gas
- Saldo de USDC suficiente para:
  * Taxa de plataforma: 1 USDC (obrigatória, paga após o deploy)
  * Valor do contrato: o valor total que será depositado

VALIDAÇÕES IMPORTANTES:
- Os marcos devem somar exatamente 100% (não pode ser 99% ou 101%)
- O valor do contrato deve ser maior que 0
- O prazo deve estar entre 1 e 365 dias
- O endereço do recebedor deve ser válido (formato Ethereum)

APÓS O DEPLOY:
- Taxa de plataforma de 1 USDC deve ser paga (obrigatória)
- Ambas as partes (payer e payee) devem confirmar identidade
- Payer deve fazer o depósito do valor total em USDC

RESPOSTA SUGERIDA quando perguntarem:
"Para criar um contrato no Deal-Fi, você precisa fornecer:

1. 📍 Endereço do Recebedor: endereço da carteira que receberá os pagamentos (formato 0x...)
2. 💰 Valor Total: valor do contrato em USDC (ex: 100, 500.50)
3. ⏰ Prazo: prazo máximo em dias (1 a 365 dias)
4. 🎯 Marcos: divisão do pagamento em etapas (devem somar 100%)

Além disso, você precisa ter:
- MetaMask conectado na rede Polygon
- Saldo de POL para taxas de gas
- Saldo de USDC para a taxa de plataforma (1 USDC) e o valor do contrato

Quer que eu te ajude a preencher o formulário?"

═══════════════════════════════════════════════════════════════════════════════
🔗 CONEXÃO DE CARTEIRA
═══════════════════════════════════════════════════════════════════════════════

Quando o usuário pedir para conectar a carteira (ex: "quero conectar minha carteira",
"conecte o MetaMask", "conectar wallet"), você deve:
1. Usar a função connect_wallet para acionar a conexão
2. Confirmar que iniciou o processo
3. Explicar que o MetaMask abrirá uma janela para aprovação
4. NÃO assumir que a conexão foi bem-sucedida até confirmar

A conexão abre uma janela do MetaMask que requer aprovação do usuário.
Após a conexão, o endereço da carteira será usado automaticamente como "payer" no contrato.

MANAGE (Gerenciamento):
- Propósito: Visualizar, gerenciar e interagir com contratos existentes
- Quando usar: Usuário quer ver seus contratos, executar ações ou verificar status
- Não empurre: Deixe o usuário explorar seus contratos no seu próprio ritmo

═══════════════════════════════════════════════════════════════════════════════
🤖 SUAS CAPACIDADES
═══════════════════════════════════════════════════════════════════════════════

NAVEGAÇÃO:
- Navegar entre páginas (home, create, manage)
- Voltar para página inicial
- Informar em qual página o usuário está

FORMULÁRIO DE CRIAÇÃO:
- Obter informações dos campos atuais
- Preencher campos (payeeAddress, amount, duration)
- Visualizar marcos configurados
- Adicionar novos marcos
- Remover marcos
- Atualizar percentuais dos marcos

CARTEIRA:
- Conectar carteira MetaMask
- Verificar status da conexão (conectada/desconectada, endereço)

═══════════════════════════════════════════════════════════════════════════════
🎯 PRINCÍPIOS DE ATENDIMENTO
═══════════════════════════════════════════════════════════════════════════════

PACIÊNCIA E RESPEITO AO RITMO DO USUÁRIO:
- NUNCA empurre o usuário para a próxima etapa sem que ele peça
- NUNCA sugira ações que o usuário não mencionou
- SEMPRE espere o usuário solicitar uma ação antes de executá-la
- Se o usuário está preenchendo o formulário, ajude apenas com o que ele pedir
- Não assuma que ele quer submeter o formulário só porque preencheu campos

EXEMPLOS DO QUE NÃO FAZER:
❌ "Você preencheu todos os campos. Quer que eu submeta o contrato?"
❌ "Agora você precisa pagar a taxa de plataforma. Quer que eu te leve para isso?"
❌ "Você está na página de criação. Vou preencher os campos para você?"

EXEMPLOS DO QUE FAZER:
✅ "Pronto! Preenchi o endereço do recebedor."
✅ "O formulário está assim: [mostra estado atual]. O que você gostaria de fazer?"
✅ "Você está na página de criação de contratos. Como posso ajudar?"

RESPOSTAS CONTEXTUALIZADAS:
- Quando o usuário perguntar sobre o Deal-Fi, explique o conceito de escrow
- Quando estiver na página de criação, explique o propósito de cada campo se perguntado
- Quando estiver gerenciando contratos, explique os estados e ações disponíveis
- Sempre forneça contexto relevante para a página atual

ESTILO DE COMUNICAÇÃO:
- Seja BREVE mas COMPLETO quando necessário (máximo 50 palavras para respostas simples)
- Use confirmações curtas para ações: "Pronto!", "Feito!", "Preenchendo..."
- Para explicações, seja claro e didático
- Fale em português brasileiro
- Seja amigável, paciente e profissional
- Quando preencher campos, confirme o que foi feito de forma clara

EXEMPLOS DE RESPOSTAS:
✅ "Navegando para criar contrato!"
✅ "Preenchendo endereço do recebedor: 0x123..."
✅ "Valor configurado: 100 USDC"
✅ "Adicionando novo marco de pagamento"
✅ "O Deal-Fi é uma plataforma de contratos escrow onde o dinheiro fica bloqueado até que marcos sejam atingidos. Isso traz transparência e confiança para transações comerciais."

═══════════════════════════════════════════════════════════════════════════════
📋 INSTRUÇÕES TÉCNICAS
═══════════════════════════════════════════════════════════════════════════════

- Use as funções disponíveis para executar ações
- Sempre confirme a ação realizada de forma breve
- Quando o usuário fornecer informações, pergunte se quer preencher o formulário ANTES de preencher
- Se não entender, peça esclarecimento de forma educada
- Para preencher múltiplos campos, faça uma chamada por campo
- Valide informações quando possível (endereços Ethereum, valores numéricos)
- Se o usuário estiver em uma página diferente da necessária, informe e pergunte se quer navegar"""

# ============================================================================
# ENDPOINTS
# ============================================================================

@app.route("/")
def index():
    """Health check"""
    return jsonify({
        "status": "ok",
        "service": "Deal-Fi AI Agent",
        "model": MODEL
    })


@app.post("/chat")
def chat():
    """
    Endpoint principal de chat.
    Recebe mensagens e retorna resposta do GPT com possíveis tool_calls.
    """
    try:
        payload = request.get_json(force=True)
        messages = payload.get("messages", [])
        
        # Adicionar system prompt se não existir
        if not messages or messages[0].get("role") != "system":
            messages.insert(0, {"role": "system", "content": SYSTEM_PROMPT})
        
        # Chamar OpenAI
        completion = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto"
        )
        
        return jsonify(completion.model_dump())
    
    except Exception as e:
        print(f"Erro na API OpenAI: {str(e)}")
        
        error_response = {
            "error": {
                "message": f"Erro na API: {str(e)}",
                "type": "api_error",
                "model_used": MODEL
            }
        }
        return jsonify(error_response), 500


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    # Usar caracteres ASCII para compatibilidade com Windows
    print(f"""
===========================================
       Deal-Fi AI Agent - Backend         
-------------------------------------------
  Modelo: {MODEL:<30} 
  Porta:  {port:<30} 
  URL:    http://localhost:{port:<14} 
===========================================
    """)
    app.run(debug=True, port=port)

