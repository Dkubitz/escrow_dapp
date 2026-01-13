/**
 * AI Chat Service
 * Serviço de comunicação com o backend do agente GPT
 */
class AIChatService {
    constructor() {
        // Detectar ambiente e configurar URL do backend
        const isLocalhost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' ||
                          window.location.hostname === '';
        
        // Permitir configurar URL customizada via window.AI_BACKEND_URL
        // Útil para túneis (ngrok) ou backends hospedados
        const customBackendUrl = window.AI_BACKEND_URL;
        
        if (customBackendUrl) {
            // URL customizada configurada (túnel ou backend hospedado)
            this.backendUrl = customBackendUrl;
            this.isAvailable = true;
            console.log('🌐 Usando backend customizado:', customBackendUrl);
        } else if (isLocalhost) {
            // Desenvolvimento local
            this.backendUrl = 'http://localhost:5000';
            this.isAvailable = true;
        } else {
            // Produção (GitHub Pages) - backend não disponível
            // Configure window.AI_BACKEND_URL antes de carregar o script
            // ou hospede o backend em Render/Railway
            this.backendUrl = null;
            this.isAvailable = false;
            console.warn('⚠️ Chat AI não disponível. Configure window.AI_BACKEND_URL ou hospede o backend.');
        }
        
        // Histórico de mensagens para contexto
        this.messages = [];
        
        // Estado
        this.isProcessing = false;
        
        console.log('🤖 AIChatService inicializado', { 
            environment: isLocalhost ? 'local' : 'production',
            backendUrl: this.backendUrl,
            available: this.isAvailable 
        });
    }

