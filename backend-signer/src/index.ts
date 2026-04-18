import http, { IncomingMessage, ServerResponse } from 'http';
import cron from 'node-cron';
import { loadConfig, validateConfig } from './utils/config';
import logger from './utils/logger';
import { RebalanceSubmitter } from './services/rebalanceSubmitter';

interface RuntimeState {
  startedAt: string;
  ready: boolean;
  lastError?: string;
}

function parsePort(value: string | undefined): number {
  const fallbackPort = 3000;
  if (!value) {
    return fallbackPort;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    logger.warn(`Invalid PORT value \"${value}\", falling back to ${fallbackPort}`);
    return fallbackPort;
  }

  return parsed;
}

function writeJson(res: ServerResponse, statusCode: number, body: Record<string, unknown>) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function healthHandler(req: IncomingMessage, res: ServerResponse, state: RuntimeState) {
  if (!req.url) {
    writeJson(res, 404, { error: 'Not found' });
    return;
  }

  const path = req.url.split('?')[0];

  if (path === '/health') {
    writeJson(res, 200, {
      status: 'ok',
      ready: state.ready,
      startedAt: state.startedAt,
      lastError: state.lastError,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (path === '/ready') {
    writeJson(res, state.ready ? 200 : 503, {
      status: state.ready ? 'ready' : 'starting',
      startedAt: state.startedAt,
      lastError: state.lastError,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  writeJson(res, 404, { error: 'Not found' });
}

async function main() {
  const state: RuntimeState = {
    startedAt: new Date().toISOString(),
    ready: false,
  };
  const port = parsePort(process.env.PORT);
  const healthServer = http.createServer((req, res) => healthHandler(req, res, state));

  healthServer.listen(port, () => {
    logger.info(`Health server listening on port ${port}`);
  });

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

    state.ready = true;

    // Handle graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      job.stop();
      logger.info('Cron job stopped');
      state.ready = false;
      healthServer.close((error) => {
        if (error) {
          logger.error('Failed to close health server cleanly', { error: error.message });
        }
        process.exit(0);
      });
      setTimeout(() => process.exit(0), 1000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    logger.info('Backend signer service is running');
    logger.info(`Press Ctrl+C to stop`);

    // Keep the process alive
    process.stdin.resume();

  } catch (error: any) {
    state.lastError = error.message;
    logger.error('Failed to start service', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Run the service
main().catch((error) => {
  logger.error('Unhandled error in main', { error });
  process.exit(1);
});
