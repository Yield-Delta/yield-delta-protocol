/**
 * Hook to get the current vault state including total supply and balance
 */

import { useReadContract } from 'wagmi';
import SEIVault from '@/lib/abis/SEIVault';
import { formatEther } from 'viem';

export function useVaultState(vaultAddress: string) {
  // Get total supply (total shares minted)
  const { data: totalSupply } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: SEIVault,
    functionName: 'totalSupply',
    query: {
      enabled: !!vaultAddress,
      refetchInterval: 5000, // Refetch every 5 seconds for debugging
    }
  });

  // Get vault balance (total assets)
  const { data: totalAssets } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: SEIVault,
    functionName: 'totalAssets',
    query: {
      enabled: !!vaultAddress,
      refetchInterval: 5000,
    }
  });

  const supply = totalSupply ? BigInt(totalSupply as bigint) : 0n;
  const assets = totalAssets ? BigInt(totalAssets as bigint) : 0n;

  // Calculate current share price
  const sharePrice = supply > 0n ? (assets * BigInt(1e18)) / supply : BigInt(1e18);

  // Debug logging
  console.log('[useVaultState] ===== VAULT STATE =====');
  console.log('[useVaultState] Total Supply (shares):', formatEther(supply));
  console.log('[useVaultState] Total Assets (SEI):', formatEther(assets));
  console.log('[useVaultState] Share Price:', formatEther(sharePrice), 'SEI per share');
  console.log('[useVaultState] ===========================');

  return {
    totalSupply: supply.toString(),
    totalAssets: assets.toString(),
    sharePrice: formatEther(sharePrice),
    supplyFormatted: formatEther(supply),
    assetsFormatted: formatEther(assets),
  };
}
