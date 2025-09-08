/**
 * Componente dos Cards de Resumo Aurora
 */
class SummaryCardsComponent {
    constructor() {
        this.element = null;
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        const headerContainer = document.getElementById('header-component');
        if (headerContainer) {
            // Adicionar os cards após o header existente
            const existingHeader = headerContainer.innerHTML;
            headerContainer.innerHTML = existingHeader + this.getSummaryCardsHTML();
        }
    }

    getSummaryCardsHTML() {
        return `
            <div class="summary-cards-top">
                <!-- Card 1: Contratos Ativos -->
                <div class="aurora-card">
                    <div class="aurora-background"></div>
                    <div class="card-content">
                        <div class="card-summary">
                            <div class="card-header">📋 Contratos Ativos</div>
                            <div class="card-value">12</div>
                            <div class="card-subtext">Total de contratos em execução</div>
                        </div>
                        <div class="card-details">
                            <div class="details-grid">
                                <div>
                                    <span>Valor Total</span>
                                    <strong>R$ 2.4M</strong>
                                </div>
                                <div>
                                    <span>Marcos Pendentes</span>
                                    <strong>8</strong>
                                </div>
                                <div>
                                    <span>Disputas Abertas</span>
                                    <strong>2</strong>
                                </div>
                                <div>
                                    <span>Taxa Média</span>
                                    <strong>1.5%</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card 2: Saldo em Escrow -->
                <div class="aurora-card">
                    <div class="aurora-background"></div>
                    <div class="card-content">
                        <div class="card-summary">
                            <div class="card-header">💰 Saldo em Escrow</div>
                            <div class="card-value">R$ 847.2K</div>
                            <div class="card-subtext">USDC bloqueado em contratos</div>
                        </div>
                        <div class="card-details">
                            <div class="details-grid">
                                <div>
                                    <span>USDC Total</span>
                                    <strong>1,547.2K</strong>
                                </div>
                                <div>
                                    <span>Valor Médio</span>
                                    <strong>R$ 70.6K</strong>
                                </div>
                                <div>
                                    <span>Maior Contrato</span>
                                    <strong>R$ 320K</strong>
                                </div>
                                <div>
                                    <span>Menor Contrato</span>
                                    <strong>R$ 15K</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card 3: Árbitros Disponíveis -->
                <div class="aurora-card">
                    <div class="aurora-background"></div>
                    <div class="card-content">
                        <div class="card-summary">
                            <div class="card-header">⚖️ Árbitros Ativos</div>
                            <div class="card-value">47</div>
                            <div class="card-subtext">Pool de arbitragem descentralizada</div>
                        </div>
                        <div class="card-details">
                            <div class="details-grid">
                                <div>
                                    <span>Reputação Média</span>
                                    <strong>4.8⭐</strong>
                                </div>
                                <div>
                                    <span>Taxa Média</span>
                                    <strong>2.1%</strong>
                                </div>
                                <div>
                                    <span>Casos Resolvidos</span>
                                    <strong>156</strong>
                                </div>
                                <div>
                                    <span>Tempo Médio</span>
                                    <strong>2.3 dias</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Instância global do componente
window.summaryCardsComponent = new SummaryCardsComponent();
