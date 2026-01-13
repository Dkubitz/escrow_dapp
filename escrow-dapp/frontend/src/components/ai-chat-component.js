/**
 * AI Chat Component
 * Widget de chat flutuante para interação com o agente GPT
 */
class AIChatComponent {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.chatContainer = null;
        this.messagesContainer = null;
        this.inputField = null;
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        console.log('💬 AIChatComponent inicializado');
    }

    /**
     * Renderiza o widget de chat
     */
    render() {
        // Criar container principal
        this.chatContainer = document.createElement('div');
        this.chatContainer.id = 'ai-chat-widget';
        this.chatContainer.className = 'ai-chat-widget';
        
        this.chatContainer.innerHTML = `
            <!-- Botão flutuante -->
            <button class="ai-chat-toggle" id="ai-chat-toggle" title="Assistente AI">
                <span class="chat-icon">💬</span>
                <span class="chat-icon-close" style="display: none;">✕</span>
            </button>

            <!-- Container do chat -->
            <div class="ai-chat-container" id="ai-chat-container" style="display: none;">
                <!-- Header -->
                <div class="ai-chat-header">
                    <div class="ai-chat-title">
                        <span class="ai-avatar">💬</span>
                        <span>Assistente Deal-Fi</span>
                    </div>
                    <div class="ai-chat-actions">
                        <button class="ai-chat-minimize" id="ai-chat-minimize" title="Minimizar">─</button>
                        <button class="ai-chat-close" id="ai-chat-close" title="Fechar">✕</button>
                    </div>
                </div>

                <!-- Mensagens -->
                <div class="ai-chat-messages" id="ai-chat-messages">
                    <div class="ai-message bot">
                        <div class="message-content">
                            Olá! Sou o assistente do Deal-Fi. Posso ajudá-lo a navegar pela plataforma.
                        </div>
                    </div>
                </div>

                <!-- Input -->
                <div class="ai-chat-input-container">
                    <input 
                        type="text" 
                        class="ai-chat-input" 
                        id="ai-chat-input" 
                        placeholder="Digite sua mensagem..."
                        autocomplete="off"
                    />
                    <button class="ai-chat-send" id="ai-chat-send" title="Enviar">
                        ➤
                    </button>
                </div>
            </div>
        `;

        // Adicionar estilos
        this.addStyles();

        // Adicionar ao DOM
        document.body.appendChild(this.chatContainer);

        // Guardar referências
        this.messagesContainer = document.getElementById('ai-chat-messages');
        this.inputField = document.getElementById('ai-chat-input');
    }

    /**
     * Adiciona estilos CSS do chat
     */
    addStyles() {
        const styleId = 'ai-chat-styles';
        if (document.getElementById(styleId)) return;

        const styles = document.createElement('style');
        styles.id = styleId;
        styles.textContent = `
            /* Widget de Chat AI */
            .ai-chat-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            /* Botão flutuante */
            .ai-chat-toggle {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #8247E5 0%, #00D4FF 100%);
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(130, 71, 229, 0.4);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ai-chat-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px rgba(130, 71, 229, 0.6);
            }

            .ai-chat-toggle .chat-icon,
            .ai-chat-toggle .chat-icon-close {
                font-size: 28px;
            }

            /* Container do Chat */
            .ai-chat-container {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 380px;
                max-height: 500px;
                background: rgba(20, 20, 30, 0.95);
                border-radius: 16px;
                border: 1px solid rgba(130, 71, 229, 0.3);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                backdrop-filter: blur(10px);
            }

            /* Header */
            .ai-chat-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: linear-gradient(135deg, rgba(130, 71, 229, 0.3) 0%, rgba(0, 212, 255, 0.2) 100%);
                border-bottom: 1px solid rgba(130, 71, 229, 0.3);
            }

            .ai-chat-title {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #fff;
                font-weight: 600;
                font-size: 14px;
            }

            .ai-avatar {
                font-size: 24px;
            }

            .ai-chat-actions {
                display: flex;
                gap: 8px;
            }

            .ai-chat-actions button {
                width: 28px;
                height: 28px;
                border-radius: 6px;
                border: none;
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
            }

            .ai-chat-actions button:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            /* Mensagens */
            .ai-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-height: 350px;
            }

            .ai-message {
                max-width: 85%;
                padding: 12px 16px;
                border-radius: 16px;
                font-size: 14px;
                line-height: 1.5;
            }

            .ai-message.bot {
                align-self: flex-start;
                background: rgba(130, 71, 229, 0.2);
                border: 1px solid rgba(130, 71, 229, 0.3);
                color: #e0e0e0;
                border-bottom-left-radius: 4px;
            }

            .ai-message.user {
                align-self: flex-end;
                background: linear-gradient(135deg, #8247E5 0%, #00D4FF 100%);
                color: #fff;
                border-bottom-right-radius: 4px;
            }

            .ai-message .message-content {
                word-wrap: break-word;
            }

            .ai-message em {
                color: #00D4FF;
                font-style: normal;
            }

            /* Indicador de digitação */
            .ai-message.typing {
                background: rgba(130, 71, 229, 0.1);
            }

            .typing-indicator {
                display: flex;
                gap: 4px;
            }

            .typing-indicator span {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #8247E5;
                animation: typing 1.4s infinite ease-in-out;
            }

            .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
            .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

            @keyframes typing {
                0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
                40% { transform: scale(1); opacity: 1; }
            }

            /* Input */
            .ai-chat-input-container {
                display: flex;
                padding: 12px;
                gap: 10px;
                border-top: 1px solid rgba(130, 71, 229, 0.2);
                background: rgba(0, 0, 0, 0.2);
            }

            .ai-chat-input {
                flex: 1;
                padding: 12px 16px;
                border-radius: 24px;
                border: 1px solid rgba(130, 71, 229, 0.3);
                background: rgba(255, 255, 255, 0.05);
                color: #fff;
                font-size: 14px;
                outline: none;
                transition: all 0.3s;
            }

            .ai-chat-input:focus {
                border-color: #8247E5;
                background: rgba(255, 255, 255, 0.1);
            }

            .ai-chat-input::placeholder {
                color: rgba(255, 255, 255, 0.4);
            }

            .ai-chat-send {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                border: none;
                background: linear-gradient(135deg, #8247E5 0%, #00D4FF 100%);
                color: #fff;
                cursor: pointer;
                font-size: 18px;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ai-chat-send:hover {
                transform: scale(1.05);
            }

            .ai-chat-send:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            /* Responsivo */
            @media (max-width: 480px) {
                .ai-chat-container {
                    width: calc(100vw - 40px);
                    max-height: 60vh;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Toggle do chat
        const toggleBtn = document.getElementById('ai-chat-toggle');
        const container = document.getElementById('ai-chat-container');
        const closeBtn = document.getElementById('ai-chat-close');
        const minimizeBtn = document.getElementById('ai-chat-minimize');
        const sendBtn = document.getElementById('ai-chat-send');

        toggleBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.closeChat());
        minimizeBtn.addEventListener('click', () => this.minimizeChat());
        sendBtn.addEventListener('click', () => this.sendMessage());

        // Enter para enviar
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    /**
     * Abre/fecha o chat
     */
    toggleChat() {
        this.isOpen = !this.isOpen;
        const container = document.getElementById('ai-chat-container');
        const iconOpen = document.querySelector('.chat-icon');
        const iconClose = document.querySelector('.chat-icon-close');

        if (this.isOpen) {
            container.style.display = 'flex';
            iconOpen.style.display = 'none';
            iconClose.style.display = 'block';
            this.inputField.focus();
        } else {
            container.style.display = 'none';
            iconOpen.style.display = 'block';
            iconClose.style.display = 'none';
        }
    }

    /**
     * Fecha o chat
     */
    closeChat() {
        this.isOpen = false;
        document.getElementById('ai-chat-container').style.display = 'none';
        document.querySelector('.chat-icon').style.display = 'block';
        document.querySelector('.chat-icon-close').style.display = 'none';
    }

    /**
     * Minimiza o chat
     */
    minimizeChat() {
        this.closeChat();
    }

    /**
     * Envia mensagem
     */
    async sendMessage() {
        const text = this.inputField.value.trim();
        if (!text) return;

        // Limpar input
        this.inputField.value = '';

        // Adicionar mensagem do usuário
        this.addMessage(text, 'user');

        // Mostrar indicador de digitação
        this.showTypingIndicator();

        // Enviar para o serviço
        if (window.aiChatService) {
            const response = await window.aiChatService.sendMessage(text);
            
            // Remover indicador de digitação
            this.hideTypingIndicator();
            
            // Adicionar resposta
            this.addMessage(response.text, 'bot');
        } else {
            this.hideTypingIndicator();
            this.addMessage('Erro: Serviço de chat não disponível.', 'bot');
        }
    }

    /**
     * Adiciona mensagem ao chat
     */
    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${type}`;
        messageDiv.innerHTML = `<div class="message-content">${text}</div>`;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    /**
     * Mostra indicador de digitação
     */
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message bot typing';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    /**
     * Remove indicador de digitação
     */
    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Scroll para o final das mensagens
     */
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.aiChatComponent = new AIChatComponent();
});

