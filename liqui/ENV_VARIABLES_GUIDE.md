# Environment Variables Configuration Guide

## ⚠️ Important Changes - October 7, 2025

**MessageBus is now fully enabled!** We have removed all blocking mechanisms to allow proper chat functionality.

### ❌ Removed Variables (Do NOT use these anymore):
- `DISABLE_MESSAGE_BUS` - Removed, MessageBus is always enabled
- `MESSAGE_BUS_ENABLED` - Removed, MessageBus is always enabled  
- `ELIZA_DISABLE_MESSAGE_BUS` - Removed from Railway
- `CENTRAL_MESSAGE_SERVER_URL=http://127.0.0.1:9999` - Removed the localhost blocking

### ✅ Updated Configuration:
- `CENTRAL_MESSAGE_SERVER_URL` - Now points to actual Railway service URL (https://vigilant-simplicity-production.up.railway.app)
- `ELIZA_SERVER_AUTH_TOKEN` - Set to empty for now (authentication disabled)

## 🔴 Required Variables for Railway

### Database
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```
**Source:** Railway automatically provides this when you add a PostgreSQL service

### AI Provider (at least ONE required)
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
# OR
OPENAI_API_KEY=sk-proj-xxxxx  
# OR
GOOGLE_GENERATIVE_AI_API_KEY=xxxxx
```
**Get Keys:**
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/api-keys
- Google: https://makersuite.google.com/app/apikey

## ✅ Recommended Variables

### MessageBus Configuration
```bash
CENTRAL_MESSAGE_SERVER_URL=https://your-railway-app.up.railway.app
ELIZA_SERVER_AUTH_TOKEN=
```

### API Integration (for Yield Delta infrastructure)
```bash
MAIN_PROJECT_API=https://www.yielddelta.xyz
ELIZA_AGENT_URL=https://your-railway-app.up.railway.app
AI_ENGINE_URL=https://yield-delta-protocol.onrender.com
ENABLE_API_INTEGRATION=true
PYTHON_AI_ENGINE_ACTIVE=true
```

### Server Configuration
```bash
NODE_ENV=production
PORT=8080
LOG_LEVEL=info
TRUST_PROXY=true
EXPRESS_TRUST_PROXY=true
```

## ⚙️ Optional Variables

### Supabase (if using Supabase)
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ENABLE_SUPABASE_UNIFIED=true
```

### Google AI Configuration
```bash
GOOGLE_EMBEDDING_MODEL=gemini-embedding-001
```

### Miscellaneous
```bash
SECRET_SALT=random_32_character_string
PGLITE_DATA_DIR=./.eliza/.elizadb
```

## 🚀 How to Set Variables on Railway

### Using Railway CLI:
```bash
# Link to your project first
railway link

# Set individual variables
railway variables --set "ANTHROPIC_API_KEY=your-key-here"
railway variables --set "ENABLE_API_INTEGRATION=true"

# View all variables
railway variables

# View in KV format
railway variables --kv
```

### Using Railway Dashboard:
1. Go to your Railway project
2. Click on your service
3. Go to **Variables** tab
4. Click **New Variable**
5. Add name and value
6. Click **Add**
7. Railway automatically redeploys

## 🔍 Verification

After deployment, check logs for:
```
✅ SEI DLP Liqui character initialized with architectural alignment
📡 MessageBus Service: ENABLED
AgentServer is listening on port 8080
```

### Should NOT see:
```
❌ MessageBus Service: DISABLED (Standalone Mode)
❌ Created mock MessageBusService
❌ Standalone mode - connections disabled
```

## 📝 Local Development (.env file)

Create a `liqui/.env` file (already in .gitignore):
```bash
# AI Provider (choose one)
ANTHROPIC_API_KEY=your-anthropic-key
# OPENAI_API_KEY=your-openai-key
# GOOGLE_GENERATIVE_AI_API_KEY=your-google-key

# Database (for local testing with PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/liqui

# API Integration (optional for local dev)
MAIN_PROJECT_API=http://localhost:3001
ELIZA_AGENT_URL=http://localhost:3000
ENABLE_API_INTEGRATION=true

# Server
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

## 🆘 Troubleshooting

### Issue: Chat not responding
**Symptoms:**
- Agent stuck at "Thinking..."
- No response in chat

**Solution:**
1. Verify `DATABASE_URL` is set
2. Check that `CENTRAL_MESSAGE_SERVER_URL` points to your Railway URL
3. Ensure NO blocking variables are set (`DISABLE_MESSAGE_BUS`, `ELIZA_DISABLE_MESSAGE_BUS`)
4. Check Railway logs: `railway logs`

### Issue: "Unable to connect" errors in logs
**Symptoms:**
```
Error fetching agent servers: Unable to connect
Error fetching channels: Unable to connect
```

**Solution:**
1. Verify `CENTRAL_MESSAGE_SERVER_URL` is set to your Railway URL
2. Check that Railway service is running
3. Verify no firewall blocking

### Issue: No AI provider configured
**Symptoms:**
```
Error: No AI provider configured
```

**Solution:**
Set at least one AI provider API key:
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`

## 📚 Related Files

- `liqui/.env` - Local environment variables (gitignored)
- `liqui/.env.railway` - Railway-specific overrides (gitignored)
- `liqui/src/plugin-overrides.ts` - Plugin configuration
- `liqui/src/character.ts` - Character configuration
- `liqui/src/index.ts` - Main entry point

## ⚠️ Security Notes

1. **Never commit `.env` files** - They're in `.gitignore` for a reason
2. **Keep API keys secret** - Don't share them in code or logs
3. **Rotate keys regularly** - Especially if they may have been exposed
4. **Use Railway's encrypted variables** - They're encrypted at rest
5. **Enable authentication** - Set `ELIZA_SERVER_AUTH_TOKEN` for production

---

Last Updated: October 7, 2025
