/**
 * Tests for Backtest Engine
 */

import { BacktestEngine } from '../src/index';
import { BacktestConfig, BacktestResult, PriceData, PoolData } from '../src/types';

describe('BacktestEngine', () => {
  let engine: BacktestEngine;

  const config: BacktestConfig = {
    strategy: 'concentrated-liquidity',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    initialCapital: 100000,
    rebalanceFrequency: 'daily',
    feeRate: 0.003,
    gasCosts: 10,
  };

  beforeEach(() => {
    engine = new BacktestEngine(config);
  });

  describe('initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(engine.config).toEqual(config);
      expect(engine.results).toBeNull();
    });

    it('should validate configuration', () => {
      const invalidConfig = {
        ...config,
        initialCapital: -1000,
      };

      expect(() => new BacktestEngine(invalidConfig)).toThrow('Invalid initial capital');
    });

    it('should handle invalid date ranges', () => {
      const invalidConfig = {
        ...config,
        startDate: new Date('2024-01-31'),
        endDate: new Date('2024-01-01'),
      };

      expect(() => new BacktestEngine(invalidConfig)).toThrow('Invalid date range');
    });
  });

  describe('data loading', () => {
    it('should load price data', async () => {
      const mockFetch = jest.spyOn(engine, 'fetchPriceData');
      mockFetch.mockResolvedValue(generateMockPriceData(31));

      await engine.loadData();

      expect(mockFetch).toHaveBeenCalled();
      expect(engine.priceData).toHaveLength(31);
    });

    it('should load pool data', async () => {
      const mockFetch = jest.spyOn(engine, 'fetchPoolData');
      mockFetch.mockResolvedValue(generateMockPoolData(31));

      await engine.loadData();

      expect(mockFetch).toHaveBeenCalled();
      expect(engine.poolData).toHaveLength(31);
    });

    it('should handle data loading errors', async () => {
      const mockFetch = jest.spyOn(engine, 'fetchPriceData');
      mockFetch.mockRejectedValue(new Error('API Error'));

      await expect(engine.loadData()).rejects.toThrow('API Error');
    });

    it('should cache loaded data', async () => {
      const mockFetch = jest.spyOn(engine, 'fetchPriceData');
      mockFetch.mockResolvedValue(generateMockPriceData(31));

      await engine.loadData();
      await engine.loadData(); // Second call

      expect(mockFetch).toHaveBeenCalledTimes(1); // Should use cache
    });
  });

  describe('strategy execution', () => {
    beforeEach(async () => {
      // Mock data loading
      engine.priceData = generateMockPriceData(31);
      engine.poolData = generateMockPoolData(31);
    });

    it('should execute concentrated liquidity strategy', async () => {
      const result = await engine.run();

      expect(result.strategy).toBe('concentrated-liquidity');
      expect(result.initialCapital).toBe(100000);
      expect(result.dailyPerformance).toHaveLength(31);
    });

    it('should execute delta neutral strategy', async () => {
      engine.config.strategy = 'delta-neutral';
      const result = await engine.run();

      expect(result.strategy).toBe('delta-neutral');
      expect(result.totalImpermanentLoss).toBeDefined();
    });

    it('should execute yield farming strategy', async () => {
      engine.config.strategy = 'yield-farming';
      const result = await engine.run();

      expect(result.strategy).toBe('yield-farming');
      expect(result.totalFeesEarned).toBeGreaterThanOrEqual(0);
    });

    it('should handle strategy errors gracefully', async () => {
      const mockStrategy = jest.spyOn(engine.strategy, 'execute');
      mockStrategy.mockRejectedValue(new Error('Strategy error'));

      await expect(engine.run()).rejects.toThrow('Strategy error');
    });
  });

  describe('performance metrics', () => {
    let result: BacktestResult;

    beforeEach(() => {
      result = {
        strategy: 'test',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        initialCapital: 100000,
        finalValue: 110000,
        totalReturn: 10000,
        totalReturnPercent: 10,
        apy: 120,
        sharpeRatio: 1.5,
        sortinoRatio: 2.0,
        maxDrawdown: -5000,
        maxDrawdownPercent: -5,
        volatility: 0.15,
        winRate: 0.6,
        profitFactor: 1.8,
        totalFeesEarned: 3000,
        totalGasSpent: 300,
        totalImpermanentLoss: -500,
        dailyPerformance: generateMockDailyPerformance(31),
        numberOfRebalances: 10,
        averageDailyReturn: 0.32,
        bestDay: { date: new Date('2024-01-15'), return: 5 },
        worstDay: { date: new Date('2024-01-20'), return: -3 },
      };
    });

    it('should calculate Sharpe ratio correctly', () => {
      const sharpe = engine.calculateSharpeRatio(result.dailyPerformance);
      expect(sharpe).toBeGreaterThan(-5);
      expect(sharpe).toBeLessThan(5);
    });

    it('should calculate Sortino ratio correctly', () => {
      const sortino = engine.calculateSortinoRatio(result.dailyPerformance);
      expect(sortino).toBeGreaterThanOrEqual(engine.calculateSharpeRatio(result.dailyPerformance));
    });

    it('should calculate maximum drawdown', () => {
      const maxDD = engine.calculateMaxDrawdown(result.dailyPerformance);
      expect(maxDD.value).toBeLessThanOrEqual(0);
      expect(maxDD.percent).toBeLessThanOrEqual(0);
    });

    it('should calculate win rate', () => {
      const winRate = engine.calculateWinRate(result.dailyPerformance);
      expect(winRate).toBeGreaterThanOrEqual(0);
      expect(winRate).toBeLessThanOrEqual(1);
    });

    it('should calculate profit factor', () => {
      const profitFactor = engine.calculateProfitFactor(result.dailyPerformance);
      expect(profitFactor).toBeGreaterThanOrEqual(0);
    });

    it('should calculate volatility', () => {
      const volatility = engine.calculateVolatility(result.dailyPerformance);
      expect(volatility).toBeGreaterThanOrEqual(0);
      expect(volatility).toBeLessThanOrEqual(1);
    });

    it('should calculate APY correctly', () => {
      const apy = engine.calculateAPY(100000, 110000, 31);
      expect(apy).toBeGreaterThan(0);
    });
  });

  describe('reporting', () => {
    beforeEach(async () => {
      engine.priceData = generateMockPriceData(31);
      engine.poolData = generateMockPoolData(31);
      engine.results = await engine.run();
    });

    it('should generate summary report', () => {
      const summary = engine.generateSummary();

      expect(summary).toContain('Strategy:');
      expect(summary).toContain('Total Return:');
      expect(summary).toContain('Sharpe Ratio:');
      expect(summary).toContain('Max Drawdown:');
    });

    it('should export results to JSON', () => {
      const json = engine.exportToJSON();
      const parsed = JSON.parse(json);

      expect(parsed.strategy).toBe(engine.results!.strategy);
      expect(parsed.initialCapital).toBe(100000);
    });

    it('should export results to CSV', () => {
      const csv = engine.exportToCSV();

      expect(csv).toContain('Date,Portfolio Value,Daily Return');
      expect(csv.split('\n').length).toBeGreaterThan(31);
    });

    it('should generate performance chart data', () => {
      const chartData = engine.getChartData();

      expect(chartData.labels).toHaveLength(31);
      expect(chartData.portfolioValues).toHaveLength(31);
      expect(chartData.returns).toHaveLength(31);
    });
  });

  describe('optimization', () => {
    beforeEach(() => {
      engine.priceData = generateMockPriceData(31);
      engine.poolData = generateMockPoolData(31);
    });

    it('should optimize strategy parameters', async () => {
      const paramGrid = {
        rangeMultiplier: [1.5, 2.0, 2.5],
        rebalanceThreshold: [0.05, 0.1, 0.15],
      };

      const optimal = await engine.optimizeParameters(paramGrid);

      expect(optimal.rangeMultiplier).toBeDefined();
      expect(optimal.rebalanceThreshold).toBeDefined();
      expect(optimal.bestReturn).toBeGreaterThanOrEqual(0);
    });

    it('should run walk-forward analysis', async () => {
      const results = await engine.walkForwardAnalysis(10, 5);

      expect(results).toHaveLength(4); // (31-10)/5 windows
      expect(results[0].inSampleReturn).toBeDefined();
      expect(results[0].outOfSampleReturn).toBeDefined();
    });

    it('should perform Monte Carlo simulation', async () => {
      const simResults = await engine.monteCarloSimulation(100);

      expect(simResults.runs).toHaveLength(100);
      expect(simResults.meanReturn).toBeDefined();
      expect(simResults.stdDeviation).toBeDefined();
      expect(simResults.percentiles).toBeDefined();
    });
  });

  describe('risk management', () => {
    it('should calculate Value at Risk (VaR)', () => {
      const returns = [-0.05, -0.03, -0.01, 0, 0.01, 0.02, 0.03, 0.05];
      const var95 = engine.calculateVaR(returns, 0.95);

      expect(var95).toBeLessThan(0);
      expect(var95).toBeGreaterThan(-0.06);
    });

    it('should calculate Conditional VaR (CVaR)', () => {
      const returns = [-0.05, -0.03, -0.01, 0, 0.01, 0.02, 0.03, 0.05];
      const cvar95 = engine.calculateCVaR(returns, 0.95);

      expect(cvar95).toBeLessThan(engine.calculateVaR(returns, 0.95));
    });

    it('should implement position sizing', () => {
      const size = engine.calculatePositionSize(
        100000,  // capital
        0.02,    // risk per trade
        0.05     // stop loss
      );

      expect(size).toBe(40000); // 2% risk / 5% stop = 40% position
    });

    it('should implement Kelly criterion', () => {
      const kellyFraction = engine.calculateKellyFraction(0.6, 2);
      expect(kellyFraction).toBe(0.35); // (0.6 * 2 - 0.4) / 2
    });
  });

  describe('multi-strategy portfolio', () => {
    it('should run multiple strategies simultaneously', async () => {
      const strategies = ['concentrated-liquidity', 'delta-neutral', 'yield-farming'];
      const results = await engine.runMultiStrategy(strategies, [0.4, 0.3, 0.3]);

      expect(results.strategies).toHaveLength(3);
      expect(results.combinedReturn).toBeDefined();
      expect(results.combinedSharpe).toBeDefined();
    });

    it('should optimize portfolio allocation', async () => {
      const strategies = ['concentrated-liquidity', 'delta-neutral', 'stable-max'];
      const optimal = await engine.optimizePortfolioAllocation(strategies);

      expect(optimal.weights).toHaveLength(3);
      expect(optimal.weights.reduce((sum, w) => sum + w, 0)).toBeCloseTo(1, 5);
      expect(optimal.expectedReturn).toBeGreaterThanOrEqual(0);
    });
  });
});

