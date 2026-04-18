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

function parsePositiveInt(value: string | undefined, fallback: number, name: string): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    logger.warn(`Invalid ${name} value \"${value}\", falling back to ${fallback}`);
    return fallback;
  }

  return parsed;
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
  const startupRetryMs = parsePositiveInt(process.env.STARTUP_RETRY_MS, 30000, 'STARTUP_RETRY_MS');
  const healthServer = http.createServer((req, res) => healthHandler(req, res, state));
  let job: ReturnType<typeof cron.schedule> | null = null;
  let isStarting = false;

  healthServer.listen(port, () => {
    logger.info(`Health server listening on port ${port}`);
  });

  logger.info('='.repeat(50));
  logger.info('Yield Delta Backend Signer Service Starting');
  logger.info('='.repeat(50));

  const startWorker = async () => {
    if (isStarting || job) {
      return;
    }

    isStarting = true;

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
        state.lastError = health.errors.join('; ') || 'Startup dependency health check failed';
        logger.warn(
          'Startup health check is unhealthy; continuing in degraded mode so the service can recover automatically',
        );
      }

      // Run initial check immediately
      logger.info('Running initial rebalance check...');
      try {
        await submitter.run();
        state.lastError = undefined;
      } catch (error: any) {
        state.lastError = error?.message || 'Initial rebalance run failed';
        logger.error('Initial rebalance run failed; service will keep running and retry on schedule', {
          error: error?.message,
        });
      }

      // Schedule recurring checks
      logger.info(`Scheduling rebalance checks with cron: ${config.cronSchedule}`);

      job = cron.schedule(config.cronSchedule, async () => {
        logger.info('Scheduled rebalance check triggered');
        try {
          await submitter.run();
          state.lastError = undefined;
        } catch (error: any) {
          state.lastError = error?.message || 'Scheduled rebalance run failed';
          logger.error('Scheduled rebalance run failed', { error: error?.message });
        }
      });

      state.ready = true;
      logger.info('Backend signer worker is running');
    } catch (error: any) {
      state.ready = false;
      state.lastError = error?.message || 'Failed to start worker';
      logger.error('Failed to start worker; retrying', {
        error: error?.message,
        stack: error?.stack,
        retryInMs: startupRetryMs,
      });
      setTimeout(() => {
        void startWorker();
      }, startupRetryMs);
    } finally {
      isStarting = false;
    }
  };

  // Handle graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    state.ready = false;
    if (job) {
      job.stop();
      job = null;
      logger.info('Cron job stopped');
    }
    healthServer.close((error) => {
      if (error) {
        logger.error('Failed to close health server cleanly', { error: error.message });
      }
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 1000);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  await startWorker();

  logger.info('Backend signer service is running');
  logger.info('Health endpoint is available at /health');

  // Keep the process alive in non-interactive container environments
  process.stdin.resume();
}

// Run the service
main().catch((error) => {
  logger.error('Unhandled error in main', { error });
  process.exit(1);
});
