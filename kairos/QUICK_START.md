# Quick Start - Testing Dynamic SEI Prices

## 🚀 Start the Agent

```bash
cd /workspaces/yield-delta-protocol/kairos
bun run start
```

## 💬 Test Price Queries

Once the agent is running, try these queries:

### Basic Price Query
```
User: What's the price of SEI?
Expected: The current price of SEI is $X.XXXX (Source: mock-price-feed, updated just now)
```

### Multiple Prices
```
User: What are the prices for BTC and ETH?
Expected: Here are the current cryptocurrency prices:
          BTC: $45000.00 (mock-price-feed)
          ETH: $2500.00 (mock-price-feed)
```

### Natural Language Variations
```
User: How much is SEI trading at?
User: SEI price
User: What is the current price of SEI?
User: How much is BTC worth?
```

All should trigger the oracle provider and return real-time prices!

## ✅ What to Verify

1. **No hardcoded "$0.452"** - Prices should come from oracle
2. **Source mentioned** - Response includes "Source: mock-price-feed" or similar
3. **Timestamp/freshness** - Indicates when price was fetched
4. **Multiple symbols work** - Can query BTC, ETH, USDC, etc.
5. **Fast responses** - Cached prices return instantly

## 🧪 Run Automated Test

Before starting the agent, run the test script:

```bash
bun run test-price-query.js
```

This verifies the oracle provider is working correctly.

## 📊 Expected Behavior

### ✅ Correct (Dynamic from Oracle)
- "The current price of SEI is $0.4520 (Source: mock-price-feed, updated just now)"
- "SEI: $0.4520 (mock-price-feed)"

### ❌ Incorrect (Hardcoded)
- "SEI is currently trading at $0.452" (without source or dynamic fetch)
- Any response with exactly "$0.452" without mentioning the oracle source

## 🔍 Debugging

If you see hardcoded values:

1. **Rebuild:**
   ```bash
   bun run build
   ```

2. **Check logs** for "SEI Oracle Provider initialized":
   ```bash
   tail -f logs.txt | grep "Oracle"
   ```

3. **Run test script:**
   ```bash
   bun run test-price-query.js
   ```

4. **Restart agent** to reinitialize oracle provider

## 📝 Notes

- First price fetch may take ~300ms (contract call)
- Subsequent fetches are instant (cached)
- Cache refreshes every 30 seconds automatically
- If all oracles fail, falls back to hardcoded values (rare)

## 🎯 Success Criteria

✅ Price queries trigger the PRICE_QUERY action
✅ Oracle provider fetches prices dynamically
✅ Responses include source attribution
✅ Multiple cryptocurrencies work
✅ Caching improves performance
✅ No hardcoded values in responses (except emergency fallback)

---

**Ready to test!** Start the agent and ask for SEI prices! 🚀
