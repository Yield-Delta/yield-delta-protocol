# Kairos Agent Authentication Guide

## Quick Fix for Railway Deployment

If you're seeing `"Unauthorized access attempt: Missing or invalid X-API-KEY"` errors:

### Step 1: Set Environment Variable in Railway

1. Go to your Railway project: https://railway.app/
2. Select the Kairos service
3. Click on "Variables" tab
4. Add this variable (or verify it exists):
   ```
   Name: ELIZA_SERVER_AUTH_TOKEN
   Value: egUaYvBLRmP9NYm7o2HCioQWyjfh4IvmZQVkHk5cGa0=
   ```
5. Click "Deploy" or the service will auto-redeploy

### Step 2: Verify the Fix

Check Railway logs for this message:
```
Server authentication enabled. Requires X-API-KEY header for /api routes.
```

If you see:
```
Server authentication is disabled. Set ELIZA_SERVER_AUTH_TOKEN environment variable to enable.
```
Then the environment variable is not set correctly.

### Step 3: Test the Endpoint

```bash
# Test from your local machine (replace with your Railway URL)
./scripts/test-auth.sh https://your-app.up.railway.app egUaYvBLRmP9NYm7o2HCioQWyjfh4IvmZQVkHk5cGa0=
```

---

## How Authentication Works

The ElizaOS server automatically enables authentication when `ELIZA_SERVER_AUTH_TOKEN` is set:

```typescript
// If ELIZA_SERVER_AUTH_TOKEN is set in environment
if (serverAuthToken) {
  // All /api/* routes require X-API-KEY header
  this.app.use("/api", apiKeyAuthMiddleware);
}
```

### Protected Routes (require X-API-KEY header)
- `/api/agents` - List all agents
- `/api/messaging/*` - Message endpoints
- `/api/memory/*` - Memory endpoints
- `/api/audio/*` - Audio endpoints
- `/api/server/*` - Server management
- All other `/api/*` routes

### Unprotected Routes (no auth required)
- `/health` - Health check
- `/` - Web UI (if enabled)
- Custom plugin routes outside `/api`

## Frontend Configuration

The frontend (Cloudflare Worker) sends the API key automatically:

```typescript
const headers = {
  'Content-Type': 'application/json',
  'X-API-KEY': ELIZA_SERVER_AUTH_TOKEN  // From environment
};

const response = await fetch(`${agentUrl}/api/agents`, {
  headers
});
```

Configuration in `wrangler.toml`:
```toml
[env.production.vars]
ELIZA_SERVER_AUTH_TOKEN = "egUaYvBLRmP9NYm7o2HCioQWyjfh4IvmZQVkHk5cGa0="
```

## Common Issues

### Issue 1: "Unauthorized" error even with correct key

**Symptoms:**
- 401 Unauthorized errors
- Log shows: `Unauthorized access attempt: Missing or invalid X-API-KEY from <IP>`

**Causes:**
1. Environment variable not set in Railway
2. Environment variable value doesn't match frontend
3. Headers being stripped by proxy/CDN

**Solution:**
1. Verify environment variable is set in Railway
2. Check that the value exactly matches (including any trailing characters)
3. Verify headers are being sent:
   ```bash
   curl -v -H "X-API-KEY: egUaYvBLRmP9NYm7o2HCioQWyjfh4IvmZQVkHk5cGa0=" \
        https://your-app.up.railway.app/api/agents
   ```

### Issue 2: Authentication is disabled when it shouldn't be

**Symptoms:**
- Log shows: `Server authentication is disabled`
- API endpoints work without X-API-KEY header

**Cause:**
- `ELIZA_SERVER_AUTH_TOKEN` environment variable is not set

**Solution:**
1. Set the variable in Railway dashboard
2. Redeploy the service
3. Check logs for "Server authentication enabled" message

### Issue 3: CORS errors

**Symptoms:**
- Browser shows CORS errors
- Requests fail with preflight errors

**Cause:**
- Frontend domain not in CORS allowlist
- X-API-KEY not in allowed headers

**Solution:**
The ElizaOS server is configured to allow X-API-KEY in CORS:
```javascript
cors({
  allowedHeaders: ["Content-Type", "Authorization", "X-API-KEY"]
})
```

For custom domains, you may need to set:
```bash
CORS_ORIGIN=https://www.yielddelta.xyz
```

## Testing Authentication

Use the provided test script:

```bash
# Test local development server
./scripts/test-auth.sh

# Test Railway deployment
./scripts/test-auth.sh https://kairos-production.up.railway.app

# Test with custom API key
./scripts/test-auth.sh https://kairos-production.up.railway.app "your-custom-key"
```

### Expected Test Results

```
Test 1: Health check (no auth required)
✓ Health check passed (HTTP 200)

Test 2: /api/agents without API key (should fail)
✓ Correctly rejected without API key (HTTP 401)

Test 3: /api/agents with wrong API key (should fail)
✓ Correctly rejected with wrong API key (HTTP 401)

Test 4: /api/agents with correct API key (should succeed)
✓ Successfully authenticated (HTTP 200)

Test 5: CORS preflight (OPTIONS request)
✓ CORS preflight passed (HTTP 200)
```

## Generating a New API Key

If you need to generate a new API key:

```bash
# Generate a new random API key
openssl rand -base64 32
```

Then update both:
1. Railway environment variable: `ELIZA_SERVER_AUTH_TOKEN`
2. Cloudflare Worker environment variable in `wrangler.toml`

## Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Rotate keys regularly** - Generate new keys periodically
3. **Use different keys per environment** - Development, staging, production
4. **Enable authentication in production** - Always set ELIZA_SERVER_AUTH_TOKEN
5. **Monitor logs** - Watch for unauthorized access attempts

## Related Documentation

- [Railway Deployment Fix](./RAILWAY_DEPLOYMENT_FIX.md) - Detailed technical documentation
- [ElizaOS Documentation](https://elizaos.github.io/eliza/) - Official ElizaOS docs
- [Frontend API Client](../yield-delta-frontend/_functions/api/eliza/chat.ts) - Frontend implementation

## Support

If you continue to experience authentication issues:

1. Check Railway logs for error messages
2. Verify environment variables are set correctly
3. Test with the provided test script
4. Check that frontend and backend API keys match
5. Ensure no proxy/CDN is stripping headers
