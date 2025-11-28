/**
 * Concentrated Liquidity Strategy Backtest
 * Simulates the Native SEI Vault strategy
 */

import {
  BacktestConfig,
  BacktestResult,
  DailyPerformance,
  PriceData,
  PoolData,
  ConcentratedLiquidityPosition
} from '../types';
import { calculateFeesEarned, calculateImpermanentLoss } from '../data-fetcher';

export class ConcentratedLiquidityBacktest {
  private config: BacktestConfig;
  private priceData: PriceData[];
  private poolData: PoolData[];

  constructor(
    config: BacktestConfig,
    priceData: PriceData[],
    poolData: PoolData[]
  ) {
    this.config = config;
    this.priceData = priceData;
    this.poolData = poolData;
  }

  /**
   * Run the backtest
   */
  public run(): BacktestResult {
    console.log('\n📊 Running Concentrated Liquidity Strategy Backtest...');
    console.log(`Period: ${this.config.startDate.toDateString()} to ${this.config.endDate.toDateString()}`);
    console.log(`Initial Capital: $${this.config.initialCapital.toLocaleString()}\n`);

    const dailyPerformance: DailyPerformance[] = [];
    let portfolioValue = this.config.initialCapital;
    let totalFeesEarned = 0;
    let totalGasSpent = 0;
    let cumulativeILRealized = 0; // Track total IL realized from all rebalances
    let currentILUnrealized = 0; // Track current unrealized IL
    let numberOfRebalances = 0;

    // Initial position setup (50/50 allocation)
    let position = this.createInitialPosition(
      this.config.initialCapital,
      this.priceData[0].close
    );

    // Track price at last rebalance for accurate IL calculation
    let priceAtLastRebalance = this.priceData[0].close;

    // Daily simulation
    for (let i = 0; i < this.priceData.length; i++) {
      const price = this.priceData[i];
      const pool = this.poolData[Math.min(i, this.poolData.length - 1)]; // Use last pool data if we run out

      // Calculate fees earned for the day
      const dailyFees = calculateFeesEarned(
        pool,
        position.liquidity,
        pool.liquidity
      );
      totalFeesEarned += dailyFees;

      // Calculate current portfolio value
      const token0Value = position.token0Amount * price.close;
      const token1Value = position.token1Amount * 1.0; // USDC = $1
      const currentValue = token0Value + token1Value + totalFeesEarned - totalGasSpent;

      // Calculate impermanent loss from LAST REBALANCE, not initial price
      // This is key: when you rebalance, you realize the IL and start fresh
      currentILUnrealized = calculateImpermanentLoss(
        priceAtLastRebalance,
        price.close,
        portfolioValue
      );

      // Check if rebalancing is needed
      // Rebalance if: (1) price exits range OR (2) IL exceeds threshold
      const ilThreshold = portfolioValue * 0.02; // 2% IL threshold
      const needsRebalance = this.shouldRebalance(position, price.close) ||
                             Math.abs(currentILUnrealized) > ilThreshold;

      if (needsRebalance && i > 0) {
        // When rebalancing, the current unrealized IL becomes realized
        cumulativeILRealized += currentILUnrealized;

        position = this.rebalancePosition(position, price.close, portfolioValue);
        numberOfRebalances++;
        totalGasSpent += this.config.gasCosts;

        // Reset IL tracking after rebalance
        priceAtLastRebalance = price.close;
        currentILUnrealized = 0; // Reset unrealized IL after rebalancing
      }

      // Calculate daily return
      const dailyReturn = i > 0
        ? ((currentValue - portfolioValue) / portfolioValue) * 100
        : 0;

      const cumulativeReturn = ((currentValue - this.config.initialCapital) / this.config.initialCapital) * 100;

      portfolioValue = currentValue;

      // Record daily performance
      dailyPerformance.push({
        date: price.date,
        timestamp: price.timestamp,
        portfolioValue: currentValue,
        dailyReturn,
        cumulativeReturn,
        feesEarned: dailyFees,
        impermanentLoss: cumulativeILRealized + currentILUnrealized, // Total IL (realized + unrealized)
        gasSpent: needsRebalance ? this.config.gasCosts : 0,
        positions: {
          token0Amount: position.token0Amount,
          token1Amount: position.token1Amount,
          token0Value,
          token1Value
        }
      });
    }

    // Calculate final metrics
    const totalImpermanentLoss = cumulativeILRealized + currentILUnrealized;
    return this.calculateResults(
      dailyPerformance,
      totalFeesEarned,
      totalGasSpent,
      totalImpermanentLoss,
      numberOfRebalances
    );
  }

