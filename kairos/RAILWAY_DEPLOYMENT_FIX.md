# Railway Deployment - Authentication Fix

## Problem
The Kairos agent deployed on Railway is returning "Unauthorized access attempt: Missing or invalid X-API-KEY from 100.64.0.2" errors when the frontend tries to communicate with it.

## Root Cause
The ElizaOS server applies authentication middleware to all `/api` routes when the `ELIZA_SERVER_AUTH_TOKEN` environment variable is set. The error indicates that either:

1. The `ELIZA_SERVER_AUTH_TOKEN` environment variable is not set in Railway deployment
2. The environment variable value doesn't match what the frontend is sending
3. Headers are being stripped or modified by Railway's proxy/load balancer

## Current Configuration

### Local Environment (.env)
```bash
ELIZA_SERVER_AUTH_TOKEN=egUaYvBLRmP9NYm7o2HCioQWyjfh4IvmZQVkHk5cGa0=
```

### Frontend (wrangler.toml)
```toml
ELIZA_SERVER_AUTH_TOKEN = "egUaYvBLRmP9NYm7o2HCioQWyjfh4IvmZQVkHk5cGa0="
```

The frontend correctly sends this token as the `X-API-KEY` header in all requests to the agent.

## Authentication Middleware Code
The ElizaOS server checks authentication as follows:

```typescript
function apiKeyAuthMiddleware(req, res, next) {
  const serverAuthToken = process.env.ELIZA_SERVER_AUTH_TOKEN;

  // If no token is set, authentication is DISABLED
  if (!serverAuthToken) {
    return next();
  }

  // Allow OPTIONS requests (CORS preflight)
  if (req.method === "OPTIONS") {
    return next();
  }

  // Check for X-API-KEY header (Express normalizes to lowercase)
  const apiKey = req.headers?.["x-api-key"];

  if (!apiKey || apiKey !== serverAuthToken) {
    logger.warn(`Unauthorized access attempt: Missing or invalid X-API-KEY from ${req.ip}`);
    return res.status(401).send("Unauthorized: Invalid or missing X-API-KEY");
  }

  next();
}
```

This middleware is applied to all `/api` routes:
```typescript
if (serverAuthToken) {
  logger.info("Server authentication enabled. Requires X-API-KEY header for /api routes.");
  this.app.use("/api", (req, res, next) => {
    apiKeyAuthMiddleware(req, res, next);
  });
}
```

## Solutions

### Solution 1: Set Environment Variable in Railway (RECOMMENDED)

1. Go to your Railway project dashboard
2. Navigate to the Kairos service
3. Go to "Variables" tab
4. Add or verify the following environment variable:
   ```
   ELIZA_SERVER_AUTH_TOKEN=egUaYvBLRmP9NYm7o2HCioQWyjfh4IvmZQVkHk5cGa0=
   ```
5. Redeploy the service

### Solution 2: Disable Authentication (TEMPORARY - NOT RECOMMENDED FOR PRODUCTION)

If you want to temporarily disable authentication for testing:

1. In Railway, remove the `ELIZA_SERVER_AUTH_TOKEN` environment variable
2. Redeploy the service

**Warning:** This will allow anyone to access your agent's API endpoints.

### Solution 3: Environment-Specific Configuration

Create separate environment files for different deployments:

```bash
# .env.railway (for Railway deployment)
ELIZA_SERVER_AUTH_TOKEN=egUaYvBLRmP9NYm7o2HCioQWyjfh4IvmZQVkHk5cGa0=

# .env.local (for local development)
ELIZA_SERVER_AUTH_TOKEN=egUaYvBLRmP9NYm7o2HCioQWyjfh4IvmZQVkHk5cGa0=
```

## Verification Steps

After applying the fix:

1. **Check Railway logs** for the authentication status message:
   ```
   Server authentication enabled. Requires X-API-KEY header for /api routes.
   ```
   OR
   ```
   Server authentication is disabled. Set ELIZA_SERVER_AUTH_TOKEN environment variable to enable.
   ```

2. **Test the agent endpoint** from the frontend:
   ```bash
   curl -H "X-API-KEY: egUaYvBLRmP9NYm7o2HCioQWyjfh4IvmZQVkHk5cGa0=" \
        https://your-railway-url.up.railway.app/api/agents
   ```

3. **Check for "Unauthorized" errors** in Railway logs - these should stop appearing

## Additional Notes

- The IP address `100.64.0.2` in the error message is a private IP from Railway's internal network (CGNAT range), indicating the request is coming through Railway's proxy
- Railway should forward headers correctly by default, but verify that custom headers like `X-API-KEY` are not being stripped
- The ElizaOS server uses Express.js which normalizes header names to lowercase (e.g., `X-API-KEY` becomes `x-api-key`)
- CORS is configured to allow the `X-API-KEY` header in the allowed headers list

## Related Files

- `/workspaces/yield-delta-protocol/kairos/.env` - Local environment configuration
- `/workspaces/yield-delta-protocol/yield-delta-frontend/wrangler.toml` - Frontend environment configuration
- `/workspaces/yield-delta-protocol/yield-delta-frontend/_functions/api/eliza/chat.ts` - Frontend API client that sends X-API-KEY header
- `node_modules/@elizaos/server/dist/index.js` - ElizaOS server implementation (read-only)
- `node_modules/@elizaos/server/dist/authMiddleware.d.ts` - Authentication middleware definition

## Testing Locally

To test the authentication locally:

1. Ensure `.env` has the token set:
   ```bash
   ELIZA_SERVER_AUTH_TOKEN=egUaYvBLRmP9NYm7o2HCioQWyjfh4IvmZQVkHk5cGa0=
   ```

2. Start the Kairos agent:
   ```bash
   cd /workspaces/yield-delta-protocol/kairos
   elizaos start --dev
   ```

3. Test without API key (should fail):
   ```bash
   curl http://localhost:3000/api/agents
   # Expected: 401 Unauthorized
   ```

4. Test with API key (should succeed):
   ```bash
   curl -H "X-API-KEY: egUaYvBLRmP9NYm7o2HCioQWyjfh4IvmZQVkHk5cGa0=" \
        http://localhost:3000/api/agents
   # Expected: 200 OK with agent data
   ```
