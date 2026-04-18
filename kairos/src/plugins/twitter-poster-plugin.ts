import { Plugin, IAgentRuntime, Service } from '@elizaos/core';
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

type PostTweetResult = {
  posted: boolean;
  terminalFailure?: 'credits-depleted' | 'unauthorized';
  transientFailure?: boolean;
};

let twitterClient: TwitterApi | null = null;
let lastPostTime = 0;

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
): Promise<PostTweetResult> {
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
    return { posted: false, terminalFailure: 'unauthorized' };
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
      return { posted: true };
    }

    runtime.logger.warn('[TwitterPoster] No tweet ID in response');
    return { posted: false };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    runtime.logger.error(`[TwitterPoster] Failed to post: ${errorMsg}`);
    const normalizedError = errorMsg.toLowerCase();

    // Check for specific API errors
    if (errorMsg.includes('402')) {
      runtime.logger.error(
        '[TwitterPoster] 402 Credits Depleted - Twitter paid tier required'
      );
      return { posted: false, terminalFailure: 'credits-depleted' };
    } else if (errorMsg.includes('401')) {
      runtime.logger.error('[TwitterPoster] 401 Unauthorized - Check credentials');
      return { posted: false, terminalFailure: 'unauthorized' };
    }

    const isRateLimited = normalizedError.includes('429');
    const isServerError = /\b5\d\d\b/.test(normalizedError);
    const isNetworkError =
      normalizedError.includes('timeout') ||
      normalizedError.includes('econnreset') ||
      normalizedError.includes('eai_again') ||
      normalizedError.includes('network');

    if (isRateLimited || isServerError || isNetworkError) {
      runtime.logger.warn('[TwitterPoster] Transient Twitter API failure detected, retry with backoff');
      return { posted: false, transientFailure: true };
    }

    return { posted: false };
  }
}

export class TwitterPosterService extends Service {
  static serviceType = 'twitter-poster';

  get capabilityDescription(): string {
    return 'Posts scheduled updates to Twitter/X using a minimal post-only flow';
  }

  private timeoutHandle: NodeJS.Timeout | null = null;
  private stopped = false;
  private transientBackoffAttempts = 0;
  private nextDelayOverrideMs: number | null = null;

