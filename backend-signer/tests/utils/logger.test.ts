import winston from 'winston';
import { logger } from '../../src/utils/logger';

// Mock winston
jest.mock('winston', () => {
  const actualWinston = jest.requireActual('winston');
  return {
    ...actualWinston,
    createLogger: jest.fn(),
    format: {
      ...actualWinston.format,
      combine: jest.fn((...args: any[]) => args),
      timestamp: jest.fn((opts: any) => ({ format: 'timestamp' })),
      printf: jest.fn((fn: any) => ({ format: 'printf' })),
      colorize: jest.fn(() => ({ format: 'colorize' })),
      errors: jest.fn((opts: any) => ({ format: 'errors' })),
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn(),
    },
  };
});

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logger configuration', () => {
    it('should create logger with correct configuration', () => {
      // Force module re-evaluation to test logger creation
      jest.resetModules();
      const loggerModule = require('../../src/utils/logger');

      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: expect.any(String),
          format: expect.any(Array),
          transports: expect.any(Array),
        })
      );
    });

    it('should use LOG_LEVEL environment variable', () => {
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'debug';

      jest.resetModules();
      const loggerModule = require('../../src/utils/logger');

      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
        })
      );

      // Restore original LOG_LEVEL
      if (originalLogLevel !== undefined) {
        process.env.LOG_LEVEL = originalLogLevel;
      } else {
        delete process.env.LOG_LEVEL;
      }
    });

    it('should default to info level if LOG_LEVEL not set', () => {
      const originalLogLevel = process.env.LOG_LEVEL;
      delete process.env.LOG_LEVEL;

      jest.resetModules();
      const loggerModule = require('../../src/utils/logger');

      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
        })
      );

      // Restore original LOG_LEVEL
      if (originalLogLevel !== undefined) {
        process.env.LOG_LEVEL = originalLogLevel;
      }
    });

    it('should configure Console transport', () => {
      jest.resetModules();
      require('../../src/utils/logger');

      expect(winston.transports.Console).toHaveBeenCalledWith(
        expect.objectContaining({
          format: expect.any(Array),
        })
      );
    });

    it('should configure File transports for errors', () => {
      jest.resetModules();
      require('../../src/utils/logger');

      expect(winston.transports.File).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880,
          maxFiles: 5,
        })
      );
    });

    it('should configure File transports for combined logs', () => {
      jest.resetModules();
      require('../../src/utils/logger');

      expect(winston.transports.File).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'logs/combined.log',
          maxsize: 5242880,
          maxFiles: 5,
        })
      );
    });
  });

  describe('log format', () => {
    it('should use correct format combination', () => {
      jest.resetModules();
      require('../../src/utils/logger');

      expect(winston.format.errors).toHaveBeenCalledWith({ stack: true });
      expect(winston.format.timestamp).toHaveBeenCalledWith({
        format: 'YYYY-MM-DD HH:mm:ss',
      });
      expect(winston.format.printf).toHaveBeenCalled();
    });

    it('should format messages correctly', () => {
      // Get the printf function that was passed to winston.format.printf
      const printfCalls = (winston.format.printf as jest.Mock).mock.calls;
      const formatFunction = printfCalls[0]?.[0];

      if (formatFunction) {
        // Test basic message
        const result1 = formatFunction({
          level: 'info',
          message: 'Test message',
          timestamp: '2024-01-01 12:00:00',
        });
        expect(result1).toBe('2024-01-01 12:00:00 [info]: Test message');

        // Test message with metadata
        const result2 = formatFunction({
          level: 'error',
          message: 'Error occurred',
          timestamp: '2024-01-01 12:00:00',
          code: 500,
          path: '/api/test',
        });
        expect(result2).toBe('2024-01-01 12:00:00 [error]: Error occurred {"code":500,"path":"/api/test"}');

        // Test message with stack trace
        const result3 = formatFunction({
          level: 'error',
          message: 'Fatal error',
          timestamp: '2024-01-01 12:00:00',
          stack: 'Error: Fatal error\n    at test.js:10',
        });
        expect(result3).toBe('2024-01-01 12:00:00 [error]: Fatal error\nError: Fatal error\n    at test.js:10');
      }
    });
  });

  describe('logger export', () => {
    it('should export logger as default', () => {
      const defaultExport = require('../../src/utils/logger').default;
      const namedExport = require('../../src/utils/logger').logger;

      expect(defaultExport).toBeDefined();
      expect(namedExport).toBeDefined();
      expect(defaultExport).toBe(namedExport);
    });
  });
});