# Environment Setup Guide

## Overview

This guide covers all environment variables needed to run the Yield Delta Protocol ecosystem, including the frontend, ML backend, and Kairos agent.

## Quick Setup

### 1. Frontend Setup

```bash
cd yield-delta-frontend
cp .env.example .env.local
# Edit .env.local with your values
```

### 2. ML Backend Setup

```bash
cd ai-engine
cp .env.example .env
# Edit .env with your values
```

### 3. Kairos Agent Setup

```bash
cd kairos
cp .env.example .env
# Edit .env with your values
```

## 📋 Complete Environment Variable Reference

### Frontend Environment Variables

#### Core Configuration
```env
# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api
AI_ENGINE_URL=http://localhost:8000
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
NEXT_PUBLIC_ML_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_ELIZAOS_WS_URL=ws://localhost:3001
```

#### Coinbase Configuration (Required for Trading)
```env
COINBASE_API_KEY_NAME=organizations/your-org-id/apiKeys/your-key-id
COINBASE_API_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----
your-private-key-content
-----END EC PRIVATE KEY-----"
```

#### Contract Addresses (SEI Testnet)
```env
# Core Contracts
NEXT_PUBLIC_NATIVE_SEI_VAULT=0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565
NEXT_PUBLIC_AI_ORACLE=0xa3437847337d953ed6c9eb130840d04c249973e5
NEXT_PUBLIC_VAULT_FACTORY=0x1ec598666f2a7322a7c954455018e3cfb5a13a99

# Vault Addresses
NEXT_PUBLIC_SEI_VAULT_ADDRESS=0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565
NEXT_PUBLIC_USDC_VAULT_ADDRESS=0xbCB883594435D92395fA72D87845f87BE78d202E

# YEI Finance Oracles
NEXT_PUBLIC_YEI_API3_CONTRACT=0x2880aB155794e7179c9eE2e38200202908C17B43
NEXT_PUBLIC_YEI_PYTH_CONTRACT=0x2880aB155794e7179c9eE2e38200202908C17B43
NEXT_PUBLIC_YEI_SEI_ORACLE=0xa2aCDc40e5ebCE7f8554E66eCe6734937A48B3f3
NEXT_PUBLIC_YEI_USDC_ORACLE=0xEAb459AD7611D5223A408A2e73b69173F61bb808
NEXT_PUBLIC_YEI_USDT_ORACLE=0x284db472a483e115e3422dd30288b24182E36DdB
NEXT_PUBLIC_YEI_ETH_ORACLE=0x3E45Fb956D2Ba2CB5Fa561c40E5912225E64F7B2
```

#### Chain Configuration
```env
NEXT_PUBLIC_CHAIN_ID=sei-testnet
NEXT_PUBLIC_RPC_URL=https://evm-rpc-testnet.sei-apis.com
```

#### DEX Integration
```env
NEXT_PUBLIC_DRAGONSWAP_GRAPHQL_URL=https://api.goldsky.com/api/public/project_clu1fg6ajhsho01x7ajld3f5a/subgraphs/dragonswap-v3-prod/1.0.5/gn
NEXT_PUBLIC_SYMPHONY_API_URL=https://api.symphony.finance
NEXT_PUBLIC_SYMPHONY_TIMEOUT=30000
```

### ML Backend Environment Variables

#### Redis Configuration (Required)
```env
REDIS_HOST=redis-12049.c12.us-east-1-4.ec2.cloud.redislabs.com
REDIS_PORT=12049
REDIS_USERNAME=default
REDIS_PASSWORD=t9H5tKrB72iVrATk2jlcjwZRuQUgF5B5
```

#### API Configuration
```env
PORT=8000
LOG_LEVEL=INFO
API_PREFIX=/api
```

#### Model Configuration
```env
MODEL_CACHE_TTL=3600
MAX_BATCH_SIZE=32
MODEL_TIMEOUT=30
```

#### Training Configuration
```env
TRAIN_ON_START=false          # Set to true to train models on container start
SKIP_MODEL_TRAINING=false     # Set to true to skip all training (dev mode)
TRAINING_DATA_SOURCE=yfinance

# Training Parameters (Optional)
RL_TIMESTEPS=10000
LSTM_EPOCHS=10
IL_ESTIMATORS=50
```

#### Monitoring
```env
DRIFT_THRESHOLD=0.1
MONITORING_WINDOW_SIZE=1000
ALERT_RATE_LIMIT=30
```

