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
  // Note: wagmi returns tuple data as an array-like object with both numeric indices and named properties
  // IMPORTANT: We prioritize named properties over indices to avoid confusion
  const position: VaultPosition | null = data ? {
    shares: ((data as any).shares ?? (data as any)[0] ?? 0n).toString(),
    shareValue: ((data as any).shareValue ?? (data as any)[1] ?? 0n).toString(),
    totalDeposited: ((data as any).totalDeposited ?? (data as any)[2] ?? 0n).toString(),
    totalWithdrawn: ((data as any).totalWithdrawn ?? (data as any)[3] ?? 0n).toString(),
    depositTime: ((data as any).depositTime ?? (data as any)[4] ?? 0n).toString(),
    lockTimeRemaining: ((data as any).lockTimeRemaining ?? (data as any)[5] ?? 0n).toString(),
  } : null;

  // Debug logging
  if (data) {
    console.log('[useVaultPosition] ===== CONTRACT DATA =====');
    console.log('[useVaultPosition] Raw contract data:', data);
    console.log('[useVaultPosition] Data type:', typeof data);
    console.log('[useVaultPosition] Is Array?:', Array.isArray(data));
    console.log('[useVaultPosition] Data keys:', Object.keys(data));
    console.log('[useVaultPosition] ===== NUMERIC INDICES =====');
    console.log('[useVaultPosition] [0] (should be shares):', (data as any)[0]?.toString());
    console.log('[useVaultPosition] [1] (should be shareValue):', (data as any)[1]?.toString());
    console.log('[useVaultPosition] [2] (should be totalDeposited):', (data as any)[2]?.toString());
    console.log('[useVaultPosition] [3] (should be totalWithdrawn):', (data as any)[3]?.toString());
    console.log('[useVaultPosition] [4] (should be depositTime):', (data as any)[4]?.toString());
    console.log('[useVaultPosition] [5] (should be lockTimeRemaining):', (data as any)[5]?.toString());
    console.log('[useVaultPosition] ===== NAMED PROPERTIES =====');
    console.log('[useVaultPosition] .shares:', (data as any).shares?.toString());
    console.log('[useVaultPosition] .shareValue:', (data as any).shareValue?.toString());
    console.log('[useVaultPosition] .totalDeposited:', (data as any).totalDeposited?.toString());
    console.log('[useVaultPosition] .totalWithdrawn:', (data as any).totalWithdrawn?.toString());
    console.log('[useVaultPosition] .depositTime:', (data as any).depositTime?.toString());
    console.log('[useVaultPosition] .lockTimeRemaining:', (data as any).lockTimeRemaining?.toString());

    if (position) {
      console.log('[useVaultPosition] ===== PARSED POSITION =====');
      console.log('[useVaultPosition] Parsed position object:', position);
      console.log('[useVaultPosition] Shares (Wei):', position.shares);
      console.log('[useVaultPosition] Shares (Ether):', (Number(position.shares) / 1e18).toFixed(18));
      console.log('[useVaultPosition] ShareValue (Wei):', position.shareValue);
      console.log('[useVaultPosition] ShareValue (Ether):', (Number(position.shareValue) / 1e18).toFixed(18));
      console.log('[useVaultPosition] TotalDeposited (Wei):', position.totalDeposited);
      console.log('[useVaultPosition] TotalDeposited (Ether):', (Number(position.totalDeposited) / 1e18).toFixed(18));
    }
    console.log('[useVaultPosition] ===============================');
  }

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
