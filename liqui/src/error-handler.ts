import { logger } from '@elizaos/core';

/**
 * Error Handler for Liqui Agent
 * 
 * Provides comprehensive error handling and logging for common issues
 * in Railway deployment, including MessageBusService connection problems.
 */

export class LiquiErrorHandler {
  private static instance: LiquiErrorHandler;
  private errorCounts = new Map<string, number>();
  private maxErrorReports = 5; // Limit repeated error reports
  
  static getInstance(): LiquiErrorHandler {
    if (!LiquiErrorHandler.instance) {
      LiquiErrorHandler.instance = new LiquiErrorHandler();
    }
    return LiquiErrorHandler.instance;
  }
  
  /**
   * Handle MessageBusService related errors
   */
  handleMessageBusError(error: Error | string, context: string = 'Unknown'): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorKey = `messagebus:${context}`;
    
    // Track error frequency
    const count = (this.errorCounts.get(errorKey) || 0) + 1;
    this.errorCounts.set(errorKey, count);
    
    // Only log detailed error for first few occurrences
    if (count <= this.maxErrorReports) {
      logger.warn(`🚨 MessageBusService Error (${count}/${this.maxErrorReports}) in ${context}:`, errorMessage);
      
      // Provide specific guidance based on error type
      if (errorMessage.includes('Unable to connect')) {
        logger.info('💡 This is expected in standalone mode - MessageBus connections are disabled');
      } else if (errorMessage.includes('fetchParticipants')) {
        logger.info('💡 Channel participant fetching failed - agent will operate in local mode');
      } else if (errorMessage.includes('25c93c98-c9a6-416d-818d-124fb5e1e21b')) {
        logger.info('💡 External channel access blocked - this is normal for Railway deployment');
      }
      
      if (count === this.maxErrorReports) {
        logger.info(`🔇 Suppressing further MessageBusService errors in ${context} (max reports reached)`);
      }
    } else {
      // Just count silently after max reports
      logger.debug(`MessageBusService error in ${context} (suppressed, count: ${count})`);
    }
  }
  
  /**
   * Handle connection-related errors
   */
  handleConnectionError(error: Error | string, url?: string): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorKey = `connection:${url || 'unknown'}`;
    
    const count = (this.errorCounts.get(errorKey) || 0) + 1;
    this.errorCounts.set(errorKey, count);
    
    if (count <= this.maxErrorReports) {
      logger.warn(`🌐 Connection Error (${count}/${this.maxErrorReports}):`, errorMessage);
      if (url) {
        logger.info(`🔗 Attempted URL: ${url}`);
      }
      
      // Provide specific guidance
      if (url && (url.includes('127.0.0.1:9999') || url.includes('localhost:9999'))) {
        logger.info('💡 This is expected - using non-routable address to prevent external connections');
      } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
        logger.info('💡 Network connection failed - this is normal in standalone mode');
      }
    }
  }
  
  /**
   * Handle Railway-specific errors
   */
  handleRailwayError(error: Error | string, context: string = 'Railway'): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    logger.error(`🚂 Railway Deployment Error in ${context}:`, errorMessage);
    
    // Provide Railway-specific guidance
    if (errorMessage.includes('PORT')) {
      logger.info('💡 Railway PORT issue - check environment variable configuration');
    } else if (errorMessage.includes('DATABASE_URL')) {
      logger.info('💡 Railway DATABASE_URL issue - check PostgreSQL addon configuration');
    } else if (errorMessage.includes('timeout')) {
      logger.info('💡 Railway timeout - check healthcheck configuration in railway.toml');
    }
  }
  
  /**
   * Handle API integration errors
   */
  handleAPIError(error: Error | string, apiName: string, endpoint?: string): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorKey = `api:${apiName}`;
    
    const count = (this.errorCounts.get(errorKey) || 0) + 1;
    this.errorCounts.set(errorKey, count);
    
    if (count <= this.maxErrorReports) {
      logger.warn(`🔌 API Error in ${apiName} (${count}/${this.maxErrorReports}):`, errorMessage);
      if (endpoint) {
        logger.info(`🔗 Endpoint: ${endpoint}`);
      }
      
      // Provide API-specific guidance
      if (apiName.includes('Python') || apiName.includes('AI')) {
        logger.info('💡 Python AI Engine error - check AI_ENGINE_URL configuration');
      } else if (apiName.includes('Yield') || apiName.includes('DLP')) {
        logger.info('💡 Yield Delta API error - check MAIN_PROJECT_API configuration');
      }
    }
  }
  
  /**
   * Log current error statistics
   */
  logErrorStats(): void {
    if (this.errorCounts.size === 0) {
      logger.info('✅ No errors tracked');
      return;
    }
    
    logger.info('📊 Error Statistics:');
    for (const [errorType, count] of this.errorCounts.entries()) {
      logger.info(`   ${errorType}: ${count} occurrences`);
    }
  }
  
  /**
   * Reset error counters
   */
  reset(): void {
    this.errorCounts.clear();
    logger.info('🔄 Error counters reset');
  }
}

/**
 * Global error handlers for unhandled errors
 */
export function setupGlobalErrorHandlers(): void {
  const errorHandler = LiquiErrorHandler.getInstance();
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    
    if (error.message.includes('MessageBusService') || 
        error.message.includes('fetchParticipants') ||
        error.message.includes('central-channels')) {
      errorHandler.handleMessageBusError(error, 'unhandledRejection');
    } else if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
      errorHandler.handleConnectionError(error);
    } else {
      logger.error('🚨 Unhandled Promise Rejection:', error);
    }
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    if (error.message.includes('MessageBusService')) {
      errorHandler.handleMessageBusError(error, 'uncaughtException');
    } else if (error.message.includes('Railway') || error.message.includes('PORT')) {
      errorHandler.handleRailwayError(error, 'uncaughtException');
    } else {
      logger.error('🚨 Uncaught Exception:', error);
      // For non-MessageBus errors, we might want to exit
      if (!error.message.includes('MessageBus') && !error.message.includes('connect')) {
        process.exit(1);
      }
    }
  });
  
  logger.info('🛡️  Global error handlers configured for Railway deployment');
}

// Export singleton instance
export const liquiErrorHandler = LiquiErrorHandler.getInstance();