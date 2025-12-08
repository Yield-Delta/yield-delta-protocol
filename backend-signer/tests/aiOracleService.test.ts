import { ethers } from 'ethers';
import { AIOracleService } from '../src/services/aiOracleService';
import { ServiceConfig } from '../src/types';
import logger from '../src/utils/logger';

// Mock dependencies
jest.mock('../src/utils/logger');

// Mock ethers
jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');
  return {
    ...actual,
    JsonRpcProvider: jest.fn(),
    Wallet: jest.fn(),
    Contract: jest.fn(),
  };
});

describe('AIOracleService', () => {
  let service: AIOracleService;
  let mockConfig: ServiceConfig;
  let mockProvider: any;
  let mockSigner: any;
  let mockContract: any;

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
    };

    // Setup mock provider
    mockProvider = {
      getNetwork: jest.fn().mockResolvedValue({ chainId: BigInt(1329) }),
      getBlockNumber: jest.fn().mockResolvedValue(12345),
      getFeeData: jest.fn().mockResolvedValue({ gasPrice: BigInt(1000000000) }),
      getBalance: jest.fn().mockResolvedValue(BigInt(1000000000000000000)),
    };

    // Setup mock signer
    mockSigner = {
      address: '0xsignerAddress',
      signMessage: jest.fn().mockResolvedValue('0xsignature'),
    };

    // Setup mock contract
    mockContract = {
      interface: {
        parseLog: jest.fn(),
      },
      getModelPerformance: jest.fn().mockResolvedValue([100, 1000, true]),
      aiModels: jest.fn().mockResolvedValue({
        version: 'v1.0.0',
        signer: '0xsignerAddress',
        isActive: true,
        successRate: 100,
        totalRequests: 1000,
      }),
      submitRebalanceRequest: jest.fn().mockResolvedValue({
        hash: '0xtxhash',
        wait: jest.fn().mockResolvedValue({
          hash: '0xtxhash',
          gasUsed: BigInt(100000),
          logs: [{
            topics: ['0xeventTopic'],
            data: '0xeventData',
          }],
        }),
      }),
      executeRebalanceRequest: jest.fn().mockResolvedValue({
        hash: '0xtxhash',
        wait: jest.fn().mockResolvedValue({
          hash: '0xtxhash',
          gasUsed: BigInt(100000),
          logs: [{
            topics: ['0xeventTopic'],
            data: '0xeventData',
          }],
        }),
      }),
    };

    // Setup mocked constructors
    (ethers.JsonRpcProvider as jest.Mock).mockReturnValue(mockProvider);
    (ethers.Wallet as jest.Mock).mockImplementation(() => mockSigner);
    (ethers.Contract as jest.Mock).mockReturnValue(mockContract);

    // Create service instance
    service = new AIOracleService(mockConfig);
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(ethers.JsonRpcProvider).toHaveBeenCalledWith(mockConfig.seiRpcUrl);
      expect(ethers.Wallet).toHaveBeenCalledWith(
        mockConfig.aiModelSignerPrivateKey,
        mockProvider
      );
      expect(ethers.Contract).toHaveBeenCalledWith(
        mockConfig.aiOracleAddress,
        expect.any(Array),
        mockSigner
      );
      expect(logger.info).toHaveBeenCalledWith(
        'AIOracle service initialized',
        expect.objectContaining({
          oracleAddress: mockConfig.aiOracleAddress,
          signerAddress: mockSigner.address,
        })
      );
    });
  });

  describe('getSignerAddress', () => {
    it('should return signer address', () => {
      const address = service.getSignerAddress();
      expect(address).toBe('0xsignerAddress');
    });
  });

  describe('isModelActive', () => {
    it('should return true for active model', async () => {
      const isActive = await service.isModelActive('v1.0.0');
      expect(isActive).toBe(true);
      expect(mockContract.getModelPerformance).toHaveBeenCalledWith('v1.0.0');
    });

    it('should return false on error', async () => {
      mockContract.getModelPerformance.mockRejectedValue(new Error('Contract error'));
      const isActive = await service.isModelActive('v1.0.0');
      expect(isActive).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getModelInfo', () => {
    it('should return model info', async () => {
      const modelInfo = await service.getModelInfo('v1.0.0');
      expect(modelInfo).toEqual({
        version: 'v1.0.0',
        signer: '0xsignerAddress',
        isActive: true,
        successRate: 100,
        totalRequests: 1000,
      });
      expect(mockContract.aiModels).toHaveBeenCalledWith('v1.0.0');
    });

    it('should return null on error', async () => {
      mockContract.aiModels.mockRejectedValue(new Error('Contract error'));
      const modelInfo = await service.getModelInfo('v1.0.0');
      expect(modelInfo).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('createMessageHash', () => {
    it('should create correct message hash', () => {
      const vault = '0xvaultAddress';
      const newTickLower = -100;
      const newTickUpper = 100;
      const confidence = 95;
      const deadline = 1234567890;

      const hash = service.createMessageHash(
        vault,
        newTickLower,
        newTickUpper,
        confidence,
        deadline
      );

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).toMatch(/^0x[a-f0-9]{64}$/i);
    });
  });

  describe('signRebalanceRequest', () => {
    it('should sign rebalance request', async () => {
      const signature = await service.signRebalanceRequest(
        '0xvaultAddress',
        -100,
        100,
        95,
        1234567890
      );

      expect(signature).toBe('0xsignature');
      expect(mockSigner.signMessage).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith(
        'Signed rebalance request',
        expect.any(Object)
      );
    });
  });

  describe('submitRebalanceRequest', () => {
    it('should submit rebalance request successfully', async () => {
      mockContract.interface.parseLog.mockReturnValue({
        name: 'AIRequestSubmitted',
        args: { requestId: '0xrequestId' },
      });

      const result = await service.submitRebalanceRequest(
        '0xvaultAddress',
        -100,
        100,
        95,
        1234567890,
        'v1.0.0'
      );

      expect(result.success).toBe(true);
      expect(result.requestId).toBe('0xrequestId');
      expect(result.transactionHash).toBe('0xtxhash');
      expect(mockContract.submitRebalanceRequest).toHaveBeenCalled();
    });

    it('should handle submission failure', async () => {
      mockContract.submitRebalanceRequest.mockRejectedValue(
        new Error('Transaction failed')
      );

      const result = await service.submitRebalanceRequest(
        '0xvaultAddress',
        -100,
        100,
        95,
        1234567890,
        'v1.0.0'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transaction failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('executeRebalanceRequest', () => {
    it('should execute rebalance request successfully', async () => {
      mockContract.interface.parseLog.mockReturnValue({
        name: 'AIRequestExecuted',
        args: { success: true },
      });

      const result = await service.executeRebalanceRequest('0xrequestId', 'v1.0.0');

      expect(result.success).toBe(true);
      expect(result.transactionHash).toBe('0xtxhash');
      expect(mockContract.executeRebalanceRequest).toHaveBeenCalledWith(
        '0xrequestId',
        'v1.0.0'
      );
    });

    it('should handle execution failure', async () => {
      mockContract.executeRebalanceRequest.mockRejectedValue(
        new Error('Execution failed')
      );

      const result = await service.executeRebalanceRequest('0xrequestId', 'v1.0.0');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Execution failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('submitAndExecute', () => {
    it('should submit and execute successfully', async () => {
      // Mock successful submission
      mockContract.interface.parseLog
        .mockReturnValueOnce({
          name: 'AIRequestSubmitted',
          args: { requestId: '0xrequestId' },
        })
        .mockReturnValueOnce({
          name: 'AIRequestExecuted',
          args: { success: true },
        });

      const result = await service.submitAndExecute(
        '0xvaultAddress',
        -100,
        100,
        95,
        1234567890,
        'v1.0.0'
      );

      expect(result.submission.success).toBe(true);
      expect(result.execution).toBeDefined();
      expect(result.execution?.success).toBe(true);
    });

    it('should return only submission if submission fails', async () => {
      mockContract.submitRebalanceRequest.mockRejectedValue(
        new Error('Submission failed')
      );

      const result = await service.submitAndExecute(
        '0xvaultAddress',
        -100,
        100,
        95,
        1234567890,
        'v1.0.0'
      );

      expect(result.submission.success).toBe(false);
      expect(result.execution).toBeUndefined();
    });
  });

  describe('checkHealth', () => {
    it('should return true for healthy connection', async () => {
      const isHealthy = await service.checkHealth();
      expect(isHealthy).toBe(true);
      expect(mockProvider.getNetwork).toHaveBeenCalled();
      expect(mockProvider.getBlockNumber).toHaveBeenCalled();
    });

    it('should return false for wrong chain', async () => {
      mockProvider.getNetwork.mockResolvedValue({ chainId: BigInt(1) });
      const isHealthy = await service.checkHealth();
      expect(isHealthy).toBe(false);
    });

    it('should return false on error', async () => {
      mockProvider.getNetwork.mockRejectedValue(new Error('Network error'));
      const isHealthy = await service.checkHealth();
      expect(isHealthy).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getGasPrice', () => {
    it('should return gas price', async () => {
      const gasPrice = await service.getGasPrice();
      expect(gasPrice).toBe(BigInt(1000000000));
      expect(mockProvider.getFeeData).toHaveBeenCalled();
    });

    it('should return 0 if gas price is null', async () => {
      mockProvider.getFeeData.mockResolvedValue({ gasPrice: null });
      const gasPrice = await service.getGasPrice();
      expect(gasPrice).toBe(BigInt(0));
    });
  });

  describe('getSignerBalance', () => {
    it('should return signer balance', async () => {
      const balance = await service.getSignerBalance();
      expect(balance).toBe(BigInt(1000000000000000000));
      expect(mockProvider.getBalance).toHaveBeenCalledWith('0xsignerAddress');
    });
  });
});