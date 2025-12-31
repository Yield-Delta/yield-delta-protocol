# Oracle Setup Documentation for Kairos on SEI Atlantic-2 Testnet

## Current Status
**Date:** December 29, 2024
**Issue:** YEI Finance oracle addresses from mainnet are not working on atlantic-2 testnet, causing contract reverts.
**Resolution:** Oracle addresses have been commented out in `.env` pending proper testnet configuration.

## Required Data Feeds

Based on the Yield Delta Protocol's vault strategies and Kairos agent functionality, the following data feeds are required:

### Core Asset Price Feeds
1. **SEI/USD** - Native token pricing
   - dAPI ID: `0x53614f1cb0c031d4af66c04cb9c756234adad0e1cee85303795091499a4084eb`
   - Required for: Native vault operations, gas calculations

2. **BTC/USD** - Bitcoin pricing
   - dAPI ID: `0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43`
   - Required for: Cross-chain arbitrage calculations, collateral valuations

3. **ETH/USD** - Ethereum pricing
   - Required for: Cross-chain strategies, ETH-based vault positions

4. **USDC/USD** - Stablecoin pricing
   - Required for: Delta neutral strategies, stablecoin vault operations

5. **USDT/USD** - Tether pricing
   - Required for: Multi-stablecoin strategies, arbitrage opportunities

### Additional Feeds (May be needed based on strategy)
- **WSEI/USD** - Wrapped SEI token
- **Major DeFi tokens** - For yield farming strategies
- **LP token prices** - For liquidity pool valuations

## Oracle Provider Options

### API3 (Primary)
- **Testnet Market:** https://market.api3.org/sei-testnet
- **Features:**
  - First-party oracle nodes
  - OEV (Oracle Extractable Value) recapture
  - dAPI proxy contracts
- **Integration:** Direct contract calls via `IApi3ReaderProxy`

### Pyth Network (Backup)
- **Features:**
  - High-frequency updates
  - Wide asset coverage
  - Pull-based price updates
- **Status:** Contract address needs testnet deployment verification

### RedStone (Alternative)
- **Features:**
  - Pull model (data-on-demand)
  - Gas-efficient
  - No persistent on-chain contract needed
- **Note:** Currently using placeholder address

## Setup Instructions

### Step 1: Configure API3 Data Feeds on Testnet

1. Visit [API3 Market for SEI Testnet](https://market.api3.org/sei-testnet)
2. Connect wallet with atlantic-2 testnet SEI
3. Search and activate these data feeds:
   - SEI/USD
   - BTC/USD
   - ETH/USD
   - USDC/USD
   - USDT/USD
4. Note the proxy addresses provided for each activated feed
5. Fund the data feeds if required (some may need sponsorship)

### Step 2: Update Environment Variables

Update `/kairos/.env` with the testnet proxy addresses:

```bash
# API3 Oracle Configuration (Atlantic-2 Testnet)
YEI_API3_SEI_PROXY=0x... # SEI/USD proxy from API3 Market
YEI_API3_BTC_PROXY=0x... # BTC/USD proxy from API3 Market
YEI_API3_ETH_PROXY=0x... # ETH/USD proxy from API3 Market
YEI_API3_USDC_PROXY=0x... # USDC/USD proxy from API3 Market
YEI_API3_USDT_PROXY=0x... # USDT/USD proxy from API3 Market

# Multi-Oracle Aggregators (if available on testnet)
YEI_SEI_ORACLE=0x... # Multi-oracle aggregator for SEI
YEI_USDC_ORACLE=0x... # Multi-oracle aggregator for USDC
YEI_USDT_ORACLE=0x... # Multi-oracle aggregator for USDT
YEI_ETH_ORACLE=0x... # Multi-oracle aggregator for ETH
```

### Step 3: Test Oracle Connections

Create a test script to verify oracle functionality:

```typescript
// test-oracles.ts
import { ethers } from 'ethers';

const API3_ABI = [
  "function read() external view returns (int224 value, uint32 timestamp)"
];

async function testOracle(name: string, address: string, provider: ethers.Provider) {
  try {
    const contract = new ethers.Contract(address, API3_ABI, provider);
    const [value, timestamp] = await contract.read();

    console.log(`✅ ${name}: ${ethers.formatUnits(value, 18)} USD`);
    console.log(`   Last updated: ${new Date(timestamp * 1000).toISOString()}`);
  } catch (error) {
    console.error(`❌ ${name}: Failed - ${error.message}`);
  }
}

// Run tests with configured addresses
```

## Error Reference

### Current Errors (To be resolved)
```
Error: YEI API3 price fetch failed for BTC: ContractFunctionExecutionError
Contract: 0x2880aB155794e7179c9eE2e38200202908C17B43
Function: readDataFeed(bytes32 dApiId)
Args: 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43

Error: YEI Multi-Oracle price fetch error for SEI: ContractFunctionExecutionError
Contract: 0xa2aCDc40e5ebCE7f8554E66eCe6734937A48B3f3
Function: getLatestPrice()
```

These errors occur because the contracts are mainnet addresses, not atlantic-2 testnet deployments.

## Integration Points

### Kairos Agent
- Price feed integration for market analysis
- Vault rebalancing triggers based on price movements
- Arbitrage opportunity detection

### Vault Strategies
1. **Delta Neutral Vault**: Requires accurate spot prices for hedging
2. **Yield Farming Vault**: Needs LP token and underlying asset prices
3. **Arbitrage Vault**: Requires real-time price feeds across multiple assets

## Next Steps

1. **Immediate** (Required for basic functionality):
   - [ ] Set up API3 testnet data feeds
   - [ ] Update .env with correct proxy addresses
   - [ ] Test oracle connections
   - [ ] Implement fallback logic for oracle failures

2. **Short-term** (Enhanced reliability):
   - [ ] Add Pyth Network as backup oracle
   - [ ] Implement oracle aggregation logic
   - [ ] Set up monitoring for oracle health

3. **Long-term** (Production readiness):
   - [ ] Integrate OEV Network for MEV recapture
   - [ ] Implement circuit breakers for extreme price movements
   - [ ] Add oracle dispute resolution mechanism

## Resources

- [API3 Documentation](https://docs.api3.org/)
- [API3 SEI Testnet Market](https://market.api3.org/sei-testnet)
- [SEI Network Docs - Oracles](https://docs.sei.io/evm/oracles/api3)
- [YEI Finance Docs](https://docs.yei.finance)
- [SEI Atlantic-2 Explorer](https://www.seiscan.app/atlantic-2)

## Contact & Support

- SEI Discord: [discord.gg/sei](https://discord.gg/sei)
- API3 Discord: [discord.gg/api3](https://discord.gg/api3)
- YEI Finance Discord: [discord.gg/yei](https://discord.gg/yei)

---

**Note:** This document should be updated once testnet oracle addresses are obtained and verified.