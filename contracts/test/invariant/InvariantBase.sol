// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/StdInvariant.sol";
import "../../src/SEIVault.sol";
import "../../src/StrategyVault.sol";
import "../../src/AIOracle.sol";
import "../../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20Invariant
 * @dev Mock ERC20 token for invariant testing with unlimited minting
 */
contract MockERC20Invariant is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}

/**
 * @title InvariantBase
 * @dev Base contract for all invariant tests providing common setup and utilities
 */
abstract contract InvariantBase is StdInvariant, Test {
    // SEI Chain ID for testing
    uint256 internal constant SEI_CHAIN_ID = 1328;

    // Test actors
    address internal owner = address(0x1);
    address internal aiOracle = address(0x2);
    address internal user1 = address(0x10);
    address internal user2 = address(0x11);
    address internal user3 = address(0x12);
    address[] internal actors;

    // Initial balances
    uint256 internal constant INITIAL_BALANCE = 1_000_000 * 1e18;
    uint256 internal constant MAX_DEPOSIT = 100_000 * 1e18;

    // Ghost variables for tracking invariants
    uint256 internal ghost_totalDeposited;
    uint256 internal ghost_totalWithdrawn;
    uint256 internal ghost_totalSharesMinted;
    uint256 internal ghost_totalSharesBurned;
    mapping(address => uint256) internal ghost_userDeposits;
    mapping(address => uint256) internal ghost_userWithdrawals;

    // Counters for operations
    uint256 internal depositCount;
    uint256 internal withdrawCount;
    uint256 internal rebalanceCount;

    function _setupActors() internal {
        actors.push(user1);
        actors.push(user2);
        actors.push(user3);
    }

    function _getRandomActor(uint256 seed) internal view returns (address) {
        return actors[seed % actors.length];
    }

    function _boundAmount(uint256 amount) internal view returns (uint256) {
        return bound(amount, 1, MAX_DEPOSIT);
    }

    function _boundAmountWithMin(uint256 amount, uint256 minAmount) internal view returns (uint256) {
        return bound(amount, minAmount, MAX_DEPOSIT);
    }
}
