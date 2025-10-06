# Railway CLI Quick Start Guide

Quick reference for managing your Liqui agent deployment on Railway using the CLI.

## 🔗 Initial Setup (One-Time)

```bash
cd liqui
railway link  # Select vigilant-simplicity project
```

## 🔧 Essential Commands

### View All Variables
```bash
railway variables
```

### View Variables in Copy-Paste Format
```bash
railway variables --kv
```

### Set a Variable
```bash
railway variables --set "KEY=VALUE"
```

### Set Multiple Variables at Once
```bash
railway variables \
  --set "KEY1=VALUE1" \
  --set "KEY2=VALUE2" \
  --set "KEY3=VALUE3"
```

## ⚡ Fix Chat Functionality (Critical)

If chat is stuck at "thinking", run this immediately:

```bash
railway variables --set "ELIZA_DISABLE_MESSAGE_BUS=false"
```

This re-enables MessageBus which is required for chat responses.

## 📋 Current Configuration Check

Your vigilant-simplicity project currently has these key variables set:

✅ **Working Variables:**
- `DATABASE_URL` - PostgreSQL database
- `ANTHROPIC_API_KEY` - Claude AI
- `GOOGLE_GENERATIVE_AI_API_KEY` - Gemini AI
- `CENTRAL_MESSAGE_SERVER_URL=http://127.0.0.1:9999` - Local MessageBus
- `TRUST_PROXY=true` - Railway proxy support
- `EXPRESS_TRUST_PROXY=true` - Express proxy support
- `ENABLE_API_INTEGRATION=true` - API integration enabled
- `PYTHON_AI_ENGINE_ACTIVE=true` - Python AI engine enabled

⚠️ **Previously Problematic (now fixed):**
- `ELIZA_DISABLE_MESSAGE_BUS` - Was `true`, now set to `false`

## 🚀 Deployment Commands

### View Recent Logs
```bash
railway logs
```

### Trigger Manual Redeploy
```bash
railway up
```

### Check Service Status
```bash
railway status
```

### Open Railway Dashboard
```bash
railway open
```

## 🔍 Debugging

### Check if a Specific Variable is Set
```bash
railway variables | grep KEY_NAME
```

### View Variables in JSON Format
```bash
railway variables --json
```

### Check Current Project Info
```bash
railway status
```

## 📝 Common Tasks

### Add New AI Provider
```bash
railway variables --set "OPENAI_API_KEY=sk-proj-..."
```

### Update Service URLs
```bash
railway variables \
  --set "MAIN_PROJECT_API=https://www.yielddelta.xyz" \
  --set "AI_ENGINE_URL=https://yield-delta-protocol.onrender.com/"
```

### Enable Supabase Integration
```bash
railway variables \
  --set "SUPABASE_URL=https://xxxxx.supabase.co" \
  --set "SUPABASE_ANON_KEY=eyJ..." \
  --set "ENABLE_SUPABASE_UNIFIED=true"
```

## ⚠️ Important Notes

1. **Don't delete these variables** - they're set by railway.toml:
   - `NODE_ENV`
   - `TRUST_PROXY`
   - `EXPRESS_TRUST_PROXY`

2. **Don't set these** - they break chat:
   - `DISABLE_MESSAGE_BUS=true`
   - `MESSAGE_BUS_ENABLED=false`
   - `ELIZA_DISABLE_MESSAGE_BUS=true`

3. **Railway auto-deploys** when you set variables (unless you use `--skip-deploys` flag)

## 🆘 Emergency Fixes

### Chat Not Working
```bash
railway variables --set "ELIZA_DISABLE_MESSAGE_BUS=false"
```

### Rate Limiting Errors
```bash
railway variables \
  --set "TRUST_PROXY=true" \
  --set "EXPRESS_TRUST_PROXY=true"
```

### Database Connection Issues
```bash
# Check if DATABASE_URL is set
railway variables | grep DATABASE_URL

# If missing, Railway should provide it automatically
# Go to Railway dashboard and add PostgreSQL service
```

## 📚 Related Documentation

- [Full Environment Variables Guide](./RAILWAY_ENV_VARS.md)
- [Railway Deployment Guide](./RAILWAY_DEPLOYMENT_GUIDE.md)
- [Railway Bun Configuration](./RAILWAY_BUN_CONFIG.md)

---

**Your Deployment URL:** https://vigilant-simplicity-production.up.railway.app  
**Chat Interface:** https://vigilant-simplicity-production.up.railway.app/chat

Last Updated: October 5, 2025
