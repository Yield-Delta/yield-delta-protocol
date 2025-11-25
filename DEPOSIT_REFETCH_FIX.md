# Deposit Success - Automatic Data Refetch Implementation

## Problem Summary

After a successful deposit to a vault, users had to manually refresh the page to see updated TVL and position values. This created a poor user experience where:

1. User deposits SEI to a vault
2. Transaction succeeds
3. User is redirected to vault overview page
4. **TVL and position values show stale data**
5. User has to manually refresh browser to see updated values

## Root Cause Analysis

The issue occurred because after a successful deposit, only the user's token balance was being refetched. The following data was **not** being updated:

1. **Vault TVL** (Total Value Locked) - fetched via `useVaultTVL` hook
2. **User Position** (shares, value, deposits) - fetched via `useVaultPosition` hook
3. **Protocol-wide TVL** - used on the vaults listing page

### Technical Details

The hooks `useVaultTVL` and `useVaultPosition` use wagmi's `useReadContracts` and `useReadContract` respectively, which manage their own internal React Query keys. The existing `invalidateQueries()` function only invalidated:

- Vault detail queries (`VAULT_QUERY_KEYS.detail(address)`)
- Vault list queries (`VAULT_QUERY_KEYS.lists()`)

But did **not** trigger refetches for the on-chain TVL and position data.

## Solution Implemented

### 1. Enhanced Query Invalidation (`useEnhancedVaultDeposit.ts`)

Updated the `invalidateQueries()` function to invalidate ALL relevant queries:

```typescript
invalidateQueries: () => {
  console.log('[useEnhancedVaultDeposit] Invalidating vault queries for:', vaultData.address);

  // Invalidate vault detail query (specific vault data)
  queryClient.invalidateQueries({ queryKey: VAULT_QUERY_KEYS.detail(vaultData.address) });

  // Invalidate vault lists query (all vaults data)
  queryClient.invalidateQueries({ queryKey: VAULT_QUERY_KEYS.lists() });

  // Invalidate user positions for this vault
  if (userAddress) {
    queryClient.invalidateQueries({ queryKey: VAULT_QUERY_KEYS.positions(userAddress) });
  }

  console.log('[useEnhancedVaultDeposit] All vault queries invalidated');
}
```

### 2. Improved Deposit Success Handler (`DepositModal.tsx`)

Enhanced the transaction success effect to properly invalidate queries with correct timing:

```typescript
useEffect(() => {
  if (depositMutation.isSuccess && depositMutation.hash && transactionStatus !== 'success') {
    console.log('[DepositModal] Transaction successful:', depositMutation.hash);
    setTransactionHash(depositMutation.hash);
    setTransactionStatus('success');

    // Show success notification immediately
    onSuccess(depositMutation.hash);

    // Reset deposit amount but keep modal open to show success
    setDepositAmount('');

    // CRITICAL: Invalidate and refetch ALL relevant data after successful transaction
    // Wait 2 seconds for blockchain state to propagate
    setTimeout(() => {
      console.log('[DepositModal] Invalidating queries after successful deposit');

      // Invalidate vault queries (list and detail)
      depositMutation.invalidateQueries();

      // Refetch user balance
      depositMutation.userBalance.refetch();

      console.log('[DepositModal] All queries invalidated - data will refresh on vault page');
    }, 2000);

    // Give user time to see the success message before redirecting
    setTimeout(() => {
      if (vault) {
        router.push(`/vault?address=${vault.address}&tab=overview`);
      }
      handleClose();
    }, 3000);
  }
}, [depositMutation, transactionStatus, vault, router, onSuccess, handleClose]);
```

**Key Changes:**
- Invalidate queries happens 2 seconds after success (blockchain state propagation time)
- All queries are properly invalidated before redirect
- User balance is refetched as well

### 3. Automatic Refetch on Vault Page (`vault/page.tsx`)

Added automatic refetch of TVL and position data when the vault page loads:

```typescript
// Track if we've already refetched (prevent infinite loops)
const hasRefetchedRef = useRef(false);

// Refetch TVL and position data when vault becomes available (only once per mount)
useEffect(() => {
  if (vaultAddress && vault && !hasRefetchedRef.current) {
    console.log('[VaultPage] Vault ready - refetching TVL and position data');
    hasRefetchedRef.current = true;

    // Small delay to ensure hooks are ready and blockchain state is current
    const timer = setTimeout(() => {
      refetchTVL();
      refetchPosition();
      console.log('[VaultPage] Triggered initial refetch of TVL and position');
    }, 300);

    return () => clearTimeout(timer);
  }
}, [vaultAddress, vault, refetchTVL, refetchPosition]);

// Reset the refetch flag when vault address changes
useEffect(() => {
  hasRefetchedRef.current = false;
}, [vaultAddress]);
```

