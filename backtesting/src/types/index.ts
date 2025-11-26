/**
 * Type definitions for backtesting framework
 */

export interface PriceData {
  timestamp: number;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PoolData {
  timestamp: number;
  date: Date;
  liquidity: number;
  volumeUSD: number;
  feesUSD: number;
  token0Price: number;
  token1Price: number;
  tvlUSD: number;
}

export interface BacktestConfig {
  strategy: 'concentrated-liquidity' | 'stable-max';
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  rebalanceFrequency: 'daily' | 'weekly' | 'on-threshold';
  feeRate: number; // Pool fee rate (e.g., 0.003 for 0.3%)
  gasCosts: number; // Estimated gas costs per rebalance
}

export interface DailyPerformance {
  date: Date;
  timestamp: number;
  portfolioValue: number;
  dailyReturn: number;
  cumulativeReturn: number;
  feesEarned: number;
  impermanentLoss: number;
  gasSpent: number;
  positions: {
    token0Amount: number;
    token1Amount: number;
    token0Value: number;
    token1Value: number;
  };
}

export interface BacktestResult {
  strategy: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  finalValue: number;
  totalReturn: number;
  totalReturnPercent: number;

  // Annualized metrics
  apy: number;
  sharpeRatio: number;
  sortinoRatio: number;

  // Risk metrics
  maxDrawdown: number;
  maxDrawdownPercent: number;
  volatility: number;

  // Performance metrics
  winRate: number;
  profitFactor: number;
  totalFeesEarned: number;
  totalGasSpent: number;
  totalImpermanentLoss: number;

  // Daily performance
  dailyPerformance: DailyPerformance[];

  // Additional stats
  numberOfRebalances: number;
  averageDailyReturn: number;
  bestDay: { date: Date; return: number };
  worstDay: { date: Date; return: number };
}

export interface ConcentratedLiquidityPosition {
  lowerTick: number;
  upperTick: number;
  lowerPrice: number;
  upperPrice: number;
  liquidity: number;
  token0Amount: number;
  token1Amount: number;
}

export interface StableYieldPosition {
  principal: number;
  accruedInterest: number;
  effectiveAPY: number;
  daysHeld: number;
}
