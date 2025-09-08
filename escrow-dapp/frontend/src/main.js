/**
 * Arquivo Principal - Inicialização da Aplicação
 */
class EscrowApp {
    constructor() {
        this.components = [];
        this.init();
    }

    init() {
        console.log('🚀 Inicializando SmartContracts Brasil - Escrow dApp...');
        
        // Aguardar o DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startApp());
        } else {
            this.startApp();
        }
    }

    startApp() {
        try {
            console.log('✅ DOM carregado, iniciando componentes...');
            
            // Verificar se todos os serviços estão disponíveis
            this.checkServices();
            
            // Inicializar componentes na ordem correta
            this.initializeComponents();
            
            console.log('🎉 Aplicação inicializada com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar aplicação:', error);
        }
    }

    checkServices() {
        const requiredServices = ['walletService', 'contractService'];
        const missingServices = requiredServices.filter(service => !window[service]);
        
        if (missingServices.length > 0) {
            throw new Error(`Serviços obrigatórios não encontrados: ${missingServices.join(', ')}`);
        }
        
        console.log('✅ Todos os serviços estão disponíveis');
    }

    initializeComponents() {
        // Ordem de inicialização importante
        const componentOrder = [
            'headerComponent',
            'summaryCardsComponent',
            'contractFormComponent',
            'contractsListComponent'
        ];

        componentOrder.forEach(componentName => {
            if (window[componentName]) {
                console.log(`🔧 Inicializando ${componentName}...`);
                this.components.push(window[componentName]);
            } else {
                console.warn(`⚠️ Componente ${componentName} não encontrado`);
            }
        });

    }

    // Método para recarregar componentes específicos
    reloadComponent(componentName) {
        const component = window[componentName];
        if (component && component.render) {
            console.log(`🔄 Recarregando ${componentName}...`);
            component.render();
        }
    }

    // Método para obter status da aplicação
    getAppStatus() {
        return {
            services: {
                wallet: !!window.walletService,
                contract: !!window.contractService
            },
            components: this.components.map(comp => comp.constructor.name),
            walletConnected: window.walletService?.isConnected || false
        };
    }
}

// Inicializar a aplicação
window.escrowApp = new EscrowApp();

// Log de status para debugging
setTimeout(() => {
    console.log('📊 Status da Aplicação:', window.escrowApp.getAppStatus());
}, 1000);
