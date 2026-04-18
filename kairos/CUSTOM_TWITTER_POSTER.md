# Custom Minimal Twitter Poster - Technical Implementation

## Problem Statement

The ElizaOS `@elizaos/plugin-twitter` plugin was making expensive API calls that require a **paid Twitter API tier ($100+/month)**, even when configured for "post-only" mode. Specifically:

- Search API calls (discovery features)
- Timeline API calls (mention detection)
- Interaction API calls (reply handling)

These features consumed paid API credits immediately, rendering the free Twitter API tier useless.

## Solution

Created a **custom minimal Twitter poster plugin** (`kairos/src/plugins/twitter-poster-plugin.ts`) that:

1. **ONLY implements posting** - No search, timeline, or interaction features
2. **Uses twitter-api-v2 directly** - Bypasses ElizaOS plugin overhead
3. **Generates tweets locally** - Uses pre-written examples, not expensive LLM calls on each post
4. **Runs on a schedule** - Configurable via environment variables
5. **Zero paid API calls** - Completely compatible with free Twitter API tier

## Component Files

### 1. Plugin File
- **File**: `kairos/src/plugins/twitter-poster-plugin.ts`
- **Purpose**: Custom plugin that provides minimal Twitter posting
- **Functions**:
  - `initializeTwitterClient()` - Sets up twitter-api-v2 client
  - `generateTweet()` - Selects random tweet from predefined examples
  - `postTweet()` - Posts to Twitter's API v2
  - `scheduleNextTweet()` - Sets up next scheduled post

### 2. Character Configuration
- **File**: `kairos/src/character.ts`
- **Changes**:
  - Imports custom plugin
  - Disables ElizaOS twitter plugin (line with `enabled: false`)
  - Adds custom plugin conditionally when Twitter enabled
  - Removed from `clients` array (not needed)
  - Simplified character settings (removed ElizaOS Twitter config)

### 3. Environment Configuration
- **File**: `kairos/.env.example`
- **Variables**:
  - `ENABLE_TWITTER_CLIENT` - true/false gating
  - `TWITTER_API_KEY` - From Developer Portal
  - `TWITTER_API_SECRET_KEY` - From Developer Portal
  - `TWITTER_ACCESS_TOKEN` - From Developer Portal
  - `TWITTER_ACCESS_TOKEN_SECRET` - From Developer Portal
  - `TWITTER_POST_INTERVAL_MIN` - Min minutes between posts (default: 5)
  - `TWITTER_POST_INTERVAL_MAX` - Max minutes between posts (default: 10)

### 4. Documentation
- Updated: `QUICK_DEPLOY.md` - Added custom poster explanation
- Updated: `RAILWAY_DEPLOYMENT.md` - Added custom poster details

## How It Works

### Initialization Flow
1. Character loads and checks `ENABLE_TWITTER_CLIENT`
2. If enabled and credentials present, custom plugin is added to plugins array
3. Plugin initializes TwitterApi client with oauth credentials
4. Plugin schedules first tweet after random delay (5-10 min)

### Posting Flow
1. Timer fires, calls `generateTweet()`
2. Tweet selected from predefined examples
3. `postTweet()` sends via twitter-api-v2 `v2.tweet()` method
4. On success, schedules next tweet in 5-10 minutes
5. On failure (402 credits depleted, 401 auth error), logs and retries

### Tweet Generation
Currently uses pre-written examples about Yield Delta vaults:
- "Automated yield optimization..." (7% APY Delta Neutral)
- "Most protocols hide..." (transparency focus)
- "Behind the scenes..." (automation focus)
- "Why SEI?" (blockchain benefits)
- "Testing yields on testnet..." (testnet focus)

**Future Enhancement**: Could integrate with character LLM for dynamic content, but would need to balance LLM costs vs. keeping it simple.

## Configuration in Railway

When deploying to Railway, set these environment variables:

```env
ENABLE_TWITTER_CLIENT=true
TWITTER_API_KEY=<your-api-key>
TWITTER_API_SECRET_KEY=<your-api-secret>
TWITTER_ACCESS_TOKEN=<your-access-token>
TWITTER_ACCESS_TOKEN_SECRET=<your-access-secret>
TWITTER_POST_INTERVAL_MIN=5
TWITTER_POST_INTERVAL_MAX=10
```

## Cost Analysis

| Approach | Cost | API Tier | Author |
|----------|------|----------|--------|
| ElizaOS plugin with interactions | $100+/month | Paid tier | ElizaOS |
| Custom minimal poster | $0 | Free tier | Custom |
| No Twitter | $0 | None | N/A |

## Known Limitations

1. **Fixed tweet examples** - Not dynamically generated per market conditions
2. **No interactions** - Cannot reply to mentions or engage with followers
3. **No search** - Cannot monitor a hashtag or discover users to reply to
4. **No timeline** - Cannot analyze trending topics

These are acceptable trade-offs for free-tier operation.

## Testing the Implementation

### Local Test
```bash
# Set local .env
ENABLE_TWITTER_CLIENT=true
TWITTER_API_KEY=...
# etc.

# Run locally
cd kairos
bun run dev

# Should see: "[TwitterPoster] Initializing minimal Twitter poster..."
# Then: "[TwitterPoster] ✅ Service started"
# Then: "[TwitterPoster] Next tweet scheduled in X minutes"
```

### Railway Test
1. Deploy to Railway with `ENABLE_TWITTER_CLIENT=true` + credentials
2. Check logs for Twitter initialization messages
3. Wait for scheduled tweet (5-10 minutes)
4. Verify tweet appears on @YieldDelta Twitter

## Future Improvements

1. Store tweet generation history to avoid duplicates
2. Add vault APY data to tweets for dynamic content
3. Monitor mentions for replies (if upgrading to paid tier)
4. Add rate-limiting if posting too frequently
5. Integrate with news/price feeds for trending tweets

## Rollback Plan

To switch back to ElizaOS plugin (if paid Twitter tier is available):
1. Change `enabled: false` to `enabled: true` in character.ts Twitter plugin line
2. Remove custom plugin from character.ts
3. Redeploy

To disable Twitter entirely:
1. Set `ENABLE_TWITTER_CLIENT=false`
2. Redeploy (plugin won't initialize)
