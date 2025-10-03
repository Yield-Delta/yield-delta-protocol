import { logger, type IAgentRuntime } from '@elizaos/core';

/**
 * Runtime Wrapper for SEI DLP Liqui Agent
 * 
 * This module provides runtime interception capabilities for ElizaOS,
 * specifically to handle MessageBusService in standalone mode and
 * prevent unwanted external API connections.
 */

/**
 * Configure standalone mode to prevent external connections
 * This should be called before any runtime initialization
 */
export function configureStandaloneMode(): void {
  // Set environment variables to ensure standalone mode
  process.env.DISABLE_MESSAGE_BUS = 'true';
  process.env.MESSAGE_BUS_ENABLED = 'false';
  
  // Override central message server URL to prevent external calls
  if (!process.env.CENTRAL_MESSAGE_SERVER_URL) {
    process.env.CENTRAL_MESSAGE_SERVER_URL = 'http://localhost:9999';
  }
  
  logger.info('🔧 Standalone mode configured - MessageBus disabled for local operation');
}

/**
 * Runtime wrapper class to intercept and modify runtime behavior
 */
export class RuntimeWrapper {
  private static wrapped = false;
  
  /**
   * Wrap the runtime to intercept MessageBusService calls
   */
  static wrap(runtime: IAgentRuntime): void {
    if (this.wrapped) {
      logger.debug('Runtime already wrapped, skipping');
      return;
    }
    
    try {
      // Intercept MessageBusService if it exists
      this.interceptMessageBusService(runtime);
      
      // Mark as wrapped
      this.wrapped = true;
      logger.info('✅ Runtime wrapped successfully - MessageBus interception active');
      
    } catch (error) {
      logger.error('❌ Failed to wrap runtime:', error);
      // Don't throw - let the application continue without the wrapper
    }
  }
  
  /**
   * Intercept MessageBusService to prevent external connections
   */
  private static interceptMessageBusService(runtime: IAgentRuntime): void {
    try {
      // Check if MessageBusService should be disabled
      const isMessageBusDisabled = process.env.DISABLE_MESSAGE_BUS === 'true' || 
                                   process.env.MESSAGE_BUS_ENABLED === 'false';
      
      if (!isMessageBusDisabled) {
        logger.debug('MessageBus not disabled, skipping interception');
        return;
      }
      
      // Find and wrap MessageBusService methods
      const messageBusService = this.findMessageBusService(runtime);
      if (messageBusService) {
        this.wrapMessageBusServiceMethods(messageBusService);
        logger.info('📡 MessageBusService intercepted - external connections blocked');
      } else {
        logger.debug('MessageBusService not found in runtime, creating mock service');
        this.createMockMessageBusService(runtime);
      }
      
    } catch (error) {
      logger.warn('⚠️  MessageBusService interception failed, continuing without it:', error);
    }
  }
  
  /**
   * Find MessageBusService in the runtime
   */
  private static findMessageBusService(runtime: any): any {
    // Try different possible locations for MessageBusService
    const possiblePaths = [
      runtime.messageBusService,
      runtime.messageService,
      runtime.services?.messageBus,
      runtime.services?.messageService,
      runtime.plugins?.find((p: any) => p.name === 'MessageBusService'),
    ];
    
    for (const service of possiblePaths) {
      if (service && typeof service === 'object') {
        return service;
      }
    }
    
    return null;
  }
  
  /**
   * Wrap MessageBusService methods to prevent external calls
   */
  private static wrapMessageBusServiceMethods(service: any): void {
    const methodsToWrap = [
      'fetchAgentServers',
      'fetchChannels', 
      'connectToServer',
      'sendMessage',
      'connect',
      'initialize'
    ];
    
    methodsToWrap.forEach(methodName => {
      if (typeof service[methodName] === 'function') {
        const originalMethod = service[methodName].bind(service);
        
        service[methodName] = async (...args: any[]) => {
          logger.debug(`🚫 MessageBusService.${methodName} blocked (standalone mode)`);
          
          // Return appropriate mock responses based on method
          switch (methodName) {
            case 'fetchAgentServers':
              return { servers: [], error: null };
            case 'fetchChannels':
              return { channels: [], error: null };
            case 'connectToServer':
              return { connected: false, error: 'Standalone mode - connections disabled' };
            case 'sendMessage':
              return { sent: false, error: 'Standalone mode - messaging disabled' };
            case 'connect':
            case 'initialize':
              return { success: true, message: 'Standalone mode - mock initialization' };
            default:
              return null;
          }
        };
        
        logger.debug(`✅ Wrapped MessageBusService.${methodName}`);
      }
    });
  }
  
  /**
   * Create a mock MessageBusService if none exists
   */
  private static createMockMessageBusService(runtime: any): void {
    const mockService = {
      fetchAgentServers: async () => {
        logger.debug('🚫 MockMessageBusService.fetchAgentServers - returning empty');
        return { servers: [], error: null };
      },
      
      fetchChannels: async () => {
        logger.debug('🚫 MockMessageBusService.fetchChannels - returning empty');
        return { channels: [], error: null };
      },
      
      connectToServer: async () => {
        logger.debug('🚫 MockMessageBusService.connectToServer - blocked');
        return { connected: false, error: 'Standalone mode' };
      },
      
      sendMessage: async () => {
        logger.debug('🚫 MockMessageBusService.sendMessage - blocked');
        return { sent: false, error: 'Standalone mode' };
      },
      
      connect: async () => {
        logger.debug('🚫 MockMessageBusService.connect - mock success');
        return { success: true };
      },
      
      initialize: async () => {
        logger.debug('🚫 MockMessageBusService.initialize - mock success');
        return { success: true };
      }
    };
    
    // Try to attach the mock service to the runtime
    if (runtime.services) {
      runtime.services.messageBus = mockService;
    } else if (runtime.messageBusService === undefined) {
      runtime.messageBusService = mockService;
    }
    
    logger.info('📡 Created mock MessageBusService for standalone mode');
  }
  
  /**
   * Reset the wrapper state (for testing)
   */
  static reset(): void {
    this.wrapped = false;
  }
}

/**
 * Additional utility functions for standalone mode
 */
export const StandaloneModeUtils = {
  /**
   * Check if standalone mode is active
   */
  isStandaloneModeActive(): boolean {
    return process.env.DISABLE_MESSAGE_BUS === 'true' || 
           process.env.MESSAGE_BUS_ENABLED === 'false';
  },
  
  /**
   * Get mock server configuration for standalone mode
   */
  getMockServerConfig() {
    return {
      servers: [],
      channels: [],
      defaultServer: {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Local Standalone Server',
        url: 'http://localhost:3000',
        status: 'mock'
      }
    };
  },
  
  /**
   * Log standalone mode status
   */
  logStandaloneModeStatus(): void {
    const isStandalone = this.isStandaloneModeActive();
    const messageBusUrl = process.env.CENTRAL_MESSAGE_SERVER_URL;
    
    logger.info('🔧 Standalone Mode Status:');
    logger.info(`   Mode: ${isStandalone ? 'STANDALONE' : 'CONNECTED'}`);
    logger.info(`   MessageBus: ${isStandalone ? 'DISABLED' : 'ENABLED'}`);
    logger.info(`   Server URL: ${messageBusUrl || 'default'}`);
    
    if (isStandalone) {
      logger.info('   ✅ External connections blocked for local operation');
    }
  }
};