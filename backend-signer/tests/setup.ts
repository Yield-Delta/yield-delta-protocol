/**
 * Jest setup file for backend-signer tests
 */

jest.setTimeout(30000);

jest.mock('ethers', () => ({
  Contract: jest.fn(() => ({})),
  Wallet: jest.fn(() => ({})),
  JsonRpcProvider: jest.fn(() => ({})),
  BrowserProvider: jest.fn(() => ({})),
  formatEther: jest.fn(),
  parseEther: jest.fn(),
  formatUnits: jest.fn(),
  parseUnits: jest.fn(),
}));

jest.mock('axios');

export {};