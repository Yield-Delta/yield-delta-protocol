import { Plugin } from '@elizaos/core';
import SEIVaultManager from './services/sei-vault-manager';
import vaultMonitorEvaluator, {
  rebalancingEvaluator,
  healthCheckEvaluator,
} from './evaluators/vault-monitor';
import { positionTracker } from './services/position-tracker';

/**
 * Vault Integration Plugin
 *
 * This plugin adds vault management capabilities to the kairos agent:
 * - Automatic deposit detection and allocation
 * - Yield harvesting every 8 hours
 * - Health monitoring and rebalancing
 * - Integration with deployed SEI vault contracts
 *
 * This works alongside the plugin-sei-yield-delta to provide
 * automatic vault-integrated DeFi yield generation.
 */
export const vaultIntegrationPlugin: Plugin = {
  name: 'vault-integration',
  description: 'SEI Vault integration for automated yield generation',
  services: [SEIVaultManager],
  evaluators: [vaultMonitorEvaluator, rebalancingEvaluator, healthCheckEvaluator],
  actions: [],
  routes: [
    {
      name: 'positions',
      path: '/positions',
      type: 'GET',
      handler: async (_req: any, res: any) => {
        try {
          const summary = positionTracker.getSummary();
          res.json({
            success: true,
            data: summary,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
    },
    {
      name: 'harvest',
      path: '/harvest',
      type: 'POST',
      handler: async (_req: any, res: any) => {
        try {
          const harvested = positionTracker.harvestAll();
          const summary = positionTracker.getSummary();
          res.json({
            success: true,
            harvested: harvested.toString(),
            data: summary,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
    },
  ],
};

export default vaultIntegrationPlugin;
