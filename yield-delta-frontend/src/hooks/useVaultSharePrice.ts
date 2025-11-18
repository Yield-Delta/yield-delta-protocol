/**
 * Hook to calculate the current share price for a vault
 * This allows us to preview how many shares a deposit will receive
 */

import { useReadContract } from 'wagmi';
import SEIVault from '@/lib/abis/SEIVault';
import { formatEther } from 'viem';

export function useVaultSharePrice(vaultAddress: string) {
  // Get total supply (total shares minted)
  const { data: totalSupply } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: SEIVault,
    functionName: 'totalSupply',
    query: {
      enabled: !!vaultAddress,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  });

  // Get vault balance (total assets)
  const { data: vaultBalance } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: SEIVault,
    functionName: 'totalAssets',
    query: {
      enabled: !!vaultAddress,
      refetchInterval: 30000,
    }
  });

  // Calculate share price and conversion functions
  const supply = totalSupply ? BigInt(totalSupply as bigint) : 0n;
  const balance = vaultBalance ? BigInt(vaultBalance as bigint) : 0n;

  // Calculate how many shares you get per 1 SEI
  const getSharesForAmount = (amountInSei: string): string => {
    if (!amountInSei || amountInSei === '' || amountInSei === '0') return '0';
    
    try {
      const amountWei = BigInt(Math.floor(parseFloat(amountInSei) * 1e18));
      
      // If vault is empty, 1:1 ratio
      if (supply === 0n || balance === 0n) {
        return formatEther(amountWei);
      }
      
      // Calculate shares using vault formula: shares = (amount * totalSupply) / totalAssetBalance
      const sharesWei = (amountWei * supply) / balance;
      return formatEther(sharesWei);
    } catch (error) {
      console.error('[useVaultSharePrice] Error calculating shares:', error);
      return '0';
    }
  };

  // Calculate the price per share in SEI
  const getPricePerShare = (): string => {
    if (supply === 0n || balance === 0n) return '1.0000';
    
    try {
      // Price per share = totalAssetBalance / totalSupply
      const priceWei = (balance * BigInt(1e18)) / supply;
      return parseFloat(formatEther(priceWei)).toFixed(4);
    } catch (error) {
      console.error('[useVaultSharePrice] Error calculating price per share:', error);
      return '1.0000';
    }
  };

  // Calculate SEI value for a given number of shares
  const getValueForShares = (sharesInEther: string): string => {
    if (!sharesInEther || sharesInEther === '' || sharesInEther === '0') return '0';
    
    try {
      const sharesWei = BigInt(Math.floor(parseFloat(sharesInEther) * 1e18));
      
      // If vault is empty, 1:1 ratio
      if (supply === 0n || balance === 0n) {
        return formatEther(sharesWei);
      }
      
      // Calculate value using formula: value = (shares * totalAssetBalance) / totalSupply
      const valueWei = (sharesWei * balance) / supply;
      return formatEther(valueWei);
    } catch (error) {
      console.error('[useVaultSharePrice] Error calculating value:', error);
      return '0';
    }
  };

  const pricePerShare = getPricePerShare();
  const isVaultEmpty = supply === 0n;

  return {
    getSharesForAmount,
    getValueForShares,
    pricePerShare,
    isVaultEmpty,
    supply: supply.toString(),
    balance: balance.toString(),
  };
}
