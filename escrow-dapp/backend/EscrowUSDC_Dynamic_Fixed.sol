// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * Escrow com USDC (ERC20) na Polygon - VERSÃO DINÂMICA CORRIGIDA:
 * - Depósito em USDC via approve + deposit(amount)
 * - N marcos dinâmicos (definidos no constructor)
 * - Cancelamento bilateral (retorna o restante ao payer)
 * - Refund unilateral pelo payer permitido APENAS antes do 1º marco
 * - claimAfterDeadline: payee saca o restante após o prazo
 * - Proteções contra front-running e problemas de precisão
 *
 * Observação: taxas de rede (gas) são pagas em POL (token nativo da Polygon).
 */
contract EscrowUSDC_Dynamic_Fixed is ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public payer;
    address payable public payee;
    IERC20 public token;              // ex.: USDC na Polygon
    uint256 public amount;            // total acordado (em unidades do token; USDC tem 6 casas decimais)
    bool public deposited;
    uint256 public deadline;
    
    // Marcos dinâmicos
    uint256 public totalMilestones;
    uint256[] public milestonePercentages;  // [30, 40, 30] = 3 marcos
    uint256[] public milestoneAmounts;      // valores calculados
    bool[] public milestoneExecuted;

    // cancelamento bilateral com proteção contra front-running
    bool public cancelPayerApproved;
    bool public cancelPayeeApproved;
    uint256 public cancelApprovalTime;      // timestamp da primeira aprovação
    uint256 public constant CANCEL_DEADLINE = 1 hours; // 1 hora para aprovar cancelamento

    // eventos
    event Deposited(address indexed from, uint256 amount, uint256 deadline);
    event ReleaseApproval(address indexed by, uint256 milestone);
    event MilestoneReleased(uint256 milestone, uint256 amount);
    event CancelApproved(address indexed by);
    event Cancelled(uint256 amount);
    event Refunded(address indexed to, uint256 amount);
    event DustSwept(address indexed token, uint256 amount);

    constructor(
        address _payer,
        address payable _payee,
        uint256 _duration,
        address _token,
        uint256[] memory _milestonePercentages
    ) {
        require(_payer != address(0), "Payer invalido");
        require(_payee != address(0), "Payee invalido");
        require(_token != address(0), "Token invalido");
        require(_milestonePercentages.length > 0, "Pelo menos 1 marco");
        require(_milestonePercentages.length <= 10, "Maximo 10 marcos");

        // Validar que os percentuais somam 100%
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _milestonePercentages.length; i++) {
            require(_milestonePercentages[i] > 0, "Percentual deve ser > 0");
            totalPercentage += _milestonePercentages[i];
        }
        require(totalPercentage == 100, "Percentuais devem somar 100%");

        payer = _payer;
        payee = _payee;
        token = IERC20(_token);
        deadline = block.timestamp + _duration;
        
        // Configurar marcos
        totalMilestones = _milestonePercentages.length;
        milestonePercentages = _milestonePercentages;
        milestoneExecuted = new bool[](totalMilestones);
        milestoneAmounts = new uint256[](totalMilestones);
    }

    // helpers com proteção contra address(0)
    function getMilestoneAmount(uint256 _milestoneIndex) public view returns (uint256) {
        require(_milestoneIndex < totalMilestones, "Marco invalido");
        require(amount > 0, "Valor nao definido");
        
        // Usar multiplicação antes da divisão para melhor precisão
        return (amount * milestonePercentages[_milestoneIndex]) / 100;
    }

    function remaining() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function getContractStatus() public view returns (
        bool _deposited,
        uint256 _totalMilestones,
        bool[] memory _milestoneExecuted,
        uint256 _remainingAmount
    ) {
        return (deposited, totalMilestones, milestoneExecuted, remaining());
    }

    // === fluxo principal ===

    // antes: payer chama token.approve(address(this), _amount)
    function deposit(uint256 _amount) external nonReentrant {
        require(msg.sender == payer, "Apenas o payer pode depositar");
        require(!deposited, "Ja existe deposito");
        require(_amount > 0, "Valor deve ser > 0");
        require(token.allowance(payer, address(this)) >= _amount, "Aumente approve primeiro");

        amount = _amount;
        deposited = true;

        // Calcular valores dos marcos com melhor precisão
        for (uint256 i = 0; i < totalMilestones; i++) {
            milestoneAmounts[i] = getMilestoneAmount(i);
        }

        token.safeTransferFrom(payer, address(this), _amount);
        emit Deposited(msg.sender, _amount, deadline);
    }

    // aprovar liberacao de marco (qualquer um). exige aprovacao de payer e payee.
    function approveRelease(uint256 _milestoneIndex) external nonReentrant {
        require(deposited, "Nenhum deposito");
        require(block.timestamp <= deadline, "Prazo expirado");
        require(msg.sender == payer || msg.sender == payee, "Somente payer/payee");
        require(_milestoneIndex < totalMilestones, "Marco invalido");
        require(!milestoneExecuted[_milestoneIndex], "Marco ja executado");

        // Verificar se marcos anteriores foram executados
        for (uint256 i = 0; i < _milestoneIndex; i++) {
            require(milestoneExecuted[i], "Execute marcos anteriores primeiro");
        }

        uint256 milestoneAmount = milestoneAmounts[_milestoneIndex];
        milestoneExecuted[_milestoneIndex] = true;

        // Verificação adicional de segurança
        require(payee != address(0), "Endereco payee invalido");
        require(milestoneAmount > 0, "Valor do marco invalido");

        token.safeTransfer(payee, milestoneAmount);
        emit MilestoneReleased(_milestoneIndex, milestoneAmount);

        // Se foi o último marco, finalizar contrato
        if (_milestoneIndex == totalMilestones - 1) {
            deposited = false;
            amount = 0;
        }
    }

    // cancelamento bilateral com proteção contra front-running
    function approveCancel() external nonReentrant {
        require(deposited, "Nenhum deposito");
        require(msg.sender == payer || msg.sender == payee, "Somente payer/payee");

        if (msg.sender == payer) {
            cancelPayerApproved = true;
        } else {
            cancelPayeeApproved = true;
        }

        // Primeira aprovação define o timestamp
        if (cancelApprovalTime == 0) {
            cancelApprovalTime = block.timestamp;
        }

        emit CancelApproved(msg.sender);

        // Só executa se ambas aprovarem E não passou do deadline
        if (cancelPayerApproved && cancelPayeeApproved) {
            require(block.timestamp <= cancelApprovalTime + CANCEL_DEADLINE, "Tempo de aprovacao expirado");
            
            uint256 value = remaining();

            // limpar estado
            deposited = false;
            amount = 0;
            cancelPayerApproved = false;
            cancelPayeeApproved = false;
            cancelApprovalTime = 0;

            // Verificação adicional de segurança
            require(payer != address(0), "Endereco payer invalido");
            if (value > 0) token.safeTransfer(payer, value);
            emit Cancelled(value);
        }
    }

    // refund unilateral (apenas antes do 1º marco)
    function refund() external nonReentrant {
        require(msg.sender == payer, "Apenas o payer pode pedir refund");
        require(deposited, "Nenhum deposito");
        require(block.timestamp <= deadline, "Prazo expirado");
        require(!milestoneExecuted[0], "Primeiro marco ja executado");

        uint256 value = remaining();

        deposited = false;
        amount = 0;

        // Verificação adicional de segurança
        require(payer != address(0), "Endereco payer invalido");
        if (value > 0) token.safeTransfer(payer, value);
        emit Refunded(payer, value);
    }

    // se o prazo expirar e ainda houver saldo, o payee saca o restante
    function claimAfterDeadline() external nonReentrant {
        require(msg.sender == payee, "Apenas o recebedor");
        require(deposited, "Nenhum deposito");
        require(block.timestamp > deadline, "Prazo nao expirou");

        uint256 value = remaining();

        deposited = false;
        amount = 0;

        // Verificação adicional de segurança
        require(payee != address(0), "Endereco payee invalido");
        if (value > 0) {
            token.safeTransfer(payee, value);
            emit MilestoneReleased(totalMilestones - 1, value); // liberacao final do restante
        }
    }

    // Função para recuperar tokens perdidos (dust)
    function sweepDust(address _token, uint256 _amount) external nonReentrant {
        require(msg.sender == payer, "Apenas o payer pode fazer sweep");
        require(!deposited, "Contrato ainda ativo");
        
        if (_token == address(0)) {
            // Sweep POL nativo
            require(_amount <= address(this).balance, "Saldo insuficiente");
            require(payer != address(0), "Endereco payer invalido");
            payable(payer).transfer(_amount);
        } else {
            // Sweep ERC20
            IERC20 tokenToSweep = IERC20(_token);
            require(_amount <= tokenToSweep.balanceOf(address(this)), "Saldo insuficiente");
            require(payer != address(0), "Endereco payer invalido");
            tokenToSweep.safeTransfer(payer, _amount);
        }
        
        emit DustSwept(_token, _amount);
    }

    // Função de emergência para recuperar POL nativo
    receive() external payable {
        // Permite receber POL nativo
    }
}