**Key Features:**
- Refetch is triggered once when vault becomes available
- Uses a ref to prevent infinite refetch loops
- Resets when navigating to a different vault
- Small 300ms delay ensures hooks are ready

## Data Flow After Deposit

### Before Fix:
```
1. User deposits SEI
2. Transaction succeeds ✅
3. Modal shows success ✅
4. Query invalidation for vault list/detail ⚠️ (incomplete)
5. User redirected to vault page ✅
6. Page shows STALE TVL and position ❌
7. User manually refreshes browser ❌
```

### After Fix:
```
1. User deposits SEI
2. Transaction succeeds ✅
3. Modal shows success ✅
4. Wait 2 seconds for blockchain state ⏱️
5. Invalidate ALL queries (vault detail, list, positions, balance) ✅
6. User redirected to vault page ✅
7. Page automatically refetches TVL and position ✅
8. UI shows FRESH data immediately ✅
```

## Testing Checklist

### High Priority Tests:
- [ ] Deposit SEI to SEI vault → Verify TVL updates automatically
- [ ] Deposit SEI to SEI vault → Verify position updates automatically
- [ ] Deposit SEI to SEI vault → Verify balance updates automatically
- [ ] No manual refresh needed after deposit
- [ ] Success message displays for 3 seconds before redirect

### Medium Priority Tests:
- [ ] Navigate between different vaults → Data refetches correctly
- [ ] Deposit to vault A → Navigate to vault B → Back to vault A → Fresh data shown
- [ ] Multiple deposits in succession → Each shows updated values

### Low Priority Tests:
- [ ] Check console logs for proper invalidation messages
- [ ] Verify no infinite refetch loops
- [ ] Test on slow network connections

## Query Keys Reference

For future reference, here are all the query keys that are now properly invalidated:

### Vault Queries (from `useVaults.ts`):
- `VAULT_QUERY_KEYS.detail(vaultAddress)` - Specific vault data
- `VAULT_QUERY_KEYS.lists()` - All vaults list
- `VAULT_QUERY_KEYS.positions(userAddress)` - User positions across all vaults

### On-Chain Data (wagmi hooks with internal query keys):
- `useVaultTVL` - Uses `useReadContracts` with internal wagmi query key
- `useVaultPosition` - Uses `useReadContract` with internal wagmi query key
- `useTokenBalance` - Token balance queries

These wagmi hooks are refetched via their `refetch()` functions rather than query key invalidation.

## Files Modified

1. `/workspaces/yield-delta-protocol/yield-delta-frontend/src/components/DepositModal.tsx`
   - Enhanced transaction success handler
   - Added proper query invalidation with timing

2. `/workspaces/yield-delta-protocol/yield-delta-frontend/src/hooks/useEnhancedVaultDeposit.ts`
   - Enhanced `invalidateQueries()` to include position queries
   - Added better logging for debugging

3. `/workspaces/yield-delta-protocol/yield-delta-frontend/src/app/vault/page.tsx`
   - Added automatic refetch on vault load
   - Uses ref to prevent infinite loops
   - Resets refetch flag when vault changes

## Performance Considerations

- **Query Invalidation Timing**: 2 seconds after deposit success allows blockchain state to propagate
- **Page Load Refetch**: 300ms delay ensures React Query hooks are ready
- **Prevents Infinite Loops**: Uses `hasRefetchedRef` to track refetch status
- **Minimal Network Overhead**: Only refetches when necessary (after deposits, on vault change)

## Future Improvements

Potential enhancements for even better UX:

1. **Optimistic Updates**: Update UI immediately with predicted values, then confirm with blockchain data
2. **Real-time Subscriptions**: Use WebSockets to listen for blockchain events
3. **Loading States**: Show skeleton loaders while refetching
4. **Toast Notifications**: "TVL updated: +X SEI" after successful refetch
5. **Batch Refetch**: If multiple deposits happen quickly, batch refetch requests

## Rollback Plan

If issues arise, you can revert the changes by:

1. Remove the automatic refetch on vault page load (revert `vault/page.tsx`)
2. Revert to simple query invalidation (revert `useEnhancedVaultDeposit.ts`)
3. Restore original deposit success handler (revert `DepositModal.tsx`)

The old behavior will resume: users need to manually refresh after deposits.

---

**Implementation Date**: 2025-11-25
**Status**: ✅ Implemented and ready for testing
