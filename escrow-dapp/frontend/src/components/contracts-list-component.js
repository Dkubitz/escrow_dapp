/**
 * Componente da Lista de Contratos Ativos
 */
class ContractsListComponent {
    constructor() {
        this.element = null;
        this.currentView = 'all'; // 'all', 'toPay', 'toReceive'
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        const container = document.getElementById('right-content');
        if (container) {
            // Renderizar diretamente na coluna direita
            container.innerHTML = this.getContractsListHTML();
        }
        this.bindModalEvents();
    }

    bindModalEvents() {
        // Fechar modal ao clicar no botão X
        const modalClose = document.getElementById('modalClose');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }

        // Fechar modal ao clicar fora dele
        const modal = document.getElementById('contractModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    getContractsListHTML() {
        return `
                            <!-- Botão de Navegação para Lista de Contratos -->
                <div class="nav-button expand-button" onclick="window.contractsListComponent.handleManageContracts()">
                    <span class="nav-button-arrow">→</span>
                    <span class="nav-button-icon">📋</span>
                    <div class="nav-button-title">Gerenciar Contratos</div>
                    <div class="nav-button-description">
                        Visualize, gerencie e acompanhe todos os seus contratos de escrow ativos, 
                        com filtros por status e ações de aprovação e liberação de pagamentos.
                    </div>
                </div>
        `;
    }

    renderContractCards() {
        if (!window.contractService) return '';

        const allContracts = window.contractService.getContracts();
        let filteredContracts = [];

        switch (this.currentView) {
            case 'toPay':
                filteredContracts = allContracts.filter(contract => 
                    contract.status === 'pending' || contract.status === 'approved'
                );
                break;
            case 'toReceive':
                filteredContracts = allContracts.filter(contract => 
                    contract.status === 'pending' || contract.status === 'approved'
                );
                break;
            default:
                filteredContracts = allContracts;
        }

        if (filteredContracts.length === 0) {
            return this.renderEmptyState();
        }

        return filteredContracts.map(contract => this.renderContractCard(contract)).join('');
    }

