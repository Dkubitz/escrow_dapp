/**
 * Serviço para gerenciar contratos de escrow
 */
class ContractService {
    constructor() {
        this.contracts = [];
        this.init();
    }

    init() {
        this.loadMockContracts();
    }

    loadMockContracts() {
        // Dados mock para demonstração
        this.contracts = [
            {
                id: 1,
                type: 'construction',
                title: 'Construção Residencial - Casa Modelo A',
                value: 320000,
                clientAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                supplierAddress: '0x8ba1f109551bD432803012645Hac136c772c3c',
                status: 'approved',
                network: 'Polygon',
                currentMilestone: 2,
                totalMilestones: 3,
                nextPayment: 128000,
                milestones: [
                    { id: 1, description: 'Fundação', amount: 96000, status: 'completed' },
                    { id: 2, description: 'Estrutura', amount: 128000, status: 'pending' },
                    { id: 3, description: 'Acabamento', amount: 96000, status: 'pending' }
                ]
            },
            {
                id: 2,
                type: 'services',
                title: 'Instalação Elétrica - Edifício Comercial',
                value: 85000,
                clientAddress: '0x9c8f...2e1',
                supplierAddress: '0x3d4e...7f9',
                status: 'pending',
                network: 'Polygon',
                currentMilestone: 1,
                totalMilestones: 3,
                pendingAmount: 42500,
                milestones: [
                    { id: 1, description: 'Projeto e Materiais', amount: 42500, status: 'pending' },
                    { id: 2, description: 'Instalação', amount: 25500, status: 'pending' },
                    { id: 3, description: 'Testes e Aprovação', amount: 17000, status: 'pending' }
                ]
            },
            {
                id: 3,
                type: 'supply',
                title: 'Fornecimento de Tijolos - Obra Residencial',
                value: 45000,
                clientAddress: '0x1a2b...3c4',
                supplierAddress: '0x5d6e...8f0',
                status: 'disputed',
                network: 'Polygon',
                arbitrator: '0x7f8g...9h0',
                disputedAmount: 22500,
                milestones: [
                    { id: 1, description: 'Entrega 50%', amount: 22500, status: 'completed' },
                    { id: 2, description: 'Entrega 50%', amount: 22500, status: 'disputed' }
                ]
            }
        ];
    }

    async createContract(contractData) {
        try {
            const newContract = {
                id: this.contracts.length + 1,
                ...contractData,
                status: 'pending',
                network: 'Polygon',
                currentMilestone: 1,
                createdAt: new Date().toISOString()
            };

            this.contracts.push(newContract);
            
            return {
                success: true,
                contract: newContract,
                message: 'Contrato criado com sucesso!'
            };
        } catch (error) {
            console.error('Erro ao criar contrato:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    getContracts() {
        return this.contracts;
    }

    getContractById(id) {
        return this.contracts.find(contract => contract.id === id);
    }

    updateContractStatus(contractId, status) {
        const contract = this.getContractById(contractId);
        if (contract) {
            contract.status = status;
            return { success: true, contract };
        }
        return { success: false, error: 'Contrato não encontrado' };
    }

    getSummaryStats() {
        const totalContracts = this.contracts.length;
        const totalValue = this.contracts.reduce((sum, contract) => sum + contract.value, 0);
        const pendingMilestones = this.contracts.reduce((sum, contract) => {
            return sum + contract.milestones.filter(m => m.status === 'pending').length;
        }, 0);
        const disputedContracts = this.contracts.filter(c => c.status === 'disputed').length;

        return {
            totalContracts,
            totalValue: totalValue / 1000, // Em milhares
            pendingMilestones,
            disputedContracts,
            averageFee: 1.5
        };
    }
}

// Instância global do serviço
window.contractService = new ContractService();
