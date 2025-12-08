import { AIEngineService } from '../src/services/aiEngineService';
import { ServiceConfig, VaultState, RebalanceRecommendation } from '../src/types';
import axios from 'axios';
import logger from '../src/utils/logger';

// Mock dependencies
jest.mock('axios');
jest.mock('../src/utils/logger');

describe('AIEngineService', () => {
  let service: AIEngineService;
  let mockConfig: ServiceConfig;
  let mockAxiosInstance: any;

  beforeEach(() => {
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
      vaults: ['0xvault1'],
      vaultFactoryAddress: '0xfactory',
      cronSchedule: '*/5 * * * *',
      logLevel: 'info',
    };

    // Setup mock axios instance
    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
    };

    (axios.create as jest.Mock) = jest.fn().mockReturnValue(mockAxiosInstance);

    // Create service
    service = new AIEngineService(mockConfig);
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8000',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(logger.info).toHaveBeenCalledWith(
        'AI Engine service initialized',
        { baseUrl: 'http://localhost:8000' }
      );
    });
  });

  describe('analyzeVault', () => {
    const mockVaultState: VaultState = {
      address: '0xvault1',
      currentTickLower: -100,
      currentTickUpper: 100,
      totalLiquidity: '1000000',
      token0Balance: '500000',
      token1Balance: '500000',
      lastRebalance: Date.now(),
    };

    it('should analyze vault successfully', async () => {
      const mockResponse = {
        data: {
          new_lower_tick: -200,
          new_upper_tick: 200,
          confidence: 0.95,
          predicted_apy: 12.5,
          urgency: 'medium',
          model_version: 'v1.0.0',
          timestamp: Date.now(),
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await service.analyzeVault(mockVaultState);

      expect(result).toEqual({
        vault: '0xvault1',
        newTickLower: -200,
        newTickUpper: 200,
        confidence: 95,
        expectedApy: 12.5,
        urgency: 'medium',
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/analyze/rebalance',
        expect.objectContaining({
          vault_address: '0xvault1',
          current_tick: 0,
          lower_tick: -100,
          upper_tick: 100,
          utilization_rate: expect.any(Number),
        })
      );
    });

    it('should handle invalid tick range (0,0) with current position', async () => {
      const mockResponse = {
        data: {
          new_lower_tick: 0,
          new_upper_tick: 0,
          confidence: 0.8,
          predicted_apy: 10,
          urgency: 'low',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await service.analyzeVault(mockVaultState);

      expect(result).toBeDefined();
      expect(result!.newTickLower).toBeLessThan(result!.newTickUpper);
      expect(logger.warn).toHaveBeenCalledWith(
        'AI Engine returned invalid tick range (0,0), using fallback values',
        expect.any(Object)
      );
    });

    it('should handle invalid tick range (0,0) without current position', async () => {
      const vaultStateNoPosition = {
        ...mockVaultState,
        currentTickLower: 0,
        currentTickUpper: 0,
      };

      const mockResponse = {
        data: {
          new_lower_tick: 0,
          new_upper_tick: 0,
          confidence: 0.8,
          predicted_apy: 10,
          urgency: 'low',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await service.analyzeVault(vaultStateNoPosition);

      expect(result).toBeDefined();
      expect(result!.newTickLower).toBeLessThan(result!.newTickUpper);
      expect(result!.newTickLower).toBe(-3000);
      expect(result!.newTickUpper).toBe(3000);
    });

    it('should return null for invalid tick range (lower >= upper)', async () => {
      const mockResponse = {
        data: {
          new_lower_tick: 200,
          new_upper_tick: 100,
          confidence: 0.8,
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await service.analyzeVault(mockVaultState);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        'Invalid tick range: lower >= upper',
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('API Error'));

      const result = await service.analyzeVault(mockVaultState);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to get rebalance recommendation',
        expect.any(Object)
      );
    });
  });

  describe('shouldRebalance', () => {
    it('should return true when confidence and urgency meet thresholds', () => {
      const recommendation: RebalanceRecommendation = {
        vault: '0xvault1',
        newTickLower: -200,
        newTickUpper: 200,
        confidence: 85,
        expectedApy: 12,
        urgency: 'high',
      };

      const result = service.shouldRebalance(recommendation, 80);
      expect(result).toBe(true);
    });

    it('should return false when confidence is below threshold', () => {
      const recommendation: RebalanceRecommendation = {
        vault: '0xvault1',
        newTickLower: -200,
        newTickUpper: 200,
        confidence: 70,
        expectedApy: 12,
        urgency: 'high',
      };

      const result = service.shouldRebalance(recommendation, 80);
      expect(result).toBe(false);
    });

    it('should return false when urgency is low', () => {
      const recommendation: RebalanceRecommendation = {
        vault: '0xvault1',
        newTickLower: -200,
        newTickUpper: 200,
        confidence: 85,
        expectedApy: 12,
        urgency: 'low',
      };

      const result = service.shouldRebalance(recommendation, 80);
      expect(result).toBe(false);
    });
  });

  describe('checkHealth', () => {
    it('should return true when AI Engine is healthy', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { status: 'healthy', models_loaded: true },
      });

      const result = await service.checkHealth();
      expect(result).toBe(true);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health');
    });

    it('should return false when AI Engine is unhealthy', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { status: 'unhealthy', models_loaded: false },
      });

      const result = await service.checkHealth();
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Connection error'));

      const result = await service.checkHealth();
      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        'AI Engine health check failed',
        expect.any(Object)
      );
    });
  });

  describe('getPrediction', () => {
    it('should get prediction successfully', async () => {
      const mockResponse = {
        data: {
          predicted_price: 45000,
          confidence: 0.92,
          timestamp: Date.now(),
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await service.getPrediction('BTC', [40000, 42000, 44000]);

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/predict/price',
        { asset: 'BTC', historical_prices: [40000, 42000, 44000] }
      );
    });
  });

  describe('getPrecomputedStrategies', () => {
    it('should get precomputed strategies successfully', async () => {
      const mockResponse = {
        data: {
          strategies: [
            { vault: '0xvault1', strategy: 'conservative', apy: 8 },
            { vault: '0xvault2', strategy: 'aggressive', apy: 15 },
          ],
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await service.getPrecomputedStrategies();

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/strategies/precomputed');
    });
  });

  describe('getMetrics', () => {
    it('should get metrics successfully', async () => {
      const mockResponse = {
        data: {
          total_predictions: 1000,
          average_confidence: 0.87,
          success_rate: 0.92,
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await service.getMetrics();

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/metrics');
    });
  });
});