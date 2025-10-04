# Railway Deployment Guide for Liqui Agent

This guide provides step-by-step instructions for deploying the Liqui AI chat agent on Railway, with fixes for MessageBusService connectivity issues.

## 🚨 Issues Fixed

The following issues have been resolved:

1. **MessageBusService Connection Errors**: Prevented external connections that were causing "Unable to connect" errors
2. **Channel Participation Issues**: Agent no longer tries to fetch participants from external channels
3. **SocketIO Connection Problems**: Disabled external SocketIO connections that were failing
4. **Railway Environment Configuration**: Optimized for Railway's infrastructure

## 🔧 Pre-Deployment Setup

### 1. Environment Variables

Copy these environment variables to your Railway project:

```bash
# Core Configuration
NODE_ENV=production
LOG_LEVEL=info

# MessageBus Configuration (CRITICAL - prevents connection errors)
DISABLE_MESSAGE_BUS=true
MESSAGE_BUS_ENABLED=false
CENTRAL_MESSAGE_SERVER_URL=http://127.0.0.1:9999
ELIZA_SERVER_AUTH_TOKEN=

# Railway Configuration
TRUST_PROXY=true
EXPRESS_TRUST_PROXY=true

# AI Model Providers (at least one required)
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_google_key_here

# SEI Blockchain Configuration
SEI_PRIVATE_KEY=your_sei_private_key
SEI_ADDRESS=your_sei_address
SEI_RPC_URL=https://evm-rpc-testnet.sei-apis.com
SEI_CHAIN_ID=1328
SEI_NETWORK=sei-testnet

# Smart Contract Addresses
NEXT_PUBLIC_NATIVE_SEI_VAULT=0xAC64527866CCfA796Fa87A257B3f927179a895e6
NEXT_PUBLIC_ERC20_USDC_VAULT=0xcF796aEDcC293db74829e77df7c26F482c9dBEC0
NEXT_PUBLIC_AI_ORACLE=0x4199f86F3Bd73cF6ae5E89C8E28863d4B12fb18E
NEXT_PUBLIC_VAULT_FACTORY=0x37b8E91705bc42d5489Dae84b00B87356342B267

# Token Addresses
NEXT_PUBLIC_TOKEN_SEI=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_TOKEN_USDC=0x647Dc1B1BFb17171326c12A2dcd8464E871F097B
NEXT_PUBLIC_TOKEN_USDT=0x13f991ac97ef04cc0288a96a82aa808fb1966574
NEXT_PUBLIC_TOKEN_ETH=0x80641cae989b52868e924115a7ffc2d231033555
NEXT_PUBLIC_TOKEN_BTC=0x84b2440238dc8c938d0d1e88d8b973a43a86c450

# API Integration
ENABLE_API_INTEGRATION=true
YIELD_DELTA_USE_EXISTING_APIS=true
MAIN_PROJECT_API=https://www.yielddelta.xyz
AI_ENGINE_URL=https://yield-delta-protocol.onrender.com/
PYTHON_AI_ENGINE_ACTIVE=true

# External Integrations
DRAGONSWAP_API_URL=https://api-testnet.dragonswap.app/v1
USER_GEOGRAPHY=GLOBAL
PERP_PREFERENCE=AUTO
PERP_PROTOCOL=vortex
```

### 2. Database Setup

Railway automatically provides PostgreSQL. The agent will use the `DATABASE_URL` environment variable that Railway sets automatically.

### 3. Build Configuration

The project is configured with the following build settings in `railway.toml`:

```toml
[build]
builder = "nixpacks"
buildCommand = "bun install && npm run build"

[build.nixpacks]
node_version = "20"

[deploy]
startCommand = "node scripts/railway-start.js"
healthcheckPath = "/"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

## 🚀 Deployment Steps

### 1. Connect Repository

1. Go to [Railway](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Select the `liqui` folder as the root directory

### 2. Add PostgreSQL

1. In your Railway project, click "Add Service"
2. Select "PostgreSQL"
3. Railway will automatically set the `DATABASE_URL` environment variable

### 3. Configure Environment Variables

1. Go to the "Variables" tab in your Railway project
2. Add all the environment variables listed above
3. **CRITICAL**: Ensure `DISABLE_MESSAGE_BUS=true` is set

### 4. Deploy

1. Railway will automatically deploy when you push to your main branch
2. Monitor the build logs for any issues
3. Check the application logs after deployment

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. MessageBusService Errors

**Error**: `Error fetching participants for channel 25c93c98-c9a6-416d-818d-124fb5e1e21b`

**Solution**: This is now handled automatically. The error should be suppressed with the message:
```
💡 This is expected in standalone mode - MessageBus connections are disabled
```

#### 2. SocketIO Connection Issues

**Error**: `SocketIO Client disconnections and new connections`

**Solution**: The agent now operates in standalone mode and doesn't require external SocketIO connections.

#### 3. Database Connection Issues

**Error**: Database connection failures

**Solution**: 
- Ensure PostgreSQL addon is added to your Railway project
- Check that `DATABASE_URL` is automatically set by Railway
- Verify the database is in the same region as your app

#### 4. Build Failures

**Error**: Out of memory during build

**Solution**: The project uses optimized build settings with `NODE_OPTIONS='--max-old-space-size=4096'`

#### 5. Health Check Failures

**Error**: Application doesn't respond to health checks

**Solution**: 
- The health check endpoint is configured at `/`
- Ensure your app starts on the PORT provided by Railway
- Check the startup logs for any initialization errors

### Monitoring Deployment

1. **Build Logs**: Check for compilation errors
2. **Application Logs**: Monitor for runtime errors
3. **Health Checks**: Ensure the `/` endpoint responds
4. **Error Statistics**: The app logs error statistics every 5 seconds

### Expected Log Messages

After successful deployment, you should see:

```
🚀 Railway Startup Script for Liqui Agent
🔧 Standalone mode configured - MessageBus disabled for local operation
🚫 Central Message Server URL set to non-routable address: http://127.0.0.1:9999
🛡️ Global error handlers configured for Railway deployment
📡 MessageBus Override Plugin: Standalone MessageBusService registered
✅ SEI DLP Liqui character initialized with architectural alignment
```

## 🔒 Security Considerations

1. **API Keys**: Store sensitive keys in Railway environment variables, never in code
2. **Private Keys**: Use environment variables for blockchain private keys
3. **MessageBus**: External connections are disabled for security
4. **Proxy Trust**: `TRUST_PROXY=true` is configured for Railway's infrastructure

## 🔄 Updates and Maintenance

1. **Code Updates**: Push to your main branch to trigger automatic redeployment
2. **Environment Variables**: Update through Railway dashboard
3. **Database Migrations**: Railway PostgreSQL handles migrations automatically
4. **Monitoring**: Check Railway dashboard for performance metrics

## 📞 Support

If you encounter issues not covered in this guide:

1. Check Railway application logs
2. Review error statistics in application logs
3. Verify all environment variables are set correctly
4. Ensure MessageBus is properly disabled with `DISABLE_MESSAGE_BUS=true`

The deployment is now optimized for Railway's infrastructure and should operate without external connection issues.