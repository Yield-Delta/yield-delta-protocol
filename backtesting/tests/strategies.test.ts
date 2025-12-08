/**
 * Tests for Trading Strategies
 */

import { ConcentratedLiquidity } from '../src/strategies/concentrated-liquidity';
import { ConcentratedLiquidityOptimized } from '../src/strategies/concentrated-liquidity-optimized';
import { DeltaNeutral } from '../src/strategies/delta-neutral';
import { YieldFarming } from '../src/strategies/yield-farming';
import { Arbitrage } from '../src/strategies/arbitrage';
import { StableMax } from '../src/strategies/stable-max';
import { BacktestConfig, PriceData, PoolData } from '../src/types';

describe('Trading Strategies', () => {
  const defaultConfig: BacktestConfig = {
    strategy: 'concentrated-liquidity',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    initialCapital: 100000,
    rebalanceFrequency: 'daily',
    feeRate: 0.003,
    gasCosts: 10,
  };

  const mockPriceData: PriceData[] = [
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

  const mockPoolData: PoolData[] = [
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
    {
      timestamp: 1704153600000,
      date: new Date('2024-01-02'),
      liquidity: 11000000,
      volumeUSD: 5500000,
      feesUSD: 16500,
      token0Price: 106,
      token1Price: 1,
      tvlUSD: 22000000,
    },
  ];

  describe('ConcentratedLiquidity', () => {
    let strategy: ConcentratedLiquidity;

    beforeEach(() => {
      strategy = new ConcentratedLiquidity(defaultConfig);
    });

    it('should initialize with correct parameters', () => {
      expect(strategy.config).toEqual(defaultConfig);
      expect(strategy.position).toBeNull();
    });

    it('should calculate optimal range', () => {
      const { lowerPrice, upperPrice } = strategy.calculateOptimalRange(100, 0.2);

      expect(lowerPrice).toBeLessThan(100);
      expect(upperPrice).toBeGreaterThan(100);
      expect(upperPrice / lowerPrice).toBeGreaterThan(1);
    });

    it('should open position correctly', () => {
      strategy.openPosition(100, 100000, 0.2);

      expect(strategy.position).not.toBeNull();
      expect(strategy.position!.liquidity).toBeGreaterThan(0);
      expect(strategy.position!.token0Amount).toBeGreaterThan(0);
      expect(strategy.position!.token1Amount).toBeGreaterThan(0);
    });

    it('should calculate fees earned', () => {
      strategy.openPosition(100, 100000, 0.2);
      const fees = strategy.calculateFeesEarned(5000000, 0.003);

      expect(fees).toBeGreaterThan(0);
      expect(fees).toBeLessThan(15000); // Sanity check
    });

    it('should calculate impermanent loss', () => {
      strategy.openPosition(100, 100000, 0.2);
      const il = strategy.calculateImpermanentLoss(100, 110);

      expect(il).toBeLessThan(0); // IL should be negative
      expect(il).toBeGreaterThan(-0.1); // Shouldn't be more than 10%
    });

    it('should rebalance when price moves out of range', () => {
      strategy.openPosition(100, 100000, 0.2);
      const initialPosition = { ...strategy.position };

      const shouldRebalance = strategy.shouldRebalance(150);
      expect(shouldRebalance).toBe(true);

      strategy.rebalance(150, 100000);
      expect(strategy.position).not.toEqual(initialPosition);
    });

    it('should run complete backtest', () => {
      const result = strategy.backtest(mockPriceData, mockPoolData);

      expect(result.strategy).toBe('concentrated-liquidity');
      expect(result.finalValue).toBeGreaterThan(0);
      expect(result.dailyPerformance).toHaveLength(2);
      expect(result.totalFeesEarned).toBeGreaterThanOrEqual(0);
    });
  });

  describe('ConcentratedLiquidityOptimized', () => {
    let strategy: ConcentratedLiquidityOptimized;

    beforeEach(() => {
      strategy = new ConcentratedLiquidityOptimized(defaultConfig);
    });

    it('should use ML model for range optimization', () => {
      const spy = jest.spyOn(strategy, 'predictOptimalRange');
      strategy.openPosition(100, 100000, 0.2, mockPriceData);

      expect(spy).toHaveBeenCalled();
    });

    it('should adapt range based on volatility', () => {
      const lowVolRange = strategy.calculateOptimalRange(100, 0.1);
      const highVolRange = strategy.calculateOptimalRange(100, 0.5);

      const lowVolWidth = lowVolRange.upperPrice - lowVolRange.lowerPrice;
      const highVolWidth = highVolRange.upperPrice - highVolRange.lowerPrice;

      expect(highVolWidth).toBeGreaterThan(lowVolWidth);
    });

    it('should use dynamic rebalancing threshold', () => {
      strategy.openPosition(100, 100000, 0.2);

      const shouldRebalanceLow = strategy.shouldRebalance(105, 0.1);
      const shouldRebalanceHigh = strategy.shouldRebalance(105, 0.5);

      // Higher volatility should be more tolerant
      expect(shouldRebalanceLow).not.toBe(shouldRebalanceHigh);
    });
  });

  describe('DeltaNeutral', () => {
    let strategy: DeltaNeutral;

    beforeEach(() => {
      strategy = new DeltaNeutral(defaultConfig);
    });

    it('should maintain delta neutral position', () => {
      strategy.openPosition(100, 100000);

      const delta = strategy.calculateDelta(100);
      expect(Math.abs(delta)).toBeLessThan(0.01);
    });

    it('should hedge with perpetuals', () => {
      strategy.openPosition(100, 100000);
      const hedgeAmount = strategy.calculateHedgeAmount(110);

      expect(hedgeAmount).not.toBe(0);
    });

    it('should rebalance to maintain neutrality', () => {
      strategy.openPosition(100, 100000);

      // Price moves significantly
      const delta = strategy.calculateDelta(120);
      expect(Math.abs(delta)).toBeGreaterThan(0.01);

      strategy.rebalance(120, 100000);
      const newDelta = strategy.calculateDelta(120);
      expect(Math.abs(newDelta)).toBeLessThan(0.01);
    });

    it('should calculate funding costs', () => {
      strategy.openPosition(100, 100000);
      const fundingCost = strategy.calculateFundingCost(0.01, 1);

      expect(fundingCost).toBeGreaterThan(0);
    });
  });

  describe('YieldFarming', () => {
    let strategy: YieldFarming;

    beforeEach(() => {
      strategy = new YieldFarming(defaultConfig);
    });

    it('should select optimal farming pools', () => {
      const pools = [
        { apy: 0.1, tvl: 1000000, risk: 'low' },
        { apy: 0.2, tvl: 500000, risk: 'medium' },
        { apy: 0.3, tvl: 100000, risk: 'high' },
      ];

      const selected = strategy.selectPools(pools, 100000);
      expect(selected.length).toBeGreaterThan(0);
      expect(selected[0].apy).toBeGreaterThanOrEqual(0.1);
    });

    it('should compound rewards', () => {
      strategy.depositToPool(100000, 0.12);
      const beforeCompound = strategy.position.value;

      strategy.compoundRewards(30);
      const afterCompound = strategy.position.value;

      expect(afterCompound).toBeGreaterThan(beforeCompound);
    });

    it('should calculate APY with compounding', () => {
      const simpleAPY = 0.12;
      const compoundedAPY = strategy.calculateCompoundedAPY(simpleAPY, 365);

      expect(compoundedAPY).toBeGreaterThan(simpleAPY);
    });

    it('should handle multiple pool positions', () => {
      strategy.addPoolPosition('POOL1', 50000, 0.10);
      strategy.addPoolPosition('POOL2', 50000, 0.15);

      expect(strategy.positions.size).toBe(2);

      const totalValue = strategy.calculateTotalValue();
      expect(totalValue).toBe(100000);
    });
  });

  describe('Arbitrage', () => {
    let strategy: Arbitrage;

    beforeEach(() => {
      strategy = new Arbitrage(defaultConfig);
    });

    it('should identify arbitrage opportunities', () => {
      const opportunities = strategy.findOpportunities([
        { exchange: 'A', price: 100, volume: 10000 },
        { exchange: 'B', price: 102, volume: 10000 },
      ]);

      expect(opportunities.length).toBeGreaterThan(0);
      expect(opportunities[0].profit).toBeGreaterThan(0);
    });

    it('should calculate optimal trade size', () => {
      const opportunity = {
        buyExchange: 'A',
        sellExchange: 'B',
        priceDiff: 2,
        maxVolume: 10000,
      };

      const tradeSize = strategy.calculateOptimalSize(opportunity, 100000);
      expect(tradeSize).toBeGreaterThan(0);
      expect(tradeSize).toBeLessThanOrEqual(10000);
    });

    it('should account for slippage', () => {
      const grossProfit = 1000;
      const tradeSize = 10000;
      const netProfit = strategy.calculateNetProfit(grossProfit, tradeSize, 0.001);

      expect(netProfit).toBeLessThan(grossProfit);
    });

    it('should execute triangular arbitrage', () => {
      const rates = {
        'BTC/USDT': 40000,
        'ETH/USDT': 2500,
        'ETH/BTC': 0.0624, // Slight misprice
      };

      const profit = strategy.executeTriangularArbitrage(rates, 10000);
      expect(profit).toBeGreaterThanOrEqual(0);
    });
  });

  describe('StableMax', () => {
    let strategy: StableMax;

    beforeEach(() => {
      strategy = new StableMax(defaultConfig);
    });

    it('should allocate to stable yield sources', () => {
      const allocation = strategy.allocateCapital(100000, [
        { protocol: 'Aave', apy: 0.05, risk: 1 },
        { protocol: 'Compound', apy: 0.045, risk: 1 },
        { protocol: 'Anchor', apy: 0.08, risk: 2 },
      ]);

      expect(allocation.reduce((sum, a) => sum + a.amount, 0)).toBe(100000);
    });

    it('should optimize for risk-adjusted returns', () => {
      const portfolio = strategy.optimizePortfolio([
        { asset: 'USDC', apy: 0.05, volatility: 0.001 },
        { asset: 'USDT', apy: 0.055, volatility: 0.002 },
        { asset: 'DAI', apy: 0.045, volatility: 0.001 },
      ], 100000);

      expect(portfolio.expectedReturn).toBeGreaterThan(0);
      expect(portfolio.risk).toBeLessThan(0.01);
    });

    it('should handle lending/borrowing strategies', () => {
      strategy.lend('USDC', 50000, 0.05);
      strategy.borrow('USDT', 25000, 0.03);

      const netAPY = strategy.calculateNetAPY();
      expect(netAPY).toBeGreaterThan(0);
    });

    it('should implement emergency withdraw', () => {
      strategy.deposit('Protocol1', 100000, 0.05);

      const withdrawn = strategy.emergencyWithdraw();
      expect(withdrawn).toBe(100000);
      expect(strategy.positions.size).toBe(0);
    });
  });

  describe('Strategy Comparison', () => {
    it('should compare multiple strategies', () => {
      const strategies = [
        new ConcentratedLiquidity(defaultConfig),
        new DeltaNeutral(defaultConfig),
        new YieldFarming(defaultConfig),
      ];

      const results = strategies.map(s => s.backtest(mockPriceData, mockPoolData));

      // Find best performing strategy
      const bestStrategy = results.reduce((best, current) =>
        current.totalReturnPercent > best.totalReturnPercent ? current : best
      );

      expect(bestStrategy.strategy).toBeDefined();
      expect(bestStrategy.totalReturnPercent).toBeGreaterThanOrEqual(0);
    });

    it('should calculate correlation between strategies', () => {
      const strategy1Returns = [0.01, -0.02, 0.03, 0.01, -0.01];
      const strategy2Returns = [0.02, -0.01, 0.02, 0.02, -0.02];

      const correlation = calculateCorrelation(strategy1Returns, strategy2Returns);
      expect(correlation).toBeGreaterThanOrEqual(-1);
      expect(correlation).toBeLessThanOrEqual(1);
    });
  });
});

// Helper functions
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
  const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
  const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

  const correlation = (n * sumXY - sumX * sumY) /
    Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return correlation;
}