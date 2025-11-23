# Plugin Callback Fixes - SEI Yield Delta

**Date:** 2025-11-23
**Status:** Fixed and Rebuilt

## Summary

Fixed `callback is not a function` errors in the SEI Yield Delta plugin actions. The issue occurred when actions were invoked programmatically (e.g., from vault deposit allocation) without a callback function being passed.

---

## Files Modified

### 1. `src/actions/amm-optimize.ts`

**Issue:** Callback was called without checking if it exists, causing errors when invoked from deposit allocation.

**Changes:**
- Added callback validation before all `await callback()` calls
- Wrapped both AI-optimized path (line 66) and fallback path (line 88) with validation

**Before:**
```typescript
await callback({
  text: `🤖 AI-optimized AMM position created for ${symbol}...`,
  content: { type: 'amm_optimization', optimization: aiOptimization }
});
```

**After:**
```typescript
if (callback && typeof callback === 'function') {
  await callback({
    text: `🤖 AI-optimized AMM position created for ${symbol}...`,
    content: { type: 'amm_optimization', optimization: aiOptimization }
  });
}
```

### 2. `src/actions/delta-neutral.ts`

**Issue:** Same callback validation issue in multiple locations.

**Changes:**
- Added callback validation for help/info response (line 18)
- Added callback validation for successful execution response (line 79)

**Before:**
```typescript
await callback({
  text: `🎯 **Delta Neutral Strategy Executed for ${pair}**...`,
  content: { type: 'delta_neutral_execution', optimization }
});
```

**After:**
```typescript
if (callback && typeof callback === 'function') {
  await callback({
    text: `🎯 **Delta Neutral Strategy Executed for ${pair}**...`,
    content: { type: 'delta_neutral_execution', optimization }
  });
}
```

---

## Error Messages Fixed

```
TypeError: callback is not a function. (In 'callback({...})', 'callback' is undefined)
  at handler (/workspaces/yield-delta-protocol/kairos/dist/index.js:22683:15)

TypeError: callback is not a function. (In 'callback({...})', 'callback' is undefined)
  at <anonymous> (/workspaces/yield-delta-protocol/kairos/dist/index.js:22788:13)
```

---

## Build Commands

After making these changes, rebuild with:

```bash
# Rebuild plugin
cd node_modules/@elizaos/plugin-sei-yield-delta
bun run build

# Rebuild Kairos
cd /workspaces/yield-delta-protocol/kairos
bun run build

# Restart Kairos
bun run start
```

---

## Testing

Test with a deposit to the vault:

```bash
export SEI_PRIVATE_KEY=<your-key>

cast send 0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565 \
  "seiOptimizedDeposit(uint256,address)" \
  100000000000000000 \
  0xdFBdf7CF5933f1EBdEc9eEBb7D0B7b2217583F41 \
  --value 100000000000000000 \
  --rpc-url https://evm-rpc-testnet.sei-apis.com \
  --private-key $SEI_PRIVATE_KEY
```

---

## Expected Result

All four strategies should execute without callback errors:
- ✅ Funding Arbitrage
- ✅ Delta Neutral
- ✅ AMM Optimization
- ✅ YEI Lending

---

## Notes

- The catch blocks already had proper callback validation (added in previous fixes)
- This fix ensures consistency across all callback invocations
- Actions now gracefully handle being invoked with or without callbacks
