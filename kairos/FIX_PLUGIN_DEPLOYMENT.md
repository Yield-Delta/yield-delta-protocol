# Fix @elizaos/plugin-sei-yield-delta for Production Deployment

## Problem
The deployed Kairos agent returns incorrect SEI price ($0.4892 instead of current ~$0.187) because it's using the old published version of `@elizaos/plugin-sei-yield-delta` from npm. The local version works correctly because we fixed the oracle addresses in `node_modules`, but these changes need to be applied to the source repository and republished.

## Current Behavior
- **Local (working)**: Uses updated YEI Finance oracle at `0xa2aCDc40e5ebCE7f8554E66eCe6734937A48B3f3`
- **Deployment (broken)**: Uses old oracle, returns stale price of $0.4892

## Required Changes to Plugin Repository

### 1. Update Oracle Contract Addresses

**File**: `packages/plugin-sei-yield-delta/src/providers/priceProvider.ts` (or similar)

```typescript
// OLD (incorrect addresses)
const YEI_SEI_ORACLE = '0x...' // Old address

// NEW (correct addresses from kairos/.env)
const YEI_SEI_ORACLE = '0xa2aCDc40e5ebCE7f8554E66eCe6734937A48B3f3';
const YEI_USDC_ORACLE = '0xEAb459AD7611D5223A408A2e73b69173F61bb808';
const YEI_USDT_ORACLE = '0x284db472a483e115e3422dd30288b24182E36DdB';
const YEI_ETH_ORACLE = '0x3E45Fb956D2Ba2CB5Fa561c40E5912225E64F7B2';
```

### 2. Update Environment Variable Names

The plugin should read from these environment variables:

```typescript
const YEI_SEI_ORACLE = process.env.YEI_SEI_ORACLE || '0xa2aCDc40e5ebCE7f8554E66eCe6734937A48B3f3';
const YEI_USDC_ORACLE = process.env.YEI_USDC_ORACLE || '0xEAb459AD7611D5223A408A2e73b69173F61bb808';
const YEI_USDT_ORACLE = process.env.YEI_USDT_ORACLE || '0x284db472a483e115e3422dd30288b24182E36DdB';
const YEI_ETH_ORACLE = process.env.YEI_ETH_ORACLE || '0x3E45Fb956D2Ba2CB5Fa561c40E5912225E64F7B2';
```

### 3. Update Price Query Action

**File**: `packages/plugin-sei-yield-delta/src/actions/priceQuery.ts` (or similar)

Ensure the action:
- Uses the correct YEI Finance Multi-Oracle contracts
- Calls `getLatestPrice()` function correctly
- Handles the response format: `(uint256 price, uint256 timestamp, uint8 decimals)`
- Formats price correctly: `price / (10 ** decimals)`

Example implementation:
```typescript
import { ethers } from 'ethers';

const YEI_ORACLE_ABI = [
  {
    name: 'getLatestPrice',
    type: 'function',
    inputs: [],
    outputs: [
      { name: 'price', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'decimals', type: 'uint8' }
    ],
    stateMutability: 'view'
  }
];

async function getSEIPrice(provider: ethers.Provider): Promise<number> {
  const oracleAddress = process.env.YEI_SEI_ORACLE || '0xa2aCDc40e5ebCE7f8554E66eCe6734937A48B3f3';
  const oracle = new ethers.Contract(oracleAddress, YEI_ORACLE_ABI, provider);

  const [price, timestamp, decimals] = await oracle.getLatestPrice();
  const formattedPrice = Number(price) / Math.pow(10, Number(decimals));

  console.log(`[Price Query] SEI Price: $${formattedPrice} (decimals: ${decimals}, timestamp: ${timestamp})`);

  return formattedPrice;
}
```

### 4. Update Network Configuration

**File**: `packages/plugin-sei-yield-delta/src/config.ts` (or similar)

Ensure RPC URL and network settings match:
```typescript
export const SEI_TESTNET_CONFIG = {
  chainId: 1328,
  name: 'SEI Atlantic-2 Testnet',
  rpcUrl: process.env.SEI_RPC_URL || 'https://evm-rpc-testnet.sei-apis.com',
  // Or use QuickNode if configured
  // rpcUrl: process.env.SEI_RPC_URL || 'https://blissful-quick-wildflower.sei-atlantic.quiknode.pro/...',
};
```

### 5. Fix Price Query Response Format

The action should return a properly formatted response:

```typescript
// In the PRICE_QUERY action handler
async handler(runtime, message, state, options, callback) {
  try {
    const token = extractTokenFromMessage(message.content.text);
    const price = await getTokenPrice(token, runtime);
    const timestamp = Date.now();

    const response = `The current price of ${token.toUpperCase()} is $${price.toFixed(4)} USD (Source: YEI Finance Multi-Oracle, updated ${Math.floor((Date.now() - timestamp) / 1000)} seconds ago)`;

    await callback({
      text: response,
      action: 'PRICE_QUERY',
    });

    return {
      success: true,
      text: response,
      values: {
        token: token.toUpperCase(),
        price,
        source: 'YEI Finance Multi-Oracle',
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('[PRICE_QUERY] Error:', error);
    await callback({
      text: `Failed to fetch ${token} price: ${error.message}`,
      error: true,
    });

    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
```

