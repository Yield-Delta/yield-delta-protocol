/**
 * Vault State Investigation Script
 * 
 * This script checks the actual on-chain state of the vault to diagnose
 * why users are losing value when depositing and withdrawing.
 * 
 * Run: node scripts/check-vault-state.js <vault-address>
 */

const { ethers } = require('ethers');

const SEIVaultABI = [
  'function totalSupply() view returns (uint256)',
  'function totalAssets() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function getCustomerStats(address) view returns (uint256 shares, uint256 shareValue, uint256 totalDeposited, uint256 totalWithdrawn, uint256 depositTime, uint256 lockTimeRemaining)',
  'function vaultInfo() view returns (string name, string strategy, address token0, address token1, uint24 poolFee, uint256 totalSupply, uint256 totalValueLocked, bool isActive)',
];

async function checkVaultState(vaultAddress, userAddress) {
  console.log('\n🔍 VAULT STATE INVESTIGATION\n');
  console.log('Vault Address:', vaultAddress);
  console.log('User Address:', userAddress);
  console.log('='.repeat(60), '\n');

  // Connect to SEI testnet
  const provider = new ethers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_SEI_RPC_URL || 'https://evm-rpc-testnet.sei-apis.com'
  );

  const vault = new ethers.Contract(vaultAddress, SEIVaultABI, provider);

  try {
    // Get vault state
    const [totalSupply, totalAssets, vaultBalance, vaultInfo] = await Promise.all([
      vault.totalSupply(),
      vault.totalAssets(),
      provider.getBalance(vaultAddress), // Native SEI balance
      vault.vaultInfo(),
    ]);

    console.log('📊 VAULT CONTRACT STATE:');
    console.log('-'.repeat(60));
    console.log('Total Supply (shares):', ethers.formatEther(totalSupply), 'shares');
    console.log('Total Assets (reported):', ethers.formatEther(totalAssets), 'SEI');
    console.log('Contract Balance (actual):', ethers.formatEther(vaultBalance), 'SEI');
    console.log('VaultInfo.totalSupply:', ethers.formatEther(vaultInfo.totalSupply), 'shares');
    console.log('VaultInfo.totalValueLocked:', ethers.formatEther(vaultInfo.totalValueLocked), 'SEI');
    
    // Calculate share price
    const sharePrice = totalSupply > 0n 
      ? Number(totalAssets) / Number(totalSupply)
      : 1;
    
    console.log('\n💰 SHARE PRICE CALCULATION:');
    console.log('-'.repeat(60));
    console.log('Share Price:', sharePrice.toFixed(6), 'SEI per share');
    console.log('Formula: totalAssets / totalSupply');
    console.log(`${ethers.formatEther(totalAssets)} / ${ethers.formatEther(totalSupply)} = ${sharePrice.toFixed(6)}`);

    // Check for issues
    console.log('\n⚠️  ISSUE DETECTION:');
    console.log('-'.repeat(60));
    
    const issues = [];
    
    if (totalAssets !== vaultBalance) {
      issues.push({
        severity: 'HIGH',
        type: 'Balance Mismatch',
        details: `totalAssets (${ethers.formatEther(totalAssets)}) != contract balance (${ethers.formatEther(vaultBalance)})`,
        impact: 'The vault is reporting a different balance than what it actually has',
      });
    }
    
    if (vaultInfo.totalSupply !== totalSupply) {
      issues.push({
        severity: 'MEDIUM',
        type: 'Supply Tracking Error',
        details: `vaultInfo.totalSupply (${ethers.formatEther(vaultInfo.totalSupply)}) != ERC20 totalSupply (${ethers.formatEther(totalSupply)})`,
        impact: 'Vault is not tracking supply correctly',
      });
    }
    
    if (vaultInfo.totalValueLocked !== totalAssets) {
      issues.push({
        severity: 'MEDIUM',
        type: 'TVL Tracking Error',
        details: `vaultInfo.totalValueLocked (${ethers.formatEther(vaultInfo.totalValueLocked)}) != totalAssets (${ethers.formatEther(totalAssets)})`,
        impact: 'Vault TVL tracking is out of sync',
      });
    }
    
    if (sharePrice < 1) {
      issues.push({
        severity: 'CRITICAL',
        type: 'Value Loss',
        details: `Share price (${sharePrice.toFixed(6)}) is below 1.0`,
        impact: 'Users are losing money! The vault has fewer assets than shares issued.',
        rootCause: 'Assets have disappeared or shares were over-minted',
      });
    }

    if (issues.length === 0) {
      console.log('✅ No issues detected');
    } else {
      issues.forEach((issue, i) => {
        console.log(`\n${i + 1}. [${issue.severity}] ${issue.type}`);
        console.log(`   Details: ${issue.details}`);
        console.log(`   Impact: ${issue.impact}`);
        if (issue.rootCause) {
          console.log(`   Root Cause: ${issue.rootCause}`);
        }
      });
    }

    // Check user stats if address provided
    if (userAddress) {
      console.log('\n👤 USER POSITION:');
      console.log('-'.repeat(60));
      
      const stats = await vault.getCustomerStats(userAddress);
      
      console.log('Shares Owned:', ethers.formatEther(stats.shares), 'shares');
      console.log('Share Value:', ethers.formatEther(stats.shareValue), 'SEI');
      console.log('Total Deposited:', ethers.formatEther(stats.totalDeposited), 'SEI');
      console.log('Total Withdrawn:', ethers.formatEther(stats.totalWithdrawn), 'SEI');
      
      const netDeposited = Number(ethers.formatEther(stats.totalDeposited)) - Number(ethers.formatEther(stats.totalWithdrawn));
      const currentValue = Number(ethers.formatEther(stats.shareValue));
      const profitLoss = currentValue - netDeposited;
      const returnPct = netDeposited > 0 ? (profitLoss / netDeposited) * 100 : 0;
      
      console.log('\nNet Deposited:', netDeposited.toFixed(4), 'SEI');
      console.log('Current Value:', currentValue.toFixed(4), 'SEI');
      console.log('Profit/Loss:', profitLoss > 0 ? '+' : '', profitLoss.toFixed(4), 'SEI');
      console.log('Return:', returnPct > 0 ? '+' : '', returnPct.toFixed(2), '%');
      
      if (profitLoss < -0.01) {
        console.log('\n🚨 USER IS LOSING MONEY!');
        console.log('Expected value:', netDeposited.toFixed(4), 'SEI');
        console.log('Actual value:', currentValue.toFixed(4), 'SEI');
        console.log('Loss:', Math.abs(profitLoss).toFixed(4), 'SEI');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Investigation complete.\n');

  } catch (error) {
    console.error('❌ Error checking vault state:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  const vaultAddress = process.argv[2];
  const userAddress = process.argv[3];

  if (!vaultAddress) {
    console.error('Usage: node scripts/check-vault-state.js <vault-address> [user-address]');
    process.exit(1);
  }

  checkVaultState(vaultAddress, userAddress);
}

module.exports = { checkVaultState };
