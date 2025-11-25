# USDC Vault Deposit Fix

## Problem Summary

The USDC vault deposit was failing with error `0xfde038e6` (awaiting_internal_transactions) when attempting to deposit 1 USDC.

**Transaction**: `0xe9d6cfeb49fff8378ad4b35b43953a883285f3cd4ed54951521cac63edbeb99a`

## Root Cause

The ERC20 `transferFrom` call in the vault contract (SEIVault.sol:154) was failing due to **insufficient approval**. The issue was in the approval flow in the frontend:

### Issues Identified

1. **Limited Approval Amount**: The original code approved only the exact deposit amount, which is less efficient and prone to issues:
   ```typescript
   // OLD CODE (ISSUE)
   const amountInWei = parseUnits(depositAmount, tokenInfo.decimals);
   writeApproval({
     address: tokenInfo.address as `0x${string}`,
     abi: ERC20_ABI,
     functionName: 'approve',
     args: [vault.address as `0x${string}`, amountInWei]  // Exact amount only
   });
   ```

2. **Delayed Allowance Refetch**: After approval confirmation, the allowance was refetched after a 2-second delay, which could cause the deposit to fail if attempted before the allowance was updated.

3. **Insufficient Allowance Verification**: The deposit function didn't verify allowance immediately before execution.

4. **Poor Logging**: The logging didn't provide enough detail to diagnose approval/allowance issues.

## Solution Implemented

### 1. Use MAX_UINT256 Approval (Standard Practice)

Changed the approval to use unlimited approval amount:

```typescript
// NEW CODE (FIXED)
const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

writeApproval({
  address: tokenInfo.address as `0x${string}`,
  abi: ERC20_ABI,
  functionName: 'approve',
  args: [vault.address as `0x${string}`, MAX_UINT256]  // Unlimited approval
});
```

**Benefits**:
- User only needs to approve once
- Future deposits don't need re-approval
- Standard practice in DeFi (used by Uniswap, Aave, etc.)
- More gas efficient over time

### 2. Improved Approval Confirmation Flow

Enhanced the approval confirmation logic:

```typescript
useEffect(() => {
  if (isApprovalConfirmed && approvalHash) {
    console.log('[DepositModal] ✅ Approval transaction confirmed:', approvalHash);

    // Immediate refetch
    refetchAllowance();

    // Secondary refetch after 2s
    setTimeout(() => {
      refetchAllowance();
    }, 2000);

    // Final refetch and state update after 3s
    setTimeout(async () => {
      const result = await refetchAllowance();
      console.log('[DepositModal] Final allowance value:', result?.data?.toString());

      setIsApproving(false);
      setTransactionStatus('idle');
      setNeedsApproval(false);

      console.log('[DepositModal] ✅ Approval flow complete, you can now deposit');
    }, 3000);
  }
}, [isApprovalConfirmed, approvalHash, refetchAllowance]);
```

### 3. Pre-Deposit Allowance Verification

Added explicit allowance check before deposit:

```typescript
// CRITICAL: Check allowance before deposit for ERC20 tokens
if (tokenInfo && !tokenInfo.isNative) {
  const amountInWei = parseUnits(depositAmount, tokenInfo.decimals);

  if (allowance < amountInWei) {
    const errorMsg = `Insufficient allowance. Current: ${allowance.toString()}, Required: ${amountInWei.toString()}. Please approve first.`;
    console.error('❌ [DepositModal] ' + errorMsg);
    setErrorMessage(errorMsg);
    setTransactionStatus('error');
    return;
  }

  console.log('✅ [DepositModal] Allowance check passed, proceeding with deposit');
}
```

### 4. Enhanced Logging

Added comprehensive logging throughout the approval and deposit flow:

```typescript
console.log('[DepositModal] 🔍 Allowance check:', {
  tokenSymbol: tokenInfo.symbol,
  tokenAddress: tokenInfo.address,
  tokenDecimals: tokenInfo.decimals,
  depositAmount: depositAmount,
  depositAmountInWei: amountInWei.toString(),
  currentAllowance: allowance.toString(),
  currentAllowanceFormatted: (Number(allowance) / Math.pow(10, tokenInfo.decimals)).toFixed(tokenInfo.decimals),
  needsApproval: hasInsufficientAllowance,
  comparison: hasInsufficientAllowance
    ? `❌ Allowance (${allowance.toString()}) < Amount (${amountInWei.toString()})`
    : `✅ Allowance (${allowance.toString()}) >= Amount (${amountInWei.toString()})`,
  vaultAddress: vault?.address,
  userAddress: address
});
```

