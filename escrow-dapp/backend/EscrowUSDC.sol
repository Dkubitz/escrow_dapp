// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * Escrow com USDC (ERC20) na Polygon:
 * - Depósito em USDC via approve + deposit(amount)
 * - 2 marcos (50% + 50%) com aprovação mútua (payer e payee)
 * - Cancelamento bilateral (retorna o restante ao payer)
 * - Refund unilateral pelo payer permitido APENAS antes do 1º marco
 * - claimAfterDeadline: payee saca o restante após o prazo
 *
 * Observação: taxas de rede (gas) são pagas em POL (token nativo da Polygon).
 */
contract EscrowUSDC is ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public payer;
    address payable public payee;
    IERC20 public token;              // ex.: USDC na Polygon
    uint256 public amount;            // total acordado (em unidades do token; USDC tem 6 casas decimais)
    bool public deposited;
    uint256 public deadline;

    // aprovações por marco
    bool public m1PayerApproved;
    bool public m1PayeeApproved;
    bool public m2PayerApproved;
    bool public m2PayeeApproved;

    bool public m1Executed;
    bool public m2Executed;

    // cancelamento bilateral
    bool public cancelPayerApproved;
    bool public cancelPayeeApproved;

    // eventos
    event Deposited(address indexed from, uint256 amount, uint256 deadline);
    event ReleaseApproval(address indexed by, uint8 milestone);
    event MilestoneReleased(uint8 milestone, uint256 amount);
    event CancelApproved(address indexed by);
    event Cancelled(uint256 amount);
    event Refunded(address indexed to, uint256 amount);

    constructor(
        address _payer,
        address payable _payee,
        uint256 _duration,
        address _token
    ) {
        require(_payer != address(0), "Payer invalido");
        require(_payee != address(0), "Payee invalido");
        require(_token != address(0), "Token invalido");

        payer = _payer;
        payee = _payee;
        token = IERC20(_token);
        deadline = block.timestamp + _duration; // ex.: 6 dias = 518400
    }

    // helpers
    function halves() public view returns (uint256 half1, uint256 half2) {
        half1 = amount / 2;
        half2 = amount - half1; // garante todos os "cents"
    }

    function remaining() public view returns (uint256) {
        return token.balanceOf(address(this));
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

        token.safeTransferFrom(payer, address(this), _amount);
        emit Deposited(msg.sender, _amount, deadline);
    }

    // aprovar liberacao de marco (1 ou 2). exige aprovacao de payer e payee.
    function approveRelease(uint8 milestone) external nonReentrant {
        require(deposited, "Nenhum deposito");
        require(block.timestamp <= deadline, "Prazo expirado");
        require(msg.sender == payer || msg.sender == payee, "Somente payer/payee");

        if (milestone == 1) {
            require(!m1Executed, "Marco 1 ja executado");

            if (msg.sender == payer)  m1PayerApproved = true;
            else                      m1PayeeApproved = true;

            emit ReleaseApproval(msg.sender, 1);

            if (m1PayerApproved && m1PayeeApproved) {
                (uint256 half1, ) = halves();

                m1Executed = true;
                m1PayerApproved = false;
                m1PayeeApproved = false;

                token.safeTransfer(payee, half1);
                emit MilestoneReleased(1, half1);
            }
        } else if (milestone == 2) {
            require(m1Executed, "Execute milestone 1 primeiro");
            require(!m2Executed, "Marco 2 ja executado");

            if (msg.sender == payer)  m2PayerApproved = true;
            else                      m2PayeeApproved = true;

            emit ReleaseApproval(msg.sender, 2);

            if (m2PayerApproved && m2PayeeApproved) {
                (, uint256 half2) = halves();

                m2Executed = true;
                m2PayerApproved = false;
                m2PayeeApproved = false;

                deposited = false;
                amount = 0;

                token.safeTransfer(payee, half2);
                emit MilestoneReleased(2, half2);
            }
        } else {
            revert("Marco invalido");
        }
    }

    // cancelamento bilateral: se ambos aprovarem, devolve o restante ao payer
    function approveCancel() external nonReentrant {
        require(deposited, "Nenhum deposito");
        require(msg.sender == payer || msg.sender == payee, "Somente payer/payee");

        if (msg.sender == payer)  cancelPayerApproved = true;
        else                      cancelPayeeApproved = true;

        emit CancelApproved(msg.sender);

        if (cancelPayerApproved && cancelPayeeApproved) {
            uint256 value = remaining();

            // limpar estado
            deposited = false;
            amount = 0;
            cancelPayerApproved = false;
            cancelPayeeApproved = false;

            if (value > 0) token.safeTransfer(payer, value);
            emit Cancelled(value);
        }
    }

    // refund unilateral (apenas antes do 1º marco)
    function refund() external nonReentrant {
        require(msg.sender == payer, "Apenas o payer pode pedir refund");
        require(deposited, "Nenhum deposito");
        require(block.timestamp <= deadline, "Prazo expirado");
        require(!m1Executed, "Marco 1 ja executado");

        uint256 value = remaining();

        deposited = false;
        amount = 0;

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

        if (value > 0) {
            token.safeTransfer(payee, value);
            emit MilestoneReleased(2, value); // liberacao final do restante
        }
    }
}
