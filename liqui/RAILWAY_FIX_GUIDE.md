# Railway Deployment Fix Guide

## Issue Summary

The liqui agent on Railway was experiencing connection errors due to misconfigured MessageBus settings. This guide documents the issues and solutions.

## Problems Identified

### 1. Missing Protocol in CENTRAL_MESSAGE_SERVER_URL
**Error**: `[MessageBusService] Unsafe hostname in CENTRAL_MESSAGE_SERVER_URL: vigilant-simplicity-production.up.railway.app`

**Cause**: The URL was missing the `https://` protocol prefix.

**Solution**: Update Railway environment variable to include the protocol:
```
CENTRAL_MESSAGE_SERVER_URL=https://vigilant-simplicity-production.up.railway.app
```

### 2. Self-Referencing MessageBus Configuration
**Problem**: The agent's `ELIZA_AGENT_URL` matches `CENTRAL_MESSAGE_SERVER_URL`, creating a circular dependency where the agent tries to connect to itself for MessageBus services.

**For Single-Agent Deployments**, you have three options:

#### Option 1: Disable MessageBus (Recommended for Single Agent)
```bash
DISABLE_MESSAGE_BUS=true
# Remove or comment out CENTRAL_MESSAGE_SERVER_URL
```

#### Option 2: Use Local-Only Mode
```bash
# Simply remove CENTRAL_MESSAGE_SERVER_URL
# Agent will work in standalone mode without external MessageBus
```

#### Option 3: Deploy Separate MessageBus Server
```bash
# Deploy a dedicated MessageBus server
# Point CENTRAL_MESSAGE_SERVER_URL to that server instead of the agent itself
CENTRAL_MESSAGE_SERVER_URL=https://messagebus-server.up.railway.app
```

### 3. Express Trust Proxy Not Configured
**Error**: Railway's proxy causes rate limiting and IP detection issues.

**Solution**: Set trust proxy environment variables:
```bash
EXPRESS_TRUST_PROXY=true
TRUST_PROXY=true
```

## Complete Railway Environment Variable Configuration

### Required Variables (Already Set)
```bash
# Database
DATABASE_URL=postgresql://...

# AI Model Provider (at least one required)
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...

# SEI Blockchain
SEI_RPC_URL=https://evm-rpc-testnet.sei-apis.com
SEI_CHAIN_ID=1328
SEI_PRIVATE_KEY=your_private_key
SEI_ADDRESS=0x...

# Project APIs
MAIN_PROJECT_API=https://www.yielddelta.xyz
ELIZA_AGENT_URL=https://vigilant-simplicity-production.up.railway.app
PYTHON_AI_ENGINE_ACTIVE=true
ENABLE_API_INTEGRATION=true
YIELD_DELTA_USE_EXISTING_APIS=true
```

### Fix for MessageBus Issues (CHOOSE ONE):

#### Configuration A: Disable MessageBus (Simplest)
```bash
DISABLE_MESSAGE_BUS=true
# Remove CENTRAL_MESSAGE_SERVER_URL if it exists
```

#### Configuration B: Self-Hosted (Current Setup - Needs Fix)
```bash
CENTRAL_MESSAGE_SERVER_URL=https://vigilant-simplicity-production.up.railway.app
EXPRESS_TRUST_PROXY=true
TRUST_PROXY=true
```
⚠️ **Warning**: This creates self-referencing loop. Only use if you understand the implications.

#### Configuration C: External MessageBus Server (Multi-Agent)
```bash
CENTRAL_MESSAGE_SERVER_URL=https://your-separate-messagebus.up.railway.app
EXPRESS_TRUST_PROXY=true
TRUST_PROXY=true
```

## Step-by-Step Fix Instructions

### Step 1: Update CENTRAL_MESSAGE_SERVER_URL
In Railway dashboard:
1. Go to your liqui service
2. Click on "Variables" tab
3. Find `CENTRAL_MESSAGE_SERVER_URL`
4. Change from: `vigilant-simplicity-production.up.railway.app`
5. Change to: `https://vigilant-simplicity-production.up.railway.app`
6. Click "Save"

**OR** for single-agent deployment (recommended):
1. Delete the `CENTRAL_MESSAGE_SERVER_URL` variable entirely
2. Add new variable: `DISABLE_MESSAGE_BUS=true`

