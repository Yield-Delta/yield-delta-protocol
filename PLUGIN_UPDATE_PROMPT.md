# Plugin SEI Yield Delta - Update Instructions

## Issue
The Kairos agent is failing when executing `PORTFOLIO_QUERY` action because the API endpoint doesn't exist or is returning errors.

## Current Vault Deployment Status

### Deployed Vaults on SEI Atlantic-2 Testnet (Chain ID: 1328)

1. **Native SEI Vault**
   - Address: `0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565`
   - Token: Native SEI (address(0))
   - Decimals: 18
   - Strategy: concentrated_liquidity
   - Status: ✅ Active

2. **USDC Stable Vault**
   - Address: `0xbCB883594435D92395fA72D87845f87BE78d202E`
   - Token: USDC at `0x4fCF1784B31630811181f670Aea7A7bEF803eaED`
   - Decimals: 6
   - Strategy: stable_max
   - Status: ✅ Active (Deployed Nov 26, 2024)

## Frontend API Endpoints

### Available Endpoints

1. **GET /api/vaults**
   - Returns list of all active vaults
   - Response format:
   ```json
   {
     "success": true,
     "data": [
       {
         "address": "0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565",
         "name": "Native SEI Vault",
         "strategy": "concentrated_liquidity",
         "tokenA": "SEI",
         "tokenB": "SEI",
         "fee": 0.003,
         "tvl": 0,
         "apy": 0.150,
         "chainId": 1328,
         "active": true
       },
       {
         "address": "0xbCB883594435D92395fA72D87845f87BE78d202E",
         "name": "USDC Stable Vault",
         "strategy": "stable_max",
         "tokenA": "USDC",
         "tokenB": "USDC",
         "fee": 0.001,
         "tvl": 0,
         "apy": 0.085,
         "chainId": 1328,
         "active": true
       }
     ],
     "count": 2,
     "chainId": 1328
   }
   ```

2. **GET /api/vaults/[address]**
   - Returns specific vault details
   - Path parameter: vault address

### Missing Endpoint (NEEDS TO BE CREATED)

**GET /api/portfolio?address={userAddress}**
- Should return user's positions across all vaults
- Recommended response format:
```json
{
  "success": true,
  "data": {
    "userAddress": "0x...",
    "totalValueUSD": 1234.56,
    "positions": [
      {
        "vaultAddress": "0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565",
        "vaultName": "Native SEI Vault",
        "tokenSymbol": "SEI",
        "shares": "5000000000000000000",
        "sharesFormatted": "5.0",
        "shareValue": "5000000000000000000",
        "shareValueFormatted": "5.0",
        "totalDeposited": "5000000000000000000",
        "totalDepositedFormatted": "5.0",
        "totalWithdrawn": "0",
        "totalWithdrawnFormatted": "0",
        "currentValue": "5.0",
        "pnl": "0.00",
        "pnlPercentage": "0.00"
      }
    ]
  }
}
```

## Smart Contract ABI

The vault contract `getCustomerStats` function returns:
```solidity
function getCustomerStats(address customer) external view returns (
    uint256 shares,         // [0] User's vault shares
    uint256 shareValue,     // [1] Current value of shares
    uint256 totalDeposited, // [2] Total deposited (cumulative)
    uint256 totalWithdrawn, // [3] Total withdrawn (cumulative)
    uint256 depositTime,    // [4] Timestamp of first deposit
    uint256 lockTimeRemaining // [5] Time remaining in lock period
)
```

## Token Decimals Handling

**CRITICAL**: Different tokens use different decimals:
- **SEI (native)**: 18 decimals
- **USDC**: 6 decimals
- **Other ERC20s**: Check token contract

When formatting values:
```javascript
// For SEI vault (18 decimals)
const formatted = Number(rawValue) / 1e18;

// For USDC vault (6 decimals)
const formatted = Number(rawValue) / 1e6;

// Better: Use formatUnits from viem
import { formatUnits } from 'viem';
const formatted = formatUnits(rawValue, decimals);
```

## P&L Calculation (IMPORTANT)

The correct P&L formula that accounts for withdrawals:
```javascript
const totalDeposited = parseFloat(formatUnits(position.totalDeposited, decimals));
const totalWithdrawn = parseFloat(formatUnits(position.totalWithdrawn, decimals));
const currentValue = parseFloat(formatUnits(position.shareValue, decimals));

// Total value = current holdings + already withdrawn
const totalValue = currentValue + totalWithdrawn;

// P&L = total value - what was put in
const pnl = totalValue - totalDeposited;
const pnlPercentage = totalDeposited > 0 ? (pnl / totalDeposited) * 100 : 0;
```

**DO NOT** use:
```javascript
// WRONG - doesn't account for withdrawals properly
const netInvested = totalDeposited - totalWithdrawn;
const pnl = currentValue - netInvested; // This shows loss on withdrawal!
```

## Implementation Steps for Plugin

### 1. Create Portfolio API Endpoint