// Helper functions
function generateMockPriceData(days: number): PriceData[] {
  const data: PriceData[] = [];
  const startDate = new Date('2024-01-01');

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const basePrice = 100 + Math.random() * 20 - 10;
    data.push({
      timestamp: date.getTime(),
      date: date,
      open: basePrice,
      high: basePrice + Math.random() * 5,
      low: basePrice - Math.random() * 5,
      close: basePrice + Math.random() * 10 - 5,
      volume: 1000000 + Math.random() * 500000,
    });
  }

  return data;
}

function generateMockPoolData(days: number): PoolData[] {
  const data: PoolData[] = [];
  const startDate = new Date('2024-01-01');

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    data.push({
      timestamp: date.getTime(),
      date: date,
      liquidity: 10000000 + Math.random() * 2000000,
      volumeUSD: 5000000 + Math.random() * 1000000,
      feesUSD: 15000 + Math.random() * 5000,
      token0Price: 100 + Math.random() * 20 - 10,
      token1Price: 1,
      tvlUSD: 20000000 + Math.random() * 5000000,
    });
  }

  return data;
}

function generateMockDailyPerformance(days: number) {
  const performance = [];
  const startDate = new Date('2024-01-01');
  let portfolioValue = 100000;

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const dailyReturn = (Math.random() - 0.5) * 0.05;
    portfolioValue *= (1 + dailyReturn);

    performance.push({
      date: date,
      timestamp: date.getTime(),
      portfolioValue: portfolioValue,
      dailyReturn: dailyReturn,
      cumulativeReturn: (portfolioValue - 100000) / 100000,
      feesEarned: Math.random() * 100,
      impermanentLoss: -Math.random() * 50,
      gasSpent: 10,
      positions: {
        token0Amount: 500,
        token1Amount: 50000,
        token0Value: portfolioValue * 0.5,
        token1Value: portfolioValue * 0.5,
      },
    });
  }

  return performance;
}