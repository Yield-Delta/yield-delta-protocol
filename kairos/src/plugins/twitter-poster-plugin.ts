import { Plugin, IAgentRuntime, Memory, State, IMessage } from '@elizaos/core';
import { TwitterApi } from 'twitter-api-v2';
import { randomInt } from 'crypto';

/**
 * Minimal Twitter Poster Plugin
 *
 * This plugin provides basic Twitter posting functionality without
 * the expensive API calls (search, timeline, discovery, interactions)
 * that consume paid Twitter API credits.
 *
 * ONLY IMPLEMENTS:
 * - Tweet generation (via agent action)
 * - Tweet posting (no search/interactions)
 *
 * DISABLED:
 * - Search API calls
 * - Timeline API calls
 * - Interaction discovery
 * - Mention monitoring
 * - Reply handling
 */

interface TwitterPosterConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  postIntervalMin: number;
  postIntervalMax: number;
}

let twitterClient: TwitterApi | null = null;
let lastPostTime = 0;
let postScheduled = false;

/**
 * Initialize Twitter API client (read-only for posting)
 */
function initializeTwitterClient(config: TwitterPosterConfig): TwitterApi {
  if (twitterClient) {
    return twitterClient;
  }

  twitterClient = new TwitterApi({
    appKey: config.apiKey,
    appSecret: config.apiSecret,
    accessToken: config.accessToken,
    accessSecret: config.accessTokenSecret,
  });

  return twitterClient;
}

/**
 * Generate a tweet about Yield Delta Protocol vaults
 */
async function generateTweet(runtime: IAgentRuntime): Promise<string> {
  const postExamples = [
    '🚀 Yield Delta is democratizing DeFi. Our vaults give you institutional-grade strategies at retail prices.\n\n- Delta Neutral (7% APY): Protection from volatility\n- Yield Farming (12.23% APY): Maximum farming returns\n- Arbitrage (10.3% APY): Risk-free alpha capture\n\n#DeFi #SEI',

    '💰 Most protocols hide how they generate returns. We don\'t.\n\nEvery Yield Delta vault shows:\n- Exact rebalancing logic\n- Live APY performance\n- Gas optimization metrics\n- Risk scoring\n\nTransparency = Trust\n\n#OpenSourceDeFi',

    '⚙️ Behind the scenes: Our vaults rebalance automatically every hour.\n\n- 0 manual intervention needed\n- Protocol fees optimized\n- Smart contract audited\n- Ready on SEI testnet right now\n\n#BuildInPublic #DeFi',

    '🏆 Why SEI? 400ms finality = more rebalancing opportunities throughout the day.\n\nMeaning faster alpha capture and higher APY than slower blockchains.\n\nSEI is the DeFi layer built for speed.\n\n#SEI #DeFi',

    '🔬 Testing yields on testnet? We show you EXACTLY how much you\'ll earn before going live.\n\nDaily P&L tracking. Hourly rebalances. Zero surprises.\n\nJoin thousands testing Yield Delta strategies.\n\n#TestNet #DeFi',
  ];

  // Pick a random example as the base
  const baseExample = postExamples[randomInt(0, postExamples.length)];
  return baseExample;
}

/**
 * Post a tweet to Twitter using the minimal API approach
 */
async function postTweet(
  runtime: IAgentRuntime,
  content: string
): Promise<boolean> {
  const config: TwitterPosterConfig = {
    apiKey: process.env.TWITTER_API_KEY || '',
    apiSecret: process.env.TWITTER_API_SECRET_KEY || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
    postIntervalMin: parseInt(
      process.env.TWITTER_POST_INTERVAL_MIN || '5',
      10
    ),
    postIntervalMax: parseInt(
      process.env.TWITTER_POST_INTERVAL_MAX || '10',
      10
    ),
  };

  if (
    !config.apiKey ||
    !config.apiSecret ||
    !config.accessToken ||
    !config.accessTokenSecret
  ) {
    console.warn('[TwitterPoster] Missing API credentials');
    return false;
  }

  try {
    const client = initializeTwitterClient(config);
    const rwClient = client.readWrite;

    // Truncate if needed
    const maxLength = 280;
    let tweetText = content;
    if (tweetText.length > maxLength) {
      tweetText = tweetText.substring(0, maxLength - 3) + '...';
    }

    const response = await rwClient.v2.tweet(tweetText);

    if (response.data?.id) {
      runtime.logger.info(
        `[TwitterPoster] ✅ Posted tweet: ${response.data.id}`
      );
      lastPostTime = Date.now();
      return true;
    }

    runtime.logger.warn('[TwitterPoster] No tweet ID in response');
    return false;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    runtime.logger.error(`[TwitterPoster] Failed to post: ${errorMsg}`);

    // Check for specific API errors
    if (errorMsg.includes('402')) {
      runtime.logger.error(
        '[TwitterPoster] 402 Credits Depleted - Twitter paid tier required'
      );
    } else if (errorMsg.includes('401')) {
      runtime.logger.error('[TwitterPoster] 401 Unauthorized - Check credentials');
    }

    return false;
  }
}

/**
 * Schedule the next tweet
 */
function scheduleNextTweet(runtime: IAgentRuntime): void {
  const minInterval = parseInt(process.env.TWITTER_POST_INTERVAL_MIN || '5', 10);
  const maxInterval = parseInt(process.env.TWITTER_POST_INTERVAL_MAX || '10', 10);

  const intervalMs = (minInterval + Math.random() * (maxInterval - minInterval)) * 60 * 1000;

  postScheduled = true;
  runtime.logger.info(
    `[TwitterPoster] Next tweet scheduled in ${Math.round(intervalMs / 60000)} minutes`
  );

  setTimeout(async () => {
    postScheduled = false;
    try {
      const tweetContent = await generateTweet(runtime);
      await postTweet(runtime, tweetContent);
      scheduleNextTweet(runtime);
    } catch (error) {
      runtime.logger.error('[TwitterPoster] Error in scheduled post:', error);
      scheduleNextTweet(runtime);
    }
  }, intervalMs);
}

/**
 * Twitter Poster Plugin Definition
 */
const twitterPosterPlugin: Plugin = {
  name: 'twitter-poster',
  description: 'Minimal Twitter posting plugin (no paid API calls)',
  actions: [],
  evaluators: [],
  providers: [],
  services: [
    {
      name: 'twitter-poster-service',
      description: 'Service for scheduled Twitter posting',
      async initialize(runtime: IAgentRuntime) {
        if (!process.env.ENABLE_TWITTER_CLIENT?.toLowerCase() === 'true') {
          runtime.logger.info('[TwitterPoster] Disabled (ENABLE_TWITTER_CLIENT not set)');
          return;
        }

        runtime.logger.info('[TwitterPoster] Initializing minimal Twitter poster...');

        // Verify credentials
        const requiredEnvVars = [
          'TWITTER_API_KEY',
          'TWITTER_API_SECRET_KEY',
          'TWITTER_ACCESS_TOKEN',
          'TWITTER_ACCESS_TOKEN_SECRET',
        ];

        const missing = requiredEnvVars.filter((v) => !process.env[v]);
        if (missing.length > 0) {
          runtime.logger.warn(
            `[TwitterPoster] Missing credentials: ${missing.join(', ')}`
          );
          return;
        }

        // Start scheduling tweets
        scheduleNextTweet(runtime);
        runtime.logger.info('[TwitterPoster] ✅ Service started');
      },
    },
  ],
};

export default twitterPosterPlugin;
export { postTweet, generateTweet, TwitterPosterConfig };
