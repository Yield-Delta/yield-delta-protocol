/**
 * Yield Delta Protocol - Strategy Backtesting
 * Main entry point for running backtests
 */

import * as dotenv from 'dotenv';
import { fetchHistoricalPrices, fetchPoolData } from './data-fetcher';
import { ConcentratedLiquidityBacktest } from './strategies/concentrated-liquidity';
import { StableMaxBacktest } from './strategies/stable-max';
import { BacktestConfig, BacktestResult } from './types';

dotenv.config();

/**
 * Print backtest results
 */
function printResults(result: BacktestResult): void {
  console.log('\n' + '='.repeat(80));
  console.log(`📈 ${result.strategy} Strategy - Backtest Results`);
  console.log('='.repeat(80));

  console.log('\n📊 PERFORMANCE METRICS');
  console.log('-'.repeat(80));
  console.log(`Initial Capital:        $${result.initialCapital.toLocaleString()}`);
  console.log(`Final Value:            $${result.finalValue.toLocaleString()}`);
  console.log(`Total Return:           $${result.totalReturn.toLocaleString()} (${result.totalReturnPercent.toFixed(2)}%)`);
  console.log(`\n✨ APY:                  ${result.apy.toFixed(2)}%`);
  console.log(`   Average Daily Return: ${result.averageDailyReturn.toFixed(4)}%`);

  console.log('\n📉 RISK METRICS');
  console.log('-'.repeat(80));
  console.log(`Sharpe Ratio:           ${result.sharpeRatio.toFixed(2)}`);
  console.log(`Sortino Ratio:          ${result.sortinoRatio.toFixed(2)}`);
  console.log(`Volatility (Annual):    ${result.volatility.toFixed(2)}%`);
  console.log(`Max Drawdown:           $${result.maxDrawdown.toLocaleString()} (${result.maxDrawdownPercent.toFixed(2)}%)`);

  console.log('\n💰 REVENUE & COSTS');
  console.log('-'.repeat(80));
  console.log(`Total Fees Earned:      $${result.totalFeesEarned.toLocaleString()}`);
  console.log(`Total Gas Spent:        $${result.totalGasSpent.toLocaleString()}`);
  console.log(`Impermanent Loss:       $${Math.abs(result.totalImpermanentLoss).toLocaleString()}`);
  console.log(`Net Profit:             $${(result.totalFeesEarned - result.totalGasSpent - Math.abs(result.totalImpermanentLoss)).toLocaleString()}`);

  console.log('\n🎯 TRADING STATS');
  console.log('-'.repeat(80));
  console.log(`Win Rate:               ${result.winRate.toFixed(2)}%`);
  console.log(`Profit Factor:          ${result.profitFactor.toFixed(2)}`);
  console.log(`Rebalances:             ${result.numberOfRebalances}`);
  console.log(`Best Day:               ${result.bestDay.date.toDateString()} (+${result.bestDay.return.toFixed(2)}%)`);
  console.log(`Worst Day:              ${result.worstDay.date.toDateString()} (${result.worstDay.return.toFixed(2)}%)`);

  console.log('\n' + '='.repeat(80));

  // APY Validation
  const targetAPY = result.strategy === 'Concentrated Liquidity' ? 15.0 : 8.5;
  const apyDifference = result.apy - targetAPY;
  const apyMatch = Math.abs(apyDifference) < 3; // Within 3%

  console.log('\n🎯 APY VALIDATION');
  console.log('-'.repeat(80));
  console.log(`Target APY:             ${targetAPY.toFixed(2)}%`);
  console.log(`Actual APY:             ${result.apy.toFixed(2)}%`);
  console.log(`Difference:             ${apyDifference >= 0 ? '+' : ''}${apyDifference.toFixed(2)}%`);
  console.log(`Status:                 ${apyMatch ? '✅ PASS' : '⚠️  REVIEW NEEDED'}`);
  console.log('='.repeat(80) + '\n');
}

/**
 * Run backtests for both strategies
 */
async function runBacktests() {
  console.log('\n🚀 Yield Delta Protocol - Strategy Backtesting Framework');
  console.log('='.repeat(80));

  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
  const endDate = new Date();

  console.log(`\nBacktesting period: ${startDate.toDateString()} to ${endDate.toDateString()}`);
  console.log(`Duration: 90 days\n`);

  try {
    // Fetch historical data
    console.log('📥 Fetching historical data...\n');

    const seiPrices = await fetchHistoricalPrices('sei-network', 90);
    const poolData = await fetchPoolData(
      '0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565', // SEI vault address
      Math.floor(startDate.getTime() / 1000),
      Math.floor(endDate.getTime() / 1000)
    );

    // Strategy 1: Concentrated Liquidity (SEI Vault)
    const clConfig: BacktestConfig = {
      strategy: 'concentrated-liquidity',
      startDate,
      endDate,
      initialCapital: 10000,
      rebalanceFrequency: 'on-threshold',
      feeRate: 0.003,
      gasCosts: 0.50 // $0.50 per rebalance (SEI is cheap)
    };

    const clBacktest = new ConcentratedLiquidityBacktest(clConfig, seiPrices, poolData);
    const clResults = clBacktest.run();
    printResults(clResults);

    // Strategy 2: Stable Max (USDC Vault)
    const smConfig: BacktestConfig = {
      strategy: 'stable-max',
      startDate,
      endDate,
      initialCapital: 10000,
      rebalanceFrequency: 'daily',
      feeRate: 0.001,
      gasCosts: 0
    };

    const smBacktest = new StableMaxBacktest(smConfig, seiPrices);
    const smResults = smBacktest.run();
    printResults(smResults);

    // Summary comparison
    console.log('\n📊 STRATEGY COMPARISON');
    console.log('='.repeat(80));
    console.log(`Metric                   | Concentrated Liq. | Stable Max`);
    console.log('-'.repeat(80));
    console.log(`APY                      | ${clResults.apy.toFixed(2)}%           | ${smResults.apy.toFixed(2)}%`);
    console.log(`Sharpe Ratio             | ${clResults.sharpeRatio.toFixed(2)}              | ${smResults.sharpeRatio.toFixed(2)}`);
    console.log(`Max Drawdown             | ${clResults.maxDrawdownPercent.toFixed(2)}%            | ${smResults.maxDrawdownPercent.toFixed(2)}%`);
    console.log(`Win Rate                 | ${clResults.winRate.toFixed(2)}%           | ${smResults.winRate.toFixed(2)}%`);
    console.log(`Total Return             | $${clResults.totalReturn.toLocaleString()}         | $${smResults.totalReturn.toLocaleString()}`);
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error running backtests:', error);
    process.exit(1);
  }
}

// Run backtests
runBacktests().catch(console.error);
