/**
 * Hook to fetch user's position in a specific vault
 */

import { useReadContract, useAccount } from 'wagmi';
import SEIVault from '@/lib/abis/SEIVault';

interface VaultPosition {
  shares: string;
  shareValue: string;
  totalDeposited: string;
  totalWithdrawn: string;
  depositTime: string;
  lockTimeRemaining: string;
}

export function useVaultPosition(vaultAddress: string) {
  const { address: userAddress } = useAccount();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: SEIVault,
    functionName: 'getCustomerStats',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress && !!vaultAddress,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  });

  // Parse the data if available
  const position: VaultPosition | null = data ? {
    shares: (data as bigint[])[0]?.toString() || '0',
    shareValue: (data as bigint[])[1]?.toString() || '0',
    totalDeposited: (data as bigint[])[2]?.toString() || '0',
    totalWithdrawn: (data as bigint[])[3]?.toString() || '0',
    depositTime: (data as bigint[])[4]?.toString() || '0',
    lockTimeRemaining: (data as bigint[])[5]?.toString() || '0',
  } : null;

  const hasPosition = position ? BigInt(position.shares) > 0n : false;

  return {
    position,
    hasPosition,
    isLoading,
    isError,
    error,
    refetch
  };
}
