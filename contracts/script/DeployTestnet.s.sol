// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SEIVault.sol";
import "../src/VaultFactory.sol";
import "../src/AIOracle.sol";

contract DeployTestnetScript is Script {
    // SEI Network Configuration
    uint256 constant SEI_TESTNET_CHAIN_ID = 1328;
    
    // Deployment addresses (will be set during deployment)
    address payable public seiVault;
    address public vaultFactory;
    address public aiOracle;
    
    function run() external {
        // Verify we're deploying to SEI network
        require(block.chainid == SEI_TESTNET_CHAIN_ID, "Must deploy to SEI testnet");

        // Use environment variable for private key (add 0x prefix for vm.envUint)
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyStr)));
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying to SEI Testnet (Chain ID: %s)", block.chainid);
        console.log("Deployer address: %s", deployer);
        console.log("Deployer balance: %s", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy AI Oracle
        aiOracle = deployAIOracle(deployer);
        console.log("AI Oracle deployed at: %s", aiOracle);

        // 2. Deploy Vault Factory
        vaultFactory = deployVaultFactory(deployer, aiOracle);
        console.log("Vault Factory deployed at: %s", vaultFactory);

        // 3. Deploy SEI Vault (using address(0) for native SEI)
        seiVault = payable(deploySEIVault(address(0), deployer, deployer));
        console.log("SEI Vault deployed at: %s", seiVault);

        // 4. Configure AI Oracle with deployed contracts
        configureAIOracle(deployer);

        // 5. Set up initial vault parameters
        configureVaults();

        vm.stopBroadcast();

        // Log deployment summary
        logDeploymentSummary();
    }

    function deployAIOracle(address owner) internal returns (address) {
        AIOracle oracle = new AIOracle(owner);
        return address(oracle);
    }
    
    function deployVaultFactory(address owner, address oracle) internal returns (address) {
        VaultFactory factory = new VaultFactory(oracle, owner);
        return address(factory);
    }
    
    function deploySEIVault(address asset, address owner, address aiModel) internal returns (address) {
        SEIVault vault = new SEIVault(
            asset,
            "SEI Dynamic Liquidity Vault",
            "SEIDLV",
            owner,
            aiModel
        );
        return address(vault);
    }
    
    
    function configureAIOracle(address deployer) internal {
        AIOracle oracle = AIOracle(aiOracle);
        
        // Register AI models with string identifiers
        string[] memory modelVersions = new string[](2);
        modelVersions[0] = "liquidity-optimizer-v1.0";
        modelVersions[1] = "risk-manager-v1.0";
        
        address[] memory signers = new address[](2);
        signers[0] = address(0x1234567890123456789012345678901234567890); // Liquidity optimization model signer
        signers[1] = address(0x0987654321098765432109876543210987654321); // Risk management model signer
        
        for (uint i = 0; i < modelVersions.length; i++) {
            oracle.registerAIModel(modelVersions[i], signers[i]);
            console.log("Registered AI model: %s with signer: %s", modelVersions[i], signers[i]);
        }
    }
    
    function configureVaults() internal {
        SEIVault vault = SEIVault(seiVault);
        
        // Enable parallel execution optimization for SEI
        vault.setParallelExecution(true);
        
        // Optimize for SEI's 400ms finality
        vault.optimizeForFinality();
        
        console.log("SEI Vault configured with optimizations");
    }


    function logDeploymentSummary() internal view {
        console.log("\n=== SEI VAULT DEPLOYMENT SUMMARY ===");
        console.log("Network: SEI Testnet (Chain ID: %s)", block.chainid);
        console.log("Block Number: %s", block.number);
        console.log("Block Timestamp: %s", block.timestamp);
        console.log("\nDeployed Contracts:");
        console.log("- AI Oracle: %s", aiOracle);
        console.log("- Vault Factory: %s", vaultFactory);
        console.log("- SEI Vault (Native SEI): %s", seiVault);
        console.log("\nVault Configuration:");
        console.log("- Asset: Native SEI (address(0))");
        console.log("- Parallel Execution: Enabled");
        console.log("- Finality Optimization: Enabled (400ms)");
        console.log("- SEI Chain Validation: Active");
        console.log("- Lock Period: 24 hours");
        console.log("\nNext Steps:");
        console.log("1. Users can deposit native SEI to the vault");
        console.log("2. Vault shares will be minted based on deposits");
        console.log("3. Withdrawals available after 24-hour lock period");
        console.log("=====================================\n");
    }
}