# Quick Deploy Guide - Kairos ElizaOS Agent to Railway

## 30-Second Summary

The Kairos agent is ready to deploy. Run these commands:

```bash
cd /workspaces/yield-delta-protocol/kairos
railway login
./deploy-railway.sh
```

## Current Status

- **URL 1**: https://fulfilling-empathy-production.up.railway.app - Returns 404 (needs deployment)
- **URL 2**: https://yield-delta-protocol-production.up.railway.app - Different service (SEI DLP Engine)
- **Infrastructure**: Production-ready (Dockerfile, configs, env vars)
- **Action Needed**: Deploy to Railway

## Quick Deploy (5 Minutes)

### Step 1: Authenticate
```bash
railway login
```
This opens your browser for login.

### Step 2: Deploy
```bash
cd /workspaces/yield-delta-protocol/kairos
./deploy-railway.sh
```

Follow the prompts:
- Choose option 1 (Link to existing project)
- Select "fulfilling-empathy-production"
- Upload environment variables when asked
- Deploy when prompted

### Step 3: Verify
```bash
# Wait 5-10 minutes for build, then test:
curl https://fulfilling-empathy-production.up.railway.app/health
```

Expected: `{"status": "ok"}`

## Manual Deploy (If Script Fails)

### 1. Login and Link
```bash
railway login
railway link  # Select: fulfilling-empathy-production
```

### 2. Set Environment Variables

**Option A**: Railway Dashboard
1. Go to https://railway.app
2. Open fulfilling-empathy-production project
3. Click "Variables" tab
4. Click "Raw Editor"
5. Paste contents of `.env` file
6. Click "Save"

**Option B**: CLI (one by one)
```bash
railway variables set POSTGRES_URL="postgresql://..."
railway variables set ANTHROPIC_API_KEY="sk-ant-..."
# ... continue for all 67 variables
```

### 3. Deploy
```bash
railway up
```

### 4. Monitor
```bash
railway logs --follow
```

## Verify Deployment

### Health Check
```bash
curl https://fulfilling-empathy-production.up.railway.app/health
```

### Chat Test
```bash
curl -X POST https://fulfilling-empathy-production.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the price of SEI?", "userId": "test"}'
```

### Agent Info
```bash
curl https://fulfilling-empathy-production.up.railway.app/api/agents
```

## If Deployment Fails

### Check Status
```bash
railway status
```

### View Logs
```bash
railway logs
```

### Common Fixes

**404 Error**:
```bash
railway restart
railway logs --follow
```

**Build Error**:
```bash
# Check Dockerfile exists
ls -la Dockerfile

# Rebuild
railway up
```

**Environment Variable Error**:
```bash
# List all variables
railway variables

# Verify critical ones are set
railway variables | grep -E "POSTGRES_URL|ANTHROPIC_API_KEY|SEI_PRIVATE_KEY"
```

## Files Created

All configuration files are ready:

- `/workspaces/yield-delta-protocol/kairos/railway.json` - Railway config
- `/workspaces/yield-delta-protocol/kairos/.railwayignore` - Exclude files
- `/workspaces/yield-delta-protocol/kairos/deploy-railway.sh` - Automated script
- `/workspaces/yield-delta-protocol/kairos/Dockerfile` - Container config (already existed)

## What Happens When You Deploy

1. Railway reads `railway.json` configuration
2. Builds Docker image using `Dockerfile`
3. Installs dependencies with Bun
4. Builds project: `bun run build`
5. Starts ElizaOS: `elizaos start`
6. Server starts on PORT (provided by Railway)
7. Health check runs at `/health`
8. Service becomes available at your Railway URL

## Expected Endpoints

Once deployed, these endpoints will be available:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| / | GET | Welcome message |
| /health | GET | Health status (for Railway) |
| /api/chat | POST | Send messages to Kairos |
| /api/agents | GET | Get agent information |
| /api/messages | POST | Alternative message endpoint |
| /ws | WebSocket | Real-time streaming |

## Environment Variables Required

67 variables total. Critical ones:

**Database**:
- POSTGRES_URL

**LLM Providers** (at least one):
- ANTHROPIC_API_KEY (Claude)
- GOOGLE_GENERATIVE_AI_API_KEY (Gemini)

**Blockchain**:
- SEI_PRIVATE_KEY
- SEI_NETWORK
- SEI_RPC_URL

**Vaults**:
- SEI_VAULT_ADDRESS
- USDC_VAULT_ADDRESS
- DELTA_NEUTRAL_VAULT_ADDRESS
- YIELD_FARMING_VAULT_ADDRESS
- ARBITRAGE_VAULT_ADDRESS

**Twitter** (optional):
- TWITTER_API_KEY
- TWITTER_API_SECRET_KEY
- TWITTER_ACCESS_TOKEN
- TWITTER_ACCESS_TOKEN_SECRET

All are already in `.env` file - just need to upload to Railway.

## Timeline

- **Build Time**: 3-5 minutes
- **Startup Time**: 1-2 minutes
- **Total**: 5-10 minutes from deployment to live service

## Cost

- **Railway**: $5-25/month (Hobby to Pro plan)
- **LLM APIs**: $20-50/month (usage-based)
- **Database**: $0-7/month (Render free or paid)
- **Total**: ~$50-100/month

## Getting Help

**View Logs**:
```bash
railway logs --follow
```

**Check Status**:
```bash
railway status
```

**Get Service URL**:
```bash
railway domain
```

**Full Documentation**:
- Comprehensive guide: `RAILWAY_DEPLOYMENT.md`
- Deployment report: `DEPLOYMENT_REPORT.md`
- This quick guide: `QUICK_DEPLOY.md`

## Success Checklist

After deployment, verify:

- [ ] `railway status` shows service as "Active"
- [ ] Health endpoint returns 200 OK
- [ ] Chat endpoint responds to test message
- [ ] Agents endpoint returns Kairos info
- [ ] No errors in logs (`railway logs`)
- [ ] Database connection successful (check logs)

## Next Steps After Deployment

1. Test all API endpoints
2. Send test chat message
3. Verify Twitter integration (if enabled)
4. Monitor logs for 24 hours
5. Set up uptime monitoring (UptimeRobot, etc.)
6. Configure alerts in Railway dashboard

## That's It!

Your Kairos ElizaOS agent should now be live at:
https://fulfilling-empathy-production.up.railway.app

Start chatting with Kairos about DeFi, SEI blockchain, and yield optimization!
