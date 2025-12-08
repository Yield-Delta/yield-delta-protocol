/**
 * Tests for Vault Service
 */

import { VaultService } from '../src/services/vaultService';
import { Contract, Wallet, providers } from 'ethers';
import { AIRebalanceRequest } from '../src/types';

describe('VaultService', () => {
  let vaultService: VaultService;
  let mockProvider: providers.JsonRpcProvider;
  let mockWallet: Wallet;
  let mockContract: Contract;

  beforeEach(() => {
    mockProvider = new providers.JsonRpcProvider('http://localhost:8545');
    mockWallet = new Wallet('0x1234567890123456789012345678901234567890123456789012345678901234');
    mockContract = new Contract('0xVaultAddress', [], mockWallet);

    vaultService = new VaultService(
      mockContract,
      mockWallet,
      mockProvider
    );
  });

  describe('initialization', () => {
    it('should initialize with correct parameters', () => {
      expect(vaultService).toBeDefined();
      expect(vaultService.contract).toBe(mockContract);
      expect(vaultService.signer).toBe(mockWallet);
    });

    it('should connect to the correct network', async () => {
      const network = await mockProvider.getNetwork();
      expect(network.chainId).toBe(1329); // SEI testnet
    });
  });

  describe('getVaultState', () => {
    it('should fetch current vault state', async () => {
      mockContract.getVault = jest.fn().mockResolvedValue({
        token0: '0xToken0Address',
        token1: '0xToken1Address',
        fee: 3000,
        tickLower: -887220,
        tickUpper: 887220,
        liquidity: BigInt('1000000000000000000'),
      });

      mockContract.getCurrentTick = jest.fn().mockResolvedValue(0);

      const state = await vaultService.getVaultState('0xVaultAddress');

      expect(state).toBeDefined();
      expect(state.token0).toBe('0xToken0Address');
      expect(state.liquidity).toBe(BigInt('1000000000000000000'));
      expect(mockContract.getVault).toHaveBeenCalledWith('0xVaultAddress');
    });

    it('should handle vault not found', async () => {
      mockContract.getVault = jest.fn().mockRejectedValue(new Error('Vault not found'));

      await expect(vaultService.getVaultState('0xInvalidVault'))
        .rejects.toThrow('Vault not found');
    });

    it('should calculate vault utilization', async () => {
      mockContract.getVault = jest.fn().mockResolvedValue({
        tickLower: -100,
        tickUpper: 100,
        liquidity: BigInt('1000000000000000000'),
      });

      mockContract.getCurrentTick = jest.fn().mockResolvedValue(50);

      const state = await vaultService.getVaultState('0xVaultAddress');
      const utilization = vaultService.calculateUtilization(state);

      expect(utilization).toBeGreaterThan(0);
      expect(utilization).toBeLessThanOrEqual(1);
    });
  });

  describe('submitRebalance', () => {
    it('should submit rebalance transaction', async () => {
      const request: AIRebalanceRequest = {
        vault: '0xVaultAddress',
        newTickLower: -1000,
        newTickUpper: 1000,
        confidence: BigInt(8000),
        timestamp: BigInt(Date.now()),
        deadline: BigInt(Date.now() + 3600000),
        executed: false,
      };

      mockContract.rebalance = jest.fn().mockResolvedValue({
        hash: '0xTransactionHash',
        wait: jest.fn().mockResolvedValue({ status: 1 }),
      });

      const result = await vaultService.submitRebalance(request);

      expect(result.success).toBe(true);
      expect(result.transactionHash).toBe('0xTransactionHash');
      expect(mockContract.rebalance).toHaveBeenCalledWith(
        request.vault,
        request.newTickLower,
        request.newTickUpper,
        request.confidence
      );
    });

    it('should handle rebalance rejection', async () => {
      const request: AIRebalanceRequest = {
        vault: '0xVaultAddress',
        newTickLower: -1000,
        newTickUpper: 1000,
        confidence: BigInt(3000), // Low confidence
        timestamp: BigInt(Date.now()),
        deadline: BigInt(Date.now() + 3600000),
        executed: false,
      };

      mockContract.rebalance = jest.fn().mockRejectedValue(
        new Error('Confidence too low')
      );

      await expect(vaultService.submitRebalance(request))
        .rejects.toThrow('Confidence too low');
    });

    it('should validate tick range', async () => {
      const request: AIRebalanceRequest = {
        vault: '0xVaultAddress',
        newTickLower: 1000,
        newTickUpper: -1000, // Invalid: lower > upper
        confidence: BigInt(8000),
        timestamp: BigInt(Date.now()),
        deadline: BigInt(Date.now() + 3600000),
        executed: false,
      };

      await expect(vaultService.submitRebalance(request))
        .rejects.toThrow('Invalid tick range');
    });

    it('should check deadline before submission', async () => {
      const request: AIRebalanceRequest = {
        vault: '0xVaultAddress',
        newTickLower: -1000,
        newTickUpper: 1000,
        confidence: BigInt(8000),
        timestamp: BigInt(Date.now() - 7200000),
        deadline: BigInt(Date.now() - 3600000), // Expired
        executed: false,
      };

      await expect(vaultService.submitRebalance(request))
        .rejects.toThrow('Request deadline expired');
    });
  });

  describe('estimateGas', () => {
    it('should estimate gas for rebalance', async () => {
      mockContract.estimateGas = {
        rebalance: jest.fn().mockResolvedValue(BigInt(200000)),
      };

      mockProvider.getGasPrice = jest.fn().mockResolvedValue(BigInt(20000000000));

      const estimate = await vaultService.estimateRebalanceGas(
        '0xVaultAddress',
        -1000,
        1000
      );

      expect(estimate.gasLimit).toBe(BigInt(200000));
      expect(estimate.gasPrice).toBe(BigInt(20000000000));
      expect(estimate.estimatedCost).toBe(BigInt(4000000000000000));
    });

    it('should add gas buffer for safety', async () => {
      mockContract.estimateGas = {
        rebalance: jest.fn().mockResolvedValue(BigInt(200000)),
      };

      const estimate = await vaultService.estimateRebalanceGas(
        '0xVaultAddress',
        -1000,
        1000,
        1.2 // 20% buffer
      );

      expect(estimate.gasLimit).toBe(BigInt(240000));
    });
  });

  describe('monitoring', () => {
    it('should monitor vault performance', async () => {
      mockContract.getVaultPerformance = jest.fn().mockResolvedValue({
        totalFees: BigInt('1000000000000000000'),
        apy: BigInt(1200), // 12%
        volume24h: BigInt('5000000000000000000000'),
      });

      const performance = await vaultService.getVaultPerformance('0xVaultAddress');

      expect(performance.totalFees).toBe(BigInt('1000000000000000000'));
      expect(performance.apy).toBe(BigInt(1200));
    });

    it('should detect when rebalance is needed', async () => {
      mockContract.getVault = jest.fn().mockResolvedValue({
        tickLower: -100,
        tickUpper: 100,
        liquidity: BigInt('1000000000000000000'),
      });

      mockContract.getCurrentTick = jest.fn().mockResolvedValue(150); // Out of range

      const needsRebalance = await vaultService.needsRebalance('0xVaultAddress');
      expect(needsRebalance).toBe(true);
    });

    it('should track rebalance history', async () => {
      mockContract.queryFilter = jest.fn().mockResolvedValue([
        {
          args: {
            vault: '0xVaultAddress',
            newTickLower: -1000,
            newTickUpper: 1000,
            timestamp: BigInt(Date.now() - 86400000),
          },
          blockNumber: 12345,
          transactionHash: '0xTx1',
        },
        {
          args: {
            vault: '0xVaultAddress',
            newTickLower: -2000,
            newTickUpper: 2000,
            timestamp: BigInt(Date.now()),
          },
          blockNumber: 12346,
          transactionHash: '0xTx2',
        },
      ]);

      const history = await vaultService.getRebalanceHistory('0xVaultAddress', 7);
      expect(history).toHaveLength(2);
      expect(history[0].transactionHash).toBe('0xTx1');
    });
  });

  describe('error handling', () => {
    it('should retry failed transactions', async () => {
      let attempt = 0;
      mockContract.rebalance = jest.fn().mockImplementation(() => {
        attempt++;
        if (attempt < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          hash: '0xTransactionHash',
          wait: jest.fn().mockResolvedValue({ status: 1 }),
        });
      });

      const request: AIRebalanceRequest = {
        vault: '0xVaultAddress',
        newTickLower: -1000,
        newTickUpper: 1000,
        confidence: BigInt(8000),
        timestamp: BigInt(Date.now()),
        deadline: BigInt(Date.now() + 3600000),
        executed: false,
      };

      const result = await vaultService.submitRebalanceWithRetry(request, 3);
      expect(result.success).toBe(true);
      expect(mockContract.rebalance).toHaveBeenCalledTimes(3);
    });

    it('should handle nonce issues', async () => {
      mockContract.rebalance = jest.fn().mockRejectedValueOnce(
        new Error('nonce has already been used')
      );

      mockProvider.getTransactionCount = jest.fn().mockResolvedValue(10);

      const request: AIRebalanceRequest = {
        vault: '0xVaultAddress',
        newTickLower: -1000,
        newTickUpper: 1000,
        confidence: BigInt(8000),
        timestamp: BigInt(Date.now()),
        deadline: BigInt(Date.now() + 3600000),
        executed: false,
      };

      // Should reset nonce and retry
      mockContract.rebalance = jest.fn().mockResolvedValueOnce({
        hash: '0xTransactionHash',
        wait: jest.fn().mockResolvedValue({ status: 1 }),
      });

      const result = await vaultService.submitRebalanceWithNonceHandling(request);
      expect(result.success).toBe(true);
    });

    it('should handle insufficient gas', async () => {
      mockContract.rebalance = jest.fn().mockRejectedValueOnce(
        new Error('insufficient funds for gas')
      );

      const request: AIRebalanceRequest = {
        vault: '0xVaultAddress',
        newTickLower: -1000,
        newTickUpper: 1000,
        confidence: BigInt(8000),
        timestamp: BigInt(Date.now()),
        deadline: BigInt(Date.now() + 3600000),
        executed: false,
      };

      await expect(vaultService.submitRebalance(request))
        .rejects.toThrow('insufficient funds for gas');
    });
  });

  describe('multicall operations', () => {
    it('should batch multiple vault operations', async () => {
      const vaults = ['0xVault1', '0xVault2', '0xVault3'];

      mockContract.multicall = jest.fn().mockResolvedValue([
        { success: true, data: 'vault1Data' },
        { success: true, data: 'vault2Data' },
        { success: true, data: 'vault3Data' },
      ]);

      const results = await vaultService.batchGetVaultStates(vaults);
      expect(results).toHaveLength(3);
      expect(mockContract.multicall).toHaveBeenCalledTimes(1);
    });

    it('should handle partial multicall failures', async () => {
      const vaults = ['0xVault1', '0xVault2', '0xVault3'];

      mockContract.multicall = jest.fn().mockResolvedValue([
        { success: true, data: 'vault1Data' },
        { success: false, data: '0x' },
        { success: true, data: 'vault3Data' },
      ]);

      const results = await vaultService.batchGetVaultStates(vaults);
      expect(results).toHaveLength(2);
    });
  });
});