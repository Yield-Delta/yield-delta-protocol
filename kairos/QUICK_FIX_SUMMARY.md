# QUICK FIX: Unauthorized X-API-KEY Error

## The Problem
Frontend is getting `"Unauthorized access attempt: Missing or invalid X-API-KEY from 100.64.0.2"` when trying to communicate with the Kairos agent on Railway.

## The Solution (3 Steps)

### 1. Set Environment Variable in Railway
1. Go to Railway dashboard: https://railway.app/
2. Open your Kairos service
3. Click "Variables" tab
4. Add or verify this variable:
   ```
   ELIZA_SERVER_AUTH_TOKEN=egUaYvBLRmP9NYm7o2HCioQWyjfh4IvmZQVkHk5cGa0=
   ```
5. Save and redeploy

### 2. Verify in Railway Logs
Look for this message in Railway logs:
```
✓ Server authentication enabled. Requires X-API-KEY header for /api routes.
```

**NOT** this:
```
✗ Server authentication is disabled. Set ELIZA_SERVER_AUTH_TOKEN environment variable to enable.
```

### 3. Test the Fix
```bash
# From your terminal
curl -H "X-API-KEY: egUaYvBLRmP9NYm7o2HCioQWyjfh4IvmZQVkHk5cGa0=" \
     https://your-railway-url.up.railway.app/api/agents

# Should return agent data (HTTP 200), not 401 Unauthorized
```

Or use the test script:
```bash
cd /workspaces/yield-delta-protocol/kairos
./scripts/test-auth.sh https://your-railway-url.up.railway.app
```

## Why This Fixes It

The ElizaOS server checks for `ELIZA_SERVER_AUTH_TOKEN` on startup:
- **If set**: Requires X-API-KEY header for all `/api/*` routes
- **If NOT set**: Allows all requests (authentication disabled)

The frontend already sends the correct X-API-KEY header. The issue is simply that Railway doesn't have the environment variable configured, so the backend doesn't know to check for it.

## Files Created

1. **AUTHENTICATION_GUIDE.md** - Complete authentication documentation
2. **RAILWAY_DEPLOYMENT_FIX.md** - Detailed technical analysis
3. **scripts/test-auth.sh** - Automated testing script

## What Was Already Correct

✓ Frontend sends X-API-KEY header correctly
✓ API key value matches between frontend and backend
✓ CORS is configured to allow X-API-KEY header
✓ Local .env file has the token set

## What Was Missing

✗ Railway deployment environment variable not set

## Expected Behavior After Fix

| Endpoint | Without Key | With Wrong Key | With Correct Key |
|----------|------------|----------------|------------------|
| `/health` | 200 OK | 200 OK | 200 OK |
| `/api/agents` | 401 Unauthorized | 401 Unauthorized | 200 OK |
| `/api/messaging/*` | 401 Unauthorized | 401 Unauthorized | 200 OK |

## Alternative: Disable Authentication (NOT RECOMMENDED)

If you want to temporarily disable authentication for testing:

1. **Remove** `ELIZA_SERVER_AUTH_TOKEN` from Railway variables
2. Redeploy
3. All endpoints will work without authentication

**Warning:** This is insecure and should only be used for temporary testing.

## Need More Help?

See the detailed guides:
- **AUTHENTICATION_GUIDE.md** - Full authentication documentation
- **RAILWAY_DEPLOYMENT_FIX.md** - Technical deep dive
- Test your setup: `./scripts/test-auth.sh`
