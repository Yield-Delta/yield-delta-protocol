# Share Price Calculation - User Guide

## Understanding Vault Shares

The Yield Delta Protocol uses a **share-based system** for deposits and withdrawals. This is similar to how mutual funds or ETFs work - you receive shares that represent your portion of the vault's total value.

### Why Don't I Get 1 Share Per 1 SEI?

When you deposit SEI into a vault, the number of shares you receive is calculated based on:
1. **Total Supply** - The total number of shares already issued
2. **Total Assets** - The total value held by the vault
3. **Your Deposit Amount**

**Formula:** `shares = (depositAmount * totalSupply) / totalAssets`

### Example Scenarios

#### Scenario 1: Empty Vault (First Deposit)
- You deposit: **5 SEI**
- Total supply: **0 shares**
- Total assets: **0 SEI**
- **You receive: 5 shares** (1:1 ratio)

#### Scenario 2: Vault with Profits
- Vault has grown from initial 100 SEI to 150 SEI (50% profit)
- Total supply: **100 shares**
- Total assets: **150 SEI**
- Share price: **1.50 SEI per share**

You deposit: **5 SEI**
- Shares received: `(5 * 100) / 150 = 3.333 shares`
- Your share value: **5 SEI** (correct!)

#### Scenario 3: Multiple Deposits Over Time
**First deposit:**
- You deposit: **5 SEI** into empty vault
- You receive: **5 shares**

**After vault earns 20% profit:**
- Vault now has: **6 SEI** (your 5 SEI + 1 SEI profit)
- Total supply: **5 shares**
- Share price: **1.20 SEI per share**

**Second deposit:**
- You deposit: **5 SEI** more
- Shares received: `(5 * 5) / 6 = 4.166 shares`
- Total shares you own: **9.166 shares**
- Total value: **11 SEI** (correct - your 10 SEI deposits + share of profits)

### Why This System?

The share-based system ensures:
1. **Fair Distribution** - Everyone gets their proportional share of vault profits
2. **Accurate Accounting** - Your shares automatically track your portion of gains/losses
3. **Simplified Withdrawals** - Withdraw any amount by burning the corresponding shares

### What You See in the UI

**Deposit Modal:**
- Shows how many shares you'll receive for your deposit
- Displays current share price (SEI per share)
- Previews exact conversion rate

**Withdraw Modal:**
- Shows your total shares owned
- Displays current SEI value of your shares
- Shows price per share (so you can see vault performance)

### Key Points to Remember

1. **Share prices change** - As the vault earns (or loses), the SEI value per share changes
2. **Your value is protected** - The total SEI value of your shares reflects your deposits + your share of profits
3. **Math always works out** - You can always convert shares back to SEI at the current rate

### Need Help?

If your withdrawal shows a different SEI amount than expected, remember:
- Check the **current share price** (not the price when you deposited)
- Your shares represent a **portion of the vault**, not a fixed SEI amount
- Vault performance affects share value (this is good when profits are earned!)
