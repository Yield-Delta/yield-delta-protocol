/**
 * Tests for Data Fetcher
 */

import { DataFetcher } from '../src/data-fetcher';
import { PriceData, PoolData } from '../src/types';

// Mock fetch globally
const mockFetch = global.fetch as jest.Mock;

describe('DataFetcher', () => {
  let fetcher: DataFetcher;

  beforeEach(() => {
    fetcher = new DataFetcher();
    mockFetch.mockClear();
  });

  describe('fetchPriceData', () => {
    it('should fetch price data from API', async () => {
      const mockData: PriceData[] = [
        {
          timestamp: 1704067200000,
          date: new Date('2024-01-01'),
          open: 100,
          high: 105,
          low: 95,
          close: 102,
          volume: 1000000,
        },
        {
          timestamp: 1704153600000,
          date: new Date('2024-01-02'),
          open: 102,
          high: 108,
          low: 101,
          close: 106,
          volume: 1200000,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetcher.fetchPriceData(
        'BTC',
        new Date('2024-01-01'),
        new Date('2024-01-02')
      );

      expect(result).toHaveLength(2);
      expect(result[0].close).toBe(102);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        fetcher.fetchPriceData(
          'BTC',
          new Date('2024-01-01'),
          new Date('2024-01-02')
        )
      ).rejects.toThrow('API Error');
    });

    it('should validate date range', async () => {
      const startDate = new Date('2024-01-02');
      const endDate = new Date('2024-01-01');

      await expect(
        fetcher.fetchPriceData('BTC', startDate, endDate)
      ).rejects.toThrow('Invalid date range');
    });

    it('should cache repeated requests', async () => {
      const mockData: PriceData[] = [{
        timestamp: 1704067200000,
        date: new Date('2024-01-01'),
        open: 100,
        high: 105,
        low: 95,
        close: 102,
        volume: 1000000,
      }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      // First call
      await fetcher.fetchPriceData(
        'BTC',
        new Date('2024-01-01'),
        new Date('2024-01-01')
      );

      // Second call should use cache
      await fetcher.fetchPriceData(
        'BTC',
        new Date('2024-01-01'),
        new Date('2024-01-01')
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchPoolData', () => {
    it('should fetch pool data from API', async () => {
      const mockData: PoolData[] = [
        {
          timestamp: 1704067200000,
          date: new Date('2024-01-01'),
          liquidity: 10000000,
          volumeUSD: 5000000,
          feesUSD: 15000,
          token0Price: 100,
          token1Price: 1,
          tvlUSD: 20000000,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetcher.fetchPoolData(
        '0xPoolAddress',
        new Date('2024-01-01'),
        new Date('2024-01-01')
      );

      expect(result).toHaveLength(1);
      expect(result[0].tvlUSD).toBe(20000000);
    });

    it('should handle missing pool data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await fetcher.fetchPoolData(
        '0xInvalidPool',
        new Date('2024-01-01'),
        new Date('2024-01-02')
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('generateSyntheticData', () => {
    it('should generate synthetic price data', () => {
      const data = fetcher.generateSyntheticPriceData(
        new Date('2024-01-01'),
        new Date('2024-01-07'),
        100,
        0.02
      );

      expect(data).toHaveLength(7);
      expect(data[0].open).toBe(100);
      expect(data[0].close).toBeWithinRange(90, 110);
    });

    it('should generate synthetic pool data', () => {
      const data = fetcher.generateSyntheticPoolData(
        new Date('2024-01-01'),
        new Date('2024-01-07'),
        10000000,
        5000000
      );

      expect(data).toHaveLength(7);
      expect(data[0].liquidity).toBeWithinRange(9000000, 11000000);
      expect(data[0].volumeUSD).toBeWithinRange(4000000, 6000000);
    });

    it('should respect volatility parameter', () => {
      const lowVolData = fetcher.generateSyntheticPriceData(
        new Date('2024-01-01'),
        new Date('2024-01-30'),
        100,
        0.01
      );

      const highVolData = fetcher.generateSyntheticPriceData(
        new Date('2024-01-01'),
        new Date('2024-01-30'),
        100,
        0.10
      );

      // Calculate standard deviations
      const lowVolStd = calculateStandardDeviation(lowVolData.map(d => d.close));
      const highVolStd = calculateStandardDeviation(highVolData.map(d => d.close));

      expect(highVolStd).toBeGreaterThan(lowVolStd);
    });
  });

  describe('data validation', () => {
    it('should validate price data integrity', () => {
      const validData: PriceData = {
        timestamp: Date.now(),
        date: new Date(),
        open: 100,
        high: 110,
        low: 90,
        close: 105,
        volume: 1000000,
      };

      const invalidData: PriceData = {
        timestamp: Date.now(),
        date: new Date(),
        open: 100,
        high: 110,
        low: 120, // Invalid: low > high
        close: 105,
        volume: 1000000,
      };

      expect(fetcher.validatePriceData(validData)).toBe(true);
      expect(fetcher.validatePriceData(invalidData)).toBe(false);
    });

    it('should validate pool data integrity', () => {
      const validData: PoolData = {
        timestamp: Date.now(),
        date: new Date(),
        liquidity: 10000000,
        volumeUSD: 5000000,
        feesUSD: 15000,
        token0Price: 100,
        token1Price: 1,
        tvlUSD: 20000000,
      };

      const invalidData: PoolData = {
        timestamp: Date.now(),
        date: new Date(),
        liquidity: -10000000, // Invalid: negative liquidity
        volumeUSD: 5000000,
        feesUSD: 15000,
        token0Price: 100,
        token1Price: 1,
        tvlUSD: 20000000,
      };

      expect(fetcher.validatePoolData(validData)).toBe(true);
      expect(fetcher.validatePoolData(invalidData)).toBe(false);
    });
  });

  describe('data aggregation', () => {
    it('should aggregate hourly data to daily', () => {
      const hourlyData: PriceData[] = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date('2024-01-01').getTime() + i * 3600000,
        date: new Date(new Date('2024-01-01').getTime() + i * 3600000),
        open: 100 + i,
        high: 105 + i,
        low: 95 + i,
        close: 102 + i,
        volume: 100000,
      }));

      const dailyData = fetcher.aggregateToDaily(hourlyData);

      expect(dailyData).toHaveLength(1);
      expect(dailyData[0].open).toBe(100); // First hour's open
      expect(dailyData[0].close).toBe(125); // Last hour's close
      expect(dailyData[0].high).toBe(128); // Max of all highs
      expect(dailyData[0].low).toBe(95); // Min of all lows
      expect(dailyData[0].volume).toBe(2400000); // Sum of volumes
    });

    it('should handle partial day aggregation', () => {
      const hourlyData: PriceData[] = Array.from({ length: 12 }, (_, i) => ({
        timestamp: new Date('2024-01-01').getTime() + i * 3600000,
        date: new Date(new Date('2024-01-01').getTime() + i * 3600000),
        open: 100,
        high: 105,
        low: 95,
        close: 102,
        volume: 100000,
      }));

      const dailyData = fetcher.aggregateToDaily(hourlyData);

      expect(dailyData).toHaveLength(1);
      expect(dailyData[0].volume).toBe(1200000);
    });
  });
});

// Helper function
function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}