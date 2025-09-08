/**
 * Serviço de Navegação
 * Gerencia rotas e navegação entre páginas da aplicação
 */
class NavigationService {
    constructor() {
        this.currentPage = 'home';
        this.pages = {
            home: {
                id: 'home',
                title: 'Deal-Fi - Home',
                component: 'home-view'
            },
            create: {
                id: 'create',
                title: 'Deal-Fi - Criar Contrato',
                component: 'create-contract-view'
            },
            manage: {
                id: 'manage',
                title: 'Deal-Fi - Gerenciar Contratos',
                component: 'manage-contracts-view'
            }
        };
        
        this.init();
    }

    init() {
        // Configurar listener para mudanças de hash
        window.addEventListener('hashchange', this.handleHashChange.bind(this));
        
        // Aguardar o DOM estar pronto e dar tempo para os componentes carregarem
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.initializeNavigation(), 1000);
            });
        } else {
            setTimeout(() => this.initializeNavigation(), 1000);
        }
        
        // Configurar eventos do modal
        this.setupModalEvents();
    }

    /**
     * Inicializa a navegação após o DOM estar pronto
     */
    initializeNavigation() {
        // Verificar se há hash na URL
        if (!window.location.hash) {
            // Sem hash = página inicial, não fazer nada
            this.currentPage = 'home';
            console.log('🏠 Página inicial - componentes existentes mantidos');
        } else {
            // Com hash = navegar para a página específica
            this.handleHashChange();
        }
    }

    /**
     * Navega para uma página específica
     */
    navigateTo(pageId) {
        const page = this.pages[pageId];
        if (!page) {
            console.error(`Página não encontrada: ${pageId}`);
            return;
        }

        // Atualizar estado atual
        this.currentPage = pageId;
        
        // Atualizar título da página
        document.title = page.title;
        
        // Renderizar página
        this.renderPage(pageId);
        
        // Atualizar hash da URL
        window.location.hash = `#${pageId}`;
        
        console.log(`🚀 Navegando para: ${page.title}`);
    }

    /**
     * Manipula mudanças no hash da URL
     */
    handleHashChange() {
        const hash = window.location.hash.replace('#', '');
        const pageId = hash || 'home';
        
        // Evitar renderização dupla se já estiver na página correta
        if (this.currentPage === pageId) {
            return;
        }
        
        if (this.pages[pageId]) {
            this.currentPage = pageId;
            this.renderPage(pageId);
        } else {
            console.warn(`Página não encontrada: ${pageId}, redirecionando para home`);
            this.navigateTo('home');
        }
    }

    /**
     * Renderiza a página solicitada
     */
    renderPage(pageId) {
        const page = this.pages[pageId];
        const mainContainer = document.querySelector('.main-container');
        
        if (!mainContainer) {
            console.error('Container principal não encontrado');
            return;
        }
        // Fade out suave do conteúdo atual
        mainContainer.classList.add('fade-out');

        // Após a transição, troca o conteúdo e faz fade in
        setTimeout(() => {
            // Limpar container
            mainContainer.innerHTML = '';
        
            // Renderizar página específica
            switch (pageId) {
                case 'home':
                    this.renderHomePage(mainContainer);
                    break;
                case 'create':
                    this.renderCreatePage(mainContainer);
                    break;
                case 'manage':
                    this.renderManagePage(mainContainer);
                    break;
                default:
                    this.renderHomePage(mainContainer);
            }

            // Pequeno timeout para garantir reflow antes de remover fade-out
            requestAnimationFrame(() => {
                mainContainer.classList.remove('fade-out');
            });
        }, 180); // combina com o transition do CSS
    }

    /**
     * Renderiza a página inicial
     */
    renderHomePage(container) {
        container.innerHTML = `
            <div class="home-content">
                <div class="welcome-section">
                    <h2>🏠 Bem-vindo ao Deal-Fi</h2>
                    <p>Plataforma de escrow não-custodial para contratos inteligentes</p>
                </div>
                
                <div class="quick-actions">
                    <div class="action-card" onclick="window.navigationService.navigateTo('create')">
                        <div class="action-icon">📝</div>
                        <h3>Criar Novo Contrato</h3>
                        <p>Configure e crie um novo contrato de escrow</p>
                    </div>
                    
                    <div class="action-card" onclick="window.navigationService.navigateTo('manage')">
                        <div class="action-icon">📋</div>
                        <h3>Gerenciar Contratos</h3>
                        <p>Visualize e gerencie seus contratos ativos</p>
                    </div>
                </div>
            </div>
        `;
        
        console.log('🏠 Página inicial renderizada com botões de navegação');
    }

    /**
     * Renderiza a página de criação de contratos
     */
    renderCreatePage(container) {
        container.innerHTML = `
            <div class="create-contract-page">
                <!-- Botão Voltar no canto superior esquerdo -->
                <div class="top-back-button">
                    <button class="back-btn-top" onclick="window.navigationService.restoreHomePage()">
                        ← Voltar
                    </button>
                </div>
                
                <div class="page-header">
                    <h2>📝 Criar Novo Contrato de Escrow</h2>
                </div>
                
                <div class="contract-form-container">
                    <form class="contract-form" id="createContractForm">
                        <div class="form-group">
                            <label for="contractType">Tipo de Contrato</label>
                            <select id="contractType" required>
                                <option value="">Selecione o tipo</option>
                                <option value="construction">🏗️ Construção Civil</option>
                                <option value="services">🔧 Prestação de Serviços</option>
                                <option value="supply">📦 Fornecimento de Materiais</option>
                                <option value="consulting">💼 Consultoria</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="clientAddress">Endereço do Cliente (Carteira)</label>
                            <input type="text" id="clientAddress" placeholder="0x1234...abcd" required>
                        </div>

                        <div class="form-group">
                            <label for="supplierAddress">Endereço do Fornecedor (Carteira)</label>
                            <input type="text" id="supplierAddress" placeholder="0xabcd...1234" required>
                        </div>

                        <div class="form-group">
                            <label for="totalValue">Valor Total do Contrato (R$)</label>
                            <input type="number" id="totalValue" placeholder="50000" min="1000" required>
                        </div>

                        <div class="form-group">
                            <label for="milestoneCount">Número de Marcos</label>
                            <select id="milestoneCount" required>
                                <option value="">Selecione</option>
                                <option value="2">2 Marcos</option>
                                <option value="3">3 Marcos</option>
                                <option value="4">4 Marcos</option>
                                <option value="5">5 Marcos</option>
                            </select>
                        </div>

                        <button type="submit" class="btn-primary">
                            🚀 Criar Contrato
                        </button>
                    </form>
                </div>
            </div>
        `;

        // Adicionar event listener para o formulário
        this.bindCreateFormEvents();
    }

    /**
     * Renderiza a página de gerenciamento de contratos
     */
    renderManagePage(container) {
        container.innerHTML = `
            <div class="manage-contracts-page">
                <!-- Botão Voltar no canto superior esquerdo -->
                <div class="top-back-button">
                    <button class="back-btn-top" onclick="window.navigationService.restoreHomePage()">
                        ← Voltar
                    </button>
                </div>
                
                <div class="page-header">
                    <h2>📋 Gerenciar Contratos</h2>
                </div>
                
                <div class="contracts-filters">
                    <button class="filter-btn active" data-filter="all">📋 Todos</button>
                    <button class="filter-btn" data-filter="pending">⏳ Pendentes</button>
                    <button class="filter-btn" data-filter="active">✅ Ativos</button>
                    <button class="filter-btn" data-filter="disputed">⚠️ Disputados</button>
                </div>
                
                <div class="contracts-list" id="contractsList">
                    <!-- Contratos serão renderizados aqui -->
                </div>
            </div>
        `;

        // Renderizar contratos
        this.renderContractsList();
        this.bindFilterEvents();
    }

    /**
     * Renderiza a lista de contratos
     */
    renderContractsList() {
        const contractsList = document.getElementById('contractsList');
        if (!contractsList) return;

        // Usar dados do ContractService
        const contracts = window.contractService?.getContracts() || [];
        
        if (contracts.length === 0) {
            contractsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>Nenhum contrato encontrado</h3>
                    <p>Crie seu primeiro contrato de escrow para começar</p>
                    <button class="btn-primary" onclick="window.navigationService.navigateTo('create')">
                        Criar Primeiro Contrato
                    </button>
                </div>
            `;
            return;
        }

        contractsList.innerHTML = contracts.map(contract => `
            <div class="contract-item" data-status="${contract.status}">
                <div class="contract-header">
                    <h4>${contract.title}</h4>
                    <span class="status-badge ${contract.status}">${this.getStatusText(contract.status)}</span>
                </div>
                <div class="contract-details">
                    <p><strong>Valor:</strong> R$ ${(contract.totalValue || 0).toLocaleString()}</p>
                    <p><strong>Marcos:</strong> ${(contract.milestones || []).length}</p>
                    <p><strong>Criado:</strong> ${contract.createdAt ? new Date(contract.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
                </div>
                <div class="contract-actions">
                    <button class="btn-secondary" onclick="window.navigationService.viewContract('${contract.id}')">
                        👁️ Ver Detalhes
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Retorna texto do status
     */
    getStatusText(status) {
        const statusMap = {
            'pending': '⏳ Pendente',
            'active': '✅ Ativo',
            'disputed': '⚠️ Disputado',
            'completed': '🎉 Concluído'
        };
        return statusMap[status] || status;
    }

    /**
     * Bind dos eventos do formulário de criação
     */
    bindCreateFormEvents() {
        const form = document.getElementById('createContractForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateContract();
            });
        }
    }

    /**
     * Bind dos eventos de filtro
     */
    bindFilterEvents() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remover classe active de todos
                filterBtns.forEach(b => b.classList.remove('active'));
                // Adicionar classe active ao clicado
                e.target.classList.add('active');
                
                // Aplicar filtro
                const filter = e.target.dataset.filter;
                this.applyFilter(filter);
            });
        });
    }

    /**
     * Aplica filtro na lista de contratos
     */
    applyFilter(filter) {
        const contractItems = document.querySelectorAll('.contract-item');
        
        contractItems.forEach(item => {
            if (filter === 'all' || item.dataset.status === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    /**
     * Visualiza detalhes de um contrato
     */
    viewContract(contractId) {
        console.log(`👁️ Visualizando contrato: ${contractId}`);
        
        // Buscar contrato na lista
        const contract = this.contracts.find(c => c.id === contractId);
        
        if (contract) {
            // Mostrar modal com detalhes
            this.showContractModal(contract);
        } else {
            console.warn(`Contrato não encontrado: ${contractId}`);
        }
    }

    /**
     * Mostra modal com detalhes do contrato
     */
    showContractModal(contract) {
        const modal = document.getElementById('contractModal');
        const modalContent = document.getElementById('modalContent');
        
        if (modal && modalContent) {
            modalContent.innerHTML = `
                <div class="contract-modal-header">
                    <h3>${contract.title}</h3>
                    <span class="status-badge ${contract.status}">${this.getStatusText(contract.status)}</span>
                </div>
                <div class="contract-modal-body">
                    <p><strong>Tipo:</strong> ${contract.type}</p>
                    <p><strong>Valor:</strong> R$ ${(contract.totalValue || 0).toLocaleString()}</p>
                    <p><strong>Marcos:</strong> ${(contract.milestones || []).length}</p>
                    <p><strong>Cliente:</strong> ${contract.clientAddress || 'N/A'}</p>
                    <p><strong>Fornecedor:</strong> ${contract.supplierAddress || 'N/A'}</p>
                    <p><strong>Criado:</strong> ${contract.createdAt ? new Date(contract.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
                </div>
            `;
            
            modal.style.display = 'block';
        }
    }

    /**
     * Manipula criação de contrato
     */
    handleCreateContract() {
        const formData = new FormData(document.getElementById('createContractForm'));
        const contractData = {
            type: document.getElementById('contractType').value,
            clientAddress: document.getElementById('clientAddress').value,
            supplierAddress: document.getElementById('supplierAddress').value,
            totalValue: parseFloat(document.getElementById('totalValue').value),
            milestoneCount: parseInt(document.getElementById('milestoneCount').value)
        };

        // Validar dados
        if (!this.validateContractData(contractData)) {
            return;
        }

        // Criar contrato via ContractService
        if (window.contractService) {
            const newContract = window.contractService.createContract(contractData);
            if (newContract) {
                alert('✅ Contrato criado com sucesso!');
                this.navigateTo('manage');
            } else {
                alert('❌ Erro ao criar contrato. Tente novamente.');
            }
        }
    }

    /**
     * Valida dados do contrato
     */
    validateContractData(data) {
        if (!data.type) {
            alert('❌ Selecione o tipo de contrato');
            return false;
        }
        if (!data.clientAddress || !data.supplierAddress) {
            alert('❌ Preencha os endereços das carteiras');
            return false;
        }
        if (!data.totalValue || data.totalValue < 1000) {
            alert('❌ Valor deve ser maior que R$ 1.000');
            return false;
        }
        if (!data.milestoneCount || data.milestoneCount < 2) {
            alert('❌ Selecione pelo menos 2 marcos');
            return false;
        }
        return true;
    }

    /**
     * Obtém página atual
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Verifica se está em uma página específica
     */
    isOnPage(pageId) {
        return this.currentPage === pageId;
    }

    /**
     * Restaura a página inicial (para uso do botão voltar)
     */
    restoreHomePage() {
        console.log('🔄 Restaurando página inicial...');
        
        // Limpar hash da URL sem recarregar
        history.replaceState(null, '', ' ');
        
        // Atualizar estado e renderizar home
        this.currentPage = 'home';
        this.renderPage('home');
    }
    
    /**
     * Configura eventos do modal
     */
    setupModalEvents() {
        // Fechar modal ao clicar no X
        const closeBtn = document.getElementById('modalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const modal = document.getElementById('contractModal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        }

        // Fechar modal ao clicar fora dele
        const modal = document.getElementById('contractModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }
}

// Instância global do serviço
window.navigationService = new NavigationService();

// Log de debug
console.log('🔧 NavigationService inicializado:', window.navigationService);
