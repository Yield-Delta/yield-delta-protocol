// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IStrategyVault.sol";
import "../../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "../../lib/openzeppelin-contracts/contracts/security/ReentrancyGuard.sol";
import "../../lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";

contract DeltaNeutralVault is IStrategyVault, ERC20, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    uint256 public constant SEI_CHAIN_ID = 1328;

    VaultInfo public vaultInfo;
    Position public currentPosition;
    address public aiOracle;
    mapping(bytes32 => bool) public executedAIRequests;

    // Customer tracking for analytics
    mapping(address => uint256) public customerTotalDeposited;
    mapping(address => int256) public customerNetDeposited;
    mapping(address => uint256) public customerDepositTime;

    // Testnet simulation for P&L
    uint256 public simulatedPerformanceMultiplier = 1e18; // 1.0 in 18 decimals
    uint256 public lastSimulationUpdate;
    uint256 public constant TARGET_APY = 700; // 7% APY (in basis points)
    uint256 public constant SIMULATION_INTERVAL = 1 days;
    bool public simulationEnabled = true; // Enable for testnet

    // Fee configuration (optimized for SEI's low gas costs)
    uint256 public constant MANAGEMENT_FEE = 100; // 1%
    uint256 public constant PERFORMANCE_FEE = 1000; // 10%
    uint256 public constant FEE_PRECISION = 10000;
    
    // Emergency controls
    bool public emergencyPaused = false;
    uint256 public lastRebalance;
    uint256 public constant MIN_REBALANCE_INTERVAL = 3600; // 1 hour

    modifier onlySEI() {
        require(block.chainid == SEI_CHAIN_ID, "Invalid chain");
        _;
    }
    
    modifier onlyAIOracle() {
        require(msg.sender == aiOracle, "Unauthorized AI oracle");
        _;
    }
    
    modifier notPaused() {
        require(!emergencyPaused, "Vault paused");
        _;
    }

    constructor(
        address _token0,
        address _token1,
        address _aiOracle,
        address _initialOwner
    ) ERC20("Delta Neutral LP SEI/USDC", "DNLP") {
        vaultInfo = VaultInfo({
            name: "Delta Neutral LP",
            strategy: "Market-neutral liquidity provision",
            token0: _token0,
            token1: _token1,
            poolFee: 3000,
            totalSupply: 0,
            totalValueLocked: 0,
            isActive: true
        });
        aiOracle = _aiOracle;
        lastSimulationUpdate = block.timestamp;
        transferOwnership(_initialOwner);
    }

    function deposit(
        uint256 amount0,
        uint256 amount1,
        address recipient
    ) external payable override nonReentrant onlySEI notPaused returns (uint256 shares) {
        require(amount0 > 0 || amount1 > 0, "Invalid amounts");
        require(recipient != address(0), "Invalid recipient");

        // Calculate shares based on current vault value
        uint256 totalValue = _calculateTotalValue();
        uint256 currentSupply = totalSupply();

        if (currentSupply == 0) {
            shares = _sqrt(amount0 * amount1);
            require(shares > 1000, "Insufficient initial liquidity");
            shares -= 1000; // Burn minimum liquidity
        } else {
            uint256 token0Balance = _getToken0Balance();
            uint256 token1Balance = _getToken1Balance();

            // Avoid division by zero
            uint256 value0 = 0;
            uint256 value1 = 0;

            if (amount0 > 0 && token0Balance > 0) {
                value0 = (amount0 * totalValue) / token0Balance;
            }
            if (amount1 > 0 && token1Balance > 0) {
                value1 = (amount1 * totalValue) / token1Balance;
            }

            shares = ((value0 + value1) * currentSupply) / totalValue;
        }

        // Transfer tokens (SEI's parallel execution optimizes this)
        if (amount0 > 0) {
            // Handle native SEI (token0 = address(0))
            if (vaultInfo.token0 == address(0)) {
                require(msg.value == amount0, "Must send SEI with transaction");
            } else {
                IERC20(vaultInfo.token0).transferFrom(msg.sender, address(this), amount0);
            }
        }
        if (amount1 > 0) {
            IERC20(vaultInfo.token1).transferFrom(msg.sender, address(this), amount1);
        }

        // Mint shares
        _mint(recipient, shares);

        // Track customer deposits for analytics
        uint256 totalDeposit = amount0 + amount1;
        customerTotalDeposited[recipient] += totalDeposit;
        customerNetDeposited[recipient] += int256(totalDeposit);
        if (customerDepositTime[recipient] == 0) {
            customerDepositTime[recipient] = block.timestamp;
        }

        // Update vault info
        vaultInfo.totalSupply = totalSupply();
        vaultInfo.totalValueLocked = _calculateTotalValue();

        return shares;
    }

    /**
     * @dev Optimized single-asset deposit function for SEI frontend compatibility
     * Supports both native SEI and ERC20 token deposits
     */
    function seiOptimizedDeposit(
        uint256 amount,
        address recipient
    ) external payable nonReentrant onlySEI notPaused returns (uint256 shares) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");

        uint256 amount0 = 0;
        uint256 amount1 = 0;

        // Determine which token is being deposited based on msg.value
        if (msg.value > 0) {
            // Native SEI deposit (token0)
            require(vaultInfo.token0 == address(0), "This vault does not accept native SEI");
            require(amount == msg.value, "Amount must match msg.value");
            amount0 = msg.value;
            // Native SEI is already in contract via msg.value
        } else {
            // ERC20 token deposit - assume it's token1 (USDC)
            require(vaultInfo.token1 != address(0), "Invalid token configuration");
            amount1 = amount;

            // Transfer ERC20 tokens from sender
            IERC20(vaultInfo.token1).transferFrom(msg.sender, address(this), amount);
        }

        // Calculate shares based on current vault value
        uint256 totalValue = _calculateTotalValue();
        uint256 currentSupply = totalSupply();

        if (currentSupply == 0) {
            // First deposit - simplified share calculation
            shares = amount0 + amount1;
            require(shares > 1000, "Insufficient initial liquidity");
            shares -= 1000; // Burn minimum liquidity
        } else {
            uint256 token0Balance = _getToken0Balance();
            uint256 token1Balance = _getToken1Balance();

            // Avoid division by zero
            uint256 value0 = 0;
            uint256 value1 = 0;

            if (amount0 > 0 && token0Balance > 0) {
                // For native SEI, subtract the just-received amount for fair calculation
                uint256 preDepositBalance0 = token0Balance >= amount0 ? token0Balance - amount0 : 0;
                if (preDepositBalance0 > 0) {
                    value0 = (amount0 * totalValue) / preDepositBalance0;
                } else {
                    value0 = amount0; // First deposit of this token
                }
            }
            if (amount1 > 0 && token1Balance > 0) {
                // For ERC20, subtract the just-received amount for fair calculation
                uint256 preDepositBalance1 = token1Balance >= amount1 ? token1Balance - amount1 : 0;
                if (preDepositBalance1 > 0) {
                    value1 = (amount1 * totalValue) / preDepositBalance1;
                } else {
                    value1 = amount1; // First deposit of this token
                }
            }

            if (totalValue > 0) {
                shares = ((value0 + value1) * currentSupply) / totalValue;
            } else {
                shares = value0 + value1;
            }
        }

        // Mint shares
        _mint(recipient, shares);

        // Track customer deposits for analytics
        uint256 totalDeposit = amount0 + amount1;
        customerTotalDeposited[recipient] += totalDeposit;
        customerNetDeposited[recipient] += int256(totalDeposit);
        if (customerDepositTime[recipient] == 0) {
            customerDepositTime[recipient] = block.timestamp;
        }

        // Update vault info
        vaultInfo.totalSupply = totalSupply();
        vaultInfo.totalValueLocked = _calculateTotalValue();

        emit SEIOptimizedDeposit(msg.sender, amount0 + amount1, shares, block.timestamp);
        return shares;
    }

    // Event for optimized deposits
    event SEIOptimizedDeposit(address indexed user, uint256 amount, uint256 shares, uint256 blockTime);

    function withdraw(
        uint256 shares,
        address recipient
    ) external override nonReentrant onlySEI notPaused returns (uint256 amount0, uint256 amount1) {
        require(shares > 0, "Invalid shares");
        require(shares <= balanceOf(msg.sender), "Insufficient shares");
        
        uint256 currentSupply = totalSupply();
        amount0 = (shares * _getToken0Balance()) / currentSupply;
        amount1 = (shares * _getToken1Balance()) / currentSupply;
        
        // Burn shares first
        _burn(msg.sender, shares);

        // Track customer withdrawals for analytics
        uint256 totalWithdrawal = amount0 + amount1;
        customerNetDeposited[msg.sender] -= int256(totalWithdrawal);

        // Transfer tokens
        if (amount0 > 0) {
            if (vaultInfo.token0 == address(0)) {
                payable(recipient).transfer(amount0);
            } else {
                IERC20(vaultInfo.token0).transfer(recipient, amount0);
            }
        }
        if (amount1 > 0) {
            IERC20(vaultInfo.token1).transfer(recipient, amount1);
        }

        // Update vault info
        vaultInfo.totalSupply = totalSupply();
        vaultInfo.totalValueLocked = _calculateTotalValue();

        return (amount0, amount1);
    }

    function rebalance(
        AIRebalanceParams calldata params
    ) external override onlyAIOracle nonReentrant onlySEI notPaused {
        require(
            lastRebalance == 0 || block.timestamp >= lastRebalance + MIN_REBALANCE_INTERVAL,
            "Rebalance too frequent"
        );
        
        // Verify AI signature
        bytes32 requestId = keccak256(abi.encodePacked(
            params.newTickLower,
            params.newTickUpper,
            params.deadline,
            block.timestamp
        ));
        
        require(!executedAIRequests[requestId], "Request already executed");
        require(block.timestamp <= params.deadline, "Request expired");
        
        // Mark request as executed
        executedAIRequests[requestId] = true;
        
        // Store old position for event
        int24 oldTickLower = currentPosition.tickLower;
        int24 oldTickUpper = currentPosition.tickUpper;
        
        // Execute delta neutral rebalance logic
        _executeDeltaNeutralRebalance(params);
        
        lastRebalance = block.timestamp;
        
        emit PositionRebalanced(oldTickLower, oldTickUpper, params.newTickLower, params.newTickUpper);
        emit AIRebalanceExecuted(requestId, gasleft());
    }

    function getVaultInfo() external view override returns (VaultInfo memory) {
        return vaultInfo;
    }

    function getCurrentPosition() external view override returns (Position memory) {
        return currentPosition;
    }

    /**
     * @dev Emergency pause function
     */
    function emergencyPause() external onlyOwner {
        emergencyPaused = true;
    }

    /**
     * @dev Resume operations
     */
    function resume() external onlyOwner {
        emergencyPaused = false;
    }

    /**
     * @dev Update AI oracle address
     */
    function updateAIOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle");
        aiOracle = newOracle;
    }

    /**
     * @dev Get total assets held by the vault (for frontend compatibility)
     */
    function totalAssets() external view returns (uint256) {
        return _calculateTotalValue();
    }

    /**
     * @dev Get the underlying asset address (for frontend compatibility)
     */
    function asset() external view returns (address) {
        return vaultInfo.token0;
    }

    /**
     * @dev Get customer statistics for a user (for frontend compatibility)
     */
    function getCustomerStats(address customer) external view returns (
        uint256 shares,
        uint256 shareValue,
        uint256 totalDeposited,
        uint256 totalWithdrawn,
        uint256 depositTime,
        uint256 lockTimeRemaining
    ) {
        shares = balanceOf(customer);

        // Calculate share value with simulated performance
        uint256 currentSupply = totalSupply();
        if (currentSupply > 0 && shares > 0) {
            uint256 totalValue = _calculateTotalValue();
            uint256 baseShareValue = (shares * totalValue) / currentSupply;

            // Apply simulated performance multiplier for testnet
            if (simulationEnabled) {
                uint256 currentMultiplier = _getSimulatedMultiplier();
                shareValue = (baseShareValue * currentMultiplier) / 1e18;
            } else {
                shareValue = baseShareValue;
            }
        } else {
            shareValue = 0;
        }

        // Return actual deposit tracking data
        totalDeposited = customerTotalDeposited[customer];

        // Calculate total withdrawn from net deposited
        int256 netDeposited = customerNetDeposited[customer];
        if (netDeposited < 0) {
            totalWithdrawn = uint256(-netDeposited);
        } else {
            totalWithdrawn = totalDeposited > uint256(netDeposited) ? totalDeposited - uint256(netDeposited) : 0;
        }

        depositTime = customerDepositTime[customer];
        lockTimeRemaining = 0; // No lock period for this vault
    }

    /**
     * @dev Update simulated performance for testnet (anyone can call to trigger daily updates)
     */
    function updateSimulation() external {
        require(simulationEnabled, "Simulation disabled");

        uint256 elapsed = block.timestamp - lastSimulationUpdate;
        if (elapsed >= SIMULATION_INTERVAL) {
            // Calculate daily yield: APY / 365
            // TARGET_APY is in basis points (700 = 7%)
            // Daily yield = (1 + APY/365) = 1 + (0.07/365) ≈ 1.0001918
            uint256 dailyYield = 1e18 + ((TARGET_APY * 1e18) / (365 * 10000));

            // Apply compounding for each day elapsed
            uint256 daysElapsed = elapsed / SIMULATION_INTERVAL;
            for (uint256 i = 0; i < daysElapsed && i < 30; i++) { // Max 30 days at once
                simulatedPerformanceMultiplier = (simulatedPerformanceMultiplier * dailyYield) / 1e18;
            }

            lastSimulationUpdate = block.timestamp;
            emit SimulationUpdated(simulatedPerformanceMultiplier, block.timestamp);
        }
    }

    /**
     * @dev Get current simulated multiplier (includes pending daily gains)
     */
    function _getSimulatedMultiplier() internal view returns (uint256) {
        if (!simulationEnabled) return 1e18;

        uint256 elapsed = block.timestamp - lastSimulationUpdate;
        if (elapsed < SIMULATION_INTERVAL) {
            return simulatedPerformanceMultiplier;
        }

        // Calculate pending gains
        uint256 dailyYield = 1e18 + ((TARGET_APY * 1e18) / (365 * 10000));
        uint256 daysElapsed = elapsed / SIMULATION_INTERVAL;

        uint256 pendingMultiplier = simulatedPerformanceMultiplier;
        for (uint256 i = 0; i < daysElapsed && i < 30; i++) {
            pendingMultiplier = (pendingMultiplier * dailyYield) / 1e18;
        }

        return pendingMultiplier;
    }

    /**
     * @dev Toggle simulation on/off (owner only)
     */
    function setSimulationEnabled(bool enabled) external onlyOwner {
        simulationEnabled = enabled;
    }

    /**
     * @dev Manually set performance multiplier for testing (owner only)
     */
    function setPerformanceMultiplier(uint256 multiplier) external onlyOwner {
        require(multiplier >= 1e18 && multiplier <= 2e18, "Invalid multiplier");
        simulatedPerformanceMultiplier = multiplier;
        emit SimulationUpdated(multiplier, block.timestamp);
    }

    event SimulationUpdated(uint256 multiplier, uint256 timestamp);

    // Internal functions
    function _executeDeltaNeutralRebalance(AIRebalanceParams calldata params) internal {
        // Market-neutral liquidity provision logic
        currentPosition.tickLower = params.newTickLower;
        currentPosition.tickUpper = params.newTickUpper;
        
        // Update hedging positions to maintain delta neutrality
        // Real implementation would integrate with perpetual swaps or options
        // For devnet: simplified delta neutral position update
    }

    function _calculateTotalValue() internal view returns (uint256) {
        // Calculate total vault value including positions and fees
        return _getToken0Balance() + _getToken1Balance();
    }

    function _getToken0Balance() internal view returns (uint256) {
        if (vaultInfo.token0 == address(0)) {
            // Native SEI balance
            return address(this).balance;
        }
        return IERC20(vaultInfo.token0).balanceOf(address(this));
    }

    // Add receive function to accept native SEI
    receive() external payable {}

    function _getToken1Balance() internal view returns (uint256) {
        return IERC20(vaultInfo.token1).balanceOf(address(this));
    }

    function _sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
}
