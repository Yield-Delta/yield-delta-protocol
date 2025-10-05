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
      
      // Enhanced environment detection for production deployments
      const isProxyEnvironment = !!(
        process.env.RAILWAY_ENVIRONMENT_NAME ||
        process.env.RAILWAY_STATIC_URL ||
        process.env.TRUST_PROXY === 'true' ||
        process.env.EXPRESS_TRUST_PROXY === 'true' ||
        // Additional production environment indicators
        process.env.NODE_ENV === 'production' ||
        process.env.PORT ||
        process.env.VERCEL ||
        process.env.HEROKU_APP_NAME ||
        process.env.RENDER ||
        process.env.FLY_APP_NAME
      );
      
      logger.info(`🔍 Environment detection: isProxyEnvironment=${isProxyEnvironment}`);
      logger.info(`📊 Environment variables: NODE_ENV=${process.env.NODE_ENV}, PORT=${process.env.PORT}`);
      logger.info(`🚂 Railway: RAILWAY_ENVIRONMENT_NAME=${process.env.RAILWAY_ENVIRONMENT_NAME}`);
      
      if (isProxyEnvironment) {
        logger.info('🌐 Detected proxy environment (Railway/Cloudflare/production)');
        logger.info('📡 Enabling Express trust proxy for rate limiting compatibility');
        
        // Set environment variables that ElizaOS/express-rate-limit checks
        process.env.TRUST_PROXY = 'true';
        process.env.EXPRESS_TRUST_PROXY = 'true';
        
        // Enhanced Express app access with retry mechanism
        const findExpressApp = () => {
          return (
            (runtime as any).app ||
            (runtime as any).server?.app ||
            (runtime as any).expressApp ||
            (global as any).app ||
            (global as any).expressApp
          );
        };
        
        let expressApp = findExpressApp();
        
        if (expressApp && typeof expressApp.set === 'function') {
          // Configure Express trust proxy
          expressApp.set('trust proxy', true);
          logger.info('✅ Express trust proxy enabled: true (trust all proxies)');
          logger.info('📍 X-Forwarded-For headers will now be correctly processed');
        } else {
          logger.warn('⚠️  Express app not yet available - trust proxy configured via env vars');
          logger.warn('   ElizaOS will pick up TRUST_PROXY=true during server init');
          
          // Retry after a short delay in case the Express app is initialized later
          setTimeout(() => {
            expressApp = findExpressApp();
            if (expressApp && typeof expressApp.set === 'function') {
              expressApp.set('trust proxy', true);
              logger.info('✅ Express trust proxy enabled via delayed retry');
            }
          }, 1000);
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
