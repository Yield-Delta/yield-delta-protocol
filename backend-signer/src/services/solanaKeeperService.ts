import { Keypair } from '@solana/web3.js';
import { ServiceConfig, HealthStatus, SolanaVaultState } from '../types';
import { SolanaService } from './solanaService';
import { AIEngineService } from './aiEngineService';
import logger from '../utils/logger';

export class SolanaKeeperService {
  private config: ServiceConfig;
  private solana: SolanaService;
  private aiEngine: AIEngineService;
  private isRunning: boolean = false;
  private rebalanceCooldown: number = 3600000;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.solana = new SolanaService(config);
    this.aiEngine = new AIEngineService(config);

    if (config.solana?.signerPrivateKey) {
      const signerKeypair = Keypair.fromSecretKey(
        Buffer.from(config.solana.signerPrivateKey, 'base64')
      );
      this.solana.setSigner(signerKeypair);
    }

    logger.info('SolanaKeeperService initialized', {
      vaults: config.solana?.vaults.length || 0,
      signer: this.solana.getSignerAddress(),
    });
  }

  async run(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Solana keeper already running, skipping');
      return;
    }

    this.isRunning = true;
    logger.info('Starting Solana keeper cycle');

    try {
      const health = await this.checkHealth();
      if (health.service !== 'healthy') {
        logger.warn('Service health check failed, skipping cycle', { health });
        return;
      }

      const vaultStates = await this.solana.getAllVaultStates();
      logger.info('Processing Solana vaults', { count: vaultStates.length });

      for (const vaultState of vaultStates) {
        await this.processVault(vaultState);
      }

      logger.info('Solana keeper cycle completed');
    } catch (error: any) {
      logger.error('Solana keeper cycle failed', { error: error.message });
    } finally {
      this.isRunning = false;
    }
  }

  private async processVault(vaultState: SolanaVaultState): Promise<void> {
    const now = Date.now();
    const timeSinceRebalance = now - vaultState.lastRebalanceTime;

    if (timeSinceRebalance < this.rebalanceCooldown) {
      logger.debug('Vault in cooldown', {
        vault: vaultState.address,
        timeSinceRebalance,
      });
      return;
    }

    const recommendation = await this.aiEngine.getComprehensiveAnalysis({
      address: vaultState.address,
      currentTickLower: vaultState.lowerPrice,
      currentTickUpper: vaultState.upperPrice,
      totalLiquidity: vaultState.liquidity,
      token0Balance: vaultState.tokenABalance,
      token1Balance: vaultState.tokenBBalance,
    } as any);

    if (!recommendation) {
      logger.debug('No recommendation received', { vault: vaultState.address });
      return;
    }

    if (!this.aiEngine.shouldRebalance(recommendation, this.config.minConfidenceThreshold)) {
      logger.debug('Rebalance not warranted', {
        vault: vaultState.address,
        confidence: recommendation.confidence,
        urgency: recommendation.urgency,
      });
      return;
    }

    const result = await this.solana.submitRebalance(
      vaultState.address,
      recommendation.newTickLower,
      recommendation.newTickUpper,
      []
    );

    if (result.success) {
      logger.info('Solana rebalance completed', {
        vault: vaultState.address,
        signature: result.signature,
        lower: recommendation.newTickLower,
        upper: recommendation.newTickUpper,
      });
    } else {
      logger.warn('Solana rebalance failed', {
        vault: vaultState.address,
        error: result.error,
      });
    }
  }

  async checkHealth(): Promise<HealthStatus> {
    const errors: string[] = [];

    const solanaHealthy = await this.solana.checkHealth();
    if (!solanaHealthy) {
      errors.push('Solana RPC unreachable');
    }

    const aiEngineHealthy = await this.aiEngine.checkHealth();
    if (!aiEngineHealthy) {
      errors.push('AI Engine unreachable');
    }

    const balance = await this.solana.getSignerBalance();
    if (balance < BigInt('1000000')) {
      errors.push('Signer balance too low');
    }

    return {
      service: errors.length === 0 ? 'healthy' : errors.length < 2 ? 'degraded' : 'unhealthy',
      aiEngine: aiEngineHealthy,
      blockchain: solanaHealthy,
      lastCheck: new Date(),
      errors,
    };
  }

  getInfo(): any {
    return {
      signerAddress: this.solana.getSignerAddress(),
      vaults: this.config.solana?.vaults || [],
      rpcUrl: this.config.solana?.rpcUrl,
      vaultProgramId: this.config.solana?.vaultProgramId,
    };
  }
}

export default SolanaKeeperService;