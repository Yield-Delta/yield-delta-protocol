# ToroDeX Integration Notes

**Status:** ⛔ **ABANDONED - DO NOT USE**
**Priority:** 🚫 **REJECTED** - Likely scam or dead project
**Last Updated:** 2026-01-08

---

## 🚨 **CRITICAL WARNING - PROJECT APPEARS TO BE ABANDONED OR SCAM**

**Red Flags Identified:**
- ❌ Discord invite link is broken/expired
- ❌ Twitter/X account (@Toro_DEX) is **SUSPENDED**
- ❌ Zero SEO presence - doesn't appear in Google searches
- ❌ No active development or community
- ❌ Website still exists but no real activity
- ❌ No verifiable smart contract addresses
- ❌ No GitHub repository

**Assessment:** This appears to be either:
1. An abandoned project
2. A scam/rug pull that has been shut down
3. A fake website/phishing attempt

**Recommendation:** ⛔ **DO NOT INTEGRATE OR INVEST**

---

## ~~Why ToroDeX is Ideal for Yield Delta~~ **DISREGARD THIS SECTION**

---

## 🎯 **Why ToroDeX is Ideal for Yield Delta**

ToroDeX is **built natively on SEI Network** - the same blockchain as your entire protocol! This provides massive advantages:

### **✅ Key Advantages:**

1. **No Cross-Chain Bridging Required**
   - Direct smart contract integration
   - No bridge fees or delays
   - Lower gas costs
   - Reduced attack surface

