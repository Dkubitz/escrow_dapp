/**
 * Serviço para gerenciar conexão de carteira
 */
class WalletService {
    constructor() {
        this.isConnected = false;
        this.walletAddress = null;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Event listener será adicionado pelo componente header
    }

    async connectWallet() {
        try {
            // Simulação de conexão (será substituída por MetaMask real)
            if (!this.isConnected) {
                this.isConnected = true;
                this.walletAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
                this.updateWalletStatus();
                return { success: true, address: this.walletAddress };
            } else {
                this.disconnectWallet();
                return { success: true, disconnected: true };
            }
        } catch (error) {
            console.error('Erro ao conectar carteira:', error);
            return { success: false, error: error.message };
        }
    }

    disconnectWallet() {
        this.isConnected = false;
        this.walletAddress = null;
        this.updateWalletStatus();
    }

    updateWalletStatus() {
        const walletStatus = document.getElementById('walletStatus');
        if (walletStatus) {
            if (this.isConnected) {
                walletStatus.textContent = `🔗 ${this.walletAddress.substring(0, 6)}...${this.walletAddress.substring(38)} (Conectado)`;
                walletStatus.style.background = 'rgba(16, 185, 129, 0.1)';
                walletStatus.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                walletStatus.style.color = '#10b981';
            } else {
                walletStatus.textContent = '🔗 Conectar Carteira';
                walletStatus.style.background = 'rgba(102, 126, 234, 0.1)';
                walletStatus.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                walletStatus.style.color = '#667eea';
            }
        }
    }

    getWalletInfo() {
        return {
            isConnected: this.isConnected,
            address: this.walletAddress
        };
    }
}

// Instância global do serviço
window.walletService = new WalletService();