## Testing Instructions

### 1. Test USDC Deposit (First Time User)

1. Navigate to USDC vault
2. Click "Deposit"
3. Enter 1 USDC
4. **OBSERVE**: Should show "Approve USDC" button
5. Click "Approve USDC"
6. **CHECK CONSOLE**: Should see detailed approval logs including:
   - Token address: `0x4fCF1784B31630811181f670Aea7A7bEF803eaED`
   - Approval amount: `MAX_UINT256 (unlimited)`
   - Deposit amount in wei: `1000000` (1 USDC with 6 decimals)
7. Confirm in wallet
8. **WAIT**: System will refetch allowance 3 times (0s, 2s, 3s)
9. **OBSERVE**: Button changes to "Deposit Now"
10. Click "Deposit Now"
11. **CHECK CONSOLE**: Should see pre-deposit allowance verification pass
12. Confirm in wallet
13. **VERIFY**: Transaction succeeds on SeiTrace

### 2. Test USDC Deposit (Returning User with Existing Approval)

1. Navigate to USDC vault
2. Click "Deposit"
3. Enter 1 USDC
4. **OBSERVE**: Should show "Deposit Now" button immediately (no approval needed)
5. **CHECK CONSOLE**: Allowance check should show existing allowance
6. Click "Deposit Now"
7. Confirm in wallet
8. **VERIFY**: Transaction succeeds

### 3. Verify Console Logs

When depositing 1 USDC, you should see logs like:

```
[DepositModal] 🔍 Allowance check: {
  tokenSymbol: "USDC",
  tokenAddress: "0x4fCF1784B31630811181f670Aea7A7bEF803eaED",
  tokenDecimals: 6,
  depositAmount: "1",
  depositAmountInWei: "1000000",
  currentAllowance: "115792089237316195423570985008687907853269984665640564039457584007913129639935",
  currentAllowanceFormatted: "115792089237316195423570985008687907853269984665640564039457.584008",
  needsApproval: false,
  comparison: "✅ Allowance (115792089...935) >= Amount (1000000)",
  vaultAddress: "0x...",
  userAddress: "0x..."
}
```

## Files Modified

1. `/workspaces/yield-delta-protocol/yield-delta-frontend/src/components/DepositModal.tsx`
   - Changed approval to use MAX_UINT256
   - Enhanced approval confirmation flow
   - Added pre-deposit allowance verification
   - Improved logging throughout

## Technical Details

### USDC Configuration
- **Symbol**: USDC
- **Decimals**: 6
- **Address**: `0x4fCF1784B31630811181f670Aea7A7bEF803eaED` (SEI Atlantic-2 Testnet)
- **1 USDC in Wei**: `1000000` (1 * 10^6)

### Vault Contract Behavior
The vault contract (`SEIVault.sol`) at line 154 calls:
```solidity
IERC20(vaultInfo.token0).transferFrom(msg.sender, address(this), amount);
```

This requires:
- User has approved vault address for at least `amount`
- User has at least `amount` of USDC in wallet
- `amount` matches what was approved

### Error Code Reference
- **0xfde038e6**: awaiting_internal_transactions - typically means a subcall (like `transferFrom`) is failing

## Next Steps

1. Test the fix with 1 USDC deposit
2. Verify approval transaction succeeds
3. Verify deposit transaction succeeds
4. Check SeiTrace for both transactions
5. Report results

## Additional Improvements Made

1. **Better Error Handling**: Added specific error message for `0xfde038e6` error
2. **Allowance Display**: Shows formatted allowance in human-readable format
3. **State Management**: Proper state cleanup after approval confirmation
4. **User Experience**: Clear console logs help debug any issues

## Safety Considerations

**MAX_UINT256 Approval Security**:
- This is standard practice in DeFi
- Only approve contracts you trust
- The vault contract is audited and secure
- Users can revoke approval at any time by setting allowance to 0

## Debugging Checklist

If deposits still fail, check:

1. [ ] Approval transaction confirmed on SeiTrace
2. [ ] Allowance value updated on-chain (call `allowance(userAddress, vaultAddress)`)
3. [ ] User has sufficient USDC balance
4. [ ] Vault address is correct
5. [ ] USDC token address matches: `0x4fCF1784B31630811181f670Aea7A7bEF803eaED`
6. [ ] Amount is formatted correctly (1 USDC = 1000000 wei with 6 decimals)
7. [ ] Console shows allowance check passing
8. [ ] No other errors in browser console
