// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/strategies/DeltaNeutralVault.sol";
import "../src/strategies/YieldFarmingVault.sol";
import "../src/strategies/ArbitrageVault.sol";

contract DeployStrategyVaultsScript is Script {
    // SEI Atlantic-2 testnet
    uint256 constant SEI_TESTNET_CHAIN_ID = 1328;

    // Token addresses on SEI Atlantic-2 testnet
    address constant USDC_ADDRESS = 0x4fCF1784B31630811181f670Aea7A7bEF803eaED;
    address constant SEI_ADDRESS = address(0); // Native SEI (use address(0))

    // Use existing AI Oracle (already deployed)
    address constant AI_ORACLE = 0x4199f86F3Bd73cF6ae5E89C8E28863d4B12fb18E;

    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== DEPLOYING STRATEGY VAULTS TO SEI ATLANTIC-2 ===");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("AI Oracle:", AI_ORACLE);

        // Verify we're on the right chain
        require(block.chainid == SEI_TESTNET_CHAIN_ID, "Wrong chain! Must be SEI Atlantic-2 (1328)");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Delta Neutral Vault (accepts SEI/USDC pair)
        DeltaNeutralVault deltaNeutralVault = new DeltaNeutralVault(
            SEI_ADDRESS,                  // token0: SEI
            USDC_ADDRESS,                 // token1: USDC
            AI_ORACLE,                    // AI Oracle address
            deployer                      // Owner
        );
        console.log("");
        console.log("Delta Neutral Vault deployed!");
        console.log("Address:", address(deltaNeutralVault));

        // 2. Deploy Yield Farming Vault (accepts SEI/USDC pair)
        YieldFarmingVault yieldFarmingVault = new YieldFarmingVault(
            SEI_ADDRESS,                  // token0: SEI
            USDC_ADDRESS,                 // token1: USDC
            AI_ORACLE,                    // AI Oracle address
            deployer                      // Owner
        );
        console.log("");
        console.log("Yield Farming Vault deployed!");
        console.log("Address:", address(yieldFarmingVault));

        // 3. Deploy Arbitrage Vault (accepts SEI/USDC pair)
        ArbitrageVault arbitrageVault = new ArbitrageVault(
            SEI_ADDRESS,                  // token0: SEI
            USDC_ADDRESS,                 // token1: USDC
            AI_ORACLE,                    // AI Oracle address
            deployer                      // Owner
        );
        console.log("");
        console.log("Arbitrage Vault deployed!");
        console.log("Address:", address(arbitrageVault));

        console.log("");
        console.log("All vaults configured with SEI optimizations");

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Delta Neutral Vault:", address(deltaNeutralVault));
        console.log("Yield Farming Vault:", address(yieldFarmingVault));
        console.log("Arbitrage Vault:", address(arbitrageVault));
        console.log("");
        console.log("Next steps:");
        console.log("1. Update frontend vaults.ts with new addresses");
        console.log("2. Update .env files with vault addresses");
        console.log("3. Users can deposit SEI to these vaults");
        console.log("===========================");
    }
}