    renderContractCard(contract) {
        const statusColor = this.getStatusColor(contract.status);
        const statusText = this.getStatusText(contract.status);
        
        return `
            <div class="aurora-card" style="margin-bottom: 20px; width: 100%; max-width: none; cursor: pointer;" onclick="window.contractsListComponent.openModal(${contract.id})">
                <div class="aurora-background"></div>
                <div class="card-content">
                    <div class="card-summary">
                        <div class="card-header">${this.getTypeIcon(contract.type)} ${contract.title}</div>
                        <div class="card-value">R$ ${contract.value.toLocaleString('pt-BR')}</div>
                        <div class="card-subtext">Cliente: ${contract.clientAddress.substring(0, 6)}...${contract.clientAddress.substring(38)} | Fornecedor: ${contract.supplierAddress.substring(0, 6)}...${contract.supplierAddress.substring(38)}</div>
                    </div>
                    <div class="card-details">
                        <div class="details-grid">
                            <div>
                                <span>Status</span>
                                <strong style="color: ${statusColor};">${statusText}</strong>
                            </div>
                            <div>
                                <span>Rede</span>
                                <strong>${contract.network}</strong>
                            </div>
                            <div>
                                <span>Marco Atual</span>
                                <strong>${contract.currentMilestone} de ${contract.totalMilestones}</strong>
                            </div>
                            <div>
                                <span>${this.getAmountLabel(contract)}</span>
                                <strong>${this.getAmountValue(contract)}</strong>
                            </div>
                        </div>
                        <div style="margin-top: 20px; text-align: center;">
                            ${this.renderActionButtons(contract)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getTypeIcon(type) {
        const icons = {
            construction: '🏗️',
            services: '🔧',
            supply: '📦',
            consulting: '💼'
        };
        return icons[type] || '📋';
    }

    getStatusColor(status) {
        const colors = {
            pending: '#f59e0b',
            approved: '#10b981',
            released: '#667eea',
            disputed: '#ef4444'
        };
        return colors[status] || '#667eea';
    }

    getStatusText(status) {
        const texts = {
            pending: '⏳ Aguardando Aprovação',
            approved: '✅ Aprovado',
            released: '💰 Liberado',
            disputed: '⚖️ Em Disputa'
        };
        return texts[status] || 'Desconhecido';
    }

    getAmountLabel(contract) {
        if (contract.status === 'approved') return 'Próximo Pagamento';
        if (contract.status === 'pending') return 'Valor Pendente';
        if (contract.status === 'disputed') return 'Valor em Disputa';
        return 'Valor';
    }

    getAmountValue(contract) {
        if (contract.status === 'approved' && contract.nextPayment) {
            return `R$ ${contract.nextPayment.toLocaleString('pt-BR')}`;
        }
        if (contract.status === 'pending' && contract.pendingAmount) {
            return `R$ ${contract.pendingAmount.toLocaleString('pt-BR')}`;
        }
        if (contract.status === 'disputed' && contract.disputedAmount) {
            return `R$ ${contract.disputedAmount.toLocaleString('pt-BR')}`;
        }
        return 'N/A';
    }

    renderActionButtons(contract) {
        if (contract.status === 'approved') {
            return `
                <button class="btn-small btn-release" style="margin-right: 10px;" onclick="window.contractsListComponent.releasePayment(${contract.id})">💰 Liberar Pagamento</button>
                <button class="btn-small btn-dispute" onclick="window.contractsListComponent.openDispute(${contract.id})">⚖️ Abrir Disputa</button>
            `;
        } else if (contract.status === 'pending') {
            return `
                <button class="btn-small btn-approve" style="margin-right: 10px;" onclick="window.contractsListComponent.approveMilestone(${contract.id})">✅ Aprovar Marco</button>
                <button class="btn-small btn-dispute" onclick="window.contractsListComponent.openDispute(${contract.id})">⚖️ Abrir Disputa</button>
            `;
        } else if (contract.status === 'disputed') {
            return `
                <button class="btn-small btn-approve" style="margin-right: 10px;" onclick="window.contractsListComponent.viewArbitrator(${contract.id})">👨‍⚖️ Ver Árbitro</button>
                <button class="btn-small btn-dispute" onclick="window.contractsListComponent.viewDetails(${contract.id})">📋 Ver Detalhes</button>
            `;
        }
        return '';
    }

    async handleManageContracts() {
        console.log('Botão Gerenciar Contratos clicado!');
        
        // Navegação simples sem animação complexa
        if (window.navigationService) {
            window.navigationService.navigateTo('manage');
        } else {
            alert('📋 Função Gerenciar Contratos ativada! (NavigationService não encontrado)');
        }
    }

    getManageContractsContent() {
        return `
            <div class="new-content" style="padding: 60px 40px; color: white; text-align: center; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; background: #1a1a1a;">
                <div style="max-width: 1000px; margin: 0 auto;">
                    <h2 style="margin-bottom: 30px; font-size: 2.5em; color: white;">📋 Gerenciar Contratos</h2>
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 40px; border-radius: 28px; margin-bottom: 30px; border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px);">
                        <h3 style="margin-bottom: 20px; color: #10b981;">Painel de Controle</h3>
                        <p style="margin-bottom: 30px; opacity: 0.8; color: #ccc;">
                            Gerencie todos os seus contratos de escrow com arbitragem inteligente.
                        </p>
                        
