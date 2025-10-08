/**
 * Server Configuration for Railway Deployment
 * Configures Express to trust Railway's proxy headers
 */

export interface ServerConfig {
  trustProxy: boolean;
  port: number;
}

export const serverConfig: ServerConfig = {
  // Trust Railway's proxy (required for correct IP detection and rate limiting)
  trustProxy: process.env.EXPRESS_TRUST_PROXY === 'true' || 
              process.env.TRUST_PROXY === 'true' || 
              process.env.RAILWAY_ENVIRONMENT !== undefined,
  
  // Port configuration
  port: parseInt(process.env.PORT || '3000', 10)
};

/**
 * Apply Express server configuration
 * Call this before starting the ElizaOS server
 */
export function configureExpress(app: any): void {
  if (serverConfig.trustProxy) {
    // Enable trust proxy for Railway deployment
    app.set('trust proxy', true);
    console.log('✅ Express trust proxy ENABLED (Railway deployment)');
  } else {
    console.log('ℹ️  Express trust proxy DISABLED (local development)');
  }
}

/**
 * Log server configuration on startup
 */
export function logServerConfig(): void {
  console.log('🚀 Server Configuration:');
  console.log(`   Port: ${serverConfig.port}`);
  console.log(`   Trust Proxy: ${serverConfig.trustProxy}`);
  console.log(`   Environment: ${process.env.RAILWAY_ENVIRONMENT || 'local'}`);
  
  if (process.env.CENTRAL_MESSAGE_SERVER_URL) {
    console.log(`   MessageBus URL: ${process.env.CENTRAL_MESSAGE_SERVER_URL}`);
  }
}
