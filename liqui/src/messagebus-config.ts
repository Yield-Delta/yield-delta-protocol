/**
 * MessageBus Configuration Helper
 * Validates and configures MessageBus settings for Railway deployment
 */

import { logger } from '@elizaos/core';

export interface MessageBusConfig {
  enabled: boolean;
  serverUrl: string | null;
  isValid: boolean;
  isSelfReferencing: boolean;
  warnings: string[];
}

/**
 * Validate MessageBus configuration
 */
export function validateMessageBusConfig(): MessageBusConfig {
  const config: MessageBusConfig = {
    enabled: true,
    serverUrl: process.env.CENTRAL_MESSAGE_SERVER_URL || null,
    isValid: false,
    isSelfReferencing: false,
    warnings: []
  };

  // Check if MessageBus is explicitly disabled
  if (process.env.DISABLE_MESSAGE_BUS === 'true') {
    config.enabled = false;
    config.warnings.push('MessageBus is explicitly disabled via DISABLE_MESSAGE_BUS');
    return config;
  }

  // Check if server URL is provided
  if (!config.serverUrl) {
    config.warnings.push('CENTRAL_MESSAGE_SERVER_URL is not set - MessageBus will use local-only mode');
    config.isValid = false;
    return config;
  }

  // Validate URL format
  try {
    const url = new URL(config.serverUrl);
    
    // Check protocol
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      config.warnings.push(`Invalid protocol: ${url.protocol} - must be http: or https:`);
      config.isValid = false;
    }
    
    // Check if it's self-referencing (agent URL matches MessageBus URL)
    const elizaAgentUrl = process.env.ELIZA_AGENT_URL;
    if (elizaAgentUrl) {
      try {
        const agentUrl = new URL(elizaAgentUrl);
        if (agentUrl.hostname === url.hostname) {
          config.isSelfReferencing = true;
          config.warnings.push('⚠️  CENTRAL_MESSAGE_SERVER_URL matches ELIZA_AGENT_URL - this creates a circular dependency');
          config.warnings.push('   For single-agent deployments, MessageBus should be disabled or point to a separate server');
        }
      } catch (e) {
        // Ignore invalid ELIZA_AGENT_URL
      }
    }
    
    // Check for common Railway deployment patterns
    if (url.hostname.includes('railway.app')) {
      config.warnings.push('✅ Railway deployment detected');
      
      // Check if trust proxy is set
      if (process.env.EXPRESS_TRUST_PROXY !== 'true' && process.env.TRUST_PROXY !== 'true') {
        config.warnings.push('⚠️  EXPRESS_TRUST_PROXY is not set - may cause rate limiting issues');
      }
    }
    
    config.isValid = true;
  } catch (e) {
    config.warnings.push(`Invalid URL format: ${config.serverUrl}`);
    config.warnings.push('URL must include protocol (https:// or http://)');
    config.isValid = false;
  }

  return config;
}

/**
 * Log MessageBus configuration on startup
 */
export function logMessageBusConfig(): void {
  const config = validateMessageBusConfig();
  
  logger.info('📡 MessageBus Configuration:');
  logger.info(`   Enabled: ${config.enabled}`);
  logger.info(`   Server URL: ${config.serverUrl || 'not set'}`);
  logger.info(`   Valid: ${config.isValid}`);
  
  if (config.warnings.length > 0) {
    logger.warn('⚠️  MessageBus Configuration Warnings:');
    config.warnings.forEach(warning => logger.warn(`   ${warning}`));
  }
  
  // Recommendations
  if (config.isSelfReferencing) {
    logger.warn('');
    logger.warn('🔧 RECOMMENDATION: For single-agent deployments:');
    logger.warn('   Option 1: Remove CENTRAL_MESSAGE_SERVER_URL to use local-only mode');
    logger.warn('   Option 2: Set DISABLE_MESSAGE_BUS=true to disable MessageBus entirely');
    logger.warn('   Option 3: Deploy a separate MessageBus server and point to it');
  }
  
  if (!config.isValid && config.serverUrl) {
    logger.warn('');
    logger.warn('🔧 FIX: Update your Railway environment variable:');
    logger.warn(`   CENTRAL_MESSAGE_SERVER_URL=https://your-server.up.railway.app`);
    logger.warn('   (make sure to include https:// prefix)');
  }
}

/**
 * Get recommended MessageBus configuration for single-agent deployment
 */
export function getRecommendedConfig(): Partial<Record<string, string>> {
  return {
    // For single-agent deployments, disable MessageBus
    DISABLE_MESSAGE_BUS: 'true',
    
    // Or if you need MessageBus, point to a separate server
    // CENTRAL_MESSAGE_SERVER_URL: 'https://your-messagebus-server.up.railway.app',
    
    // Enable trust proxy for Railway
    EXPRESS_TRUST_PROXY: 'true',
    TRUST_PROXY: 'true'
  };
}