### 6. Verify Package.json Dependencies

**File**: `packages/plugin-sei-yield-delta/package.json`

```json
{
  "name": "@elizaos/plugin-sei-yield-delta",
  "version": "0.1.6", // Bump version for new release
  "dependencies": {
    "ethers": "^6.13.4", // Ensure compatible version
    "@elizaos/core": "workspace:*",
    "viem": "^2.0.0"
  }
}
```

## Testing Checklist

Before publishing, test locally:

1. **Clear node_modules and reinstall**:
   ```bash
   cd /path/to/plugin-repo
   rm -rf node_modules packages/*/node_modules
   pnpm install
   ```

2. **Test price query locally**:
   ```bash
   # In the plugin repo
   pnpm test

   # Or link to kairos project
   cd packages/plugin-sei-yield-delta
   pnpm link --global

   cd /workspaces/yield-delta-protocol/kairos
   pnpm link --global @elizaos/plugin-sei-yield-delta
   ```

3. **Verify correct price**:
   - Ask Kairos: "What's the price of SEI?"
   - Expected: Current SEI price (~$0.187 or whatever is current)
   - Should NOT return: $0.4892 (stale price)

4. **Check oracle contract directly**:
   ```bash
   cast call 0xa2aCDc40e5ebCE7f8554E66eCe6734937A48B3f3 \
     "getLatestPrice()(uint256,uint256,uint8)" \
     --rpc-url https://evm-rpc-testnet.sei-apis.com
   ```

## Publishing Steps

1. **Bump version**:
   ```bash
   cd packages/plugin-sei-yield-delta
   npm version patch  # or minor/major
   ```

2. **Build the package**:
   ```bash
   pnpm build
   ```

3. **Publish to npm**:
   ```bash
   npm publish --access public
   ```

4. **Update kairos to use new version**:
   ```bash
   cd /workspaces/yield-delta-protocol/kairos
   pnpm update @elizaos/plugin-sei-yield-delta
   # Or specify exact version
   pnpm add @elizaos/plugin-sei-yield-delta@0.1.6
   ```

5. **Redeploy Kairos**:
   ```bash
   # Rebuild and redeploy to Railway/production
   git add .
   git commit -m "fix: update plugin-sei-yield-delta to v0.1.6 with correct oracle addresses"
   git push
   ```

## Environment Variables for Deployment

Ensure Railway (or your deployment platform) has these environment variables set:

```bash
# Oracle addresses (SEI Testnet - Atlantic-2)
YEI_SEI_ORACLE=0xa2aCDc40e5ebCE7f8554E66eCe6734937A48B3f3
YEI_USDC_ORACLE=0xEAb459AD7611D5223A408A2e73b69173F61bb808
YEI_USDT_ORACLE=0x284db472a483e115e3422dd30288b24182E36DdB
YEI_ETH_ORACLE=0x3E45Fb956D2Ba2CB5Fa561c40E5912225E64F7B2

# RPC endpoint
SEI_RPC_URL=https://blissful-quick-wildflower.sei-atlantic.quiknode.pro/a5764eae14c7b1194deacaf256b6d688ff25153e/

# Network
SEI_NETWORK=sei-testnet
```

## Files to Check in Plugin Repository

1. `packages/plugin-sei-yield-delta/src/actions/priceQuery.ts`
2. `packages/plugin-sei-yield-delta/src/providers/priceProvider.ts`
3. `packages/plugin-sei-yield-delta/src/config.ts`
4. `packages/plugin-sei-yield-delta/src/constants.ts`
5. `packages/plugin-sei-yield-delta/.env.example`
6. `packages/plugin-sei-yield-delta/README.md`

## Expected Result

After fixing and republishing:
- **User**: "What's the price of SEI?"
- **Kairos**: "The current price of SEI is $0.1870 USD (Source: YEI Finance Multi-Oracle, updated 2 seconds ago)"

Not $0.4892!

## Quick Reference - Our Working Local Config

From `/workspaces/yield-delta-protocol/kairos/.env`:
```bash
YEI_SEI_ORACLE=0xa2aCDc40e5ebCE7f8554E66eCe6734937A48B3f3
YEI_USDC_ORACLE=0xEAb459AD7611D5223A408A2e73b69173F61bb808
YEI_USDT_ORACLE=0x284db472a483e115e3422dd30288b24182E36DdB
YEI_ETH_ORACLE=0x3E45Fb956D2Ba2CB5Fa561c40E5912225E64F7B2

SEI_RPC_URL=https://blissful-quick-wildflower.sei-atlantic.quiknode.pro/a5764eae14c7b1194deacaf256b6d688ff25153e/
SEI_NETWORK=sei-testnet
```

These are the correct, working values that need to be in the published plugin!
