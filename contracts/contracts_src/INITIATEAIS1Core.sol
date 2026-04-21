// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title  INITIATEAIS1Core
 * @notice Unified contract for INITIATE AI S1 on Initia appchain.
 *         Three modules:
 *           1. SecureTransfer  – escrow-based P2P transfers
 *           2. GroupPayment    – multi-contributor pools with auto-distribution
 *           3. SavingsPot      – goal-based personal savings
 *
 * @dev    Deployed on a custom Initia EVM appchain.
 *         Chain ID guard prevents replay on foreign chains.
 */
contract INITIATEAIS1Core {

    // ─────────────────────────────────────────────────────────────
    // STATE: Chain Guard
    // ─────────────────────────────────────────────────────────────

    uint256 public immutable ALLOWED_CHAIN_ID;

    modifier onlyAllowedChain() {
        require(block.chainid == ALLOWED_CHAIN_ID, "INITIATE_AI_S1: wrong chain");
        _;
    }

    constructor(uint256 _chainId) {
        ALLOWED_CHAIN_ID = _chainId;
        owner = msg.sender;
    }

    // ─────────────────────────────────────────────────────────────
    // MODULE 1: SECURE TRANSFER
    // ─────────────────────────────────────────────────────────────

    struct Transfer {
        address sender;
        address recipient;
        uint256 amount;
        uint256 createdAt;
        uint256 expiresAt;
        bool    claimed;
        bool    refunded;
        string  remark;
    }

    uint256 public transferCount;
    mapping(uint256 => Transfer) public transfers;
    // sender => list of transfer IDs
    mapping(address => uint256[]) public senderTransfers;
    // recipient => list of transfer IDs
    mapping(address => uint256[]) public recipientTransfers;

    uint256 public constant TRANSFER_EXPIRY = 7 days;

    event TransferCreated(
        uint256 indexed transferId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        string  remark
    );
    event TransferClaimed(uint256 indexed transferId, address indexed recipient, uint256 amount);
    event TransferRefunded(uint256 indexed transferId, address indexed sender, uint256 amount);

    /**
     * @notice Send a secure escrow transfer to `recipient`.
     * @param  recipient  Address of the recipient.
     * @param  remark     Optional human-readable note.
     * @return transferId Unique ID of this transfer.
     */
    function sendTransfer(address recipient, string calldata remark)
        external
        payable
        onlyAllowedChain
        returns (uint256 transferId)
    {
        require(recipient != address(0), "INITIATE_AI_S1: zero recipient");
        require(msg.value > 0,           "INITIATE_AI_S1: zero amount");

        transferId = transferCount++;

        transfers[transferId] = Transfer({
            sender:    msg.sender,
            recipient: recipient,
            amount:    msg.value,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + TRANSFER_EXPIRY,
            claimed:   false,
            refunded:  false,
            remark:    remark
        });

        senderTransfers[msg.sender].push(transferId);
        recipientTransfers[recipient].push(transferId);

        emit TransferCreated(transferId, msg.sender, recipient, msg.value, remark);
    }

    /**
     * @notice Claim a transfer sent to the caller.
     * @param  transferId  The ID returned by sendTransfer.
     */
    function claimTransfer(uint256 transferId) external onlyAllowedChain {
        Transfer storage t = transfers[transferId];
        require(t.recipient == msg.sender, "INITIATE_AI_S1: not recipient");
        require(!t.claimed,                "INITIATE_AI_S1: already claimed");
        require(!t.refunded,               "INITIATE_AI_S1: already refunded");
        require(block.timestamp <= t.expiresAt, "INITIATE_AI_S1: transfer expired");

        t.claimed = true;
        (bool ok, ) = payable(msg.sender).call{value: t.amount}("");
        require(ok, "INITIATE_AI_S1: claim transfer failed");

        emit TransferClaimed(transferId, msg.sender, t.amount);
    }

    /**
     * @notice Refund an unclaimed transfer back to the sender.
     *         Can be called any time after expiry, or by the sender before expiry.
     * @param  transferId  The ID returned by sendTransfer.
     */
    function refundTransfer(uint256 transferId) external onlyAllowedChain {
        Transfer storage t = transfers[transferId];
        require(t.sender == msg.sender,    "INITIATE_AI_S1: not sender");
        require(!t.claimed,                "INITIATE_AI_S1: already claimed");
        require(!t.refunded,               "INITIATE_AI_S1: already refunded");
        require(
            block.timestamp > t.expiresAt || t.sender == msg.sender,
            "INITIATE_AI_S1: not yet expired"
        );

        t.refunded = true;
        (bool ok, ) = payable(msg.sender).call{value: t.amount}("");
        require(ok, "INITIATE_AI_S1: refund transfer failed");

        emit TransferRefunded(transferId, msg.sender, t.amount);
    }

    /// @notice Returns all transfer IDs where `addr` is sender.
    function getSenderTransfers(address addr) external view returns (uint256[] memory) {
        return senderTransfers[addr];
    }

    /// @notice Returns all transfer IDs where `addr` is recipient.
    function getRecipientTransfers(address addr) external view returns (uint256[] memory) {
        return recipientTransfers[addr];
    }

    // ─────────────────────────────────────────────────────────────
    // MODULE 2: GROUP PAYMENT
    // ─────────────────────────────────────────────────────────────

    struct Group {
        address   creator;
        address   beneficiary;
        uint256   targetAmount;
        uint256   currentAmount;
        bool      distributed;
        string    description;
        address[] contributors;
    }

    uint256 public groupCount;
    mapping(uint256 => Group) public groups;
    // groupId => contributor => amount contributed
    mapping(uint256 => mapping(address => uint256)) public contributions;
    // creator => list of group IDs
    mapping(address => uint256[]) public creatorGroups;

    event GroupCreated(
        uint256 indexed groupId,
        address indexed creator,
        address indexed beneficiary,
        uint256 targetAmount,
        string  description
    );
    event GroupContribution(
        uint256 indexed groupId,
        address indexed contributor,
        uint256 amount,
        uint256 currentTotal
    );
    event GroupDistributed(
        uint256 indexed groupId,
        address indexed beneficiary,
        uint256 totalAmount
    );

    /**
     * @notice Create a new group payment pool.
     * @param  beneficiary  Address that receives the funds when target is reached.
     * @param  target       Target amount in wei.
     * @param  description  Human-readable description of the group.
     * @return groupId      Unique ID of this group.
     */
    function createGroup(
        address beneficiary,
        uint256 target,
        string calldata description
    )
        external
        onlyAllowedChain
        returns (uint256 groupId)
    {
        require(beneficiary != address(0), "INITIATE_AI_S1: zero beneficiary");
        require(target > 0,                "INITIATE_AI_S1: zero target");

        groupId = groupCount++;

        Group storage g = groups[groupId];
        g.creator      = msg.sender;
        g.beneficiary  = beneficiary;
        g.targetAmount = target;
        g.description  = description;

        creatorGroups[msg.sender].push(groupId);

        emit GroupCreated(groupId, msg.sender, beneficiary, target, description);
    }

    /**
     * @notice Contribute to a group pool.
     *         Auto-distributes to beneficiary when target is reached.
     * @param  groupId  The ID returned by createGroup.
     */
    function contributeToGroup(uint256 groupId)
        external
        payable
        onlyAllowedChain
    {
        Group storage g = groups[groupId];
        require(g.creator != address(0), "INITIATE_AI_S1: group not found");
        require(!g.distributed,          "INITIATE_AI_S1: already distributed");
        require(msg.value > 0,           "INITIATE_AI_S1: zero contribution");

        if (contributions[groupId][msg.sender] == 0) {
            g.contributors.push(msg.sender);
        }
        contributions[groupId][msg.sender] += msg.value;
        g.currentAmount += msg.value;

        emit GroupContribution(groupId, msg.sender, msg.value, g.currentAmount);

        // Auto-distribute when target is reached
        if (g.currentAmount >= g.targetAmount) {
            g.distributed = true;
            uint256 payout = g.currentAmount;
            (bool ok, ) = payable(g.beneficiary).call{value: payout}("");
            require(ok, "INITIATE_AI_S1: distribution failed");
            emit GroupDistributed(groupId, g.beneficiary, payout);
        }
    }

    /// @notice Returns all contributor addresses for a group.
    function getGroupContributors(uint256 groupId) external view returns (address[] memory) {
        return groups[groupId].contributors;
    }

    /// @notice Returns all group IDs created by `addr`.
    function getCreatorGroups(address addr) external view returns (uint256[] memory) {
        return creatorGroups[addr];
    }

    // ─────────────────────────────────────────────────────────────
    // MODULE 3: SAVINGS POT
    // ─────────────────────────────────────────────────────────────

    struct Pot {
        address owner;
        string  label;
        uint256 targetAmount;
        uint256 currentAmount;
        bool    yieldEnabled;
        uint256 createdAt;
        bool    closed;
    }

    uint256 public potCount;
    mapping(uint256 => Pot) public pots;
    // owner => list of pot IDs
    mapping(address => uint256[]) public ownerPots;

    // Yield router: address where yieldEnabled deposits are forwarded.
    // Set to a mock LP or zero for testnet.
    address public yieldRouter;

    event PotCreated(
        uint256 indexed potId,
        address indexed owner,
        string  label,
        uint256 targetAmount,
        bool    yieldEnabled
    );
    event PotDeposit(uint256 indexed potId, address indexed depositor, uint256 amount, uint256 newTotal);
    event PotWithdraw(uint256 indexed potId, address indexed owner, uint256 amount, uint256 newTotal);
    event PotGoalReached(uint256 indexed potId, address indexed owner, uint256 totalAmount);
    event YieldRouterUpdated(address indexed oldRouter, address indexed newRouter);

    /**
     * @notice Create a new savings pot.
     * @param  label         Human-readable name for this pot.
     * @param  target        Savings goal in wei (0 = no specific goal).
     * @param  yieldEnabled  If true, deposits are routed to the yieldRouter for yield.
     * @return potId         Unique ID of this pot.
     */
    function createPot(
        string calldata label,
        uint256 target,
        bool yieldEnabled
    )
        external
        onlyAllowedChain
        returns (uint256 potId)
    {
        potId = potCount++;

        pots[potId] = Pot({
            owner:         msg.sender,
            label:         label,
            targetAmount:  target,
            currentAmount: 0,
            yieldEnabled:  yieldEnabled,
            createdAt:     block.timestamp,
            closed:        false
        });

        ownerPots[msg.sender].push(potId);

        emit PotCreated(potId, msg.sender, label, target, yieldEnabled);
    }

    /**
     * @notice Deposit into a savings pot.
     * @param  potId  The ID returned by createPot.
     */
    function depositToPot(uint256 potId) external payable onlyAllowedChain {
        Pot storage pot = pots[potId];
        require(pot.owner != address(0), "INITIATE_AI_S1: pot not found");
        require(!pot.closed,             "INITIATE_AI_S1: pot is closed");
        require(msg.value > 0,           "INITIATE_AI_S1: zero deposit");

        pot.currentAmount += msg.value;

        emit PotDeposit(potId, msg.sender, msg.value, pot.currentAmount);

        // Route to yield LP if enabled and router is set
        if (pot.yieldEnabled && yieldRouter != address(0)) {
            (bool ok, ) = payable(yieldRouter).call{value: msg.value}("");
            require(ok, "INITIATE_AI_S1: yield routing failed");
        }

        // Emit goal reached event if target is met
        if (pot.targetAmount > 0 && pot.currentAmount >= pot.targetAmount) {
            emit PotGoalReached(potId, pot.owner, pot.currentAmount);
        }
    }

    /**
     * @notice Withdraw from a savings pot. Only the pot owner can withdraw.
     * @param  potId   The ID returned by createPot.
     * @param  amount  Amount to withdraw in wei.
     */
    function withdrawFromPot(uint256 potId, uint256 amount) external onlyAllowedChain {
        Pot storage pot = pots[potId];
        require(pot.owner == msg.sender,     "INITIATE_AI_S1: not pot owner");
        require(!pot.closed,                 "INITIATE_AI_S1: pot is closed");
        require(amount > 0,                  "INITIATE_AI_S1: zero withdraw");
        require(pot.currentAmount >= amount, "INITIATE_AI_S1: insufficient balance");

        pot.currentAmount -= amount;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "INITIATE_AI_S1: withdraw failed");

        emit PotWithdraw(potId, msg.sender, amount, pot.currentAmount);
    }

    /**
     * @notice Close a pot and withdraw all remaining funds.
     * @param  potId  The ID returned by createPot.
     */
    function closePot(uint256 potId) external onlyAllowedChain {
        Pot storage pot = pots[potId];
        require(pot.owner == msg.sender, "INITIATE_AI_S1: not pot owner");
        require(!pot.closed,             "INITIATE_AI_S1: already closed");

        pot.closed = true;
        uint256 remaining = pot.currentAmount;
        pot.currentAmount = 0;

        if (remaining > 0) {
            (bool ok, ) = payable(msg.sender).call{value: remaining}("");
            require(ok, "INITIATE_AI_S1: close withdraw failed");
            emit PotWithdraw(potId, msg.sender, remaining, 0);
        }
    }

    /// @notice Returns all pot IDs owned by `addr`.
    function getOwnerPots(address addr) external view returns (uint256[] memory) {
        return ownerPots[addr];
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN
    // ─────────────────────────────────────────────────────────────

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "INITIATE_AI_S1: not owner");
        _;
    }

    // owner is set in constructor

    /**
     * @notice Update the yield router address.
     *         Set to zero address to disable yield routing.
     * @param  newRouter  New yield router address.
     */
    function setYieldRouter(address newRouter) external onlyOwner {
        emit YieldRouterUpdated(yieldRouter, newRouter);
        yieldRouter = newRouter;
    }

    /**
     * @notice Transfer contract ownership.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "INITIATE_AI_S1: zero owner");
        owner = newOwner;
    }

    // ─────────────────────────────────────────────────────────────
    // FALLBACK
    // ─────────────────────────────────────────────────────────────

    receive() external payable {}
}