#### External Services (Optional)
```env
SLACK_WEBHOOK=
DISCORD_WEBHOOK=
EMAIL_SMTP_HOST=
EMAIL_SMTP_PORT=587
EMAIL_FROM_ADDRESS=
```

### Kairos Agent Environment Variables

#### Model Providers (Required - Choose One)
```env
OPENAI_API_KEY=sk-your-openai-key
# OR
ANTHROPIC_API_KEY=your-anthropic-key
```

#### SEI Network Configuration
```env
SEI_PRIVATE_KEY=your-private-key
SEI_NETWORK=sei-testnet
SEI_RPC_URL=https://evm-rpc-testnet.sei-apis.com
```

#### Database
```env
POSTGRES_URL=postgresql://user:pass@localhost:5432/kairos_db
# Or use local SQLite (default)
```

## 🚀 Deployment Configurations

### Development Environment

```bash
# Frontend
NEXT_PUBLIC_CHAIN_ID=sei-testnet
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_MOCK_DATA=false

# ML Backend
LOG_LEVEL=DEBUG
TRAIN_ON_START=false
SKIP_MODEL_TRAINING=true  # Skip training for faster dev

# Kairos
LOG_LEVEL=debug
SEI_NETWORK=sei-testnet
```

### Production Environment

```bash
# Frontend
NEXT_PUBLIC_CHAIN_ID=sei-mainnet
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_MOCK_DATA=false

# ML Backend
LOG_LEVEL=INFO
TRAIN_ON_START=false
SKIP_MODEL_TRAINING=false
DRIFT_THRESHOLD=0.15

# Kairos
LOG_LEVEL=info
SEI_NETWORK=sei-mainnet
```

## 🔐 Security Best Practices

### 1. Never Commit Secrets
```bash
# Add to .gitignore
.env
.env.local
.env.production
```

### 2. Use Environment-Specific Files
```
.env.example     # Template with dummy values (commit this)
.env.local       # Local development (don't commit)
.env.production  # Production values (store securely)
```

### 3. Rotate Keys Regularly
- API keys should be rotated monthly
- Database passwords quarterly
- Private keys should use hardware wallets in production

### 4. Use Secret Management Services

#### Railway
```bash
railway secrets set REDIS_PASSWORD=your-password
railway secrets set COINBASE_API_KEY_NAME=your-key
```

#### Vercel
```bash
vercel env add REDIS_PASSWORD
vercel env add NEXT_PUBLIC_ML_API_URL
```

## 📝 Environment Variable Checklist

### Frontend Deployment
- [ ] Coinbase API credentials configured
- [ ] ML API URL pointing to deployed backend
- [ ] Contract addresses for target network
- [ ] Chain configuration (testnet/mainnet)
- [ ] Redis credentials for caching

### ML Backend Deployment
- [ ] Redis credentials configured
- [ ] Training strategy decided (TRAIN_ON_START)
- [ ] Model parameters configured
- [ ] Monitoring thresholds set
- [ ] Alert webhooks configured (optional)

### Kairos Deployment
- [ ] Model provider API key set
- [ ] SEI private key configured
- [ ] Network selection (testnet/mainnet)
- [ ] Database configured
- [ ] Contract addresses updated

## 🔧 Troubleshooting

### Common Issues

1. **"API key not found"**
   - Check .env file exists
   - Verify variable names match exactly
   - Restart application after changes

2. **"Contract call failed"**
   - Verify contract addresses for network
   - Check chain ID matches RPC URL
   - Ensure wallet has sufficient balance

3. **"Redis connection failed"**
   - Check Redis credentials
   - Verify network connectivity
   - Fall back to in-memory storage if needed

4. **"Model not loading"**
   - Check SKIP_MODEL_TRAINING setting
   - Verify model files exist
   - Review training logs

### Debug Commands

```bash
# Check environment variables
printenv | grep NEXT_PUBLIC

# Test Redis connection
redis-cli -h redis-12049.c12.us-east-1-4.ec2.cloud.redislabs.com -p 12049 -a password ping

# Verify contract addresses
cast call 0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565 "name()" --rpc-url https://evm-rpc-testnet.sei-apis.com
```

## 📚 Additional Resources

- [SEI Network Docs](https://docs.sei.io)
- [YEI Finance Oracles](https://docs.yei.finance)
- [DragonSwap Documentation](https://docs.dragonswap.app)
- [Railway Environment Variables](https://docs.railway.app/guides/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)