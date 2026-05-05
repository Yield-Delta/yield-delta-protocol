# Kairos Vault Integration

The Kairos agent goes beyond simply executing external yield strategies—it includes a robust internal mechanism for actively managing and integrating with on-chain SEI Vault contracts. This functionality is primarily driven by the `SEIVaultManager` service.

## Overview

The Vault Integration is designed to provide end-to-end automated DeFi yield generation. It actively monitors an on-chain Native SEI Vault, reacts to user deposits, allocates funds to various algorithmic strategies, and manages yield harvesting.

This system is injected into the Kairos agent via the `vaultIntegrationPlugin`, making vault automation a core capability of the agent runtime.

## Core Capabilities

### 1. Deposit & Withdrawal Monitoring

The `SEIVaultManager` establishes a connection to the SEI blockchain (typically on testnet) and polls for real-time events emitted by the Native SEI Vault contract (`0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565`).

- **Deposit Tracking**: It listens for `SEIOptimizedDeposit` events. When a user deposits SEI, the manager immediately detects the transaction, extracting the user's address, the deposited amount, and the minted shares.
- **Withdrawal Tracking**: It also monitors `Withdrawal` events to prepare for unwinding positions if necessary.

*To avoid RPC rate-limiting, the manager uses intelligent block-range polling with chunking and retry mechanisms, rather than relying solely on WebSocket listeners.*

### 2. Automated Strategy Allocation

Once a deposit is detected, Kairos doesn't wait for human intervention. The `SEIVaultManager` automatically splits and allocates the deposited funds across four distinct DeFi strategies based on a predefined risk-adjusted portfolio:

- **40% - Funding Arbitrage** (`FUNDING_ARBITRAGE` action)
- **30% - Delta Neutral LP** (`DELTA_NEUTRAL` action)
- **20% - AMM Optimization** (`AMM_OPTIMIZE` action)
- **10% - YEI Lending** (`YEI_FINANCE` action)

The manager invokes these ElizaOS actions in parallel, simulating the real-time execution of funds deployment into the respective decentralized protocols.

### 3. Position Tracking & Simulation

To provide users with real-time feedback and daily P&L analytics, the integration utilizes a `positionTracker` service. 

- Whenever a strategy action is executed, the tracker records the timestamp, amount, and specific strategy.
- It calculates an effective APR for the combined portfolio, allowing Kairos to report accurate metrics (e.g., "7% APY Delta Neutral") when queried by users.

### 4. Yield Harvesting & Health Monitoring

The vault integration includes an active `vaultMonitorEvaluator` that runs periodically to assess the health and performance of the vault.

- **Harvesting Cycle**: Every 8 hours, the `harvestYield` process is triggered.
- **Compounding**: The `SEIVaultManager` calculates the accrued yield across all tracked positions. It includes the capability to call the `depositYield()` function on the vault contract to actively compound the returns on-chain. *(Note: For testnet simulation purposes, the yield is currently tracked mathematically without requiring real funds to be cycled).*

## Testing the Flow

You can manually trigger the vault integration flow to see Kairos in action:

1. Ensure the Kairos agent is running with your SEI private key and RPC URL configured.
2. Run the test deposit script:
   ```bash
   bun run scripts/test-deposit.ts
   ```
3. This script executes an on-chain `seiOptimizedDeposit` of 0.01 SEI.
4. Watch the Kairos console logs—you will see the agent detect the deposit block, calculate the 40/30/20/10 split, and execute the four strategy actions automatically!

## System Architecture

```text
User ──> SEI Vault Contract ──(Emits Event)──> SEIVaultManager (Kairos)
                                                      │
                                                      ├──> Analyzes Deposit
                                                      │
                                                      ├──> 40% Funding Arbitrage
                                                      ├──> 30% Delta Neutral
                                                      ├──> 20% AMM Optimization
                                                      └──> 10% YEI Lending
                                                      │
                                                      └──> Position Tracker ──> Yield Harvesting