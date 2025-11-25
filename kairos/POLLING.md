# SEI Vault Event Polling System

## Overview

The Kairos AI agent uses an **event polling system** to detect deposits to the SEI Vault contract and automatically allocate funds to DeFi strategies. This document explains how polling works, the challenges encountered, and the solutions implemented.

## What is Event Polling?

Event polling is a technique where the application periodically queries the blockchain for new events (like deposit transactions) rather than using real-time webhooks or websockets.

### How It Works

```
┌─────────────┐
│ Every 30s   │
│  Interval   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 1. Get current block number         │
│    eth_blockNumber RPC call         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 2. Query events from last processed │
│    block to current block           │
│    eth_getLogs RPC call             │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 3. Process each deposit event:     │
│    - Extract deposit amount         │
│    - Extract user address           │
│    - Allocate to strategies         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 4. Update lastProcessedBlock        │
│    Ready for next poll              │
└─────────────────────────────────────┘
```

## Configuration

### Polling Settings (src/services/sei-vault-manager.ts)

```typescript
// Polling frequency
private readonly POLL_INTERVAL = 30000; // 30 seconds

// Block range per query
const MAX_BLOCK_RANGE = 5; // QuickNode Discover plan limit

// Retry configuration
private retryCount: number = 0;
private readonly MAX_RETRIES = 3;
```

## RPC Provider Limitations

Different RPC providers have different limits on the `eth_getLogs` method, which is used to query blockchain events.

### Block Range Limits by Provider

| Provider                    | Plan          | Block Range Limit | Rate Limit      | Cost                    |
|-----------------------------|---------------|-------------------|-----------------|-------------------------|
| **SEI Public RPC**          | Free          | ~2000 blocks      | 15 req/s        | Free                    |
| **QuickNode Discover**      | Free (1 month)| **5 blocks**      | ~300 req/month  | Free trial              |
| **QuickNode Build**         | Paid          | 10,000 blocks     | 15M credits/mo  | $49/month               |
| **QuickNode Scale**         | Paid          | 10,000 blocks     | 100M credits/mo | $299/month              |
| **RHINO Private**           | Paid          | Unlimited         | Unlimited       | Contact for pricing     |

### Why Block Range Matters

SEI testnet produces approximately **2-3 blocks per second**. With a 30-second polling interval:

```
Blocks per poll = 30 seconds × 2.5 blocks/second = 75 blocks
```

With QuickNode Discover's **5-block limit**, we need to make:

```
Number of queries = 75 blocks ÷ 5 blocks per query = 15 queries per poll
```

**This uses 15 of our ~300 monthly queries every 30 seconds!**

## Block Chunking Implementation

To work around block range limits, we implemented a **chunking system** that splits large block ranges into smaller queries.

### Code Implementation

```typescript
private async pollForNewEvents(runtime: IAgentRuntime): Promise<void> {
  const currentBlock = await this.provider.getBlockNumber();
  const totalBlocks = currentBlock - this.lastProcessedBlock;
  const MAX_BLOCK_RANGE = 5; // QuickNode Discover limit

  let allEvents: any[] = [];

  if (totalBlocks > MAX_BLOCK_RANGE) {
    // Query in chunks
    let fromBlock = this.lastProcessedBlock + 1;
    while (fromBlock <= currentBlock) {
      const toBlock = Math.min(fromBlock + MAX_BLOCK_RANGE - 1, currentBlock);

      const filter = this.vaultContract.filters.SEIOptimizedDeposit();
      const chunkEvents = await this.vaultContract.queryFilter(
        filter,
        fromBlock,
        toBlock
      );

      allEvents = allEvents.concat(chunkEvents);
      fromBlock = toBlock + 1;
    }
  } else {
    // Single query for small ranges
    const filter = this.vaultContract.filters.SEIOptimizedDeposit();
    allEvents = await this.vaultContract.queryFilter(
      filter,
      this.lastProcessedBlock + 1,
      currentBlock
    );
  }

  // Process events and update lastProcessedBlock
  for (const event of allEvents) {
    await this.handleDeposit(runtime, event);
  }

  this.lastProcessedBlock = currentBlock;
}
```

### Example: Chunking in Action

If `lastProcessedBlock = 214178878` and `currentBlock = 214179029`:

```
Total blocks to query = 214179029 - 214178878 = 151 blocks
Number of chunks = ceil(151 / 5) = 31 chunks

Chunk 1: Blocks 214178879 to 214178883 (5 blocks)
Chunk 2: Blocks 214178884 to 214178888 (5 blocks)
Chunk 3: Blocks 214178889 to 214178893 (5 blocks)
...
Chunk 31: Blocks 214179025 to 214179029 (5 blocks)
```

**This would use 31 queries for a single poll!**

## Challenges & Solutions

### Challenge 1: "Block range too large" Error

**Problem**: Original code tried to query all blocks since last poll in one request.

```
Error: block range too large (175937), maximum allowed is 2000 blocks
```

**Solution**: Implemented block chunking to split queries into smaller ranges.

---

### Challenge 2: RPC Rate Limiting (Free Public RPC)

**Problem**: SEI's free public RPC endpoint rate-limits `eth_getLogs` calls.

```
Error: system overloaded, please reduce request frequency
```

**Solution**:
- Increased polling interval from 10s to 30s
- Added graceful error handling (silent failures for rate limits)

---

### Challenge 3: QuickNode 5-Block Limit

**Problem**: QuickNode Discover plan only allows 5 blocks per `eth_getLogs` call.

```
Error: eth_getLogs is limited to a 5 range, upgrade from discover plan
```

**Solution**: Reduced `MAX_BLOCK_RANGE` from 1999 to 5 blocks.

