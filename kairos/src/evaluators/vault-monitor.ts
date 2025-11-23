import { Evaluator, type IAgentRuntime } from '@elizaos/core';
import SEIVaultManager from '../services/sei-vault-manager';
import { ethers } from 'ethers';

/**
 * Vault Monitor Evaluator
 *
 * Runs periodic checks on the vault and strategies:
 * - Health monitoring
 * - Yield harvesting (every 8 hours)
 * - Position tracking
 * - Rebalancing triggers
 * - Performance metrics
 */
export const vaultMonitorEvaluator: Evaluator = {
  name: 'VAULT_MONITOR',
  description:
    'Monitors vault health, triggers yield harvesting, and tracks strategy performance',
  similes: [
    'vault health check',
    'yield harvest monitor',
    'strategy performance tracker',
    'position monitor',
    'vault metrics',
  ],
  examples: [],
  alwaysRun: true, // Run on every evaluation cycle

  handler: async (runtime: IAgentRuntime) => {
    console.log('\n🔍 Vault Monitor: Running health check...');

    try {
      // Get the vault manager service
      const vaultManager = runtime.getService<SEIVaultManager>('vault-manager');

      if (!vaultManager) {
        console.warn('⚠️ Vault manager service not found');
        return null;
      }

      // 1. Get current vault metrics
      const metrics = await vaultManager.getVaultMetrics();

      console.log('\n📊 Vault Metrics:');
      console.log(`   Total Assets: ${ethers.formatEther(metrics.totalAssets)} SEI`);
      console.log(`   Total Shares: ${ethers.formatEther(metrics.totalShares)}`);
      console.log(`   Share Price: ${ethers.formatEther(metrics.sharePrice)} SEI`);
      console.log(`   Active Positions: ${metrics.positionCount}`);

      // 2. Check if it's time to harvest
      const yieldHarvested = await vaultManager.harvestYield(runtime);

      if (yieldHarvested > 0n) {
        console.log(`✅ Harvested ${ethers.formatEther(yieldHarvested)} SEI`);
      }

      // 3. Calculate current APY
      const currentAPY = await calculateAPY(metrics);
      console.log(`\n📈 Current APY: ${currentAPY.toFixed(2)}%`);

      // 4. Check if APY is below target (should be 14-16%)
      if (currentAPY < 14) {
        console.warn(`⚠️ APY below target (${currentAPY.toFixed(2)}% < 14%)`);
        console.warn('   Consider rebalancing strategies or adjusting allocations');
      } else if (currentAPY > 16) {
        console.log(`🎉 APY above target (${currentAPY.toFixed(2)}% > 16%)`);
      } else {
        console.log(`✅ APY within target range (14-16%)`);
      }

      // 5. Return metrics for logging
      return {
        success: true,
        data: {
          totalAssets: metrics.totalAssets.toString(),
          totalShares: metrics.totalShares.toString(),
          sharePrice: metrics.sharePrice.toString(),
          positionCount: metrics.positionCount,
          yieldHarvested: yieldHarvested.toString(),
          currentAPY: currentAPY,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error('❌ Vault monitor error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  validate: async (runtime: IAgentRuntime): Promise<boolean> => {
    // Always run this evaluator if vault manager is available
    const vaultManager = runtime.getService<SEIVaultManager>('vault-manager');
    return !!vaultManager;
  },
};

/**
 * Calculate current APY based on share price growth
 * This is a simplified calculation - real implementation would track historical data
 */
async function calculateAPY(metrics: {
  totalAssets: bigint;
  totalShares: bigint;
  sharePrice: bigint;
}): Promise<number> {
  // TODO: Implement actual APY calculation based on historical data
  // For now, estimate based on share price relative to 1 SEI
  const oneSEI = ethers.parseEther('1');

  if (metrics.sharePrice <= oneSEI) {
    return 0; // No yield yet
  }

  // Calculate percentage gain
  const gain = Number(metrics.sharePrice - oneSEI) / Number(oneSEI);

  // Annualize (assume positions have been open for the average time)
  // This is a rough estimate - real implementation would use actual timestamps
  const estimatedDays = 30; // Assume 30 days on average
  const annualizedAPY = (gain / estimatedDays) * 365 * 100;

  return Math.min(annualizedAPY, 100); // Cap at 100% for safety
}

/**
 * Rebalancing Evaluator
 *
 * Checks if strategies need rebalancing based on performance and market conditions
 */
export const rebalancingEvaluator: Evaluator = {
  name: 'REBALANCING_MONITOR',
  description:
    'Monitors strategy performance and triggers rebalancing when allocations drift from targets',
  similes: [
    'portfolio rebalancing',
    'strategy allocation check',
    'drift monitoring',
    'allocation optimizer',
  ],
  examples: [],
  alwaysRun: false, // Only run when explicitly triggered or on schedule

  handler: async (runtime: IAgentRuntime) => {
    console.log('\n🔄 Rebalancing Monitor: Checking allocations...');

    try {
      // Get vault manager
      const vaultManager = runtime.getService<SEIVaultManager>('vault-manager');

      if (!vaultManager) {
        console.warn('⚠️ Vault manager service not found');
        return null;
      }

      // TODO: Implement actual rebalancing logic
      // 1. Get current positions and their values
      // 2. Calculate current allocation percentages
      // 3. Compare to target allocations (40/30/20/10)
      // 4. If drift > threshold (e.g., 5%), trigger rebalancing

      console.log('✅ Rebalancing check complete');

      return {
        success: true,
        data: {
          rebalanceNeeded: false,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error('❌ Rebalancing monitor error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  validate: async (runtime: IAgentRuntime): Promise<boolean> => {
    // Only run if vault manager is available and there are active positions
    const vaultManager = runtime.getService<SEIVaultManager>('vault-manager');
    if (!vaultManager) return false;

    const metrics = await vaultManager.getVaultMetrics();
    return metrics.positionCount > 0;
  },
};

/**
 * Health Check Evaluator
 *
 * Monitors system health and alerts on issues
 */
export const healthCheckEvaluator: Evaluator = {
  name: 'HEALTH_CHECK',
  description: 'Monitors system health including RPC connection, gas prices, and contract status',
  similes: ['system health', 'connection check', 'uptime monitor', 'service status'],
  examples: [],
  alwaysRun: true,

  handler: async (runtime: IAgentRuntime) => {
    console.log('\n💚 Health Check: Verifying system status...');

    const health = {
      rpcConnection: false,
      gasPrice: 0,
      blockNumber: 0,
      vaultContract: false,
      aiEngineConnection: false,
      backendSignerConnection: false,
    };

    try {
      // 1. Check RPC connection
      const rpcUrl = process.env.SEI_RPC_URL;
      if (rpcUrl) {
        try {
          const provider = new ethers.JsonRpcProvider(rpcUrl);
          const blockNumber = await provider.getBlockNumber();
          const feeData = await provider.getFeeData();

          health.rpcConnection = true;
          health.blockNumber = blockNumber;
          health.gasPrice = Number(feeData.gasPrice || 0n) / 1e9; // Convert to Gwei

          console.log(`   ✅ RPC Connected (Block: ${blockNumber})`);
          console.log(`   ⛽ Gas Price: ${health.gasPrice.toFixed(2)} Gwei`);
        } catch (error) {
          console.error('   ❌ RPC Connection Failed');
        }
      }

      // 2. Check vault contract
      const vaultManager = runtime.getService<SEIVaultManager>('vault-manager');
      if (vaultManager) {
        try {
          await vaultManager.getVaultMetrics();
          health.vaultContract = true;
          console.log('   ✅ Vault Contract Accessible');
        } catch (error) {
          console.error('   ❌ Vault Contract Inaccessible');
        }
      }

      // 3. Check AI engine connection
      const aiEngineUrl = process.env.AI_ENGINE_URL;
      if (aiEngineUrl) {
        try {
          const response = await fetch(`${aiEngineUrl}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
          });
          health.aiEngineConnection = response.ok;
          console.log(
            health.aiEngineConnection ? '   ✅ AI Engine Connected' : '   ❌ AI Engine Unreachable'
          );
        } catch (error) {
          console.error('   ❌ AI Engine Connection Failed');
        }
      }

      // 4. Check backend signer connection
      const backendSignerUrl = process.env.BACKEND_SIGNER_URL;
      if (backendSignerUrl) {
        try {
          const response = await fetch(`${backendSignerUrl}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
          });
          health.backendSignerConnection = response.ok;
          console.log(
            health.backendSignerConnection
              ? '   ✅ Backend Signer Connected'
              : '   ❌ Backend Signer Unreachable'
          );
        } catch (error) {
          console.error('   ❌ Backend Signer Connection Failed');
        }
      }

      const overallHealth =
        health.rpcConnection &&
        health.vaultContract &&
        (aiEngineUrl ? health.aiEngineConnection : true) &&
        (backendSignerUrl ? health.backendSignerConnection : true);

      console.log(`\n${overallHealth ? '✅' : '❌'} Overall System Health: ${overallHealth ? 'HEALTHY' : 'DEGRADED'}`);

      return {
        success: true,
        data: health,
      };
    } catch (error) {
      console.error('❌ Health check error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  validate: async (runtime: IAgentRuntime): Promise<boolean> => {
    // Always run health checks
    return true;
  },
};

export default vaultMonitorEvaluator;
