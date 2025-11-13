# Twitter API Free Tier Rate Limits

## Current Issue

The Kairos agent is hitting Twitter's free tier rate limits, resulting in 429 errors:
- **User Limit**: 25 requests per 24 hours
- **App Limit**: 1,200,000 requests per 24 hours (not an issue)
- **Current Status**: `"x-user-limit-24hour-remaining": "0"`

## Solutions Implemented (No Paid Upgrade Required)

### 1. Temporarily Disable Twitter Plugin

**File**: `src/character.ts`
```typescript
// '@elizaos/plugin-twitter', // DISABLED: Hitting free tier rate limits (25 requests/24h)
```

**Status**: Plugin is commented out to stop continuous 429 errors

### 2. Conservative Rate Limit Settings

**File**: `.env`

#### Disabled All Active Features:
```bash
TWITTER_ENABLE_PLUGIN=false
TWITTER_ENABLE_POST=false
TWITTER_ENABLE_ACTIONS=false
TWITTER_AUTO_RESPOND_MENTIONS=false
TWITTER_AUTO_RESPOND_REPLIES=false
TWITTER_ENABLE_REPLIES=false
TWITTER_ENABLE_DISCOVERY=false
```

#### Extended Intervals (in seconds):
```bash
TWITTER_RETRY_LIMIT=1                    # Reduced from 3
TWITTER_POLL_INTERVAL=3600               # 1 hour (was 5 min)
TWITTER_POST_INTERVAL_MIN=7200           # 2 hours (was 3 min)
TWITTER_POST_INTERVAL_MAX=14400          # 4 hours (was 6 min)
TWITTER_INTERACTION_INTERVAL_MIN=1800    # 30 min (was 15 sec)
TWITTER_INTERACTION_INTERVAL_MAX=3600    # 1 hour (was 30 sec)
TWITTER_ACTION_INTERVAL=7200             # 2 hours (was 4 min)
```

## Understanding Rate Limits

### Free Tier Limits
- **25 requests per 24 hours** per user account
- Resets every 24 hours from first request
- Each API call (tweet, mention check, timeline fetch) counts as 1 request

### What Counts as a Request?
- ✅ Fetching timeline
- ✅ Checking mentions
- ✅ Posting a tweet
- ✅ Replying to a tweet
- ✅ Liking/retweeting
- ✅ Verifying authentication

## Options to Resume Twitter Functionality

### Option 1: Wait for Rate Limit Reset (FREE)
**Time**: Check `x-rate-limit-reset` header from error logs
```bash
"x-rate-limit-reset": "1760287626"  # Unix timestamp
```

Convert to readable date:
```bash
date -d @1760287626
# Sun Oct 12 09:27:06 PDT 2025
```

**Action**: Wait until this time, then re-enable with conservative settings below.

### Option 2: Manual Controlled Twitter Access (FREE - RECOMMENDED)

Enable ONLY when needed with very conservative settings:

**Step 1**: Update `.env`:
```bash
TWITTER_ENABLE_PLUGIN=true           # Only enable when you want to use it
TWITTER_ENABLE_POST=false            # Disable auto-posting
TWITTER_ENABLE_ACTIONS=false         # Disable auto-actions
TWITTER_POLL_INTERVAL=7200           # Check every 2 hours
TWITTER_MAX_INTERACTIONS_PER_RUN=1   # Only 1 interaction per run
TWITTER_AUTO_RESPOND_MENTIONS=false  # Manual responses only
```

**Step 2**: Uncomment in `src/character.ts`:
```typescript
'@elizaos/plugin-twitter',  // Re-enable carefully
```

**Budget**: ~12 requests per 24 hours with these settings

### Option 3: Upgrade to Twitter API Pro (PAID)
- **Cost**: $5,000/month
- **Limits**: Much higher rate limits
- **Recommendation**: Not cost-effective for current usage

### Option 4: Use Alternative Social Platforms (FREE)

Consider using other ElizaOS plugins that don't have rate limit issues:

```typescript
// In character.ts
plugins: [
  '@elizaos/plugin-discord',   // No rate limit issues
  '@elizaos/plugin-telegram',  // More generous limits
  // '@elizaos/plugin-twitter', // Keep disabled
]
```

