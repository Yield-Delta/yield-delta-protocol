# Railway Deployment Guide - Kairos ElizaOS Agent

## Current Deployment Status

### URLs Analysis
- **https://fulfilling-empathy-production.up.railway.app** - Returns 404 (Application not found)
- **https://yield-delta-protocol-production.up.railway.app** - Active (Different service - SEI DLP AI Engine Bridge)

### Status Summary
The URL `https://fulfilling-empathy-production.up.railway.app` is currently returning a 404 error, indicating that either:
1. The Railway project exists but is not deployed
2. The service is stopped or crashed
3. The deployment configuration is incorrect

The second URL is actively serving a different application (SEI DLP AI Engine Bridge v1.0.0), which is NOT the Kairos ElizaOS agent.

## Prerequisites

### 1. Railway CLI Authentication
```bash
# Login to Railway (required for deployment)
railway login

# Link to existing project OR create new one
railway link  # If project exists
railway init  # If creating new project
```

### 2. Required Files (Already Present)

#### Dockerfile (`/workspaces/yield-delta-protocol/kairos/Dockerfile`)
- Status: Production-ready
- Features:
  - Multi-stage build with Node.js 23.3.0
  - Bun package manager installed globally
  - Automatic PORT environment variable handling
  - Non-root user execution (security best practice)
  - Optimized layer caching

#### Railway Configuration (`/workspaces/yield-delta-protocol/kairos/railway.json`)
- Status: Created
- Configuration:
  - Dockerfile-based build
  - Health check endpoint: `/health`
  - Automatic restart on failure
  - 300-second health check timeout

#### Environment Variables (`/workspaces/yield-delta-protocol/kairos/.env`)
- Status: Present (must be configured in Railway dashboard)
- Contains: API keys, database URLs, vault addresses, Twitter credentials

## Deployment Architecture

### ElizaOS Server Endpoints

The ElizaOS framework automatically starts an HTTP server when using the `elizaos start` command. The server exposes:

1. **Health Check**: `GET /health`
   - Returns: `{"status": "ok"}`
   - Used by Railway for health monitoring

2. **Chat API**: `POST /api/chat`
   - Send messages to the agent
   - Request body: `{"message": "your message", "userId": "user-id"}`

3. **Agent Info**: `GET /api/agents`
   - Returns information about loaded agents
   - Response includes agent name, plugins, and configuration

4. **WebSocket**: `WS /ws`
   - Real-time streaming communication
   - Used for live chat interfaces

5. **API Messages**: `POST /api/messages`
   - Alternative message endpoint
   - Similar to `/api/chat` but different response format

### Port Configuration

The Dockerfile includes automatic PORT handling:
```bash
export SERVER_PORT=${PORT:-${SERVER_PORT:-3000}}
```

This ensures Railway's dynamic PORT variable is used correctly.

## Step-by-Step Deployment Instructions

### Option 1: Deploy via Railway CLI (Recommended)

#### Step 1: Authenticate and Link Project
```bash
cd /workspaces/yield-delta-protocol/kairos

# Login to Railway
railway login

# Link to existing project (if it exists)
railway link

# OR create a new project
railway init
```

#### Step 2: Configure Environment Variables
```bash
# Set environment variables from .env file
# Note: Do this in Railway dashboard or via CLI

railway variables set POSTGRES_URL="postgresql://user:password@host/database?sslmode=require"

railway variables set ANTHROPIC_API_KEY="sk-ant-api03-YOUR-KEY-HERE"

railway variables set GOOGLE_GENERATIVE_AI_API_KEY="YOUR-GOOGLE-API-KEY-HERE"

# Continue with all environment variables from .env file
# Or use Railway dashboard to bulk import
```

**Important Environment Variables to Set:**
- `POSTGRES_URL` - PostgreSQL database connection (required for agent memory)
- `ANTHROPIC_API_KEY` - Claude AI API key (LLM provider)
- `GOOGLE_GENERATIVE_AI_API_KEY` - Google Gemini API key (alternative LLM)
- `SEI_PRIVATE_KEY` - SEI wallet private key (for blockchain operations)
- `SEI_NETWORK` - SEI network (sei-testnet)
- `SEI_RPC_URL` - SEI RPC endpoint
- All vault addresses and Twitter credentials

#### Step 3: Deploy to Railway
```bash
# Deploy using Railway CLI
railway up

# Or link to GitHub and enable auto-deploy
railway link
```