                        <!-- Filtros -->
                        <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 30px; flex-wrap: wrap;">
                            <button style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 2px solid rgba(16, 185, 129, 0.4); padding: 12px 24px; border-radius: 20px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-size: 14px;" onmouseover="this.style.background='#10b981'; this.style.color='white';" onmouseout="this.style.background='rgba(16, 185, 129, 0.2)'; this.style.color='#10b981';">
                                📋 Todos os Contratos
                            </button>
                            <button style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 2px solid rgba(245, 158, 11, 0.4); padding: 12px 24px; border-radius: 20px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-size: 14px;" onmouseover="this.style.background='#f59e0b'; this.style.color='white';" onmouseout="this.style.background='rgba(245, 158, 11, 0.2)'; this.style.color='#f59e0b';">
                                ⏳ Pendentes
                            </button>
                            <button style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 2px solid rgba(239, 68, 68, 0.4); padding: 12px 24px; border-radius: 20px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-size: 14px;" onmouseover="this.style.background='#ef4444'; this.style.color='white';" onmouseout="this.style.background='rgba(239, 68, 68, 0.2)'; this.style.color='#ef4444';">
                                ⚖️ Em Disputa
                            </button>
                            <button style="background: rgba(102, 126, 234, 0.2); color: #667eea; border: 2px solid rgba(102, 126, 234, 0.4); padding: 12px 24px; border-radius: 20px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-size: 14px;" onmouseover="this.style.background='#667eea'; this.style.color='white';" onmouseout="this.style.background='rgba(102, 126, 234, 0.2)'; this.style.color='#667eea';">
                                ✅ Finalizados
                            </button>
                        </div>

