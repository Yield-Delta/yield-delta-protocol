# Railway Environment Variables Configuration

This guide lists all required and optional environment variables for deploying the Liqui ElizaOS agent on Railway.

## 🔴 Required Variables

These **MUST** be set in Railway for the application to work properly:

### Database Configuration
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```
- **Description**: PostgreSQL connection string for persistent storage
- **Format**: `postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require`
- **Source**: Railway provides this automatically when you add a PostgreSQL service
- **Example**: `postgresql://postgres:abc123@containers-us-west-123.railway.app:5432/railway`

### AI Provider API Keys (At least ONE required)
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
# OR
OPENAI_API_KEY=sk-proj-xxxxx
# OR
GOOGLE_GENERATIVE_AI_API_KEY=xxxxx
```
- **Description**: API key for AI model provider (Claude, GPT-4, or Gemini)
- **Required**: At least one must be configured
- **Recommended**: Use Anthropic Claude for best SEI DLP performance
- **Get Keys**:
  - Anthropic: https://console.anthropic.com/
  - OpenAI: https://platform.openai.com/api-keys
  - Google: https://makersuite.google.com/app/apikey

## ✅ Auto-Configured Variables

These are automatically set by the startup script or Railway:

### Server Configuration
```bash
PORT=3000                                    # Railway sets this automatically
NODE_ENV=production                          # Set by railway-start.js
TRUST_PROXY=true                            # Set by railway.toml
EXPRESS_TRUST_PROXY=true                    # Set by railway.toml
```

### MessageBus Configuration (Chat Functionality)
```bash
CENTRAL_MESSAGE_SERVER_URL=http://127.0.0.1:9999    # Set by railway-start.js (blocks external connections)
ELIZA_SERVER_AUTH_TOKEN=                             # Set to empty by railway-start.js
```
- **Note**: MessageBus is enabled for local chat but external connections are blocked
- **DO NOT SET** `DISABLE_MESSAGE_BUS` or `MESSAGE_BUS_ENABLED` - they will break chat

### Railway-Provided Variables (automatic)
```bash
RAILWAY_ENVIRONMENT_NAME=production          # Railway environment
RAILWAY_STATIC_URL=yielddelta-agent.up.railway.app    # Your Railway domain
```

## ⚙️ Optional Variables

### API Integration (if using existing Yield Delta infrastructure)
```bash
MAIN_PROJECT_API=https://www.yielddelta.xyz
ELIZA_AGENT_URL=https://yielddelta-agent.up.railway.app
AI_ENGINE_URL=https://yield-delta-protocol.onrender.com
ENABLE_API_INTEGRATION=true
PYTHON_AI_ENGINE_ACTIVE=true
```

### Supabase (if using Supabase for additional analytics)
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ENABLE_SUPABASE_UNIFIED=true
```

## 🚫 Variables to NEVER Set

**DO NOT set these variables - they will break functionality:**

```bash
# ❌ DO NOT SET - These disable MessageBus completely and break chat
DISABLE_MESSAGE_BUS=true
MESSAGE_BUS_ENABLED=false
ELIZA_DISABLE_MESSAGE_BUS=true          # ← This one especially!

# ❌ DO NOT SET - Railway configures these automatically
NODE_OPTIONS=--max-old-space-size=1024  # Set in railway.toml
```

**If you accidentally set `ELIZA_DISABLE_MESSAGE_BUS=true`, fix it:**
```bash
railway variables --set "ELIZA_DISABLE_MESSAGE_BUS=false"
```

## 📋 Complete Example Configuration

Here's a minimal working configuration for Railway:

```bash
# Required
DATABASE_URL=postgresql://postgres:mypass@postgres.railway.internal:5432/railway
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Optional (for Yield Delta integration)
MAIN_PROJECT_API=https://www.yielddelta.xyz
ELIZA_AGENT_URL=https://liqui-agent.up.railway.app
ENABLE_API_INTEGRATION=true
PYTHON_AI_ENGINE_ACTIVE=true
```

## 🔧 How to Set Variables in Railway

