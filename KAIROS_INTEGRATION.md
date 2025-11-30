# Kairos AI Chat Integration

## Overview

Kairos is now integrated into the Yield Delta frontend as the AI chat assistant. The integration uses a multi-tier architecture:

```
Frontend (AIChat.tsx) → Cloudflare Function → Kairos Agent (Railway)
```

## Architecture

### 1. Frontend Component
**File**: [`yield-delta-frontend/src/components/AIChat.tsx`](yield-delta-frontend/src/components/AIChat.tsx)

- React component with real-time chat UI
- Sends messages to `/api/eliza/chat` endpoint
- Displays AI responses with confidence scores
- Supports suggestions and context-aware responses
- Shows agent status (online/offline/limited mode)

### 2. Cloudflare Edge Function
**File**: [`yield-delta-frontend/_functions/api/eliza/chat.ts`](yield-delta-frontend/_functions/api/eliza/chat.ts)

- Handles GET (agent status) and POST (chat messages) requests
- Routes to Kairos agent on Railway
- Implements fallback responses when agent is offline
- Smart suggestions based on user queries
- CORS-enabled for cross-origin requests

### 3. Kairos Agent
**Directory**: [`kairos/`](kairos/)

- ElizaOS-based AI agent
- Character configuration in [`src/character.ts`](kairos/src/character.ts)
- Specialized in DeFi operations on SEI Network
- Integrated with Yield Delta vaults
- Twitter posting capabilities

## Configuration

### Environment Variables (wrangler.toml)

```toml
# Production
KAIROS_AGENT_URL = "https://fulfilling-empathy-production.up.railway.app"
ACTIVE_AGENT = "kairos"
ELIZA_SERVER_AUTH_TOKEN = "egUaYvBLRmP9NYm7o2HCioQWyjfh4IvmZQVkHk5cGa0="
```

### Agent Details

- **Agent Name**: Kairos
- **Agent ID**: `a823d035-4008-0c15-a813-b5e540c102ef`
- **Specialization**: SEI blockchain DeFi operations
- **Vault Management**: Native SEI Vault (`0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565`)

## Key Features

### Real-time Price Data
Kairos can fetch cryptocurrency prices using oracle providers:
- YEI Finance Multi-Oracle
- Pyth Network
- Chainlink

### DeFi Operations
- Token transfers and DEX trading
- Arbitrage strategy execution
- Portfolio rebalancing
- Yield optimization recommendations

### Vault Management
- Native SEI Vault integration
- Balance checking (requires wallet address)
- Deposit/withdrawal guidance
- APY calculations and projections

### Twitter Integration
- Automated posting every 3 hours
- Educational DeFi content
- Protocol updates and announcements
- Community engagement

## API Endpoints

### Status Check (GET)
```bash
GET /api/eliza/chat
```

Response:
```json
{
  "success": true,
  "agentStatus": "online",
  "agentName": "Kairos",
  "capabilities": [
    "vault_analysis",
    "rebalance_recommendations",
    "market_predictions",
    "sei_optimizations",
    "real_time_price_data",
    "yield_delta_protocol_info"
  ]
}
```

### Send Message (POST)
```bash
POST /api/eliza/chat
Content-Type: application/json

{
  "message": "What's the current price of SEI?",
  "vaultAddress": "0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565",
  "context": {
    "currentPage": "vaults"
  },
  "chainId": 1328
}
```

Response:
```json
{
  "success": true,
  "data": {
    "message": "The current price of SEI is $0.1384",
    "confidence": 0.95,
    "actions": [],
    "suggestions": ["Show AI predictions", "Check gas costs"],
    "metadata": {
      "processingSource": "kairos-agent",
      "agentName": "Kairos"
    }
  }
}
```

## Deployment

### Railway Deployment

1. **Build Docker image**:
   ```bash
   cd kairos
   docker build -t kairos-agent .
   ```

2. **Deploy to Railway**:
   - The Dockerfile is configured for Railway
   - Uses PORT environment variable from Railway
   - Runs `elizaos start` command

3. **Required Environment Variables**:
   ```
   ANTHROPIC_API_KEY=<your-key>
   SEI_PRIVATE_KEY=<vault-management-key>
   SEI_NETWORK=sei-testnet
   SEI_RPC_URL=https://evm-rpc-testnet.sei-apis.com
   TWITTER_USERNAME=<optional>
   TWITTER_PASSWORD=<optional>
   TWITTER_EMAIL=<optional>
   ```

### Cloudflare Pages Deployment

The frontend automatically deploys via Cloudflare Pages with wrangler.toml configuration.

## Fallback Mode

When Kairos agent is offline, the system provides intelligent fallback responses:

- **Rebalancing queries**: Gas cost estimates, utilization recommendations
- **Price queries**: Instructions to check dashboard
- **APY questions**: General yield optimization guidance
- **Help requests**: Feature overview and capabilities

Fallback responses include smart suggestions to guide users to relevant features.

## Testing

### Local Testing

1. **Start Kairos locally**:
   ```bash
   cd kairos
   bun run dev
   ```

2. **Test status endpoint**:
   ```bash
   curl http://localhost:3000/api/agents
   ```

3. **Test chat in frontend**:
   - Run frontend dev server
   - Open AI chat component
   - Send test messages

### Production Testing

1. **Check agent status**:
   ```bash
   curl https://www.yielddelta.xyz/api/eliza/chat
   ```

2. **Send test message**:
   ```bash
   curl -X POST https://www.yielddelta.xyz/api/eliza/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"What is SEI?","chainId":1328}'
   ```

## Troubleshooting

### Agent Returns 404
- Check Railway deployment status
- Verify KAIROS_AGENT_URL in wrangler.toml
- Ensure agent is running with `elizaos start`

### "Limited mode" Status
- Agent health check failed
- Fallback responses are active
- Check Railway logs for errors

### No Response from Agent
- Check ELIZA_SERVER_AUTH_TOKEN matches
- Verify network connectivity to Railway
- Review Cloudflare function logs

## Next Steps

### Short-term
1. ✅ Fix Kairos Docker build (completed)
2. 🔄 Deploy Kairos to Railway
3. ⏳ Enable messaging API endpoints in ElizaOS
4. ⏳ Test end-to-end chat flow

### Medium-term
1. Add WebSocket support for real-time streaming
2. Implement conversation history
3. Add voice input/output capabilities
4. Enhanced context awareness with vault data

### Long-term
1. Multi-agent swarm for specialized tasks
2. Proactive notifications for vault events
3. Advanced DeFi strategy recommendations
4. Integration with more DEX protocols

## Resources

- [ElizaOS Documentation](https://elizaos.ai)
- [SEI Yield Delta Plugin](https://github.com/Yield-Delta/eliza-yield-delta-plugin)
- [Cloudflare Functions](https://developers.cloudflare.com/pages/functions/)
- [Railway Documentation](https://docs.railway.app/)