                        <!-- Lista de Contratos -->
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 30px; border-radius: 20px; margin-bottom: 30px; border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);">
                            <div style="display: grid; gap: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 15px; border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);">
                                    <div style="text-align: left; flex: 1;">
                                        <div style="font-weight: 700; margin-bottom: 8px; color: white; font-size: 16px;">🏗️ Construção Casa Modelo A</div>
                                        <div style="font-size: 14px; color: #ccc; margin-bottom: 5px;">Valor: R$ 150.000 | Marco 2 de 4</div>
                                        <div style="font-size: 12px; color: #aaa;">Cliente: 0x1234...abcd | Fornecedor: 0x5678...efgh</div>
                                    </div>
                                    <div style="display: flex; gap: 12px; align-items: center;">
                                        <span style="background: rgba(245, 158, 11, 0.3); color: #f59e0b; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">⏳ Aguardando Aprovação</span>
                                        <button style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 10px 20px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='none';">✅ Aprovar Marco</button>
                                    </div>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 15px; border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);">
                                    <div style="text-align: left; flex: 1;">
                                        <div style="font-weight: 700; margin-bottom: 8px; color: white; font-size: 16px;">🔧 Serviços de Consultoria</div>
                                        <div style="font-size: 14px; color: #ccc; margin-bottom: 5px;">Valor: R$ 45.000 | Marco 1 de 3</div>
                                        <div style="font-size: 12px; color: #aaa;">Cliente: 0x9abc...1234 | Fornecedor: 0xdef5...6789</div>
                                    </div>
                                    <div style="display: flex; gap: 12px; align-items: center;">
                                        <span style="background: rgba(16, 185, 129, 0.3); color: #10b981; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">✅ Marco Aprovado</span>
                                        <button style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px 20px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='none';">💰 Liberar Pagamento</button>
                                    </div>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 15px; border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);">
                                    <div style="text-align: left; flex: 1;">
                                        <div style="font-weight: 700; margin-bottom: 8px; color: white; font-size: 16px;">📦 Fornecimento de Materiais</div>
                                        <div style="font-size: 14px; color: #ccc; margin-bottom: 5px;">Valor: R$ 78.000 | Marco 3 de 3</div>
                                        <div style="font-size: 12px; color: #aaa;">Cliente: 0xabc1...2345 | Fornecedor: 0x6789...abcd</div>
                                    </div>
                                    <div style="display: flex; gap: 12px; align-items: center;">
                                        <span style="background: rgba(239, 68, 68, 0.3); color: #ef4444; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">⚖️ Em Arbitragem</span>
                                        <button style="background: linear-gradient(135deg, #764ba2 0%, #667eea 100%); color: white; border: none; padding: 10px 20px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='none';">👨‍⚖️ Ver Árbitro</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 18px 40px; border-radius: 25px; font-size: 18px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 35px rgba(16, 185, 129, 0.4)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 8px 25px rgba(16, 185, 129, 0.3)';">
                            🔄 Atualizar Lista de Contratos
                        </button>
                    </div>
                    <div style="opacity: 0.7; font-size: 14px; color: #ccc;">
                        💡 Use os filtros para encontrar contratos específicos e gerencie pagamentos com arbitragem automática
                    </div>
                </div>
            </div>
        `;
    }

    // Métodos de ação
    async releasePayment(contractId) {
        alert(`💰 Liberando pagamento para contrato ${contractId}...`);
    }

    async approveMilestone(contractId) {
        alert(`✅ Aprovando marco para contrato ${contractId}...`);
    }

    async openDispute(contractId) {
        alert(`⚖️ Abrindo disputa para contrato ${contractId}...`);
    }

    async viewArbitrator(contractId) {
        alert(`👨‍⚖️ Visualizando árbitro do contrato ${contractId}...`);
    }

    async viewDetails(contractId) {
        alert(`📋 Visualizando detalhes do contrato ${contractId}...`);
    }

    // Métodos do Modal
    openModal(contractId) {
        const contract = window.contractService.getContractById(contractId);
        if (!contract) return;

        // Encontrar o card clicado
        const clickedCard = document.querySelector(`[onclick*="openModal(${contractId})"]`);
        if (clickedCard) {
            // Adicionar classe de expansão ao card
            clickedCard.classList.add('expanded');
            
            // Aguardar a animação de expansão antes de abrir o modal
            setTimeout(() => {
                this.showModal(contract);
            }, 400); // Tempo da transição CSS
        } else {
            this.showModal(contract);
        }
    }

    showModal(contract) {
        const modal = document.getElementById('contractModal');
        const modalContent = document.getElementById('modalContent');
        
        if (modal && modalContent) {
            modalContent.innerHTML = this.getModalContent(contract);
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Previne scroll da página
        }
    }

    closeModal() {
        const modal = document.getElementById('contractModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto'; // Restaura scroll da página
            
            // Remover classe de expansão de todos os cards
            setTimeout(() => {
                const expandedCards = document.querySelectorAll('.aurora-card.expanded');
                expandedCards.forEach(card => {
                    card.classList.remove('expanded');
                });
            }, 400); // Aguardar fechamento do modal
        }
    }

    getModalContent(contract) {
        const statusColor = this.getStatusColor(contract.status);
        const statusText = this.getStatusText(contract.status);
        
        return `
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1c1c1e; margin-bottom: 10px;">${this.getTypeIcon(contract.type)} ${contract.title}</h2>
                <div style="font-size: 2em; font-weight: 700; color: #667eea; margin-bottom: 20px;">
                    R$ ${contract.value.toLocaleString('pt-BR')}
                </div>
                <div style="background: ${statusColor}20; color: ${statusColor}; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: 600;">
                    ${statusText}
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                <div style="background: rgba(102, 126, 234, 0.1); padding: 20px; border-radius: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #667eea;">👤 Cliente</h4>
                    <div style="font-family: monospace; font-size: 14px;">${contract.clientAddress}</div>
                </div>
                <div style="background: rgba(16, 185, 129, 0.1); padding: 20px; border-radius: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #10b981;">🏗️ Fornecedor</h4>
                    <div style="font-family: monospace; font-size: 14px;">${contract.supplierAddress}</div>
                </div>
            </div>

            <div style="background: rgba(245, 158, 11, 0.1); padding: 20px; border-radius: 15px; margin-bottom: 30px;">
                <h4 style="margin: 0 0 15px 0; color: #f59e0b;">📊 Informações do Contrato</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div>
                        <span style="font-size: 12px; opacity: 0.7;">Rede</span>
                        <div style="font-weight: 600;">${contract.network}</div>
                    </div>
                    <div>
                        <span style="font-size: 12px; opacity: 0.7;">Marco Atual</span>
                        <div style="font-weight: 600;">${contract.currentMilestone} de ${contract.totalMilestones}</div>
                    </div>
                    <div>
                        <span style="font-size: 12px; opacity: 0.7;">${this.getAmountLabel(contract)}</span>
                        <div style="font-weight: 600;">${this.getAmountValue(contract)}</div>
                    </div>
                </div>
            </div>

            ${this.renderModalMilestones(contract)}

            <div style="text-align: center; margin-top: 30px;">
                ${this.renderModalActionButtons(contract)}
            </div>
        `;
    }

    renderModalMilestones(contract) {
        if (!contract.milestones || contract.milestones.length === 0) return '';

        return `
            <div style="background: rgba(118, 75, 162, 0.1); padding: 20px; border-radius: 15px; margin-bottom: 30px;">
                <h4 style="margin: 0 0 15px 0; color: #764ba2;">🎯 Marcos do Projeto</h4>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${contract.milestones.map(milestone => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255, 255, 255, 0.5); border-radius: 10px;">
                            <div>
                                <div style="font-weight: 600;">${milestone.description}</div>
                                <div style="font-size: 14px; opacity: 0.7;">R$ ${milestone.amount.toLocaleString('pt-BR')}</div>
                            </div>
                            <div style="padding: 4px 12px; border-radius: 15px; font-size: 12px; font-weight: 600; 
                                background: ${milestone.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 
                                           milestone.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' : 
                                           'rgba(239, 68, 68, 0.2)'};
                                color: ${milestone.status === 'completed' ? '#10b981' : 
                                       milestone.status === 'pending' ? '#f59e0b' : '#ef4444'};">
                                ${milestone.status === 'completed' ? '✅ Concluído' : 
                                  milestone.status === 'pending' ? '⏳ Pendente' : '⚖️ Em Disputa'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderModalActionButtons(contract) {
        if (contract.status === 'approved') {
            return `
                <button class="btn-small btn-release" style="margin-right: 10px;" onclick="window.contractsListComponent.releasePayment(${contract.id})">💰 Liberar Pagamento</button>
                <button class="btn-small btn-dispute" onclick="window.contractsListComponent.openDispute(${contract.id})">⚖️ Abrir Disputa</button>
            `;
        } else if (contract.status === 'pending') {
            return `
                <button class="btn-small btn-approve" style="margin-right: 10px;" onclick="window.contractsListComponent.approveMilestone(${contract.id})">✅ Aprovar Marco</button>
                <button class="btn-small btn-dispute" onclick="window.contractsListComponent.openDispute(${contract.id})">⚖️ Abrir Disputa</button>
            `;
        } else if (contract.status === 'disputed') {
            return `
                <button class="btn-small btn-approve" style="margin-right: 10px;" onclick="window.contractsListComponent.viewArbitrator(${contract.id})">👨‍⚖️ Ver Árbitro</button>
                <button class="btn-small btn-dispute" onclick="window.contractsListComponent.viewDetails(${contract.id})">📋 Ver Detalhes</button>
            `;
        }
        return '';
    }

    // Método para alternar entre as visualizações
    switchView(view) {
        this.currentView = view;
        this.render();
    }

    // Renderizar estado vazio quando não há contratos
    renderEmptyState() {
        const messages = {
            'toPay': {
                emoji: '💰',
                title: 'Nenhum contrato a pagar',
                subtitle: 'Todos os contratos estão em dia!'
            },
            'toReceive': {
                emoji: '🎯',
                title: 'Nenhum contrato a receber',
                subtitle: 'Todos os contratos foram finalizados!'
            },
            'all': {
                emoji: '📋',
                title: 'Nenhum contrato encontrado',
                subtitle: 'Crie seu primeiro contrato de escrow!'
            }
        };

        const message = messages[this.currentView] || messages['all'];

        return `
            <div class="empty-state" style="text-align: center; padding: 40px; border-radius: 15px; border: 2px dashed rgba(102, 126, 234, 0.3); background: rgba(102, 126, 234, 0.05);">
                <div style="font-size: 48px; margin-bottom: 15px;">${message.emoji}</div>
                <div style="font-weight: 600; margin-bottom: 8px; color: #667eea;">${message.title}</div>
                <div style="color: rgba(102, 126, 234, 0.7); font-size: 14px;">${message.subtitle}</div>
            </div>
        `;
    }


}

// Instância global do componente
window.contractsListComponent = new ContractsListComponent();
