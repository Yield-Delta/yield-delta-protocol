/**
 * Test Concentrated Liquidity Optimization
 * Compare original vs optimized strategy
 */

import * as dotenv from 'dotenv';
import { fetchHistoricalPrices, fetchPoolData } from './data-fetcher';
import { ConcentratedLiquidityBacktest } from './strategies/concentrated-liquidity';
import { ConcentratedLiquidityOptimizedBacktest } from './strategies/concentrated-liquidity-optimized';
import { BacktestConfig } from './types';

dotenv.config();

async function testOptimization() {
  console.log('\n🔬 CONCENTRATED LIQUIDITY OPTIMIZATION TEST');
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

    // Config for both tests
    const config: BacktestConfig = {
      strategy: 'concentrated-liquidity',
      startDate,
      endDate,
      initialCapital: 10000,
      rebalanceFrequency: 'on-threshold',
      feeRate: 0.003,
      gasCosts: 0.50
    };

    // Test 1: Original Strategy (±20% range)
    console.log('🔴 Testing ORIGINAL Strategy (±20% range)...');
    const originalBacktest = new ConcentratedLiquidityBacktest(config, seiPrices, poolData);
    const originalResults = originalBacktest.run();

    // Test 2: Optimized Strategy (±8% range)
    console.log('\n🟢 Testing OPTIMIZED Strategy (±8% range)...');
    const optimizedBacktest = new ConcentratedLiquidityOptimizedBacktest(config, seiPrices, poolData);
    const optimizedResults = optimizedBacktest.run();

    // Comparison
    console.log('\n📊 STRATEGY COMPARISON');
    console.log('='.repeat(80));
    console.log('Metric                    | Original (±20%) | Optimized (±8%) | Improvement');
    console.log('-'.repeat(80));

    const apyDiff = optimizedResults.apy - originalResults.apy;
    const feesDiff = optimizedResults.totalFeesEarned - originalResults.totalFeesEarned;
    const ilDiff = Math.abs(optimizedResults.totalImpermanentLoss) - Math.abs(originalResults.totalImpermanentLoss);
    const gasDiff = optimizedResults.totalGasSpent - originalResults.totalGasSpent;
    const rebalanceDiff = optimizedResults.numberOfRebalances - originalResults.numberOfRebalances;

    console.log(`APY                       | ${originalResults.apy.toFixed(2)}%          | ${optimizedResults.apy.toFixed(2)}%         | ${apyDiff >= 0 ? '+' : ''}${apyDiff.toFixed(2)}%`);
    console.log(`Total Fees Earned         | $${originalResults.totalFeesEarned.toFixed(2)}       | $${optimizedResults.totalFeesEarned.toFixed(2)}      | ${feesDiff >= 0 ? '+' : ''}$${feesDiff.toFixed(2)}`);
    console.log(`Impermanent Loss          | $${Math.abs(originalResults.totalImpermanentLoss).toFixed(2)}      | $${Math.abs(optimizedResults.totalImpermanentLoss).toFixed(2)}     | ${ilDiff <= 0 ? '' : '+'}$${ilDiff.toFixed(2)}`);
    console.log(`Gas Spent                 | $${originalResults.totalGasSpent.toFixed(2)}         | $${optimizedResults.totalGasSpent.toFixed(2)}        | ${gasDiff >= 0 ? '+' : ''}$${gasDiff.toFixed(2)}`);
    console.log(`Number of Rebalances      | ${originalResults.numberOfRebalances}               | ${optimizedResults.numberOfRebalances}              | ${rebalanceDiff >= 0 ? '+' : ''}${rebalanceDiff}`);
    console.log(`Sharpe Ratio              | ${originalResults.sharpeRatio.toFixed(2)}          | ${optimizedResults.sharpeRatio.toFixed(2)}         | ${(optimizedResults.sharpeRatio - originalResults.sharpeRatio >= 0 ? '+' : '')}${(optimizedResults.sharpeRatio - originalResults.sharpeRatio).toFixed(2)}`);
    console.log(`Max Drawdown              | ${originalResults.maxDrawdownPercent.toFixed(2)}%         | ${optimizedResults.maxDrawdownPercent.toFixed(2)}%        | ${(optimizedResults.maxDrawdownPercent - originalResults.maxDrawdownPercent <= 0 ? '' : '+')}${(optimizedResults.maxDrawdownPercent - originalResults.maxDrawdownPercent).toFixed(2)}%`);
    console.log(`Final Portfolio Value     | $${originalResults.finalValue.toFixed(2)}    | $${optimizedResults.finalValue.toFixed(2)}   | ${(optimizedResults.finalValue - originalResults.finalValue >= 0 ? '+' : '')}$${(optimizedResults.finalValue - originalResults.finalValue).toFixed(2)}`);

    console.log('\n' + '='.repeat(80));

    // Recommendation
    console.log('\n💡 RECOMMENDATION');
    console.log('='.repeat(80));

    if (optimizedResults.apy >= 15.0) {
      console.log('✅ OPTIMIZED STRATEGY MEETS TARGET APY OF 15%!');
      console.log(`   Achieved: ${optimizedResults.apy.toFixed(2)}% APY`);
      console.log(`   Improvement: +${apyDiff.toFixed(2)}% over original strategy`);
      console.log('\n📝 Next Steps:');
      console.log('   1. Update ConcentratedLiquidityVault.sol with ±8% range');
      console.log('   2. Deploy updated contract to testnet');
      console.log('   3. Run production backtest with real pool data');
      console.log('   4. Update frontend with new APY estimate');
    } else {
      console.log('⚠️  Further optimization needed to reach 15% target');
      console.log(`   Current: ${optimizedResults.apy.toFixed(2)}% APY`);
      console.log(`   Gap: ${(15.0 - optimizedResults.apy).toFixed(2)}% remaining`);
      console.log('\n📝 Consider:');
      console.log('   - Even tighter range (±5%)?');
      console.log('   - Multiple position tiers?');
      console.log('   - Dynamic range based on volatility?');
    }

    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error running optimization test:', error);
    process.exit(1);
  }
}

// Run test
testOptimization().catch(console.error);