### Step 2: Add Trust Proxy Variables
1. Click "+ New Variable"
2. Add: `EXPRESS_TRUST_PROXY` with value `true`
3. Add: `TRUST_PROXY` with value `true`
4. Click "Save"

### Step 3: Redeploy
Railway will automatically redeploy when you save variables. Wait for deployment to complete.

### Step 4: Verify Logs
Check the logs for:
- ✅ No "Unsafe hostname" warnings
- ✅ "MessageBus Configuration" section shows valid config
- ✅ "Server Configuration" shows Trust Proxy: true
- ✅ No "Unable to connect" errors

## New Configuration Validation

The codebase now includes automatic configuration validation:

### Files Added
- `src/messagebus-config.ts` - Validates MessageBus configuration
- `src/server-config.ts` - Validates Express server configuration

### Startup Logs
You'll now see detailed configuration information on startup:

```
🚀 Server Configuration:
   Port: 8080
   Trust Proxy: true
   Environment: production

📡 MessageBus Configuration:
   Enabled: true
   Server URL: https://vigilant-simplicity-production.up.railway.app
   Valid: true
   ✅ Railway deployment detected
```

### Warning Examples
If misconfigured, you'll see warnings like:

```
⚠️  MessageBus Configuration Warnings:
   Invalid URL format: vigilant-simplicity-production.up.railway.app
   URL must include protocol (https:// or http://)

🔧 FIX: Update your Railway environment variable:
   CENTRAL_MESSAGE_SERVER_URL=https://your-server.up.railway.app
   (make sure to include https:// prefix)
```

## Testing Chat Functionality

After deploying the fix:

1. **Open the agent UI**: Visit `https://vigilant-simplicity-production.up.railway.app`
2. **Send a test message**: "Hello Liqui, what can you help me with?"
3. **Check response time**: Should respond within 2-5 seconds
4. **Check Railway logs**: Should see message processing without errors

## Common Errors and Solutions

### Error: "Unsafe hostname"
**Solution**: Add `https://` prefix to `CENTRAL_MESSAGE_SERVER_URL`

### Error: "Unable to connect. Is the computer able to access the url?"
**Solutions**:
- Ensure URL includes protocol (`https://`)
- For single-agent: Disable MessageBus with `DISABLE_MESSAGE_BUS=true`
- For multi-agent: Ensure MessageBus server is running and accessible

### Error: Express ValidationError about X-Forwarded-For
**Solution**: Set `EXPRESS_TRUST_PROXY=true` and `TRUST_PROXY=true`

### Agent receives messages but doesn't respond
**Possible causes**:
1. MessageBus connection issues (check logs)
2. AI model API key not set or invalid
3. Database connection issues
4. Self-referencing MessageBus creating circular dependency

**Solutions**:
1. Check all error messages in logs
2. Verify API keys are valid
3. Verify DATABASE_URL is set
4. Use Option 1 (disable MessageBus) for single-agent deployments

## Architecture Notes

### Single-Agent Deployment (Current Setup)
- One ElizaOS agent serving chat interface
- No need for MessageBus (agent talks to itself via internal events)
- **Recommended**: Disable MessageBus for simpler, more reliable operation

### Multi-Agent Deployment (Future)
- Multiple agents need to communicate
- Requires dedicated MessageBus server
- Each agent connects to central MessageBus
- More complex but enables agent coordination

## Recommended Configuration for Production

For the current single-agent Liqui deployment:

```bash
# Disable MessageBus (not needed for single agent)
DISABLE_MESSAGE_BUS=true

# Enable trust proxy for Railway
EXPRESS_TRUST_PROXY=true
TRUST_PROXY=true

# Keep all other variables as-is
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
MAIN_PROJECT_API=https://www.yielddelta.xyz
ELIZA_AGENT_URL=https://vigilant-simplicity-production.up.railway.app
# ... etc
```

This eliminates the self-referencing issue and simplifies the deployment.

## Support

If issues persist after applying these fixes:
1. Check Railway logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure DATABASE_URL points to a working PostgreSQL instance
4. Verify AI model API keys are valid and have credits
5. Check that the SEI testnet RPC endpoint is accessible
