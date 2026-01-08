# 🤖 Rebalancing Automation & Perpetual Futures Integration Roadmap

**Status:** 🚧 In Development
**Priority:** 🔥 Critical for Production Launch
**Target:** Q1 2026

---

## 🎯 **Overview**

This document outlines the implementation plan for automated vault rebalancing and perpetual futures integration to enable true delta-neutral and hedged strategies.

### **Current State:**
- ✅ Smart contracts with `rebalance()` functions
- ✅ AI/ML models (RL Agent, LSTM, IL Predictor)
- ✅ Frontend deposit/withdraw functionality
- ❌ **Missing:** Off-chain automation & perp integrations

### **Target State:**
- ✅ Hourly automated rebalancing across all vaults
- ✅ Real-time delta hedging via perpetual futures
- ✅ Two deployment versions: US (Coinbase) & Global (dYdX/Hyperliquid)

---

## 🌍 **Deployment Strategy: US vs Global**

### **🇺🇸 US Version**
**Target Users:** US-based traders (Coinbase verified)
**Perpetual Futures:** Coinbase Advanced Trade Perpetuals

**Why Coinbase:**
- ✅ US regulatory compliance (CFTC registered)
- ✅ Institutional-grade infrastructure
- ✅ High liquidity for major pairs
- ✅ Easy fiat on/off ramps
- ✅ API for automated trading

**Supported Perps:**
- BTC-PERP, ETH-PERP, SOL-PERP
- Leverage: Up to 20x
- Settlement: USDC

### **🌐 Global Version**
**Target Users:** Non-US international traders
**Perpetual Futures:** Multi-DEX integration (prioritized by liquidity & reliability)

**⛔ UPDATE:** ToroDeX has been removed from consideration due to red flags (suspended Twitter, broken Discord, no community). Focusing on battle-tested platforms only.

#### **Primary Integration: Hyperliquid** (Recommended - Now PRIMARY CHOICE)
- ✅ Highest DeFi perp volume ($3.35T cumulative)
- ✅ Deep liquidity across 130+ markets
- ✅ CLOB-based (low slippage)
- ✅ $260B+ in deposits
- ✅ Institutional-grade execution
- ✅ Fully decentralized & non-custodial
- 🔗 **Integration:** On-chain L1 (Arbitrum-based)

#### **Secondary Integration: dYdX v4**
- ✅ Proven track record in perp DEXs
- ✅ Own Layer 1 blockchain (Cosmos SDK)
- ✅ Deep liquidity from institutional LPs
- ✅ Advanced governance & risk management
- ✅ Cross-chain compatible
- 🔗 **Integration:** Cosmos IBC bridge

#### **Tertiary Options:**
1. **Jupiter Perps** (Solana)
   - $294B cumulative volume
   - 66% market share on Solana
   - Best for SOL ecosystem plays

2. **GMX** (Arbitrum/Avalanche)
   - Up to 100x leverage
   - Oracle-based pricing
   - Deep liquidity pools

3. **Drift Protocol** (Solana)
   - Order book + AMM hybrid
   - Low slippage, capital efficient

---

## 🏗️ **Technical Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    YIELD DELTA PROTOCOL                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐      ┌──────────────────┐            │
│  │  Smart Contracts │◄─────┤  Keeper Service  │            │
│  │   (SEI Chain)    │      │  (Off-chain Bot) │            │
│  └─────────────────┘      └──────────────────┘            │
│         ▲                          │                        │
│         │                          ▼                        │
│         │                  ┌──────────────────┐            │
│         │                  │   AI/ML Engine   │            │
│         │                  │  - RL Agent      │            │
│         │                  │  - LSTM Price    │            │
│         │                  │  - IL Predictor  │            │
│         │                  └──────────────────┘            │
│         │                          │                        │
│         │                          ▼                        │
│  ┌──────┴─────────────────────────────────────────┐       │
│  │         Perpetual Futures Integration          │       │
│  ├─────────────────────┬──────────────────────────┤       │
│  │   🇺🇸 US VERSION    │   🌐 GLOBAL VERSION       │       │
│  ├─────────────────────┼──────────────────────────┤       │
│  │  Coinbase Advanced  │  Hyperliquid (Primary)   │       │
│  │  - BTC/ETH/SOL Perps│  - 130+ markets          │       │
│  │  - 20x leverage     │  - Fully decentralized   │       │
│  │  - USDC settled     │  - Non-custodial         │       │
│  │                     │                          │       │
│  │                     │  dYdX v4 (Secondary)     │       │
│  │                     │  - Cross-chain via IBC   │       │
│  │                     │  - Own L1 blockchain     │       │
│  └─────────────────────┴──────────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 **Implementation Roadmap**

### **Phase 1: Keeper Service Foundation** (Weeks 1-2)
**Priority:** 🔥 Critical