### Via Railway CLI (Recommended):

**One-time setup:**
```bash
cd liqui
railway link  # Select your project interactively
```

**Quick setup script (copy and paste):**
```bash
# Ensure chat works (MessageBus enabled)
railway variables --set "ELIZA_DISABLE_MESSAGE_BUS=false"

# Already configured, but verify they're set correctly:
# railway variables --set "CENTRAL_MESSAGE_SERVER_URL=http://127.0.0.1:9999"
# railway variables --set "TRUST_PROXY=true"
# railway variables --set "EXPRESS_TRUST_PROXY=true"

# Your AI keys should already be set, but if needed:
# railway variables --set "ANTHROPIC_API_KEY=sk-ant-..."
# railway variables --set "GOOGLE_GENERATIVE_AI_API_KEY=..."

# Optional: API integration (if using existing Yield Delta services)
# railway variables --set "ENABLE_API_INTEGRATION=true"
# railway variables --set "PYTHON_AI_ENGINE_ACTIVE=true"
# railway variables --set "MAIN_PROJECT_API=https://www.yielddelta.xyz"
# railway variables --set "AI_ENGINE_URL=https://yield-delta-protocol.onrender.com/"
```

### Via Railway Dashboard:
1. Go to your Railway project
2. Click on your service (liqui-agent)
3. Go to **Variables** tab
4. Click **New Variable**
5. Add each variable name and value
6. Click **Add**
7. Railway will automatically redeploy

### Via Railway CLI (individual variables):
```bash
# First, link to your project (one-time setup)
railway link

# Set required variables
railway variables --set "DATABASE_URL=postgresql://..."
railway variables --set "ANTHROPIC_API_KEY=sk-ant-..."

# Set optional variables
railway variables --set "ENABLE_API_INTEGRATION=true"
railway variables --set "PYTHON_AI_ENGINE_ACTIVE=true"
railway variables --set "MAIN_PROJECT_API=https://www.yielddelta.xyz"
railway variables --set "AI_ENGINE_URL=https://yield-delta-protocol.onrender.com/"

# View all variables
railway variables

# View variables in KV format (for copying)
railway variables --kv
```

## 🔍 Verification

After setting variables, check the deployment logs:

```bash
railway logs
```

Look for these confirmation lines:
```
🚀 Railway Startup Script for Liqui Agent (Bun Runtime)
📊 Environment Configuration:
   NODE_ENV: production
   PORT: 3000
   MessageBus: ENABLED (local only, external connections blocked)
   DATABASE_URL: Configured
   ANTHROPIC_API_KEY: Configured
   TRUST_PROXY: true
✅ Chat functionality enabled with local MessageBus
```

## ⚠️ Common Issues

### Issue: Chat not responding
**Symptom**: Agent stuck at "Thinking..."  
**Cause**: MessageBus disabled or DATABASE_URL not set  
**Solution**: 
- Ensure `DISABLE_MESSAGE_BUS` is NOT set
- Verify `DATABASE_URL` is configured
- Check logs for database connection errors

### Issue: AI not responding
**Symptom**: "No AI provider configured" error  
**Cause**: Missing API key  
**Solution**: Set at least one of `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or `GOOGLE_GENERATIVE_AI_API_KEY`

### Issue: Rate limiting errors
**Symptom**: "X-Forwarded-For header" validation error  
**Cause**: `TRUST_PROXY` not set  
**Solution**: This should be auto-configured by `railway.toml`. If still seeing errors, manually set `TRUST_PROXY=true`

## 📚 Related Documentation

- [Railway Bun Configuration](./RAILWAY_BUN_CONFIG.md)
- [Railway Deployment Guide](./RAILWAY_DEPLOYMENT_GUIDE.md)
- [Liqui Character Configuration](./src/character.ts)
- [Plugin Overrides](./src/plugin-overrides.ts)

## 🆘 Support

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Verify all required variables are set
3. Ensure values are correct (no typos, correct format)
4. Check Railway status page for service issues
5. Review this documentation for common issues

---

Last Updated: October 5, 2025