  private stopDueToTerminalFailure(reason: PostTweetResult['terminalFailure']): void {
    if (!reason || this.stopped) {
      return;
    }

    const reasonMessage =
      reason === 'credits-depleted'
        ? 'Twitter API credits depleted or paid tier required'
        : 'Twitter credentials are invalid or missing';

    this.runtime.logger.error(
      `[TwitterPoster] Disabling scheduled posts due to terminal failure: ${reasonMessage}`
    );

    this.stopped = true;
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
  }

  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }

  private shouldUseBackoff(): boolean {
    return (process.env.TWITTER_ENABLE_BACKOFF || 'true').toLowerCase() === 'true';
  }

  private registerSuccessfulPost(): void {
    this.transientBackoffAttempts = 0;
    this.nextDelayOverrideMs = null;
  }

  private registerTransientFailure(): void {
    if (!this.shouldUseBackoff()) {
      this.nextDelayOverrideMs = null;
      return;
    }

    this.transientBackoffAttempts += 1;

    const baseBackoffSec = parseInt(process.env.TWITTER_BACKOFF_BASE_SEC || '60', 10);
    const maxBackoffSec = parseInt(process.env.TWITTER_BACKOFF_MAX_SEC || '1800', 10);
    const exponentialBackoffSec = Math.min(
      baseBackoffSec * Math.pow(2, this.transientBackoffAttempts - 1),
      maxBackoffSec
    );
    const jitterMultiplier = 0.8 + Math.random() * 0.4;
    this.nextDelayOverrideMs = Math.round(exponentialBackoffSec * jitterMultiplier * 1000);

    this.runtime.logger.warn(
      `[TwitterPoster] Backoff attempt ${this.transientBackoffAttempts}; next retry in ${Math.round((this.nextDelayOverrideMs || 0) / 1000)} seconds`
    );
  }

  private scheduleNextTweet(): void {
    const minInterval = parseInt(process.env.TWITTER_POST_INTERVAL_MIN || '5', 10);
    const maxInterval = parseInt(process.env.TWITTER_POST_INTERVAL_MAX || '10', 10);
    const normalIntervalMs = (minInterval + Math.random() * (maxInterval - minInterval)) * 60 * 1000;
    const intervalMs = this.nextDelayOverrideMs ?? normalIntervalMs;
    const isBackoffDelay = this.nextDelayOverrideMs !== null;
    this.nextDelayOverrideMs = null;

    this.runtime.logger.info(
      isBackoffDelay
        ? `[TwitterPoster] Next retry scheduled in ${Math.round(intervalMs / 1000)} seconds (backoff mode)`
        : `[TwitterPoster] Next tweet scheduled in ${Math.round(intervalMs / 60000)} minutes`
    );

    this.timeoutHandle = setTimeout(async () => {
      if (this.stopped) {
        return;
      }

      try {
        const tweetContent = await generateTweet(this.runtime);
        const result = await postTweet(this.runtime, tweetContent);
        if (result.terminalFailure) {
          this.stopDueToTerminalFailure(result.terminalFailure);
        } else if (result.posted) {
          this.registerSuccessfulPost();
        } else if (result.transientFailure) {
          this.registerTransientFailure();
        }
      } catch (error) {
        this.runtime.logger.error('[TwitterPoster] Error in scheduled post:', error);
        this.registerTransientFailure();
      }

      if (!this.stopped) {
        this.scheduleNextTweet();
      }
    }, intervalMs);
  }

  private async postTweetNow(): Promise<void> {
    try {
      const tweetContent = await generateTweet(this.runtime);
      const result = await postTweet(this.runtime, tweetContent);
      if (result.terminalFailure) {
        this.stopDueToTerminalFailure(result.terminalFailure);
      } else if (result.posted) {
        this.registerSuccessfulPost();
      } else if (result.transientFailure) {
        this.registerTransientFailure();
      }
      if (!result.posted) {
        this.runtime.logger.warn(
          '[TwitterPoster] Startup tweet was not posted (see prior logs for details)'
        );
      }
    } catch (error) {
      this.runtime.logger.error('[TwitterPoster] Startup tweet error:', error);
      this.registerTransientFailure();
    }
  }

  private async initialize(): Promise<void> {
    const twitterEnabled = process.env.ENABLE_TWITTER_CLIENT?.toLowerCase() === 'true';
    if (!twitterEnabled) {
      this.runtime.logger.info('[TwitterPoster] Disabled (ENABLE_TWITTER_CLIENT not set)');
      return;
    }

    this.runtime.logger.info('[TwitterPoster] Initializing minimal Twitter poster...');

    const requiredEnvVars = [
      'TWITTER_API_KEY',
      'TWITTER_API_SECRET_KEY',
      'TWITTER_ACCESS_TOKEN',
      'TWITTER_ACCESS_TOKEN_SECRET',
    ];

    const missing = requiredEnvVars.filter((v) => !process.env[v]);
    if (missing.length > 0) {
      this.runtime.logger.warn(`[TwitterPoster] Missing credentials: ${missing.join(', ')}`);
      return;
    }

    this.runtime.logger.info(
      `[TwitterPoster] Posting interval configured: ${process.env.TWITTER_POST_INTERVAL_MIN || '5'}-${process.env.TWITTER_POST_INTERVAL_MAX || '10'} minutes`
    );

    const postOnStartup = (process.env.TWITTER_POST_ON_STARTUP || 'true').toLowerCase() === 'true';
    if (postOnStartup) {
      this.runtime.logger.info('[TwitterPoster] Attempting immediate startup tweet...');
      await this.postTweetNow();
    }

    if (this.stopped) {
      this.runtime.logger.warn('[TwitterPoster] Service initialization halted after terminal failure');
      return;
    }

    this.scheduleNextTweet();
    this.runtime.logger.info('[TwitterPoster] ✅ Service started');
  }

  static async start(runtime: IAgentRuntime) {
    const service = new TwitterPosterService(runtime);
    await service.initialize();
    return service;
  }

  static async stop(runtime: IAgentRuntime) {
    const service = runtime.getService(TwitterPosterService.serviceType) as
      | TwitterPosterService
      | undefined;

    if (!service) {
      return;
    }

    await service.stop();
  }

  async stop() {
    this.stopped = true;
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
    this.runtime.logger.info('[TwitterPoster] Service stopped');
  }
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
  services: [TwitterPosterService],
};

export default twitterPosterPlugin;
export { postTweet, generateTweet, TwitterPosterConfig };