- [ ] **Set up off-chain keeper infrastructure**
  - Node.js/Python service running 24/7
  - Cron job every hour to check rebalance conditions
  - Private key management (AWS KMS or similar)
  - Monitoring & alerting (Datadog, Sentry)

- [ ] **AI Oracle wallet setup**
  - Create dedicated wallet for keeper
  - Fund with SEI for gas fees
  - Set as `aiOracle` address in all vault contracts
  - Implement signature verification

- [ ] **Basic rebalancing logic**
  - Query vault positions every hour
  - Call AI/ML models for optimal ranges
  - Submit `rebalance()` transactions
  - Log all actions for auditing

**Deliverables:**
- Keeper service running in production
- Automated hourly rebalancing for all 3 vaults
- Dashboard for monitoring keeper status

---

### **Phase 2: DEX Integration (Liquidity Provision)** (Weeks 3-4)
**Priority:** 🔥 Critical

- [ ] **Dragonswap Integration (SEI native DEX)**
  - Research Dragonswap V3 contracts
  - Implement concentrated liquidity position management
  - Add/remove liquidity functions
  - Fee collection & compounding logic

- [ ] **Position Management in Smart Contracts**
  - Update `_executeRebalance()` to call DEX contracts
  - Handle position closures & openings
  - Manage tick range calculations
  - Slippage protection

- [ ] **Testing on SEI Testnet**
  - Deploy updated contracts
  - Test full rebalancing cycle
  - Verify fee collection
  - Audit gas costs

**Deliverables:**
- Vaults actively providing liquidity on Dragonswap
- Automated position rebalancing working end-to-end
- Fee collection & compounding operational

---

### **Phase 3A: US Version - Coinbase Perps** (Weeks 5-6)
**Priority:** 🔥 High (US market)

- [ ] **Coinbase Advanced Trade API Integration**
  - Set up Coinbase institutional account
  - API key generation (view, trade permissions)
  - Implement REST & WebSocket clients
  - Order execution & position management

- [ ] **Delta Hedging Logic**
  - Calculate delta exposure from LP positions
  - Open opposing perpetual positions
  - Real-time delta monitoring
  - Auto-rehedge when delta drifts >5%

- [ ] **Risk Management**
  - Position size limits
  - Leverage caps (10-20x max)
  - Liquidation price monitoring
  - Emergency exit procedures

- [ ] **US Compliance**
  - KYC/AML integration (for US users)
  - Accredited investor verification (if needed)
  - Terms of service updates
  - Regulatory disclosures

**Deliverables:**
- Delta Neutral vault using Coinbase perps
- Real-time hedging operational
- US-compliant frontend deployment

---

### **Phase 3B: Global Version - Hyperliquid/dYdX** (Weeks 5-7)
**Priority:** 🔥 High (Global market)

#### **Hyperliquid Integration (Primary)**

- [ ] **Hyperliquid SDK Setup**
  - Install Hyperliquid Python/TypeScript SDK
  - Connect to Hyperliquid L1 via RPC
  - Wallet integration (non-custodial)
  - Order book API access

- [ ] **On-chain Position Management**
  - Open/close perpetual positions on-chain
  - Leverage management (up to 50x)
  - Cross-collateral support
  - Real-time P&L tracking

- [ ] **Cross-chain Bridge (SEI ↔ Hyperliquid)**
  - Research bridge options (LayerZero, Wormhole)
  - Implement automated bridging for hedging
  - Gas optimization for cross-chain txs
  - Fallback mechanisms

#### **dYdX v4 Integration (Secondary)**

- [ ] **dYdX v4 SDK Integration**
  - Connect to dYdX L1 (Cosmos SDK)
  - IBC bridge from SEI to dYdX
  - Order placement via Cosmos txs
  - Position monitoring

- [ ] **Cosmos IBC Bridge**
  - SEI → dYdX chain transfers
  - USDC bridging for collateral
  - Automated collateral management

**Deliverables:**
- Delta Neutral vault using Hyperliquid perps
- Cross-chain hedging operational
- Global-accessible frontend deployment
- dYdX as backup hedging option

---

### **Phase 4: Advanced Features & Optimization** (Weeks 8-10)
**Priority:** 🟡 Medium

- [ ] **Multi-DEX Aggregation**
  - Route trades across multiple perp DEXs
  - Best execution algorithms
  - Liquidity aggregation

- [ ] **Advanced Hedging Strategies**
  - Options integration (for convexity hedging)
  - Dynamic hedge ratios based on gamma
  - Tail risk hedging

- [ ] **Performance Optimization**
  - Gas cost reduction
  - MEV protection
  - Batch transaction processing

- [ ] **Analytics Dashboard**
  - Real-time hedge performance
  - IL tracking vs hedging costs
  - APY attribution (fees vs yield vs hedging)

**Deliverables:**
- Advanced hedging strategies live
- Performance analytics dashboard
- Cost-optimized operations

---