2. **SEI-Optimized Performance**
   - 380ms time to finality (matches SEI's speed)
   - 20,000 TPS throughput
   - Parallelized EVM architecture
   - 100% on-chain execution

3. **Institutional-Grade Risk Management**
   - Isolated markets per trading pair
   - Oracle-anchored price bands
   - Fair liquidation waterfall (liquidation auctions → insurance → ADL)
   - Multi-level risk buffers
   - No front-running (sub-second finality)

4. **Dynamic Funding Rates**
   - Skew & utilization-based rates
   - Crowded sides subsidize sparse sides
   - Passive equilibrium mechanism

5. **Same Ecosystem Benefits**
   - Shared user base with SEI DeFi
   - Unified wallet experience
   - Lower friction for users
   - Native USDC/SEI pairs

---

## 📚 **Available Resources**

### **Official Links:**
- **Platform:** https://dex.torodex.xyz
- **Documentation:** https://doc.torodex.xyz
- **Website:** https://torodex.xyz

### **Social/Community:**
- **Twitter/X:** https://x.com/Toro_DEX
- **Discord:** https://discord.gg/baSYwyZmYw
- **Telegram:** https://t.me/Toro_DEX

### **Current Documentation Coverage:**
- ✅ Introduction & overview
- ✅ Getting started guide
- ✅ Trading mechanics
- ✅ Risk management system
- ✅ Tokenomics
- ❌ **API documentation** (not yet public)
- ❌ **SDK/integration guides** (not yet public)
- ❌ **Smart contract addresses** (not yet public)
- ❌ **Developer tutorials** (not yet public)

---

## 🔧 **Integration Requirements**

### **What We Need from ToroDeX:**

1. **Smart Contract Addresses**
   - ToroDeX perpetual contract address(es) on SEI
   - Price oracle contract
   - Liquidation engine contract

2. **API Documentation**
   - REST API endpoints (if available)
   - WebSocket feeds for real-time data
   - Order placement/cancellation
   - Position management
   - Account/balance queries

3. **SDK/Integration Library**
   - JavaScript/TypeScript SDK (preferred)
   - Python SDK (for AI engine integration)
   - Contract ABIs for direct interaction

4. **Technical Specifications**
   - Supported trading pairs
   - Leverage limits (max leverage per pair)
   - Margin requirements
   - Fee structure (maker/taker fees)
   - Funding rate calculation details
   - Minimum order sizes

---

## 🚀 **Next Steps for Integration**

### **Immediate Actions:**

1. **📞 Contact ToroDeX Team**
   - Join their Discord: https://discord.gg/baSYwyZmYw
   - Reach out via DM or in developer channel
   - Express interest in programmatic integration
   - Request access to:
     - Smart contract addresses
     - API documentation (if available)
     - SDK or integration guides
     - Developer support channel

2. **🔍 Research on-chain**
   - Explore ToroDeX contracts on SEI block explorer
   - Find contract addresses via Seitrace.com
   - Analyze contract interactions
   - Reverse engineer if documentation unavailable

3. **🧪 Testnet Testing**
   - Check if ToroDeX has SEI testnet deployment
   - Test basic trading operations
   - Understand margin/collateral flow
   - Verify funding rate mechanism

### **Questions to Ask ToroDeX Team:**

**Technical:**
- [ ] Do you have API documentation for programmatic trading?
- [ ] Are smart contract addresses publicly available?
- [ ] Is there an SDK or integration library?
- [ ] What are the supported trading pairs?
- [ ] What is the maximum leverage per pair?
- [ ] How do funding rates work?
- [ ] Are there any integration partners we can reference?

**Business/Partnership:**
- [ ] Are you open to integration partnerships?
- [ ] Any incentives for early integrators?
- [ ] Is there a developer grant program?
- [ ] Do you offer dedicated support for integrations?

**Compliance:**
- [ ] Any geographic restrictions?
- [ ] KYC/AML requirements?
- [ ] Smart contract audit reports available?

---

## 💡 **Integration Architecture (Proposed)**

### **Direct Smart Contract Integration (Preferred):**

```
┌───────────────────────────────────────────────────────────┐
│                    Yield Delta Vaults                     │
│                    (SEI Blockchain)                       │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────┐        ┌──────────────────┐    │
│  │ Delta Neutral Vault │◄───────┤  Keeper Service  │    │
│  │  (SEI/USDC LP)      │        │  (Off-chain Bot) │    │
│  └─────────────────────┘        └──────────────────┘    │
│           │                              │               │
│           │ Direct Smart                 │               │
│           │ Contract Call                ▼               │
│           │                      ┌──────────────────┐    │
│           │                      │   AI/ML Engine   │    │
│           ▼                      │  - Delta Calc    │    │
│  ┌─────────────────────┐        │  - Position Size │    │
│  │   ToroDeX Perps     │        └──────────────────┘    │
│  │ (Native SEI DEX)    │                                 │
│  │  - BTC/USD perp     │                                 │
│  │  - ETH/USD perp     │        No Bridge Required!     │
│  │  - SEI/USD perp     │        Same Blockchain!        │
│  └─────────────────────┘                                 │
│           │                                               │
│           ▼                                               │
│    Real-time Delta Hedging                               │
│    (Sub-second finality)                                 │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### **API Integration (If Available):**

```typescript
// Hypothetical ToroDeX SDK usage (pending documentation)
import { ToroDeXClient } from '@torodex/sdk';

const client = new ToroDeXClient({
  rpcUrl: 'https://evm-rpc.sei-apis.com',
  privateKey: process.env.KEEPER_PRIVATE_KEY
});

// Calculate delta exposure from LP position
const delta = calculateDelta(lpPosition);

// Open opposing perpetual position
const order = await client.openPosition({
  pair: 'SEI-USDC-PERP',
  side: delta > 0 ? 'SHORT' : 'LONG',
  size: Math.abs(delta),
  leverage: 10
});

// Monitor and rebalance
setInterval(async () => {
  const newDelta = calculateDelta(lpPosition);
  if (Math.abs(newDelta - currentDelta) > threshold) {
    await client.adjustPosition(order.id, newDelta);
  }
}, 3600000); // Every hour
```

---

## 📊 **Comparison: ToroDeX vs Other Options**

| Feature | ToroDeX (SEI) | Hyperliquid | dYdX v4 | Coinbase |
|---------|---------------|-------------|---------|----------|
| **Same Blockchain** | ✅ Yes (SEI) | ❌ No (Arbitrum) | ❌ No (Cosmos) | ❌ Centralized |
| **Bridge Required** | ✅ None | ❌ Yes | ❌ Yes (IBC) | ❌ N/A |
| **Time to Finality** | 380ms | ~200ms | ~1s | Instant |
| **On-chain Settlement** | ✅ 100% | ✅ 100% | ✅ 100% | ❌ Off-chain |
| **Geographic Restrictions** | Unknown | None | None | US KYC required |
| **API Documentation** | ❓ TBD | ✅ Yes | ✅ Yes | ✅ Yes |
| **SDK Available** | ❓ TBD | ✅ Yes | ✅ Yes | ✅ Yes |
| **Max Leverage** | Unknown | 50x | 20x | 20x |
| **Integration Complexity** | 🟢 Low | 🟡 Medium | 🟡 Medium | 🟢 Low |
| **Gas Costs** | 🟢 Low (SEI) | 🟡 Medium | 🟡 Medium | N/A |

**ToroDeX has a major advantage: native SEI integration = no bridging overhead!**

---

## ⚠️ **Risks & Considerations**

### **Current Unknowns:**
- 🔴 **Documentation incomplete** - API/SDK not yet public
- 🟡 **New platform** - Less battle-tested than Hyperliquid/dYdX
- 🟡 **Liquidity unknown** - TVL and trading volume unclear
- 🟡 **Smart contract audit status** - Need to verify security audits

### **Mitigation Strategies:**
1. **Start with small positions** for testing
2. **Dual integration** - Use ToroDeX + Hyperliquid as backup
3. **Monitor closely** - Enhanced risk management for new platform
4. **Community engagement** - Stay active in their Discord for updates
5. **Request audit reports** - Ensure smart contracts are professionally audited

---

## 🎯 **Recommended Approach**

### **Phase 1: Research & Outreach (This Week)**
- ✅ Join ToroDeX Discord
- ✅ Request API/SDK documentation
- ✅ Find smart contract addresses
- ✅ Assess platform maturity & liquidity

### **Phase 2: Proof of Concept (Week 2-3)**
- Test basic order placement (if API available)
- Small position testing on testnet
- Verify funding rate calculations
- Measure latency & reliability

### **Phase 3: Integration (Week 4-6)**
- Build ToroDeX adapter for keeper service
- Implement delta hedging logic
- Deploy with conservative risk limits
- Monitor performance vs Hyperliquid

### **Phase 4: Scale (Week 7+)**
- Increase position sizes if stable
- Potentially make ToroDeX primary (due to SEI native benefits)
- Deprecate cross-chain alternatives if ToroDeX proves superior

---

## 📝 **Action Items**

**Today:**
- [ ] Join ToroDeX Discord
- [ ] Introduce Yield Delta project to ToroDeX team
- [ ] Request API documentation access
- [ ] Ask about partnership opportunities

**This Week:**
- [ ] Get smart contract addresses
- [ ] Explore contracts on Seitrace
- [ ] Test basic interactions on testnet
- [ ] Assess liquidity & trading pairs

**Next Week:**
- [ ] Begin integration if documentation available
- [ ] Otherwise, proceed with Hyperliquid as primary
- [ ] Keep ToroDeX as future integration target

---

## 🔗 **Additional Resources**

- **SEI Block Explorer:** https://seitrace.com
- **SEI RPC Endpoints:** https://docs.sei.io/develop/rpc-endpoints
- **SEI Developer Docs:** https://docs.sei.io

---

**Conclusion:** ToroDeX is **highly promising** for Yield Delta due to native SEI integration, but we need more technical documentation before proceeding. Recommend **parallel approach**: Start with Hyperliquid (well-documented) while engaging with ToroDeX team to get integration resources.

**Status:** Awaiting response from ToroDeX team on API/SDK availability.
