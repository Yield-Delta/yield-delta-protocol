import { Plugin } from '@elizaos/core';
// import SEIVaultManager from './services/sei-vault-manager'; // Temporarily disabled
import vaultMonitorEvaluator, {
  rebalancingEvaluator,
  healthCheckEvaluator,
} from './evaluators/vault-monitor';

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
  services: [], // Temporarily disabled - will use evaluators instead
  evaluators: [vaultMonitorEvaluator, rebalancingEvaluator, healthCheckEvaluator],
  actions: [],
};

export default vaultIntegrationPlugin;