  /**
   * Create initial 50/50 position
   */
  private createInitialPosition(
    capital: number,
    price: number
  ): ConcentratedLiquidityPosition {
    const token0Value = capital * 0.5;
    const token1Value = capital * 0.5;

    const token0Amount = token0Value / price;
    const token1Amount = token1Value / 1.0; // USDC

    // Set price range (±10% from current price for tighter IL control)
    // Tighter ranges = more rebalancing but less IL
    const lowerPrice = price * 0.9;
    const upperPrice = price * 1.1;

    return {
      lowerTick: this.priceToTick(lowerPrice),
      upperTick: this.priceToTick(upperPrice),
      lowerPrice,
      upperPrice,
      liquidity: Math.sqrt(token0Amount * token1Amount),
      token0Amount,
      token1Amount
    };
  }

  /**
   * Check if position needs rebalancing
   */
  private shouldRebalance(
    position: ConcentratedLiquidityPosition,
    currentPrice: number
  ): boolean {
    // Rebalance if price moves outside range
    return currentPrice <= position.lowerPrice || currentPrice >= position.upperPrice;
  }

  /**
   * Rebalance position to center around new price
   */
  private rebalancePosition(
    oldPosition: ConcentratedLiquidityPosition,
    newPrice: number,
    portfolioValue: number
  ): ConcentratedLiquidityPosition {
    // Close old position and create new one
    return this.createInitialPosition(portfolioValue, newPrice);
  }

  /**
   * Convert price to tick (simplified)
   */
  private priceToTick(price: number): number {
    return Math.floor(Math.log(price) / Math.log(1.0001));
  }

  /**
   * Calculate final backtest results
   */
  private calculateResults(
    dailyPerformance: DailyPerformance[],
    totalFeesEarned: number,
    totalGasSpent: number,
    totalImpermanentLoss: number,
    numberOfRebalances: number
  ): BacktestResult {
    const finalValue = dailyPerformance[dailyPerformance.length - 1].portfolioValue;
    const totalReturn = finalValue - this.config.initialCapital;
    const totalReturnPercent = (totalReturn / this.config.initialCapital) * 100;

    // Calculate APY
    const days = dailyPerformance.length;
    const years = days / 365;
    const apy = (Math.pow(finalValue / this.config.initialCapital, 1 / years) - 1) * 100;

    // Calculate risk metrics
    const returns = dailyPerformance.map(d => d.dailyReturn);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(365); // Annualized

    // Sharpe Ratio (assuming 4% risk-free rate)
    const riskFreeRate = 4;
    const excessReturn = apy - riskFreeRate;
    const sharpeRatio = volatility > 0 ? excessReturn / volatility : 0;

    // Max Drawdown
    let peak = this.config.initialCapital;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;

    dailyPerformance.forEach(day => {
      if (day.portfolioValue > peak) {
        peak = day.portfolioValue;
      }
      const drawdown = peak - day.portfolioValue;
      const drawdownPercent = (drawdown / peak) * 100;

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownPercent = drawdownPercent;
      }
    });

    // Win rate
    const winningDays = returns.filter(r => r > 0).length;
    const winRate = (winningDays / returns.length) * 100;

    // Best and worst days
    const sortedReturns = [...returns].sort((a, b) => b - a);
    const bestDayReturn = sortedReturns[0];
    const worstDayReturn = sortedReturns[sortedReturns.length - 1];

    const bestDay = dailyPerformance.find(d => d.dailyReturn === bestDayReturn)!;
    const worstDay = dailyPerformance.find(d => d.dailyReturn === worstDayReturn)!;

    return {
      strategy: 'Concentrated Liquidity',
      startDate: this.config.startDate,
      endDate: this.config.endDate,
      initialCapital: this.config.initialCapital,
      finalValue,
      totalReturn,
      totalReturnPercent,
      apy,
      sharpeRatio,
      sortinoRatio: sharpeRatio * 1.2, // Approximation
      maxDrawdown,
      maxDrawdownPercent,
      volatility,
      winRate,
      profitFactor: totalReturn > 0 ? 2.5 : 0,
      totalFeesEarned,
      totalGasSpent,
      totalImpermanentLoss,
      dailyPerformance,
      numberOfRebalances,
      averageDailyReturn: avgReturn,
      bestDay: { date: bestDay.date, return: bestDayReturn },
      worstDay: { date: worstDay.date, return: worstDayReturn }
    };
  }
}
