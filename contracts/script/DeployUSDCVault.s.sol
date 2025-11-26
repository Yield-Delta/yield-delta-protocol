// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SEIVault.sol";
import "../src/AIOracle.sol";

contract DeployUSDCVaultScript is Script {
    // SEI Atlantic-2 testnet
    uint256 constant SEI_TESTNET_CHAIN_ID = 1328;

    // Correct USDC on SEI Atlantic-2 testnet
    address constant USDC_ADDRESS = 0x4fCF1784B31630811181f670Aea7A7bEF803eaED;

    // Use existing AI Oracle (already deployed)
    address constant AI_ORACLE = 0x4199f86F3Bd73cF6ae5E89C8E28863d4B12fb18E;

    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== DEPLOYING USDC VAULT TO SEI ATLANTIC-2 ===");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("USDC Token:", USDC_ADDRESS);
        console.log("AI Oracle:", AI_ORACLE);

        // Verify we're on the right chain
        require(block.chainid == SEI_TESTNET_CHAIN_ID, "Wrong chain! Must be SEI Atlantic-2 (1328)");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy USDC Vault
        SEIVault usdcVault = new SEIVault(
            USDC_ADDRESS,           // USDC token address
            "USDC Stable Vault",    // Vault name
            "vUSDC",               // Share token symbol
            deployer,              // Owner
            AI_ORACLE              // AI Oracle address
        );

        console.log("");
        console.log("USDC Vault deployed successfully!");
        console.log("Vault Address:", address(usdcVault));

        // Configure the vault
        usdcVault.setParallelExecution(true);
        usdcVault.optimizeForFinality();

        console.log("Vault configured with SEI optimizations");

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("USDC Vault:", address(usdcVault));
        console.log("Token:", USDC_ADDRESS);
        console.log("AI Oracle:", AI_ORACLE);
        console.log("");
        console.log("Next steps:");
        console.log("1. Update frontend with new vault address");
        console.log("2. Users need to approve the vault to spend their USDC");
        console.log("3. Users can then deposit USDC to the vault");
        console.log("===========================");
    }
}