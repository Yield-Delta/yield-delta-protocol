/**
 * Hook to fetch on-chain TVL for vaults
 */

import { useReadContracts } from 'wagmi';
import SEIVault from '@/lib/abis/SEIVault';

interface VaultTVL {
  address: string;
  tvl: bigint;
  tvlFormatted: number;
}

export function useVaultTVL(vaultAddresses: string[]) {
  // Create contract read configs for all vaults to get totalAssets
  const contracts = vaultAddresses.map((vaultAddress) => ({
    address: vaultAddress as `0x${string}`,
    abi: SEIVault,
    functionName: 'totalAssets' as const,
  }));

  const { data, isLoading, isError, error, refetch } = useReadContracts({
    contracts: vaultAddresses.length > 0 ? contracts : [],
    query: {
      enabled: vaultAddresses.length > 0,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  });

  // Parse the data for each vault
  const tvlData: VaultTVL[] = vaultAddresses.map((address, index) => {
    const result = data?.[index];

    if (!result || result.status === 'failure' || !result.result) {
      return {
        address,
        tvl: 0n,
        tvlFormatted: 0,
      };
    }

    const tvl = result.result as bigint;
    const tvlFormatted = Number(tvl) / 1e18;

    return {
      address,
      tvl,
      tvlFormatted,
    };
  });

  // Create a map for easy lookup
  const tvlMap = new Map<string, number>();
  tvlData.forEach((item) => {
    tvlMap.set(item.address.toLowerCase(), item.tvlFormatted);
  });

  return {
    tvlData,
    tvlMap,
    isLoading,
    isError,
    error,
    refetch
  };
}
