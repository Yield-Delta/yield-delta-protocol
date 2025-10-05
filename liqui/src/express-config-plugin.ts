/**
 * Express Configuration Plugin
 * 
 * Configures Express app for Railway deployment with proper proxy settings.
 * This plugin hooks into the ElizaOS server initialization to set trust proxy.
 */

import { Plugin, logger } from '@elizaos/core';

/**
 * Configure Express trust proxy for Railway deployment
 * This must run before the rate limiter is initialized
 */
export const expressConfigPlugin: Plugin = {
  name: 'express-config',
  description: 'Configures Express app for Railway deployment with proxy settings',
  
  actions: [],
  evaluators: [],
  providers: [],
  
  // Use init hook to configure Express before server starts
  init: async (runtime) => {
    try {
      logger.info('🔧 Configuring Express for Railway deployment...');
      
      // Railway/proxy environment detection
      const isProxyEnvironment = !!(
        process.env.RAILWAY_ENVIRONMENT_NAME ||
        process.env.RAILWAY_STATIC_URL ||
        process.env.TRUST_PROXY === 'true' ||
        process.env.EXPRESS_TRUST_PROXY === 'true'
      );
      
      if (isProxyEnvironment) {
        logger.info('🌐 Detected proxy environment (Railway/Cloudflare/etc.)');
        logger.info('📡 Enabling Express trust proxy for rate limiting compatibility');
        
        // Set environment variables that ElizaOS/express-rate-limit checks
        process.env.TRUST_PROXY = 'true';
        process.env.EXPRESS_TRUST_PROXY = 'true';
        
        // Try to access the Express app if available in runtime
        // ElizaOS may expose it during server initialization
        const expressApp = (runtime as any).app || (runtime as any).server?.app;
        
        if (expressApp && typeof expressApp.set === 'function') {
          // Configure Express trust proxy
          // Options: true (trust all), number (trust n hops), string (trust specific IPs)
          expressApp.set('trust proxy', true);
          logger.info('✅ Express trust proxy enabled: true (trust all proxies)');
          logger.info('📍 X-Forwarded-For headers will now be correctly processed');
        } else {
          logger.warn('⚠️  Express app not yet available - trust proxy configured via env vars only');
          logger.warn('   ElizaOS will pick up TRUST_PROXY=true during server init');
        }
      } else {
        logger.info('🏠 Local development mode - trust proxy not needed');
      }
      
      logger.info('✅ Express configuration complete');
    } catch (error) {
      logger.error('❌ Failed to configure Express:', error);
      // Don't throw - allow server to start even if config fails
    }
  }
};

export default expressConfigPlugin;
