# Sentiment Analysis API Options

This document outlines potential APIs that can be integrated into the sentiment analysis feature to enhance data quality and coverage.

## Currently Integrated ✅

### 1. Alternative.me Fear & Greed Index
- **Status**: ✅ Integrated
- **Endpoint**: `https://api.alternative.me/fng/`
- **Cost**: Free, no API key required
- **Rate Limits**: 60 requests/minute
- **Data Provided**:
  - Crypto Fear & Greed Index (0-100 scale)
  - Classification (Extreme Fear, Fear, Neutral, Greed, Extreme Greed)
  - Historical data
- **Use Case**: Overall market sentiment and psychology
- **Documentation**: https://alternative.me/crypto/fear-and-greed-index/

### 2. CoinGecko API
- **Status**: ✅ Integrated
- **Endpoint**: `https://api.coingecko.com/api/v3/`
- **Cost**: Free tier available
- **Data Provided**:
  - Real-time price data
  - 24h volume and market cap
  - Historical price data for technical analysis
  - Developer activity stats
- **Use Case**: Price data, technical indicators, fundamental metrics
- **Documentation**: https://www.coingecko.com/en/api/documentation

---

## Future Integration Options

### Social Media & Community Sentiment

#### 1. LunarCrush API 🌙
- **Cost**: Free tier (50 requests/day), Paid plans start at $99/month
- **Data Provided**:
  - Social media mentions, engagement, sentiment
  - Influencer tracking
  - Social volume and trends
  - Galaxy Score™ and AltRank™
  - Real-time social data from Twitter, Reddit, YouTube, Medium, etc.
- **Pros**:
  - Comprehensive crypto-specific social analytics
  - AI-powered sentiment analysis
  - Galaxy Score provides unified social health metric
- **Cons**: Limited free tier, expensive for production use
- **Documentation**: https://lunarcrush.com/developers/docs
- **Recommended**: ⭐⭐⭐⭐⭐ (Best for crypto social sentiment)

#### 2. Twitter API v2
- **Cost**: Free tier (500k tweets/month), Paid tiers from $100/month
- **Data Provided**:
  - Real-time tweet search and streaming
  - User mentions and engagement metrics
  - Sentiment analysis (requires third-party)
- **Pros**:
  - Official Twitter data
  - High-quality, real-time information
  - Good for tracking specific influencers
- **Cons**:
  - Requires approval process
  - Sentiment analysis not built-in
  - Rate limits on free tier
- **Documentation**: https://developer.twitter.com/en/docs/twitter-api
- **Recommended**: ⭐⭐⭐ (Good but requires manual sentiment analysis)

#### 3. Reddit API (PRAW - Python Reddit API Wrapper)
- **Cost**: Free (Reddit Developer Account required)
- **Data Provided**:
  - Subreddit posts and comments
  - Upvotes, downvotes, engagement
  - Community growth metrics
- **Pros**:
  - Free and no rate limits for reasonable use
  - Good crypto community data (r/CryptoCurrency, r/SEI)
  - Rich discussion content
- **Cons**:
  - Requires sentiment analysis library (VADER, TextBlob)
  - Slower update cycle than Twitter
  - Need Python backend or API wrapper
- **Documentation**: https://www.reddit.com/dev/api/
- **Recommended**: ⭐⭐⭐⭐ (Great for community sentiment, needs NLP layer)

#### 4. Santiment API
- **Cost**: Paid only, starts at $189/month
- **Data Provided**:
  - Social volume and trends
  - On-chain metrics
  - Development activity
  - Network growth
  - Whale transactions
- **Pros**:
  - Professional-grade on-chain + social data
  - Crypto-specific metrics
  - Historical data
- **Cons**:
  - Expensive
  - No free tier
- **Documentation**: https://api.santiment.net/
- **Recommended**: ⭐⭐⭐ (Too expensive for early stage)

#### 5. Messari API
- **Cost**: Free tier available, Pro starts at $24.99/month
- **Data Provided**:
  - Asset profiles and metrics
  - News and research
  - Market data
  - On-chain metrics (Pro)
- **Pros**:
  - High-quality fundamental data
  - Research reports
  - Free tier includes basic metrics
- **Cons**:
  - Limited social sentiment data
  - On-chain data requires paid tier
- **Documentation**: https://messari.io/api/docs
- **Recommended**: ⭐⭐⭐⭐ (Good for fundamentals, not social sentiment)

### Technical Analysis Enhancement

#### 6. TradingView API (Unofficial)
- **Cost**: Free (web scraping) or use official widgets
- **Data Provided**:
  - Technical indicators (RSI, MACD, Moving Averages, etc.)
  - Chart patterns
  - Community sentiment (bullish/bearish votes)
- **Pros**:
  - Most popular technical analysis platform
  - Community sentiment data
  - Rich indicator library
- **Cons**:
  - No official public API
  - Need to use widgets or web scraping
- **Documentation**: https://www.tradingview.com/widget/
- **Recommended**: ⭐⭐ (Use for widgets only, no API)

#### 7. Binance API
- **Cost**: Free
- **Data Provided**:
  - Real-time order book data
  - Trading volume
  - Long/short ratios
  - Open interest
  - Funding rates
- **Pros**:
  - Free and reliable
  - Real-time market microstructure data
  - Good for trader sentiment (long/short ratios)
- **Cons**:
  - Limited to Binance exchange
  - Requires API key for some endpoints
- **Documentation**: https://binance-docs.github.io/apidocs/
- **Recommended**: ⭐⭐⭐⭐ (Excellent for on-chain trader sentiment)

### On-Chain Analytics

