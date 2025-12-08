import { RebalanceSubmitter } from '../src/services/rebalanceSubmitter';
import { AIOracleService } from '../src/services/aiOracleService';
import { AIEngineService } from '../src/services/aiEngineService';
import { VaultService } from '../src/services/vaultService';
import { ServiceConfig, HealthStatus } from '../src/types';
import logger from '../src/utils/logger';

// Mock dependencies
jest.mock('../src/services/aiOracleService');
jest.mock('../src/services/aiEngineService');
jest.mock('../src/services/vaultService');
jest.mock('../src/utils/logger');

describe('RebalanceSubmitter', () => {
  let submitter: RebalanceSubmitter;
  let mockConfig: ServiceConfig;
  let mockAIOracle: jest.Mocked<AIOracleService>;
  let mockAIEngine: jest.Mocked<AIEngineService>;
  let mockVaultService: jest.Mocked<VaultService>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock config
    mockConfig = {
      aiOracleAddress: '0x1234567890123456789012345678901234567890',
      aiModelSignerPrivateKey: '0xabcdef123456789',
      aiEngineUrl: 'http://localhost:8000',
      seiRpcUrl: 'http://localhost:8545',
      seiChainId: 1329,
      modelVersion: 'v1.0.0',
      aiModelVersion: 'v1.0.0',
      minConfidenceThreshold: 80,
      requestDeadlineSeconds: 300,
      vaults: ['0xvault1', '0xvault2'],
      cronSchedule: '*/5 * * * *',
    };

    // Create mock instances
    mockAIOracle = {
      isModelActive: jest.fn().mockResolvedValue(true),
      checkHealth: jest.fn().mockResolvedValue(true),
      getSignerBalance: jest.fn().mockResolvedValue(BigInt('10000000000000000')),
      getSignerAddress: jest.fn().mockReturnValue('0xsignerAddress'),
      submitAndExecute: jest.fn().mockResolvedValue({
        submission: { success: true, requestId: '0xrequestId' },
        execution: { success: true, transactionHash: '0xtxhash' },
      }),
      getModelInfo: jest.fn(),
      createMessageHash: jest.fn(),
      signRebalanceRequest: jest.fn(),
      submitRebalanceRequest: jest.fn(),
      executeRebalanceRequest: jest.fn(),
      getGasPrice: jest.fn(),
    } as any;

    mockAIEngine = {
      checkHealth: jest.fn().mockResolvedValue(true),
      analyzeVault: jest.fn().mockResolvedValue({
        vault: '0xvault1',
        newTickLower: -100,
        newTickUpper: 100,
        confidence: 95,
        urgency: 'medium',
        expectedApy: 12.5,
      }),
      shouldRebalance: jest.fn().mockReturnValue(true),
      getPrediction: jest.fn(),
      getPrecomputedStrategies: jest.fn(),
      getMetrics: jest.fn(),
    } as any;

    mockVaultService = {
      getAllVaultStates: jest.fn().mockResolvedValue([
        {
          address: '0xvault1',
          lastRebalance: Date.now() - 7200000, // 2 hours ago
          tickLower: -200,
          tickUpper: 200,
        },
        {
          address: '0xvault2',
          lastRebalance: Date.now() - 7200000, // 2 hours ago
          tickLower: -200,
          tickUpper: 200,
        },
      ]),
      shouldCheckRebalance: jest.fn().mockReturnValue(true),
      getVaultState: jest.fn(),
      getPoolState: jest.fn(),
    } as any;

    // Mock constructor calls
    (AIOracleService as jest.MockedClass<typeof AIOracleService>).mockImplementation(
      () => mockAIOracle
    );
    (AIEngineService as jest.MockedClass<typeof AIEngineService>).mockImplementation(
      () => mockAIEngine
    );
    (VaultService as jest.MockedClass<typeof VaultService>).mockImplementation(
      () => mockVaultService
    );

    // Create submitter instance
    submitter = new RebalanceSubmitter(mockConfig);
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(AIOracleService).toHaveBeenCalledWith(mockConfig);
      expect(AIEngineService).toHaveBeenCalledWith(mockConfig);
      expect(VaultService).toHaveBeenCalledWith(mockConfig);
      expect(logger.info).toHaveBeenCalledWith(
        'RebalanceSubmitter initialized',
        expect.objectContaining({
          vaults: 2,
          modelVersion: 'v1.0.0',
          minConfidence: 80,
        })
      );
    });
  });

  describe('run', () => {
    it('should complete a successful rebalance cycle', async () => {
      await submitter.run();

      expect(mockAIOracle.isModelActive).toHaveBeenCalledWith('v1.0.0');
      expect(mockVaultService.getAllVaultStates).toHaveBeenCalled();
      expect(mockVaultService.shouldCheckRebalance).toHaveBeenCalledTimes(2);
      expect(mockAIEngine.analyzeVault).toHaveBeenCalledTimes(2);
      expect(mockAIEngine.shouldRebalance).toHaveBeenCalledTimes(2);
      expect(mockAIOracle.submitAndExecute).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenCalledWith('Rebalance check cycle completed');
    });

    it('should skip if already running', async () => {
      // Start first run
      const firstRun = submitter.run();

      // Try to start second run immediately
      await submitter.run();

      expect(logger.warn).toHaveBeenCalledWith(
        'Rebalance cycle already running, skipping'
      );

      // Complete first run
      await firstRun;
    });

    it('should skip if health check fails', async () => {
      mockAIEngine.checkHealth.mockResolvedValue(false);

      await submitter.run();

      expect(logger.warn).toHaveBeenCalledWith(
        'Service health check failed, skipping cycle',
        expect.any(Object)
      );
      expect(mockVaultService.getAllVaultStates).not.toHaveBeenCalled();
    });

    it('should skip if model is not active', async () => {
      mockAIOracle.isModelActive.mockResolvedValue(false);

      await submitter.run();

      expect(logger.error).toHaveBeenCalledWith(
        'AI model is not active on AIOracle',
        expect.objectContaining({ model: 'v1.0.0' })
      );
      expect(mockVaultService.getAllVaultStates).not.toHaveBeenCalled();
    });

    it('should handle vault processing errors', async () => {
      mockAIEngine.analyzeVault.mockRejectedValueOnce(new Error('Analysis failed'));

      await submitter.run();

      expect(logger.error).toHaveBeenCalledWith(
        'Error processing vault',
        expect.objectContaining({
          vault: '0xvault1',
          error: 'Analysis failed',
        })
      );
      // Should still process the second vault
      expect(mockAIEngine.analyzeVault).toHaveBeenCalledTimes(2);
    });

    it('should handle general errors', async () => {
      mockVaultService.getAllVaultStates.mockRejectedValue(new Error('Failed to get vaults'));

      await submitter.run();

      expect(logger.error).toHaveBeenCalledWith(
        'Rebalance cycle failed',
        expect.objectContaining({ error: 'Failed to get vaults' })
      );
    });
  });

  describe('processVault', () => {
    const vaultState = {
      address: '0xvault1',
      lastRebalance: Date.now() - 7200000,
      tickLower: -200,
      tickUpper: 200,
    };

    it('should skip vault if recently rebalanced', async () => {
      mockVaultService.shouldCheckRebalance.mockReturnValue(false);

      // Access private method through prototype
      const processVault = (submitter as any).processVault.bind(submitter);
      await processVault(vaultState);

      expect(mockAIEngine.analyzeVault).not.toHaveBeenCalled();
    });

    it('should skip if no recommendation received', async () => {
      mockAIEngine.analyzeVault.mockResolvedValue(null);

      const processVault = (submitter as any).processVault.bind(submitter);
      await processVault(vaultState);

      expect(logger.debug).toHaveBeenCalledWith(
        'No recommendation received',
        expect.objectContaining({ vault: '0xvault1' })
      );
      expect(mockAIOracle.submitAndExecute).not.toHaveBeenCalled();
    });

    it('should skip if confidence is too low', async () => {
      mockAIEngine.shouldRebalance.mockReturnValue(false);

      const processVault = (submitter as any).processVault.bind(submitter);
      await processVault(vaultState);

      expect(logger.debug).toHaveBeenCalledWith(
        'Rebalance not warranted',
        expect.any(Object)
      );
      expect(mockAIOracle.submitAndExecute).not.toHaveBeenCalled();
    });

    it('should submit and execute rebalance successfully', async () => {
      const processVault = (submitter as any).processVault.bind(submitter);
      await processVault(vaultState);

      expect(mockAIOracle.submitAndExecute).toHaveBeenCalledWith(
        '0xvault1',
        -100,
        100,
        95,
        expect.any(Number),
        'v1.0.0'
      );
      expect(logger.info).toHaveBeenCalledWith(
        'Rebalance completed successfully',
        expect.any(Object)
      );
    });

    it('should handle failed rebalance', async () => {
      mockAIOracle.submitAndExecute.mockResolvedValue({
        submission: { success: false, error: 'Submission failed' },
      });

      const processVault = (submitter as any).processVault.bind(submitter);
      await processVault(vaultState);

      expect(logger.warn).toHaveBeenCalledWith(
        'Rebalance failed',
        expect.objectContaining({
          vault: '0xvault1',
          submissionSuccess: false,
        })
      );
    });
  });

  describe('checkHealth', () => {
    it('should return healthy status when all services are up', async () => {
      const health = await submitter.checkHealth();

      expect(health).toEqual({
        service: 'healthy',
        aiEngine: true,
        blockchain: true,
        lastCheck: expect.any(Date),
        errors: [],
      });
    });

    it('should return degraded status with one error', async () => {
      mockAIEngine.checkHealth.mockResolvedValue(false);

      const health = await submitter.checkHealth();

      expect(health.service).toBe('degraded');
      expect(health.errors).toContain('AI Engine unreachable');
    });

    it('should return unhealthy status with multiple errors', async () => {
      mockAIEngine.checkHealth.mockResolvedValue(false);
      mockAIOracle.checkHealth.mockResolvedValue(false);

      const health = await submitter.checkHealth();

      expect(health.service).toBe('unhealthy');
      expect(health.errors).toEqual([
        'AI Engine unreachable',
        'Blockchain connection failed',
      ]);
    });

    it('should check signer balance', async () => {
      mockAIOracle.getSignerBalance.mockResolvedValue(BigInt('100000000000'));

      const health = await submitter.checkHealth();

      expect(health.errors).toContain('Signer balance too low');
    });
  });

  describe('getInfo', () => {
    it('should return service information', () => {
      const info = submitter.getInfo();

      expect(info).toEqual({
        signerAddress: '0xsignerAddress',
        modelVersion: 'v1.0.0',
        vaults: ['0xvault1', '0xvault2'],
        aiEngineUrl: 'http://localhost:8000',
        oracleAddress: '0x1234567890123456789012345678901234567890',
        minConfidence: 80,
        cronSchedule: '*/5 * * * *',
      });
    });
  });
});