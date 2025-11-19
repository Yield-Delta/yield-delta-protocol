import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import SEIVault from '@/lib/abis/SEIVault';
import { useEffect } from 'react';

interface VaultInfoData {
  [key: number]: string | bigint | boolean | undefined;
}

/**
 * Diagnostic hook to investigate vault state issues
 * Checks for contract balance discrepancies that might cause value loss
 */
export function useVaultDiagnostics(vaultAddress: `0x${string}`) {
  // Get total supply of shares
  const { data: totalSupply } = useReadContract({
    address: vaultAddress,
    abi: SEIVault,
    functionName: 'totalSupply',
    query: {
      refetchInterval: 5000,
    }
  });

  // Get total assets in vault
  const { data: totalAssets } = useReadContract({
    address: vaultAddress,
    abi: SEIVault,
    functionName: 'totalAssets',
    query: {
      refetchInterval: 5000,
    }
  });

  // Get vault info
  const { data: vaultInfo } = useReadContract({
    address: vaultAddress,
    abi: SEIVault,
    functionName: 'vaultInfo',
    query: {
      refetchInterval: 5000,
    }
  });

  // Type-safe data extraction
  const supply = totalSupply as bigint | undefined;
  const assets = totalAssets as bigint | undefined;
  const info = vaultInfo as VaultInfoData | undefined;

  // Calculate metrics
  const sharePrice = supply && assets && supply > 0n
    ? Number(assets) / Number(supply)
    : 1;

  const diagnostics = {
    totalSupply: supply ? formatEther(supply) : '0',
    totalAssets: assets ? formatEther(assets) : '0',
    sharePrice: sharePrice.toFixed(6),
    vaultInfoSupply: info?.[4] ? formatEther(info[4] as bigint) : '0', // totalSupply from vaultInfo
    vaultInfoTVL: info?.[5] ? formatEther(info[5] as bigint) : '0', // totalValueLocked from vaultInfo
    
    // Health checks
    supplyMismatch: info?.[4] && supply 
      ? (info[4] as bigint) !== supply 
      : false,
    tvlMismatch: info?.[5] && assets
      ? (info[5] as bigint) !== assets
      : false,
    sharePriceBelowOne: sharePrice < 1,
    
    // Raw values for debugging
    raw: {
      totalSupply: supply,
      totalAssets: assets,
      vaultInfo: info,
    }
  };

  // Comprehensive logging with diagnostic analysis
  useEffect(() => {
    if (!supply || !assets) return;

    console.log('\n' + '='.repeat(80));
    console.log('🔍 VAULT DIAGNOSTICS - INVESTIGATING VALUE LOSS');
    console.log('='.repeat(80));
    
    console.log('\n📊 CONTRACT STATE:');
    console.log('  Vault Address:', vaultAddress);
    console.log('  Total Supply (ERC20):', diagnostics.totalSupply, 'shares');
    console.log('  Total Assets (balance):', diagnostics.totalAssets, 'SEI');
    console.log('  Share Price:', diagnostics.sharePrice, 'SEI/share');
    
    console.log('\n📋 VAULT INFO STATE:');
    console.log('  VaultInfo.totalSupply:', diagnostics.vaultInfoSupply, 'shares');
    console.log('  VaultInfo.totalValueLocked:', diagnostics.vaultInfoTVL, 'SEI');
    
    console.log('\n💰 SHARE PRICE ANALYSIS:');
    console.log('  Formula: totalAssets / totalSupply');
    console.log('  Calculation:', diagnostics.totalAssets, '/', diagnostics.totalSupply, '=', diagnostics.sharePrice);
    console.log('  Expected: 1.0 (for no loss/gain)');
    console.log('  Actual:', diagnostics.sharePrice);
    
    const issues: Array<{severity: string, type: string, details: string, impact: string, rootCause?: string}> = [];

    if (diagnostics.supplyMismatch) {
      issues.push({
        severity: 'MEDIUM',
        type: 'Supply Tracking Error',
        details: `VaultInfo.totalSupply (${diagnostics.vaultInfoSupply}) != ERC20.totalSupply (${diagnostics.totalSupply})`,
        impact: 'Vault internal accounting may be incorrect',
      });
    }

    if (diagnostics.tvlMismatch) {
      issues.push({
        severity: 'MEDIUM',
        type: 'TVL Tracking Error',
        details: `VaultInfo.totalValueLocked (${diagnostics.vaultInfoTVL}) != totalAssets (${diagnostics.totalAssets})`,
        impact: 'Vault TVL display may be incorrect',
      });
    }

    if (diagnostics.sharePriceBelowOne) {
      const loss = ((1 - sharePrice) * 100).toFixed(2);
      issues.push({
        severity: 'CRITICAL',
        type: 'Value Loss Detected',
        details: `Share price is ${diagnostics.sharePrice} (${loss}% below 1.0)`,
        impact: 'Users are losing money on deposit/withdraw!',
        rootCause: 'The vault has fewer assets than shares issued. Possible causes:\n' +
          '    1. Contract bug causing asset leakage\n' +
          '    2. First depositor over-minted shares\n' +
          '    3. Someone withdrew without burning shares\n' +
          '    4. Vault lost funds in failed transactions',
      });
    }

    console.log('\n⚠️  ISSUE DETECTION:');
    if (issues.length === 0) {
      console.log('  ✅ No critical issues detected');
    } else {
      issues.forEach((issue, i) => {
        console.log(`\n  ${i + 1}. [${issue.severity}] ${issue.type}`);
        console.log(`     Details: ${issue.details}`);
        console.log(`     Impact: ${issue.impact}`);
        if (issue.rootCause) {
          console.log(`     Root Cause: ${issue.rootCause}`);
        }
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('End of diagnostics\n');
  }, [supply, assets, vaultAddress, sharePrice, diagnostics.totalSupply, diagnostics.totalAssets, 
      diagnostics.sharePrice, diagnostics.vaultInfoSupply, diagnostics.vaultInfoTVL, 
      diagnostics.supplyMismatch, diagnostics.tvlMismatch, diagnostics.sharePriceBelowOne]);

  return diagnostics;
}

