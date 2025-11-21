import cron from 'node-cron';
import { loadConfig, validateConfig } from './utils/config';
import logger from './utils/logger';
import { RebalanceSubmitter } from './services/rebalanceSubmitter';

async function main() {
  logger.info('='.repeat(50));
  logger.info('Yield Delta Backend Signer Service Starting');
  logger.info('='.repeat(50));

  try {
    // Load and validate configuration
    const config = loadConfig();
    validateConfig(config);

    // Initialize the rebalance submitter
    const submitter = new RebalanceSubmitter(config);

    // Log service info
    const info = submitter.getInfo();
    logger.info('Service configuration:', info);

    // Initial health check
    const health = await submitter.checkHealth();
    logger.info('Initial health check:', health);

    if (health.service === 'unhealthy') {
      logger.error('Service is unhealthy, please check configuration and dependencies');
      process.exit(1);
    }

    // Run initial check immediately
    logger.info('Running initial rebalance check...');
    await submitter.run();

    // Schedule recurring checks
    logger.info(`Scheduling rebalance checks with cron: ${config.cronSchedule}`);

    const job = cron.schedule(config.cronSchedule, async () => {
      logger.info('Scheduled rebalance check triggered');
      await submitter.run();
    });

    // Handle graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      job.stop();
      logger.info('Cron job stopped');
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    logger.info('Backend signer service is running');
    logger.info(`Press Ctrl+C to stop`);

    // Keep the process alive
    process.stdin.resume();

  } catch (error: any) {
    logger.error('Failed to start service', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Run the service
main().catch((error) => {
  logger.error('Unhandled error in main', { error });
  process.exit(1);
});
