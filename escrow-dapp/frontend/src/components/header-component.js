/**
 * Componente do Header
 */
class HeaderComponent {
    constructor() {
        this.element = null;
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        const headerContainer = document.getElementById('header-component');
        if (headerContainer) {
            headerContainer.innerHTML = `
                <div class="header">
                    <p class="subtitle">Escrow de Pagamentos por Marcos - Contratos Inteligentes Arbitrados</p>
                    <div class="wallet-status" id="walletStatus">
                        🔗 Conectar Carteira
                    </div>
                </div>
            `;
        }
    }

    bindEvents() {
        // Conectar com o serviço de carteira
        const walletStatus = document.getElementById('walletStatus');
        if (walletStatus && window.walletService) {
            walletStatus.addEventListener('click', () => {
                window.walletService.connectWallet();
            });
        }
    }
}

// Instância global do componente
window.headerComponent = new HeaderComponent();
