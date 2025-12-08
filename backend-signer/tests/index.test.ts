import cron from 'node-cron';
import { loadConfig, validateConfig } from '../src/utils/config';
import logger from '../src/utils/logger';
import { RebalanceSubmitter } from '../src/services/rebalanceSubmitter';

// Mock dependencies
jest.mock('node-cron');
jest.mock('../src/utils/config');
jest.mock('../src/utils/logger');
jest.mock('../src/services/rebalanceSubmitter');

// Mock process methods
const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
  throw new Error(`Process.exit(${code})`);
});

const mockStdinResume = jest.spyOn(process.stdin, 'resume').mockImplementation(() => process.stdin);

describe('Index (Main)', () => {
  let mockSchedule: jest.Mock;
  let mockJob: { stop: jest.Mock };
  let mockSubmitter: any;
  let mockConfig: any;
  let processListeners: { [key: string]: Function } = {};

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    processListeners = {};

    // Setup mock config
    mockConfig = {
      cronSchedule: '*/5 * * * *',
      aiOracleAddress: '0x123',
      aiModelSignerPrivateKey: '0xabc',
      vaults: ['0xvault1'],
      aiEngineUrl: 'http://localhost:8000',
      seiRpcUrl: 'http://localhost:8545',
      seiChainId: 1329,
      minConfidenceThreshold: 80,
      requestDeadlineSeconds: 300,
      logLevel: 'info',
      aiModelVersion: 'v1.0.0',
      vaultFactoryAddress: '0x456',
    };

    // Setup mock cron job
    mockJob = {
      stop: jest.fn(),
    };

    mockSchedule = jest.fn().mockReturnValue(mockJob);
    (cron.schedule as jest.Mock) = mockSchedule;

    // Setup mock config functions
    (loadConfig as jest.Mock).mockReturnValue(mockConfig);
    (validateConfig as jest.Mock).mockImplementation(() => {});

    // Setup mock submitter
    mockSubmitter = {
      getInfo: jest.fn().mockReturnValue({
        signerAddress: '0xsigner',
        modelVersion: 'v1.0.0',
      }),
      checkHealth: jest.fn().mockResolvedValue({
        service: 'healthy',
        aiEngine: true,
        blockchain: true,
        lastCheck: new Date(),
        errors: [],
      }),
      run: jest.fn().mockResolvedValue(undefined),
    };

    (RebalanceSubmitter as jest.Mock).mockImplementation(() => mockSubmitter);

    // Mock process.on to capture listeners
    jest.spyOn(process, 'on').mockImplementation((event: string, listener: any) => {
      processListeners[event] = listener;
      return process;
    });
  });

  afterEach(() => {
    mockExit.mockClear();
    mockStdinResume.mockClear();
    jest.restoreAllMocks();
  });

  describe('successful startup', () => {
    it('should start the service successfully', async () => {
      // Import and run main
      jest.isolateModules(() => {
        require('../src/index');
      });

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify configuration was loaded and validated
      expect(loadConfig).toHaveBeenCalled();
      expect(validateConfig).toHaveBeenCalledWith(mockConfig);

      // Verify submitter was created
      expect(RebalanceSubmitter).toHaveBeenCalledWith(mockConfig);

      // Verify initial health check
      expect(mockSubmitter.checkHealth).toHaveBeenCalled();

      // Verify initial run
      expect(mockSubmitter.run).toHaveBeenCalledTimes(1);

      // Verify cron job was scheduled
      expect(cron.schedule).toHaveBeenCalledWith(
        '*/5 * * * *',
        expect.any(Function)
      );

      // Verify process.stdin.resume was called to keep process alive
      expect(mockStdinResume).toHaveBeenCalled();
    });

    it('should run scheduled cron job', async () => {
      jest.isolateModules(() => {
        require('../src/index');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      // Get the cron callback
      const cronCallback = mockSchedule.mock.calls[0][1];

      // Run the cron callback
      await cronCallback();

      // Verify submitter.run was called again
      expect(mockSubmitter.run).toHaveBeenCalledTimes(2); // Initial + cron
      expect(logger.info).toHaveBeenCalledWith('Scheduled rebalance check triggered');
    });
  });

  describe('health check failures', () => {
    it('should exit if service is unhealthy', async () => {
      mockSubmitter.checkHealth.mockResolvedValue({
        service: 'unhealthy',
        aiEngine: false,
        blockchain: false,
        lastCheck: new Date(),
        errors: ['AI Engine unreachable', 'Blockchain connection failed'],
      });

      await expect(async () => {
        jest.isolateModules(() => {
          require('../src/index');
        });
        await new Promise(resolve => setTimeout(resolve, 100));
      }).rejects.toThrow('Process.exit(1)');

      expect(logger.error).toHaveBeenCalledWith(
        'Service is unhealthy, please check configuration and dependencies'
      );
    });

    it('should continue if service is degraded', async () => {
      mockSubmitter.checkHealth.mockResolvedValue({
        service: 'degraded',
        aiEngine: true,
        blockchain: false,
        lastCheck: new Date(),
        errors: ['Blockchain connection failed'],
      });

      jest.isolateModules(() => {
        require('../src/index');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSubmitter.run).toHaveBeenCalled();
      expect(mockStdinResume).toHaveBeenCalled();
    });
  });

  describe('graceful shutdown', () => {
    it('should handle SIGINT signal', async () => {
      jest.isolateModules(() => {
        require('../src/index');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      // Trigger SIGINT
      await expect(async () => {
        await processListeners['SIGINT']();
      }).rejects.toThrow('Process.exit(0)');

      expect(logger.info).toHaveBeenCalledWith(
        'Received SIGINT, shutting down gracefully...'
      );
      expect(mockJob.stop).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Cron job stopped');
    });

    it('should handle SIGTERM signal', async () => {
      jest.isolateModules(() => {
        require('../src/index');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      // Trigger SIGTERM
      await expect(async () => {
        await processListeners['SIGTERM']();
      }).rejects.toThrow('Process.exit(0)');

      expect(logger.info).toHaveBeenCalledWith(
        'Received SIGTERM, shutting down gracefully...'
      );
      expect(mockJob.stop).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle configuration errors', async () => {
      (loadConfig as jest.Mock).mockImplementation(() => {
        throw new Error('Missing environment variable');
      });

      await expect(async () => {
        jest.isolateModules(() => {
          require('../src/index');
        });
        await new Promise(resolve => setTimeout(resolve, 100));
      }).rejects.toThrow('Process.exit(1)');

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to start service',
        expect.objectContaining({
          error: 'Missing environment variable',
        })
      );
    });

    it('should handle validation errors', async () => {
      (validateConfig as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid configuration');
      });

      await expect(async () => {
        jest.isolateModules(() => {
          require('../src/index');
        });
        await new Promise(resolve => setTimeout(resolve, 100));
      }).rejects.toThrow('Process.exit(1)');

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to start service',
        expect.objectContaining({
          error: 'Invalid configuration',
        })
      );
    });

    it('should handle submitter initialization errors', async () => {
      (RebalanceSubmitter as jest.Mock).mockImplementation(() => {
        throw new Error('Failed to initialize submitter');
      });

      await expect(async () => {
        jest.isolateModules(() => {
          require('../src/index');
        });
        await new Promise(resolve => setTimeout(resolve, 100));
      }).rejects.toThrow('Process.exit(1)');

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to start service',
        expect.objectContaining({
          error: 'Failed to initialize submitter',
        })
      );
    });

    it('should handle initial run errors', async () => {
      mockSubmitter.run.mockRejectedValue(new Error('Initial run failed'));

      await expect(async () => {
        jest.isolateModules(() => {
          require('../src/index');
        });
        await new Promise(resolve => setTimeout(resolve, 100));
      }).rejects.toThrow('Process.exit(1)');

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to start service',
        expect.objectContaining({
          error: 'Initial run failed',
        })
      );
    });
  });

  describe('logging', () => {
    it('should log startup banner', async () => {
      jest.isolateModules(() => {
        require('../src/index');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(logger.info).toHaveBeenCalledWith('='.repeat(50));
      expect(logger.info).toHaveBeenCalledWith('Yield Delta Backend Signer Service Starting');
      expect(logger.info).toHaveBeenCalledWith('Backend signer service is running');
      expect(logger.info).toHaveBeenCalledWith('Press Ctrl+C to stop');
    });

    it('should log service configuration', async () => {
      jest.isolateModules(() => {
        require('../src/index');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSubmitter.getInfo).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        'Service configuration:',
        expect.objectContaining({
          signerAddress: '0xsigner',
          modelVersion: 'v1.0.0',
        })
      );
    });
  });
});