import { ethers, Contract, JsonRpcProvider } from 'ethers';
import { ServiceConfig, VaultState } from '../types';
import logger from '../utils/logger';

// Minimal vault ABI for reading state (SEIVault contract)
const VAULT_ABI = [
  'function getCurrentPosition() view returns (tuple(int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 token0Amount, uint256 token1Amount))',
  'function totalAssets() view returns (uint256)',
  'function lastRebalance() view returns (uint256)',
  'function vaultInfo() view returns (tuple(string name, string strategy, address token0, address token1, uint24 poolFee, uint256 totalSupply, uint256 totalValueLocked, bool isActive))',
];

export class VaultService {
  private provider: JsonRpcProvider;
  private config: ServiceConfig;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.provider = new JsonRpcProvider(config.seiRpcUrl);

    logger.info('Vault service initialized');
  }

  /**
   * Get the current state of a vault
   */
  async getVaultState(vaultAddress: string): Promise<VaultState | null> {
    try {
      const vault = new Contract(vaultAddress, VAULT_ABI, this.provider);

      // Fetch all state in parallel
      const [
        position,
        totalAssets,
        lastRebalance,
      ] = await Promise.all([
        vault.getCurrentPosition(),
        vault.totalAssets(),
        vault.lastRebalance(),
      ]);

      const state: VaultState = {
        address: vaultAddress,
        currentTickLower: Number(position.tickLower),
        currentTickUpper: Number(position.tickUpper),
        totalLiquidity: BigInt(position.liquidity),
        token0Balance: BigInt(position.token0Amount || totalAssets),
        token1Balance: BigInt(position.token1Amount || 0),
        lastRebalanceTime: BigInt(lastRebalance),
      };

      logger.debug('Fetched vault state', {
        vault: vaultAddress,
        tickLower: state.currentTickLower,
        tickUpper: state.currentTickUpper,
        liquidity: state.totalLiquidity.toString(),
      });

      return state;
    } catch (error: any) {
      logger.error('Failed to get vault state', {
        vault: vaultAddress,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Check if vault needs rebalancing based on time since last rebalance
   */
  shouldCheckRebalance(state: VaultState, minIntervalSeconds: number = 3600): boolean {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const timeSinceRebalance = now - state.lastRebalanceTime;

    if (timeSinceRebalance < BigInt(minIntervalSeconds)) {
      logger.debug('Vault recently rebalanced, skipping', {
        vault: state.address,
        timeSinceRebalance: timeSinceRebalance.toString(),
      });
      return false;
    }

    return true;
  }

  /**
   * Get states for all configured vaults
   */
  async getAllVaultStates(): Promise<VaultState[]> {
    const states: VaultState[] = [];

    for (const vaultAddress of this.config.vaults) {
      const state = await this.getVaultState(vaultAddress);
      if (state) {
        states.push(state);
      }
    }

    return states;
  }
}

export default VaultService;