#### 8. Glassnode API
- **Cost**: Free tier (limited), Paid starts at $29/month
- **Data Provided**:
  - On-chain metrics (transaction volume, active addresses)
  - Exchange flows
  - Holder analysis
  - Network health indicators
- **Pros**:
  - Industry-leading on-chain analytics
  - Professional-grade metrics
  - Great for fundamental analysis
- **Cons**:
  - Expensive for full access
  - Limited free tier
- **Documentation**: https://docs.glassnode.com/
- **Recommended**: ⭐⭐⭐⭐ (Best on-chain data, but pricey)

#### 9. CryptoQuant API
- **Cost**: Free tier available, Paid starts at $49/month
- **Data Provided**:
  - Exchange flows
  - Miner data
  - Derivatives metrics
  - On-chain indicators
- **Pros**:
  - Good on-chain + derivatives data
  - Cheaper than Glassnode
  - Free tier includes basic metrics
- **Cons**:
  - Less comprehensive than Glassnode
  - Mainly Bitcoin-focused
- **Documentation**: https://docs.cryptoquant.com/
- **Recommended**: ⭐⭐⭐ (Good alternative to Glassnode)

### News & Events

#### 10. CryptoPanic API
- **Cost**: Free tier available, Premium $9/month
- **Data Provided**:
  - Crypto news aggregation
  - Sentiment analysis (positive/negative/neutral)
  - Social media posts
  - Community votes on news importance
- **Pros**:
  - Affordable
  - News sentiment analysis included
  - Good coverage of crypto news
- **Cons**:
  - Limited historical data on free tier
- **Documentation**: https://cryptopanic.com/developers/api/
- **Recommended**: ⭐⭐⭐⭐ (Great for news sentiment, affordable)

---

## Recommended Implementation Plan

### Phase 1: Current (Completed) ✅
- [x] Alternative.me Fear & Greed Index (free)
- [x] CoinGecko price data (free)
- [x] Technical indicators (RSI, MACD, MA) calculated locally

### Phase 2: Low-Cost Enhancement (Next Steps)
- [ ] **Reddit API** - Free community sentiment from r/SEI, r/CryptoCurrency
  - Use VADER or TextBlob for sentiment analysis
  - Track mentions, upvotes, comment sentiment
- [ ] **CryptoPanic API** - $9/month for news sentiment
  - Add news-driven sentiment metric
  - Track breaking news impact on SEI
- [ ] **Binance API** - Free long/short ratios and funding rates
  - Add trader sentiment metric
  - Track institutional vs retail positioning

### Phase 3: Premium Features (Future)
- [ ] **LunarCrush API** - $99/month for comprehensive social analytics
  - Replace basic social metrics with professional-grade data
  - Add influencer tracking
  - Galaxy Score integration
- [ ] **Messari API** - $24.99/month for research and metrics
  - Enhanced fundamental analysis
  - Access to professional research reports

### Phase 4: Advanced Analytics (Optional)
- [ ] **Glassnode API** - $29+/month for on-chain metrics
  - Advanced on-chain analytics
  - Whale wallet tracking
  - Network health scoring
- [ ] **Santiment API** - $189+/month for comprehensive data
  - Professional-grade all-in-one solution
  - Only if revenue justifies the cost

---

## Code Integration Notes

### Current Architecture
```typescript
// src/app/api/market/sentiment/route.ts
async function fetchSocialSentiment(timeframe: string) {
  // Currently: Alternative.me Fear & Greed Index
  // Future: Add Reddit, LunarCrush, etc.
}
```

### Adding New Data Sources
To add a new sentiment data source:

1. Create a new fetch function in `route.ts`:
```typescript
async function fetchRedditSentiment(timeframe: string) {
  // Implement Reddit API calls
}
```

2. Update `calculateSocialMetrics()` to include new data:
```typescript
function calculateSocialMetrics(socialData: any, redditData: any): SentimentData[] {
  // Add new metrics based on Reddit data
}
```

3. Update the main `GET()` handler:
```typescript
const redditSentiment = await fetchRedditSentiment(timeframe);
const socialMetrics = calculateSocialMetrics(socialSentiment, redditSentiment);
```

---

## API Key Management

For APIs requiring authentication, use environment variables:

```bash
# .env.local
LUNARCRUSH_API_KEY=your_api_key_here
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
CRYPTOPANIC_API_KEY=your_api_key_here
```

Access in Next.js API routes:
```typescript
const apiKey = process.env.LUNARCRUSH_API_KEY;
```

---

## Cost Analysis

### Monthly Cost Breakdown (Production)

**Minimal Setup (Phase 1 - Current)**: $0/month
- Alternative.me (free)
- CoinGecko (free)

**Enhanced Setup (Phase 2)**: ~$9/month
- Reddit API (free)
- CryptoPanic ($9/month)
- Binance API (free)

**Premium Setup (Phase 3)**: ~$134/month
- All Phase 2 features
- LunarCrush ($99/month)
- Messari ($25/month)

**Enterprise Setup (Phase 4)**: ~$353+/month
- All Phase 3 features
- Glassnode ($29/month)
- Santiment ($189/month)

---

## References

- Alternative.me: https://alternative.me/crypto/fear-and-greed-index/
- LunarCrush: https://lunarcrush.com/
- CoinGecko: https://www.coingecko.com/en/api
- Reddit API: https://www.reddit.com/dev/api/
- CryptoPanic: https://cryptopanic.com/developers/api/
- Binance: https://binance-docs.github.io/apidocs/
- Glassnode: https://glassnode.com/
- Messari: https://messari.io/api

---

**Last Updated**: 2025-11-28
**Maintained By**: Yield Delta Protocol Team
