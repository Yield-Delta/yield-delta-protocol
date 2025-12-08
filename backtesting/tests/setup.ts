/**
 * Jest setup file for backtesting tests
 */

import { config } from 'dotenv';

// Load test environment variables
config({ path: '../.env.test' });

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  // Keep warn and error for debugging
  warn: console.warn,
  error: console.error,
};

// Set default timeout for async operations
jest.setTimeout(30000);

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock Date.now for consistent timestamps in tests
const mockNow = new Date('2024-01-01T00:00:00Z').getTime();
jest.spyOn(Date, 'now').mockReturnValue(mockNow);

// Add custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Define custom matcher types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}

export {};