    /**
     * Envia mensagem para o agente e processa resposta
     * @param {string} userMessage - Mensagem do usuário
     * @returns {Promise<{text: string, actions: Array}>}
     */
    async sendMessage(userMessage) {
        if (!this.isAvailable) {
            return { 
                text: 'Chat AI disponível apenas em desenvolvimento local. Execute o servidor Flask (python server.py) para usar o chat.', 
                actions: [] 
            };
        }

        if (this.isProcessing) {
            return { text: 'Aguarde a resposta anterior...', actions: [] };
        }

        this.isProcessing = true;

        try {
            // Adicionar mensagem do usuário ao histórico
            this.messages.push({
                role: 'user',
                content: userMessage
            });

            // Chamar backend
            const response = await fetch(`${this.backendUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: this.messages })
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            // Processar resposta do GPT
            const assistantMessage = data.choices[0].message;
            this.messages.push(assistantMessage);

            // Executar tool calls se existirem
            const actions = [];
            if (assistantMessage.tool_calls) {
                for (const toolCall of assistantMessage.tool_calls) {
                    const result = await this.executeToolCall(toolCall);
                    actions.push({
                        name: toolCall.function.name,
                        result: result
                    });

                    // Adicionar resultado ao histórico
                    this.messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: result
                    });
                }

                // Se houve tool calls, buscar resposta final
                const followUpResponse = await fetch(`${this.backendUrl}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: this.messages })
                });

                const followUpData = await followUpResponse.json();
                if (followUpData.choices && followUpData.choices[0].message.content) {
                    const finalMessage = followUpData.choices[0].message;
                    this.messages.push(finalMessage);
                    return { text: finalMessage.content, actions };
                }
            }

            return { 
                text: assistantMessage.content || 'Ação executada!', 
                actions 
            };

        } catch (error) {
            console.error('Erro no chat:', error);
            
            // Mensagem mais clara para erro de conexão
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                return { 
                    text: '❌ Servidor não encontrado. Execute: cd escrow-dapp/ai-agent && python server.py', 
                    actions: [] 
                };
            }
            
            return { 
                text: `Erro: ${error.message}. Verifique se o servidor está rodando na porta 5000.`, 
                actions: [] 
            };
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Executa uma tool call retornada pelo GPT
     * @param {Object} toolCall - Objeto com name e arguments
     * @returns {string} - Resultado da execução
     */
    async executeToolCall(toolCall) {
        const funcName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments || '{}');

        console.log(`🔧 Executando: ${funcName}`, args);

        switch (funcName) {
            case 'navigate_to_page':
                return this.navigateToPage(args.page);

            case 'go_home':
                return this.goHome();

            case 'get_current_page':
                return this.getCurrentPage();

            case 'get_form_fields':
                return this.getFormFields();

            case 'fill_form_field':
                return this.fillFormField(args.field, args.value);

            case 'get_milestones':
                return this.getMilestones();

            case 'add_milestone':
                return this.addMilestone();

            case 'update_milestone':
                return this.updateMilestone(args.index, args.percentage);

            case 'remove_milestone':
                return this.removeMilestone(args.index);

            case 'connect_wallet':
                return await this.connectWallet();

            case 'get_wallet_status':
                return this.getWalletStatus();

            default:
                return `Função ${funcName} não implementada.`;
        }
    }

    // ========================================================================
    // FUNÇÕES DE NAVEGAÇÃO
    // ========================================================================

    /**
     * Navega para uma página específica
     */
    navigateToPage(page) {
        const validPages = ['home', 'create', 'manage'];
        
        if (!validPages.includes(page)) {
            return `Página inválida: ${page}. Páginas válidas: ${validPages.join(', ')}`;
        }

        if (window.navigationService) {
            window.navigationService.navigateTo(page);
            
            const pageNames = {
                home: 'página inicial',
                create: 'criação de contrato',
                manage: 'gerenciamento de contratos'
            };
            
            return `Navegou para ${pageNames[page]}.`;
        }

        return 'Erro: NavigationService não disponível.';
    }

    /**
     * Volta para a página inicial
     */
    goHome() {
        if (window.navigationService) {
            window.navigationService.navigateTo('home');
            return 'Navegou para a página inicial.';
        }
        return 'Erro: NavigationService não disponível.';
    }

    /**
     * Retorna a página atual
     */
    getCurrentPage() {
        if (window.navigationService) {
            const currentPage = window.navigationService.currentPage;
            
            const pageDescriptions = {
                home: 'Você está na página inicial.',
                create: 'Você está na página de criação de contratos.',
                manage: 'Você está na página de gerenciamento de contratos.'
            };
            
            return pageDescriptions[currentPage] || `Página atual: ${currentPage}`;
        }
        return 'Erro: NavigationService não disponível.';
    }

    // ========================================================================
    // FUNÇÕES DE FORMULÁRIO
    // ========================================================================

    /**
     * Obtém os valores atuais dos campos do formulário
     */
    getFormFields() {
        // Verificar se está na página de criação
        if (!window.navigationService || window.navigationService.currentPage !== 'create') {
            return 'Você precisa estar na página de criação de contrato para ver os campos do formulário.';
        }

        const payeeAddress = document.getElementById('payeeAddress')?.value || '';
        const amount = document.getElementById('amount')?.value || '';
        const duration = document.getElementById('duration')?.value || '';

        const fields = {
            payeeAddress: payeeAddress || '(vazio)',
            amount: amount || '(vazio)',
            duration: duration || '(vazio)'
        };

        // Obter informações dos marcos
        const milestonesInfo = this.getMilestonesInfo();

        // Construir mensagem legível
        let message = `📋 Estado do Formulário:\n`;
        message += `• Endereço do Recebedor: ${fields.payeeAddress}\n`;
        message += `• Valor Total: ${fields.amount} USDC\n`;
        message += `• Prazo: ${fields.duration} dias\n`;
        message += `\n${milestonesInfo.mensagem}`;

        return message;
    }

    /**
     * Preenche um campo do formulário
     */
    fillFormField(field, value) {
        // Verificar se está na página de criação
        if (!window.navigationService || window.navigationService.currentPage !== 'create') {
            return 'Você precisa estar na página de criação de contrato para preencher campos.';
        }

        const fieldMap = {
            payeeAddress: {
                id: 'payeeAddress',
                name: 'Endereço do Recebedor',
                validator: (v) => /^0x[a-fA-F0-9]{40}$/.test(v) || 'Endereço inválido. Deve começar com 0x e ter 42 caracteres.'
            },
            amount: {
                id: 'amount',
                name: 'Valor (USDC)',
                validator: (v) => {
                    const num = parseFloat(v);
                    return (!isNaN(num) && num > 0) || 'Valor deve ser um número maior que 0.';
                }
            },
            duration: {
                id: 'duration',
                name: 'Prazo (dias)',
                validator: (v) => {
                    const num = parseInt(v);
                    return (!isNaN(num) && num >= 1 && num <= 365) || 'Prazo deve ser entre 1 e 365 dias.';
                }
            }
        };

        const fieldConfig = fieldMap[field];
        if (!fieldConfig) {
            return `Campo inválido: ${field}. Campos disponíveis: ${Object.keys(fieldMap).join(', ')}`;
        }

        // Validar valor
        const validation = fieldConfig.validator(value);
        if (typeof validation === 'string') {
            return `Erro: ${validation}`;
        }

        // Preencher campo
        const input = document.getElementById(fieldConfig.id);
        if (!input) {
            return `Erro: Campo ${fieldConfig.name} não encontrado no formulário.`;
        }

        input.value = value;
        
        // Disparar evento de input para atualizar cálculos (especialmente para amount)
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));

        return `${fieldConfig.name} preenchido com: ${value}`;
    }

    /**
     * Obtém informações sobre os marcos
     */
    getMilestones() {
        if (!window.navigationService || window.navigationService.currentPage !== 'create') {
            return 'Você precisa estar na página de criação de contrato para ver os marcos.';
        }

        return this.getMilestonesInfo().mensagem;
    }

    /**
     * Função auxiliar para obter informações dos marcos
     */
    getMilestonesInfo() {
        const milestones = [];
        let index = 0;
        
        while (true) {
            const input = document.getElementById(`milestone-${index}`);
            if (!input) break;
            
            const percentage = parseInt(input.value) || 0;
            const valueEl = document.getElementById(`milestone-value-${index}`);
            const value = valueEl?.textContent || '0';
            
            milestones.push({
                index,
                percentage,
                value: value.replace(' USDC', '')
            });
            index++;
        }

        const total = milestones.reduce((sum, m) => sum + m.percentage, 0);
        const isValid = total === 100;

        const mensagem = milestones.length > 0
            ? `Marcos: ${milestones.map(m => `Marco ${m.index + 1}: ${m.percentage}% (${m.value} USDC)`).join(', ')}. Total: ${total}%${isValid ? ' (válido)' : ' (deve somar 100%)'}.`
            : 'Nenhum marco configurado.';

        return { milestones, total, isValid, mensagem };
    }

    /**
     * Adiciona um novo marco
     */
    addMilestone() {
        if (!window.navigationService || window.navigationService.currentPage !== 'create') {
            return 'Você precisa estar na página de criação de contrato para adicionar marcos.';
        }

        if (!window.createContractForm) {
            return 'Erro: CreateContractForm não disponível.';
        }

        if (window.createContractForm.milestones.length >= 10) {
            return 'Erro: Máximo de 10 marcos permitidos.';
        }

        window.createContractForm.addMilestone();
        
        const info = this.getMilestonesInfo();
        return `Marco adicionado! ${info.mensagem}`;
    }

    /**
     * Atualiza o percentual de um marco
     */
    updateMilestone(index, percentage) {
        if (!window.navigationService || window.navigationService.currentPage !== 'create') {
            return 'Você precisa estar na página de criação de contrato para atualizar marcos.';
        }

        if (!window.createContractForm) {
            return 'Erro: CreateContractForm não disponível.';
        }

        if (index < 0 || index >= window.createContractForm.milestones.length) {
            return `Erro: Índice inválido. Marcos disponíveis: 0 a ${window.createContractForm.milestones.length - 1}.`;
        }

        if (percentage < 1 || percentage > 100) {
            return 'Erro: Percentual deve estar entre 1 e 100.';
        }

        window.createContractForm.updateMilestone(index, percentage);
        
        const info = this.getMilestonesInfo();
        return `Marco ${index + 1} atualizado para ${percentage}%! ${info.mensagem}`;
    }

    /**
     * Remove um marco
     */
    removeMilestone(index) {
        if (!window.navigationService || window.navigationService.currentPage !== 'create') {
            return 'Você precisa estar na página de criação de contrato para remover marcos.';
        }

        if (!window.createContractForm) {
            return 'Erro: CreateContractForm não disponível.';
        }

        if (window.createContractForm.milestones.length <= 1) {
            return 'Erro: Não é possível remover o último marco. Deve haver pelo menos um marco.';
        }

        if (index < 0 || index >= window.createContractForm.milestones.length) {
            return `Erro: Índice inválido. Marcos disponíveis: 0 a ${window.createContractForm.milestones.length - 1}.`;
        }

        window.createContractForm.removeMilestone(index);
        
        const info = this.getMilestonesInfo();
        return `Marco ${index + 1} removido! ${info.mensagem}`;
    }

    // ========================================================================
    // FUNÇÕES DE CARTEIRA
    // ========================================================================

    /**
     * Conecta a carteira MetaMask
     */
    async connectWallet() {
        if (!window.walletService) {
            return 'Erro: WalletService não disponível.';
        }

        // Verificar se já está conectado
        if (window.walletService.isConnected && window.walletService.account) {
            return `Carteira já está conectada: ${window.walletService.account.substring(0, 6)}...${window.walletService.account.substring(38)}`;
        }

        // Verificar se MetaMask está disponível
        if (!window.ethereum) {
            return 'Erro: MetaMask não detectado. Por favor, instale a extensão MetaMask e recarregue a página.';
        }

        try {
            // Chamar função de conexão
            const result = await window.walletService.connectWallet();
            
            if (result.success && result.address) {
                const shortAddress = `${result.address.substring(0, 6)}...${result.address.substring(38)}`;
                return `✅ Carteira conectada com sucesso! Endereço: ${shortAddress}\n\nO MetaMask pode ter aberto uma janela para aprovação. Se ainda não conectou, verifique a extensão.`;
            } else {
                return `⚠️ Erro ao conectar carteira: ${result.error || 'Erro desconhecido'}`;
            }
        } catch (error) {
            console.error('Erro ao conectar carteira:', error);
            return `❌ Erro ao conectar carteira: ${error.message}. Verifique se o MetaMask está instalado e ativo.`;
        }
    }

    /**
     * Obtém o status da carteira
     */
    getWalletStatus() {
        if (!window.walletService) {
            return 'Erro: WalletService não disponível.';
        }

        if (window.walletService.isConnected && window.walletService.account) {
            const address = window.walletService.account;
            const shortAddress = `${address.substring(0, 6)}...${address.substring(38)}`;
            return `✅ Carteira conectada\nEndereço: ${shortAddress}\nEndereço completo: ${address}`;
        } else {
            return '❌ Carteira não conectada. Use "conectar carteira" para conectar sua MetaMask.';
        }
    }

    /**
     * Limpa histórico de conversa
     */
    clearHistory() {
        this.messages = [];
        console.log('🗑️ Histórico de chat limpo');
    }
}

// Instanciar e expor globalmente
window.aiChatService = new AIChatService();