File: `/src/app/api/portfolio/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, formatUnits } from 'viem';

const SEI_ATLANTIC_2 = {
  id: 1328,
  name: 'SEI Atlantic-2',
  rpcUrls: {
    default: { http: ['https://evm-rpc-testnet.sei-apis.com'] }
  }
};

const VAULTS = [
  {
    address: '0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565',
    name: 'Native SEI Vault',
    token: 'SEI',
    decimals: 18
  },
  {
    address: '0xbCB883594435D92395fA72D87845f87BE78d202E',
    name: 'USDC Stable Vault',
    token: 'USDC',
    decimals: 6
  }
];

const VAULT_ABI = [
  {
    name: 'getCustomerStats',
    type: 'function',
    inputs: [{ name: 'customer', type: 'address' }],
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
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('address');

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'User address required' },
        { status: 400 }
      );
    }

    const client = createPublicClient({
      chain: SEI_ATLANTIC_2,
      transport: http()
    });

    const positions = [];

    for (const vault of VAULTS) {
      try {
        const stats = await client.readContract({
          address: vault.address as `0x${string}`,
          abi: VAULT_ABI,
          functionName: 'getCustomerStats',
          args: [userAddress as `0x${string}`]
        });

        const [shares, shareValue, totalDeposited, totalWithdrawn] = stats;

        // Only include if user has a position
        if (shares > 0n || totalDeposited > 0n) {
          const decimals = vault.decimals;
          const currentValue = parseFloat(formatUnits(shareValue, decimals));
          const deposited = parseFloat(formatUnits(totalDeposited, decimals));
          const withdrawn = parseFloat(formatUnits(totalWithdrawn, decimals));

          // Correct P&L calculation
          const totalValue = currentValue + withdrawn;
          const pnl = totalValue - deposited;
          const pnlPercentage = deposited > 0 ? (pnl / deposited) * 100 : 0;

          positions.push({
            vaultAddress: vault.address,
            vaultName: vault.name,
            tokenSymbol: vault.token,
            shares: shares.toString(),
            sharesFormatted: formatUnits(shares, decimals),
            shareValue: shareValue.toString(),
            shareValueFormatted: formatUnits(shareValue, decimals),
            totalDeposited: totalDeposited.toString(),
            totalDepositedFormatted: formatUnits(totalDeposited, decimals),
            totalWithdrawn: totalWithdrawn.toString(),
            totalWithdrawnFormatted: formatUnits(totalWithdrawn, decimals),
            currentValue: currentValue.toFixed(decimals === 6 ? 2 : 4),
            pnl: pnl.toFixed(2),
            pnlPercentage: pnlPercentage.toFixed(2)
          });
        }
      } catch (err) {
        console.error(`Error fetching stats for vault ${vault.address}:`, err);
      }
    }

    const totalValue = positions.reduce((sum, p) => sum + parseFloat(p.currentValue), 0);

    return NextResponse.json({
      success: true,
      data: {
        userAddress,
        totalValue: totalValue.toFixed(2),
        positionCount: positions.length,
        positions
      }
    });

  } catch (error) {
    console.error('Portfolio API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
```

### 2. Update Plugin Action Handler

In your plugin's action handler, update the PORTFOLIO_QUERY action:

```typescript
case 'PORTFOLIO_QUERY':
  try {
    const userAddress = runtime.getSetting('WALLET_ADDRESS') || params.address;

    if (!userAddress) {
      return {
        status: 'error',
        message: 'No wallet address provided'
      };
    }

    const response = await fetch(
      `https://www.yielddelta.xyz/api/portfolio?address=${userAddress}`
    );

    if (!response.ok) {
      throw new Error(`Portfolio API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Portfolio query failed');
    }

    // Format the response for the agent
    const positions = data.data.positions;

    if (positions.length === 0) {
      return {
        status: 'completed',
        message: 'No active positions found',
        data: data.data
      };
    }

    const summary = positions.map(p =>
      `${p.vaultName}: ${p.sharesFormatted} ${p.tokenSymbol} (P&L: ${p.pnlPercentage}%)`
    ).join('\n');

    return {
      status: 'completed',
      message: `Portfolio Summary:\nTotal Value: ${data.data.totalValue}\nPositions:\n${summary}`,
      data: data.data
    };

  } catch (error) {
    return {
      status: 'error',
      message: `Failed to fetch portfolio: ${error.message}`
    };
  }
```

### 3. Test the Implementation

```bash
# Test the API endpoint
curl "https://www.yielddelta.xyz/api/portfolio?address=0xYourAddressHere"

# Expected response (example)
{
  "success": true,
  "data": {
    "userAddress": "0x...",
    "totalValue": "5.00",
    "positionCount": 1,
    "positions": [
      {
        "vaultAddress": "0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565",
        "vaultName": "Native SEI Vault",
        "tokenSymbol": "SEI",
        "currentValue": "5.0000",
        "pnl": "0.00",
        "pnlPercentage": "0.00"
      }
    ]
  }
}
```

## Summary

1. ✅ Create `/api/portfolio` endpoint in the frontend
2. ✅ Handle different token decimals (6 for USDC, 18 for SEI)
3. ✅ Use correct P&L formula that accounts for withdrawals
4. ✅ Update plugin to call the new endpoint
5. ✅ Test with actual user addresses that have positions

## Notes

- The frontend deployment must be updated with the new `/api/portfolio` endpoint
- Plugin should gracefully handle cases where user has no positions
- Always use the correct decimals for each token type
- P&L calculation must include withdrawn amounts to avoid showing false losses