#### Step 4: Monitor Deployment
```bash
# View deployment logs
railway logs

# Check service status
railway status

# Get deployment URL
railway domain
```

### Option 2: Deploy via Railway Dashboard

#### Step 1: Access Railway Dashboard
1. Go to https://railway.app
2. Login to your account
3. Find the "fulfilling-empathy-production" project (or create new)

#### Step 2: Configure Service
1. Click on the service/deployment
2. Go to Settings tab
3. Configure:
   - **Build Command**: Leave empty (uses Dockerfile)
   - **Start Command**: `/usr/local/bin/start.sh` (already in Dockerfile)
   - **Healthcheck Path**: `/health`
   - **Port**: Will be set by Railway automatically

#### Step 3: Set Environment Variables
1. Go to "Variables" tab
2. Click "Raw Editor"
3. Paste all variables from `/workspaces/yield-delta-protocol/kairos/.env`
4. Click "Save"

**Critical Variables Checklist:**
- [ ] POSTGRES_URL
- [ ] ANTHROPIC_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY
- [ ] SEI_PRIVATE_KEY
- [ ] SEI_NETWORK
- [ ] SEI_RPC_URL
- [ ] All 5 vault addresses
- [ ] TWITTER_API_KEY, TWITTER_API_SECRET_KEY, etc. (if using Twitter)
- [ ] LOG_LEVEL

#### Step 4: Connect GitHub Repository
1. Go to "Settings" > "Source"
2. Connect GitHub repository: `https://github.com/Yield-Delta/yield-delta-protocol`
3. Set Root Directory: `/kairos`
4. Enable "Auto Deploy" for main branch

#### Step 5: Trigger Deployment
1. Click "Deploy" button
2. Monitor build logs in real-time
3. Wait for deployment to complete (5-10 minutes)

#### Step 6: Verify Deployment
```bash
# Test health endpoint
curl https://fulfilling-empathy-production.up.railway.app/health

# Expected response:
{"status": "ok"}

# Test chat endpoint
curl -X POST https://fulfilling-empathy-production.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the current price of SEI?", "userId": "test-user"}'
```

## Configuration Files Created

### 1. `/workspaces/yield-delta-protocol/kairos/railway.json`
Railway service configuration with:
- Dockerfile build strategy
- Health check configuration
- Restart policy

### 2. `/workspaces/yield-delta-protocol/kairos/.railwayignore`
Excludes unnecessary files from deployment:
- Node modules (rebuilt in Docker)
- Test files
- Development tools
- Documentation

## Troubleshooting

### Issue 1: 404 Application Not Found

**Symptoms:**
```json
{"status":"error","code":404,"message":"Application not found"}
```

**Solutions:**
1. Check if service is running in Railway dashboard
2. Verify deployment completed successfully
3. Check build logs for errors
4. Ensure PORT environment variable is handled correctly

**Diagnosis Commands:**
```bash
railway status
railway logs
```

### Issue 2: Build Failures

**Common Causes:**
- Missing dependencies in package.json
- Dockerfile syntax errors
- Out of memory during build

**Solutions:**
1. Increase Railway build resources (dashboard settings)
2. Check Dockerfile is in root of kairos directory
3. Verify bun.lock file is present

### Issue 3: Health Check Failures

**Symptoms:**
- Deployment shows "Unhealthy" status
- Service keeps restarting

**Solutions:**
1. Verify ElizaOS server starts correctly
2. Check if PORT variable is set
3. Ensure /health endpoint is accessible
4. Review application logs:
   ```bash
   railway logs --follow
   ```

### Issue 4: Database Connection Errors

**Symptoms:**
- Agent starts but can't store memories
- PostgreSQL connection errors in logs

**Solutions:**
1. Verify POSTGRES_URL is set correctly
2. Check database is accessible from Railway's region
3. Ensure SSL mode is set: `?sslmode=require`
4. Test database connection manually

### Issue 5: API Key Errors

**Symptoms:**
- "Unauthorized" errors in logs
- Agent responses fail

**Solutions:**
1. Verify all API keys are set in Railway variables
2. Check for trailing spaces in environment variable values
3. Ensure API keys have not expired
4. Test API keys independently

## Production Recommendations

### 1. Resource Allocation
- **Memory**: Minimum 512MB, recommended 1GB
- **CPU**: Shared CPU is sufficient for moderate traffic
- **Disk**: Railway provides ephemeral storage; use PostgreSQL for persistence

### 2. Environment Separation
Create separate Railway projects for:
- **Development**: `kairos-dev`
- **Staging**: `kairos-staging`
- **Production**: `kairos-production` (fulfilling-empathy-production)