## 💰 **Cost Estimation**

### **Infrastructure Costs (Monthly)**
- Keeper service hosting (AWS/GCP): $50-200
- RPC nodes (Alchemy, Infura): $100-500
- Monitoring & logging: $50-100
- **Total Infrastructure:** ~$200-800/month

### **Gas Costs (SEI)**
- Rebalance transaction: ~$0.01 per vault
- Hourly rebalancing (3 vaults): ~$0.03/hour
- Monthly gas costs: ~$22/month
- **Very affordable due to SEI's low fees**

### **Perpetual Futures Costs**
- Trading fees: 0.02-0.05% per trade
- Funding rates: ±0.01% every 8 hours
- Estimated monthly cost (high activity): $500-2,000
- **Dependent on hedge frequency & TVL**

### **Total Estimated Monthly Costs:** $700-3,000

---

## 🛡️ **Risk Management**

### **Smart Contract Risks**
- ✅ Audited vault contracts
- ✅ Time-locked upgrades
- ✅ Emergency pause functionality
- 🔄 Additional audit before perp integration

### **Oracle/Price Feed Risks**
- Implement Chainlink Price Feeds
- Multiple oracle sources
- Price deviation alerts
- Circuit breakers for extreme volatility

### **Liquidation Risks (Perpetuals)**
- Conservative leverage (10-20x max)
- Real-time liquidation monitoring
- Auto-deleveraging on margin warnings
- Emergency collateral injection

### **Keeper Downtime Risks**
- Redundant keeper instances
- Health check monitoring (PagerDuty)
- Automated failover
- Manual override capabilities

---

## 📊 **Success Metrics**

### **Rebalancing Performance**
- **Target:** 99.5% uptime for keeper service
- **Target:** <2 hour rebalancing lag
- **Target:** <0.5% slippage on rebalances

### **Delta Hedging Effectiveness**
- **Target:** Delta <5% from neutral at all times
- **Target:** Hedging costs <2% APY
- **Target:** IL reduction >70%

### **Vault Performance**
- **Delta Neutral:** 7-10% APY (after hedging costs)
- **Concentrated Liquidity:** 12-18% APY
- **Arbitrage:** 10-15% APY

---

## 🔗 **Resources & Documentation**

### **Coinbase Advanced Trade API**
- Docs: https://docs.cdp.coinbase.com/advanced-trade/docs/welcome
- Perpetuals: https://help.coinbase.com/en/exchange/trading-and-funding/cryptocurrency-trading-pairs/perpetual-futures

### **Hyperliquid**
- Docs: https://hyperliquid.gitbook.io/hyperliquid-docs
- SDK: https://github.com/hyperliquid-dex/hyperliquid-python-sdk
- Testnet: https://app.hyperliquid-testnet.xyz

### **dYdX v4**
- Docs: https://docs.dydx.exchange
- SDK: https://github.com/dydxprotocol/v4-clients
- IBC Bridge: https://bridge.dydx.exchange

### **Chainlink (SEI)**
- Price Feeds: https://docs.chain.link/data-feeds/price-feeds/addresses?network=sei
- Automation: https://docs.chain.link/chainlink-automation

---

## 👥 **Team & Responsibilities**

### **Smart Contract Developer**
- Update vault rebalancing logic
- DEX integration (Dragonswap)
- Security audits

### **Backend/Keeper Engineer**
- Build off-chain keeper service
- Perpetual futures API integrations
- Monitoring & alerting

### **AI/ML Engineer**
- Optimize rebalancing models
- Real-time position sizing
- Risk management algorithms

### **DevOps Engineer**
- Infrastructure setup (AWS/GCP)
- CI/CD pipelines
- Monitoring dashboards

---

## 📅 **Timeline Summary**

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1: Keeper Service** | 2 weeks | Automated hourly rebalancing |
| **Phase 2: DEX Integration** | 2 weeks | Live liquidity provision on Dragonswap |
| **Phase 3A: Coinbase Perps** | 2 weeks | US delta hedging operational |
| **Phase 3B: Hyperliquid/dYdX** | 3 weeks | Global delta hedging operational |
| **Phase 4: Optimization** | 3 weeks | Advanced features & analytics |

**Total Timeline:** 10-12 weeks (2.5-3 months)

---

## 🚀 **Next Immediate Actions**

1. ✅ **Research perpetual futures platforms** (DONE)
2. ⏭️ **Set up keeper service infrastructure** (PRIORITY)
3. ⏭️ **Create Coinbase institutional account** (US version)
4. ⏭️ **Test Hyperliquid SDK on testnet** (Global version)
5. ⏭️ **Audit current smart contracts** (Security)
6. ⏭️ **Deploy AI Oracle wallet & fund with SEI** (Required)

---

**Last Updated:** 2026-01-08
**Document Owner:** Yield Delta Core Team
**Status:** Living document - will be updated as implementation progresses