**Trade-off**: With 30s polling and ~75 blocks produced, each poll now requires 15 queries, consuming the free tier quota very quickly.

---

## Recommendations

### For Development/Testing (Current Setup)

✅ **Use QuickNode Discover (Free 1-month trial)**
- Block range: 5 blocks
- Polling interval: 30 seconds
- Good for: Short-term testing, proof of concept
- Limitation: ~300 queries/month = ~20 polls total

### For Testnet Production

✅ **Upgrade to QuickNode Build Plan ($49/month)**
- Block range: 10,000 blocks
- 15M credits/month
- Can use 10-second polling interval
- More reliable deposit detection

✅ **Alternative: RHINO Private Endpoint**
- Unlimited block range
- Unlimited requests
- Custom pricing
- Best for: High-frequency trading, production systems

### For Mainnet Production

✅ **QuickNode Scale ($299/month) or higher**
- Block range: 10,000 blocks
- 100M credits/month
- 99.9% uptime SLA
- Multiple regions

✅ **RHINO Enterprise**
- Custom infrastructure
- Dedicated nodes
- Load balancing
- Best for: High-value production systems

---

## Performance Optimization Tips

### 1. Optimize Polling Interval

```typescript
// Development: Slower polling to conserve quota
private readonly POLL_INTERVAL = 60000; // 60 seconds

// Production: Faster polling with paid RPC
private readonly POLL_INTERVAL = 10000; // 10 seconds
```

### 2. Use WebSockets (When Available)

Instead of polling, use WebSocket subscriptions for real-time events:

```typescript
// Ideal approach (if provider supports)
this.vaultContract.on('SEIOptimizedDeposit', async (event) => {
  await this.handleDeposit(runtime, event);
});
```

**Note**: Not all RPC providers support WebSocket subscriptions. QuickNode does!

### 3. Implement Exponential Backoff

```typescript
private async pollWithBackoff(): Promise<void> {
  try {
    await this.pollForNewEvents(runtime);
    this.retryCount = 0; // Reset on success
  } catch (error) {
    this.retryCount++;
    const backoffDelay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
    await new Promise(resolve => setTimeout(resolve, backoffDelay));
  }
}
```

---

## Monitoring & Debugging

### Key Metrics to Track

1. **Polling Success Rate**: % of polls that complete without errors
2. **Average Blocks per Poll**: `currentBlock - lastProcessedBlock`
3. **Events Detected**: Number of deposits found per poll
4. **RPC Call Count**: Total `eth_getLogs` calls made
5. **Processing Lag**: Time between deposit and detection

### Debug Logging

```typescript
console.log(`🔍 Polling: current=${currentBlock}, last=${this.lastProcessedBlock}`);
console.log(`📦 Large block range detected (${totalBlocks} blocks), querying in chunks...`);
console.log(`   🔍 Querying blocks ${fromBlock} to ${toBlock}...`);
console.log(`💰 Found ${events.length} new deposits to process`);
```

### Common Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| `lastProcessedBlock` not updating | Deposits not detected | Check for silent RPC errors |
| Too many RPC calls | Quota exhausted quickly | Increase polling interval or upgrade plan |
| Old deposits not processed | Startup processes old blocks | Set initial block to recent block |
| Memory issues | High RAM usage | Add event processing limits |

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    Kairos AI Agent                        │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │         SEI Vault Manager Service                  │  │
│  │                                                     │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Event Polling Loop (30s interval)          │  │  │
│  │  │                                              │  │  │
│  │  │  1. Get current block ────────────┐         │  │  │
│  │  │  2. Calculate block range         │         │  │  │
│  │  │  3. Split into chunks (5 blocks)  │         │  │  │
│  │  │  4. Query events for each chunk   │         │  │  │
│  │  │  5. Process deposits ──────────────┼─┐       │  │  │
│  │  │  6. Allocate to strategies        │ │       │  │  │
│  │  │  7. Update lastProcessedBlock     │ │       │  │  │
│  │  └───────────────────────────────────┼─┼───────┘  │  │
│  │                                      │ │          │  │
│  └──────────────────────────────────────┼─┼──────────┘  │
│                                         │ │             │
└─────────────────────────────────────────┼─┼─────────────┘
                                          │ │
                                          ▼ ▼
        ┌─────────────────────────────────────────────┐
        │         QuickNode RPC Provider              │
        │                                             │
        │  • eth_blockNumber (1 query per poll)      │
        │  • eth_getLogs (N queries per poll)        │
        │                                             │
        │  Limits:                                    │
        │  - Discover: 5 blocks, ~300 queries/month  │
        │  - Build: 10K blocks, 15M credits/month    │
        │  - Scale: 10K blocks, 100M credits/month   │
        └─────────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────────────┐
        │          SEI Atlantic-2 Testnet             │
        │                                             │
        │  Chain ID: 1328                             │
        │  Block time: ~0.4s (2-3 blocks/second)     │
        │  Current block: ~214,179,000               │
        └─────────────────────────────────────────────┘
```

---

## Code References

- **Polling Implementation**: `src/services/sei-vault-manager.ts:209-284`
- **Configuration**: `src/services/sei-vault-manager.ts:52-57`
- **RPC URL**: `.env:8` (SEI_RPC_URL)
- **Vault Contract**: `.env:14` (NATIVE_SEI_VAULT)

---

## Additional Resources

- [QuickNode Pricing](https://www.quicknode.com/pricing)
- [SEI Network Documentation](https://docs.sei.io/)
- [Ethers.js Event Filtering](https://docs.ethers.org/v6/api/contract/#ContractEventPayload)
- [RHINO Infrastructure](https://rhinostake.com/)

---

**Last Updated**: November 25, 2025
**Kairos Version**: 1.5.12
**Current RPC**: QuickNode Discover (Free Trial)
