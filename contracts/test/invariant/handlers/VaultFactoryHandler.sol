// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../../src/VaultFactory.sol";
import "../../../src/StrategyVault.sol";
import "../InvariantBase.sol";

/**
 * @title VaultFactoryHandler
 * @dev Handler for stateful fuzz testing of VaultFactory
 * @notice Tests vault creation, fee management, and registry operations
 */
contract VaultFactoryHandler is Test {
    VaultFactory public factory;
    MockERC20Invariant public token0;
    MockERC20Invariant public token1;
    MockERC20Invariant public token2;
    MockERC20Invariant public token3;

    // Actors
    address[] public actors;
    address internal currentActor;

    // Ghost variables
    uint256 public ghost_vaultsCreated;
    uint256 public ghost_totalFeesCollected;
    uint256 public ghost_totalFeesWithdrawn;
    uint256 public ghost_creationFeeUpdates;

    // Created vault tracking
    address[] public createdVaults;
    mapping(address => bool) public vaultExists;
    mapping(address => address) public vaultCreator;

    // Call counters
    uint256 public createCalls;
    uint256 public successfulCreates;
    uint256 public failedCreates;
    uint256 public feeUpdateCalls;
    uint256 public withdrawCalls;

    // SEI Chain ID
    uint256 internal constant SEI_CHAIN_ID = 1328;

    // Token pairs for variety
    address[] public tokens;

    constructor(
        VaultFactory _factory,
        MockERC20Invariant _token0,
        MockERC20Invariant _token1,
        MockERC20Invariant _token2,
        MockERC20Invariant _token3,
        address[] memory _actors
    ) {
        factory = _factory;
        token0 = _token0;
        token1 = _token1;
        token2 = _token2;
        token3 = _token3;
        actors = _actors;

        // Store tokens for random selection
        tokens.push(address(_token0));
        tokens.push(address(_token1));
        tokens.push(address(_token2));
        tokens.push(address(_token3));
    }

    modifier useActor(uint256 actorIndexSeed) {
        currentActor = actors[bound(actorIndexSeed, 0, actors.length - 1)];
        vm.startPrank(currentActor);
        _;
        vm.stopPrank();
    }

    modifier ensureSEIChain() {
        vm.chainId(SEI_CHAIN_ID);
        _;
    }

    /**
     * @dev Create a new vault with random parameters
     * @param actorSeed Seed for selecting actor
     * @param tokenPairSeed Seed for selecting token pair
     * @param poolFeeSeed Seed for selecting pool fee
     * @param nameSeed Seed for generating name
     */
    function createVault(
        uint256 actorSeed,
        uint256 tokenPairSeed,
        uint256 poolFeeSeed,
        uint256 nameSeed
    )
        external
        useActor(actorSeed)
        ensureSEIChain
    {
        createCalls++;

        // Select unique token pair
        uint256 token0Index = tokenPairSeed % tokens.length;
        uint256 token1Index = (tokenPairSeed / tokens.length + 1) % tokens.length;
        if (token0Index == token1Index) {
            token1Index = (token1Index + 1) % tokens.length;
        }

        address selectedToken0 = tokens[token0Index];
        address selectedToken1 = tokens[token1Index];

        // Select pool fee (common Uniswap V3 fees)
        uint24[4] memory poolFees = [uint24(500), uint24(3000), uint24(10000), uint24(100)];
        uint24 poolFee = poolFees[poolFeeSeed % poolFees.length];

        // Generate unique name
        string memory name = string(abi.encodePacked("Vault_", vm.toString(nameSeed % 10000)));
        string memory symbol = string(abi.encodePacked("vTK", vm.toString(nameSeed % 1000)));

        // Get creation fee
        uint256 creationFee = factory.creationFee();

        // Fund the actor
        vm.deal(currentActor, creationFee + 1 ether);

        VaultFactory.VaultCreationParams memory params = VaultFactory.VaultCreationParams({
            name: name,
            symbol: symbol,
            token0: selectedToken0,
            token1: selectedToken1,
            poolFee: poolFee,
            aiOracle: factory.defaultAIOracle()
        });

        try factory.createVault{value: creationFee}(params) returns (address vault) {
            successfulCreates++;
            ghost_vaultsCreated++;
            ghost_totalFeesCollected += creationFee;

            createdVaults.push(vault);
            vaultExists[vault] = true;
            vaultCreator[vault] = currentActor;

            // Verify vault registered
            assert(factory.isVault(vault));
            assert(factory.allVaultsLength() == createdVaults.length);

        } catch {
            failedCreates++;
        }
    }

    /**
     * @dev Update creation fee (owner only)
     * @param newFeeSeed Seed for new fee value
     */
    function setCreationFee(uint256 newFeeSeed) external ensureSEIChain {
        feeUpdateCalls++;

        // Bound fee to reasonable range
        uint256 newFee = bound(newFeeSeed, 0.01 ether, 10 ether);

        vm.prank(factory.owner());
        try factory.setCreationFee(newFee) {
            ghost_creationFeeUpdates++;
            assert(factory.creationFee() == newFee);
        } catch {
            // Expected if caller is not owner
        }
    }

    /**
     * @dev Test unauthorized fee update
     * @param actorSeed Seed for selecting non-owner actor
     * @param newFeeSeed Seed for new fee value
     */
    function setCreationFeeUnauthorized(uint256 actorSeed, uint256 newFeeSeed)
        external
        useActor(actorSeed)
        ensureSEIChain
    {
        if (currentActor == factory.owner()) return;

        uint256 oldFee = factory.creationFee();
        uint256 newFee = bound(newFeeSeed, 0.01 ether, 10 ether);

        vm.expectRevert("Ownable: caller is not the owner");
        factory.setCreationFee(newFee);

        // Fee should remain unchanged
        assert(factory.creationFee() == oldFee);
    }

    /**
     * @dev Withdraw collected fees (owner only)
     */
    function withdrawFees() external ensureSEIChain {
        withdrawCalls++;

        address owner = factory.owner();
        uint256 ownerBalanceBefore = owner.balance;

        vm.prank(owner);
        try factory.withdrawFees() {
            // Track withdrawn amount
            uint256 withdrawn = owner.balance - ownerBalanceBefore;
            ghost_totalFeesWithdrawn += withdrawn;

            // Owner should have received the fees
            assert(owner.balance >= ownerBalanceBefore);
            assert(address(factory).balance == 0);
        } catch {
            // May fail if no balance
        }
    }

    /**
     * @dev Update default AI oracle
     * @param newOracleSeed Seed for generating new oracle address
     */
    function setDefaultAIOracle(uint256 newOracleSeed) external ensureSEIChain {
        address newOracle = address(uint160(bound(newOracleSeed, 1, type(uint160).max)));

        vm.prank(factory.owner());
        try factory.setDefaultAIOracle(newOracle) {
            assert(factory.defaultAIOracle() == newOracle);
        } catch {
            // May fail for zero address
        }
    }

    /**
     * @dev Advance time
     * @param timeJump Seconds to advance
     */
    function warpTime(uint256 timeJump) external {
        timeJump = bound(timeJump, 1, 7 days);
        vm.warp(block.timestamp + timeJump);
    }

    /**
     * @dev Get call summary
     */
    function callSummary() external view returns (
        uint256 creates,
        uint256 successful,
        uint256 failed,
        uint256 feeUpdates,
        uint256 withdraws,
        uint256 totalVaults
    ) {
        return (
            createCalls,
            successfulCreates,
            failedCreates,
            feeUpdateCalls,
            withdrawCalls,
            ghost_vaultsCreated
        );
    }

    /**
     * @dev Get number of created vaults
     */
    function getCreatedVaultCount() external view returns (uint256) {
        return createdVaults.length;
    }

    /**
     * @dev Get vault at index
     */
    function getVaultAt(uint256 index) external view returns (address) {
        if (index >= createdVaults.length) return address(0);
        return createdVaults[index];
    }
}
