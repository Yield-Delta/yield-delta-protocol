/**
 * Chain utility functions for network detection and handling
 */

// SEI Chain IDs
export const SEI_MAINNET_ID = 1329;
export const SEI_TESTNET_ID = 1328; // Atlantic-2
export const SEI_DEVNET_ID = 713715; // Arctic-1

/**
 * Check if a chain ID is a testnet
 */
export function isTestnetChain(chainId: number): boolean {
  return chainId === SEI_TESTNET_ID || chainId === SEI_DEVNET_ID;
}

/**
 * Check if a chain ID is mainnet
 */
export function isMainnetChain(chainId: number): boolean {
  return chainId === SEI_MAINNET_ID;
}

/**
 * Get chain name from chain ID
 */
export function getChainName(chainId: number): string {
  switch (chainId) {
    case SEI_MAINNET_ID:
      return 'SEI Mainnet';
    case SEI_TESTNET_ID:
      return 'SEI Atlantic-2 Testnet';
    case SEI_DEVNET_ID:
      return 'SEI Arctic-1 Devnet';
    default:
      return `Chain ${chainId}`;
  }
}

/**
 * Get chain display name with testnet indicator
 */
export function getChainDisplayName(chainId: number): string {
  const isTestnet = isTestnetChain(chainId);

  switch (chainId) {
    case SEI_MAINNET_ID:
      return 'SEI';
    case SEI_TESTNET_ID:
      return 'SEI Testnet';
    case SEI_DEVNET_ID:
      return 'SEI Devnet';
    default:
      return isTestnet ? `Testnet ${chainId}` : `Chain ${chainId}`;
  }
}

/**
 * Get block explorer URL for a chain
 */
export function getBlockExplorerUrl(chainId: number): string {
  switch (chainId) {
    case SEI_MAINNET_ID:
      return 'https://seitrace.com';
    case SEI_TESTNET_ID:
      return 'https://seitrace.com/atlantic-2';
    case SEI_DEVNET_ID:
      return 'https://seitrace.com/?chain=devnet';
    default:
      return '';
  }
}

/**
 * Check if environment is configured for testnet
 */
export function isTestnetEnvironment(): boolean {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  return chainId === 'sei-testnet' || chainId === 'sei-devnet' || !chainId;
}

/**
 * Get expected chain ID from environment
 */
export function getExpectedChainId(): number {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;

  switch (chainId) {
    case 'sei-mainnet':
      return SEI_MAINNET_ID;
    case 'sei-devnet':
      return SEI_DEVNET_ID;
    case 'sei-testnet':
    default:
      return SEI_TESTNET_ID; // Default to testnet for safety
  }
}
