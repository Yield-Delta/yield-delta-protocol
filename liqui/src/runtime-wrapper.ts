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
  // Use a non-routable address to ensure connection failures are immediate
  process.env.CENTRAL_MESSAGE_SERVER_URL = 'http://127.0.0.1:9999';
  
  // Disable ElizaOS server auth token to prevent authentication attempts
  process.env.ELIZA_SERVER_AUTH_TOKEN = '';
  
  // Set server port to a safe local port
  if (!process.env.SERVER_PORT) {
    process.env.SERVER_PORT = '3000';
  }
  
  // Intercept fetch globally BEFORE any ElizaOS code runs
  interceptGlobalFetch();
  
  logger.info('🔧 Standalone mode configured - MessageBus disabled for local operation');
  logger.info('🚫 Central Message Server URL set to non-routable address: http://127.0.0.1:9999');
  logger.info('🔒 Global fetch interception enabled - all external MessageBus calls will be blocked');
}

/**
 * Intercept global fetch to block MessageBusService URLs immediately
 */
function interceptGlobalFetch(): void {
  const originalFetch = global.fetch;
  
  // @ts-ignore - We're intentionally overriding fetch
  global.fetch = async (url: string | URL | Request, options?: RequestInit): Promise<Response> => {
    const urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;
    
    // Block all MessageBusService-related endpoints
    if (
      urlString.includes('/api/channels') ||
      urlString.includes('/api/participants') ||
      urlString.includes('/api/servers') ||
      urlString.includes('/api/messages') ||
      urlString.includes('127.0.0.1:9999') ||
      urlString.includes('localhost:9999') ||
      urlString.includes('25c93c98-c9a6-416d-818d-124fb5e1e21b') // Known external channel ID
    ) {
      logger.debug(`🚫 Blocked fetch to MessageBus endpoint: ${urlString.substring(0, 100)}...`);
      
      // Return a mock success response immediately
      return new Response(JSON.stringify({
        success: true,
        data: [],
        participants: [],
        channels: [],
        servers: [],
        message: 'Standalone mode - operation disabled'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Allow all other fetch calls to proceed normally
    return originalFetch(url, options);
  };
  
  logger.info('✅ Global fetch intercepted - MessageBus endpoints will return mock responses');
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
      
      // Override global fetch for MessageBusService endpoints
      this.interceptFetchCalls();
      
      // Find and wrap MessageBusService methods
      const messageBusService = this.findMessageBusService(runtime);
      if (messageBusService) {
        this.wrapMessageBusServiceMethods(messageBusService);
        logger.info('📡 MessageBusService intercepted - external connections blocked');
      } else {
        logger.debug('MessageBusService not found in runtime, creating mock service');
        this.createMockMessageBusService(runtime);
      }
      
      // Also intercept any services that might be created later
      this.interceptServiceCreation(runtime);
      
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
      'fetchParticipants',  // Add the method causing the error
      'connectToServer',
      'sendMessage',
      'connect',
      'initialize',
      'joinChannel',
      'leaveChannel',
      'getChannelInfo',
      'sendToChannel'
    ];
    
    methodsToWrap.forEach(methodName => {
      if (typeof service[methodName] === 'function') {
        const originalMethod = service[methodName].bind(service);
        
        service[methodName] = async (...args: any[]) => {
          const argInfo = args.length > 0 ? JSON.stringify(args[0]).substring(0, 50) : 'no args';
          logger.debug(`🚫 MessageBusService.${methodName} blocked (standalone mode) - args: ${argInfo}`);
          
          // Return appropriate mock responses based on method
          switch (methodName) {
            case 'fetchAgentServers':
              return { servers: [], error: null, success: true };
            case 'fetchChannels':
              return { channels: [], error: null, success: true };
            case 'fetchParticipants':
              return { participants: [], error: null, success: true };
            case 'connectToServer':
              return { connected: false, error: 'Standalone mode - connections disabled' };
            case 'sendMessage':
            case 'sendToChannel':
              return { sent: false, error: 'Standalone mode - messaging disabled' };
            case 'joinChannel':
            case 'leaveChannel':
              return { success: false, error: 'Standalone mode - channel operations disabled' };
            case 'getChannelInfo':
              return { channelInfo: null, error: 'Standalone mode - channel info unavailable' };
            case 'connect':
            case 'initialize':
              return { success: true, message: 'Standalone mode - mock initialization' };
            default:
              return { success: false, error: 'Standalone mode - operation disabled' };
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
        return { servers: [], error: null, success: true };
      },
      
      fetchChannels: async () => {
        logger.debug('🚫 MockMessageBusService.fetchChannels - returning empty');
        return { channels: [], error: null, success: true };
      },
      
      fetchParticipants: async (channelId: string) => {
        logger.debug(`🚫 MockMessageBusService.fetchParticipants - blocked for channel ${channelId}`);
        return { participants: [], error: null, success: true };
      },
      
      connectToServer: async () => {
        logger.debug('🚫 MockMessageBusService.connectToServer - blocked');
        return { connected: false, error: 'Standalone mode' };
      },
      
      sendMessage: async () => {
        logger.debug('🚫 MockMessageBusService.sendMessage - blocked');
        return { sent: false, error: 'Standalone mode' };
      },
      
      sendToChannel: async () => {
        logger.debug('🚫 MockMessageBusService.sendToChannel - blocked');
        return { sent: false, error: 'Standalone mode' };
      },
      
      joinChannel: async () => {
        logger.debug('🚫 MockMessageBusService.joinChannel - blocked');
        return { success: false, error: 'Standalone mode' };
      },
      
      leaveChannel: async () => {
        logger.debug('🚫 MockMessageBusService.leaveChannel - blocked');
        return { success: false, error: 'Standalone mode' };
      },
      
      getChannelInfo: async () => {
        logger.debug('🚫 MockMessageBusService.getChannelInfo - blocked');
        return { channelInfo: null, error: 'Standalone mode' };
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
   * Intercept global fetch calls to MessageBusService endpoints
   */
  private static interceptFetchCalls(): void {
    if (!globalThis.fetch || (globalThis.fetch as any).__elizaIntercepted) {
      return;
    }
    
    const originalFetch = globalThis.fetch;
    
    globalThis.fetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      // Block MessageBusService-related endpoints
      if (url.includes('/api/messaging/') || 
          url.includes('central-channels') || 
          url.includes('central-servers') ||
          url.includes('participants') ||
          url.includes('agents/') && url.includes('/servers')) {
        
        logger.debug(`🚫 Blocked fetch to MessageBusService endpoint: ${url}`);
        
        // Return a mock response
        return new Response(JSON.stringify({
          success: false,
          error: 'Standalone mode - MessageBus endpoints disabled',
          data: { participants: [], channels: [], servers: [] }
        }), {
          status: 503,
          statusText: 'Service Unavailable - Standalone Mode',
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Allow other fetch calls to proceed normally
      return originalFetch(input, init);
    };
    
    // Mark as intercepted
    (globalThis.fetch as any).__elizaIntercepted = true;
    logger.info('🌐 Global fetch intercepted for MessageBusService endpoints');
  }
  
  /**
   * Intercept service creation to catch MessageBusService instances
   */
  private static interceptServiceCreation(runtime: any): void {
    try {
      // Intercept the runtime's service management
      if (runtime.services && typeof runtime.services === 'object') {
        const originalServices = { ...runtime.services };
        
        Object.defineProperty(runtime, 'services', {
          get() {
            return originalServices;
          },
          set(newServices) {
            if (newServices && typeof newServices === 'object') {
              // Check for MessageBusService in new services
              for (const [key, service] of Object.entries(newServices)) {
                if (key.toLowerCase().includes('messagebus') || 
                    key.toLowerCase().includes('message') ||
                    (service && typeof service === 'object' && 
                     ('fetchParticipants' in service || 'getCentralMessageServerUrl' in service))) {
                  
                  logger.debug(`🚫 Intercepting service: ${key}`);
                  RuntimeWrapper.wrapMessageBusServiceMethods(service);
                }
              }
            }
            Object.assign(originalServices, newServices);
          },
          configurable: true,
          enumerable: true
        });
      }
      
      // Also intercept if services are added via methods
      if (runtime.addService && typeof runtime.addService === 'function') {
        const originalAddService = runtime.addService.bind(runtime);
        runtime.addService = function(service: any) {
          if (service && typeof service === 'object' && 
              ('fetchParticipants' in service || 'getCentralMessageServerUrl' in service)) {
            logger.debug('🚫 Intercepting added MessageBusService');
            RuntimeWrapper.wrapMessageBusServiceMethods(service);
          }
          return originalAddService(service);
        };
      }
      
    } catch (error) {
      logger.warn('⚠️  Service creation interception failed:', error);
    }
  }
  
  /**
   * Reset the wrapper state (for testing)
   */
  static reset(): void {
    this.wrapped = false;
    
    // Reset fetch if it was intercepted
    if (globalThis.fetch && (globalThis.fetch as any).__elizaIntercepted) {
      delete (globalThis.fetch as any).__elizaIntercepted;
    }
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