## Monitoring Rate Limits

### Check Current Rate Limit Status

Add this helper script to check rate limits before enabling:

```typescript
// scripts/check-twitter-limits.ts
import { TwitterApi } from 'twitter-api-v2';

async function checkRateLimits() {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET_KEY!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  });

  try {
    const rateLimit = await client.v2.rateLimitStatuses();
    console.log('Rate Limit Status:', rateLimit);
  } catch (error) {
    console.error('Failed to check rate limits:', error);
  }
}

checkRateLimits();
```

### Run Check:
```bash
cd kairos
bun run scripts/check-twitter-limits.ts
```

## Best Practices for Free Tier

### 1. **Minimize Verification Calls**
The agent was making multiple authentication verification calls. Each counts against the limit.

### 2. **Batch Operations**
Instead of responding to every mention, batch them and respond once per hour.

### 3. **Use Webhooks Instead of Polling**
If Twitter Account Activity API is available on free tier, use webhooks instead of polling.

### 4. **Cache Responses**
Cache timeline and mention data to avoid refetching.

### 5. **Manual Mode**
Use Twitter plugin only for important announcements, not automated responses.

## Recommended Configuration for Free Tier

```bash
# Minimal Twitter usage - ~10 requests/day
TWITTER_ENABLE_PLUGIN=true
TWITTER_ENABLE_POST=true             # Manual posting only
TWITTER_POST_INTERVAL_MIN=86400      # 24 hours
TWITTER_POST_INTERVAL_MAX=86400      # 24 hours
TWITTER_ENABLE_ACTIONS=false         # No auto-actions
TWITTER_AUTO_RESPOND_MENTIONS=false  # No auto-responses
TWITTER_POLL_INTERVAL=14400          # Check every 4 hours
TWITTER_MAX_INTERACTIONS_PER_RUN=0   # No interactions
TWITTER_ENABLE_REPLIES=false         # No replies
TWITTER_ENABLE_DISCOVERY=false       # No discovery
```

## Current Status

- ✅ Twitter plugin disabled in `character.ts`
- ✅ All Twitter features disabled in `.env`
- ✅ Rate limit intervals increased to maximum
- ✅ Waiting for 24-hour reset
- ⏳ Next reset: Check error logs for `x-rate-limit-reset` timestamp

## Re-enabling Twitter (After Reset)

1. Wait for rate limit reset (check timestamp in logs)
2. Update `.env` with conservative settings (Option 2 above)
3. Uncomment Twitter plugin in `src/character.ts`
4. Restart the agent
5. Monitor logs carefully for rate limit warnings

## Alternative: Create Rate Limit Wrapper

Create a wrapper service that tracks and prevents hitting limits:

```typescript
// src/services/rate-limited-twitter.ts
export class RateLimitedTwitterService {
  private requestCount = 0;
  private resetTime = Date.now() + 24 * 60 * 60 * 1000;
  private maxRequests = 20; // Leave 5 as buffer

  async makeRequest<T>(fn: () => Promise<T>): Promise<T | null> {
    if (this.requestCount >= this.maxRequests) {
      console.warn('Rate limit budget exhausted, skipping request');
      return null;
    }

    if (Date.now() > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = Date.now() + 24 * 60 * 60 * 1000;
    }

    try {
      const result = await fn();
      this.requestCount++;
      console.log(`Twitter API calls: ${this.requestCount}/${this.maxRequests}`);
      return result;
    } catch (error: any) {
      if (error.code === 429) {
        console.error('Hit rate limit! Disabling Twitter requests.');
        this.requestCount = this.maxRequests; // Disable further requests
      }
      throw error;
    }
  }
}
```

## Summary

**Immediate Fix**: Twitter plugin disabled and all features turned off to stop 429 errors.

**Long-term Strategy**:
- Use Twitter sparingly with manual posting only
- Consider alternative platforms (Discord, Telegram)
- Only upgrade to paid tier if Twitter is critical to your use case

**Cost-Benefit**: At $5,000/month, Twitter API Pro is not cost-effective unless Twitter engagement is a core business requirement.