### 3. Database Configuration
- Use managed PostgreSQL (Railway or external)
- Enable connection pooling
- Set up automated backups
- Monitor database size and performance

### 4. Monitoring and Alerting
Set up Railway alerts for:
- Deployment failures
- Health check failures
- High memory usage
- Application crashes

### 5. Security Best Practices
- [ ] Rotate API keys regularly
- [ ] Use Railway's secrets management (not .env in git)
- [ ] Enable Railway's DDoS protection
- [ ] Implement rate limiting in agent
- [ ] Use non-root user in Docker (already configured)

### 6. Logging Configuration
```bash
# Set appropriate log level
LOG_LEVEL=info  # production
LOG_LEVEL=debug # development/troubleshooting
```

### 7. CI/CD Pipeline
1. Connect GitHub repository to Railway
2. Enable auto-deploy from main branch
3. Set up branch previews for pull requests
4. Implement deployment checks:
   - Build succeeds
   - Health check passes
   - Database migrations complete

### 8. Cost Optimization
- Use Railway's usage-based pricing
- Monitor resource consumption
- Scale down during low-traffic periods
- Consider reserved instances for production

## Deployment Verification Checklist

After deployment, verify:

- [ ] Service shows "Active" status in Railway dashboard
- [ ] Health check endpoint returns 200 OK
  ```bash
  curl https://fulfilling-empathy-production.up.railway.app/health
  ```
- [ ] Chat endpoint responds correctly
  ```bash
  curl -X POST https://fulfilling-empathy-production.up.railway.app/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello Kairos", "userId": "test"}'
  ```
- [ ] Agents endpoint returns agent info
  ```bash
  curl https://fulfilling-empathy-production.up.railway.app/api/agents
  ```
- [ ] WebSocket connection works
  ```bash
  wscat -c wss://fulfilling-empathy-production.up.railway.app/ws
  ```
- [ ] Database connection is active (check logs)
- [ ] Environment variables are loaded correctly
- [ ] Twitter integration works (if enabled)
- [ ] SEI blockchain operations function correctly

## Next Steps

1. **Immediate Action Required:**
   - Login to Railway: `railway login`
   - Link to project: `railway link` or `railway init`
   - Verify environment variables in Railway dashboard
   - Trigger deployment: `railway up` or via GitHub push

2. **Post-Deployment:**
   - Monitor logs for first 24 hours
   - Test all API endpoints
   - Verify Twitter posting (if enabled)
   - Check database for agent memories
   - Load test the service

3. **Ongoing Maintenance:**
   - Review logs weekly
   - Monitor resource usage
   - Update dependencies monthly
   - Rotate API keys quarterly
   - Backup database regularly

## Support and Documentation

- Railway Documentation: https://docs.railway.app
- ElizaOS Documentation: https://elizaos.github.io/eliza
- Project Repository: https://github.com/Yield-Delta/yield-delta-protocol
- Railway Status: https://status.railway.app

## Additional Resources

### Railway CLI Commands
```bash
# Project management
railway login              # Authenticate with Railway
railway init               # Create new project
railway link               # Link to existing project
railway list               # List all projects
railway status             # Check deployment status

# Deployment
railway up                 # Deploy current directory
railway deploy             # Alternative deploy command
railway redeploy           # Redeploy last deployment

# Environment variables
railway variables          # List all variables
railway variables set KEY=value
railway variables delete KEY

# Monitoring
railway logs               # View logs
railway logs --follow      # Stream logs
railway logs --service=<name>

# Domains
railway domain             # Get current domain
railway domain add         # Add custom domain

# Debugging
railway run <command>      # Run command in Railway environment
railway shell              # Open shell in deployment
```

### ElizaOS CLI Commands
```bash
# Development
elizaos dev                # Start development mode
elizaos start              # Start production mode
elizaos start --character characters/production.json

# Testing
elizaos test               # Run tests

# Project management
elizaos create <name>      # Create new project
elizaos plugin create      # Create new plugin
```

## Conclusion

The Kairos ElizaOS agent is production-ready and can be deployed to Railway immediately. The Dockerfile is optimized, configuration files are in place, and all required endpoints will be exposed automatically by the ElizaOS server.

**Action Required:**
1. Authenticate with Railway CLI
2. Link or create Railway project
3. Configure environment variables in Railway dashboard
4. Deploy via CLI or GitHub integration
5. Verify all endpoints are working
