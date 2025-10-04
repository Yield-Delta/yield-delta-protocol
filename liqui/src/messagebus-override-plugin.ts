import { logger, type Plugin, type IAgentRuntime } from '@elizaos/core';

/**
 * MessageBusService Override Plugin
 * 
 * This plugin completely disables the MessageBusService for standalone deployment.
 * It prevents external connections and provides mock responses for all MessageBus operations.
 * 
 * Designed specifically for Railway deployment where external MessageBus connections
 * are not needed and cause connectivity issues.
 */

/**
 * Mock MessageBusService implementation that prevents all external connections
 */
class StandaloneMessageBusService {
  private runtime: IAgentRuntime;
  
  constructor(runtime: IAgentRuntime) {
    this.runtime = runtime;
    logger.info(`[${runtime.character.name}] 🚫 StandaloneMessageBusService initialized - all external connections disabled`);
  }
  
  // Mock all MessageBusService methods to prevent external calls
  async fetchParticipants(channelId: string) {
    logger.debug(`[${this.runtime.character.name}] 🚫 StandaloneMessageBusService.fetchParticipants blocked for channel ${channelId}`);
    return [];
  }
  
  async fetchChannels() {
    logger.debug(`[${this.runtime.character.name}] 🚫 StandaloneMessageBusService.fetchChannels blocked`);
    return [];
  }
  
  async fetchAgentServers() {
    logger.debug(`[${this.runtime.character.name}] 🚫 StandaloneMessageBusService.fetchAgentServers blocked`);
    return { servers: [], error: null, success: true };
  }
  
  async getChannelParticipants(channelId: string) {
    logger.debug(`[${this.runtime.character.name}] 🚫 StandaloneMessageBusService.getChannelParticipants blocked for channel ${channelId}`);
    return [];
  }
  
  async connectToServer() {
    logger.debug(`[${this.runtime.character.name}] 🚫 StandaloneMessageBusService.connectToServer blocked`);
    return { connected: false, error: 'Standalone mode - connections disabled' };
  }
  
  async sendMessage() {
    logger.debug(`[${this.runtime.character.name}] 🚫 StandaloneMessageBusService.sendMessage blocked`);
    return { sent: false, error: 'Standalone mode - messaging disabled' };
  }
  
  async sendToChannel() {
    logger.debug(`[${this.runtime.character.name}] 🚫 StandaloneMessageBusService.sendToChannel blocked`);
    return { sent: false, error: 'Standalone mode - messaging disabled' };
  }
  
  async joinChannel() {
    logger.debug(`[${this.runtime.character.name}] 🚫 StandaloneMessageBusService.joinChannel blocked`);
    return { success: false, error: 'Standalone mode - channel operations disabled' };
  }
  
  async leaveChannel() {
    logger.debug(`[${this.runtime.character.name}] 🚫 StandaloneMessageBusService.leaveChannel blocked`);
    return { success: false, error: 'Standalone mode - channel operations disabled' };
  }
  
  async getChannelInfo() {
    logger.debug(`[${this.runtime.character.name}] 🚫 StandaloneMessageBusService.getChannelInfo blocked`);
    return { channelInfo: null, error: 'Standalone mode - channel info unavailable' };
  }
  
  async connect() {
    logger.debug(`[${this.runtime.character.name}] 🚫 StandaloneMessageBusService.connect mock success`);
    return { success: true, message: 'Standalone mode - mock connection' };
  }
  
  async initialize() {
    logger.debug(`[${this.runtime.character.name}] 🚫 StandaloneMessageBusService.initialize mock success`);
    return { success: true, message: 'Standalone mode - mock initialization' };
  }
  
  async stop() {
    logger.debug(`[${this.runtime.character.name}] 🚫 StandaloneMessageBusService.stop called`);
    return { success: true };
  }
  
  // Mock central message server URL to prevent external connections
  getCentralMessageServerUrl() {
    logger.debug(`[${this.runtime.character.name}] 🚫 StandaloneMessageBusService.getCentralMessageServerUrl returning localhost`);
    return 'http://127.0.0.1:9999'; // Non-routable address
  }
  
  // Mock auth headers
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Standalone-Mode': 'true'
    };
  }
  
  // Handle incoming messages (no-op in standalone mode)
  async handleIncomingMessage(data: unknown) {
    logger.debug(`[${this.runtime.character.name}] 🚫 StandaloneMessageBusService.handleIncomingMessage ignored`);
    return;
  }
  
  // Notification methods (no-op in standalone mode)
  async notifyActionStart() {
    logger.debug(`[${this.runtime.character.name}] 🚫 StandaloneMessageBusService.notifyActionStart ignored`);
    return undefined;
  }
  
  async notifyActionUpdate() {
    logger.debug(`[${this.runtime.character.name}] 🚫 StandaloneMessageBusService.notifyActionUpdate ignored`);
    return undefined;
  }
}

/**
 * Plugin that overrides MessageBusService with standalone implementation
 */
export const messageBusOverridePlugin: Plugin = {
  name: 'messageBusOverride',
  description: 'Disables MessageBusService for standalone deployment on Railway',
  
  services: [
    {
      serviceType: 'MessageBusService',
      
      initialize: async (runtime: IAgentRuntime) => {
        // Check if standalone mode is enabled
        const isStandalone = process.env.DISABLE_MESSAGE_BUS === 'true' || 
                            process.env.MESSAGE_BUS_ENABLED === 'false';
        
        if (!isStandalone) {
          logger.debug('MessageBus override plugin: Standalone mode not enabled, skipping');
          return null;
        }
        
        logger.info(`[${runtime.character.name}] 🔧 MessageBus Override Plugin: Initializing standalone mode`);
        
        // Create and register the standalone service
        const standaloneService = new StandaloneMessageBusService(runtime);
        
        // Override any existing MessageBusService in the runtime
        if (runtime.services) {
          runtime.services.MessageBusService = standaloneService;
          runtime.services.messageBus = standaloneService;
          runtime.services.messageService = standaloneService;
        }
        
        // Also set on runtime directly for backwards compatibility
        (runtime as any).messageBusService = standaloneService;
        (runtime as any).messageService = standaloneService;
        
        logger.info(`[${runtime.character.name}] ✅ MessageBus Override Plugin: Standalone MessageBusService registered`);
        
        return standaloneService;
      },
      
      start: async (runtime: IAgentRuntime) => {
        const isStandalone = process.env.DISABLE_MESSAGE_BUS === 'true' || 
                            process.env.MESSAGE_BUS_ENABLED === 'false';
        
        if (!isStandalone) {
          return null;
        }
        
        logger.info(`[${runtime.character.name}] 🚀 MessageBus Override Plugin: Starting standalone service`);
        return new StandaloneMessageBusService(runtime);
      },
      
      stop: async (runtime: IAgentRuntime) => {
        logger.info(`[${runtime.character.name}] 🛑 MessageBus Override Plugin: Stopping standalone service`);
        return;
      }
    }
  ]
};

export default messageBusOverridePlugin;