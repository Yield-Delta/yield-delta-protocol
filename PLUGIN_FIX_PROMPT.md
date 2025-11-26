# Fix Plugin SEI Yield Delta - Portfolio Query Action

## Problem
The `PORTFOLIO_QUERY` action in `src/actions/portfolio-query.ts` is failing with the error:
```
I encountered an error while fetching your portfolio. Please try again in a moment.
```

The issue is in the `vaultProvider.getCustomerPortfolio()` call which is likely using outdated vault addresses or incorrect decimal handling.

## Current Vault Deployment (Updated Nov 26, 2024)

### Active Vaults on SEI Atlantic-2 Testnet (Chain ID: 1328)

```typescript
const ACTIVE_VAULTS = [
  {
    address: '0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565',
    name: 'Native SEI Vault',
    strategy: 'concentrated_liquidity',
    token: 'SEI',
    tokenAddress: '0x0000000000000000000000000000000000000000', // Native SEI
    decimals: 18,
    active: true
  },
  {
    address: '0xbCB883594435D92395fA72D87845f87BE78d202E',
    name: 'USDC Stable Vault',
    strategy: 'stable_max',
    token: 'USDC',
    tokenAddress: '0x4fCF1784B31630811181f670Aea7A7bEF803eaED',
    decimals: 6,
    active: true
  }
];
```

### OLD Vault Addresses (DO NOT USE)
These vaults are outdated and should be removed:
- `0xcF796aEDcC293db74829e77df7c26F482c9dBEC0` - OLD USDC vault with wrong token
- `0xD460d6C569631A1BDc6FAF28D47BF376aFDD90D0` - OLD SEI vault

## Required Fixes

### 1. Update Vault Provider Configuration

In `src/providers/vault-provider.ts` (or wherever vaults are configured):

**FIND** any hardcoded vault addresses and **REPLACE** with:

```typescript
const VAULTS = [
  {
    address: '0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565' as `0x${string}`,
    name: 'Native SEI Vault',
    decimals: 18,
    tokenSymbol: 'SEI'
  },
  {
    address: '0xbCB883594435D92395fA72D87845f87BE78d202E' as `0x${string}`,
    name: 'USDC Stable Vault',
    decimals: 6,
    tokenSymbol: 'USDC'
  }
];
```

### 2. Fix Decimal Handling

**CRITICAL**: The code must handle different decimals for each vault.

In `getCustomerPortfolio()` function, when formatting values:

```typescript
// WRONG - assumes all vaults use 18 decimals
const formatted = Number(rawValue) / 1e18;

// CORRECT - use vault-specific decimals
const formatted = Number(rawValue) / Math.pow(10, vault.decimals);

// BETTER - use formatUnits from viem
import { formatUnits } from 'viem';
const formatted = parseFloat(formatUnits(rawValue, vault.decimals));
```

### 3. Fix P&L Calculation

The current P&L calculation in the action is correct, but ensure the vault provider is also calculating it correctly:

```typescript
// CORRECT P&L calculation
const totalDeposited = parseFloat(formatUnits(stats[2], decimals)); // totalDeposited
const totalWithdrawn = parseFloat(formatUnits(stats[3], decimals)); // totalWithdrawn
const shareValue = parseFloat(formatUnits(stats[1], decimals));     // shareValue

// Total value = current value + already withdrawn
const totalValue = shareValue + totalWithdrawn;

// Unrealized gains = total value - deposited
const unrealizedGains = totalValue - totalDeposited;
```

### 4. Vault Contract ABI

Ensure the ABI includes the correct `getCustomerStats` function:

```typescript
const VAULT_ABI = [
  {
    name: 'getCustomerStats',
    type: 'function',
    inputs: [
      { name: 'customer', type: 'address' }
    ],
    outputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'shareValue', type: 'uint256' },
      { name: 'totalDeposited', type: 'uint256' },
      { name: 'totalWithdrawn', type: 'uint256' },
      { name: 'depositTime', type: 'uint256' },
      { name: 'lockTimeRemaining', type: 'uint256' }
    ],
    stateMutability: 'view'
  }
] as const;
```

### 5. Example Implementation Fix

Here's what the `getCustomerPortfolio` function should look like:

```typescript
async getCustomerPortfolio(
    runtime: IAgentRuntime,
    address: `0x${string}`
): Promise<FormattedCustomerPortfolio[]> {
    const client = createPublicClient({
        chain: {
            id: 1328,
            name: 'SEI Atlantic-2',
            rpcUrls: {
                default: { http: ['https://evm-rpc-testnet.sei-apis.com'] }
            }
        },
        transport: http()
    });

    const VAULTS = [
        {
            address: '0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565' as `0x${string}`,
            name: 'Native SEI Vault',
            decimals: 18
        },
        {
            address: '0xbCB883594435D92395fA72D87845f87BE78d202E' as `0x${string}`,
            name: 'USDC Stable Vault',
            decimals: 6
        }
    ];

    const portfolios: FormattedCustomerPortfolio[] = [];

    for (const vault of VAULTS) {
        try {
            const stats = await client.readContract({
                address: vault.address,
                abi: VAULT_ABI,
                functionName: 'getCustomerStats',
                args: [address]
            });

            const [shares, shareValue, totalDeposited, totalWithdrawn, depositTime, lockTimeRemaining] = stats;

            // Skip if no position
            if (shares === 0n && totalDeposited === 0n) {
                continue;
            }

            const decimals = vault.decimals;

            // Format values with correct decimals
            const shareBalance = parseFloat(formatUnits(shares, decimals));
            const currentValue = parseFloat(formatUnits(shareValue, decimals));
            const deposited = parseFloat(formatUnits(totalDeposited, decimals));
            const withdrawn = parseFloat(formatUnits(totalWithdrawn, decimals));

            // Calculate P&L correctly (including withdrawals)
            const totalValue = currentValue + withdrawn;
            const unrealizedGains = totalValue - deposited;

            portfolios.push({
                vaultName: vault.name,
                vaultAddress: vault.address,
                shareBalance,
                shareValue: currentValue,
                totalDeposited: deposited,
                totalWithdrawn: withdrawn,
                unrealizedGains,
                canWithdraw: Number(lockTimeRemaining) === 0,
                lockTimeRemaining: Number(lockTimeRemaining),
                depositTime: Number(depositTime)
            });

        } catch (error) {
            elizaLogger.error(`Error fetching stats for vault ${vault.name}:`, error);
            // Continue to next vault instead of failing completely
        }
    }

    return portfolios;
}
```

### 6. Test Cases

Add these test addresses that have positions:

```typescript
// Test with these addresses that have actual positions:
// 1. Native SEI Vault user: 0xA932b7D4c4Dab93A11Fe2AFF873534Bc4D2c6aE0 (has 3 SEI)
// 2. USDC Vault user: 0xA932b7D4c4Dab93A11Fe2AFF873534Bc4D2c6aE0 (has 1 USDC)

// Example test:
const portfolios = await vaultProvider.getCustomerPortfolio(
    runtime,
    '0xA932b7D4c4Dab93A11Fe2AFF873534Bc4D2c6aE0'
);

console.log('Portfolios:', portfolios);
// Expected: 2 positions (SEI and USDC vaults)
```

### 7. Common Errors to Fix

#### Error: "Contract function ... reverted"
- **Cause**: Using wrong vault address
- **Fix**: Update to new vault addresses above

#### Error: "Position shows 0 value"
- **Cause**: Using 18 decimals for USDC (should be 6)
- **Fix**: Use vault-specific decimals

#### Error: "Negative P&L on withdrawal"
- **Cause**: Not including withdrawals in P&L calculation
- **Fix**: Use `totalValue = currentValue + withdrawn` formula

#### Error: "Cannot read contract"
- **Cause**: Wrong RPC URL or chain ID
- **Fix**: Use `https://evm-rpc-testnet.sei-apis.com` with chain ID 1328

### 8. Debugging Steps

Add logging to identify where it's failing:

```typescript
elizaLogger.info(`[VaultProvider] Checking vault: ${vault.name} at ${vault.address}`);
elizaLogger.info(`[VaultProvider] Using decimals: ${vault.decimals}`);
elizaLogger.info(`[VaultProvider] Raw stats:`, stats);
elizaLogger.info(`[VaultProvider] Formatted shares: ${shareBalance}`);
elizaLogger.info(`[VaultProvider] Formatted value: ${currentValue}`);
```

### 9. Environment Variables

Ensure these are set correctly:

```env
# SEI Atlantic-2 Testnet
SEI_CHAIN_ID=1328
SEI_RPC_URL=https://evm-rpc-testnet.sei-apis.com
SEI_EXPLORER_URL=https://seitrace.com

# Vault Addresses (Updated Nov 26, 2024)
NATIVE_SEI_VAULT=0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565
USDC_VAULT=0xbCB883594435D92395fA72D87845f87BE78d202E
```

## Summary Checklist

- [ ] Update vault addresses to new deployments
- [ ] Handle 6 decimals for USDC vault (not 18)
- [ ] Handle 18 decimals for SEI vault
- [ ] Use correct P&L formula: `(currentValue + withdrawn) - deposited`
- [ ] Test with address `0xA932b7D4c4Dab93A11Fe2AFF873534Bc4D2c6aE0`
- [ ] Add error handling for individual vault failures
- [ ] Update any hardcoded vault arrays
- [ ] Remove references to old vault addresses

## Expected Result

After fixing, the portfolio query should return:

```
Your Yield Delta Portfolio:

Total Value: 4.00

Positions:
• Native SEI Vault: 3 shares (3.00) +0.00 gains ✓ Can withdraw
• USDC Stable Vault: 1 shares (1.00) +0.00 gains ✓ Can withdraw

Total Unrealized Gains: +0.00

All your positions are available for withdrawal.
```

## Files to Update

1. `src/providers/vault-provider.ts` - Update vault addresses and decimals
2. `src/types/vault.ts` - Ensure FormattedCustomerPortfolio type is correct
3. `src/constants/vaults.ts` (if exists) - Update vault configuration
4. `.env` or config files - Update vault addresses

The key is: **6 decimals for USDC, 18 for SEI, and correct P&L calculation including withdrawals**.
