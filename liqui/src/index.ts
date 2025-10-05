import { logger, type IAgentRuntime, type Project, type ProjectAgent } from '@elizaos/core';
// @ts-ignore - Missing type declarations in @elizaos/plugin-bootstrap distribution
import bootstrapPlugin from '@elizaos/plugin-bootstrap';
import sqlPlugin from '@elizaos/plugin-sql';
import starterPlugin from './plugin.ts';
import seiYieldDeltaPlugin from '../node_modules/@elizaos/plugin-sei-yield-delta/src/index.ts';
import { character } from './character.ts';
import { 
  pluginOverrides, 
  shouldUseAPIIntegration, 
  shouldDisableMessageBus
} from './plugin-overrides.ts';
import { configureStandaloneMode } from './runtime-wrapper.ts';
import expressConfigPlugin from './express-config-plugin.ts';
import { setupGlobalErrorHandlers, liquiErrorHandler } from './error-handler.ts';
// PostgreSQL is now handled directly by ElizaOS via DATABASE_URL environment variable

// Configure standalone mode before any runtime initialization
configureStandaloneMode();

// Setup global error handlers for Railway deployment
setupGlobalErrorHandlers();

const initCharacter = async (runtime: IAgentRuntime) => {
  logger.info('Initializing SEI DLP Liqui character');
  logger.info(`Name: ${character.name}`);
  logger.info('SEI Chain ID: 1328');
  logger.info('Optimized for 400ms finality');
  
  // No need for MessageBus interception - letting it work normally for chat
  // External connections are blocked via CENTRAL_MESSAGE_SERVER_URL
  
  // Architectural alignment status
  logger.info('🔧 Architectural Alignment Status:');
  logger.info(`📊 API Integration: ${shouldUseAPIIntegration() ? 'ENABLED' : 'DISABLED'}`);
  logger.info(`🗄️  Database: ${process.env.DATABASE_URL ? (process.env.DATABASE_URL.startsWith('postgres') ? 'PostgreSQL ENABLED' : 'SQLite ENABLED') : 'NO DATABASE'}`);
  logger.info(`🤖 Python AI Engine: ${process.env.PYTHON_AI_ENGINE_ACTIVE === 'true' ? 'ENABLED' : 'DISABLED'}`);
  logger.info(`🌐 Main Project API: ${process.env.MAIN_PROJECT_API || 'http://localhost:3001'}`);
  logger.info(`🎯 Eliza Agent URL: ${process.env.ELIZA_AGENT_URL || 'http://localhost:3000'}`);
  logger.info(`📡 MessageBus Service: ${shouldDisableMessageBus() ? 'DISABLED (Standalone Mode)' : 'ENABLED'}`);
  
  // Railway deployment status
  if (process.env.RAILWAY_ENVIRONMENT_NAME) {
    logger.info(`🚂 Railway Environment: ${process.env.RAILWAY_ENVIRONMENT_NAME}`);
    logger.info(`🔗 Railway URL: ${process.env.RAILWAY_STATIC_URL || 'Not configured'}`);
  }
  
  // Configuration warnings
  if (!shouldUseAPIIntegration()) {
    logger.warn('⚠️  API Integration disabled - plugin will use internal logic');
  }
  
  // SQL plugin handles world/server management automatically
  logger.info('✅ Using SQL plugin for world and server management');
  
  // Log error statistics if any
  setTimeout(() => {
    liquiErrorHandler.logErrorStats();
  }, 5000); // Check after 5 seconds
  
  logger.info('✅ SEI DLP Liqui character initialized with architectural alignment');
};

export const projectAgent: ProjectAgent = {
  character,
  init: async (runtime: IAgentRuntime) => {
    await initCharacter(runtime);
  },
  plugins: [
    expressConfigPlugin,      // Express config - MUST be first to configure trust proxy before server starts
    // MessageBus override removed - let it work normally for chat
    sqlPlugin,        // SQL plugin for world/server management - MUST be second
    bootstrapPlugin,
    starterPlugin,
    seiYieldDeltaPlugin,
  ].filter(Boolean), // SEI DLP plugin without Supabase adapter
};
const project: Project = {
  agents: [projectAgent],
};

// Export test suites for the test runner (only in development)
// Commented out for production builds to avoid import errors
// export { testSuites } from './__tests__/e2e';
export { character } from './character.ts';

export default project;
