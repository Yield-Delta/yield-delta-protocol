# Shares Mechanism Documentation

## Overview

This document explains how vault shares are calculated and distributed when users deposit SEI into the Yield Delta Protocol vaults.

## Share Calculation Mechanism

### First Deposit (1:1 Ratio)

When a vault has no existing shares (first deposit), shares are minted at a **1:1 ratio** with the deposited SEI amount:

```solidity
if (currentSupply == 0) {
    shares = actualAmount;
}
```

**Example:**
- User deposits: 5 SEI
- Shares received: 5 SEI DLP shares

### Subsequent Deposits (Proportional Ratio)

For subsequent deposits, shares are calculated proportionally based on the vault's current state:

```solidity
shares = (actualAmount * currentSupply) / totalAssetBalance;
```

Where:
- `actualAmount`: The SEI amount being deposited
- `currentSupply`: Total shares currently in circulation
- `totalAssetBalance`: Total SEI held in the vault

**Example:**
- Vault has: 100 SEI, 100 shares in circulation
- User deposits: 10 SEI
- Shares received: (10 * 100) / 100 = 10 shares

### When Shares May Differ from Deposit

If the vault has accumulated yield or experienced losses, the share calculation adjusts:

**Scenario: Vault with Yield**
- Vault started with: 100 SEI, 100 shares
- Vault earned yield: now has 150 SEI, still 100 shares
- User deposits: 5 SEI
- Shares received: (5 * 100) / 150 = 3.33 shares

This is why a user depositing 5 SEI might receive ~3.33 shares - each share now represents more SEI due to accumulated yield.

## Contract Functions

### `seiOptimizedDeposit`

Location: `contracts/src/SEIVault.sol:132-195`

```solidity
function seiOptimizedDeposit(
    uint256 amount,
    address recipient
) public payable nonReentrant onlySEI returns (uint256 shares)
```

**Parameters:**
- `amount`: The amount of SEI to deposit
- `recipient`: Address to receive the vault shares

**Returns:**
- `shares`: Number of SEI DLP shares minted

### `getCustomerStats`

Location: `contracts/src/SEIVault.sol:366-397`

```solidity
function getCustomerStats(address customer) external view returns (
    uint256 shares,
    uint256 shareValue,
    uint256 totalDeposited,
    uint256 totalWithdrawn,
    uint256 depositTime,
    uint256 lockTimeRemaining
)
```

**Returns:**
- `shares`: Customer's current share balance
- `shareValue`: Current SEI value of customer's shares
- `totalDeposited`: Lifetime SEI deposited by customer
- `totalWithdrawn`: Lifetime SEI withdrawn by customer
- `depositTime`: Timestamp of first deposit
- `lockTimeRemaining`: Time until funds can be withdrawn (24-hour lock)

## Understanding Your Position

### Shares vs Deposited Amount

- **Shares**: Your ownership stake in the vault (SEI DLP tokens)
- **Deposited**: Total SEI you've put into the vault over time
- **Value**: Current SEI value of your shares

### P&L Calculation

```
P&L = (Current Value - Total Deposited + Total Withdrawn) / (Total Deposited - Total Withdrawn) * 100
```

The P&L percentage shows your profit or loss based on:
- How much your shares are currently worth (in SEI)
- How much SEI you've deposited
- How much SEI you've withdrawn

### Why P&L Might Show Negative Initially

If you deposit 5 SEI but receive 3.33 shares because the vault already has accumulated value, your:
- Deposited: 5 SEI
- Shares: 3.33 SEI DLP
- Value: ~5 SEI (same as deposited, initially)

The P&L should be 0% initially. If it shows negative, it may indicate the vault's assets have decreased since your deposit.

## Lock Period

All deposits are subject to a **24-hour lock period**. This is tracked per customer:

```solidity
uint256 public constant LOCK_PERIOD = 24 hours;
```

The `lockTimeRemaining` in `getCustomerStats` indicates how long until withdrawal is available.

## Withdrawal Calculation

When withdrawing, assets are calculated as:

```solidity
assets = (shares * totalAssetBalance) / currentSupply;
```

This ensures you receive your proportional share of the vault's assets.

## Interface Definition

Location: `contracts/src/interfaces/ISEIVault.sol:49-56`

```solidity
function getCustomerStats(address customer) external view returns (
    uint256 shares,
    uint256 shareValue,
    uint256 totalDeposited,
    uint256 totalWithdrawn,
    uint256 depositTime,
    uint256 lockTimeRemaining
);
```

## Summary

| Scenario | Deposit | Shares Received | Ratio |
|----------|---------|-----------------|-------|
| First deposit | 5 SEI | 5 shares | 1:1 |
| Same vault value | 5 SEI | 5 shares | 1:1 |
| Vault gained 50% yield | 5 SEI | ~3.33 shares | 1:0.67 |
| Vault lost 25% value | 5 SEI | ~6.67 shares | 1:1.33 |

The share mechanism ensures fair distribution of vault ownership based on the current value of the vault at the time of deposit.
