# Railway Deployment Guide for Liqui Agent

## 🚂 Quick Setup

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login and Initialize
```bash
# Login to Railway
railway login

# Initialize project in /workspaces/yield-delta-protocol/liqui/
cd /workspaces/yield-delta-protocol/liqui
railway init
```

### 3. Add PostgreSQL Database
```bash
# Add PostgreSQL service
railway add postgresql

# Get database URL (Railway handles SSL automatically)
railway variables
```

### 4. Set Environment Variables
Copy variables from `.env.railway` to your Railway project:

```bash
# Set required environment variables
railway variables set OPENAI_API_KEY=sk-your-key-here
railway variables set SEI_PRIVATE_KEY=your-private-key
railway variables set SEI_ADDRESS=your-address
# ... add all other variables from .env.railway
```

### 5. Deploy
```bash
# Deploy to Railway
railway up
```

## 🔧 Configuration Details

### Files Created:
- `railway.toml` - Railway configuration
- `.railwayignore` - Files to ignore during deployment
- `.env.railway` - Environment variables template
- `RAILWAY_DEPLOYMENT.md` - This guide

### Key Advantages:
- ✅ **Automatic Port Binding** - No manual configuration needed
- ✅ **PostgreSQL with SSL** - Works out of the box
- ✅ **ElizaOS Compatible** - Perfect for agent applications
- ✅ **Better Logging** - More detailed deployment logs
- ✅ **Health Checks** - Automatic service monitoring

### Environment Variables:
Railway automatically provides:
- `PORT` - Application port
- `DATABASE_URL` - PostgreSQL connection string with SSL

You need to set:
- `OPENAI_API_KEY` - OpenAI API key
- `SEI_PRIVATE_KEY` - SEI blockchain private key
- `SEI_ADDRESS` - SEI blockchain address
- And other variables from `.env.railway`

## 🚀 Deployment Commands

```bash
# Deploy current directory
railway up

# View logs
railway logs

# Open in browser
railway open

# Connect to database
railway connect postgresql

# Check service status
railway status
```

## 🔍 Troubleshooting

### Common Issues:
1. **Build Fails**: Check `railway logs` for detailed error messages
2. **Database Connection**: Railway handles SSL automatically, no manual config needed
3. **Port Binding**: Railway sets PORT automatically, ElizaOS will use it
4. **Memory Issues**: Adjust NODE_OPTIONS in railway.toml if needed

### Useful Commands:
```bash
# View environment variables
railway variables

# Restart service
railway restart

# View service metrics
railway metrics
```

Railway should handle your ElizaOS agent much better than Render! 🎯