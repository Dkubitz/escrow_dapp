// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title EscrowUSDC_MilestonesBased
 * @notice Contrato de escrow com marcos baseado no diagrama Mermaid aprovado
 * 
 * REGRAS PRINCIPAIS:
 * 1. Taxa de plataforma: 1 USDC obrigatório antes do depósito
 * 2. Confirmações mútuas: Ambas as partes devem confirmar identidade
 * 3. releaseMilestone(): Funciona SEMPRE (antes e depois do prazo)
 * 4. approveCancel(): Funciona SEMPRE (cancelamento bilateral a qualquer momento)
 * 5. Settlement: Permite acordos parciais durante cancelamento
 * 6. claimAfterDeadline(): Apenas PAYER pode sacar após prazo (não payee!)
 * 7. refund(): Apenas ANTES do 1º marco (arrependimento rápido)
 * 
 * @dev Baseado em discussões sobre flexibilidade pós-prazo e justiça contratual
 */
contract EscrowUSDC_MilestonesBased is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============================================
    // ESTADO DO CONTRATO
    // ============================================
    
    address public immutable payer;
    address public immutable payee;
    IERC20 public immutable token;
    uint256 public immutable deadline;
    
    // Endereço da plataforma (hardcoded conforme especificação)
    address public constant PLATFORM_ADDRESS = 0xC101e76Da55BC93438a955546E93D56312a3CF16;
    uint256 public constant PLATFORM_FEE = 1e6; // 1 USDC (6 decimais)
    
    // Estado do contrato
    uint256 public totalAmount;
    bool public deposited;
    bool public platformFeePaid;
    bool public confirmedPayer;
    bool public confirmedPayee;
    
    // Marcos
    struct Milestone {
        uint256 percentage;  // Percentual (ex: 20 para 20%)
        uint256 amount;      // Valor calculado
        bool released;       // Já foi liberado?
    }
    
    Milestone[] public milestones;
    
    // Cancelamento bilateral
    bool public cancelApprovedPayer;
    bool public cancelApprovedPayee;
    uint256 public cancelApprovedTimePayer;
    uint256 public cancelApprovedTimePayee;
    uint256 public constant CANCEL_WINDOW = 1 hours;
    
    // Settlement (acordo parcial)
    uint256 public settlementAmount;
    bool public settlementApproved;
    uint256 public settlementProposedTime;
    uint256 public constant SETTLEMENT_WINDOW = 1 hours;

    // ============================================
    // EVENTOS
    // ============================================
    
    event PlatformFeePaid(address indexed payer, uint256 amount);
    event ConfirmedPayer(address indexed payer);
    event ConfirmedPayee(address indexed payee);
    event Deposited(address indexed payer, uint256 amount);
    event MilestoneReleased(uint256 indexed index, uint256 amount);
    event CancelApprovedByPayer();
    event CancelApprovedByPayee();
    event Cancelled(uint256 amountReturned);
    event SettlementProposed(uint256 amount);
    event SettlementApproved();
    event Settled(uint256 amountToPayee, uint256 amountToPayer);
    event Refunded(uint256 amount);
    event ClaimedAfterDeadline(uint256 amount);

    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    /**
     * @notice Cria um novo contrato de escrow
     * @param _payer Endereço do pagador
     * @param _payee Endereço do recebedor
     * @param _duration Duração do contrato em segundos
     * @param _token Endereço do token USDC
     * @param _milestonePercentages Array de percentuais (deve somar 100)
     */
    constructor(
        address _payer,
        address _payee,
        uint256 _duration,
        address _token,
        uint256[] memory _milestonePercentages
    ) {
        // Validações do construtor
        require(_payer != address(0), "Payer invalido");
        require(_payee != address(0), "Payee invalido");
        require(_payer != _payee, "Payer e Payee devem ser diferentes");
        require(_token != address(0), "Token invalido");
        require(_duration > 0, "Duracao deve ser > 0");
        require(_milestonePercentages.length > 0, "Pelo menos 1 marco");
        require(_milestonePercentages.length <= 10, "Maximo 10 marcos");
        
        // Validar que percentuais somam 100
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _milestonePercentages.length; i++) {
            require(_milestonePercentages[i] > 0, "Percentual deve ser > 0");
            totalPercentage += _milestonePercentages[i];
        }
        require(totalPercentage == 100, "Percentuais devem somar 100");
        
        // Inicializar variáveis
        payer = _payer;
        payee = _payee;
        token = IERC20(_token);
        deadline = block.timestamp + _duration;
        
        // Criar marcos (valores serão calculados após depósito)
        for (uint256 i = 0; i < _milestonePercentages.length; i++) {
            milestones.push(Milestone({
                percentage: _milestonePercentages[i],
                amount: 0,
                released: false
            }));
        }
    }

    // ============================================
    // FASE 1: TAXA DE PLATAFORMA
    // ============================================
    
    /**
     * @notice Paga a taxa de plataforma de 1 USDC
     * @dev Pode ser chamado por payer ou payee
     * @dev Deve ser aprovado antes: token.approve(address(this), 1e6)
     */
    function payPlatformFee() external nonReentrant {
        require(!platformFeePaid, "Taxa ja paga");
        require(msg.sender == payer || msg.sender == payee, "Apenas payer ou payee");
        require(token.allowance(msg.sender, address(this)) >= PLATFORM_FEE, "Approve insuficiente");
        
        platformFeePaid = true;
        
        token.safeTransferFrom(msg.sender, PLATFORM_ADDRESS, PLATFORM_FEE);
        emit PlatformFeePaid(msg.sender, PLATFORM_FEE);
    }

    // ============================================
    // FASE 2: CONFIRMAÇÕES MÚTUAS
    // ============================================
    
    /**
     * @notice Payer confirma sua identidade/carteira
     */
    function confirmPayer() external {
        require(msg.sender == payer, "Apenas payer");
        require(platformFeePaid, "Taxa nao paga");
        require(!confirmedPayer, "Ja confirmado");
        
        confirmedPayer = true;
        emit ConfirmedPayer(msg.sender);
    }
    
    /**
     * @notice Payee confirma sua identidade/carteira
     */
    function confirmPayee() external {
        require(msg.sender == payee, "Apenas payee");
        require(platformFeePaid, "Taxa nao paga");
        require(!confirmedPayee, "Ja confirmado");
        
        confirmedPayee = true;
        emit ConfirmedPayee(msg.sender);
    }

    // ============================================
    // FASE 3: DEPÓSITO
    // ============================================
    
    /**
     * @notice Deposita o valor total do contrato
     * @param _amount Valor total em USDC (6 decimais)
     * @dev Antes: token.approve(address(this), _amount)
     */
    function deposit(uint256 _amount) external nonReentrant {
        require(msg.sender == payer, "Apenas payer");
        require(platformFeePaid, "Taxa nao paga");
        require(confirmedPayer && confirmedPayee, "Confirmacoes pendentes");
        require(!deposited, "Ja depositado");
        require(_amount > 0, "Valor deve ser > 0");
        require(token.allowance(payer, address(this)) >= _amount, "Approve insuficiente");
        
        totalAmount = _amount;
        deposited = true;
        
        // Calcular valores dos marcos
        for (uint256 i = 0; i < milestones.length; i++) {
            milestones[i].amount = (_amount * milestones[i].percentage) / 100;
        }
        
        token.safeTransferFrom(payer, address(this), _amount);
        emit Deposited(payer, _amount);
    }

    // ============================================
    // FASE 4: LIBERAÇÃO DE MARCOS
    // ============================================
    
    /**
     * @notice Libera um marco específico
     * @param index Índice do marco (0-based)
     * @dev FUNCIONA SEMPRE (antes e depois do deadline)
     * @dev Apenas payer pode liberar marcos
     */
    function releaseMilestone(uint256 index) external nonReentrant {
        require(msg.sender == payer, "Apenas payer");
        require(deposited, "Nao depositado");
        require(index < milestones.length, "Indice invalido");
        require(!milestones[index].released, "Marco ja liberado");
        
        // Verificar sequencialidade
        if (index > 0) {
            require(milestones[index - 1].released, "Marco anterior nao liberado");
        }
        
        uint256 amount = milestones[index].amount;
        milestones[index].released = true;
        
        token.safeTransfer(payee, amount);
        emit MilestoneReleased(index, amount);
        
        // Se foi o último marco, encerrar contrato
        if (index == milestones.length - 1) {
            deposited = false;
        }
    }

    // ============================================
    // FASE 5: CANCELAMENTO BILATERAL
    // ============================================
    
    /**
     * @notice Aprova cancelamento bilateral
     * @dev FUNCIONA SEMPRE (antes e depois do deadline)
     * @dev Qualquer parte pode iniciar
     */
    function approveCancel() external nonReentrant {
        require(deposited, "Nao depositado");
        require(msg.sender == payer || msg.sender == payee, "Apenas payer ou payee");
        
        if (msg.sender == payer) {
            cancelApprovedPayer = true;
            cancelApprovedTimePayer = block.timestamp;
            emit CancelApprovedByPayer();
        } else {
            cancelApprovedPayee = true;
            cancelApprovedTimePayee = block.timestamp;
            emit CancelApprovedByPayee();
        }
        
        // Se ambos aprovaram, executar cancelamento
        if (cancelApprovedPayer && cancelApprovedPayee) {
            _executeCancel();
        }
    }
    
    /**
     * @notice Executa o cancelamento após ambas aprovações
     * @dev Interno, verifica janela de 1h
     */
    function _executeCancel() private {
        // Verificar se ambas aprovações estão dentro da janela de 1h
        uint256 firstApproval = cancelApprovedTimePayer < cancelApprovedTimePayee 
            ? cancelApprovedTimePayer 
            : cancelApprovedTimePayee;
        uint256 lastApproval = cancelApprovedTimePayer > cancelApprovedTimePayee 
            ? cancelApprovedTimePayer 
            : cancelApprovedTimePayee;
            
        require(lastApproval <= firstApproval + CANCEL_WINDOW, "Janela de 1h expirada");
        
        uint256 balance = token.balanceOf(address(this));
        
        // Verificar se há settlement aprovado
        if (settlementAmount > 0 && settlementApproved) {
            _executeSettlement(balance);
        } else {
            _executeCancelPure(balance);
        }
    }
    
    /**
     * @notice Cancelamento puro (100% volta ao payer)
     */
    function _executeCancelPure(uint256 balance) private {
        // Limpar estado
        deposited = false;
        totalAmount = 0;
        cancelApprovedPayer = false;
        cancelApprovedPayee = false;
        cancelApprovedTimePayer = 0;
        cancelApprovedTimePayee = 0;
        
        if (balance > 0) {
            token.safeTransfer(payer, balance);
        }
        emit Cancelled(balance);
    }

    // ============================================
    // FASE 6: SETTLEMENT (ACORDO PARCIAL)
    // ============================================
    
    /**
     * @notice Propõe um settlement (acordo parcial)
     * @param amount Valor a ser pago ao payee
     * @dev FUNCIONA SEMPRE (antes e depois do deadline)
     * @dev Apenas payer pode propor
     */
    function proposeSettlement(uint256 amount) external {
        require(msg.sender == payer, "Apenas payer");
        require(deposited, "Nao depositado");
        require(amount > 0, "Valor deve ser > 0");
        require(amount < token.balanceOf(address(this)), "Valor muito alto");
        
        settlementAmount = amount;
        settlementApproved = false;
        settlementProposedTime = block.timestamp;
        
        emit SettlementProposed(amount);
    }
    
    /**
     * @notice Aprova o settlement proposto
     * @dev FUNCIONA SEMPRE (antes e depois do deadline)
     * @dev Apenas payee pode aprovar
     */
    function approveSettlement() external {
        require(msg.sender == payee, "Apenas payee");
        require(settlementAmount > 0, "Nenhum settlement proposto");
        require(block.timestamp <= settlementProposedTime + SETTLEMENT_WINDOW, "Janela expirada");
        
        settlementApproved = true;
        emit SettlementApproved();
    }
    
    /**
     * @notice Executa o settlement
     * @dev Parte vai para payee, resto para payer
     */
    function _executeSettlement(uint256 balance) private {
        uint256 toPayee = settlementAmount;
        uint256 toPayer = balance - toPayee;
        
        // Limpar estado
        deposited = false;
        totalAmount = 0;
        cancelApprovedPayer = false;
        cancelApprovedPayee = false;
        cancelApprovedTimePayer = 0;
        cancelApprovedTimePayee = 0;
        settlementAmount = 0;
        settlementApproved = false;
        settlementProposedTime = 0;
        
        if (toPayee > 0) {
            token.safeTransfer(payee, toPayee);
        }
        if (toPayer > 0) {
            token.safeTransfer(payer, toPayer);
        }
        
        emit Settled(toPayee, toPayer);
    }

    // ============================================
    // FASE 7: REFUND UNILATERAL
    // ============================================
    
    /**
     * @notice Refund unilateral pelo payer
     * @dev Apenas ANTES do 1º marco ser liberado
     * @dev Permite "arrependimento rápido"
     */
    function refund() external nonReentrant {
        require(msg.sender == payer, "Apenas payer");
        require(deposited, "Nao depositado");
        require(!milestones[0].released, "Primeiro marco ja liberado");
        
        uint256 balance = token.balanceOf(address(this));
        
        deposited = false;
        totalAmount = 0;
        
        if (balance > 0) {
            token.safeTransfer(payer, balance);
        }
        emit Refunded(balance);
    }

    // ============================================
    // FASE 8: SAQUE PÓS-PRAZO
    // ============================================
    
    /**
     * @notice Saque após o prazo vencer
     * @dev Apenas PAYER pode sacar (não payee!)
     * @dev Funciona apenas APÓS deadline
     */
    function claimAfterDeadline() external nonReentrant {
        require(msg.sender == payer, "Apenas payer");
        require(deposited, "Nao depositado");
        require(block.timestamp > deadline, "Prazo nao expirado");
        
        uint256 balance = token.balanceOf(address(this));
        
        deposited = false;
        totalAmount = 0;
        
        if (balance > 0) {
            token.safeTransfer(payer, balance);
        }
        emit ClaimedAfterDeadline(balance);
    }

    // ============================================
    // VIEWS
    // ============================================
    
    /**
     * @notice Retorna informações do contrato
     */
    function getContractInfo() external view returns (
        address _payer,
        address _payee,
        uint256 _totalAmount,
        uint256 _deadline,
        bool _deposited,
        bool _platformFeePaid,
        bool _confirmedPayer,
        bool _confirmedPayee,
        uint256 _balance
    ) {
        return (
            payer,
            payee,
            totalAmount,
            deadline,
            deposited,
            platformFeePaid,
            confirmedPayer,
            confirmedPayee,
            token.balanceOf(address(this))
        );
    }
    
    /**
     * @notice Retorna informações de um marco
     */
    function getMilestoneInfo(uint256 index) external view returns (
        uint256 percentage,
        uint256 amount,
        bool released
    ) {
        require(index < milestones.length, "Indice invalido");
        Milestone memory m = milestones[index];
        return (m.percentage, m.amount, m.released);
    }
    
    /**
     * @notice Retorna total de marcos
     */
    function getTotalMilestones() external view returns (uint256) {
        return milestones.length;
    }
    
    /**
     * @notice Retorna saldo atual do contrato
     */
    function getBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}