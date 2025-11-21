import { ServiceConfig, HealthStatus } from '../types';
import { AIOracleService } from './aiOracleService';
import { AIEngineService } from './aiEngineService';
import { VaultService } from './vaultService';
import logger from '../utils/logger';

export class RebalanceSubmitter {
  private config: ServiceConfig;
  private aiOracle: AIOracleService;
  private aiEngine: AIEngineService;
  private vaultService: VaultService;
  private isRunning: boolean = false;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.aiOracle = new AIOracleService(config);
    this.aiEngine = new AIEngineService(config);
    this.vaultService = new VaultService(config);

    logger.info('RebalanceSubmitter initialized', {
      vaults: config.vaults.length,
      modelVersion: config.aiModelVersion,
      minConfidence: config.minConfidenceThreshold,
    });
  }

  /**
   * Run the main rebalancing check cycle
   */
  async run(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Rebalance cycle already running, skipping');
      return;
    }

    this.isRunning = true;
    logger.info('Starting rebalance check cycle');

    try {
      // Check health first
      const health = await this.checkHealth();
      if (health.service !== 'healthy') {
        logger.warn('Service health check failed, skipping cycle', {
          health,
        });
        return;
      }

      // Check if model is active
      const isModelActive = await this.aiOracle.isModelActive(this.config.aiModelVersion);
      if (!isModelActive) {
        logger.error('AI model is not active on AIOracle', {
          model: this.config.aiModelVersion,
        });
        return;
      }

      // Process each vault
      const vaultStates = await this.vaultService.getAllVaultStates();
      logger.info(`Processing ${vaultStates.length} vaults`);

      for (const vaultState of vaultStates) {
        try {
          await this.processVault(vaultState);
        } catch (error: any) {
          logger.error('Error processing vault', {
            vault: vaultState.address,
            error: error.message,
          });
        }
      }

      logger.info('Rebalance check cycle completed');
    } catch (error: any) {
      logger.error('Rebalance cycle failed', { error: error.message });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Process a single vault for potential rebalancing
   */
  private async processVault(vaultState: any): Promise<void> {
    logger.debug('Processing vault', { vault: vaultState.address });

    // Skip if recently rebalanced (1 hour cooldown)
    if (!this.vaultService.shouldCheckRebalance(vaultState, 3600)) {
      return;
    }

    // Get AI recommendation
    const recommendation = await this.aiEngine.analyzeVault(vaultState);
    if (!recommendation) {
      logger.debug('No recommendation received', { vault: vaultState.address });
      return;
    }

    // Check if rebalance is warranted
    if (!this.aiEngine.shouldRebalance(recommendation, this.config.minConfidenceThreshold)) {
      logger.debug('Rebalance not warranted', {
        vault: vaultState.address,
        confidence: recommendation.confidence,
        urgency: recommendation.urgency,
      });
      return;
    }

    // Calculate deadline
    const deadline = Math.floor(Date.now() / 1000) + this.config.requestDeadlineSeconds;

    logger.info('Submitting rebalance request', {
      vault: vaultState.address,
      newTickLower: recommendation.newTickLower,
      newTickUpper: recommendation.newTickUpper,
      confidence: recommendation.confidence,
      deadline,
    });

    // Submit and execute
    const result = await this.aiOracle.submitAndExecute(
      vaultState.address,
      recommendation.newTickLower,
      recommendation.newTickUpper,
      recommendation.confidence,
      deadline,
      this.config.aiModelVersion
    );

    if (result.submission.success && result.execution?.success) {
      logger.info('Rebalance completed successfully', {
        vault: vaultState.address,
        requestId: result.submission.requestId,
        txHash: result.execution.transactionHash,
      });
    } else {
      logger.warn('Rebalance failed', {
        vault: vaultState.address,
        submissionSuccess: result.submission.success,
        executionSuccess: result.execution?.success,
        error: result.submission.error || result.execution?.error,
      });
    }
  }

  /**
   * Check health of all services
   */
  async checkHealth(): Promise<HealthStatus> {
    const errors: string[] = [];

    // Check AI Engine
    const aiEngineHealthy = await this.aiEngine.checkHealth();
    if (!aiEngineHealthy) {
      errors.push('AI Engine unreachable');
    }

    // Check blockchain
    const blockchainHealthy = await this.aiOracle.checkHealth();
    if (!blockchainHealthy) {
      errors.push('Blockchain connection failed');
    }

    // Check signer balance
    const balance = await this.aiOracle.getSignerBalance();
    if (balance < BigInt('1000000000000000')) {
      // 0.001 SEI
      errors.push('Signer balance too low');
    }

    const status: HealthStatus = {
      service: errors.length === 0 ? 'healthy' : errors.length < 2 ? 'degraded' : 'unhealthy',
      aiEngine: aiEngineHealthy,
      blockchain: blockchainHealthy,
      lastCheck: new Date(),
      errors,
    };

    return status;
  }

  /**
   * Get service info
   */
  getInfo(): any {
    return {
      signerAddress: this.aiOracle.getSignerAddress(),
      modelVersion: this.config.aiModelVersion,
      vaults: this.config.vaults,
      aiEngineUrl: this.config.aiEngineUrl,
      oracleAddress: this.config.aiOracleAddress,
      minConfidence: this.config.minConfidenceThreshold,
      cronSchedule: this.config.cronSchedule,
    };
  }
}

export default RebalanceSubmitter;
