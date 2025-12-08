/**
 * Jest setup file for backend-signer tests
 */

import { config } from 'dotenv';

// Load test environment variables
config({ path: '../.env.test' });

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  // Keep warn and error for debugging
  warn: console.warn,
  error: console.error,
};

// Set default timeout for async operations
jest.setTimeout(30000);

// Mock ethers for blockchain interactions
jest.mock('ethers', () => ({
  Contract: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockReturnThis(),
    rebalance: jest.fn(),
    updateParameters: jest.fn(),
    getVault: jest.fn(),
    submitPrice: jest.fn(),
  })),
  Wallet: jest.fn().mockImplementation(() => ({
    address: '0x1234567890123456789012345678901234567890',
    signTransaction: jest.fn(),
    sendTransaction: jest.fn(),
  })),
  providers: {
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      getNetwork: jest.fn().mockResolvedValue({ chainId: 1329 }),
      getBlockNumber: jest.fn().mockResolvedValue(12345678),
      getGasPrice: jest.fn().mockResolvedValue(BigInt(20000000000)),
    })),
  },
  utils: {
    parseEther: jest.fn((value) => BigInt(value) * BigInt(10 ** 18)),
    formatEther: jest.fn((value) => (Number(value) / 10 ** 18).toString()),
    parseUnits: jest.fn((value, decimals) => BigInt(value) * BigInt(10 ** decimals)),
    formatUnits: jest.fn((value, decimals) => (Number(value) / 10 ** decimals).toString()),
  },
}));

// Mock axios for API calls
jest.mock('axios');

export {};