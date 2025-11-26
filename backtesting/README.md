# Yield Delta Protocol - Strategy Backtesting

This directory contains backtesting frameworks for validating the APY claims of our vault strategies.

## Strategies Being Tested

### 1. Native SEI Vault - Concentrated Liquidity Strategy
- **Claimed APY**: 15%
- **Strategy**: Concentrated liquidity provision on SEI/USDC pool
- **Data Source**: DragonSwap (SEI's primary DEX)

### 2. USDC Stable Vault - Stable Max Strategy
- **Claimed APY**: 8.5%
- **Strategy**: Optimized stablecoin yield farming
- **Data Source**: Symphony Finance + DragonSwap

## Backtesting Methodology

### Data Collection
1. **Historical Price Data**: CoinGecko API for SEI/USD prices
2. **Pool Data**: DragonSwap GraphQL for liquidity pool metrics
3. **Fee Data**: On-chain transaction data for fee revenue
4. **Volatility Data**: Historical price movements for risk metrics

### Performance Metrics
- **APY**: Annualized Percentage Yield
- **Sharpe Ratio**: Risk-adjusted returns
- **Max Drawdown**: Largest peak-to-trough decline
- **Win Rate**: Percentage of profitable days
- **Fee Revenue**: Total fees collected from LP positions

### Backtesting Period
- **Historical**: Last 90 days (or available data)
- **Walk-Forward**: Rolling 30-day windows
- **Stress Test**: Bear market scenarios

## Running Backtests

```bash
# Install dependencies
npm install

# Run all backtests
npm run backtest

# Run specific strategy
npm run backtest:sei
npm run backtest:usdc

# Generate reports
npm run backtest:report
```

## Output

Backtests generate:
1. **Performance Reports**: CSV/JSON with daily metrics
2. **Visualizations**: Charts showing returns over time
3. **Risk Analysis**: Drawdown charts, volatility metrics
4. **APY Validation**: Comparison of claimed vs actual APY

## Files

- `framework.ts` - Core backtesting engine
- `data-fetcher.ts` - Historical data collection
- `strategies/concentrated-liquidity.ts` - Concentrated liquidity backtest
- `strategies/stable-max.ts` - Stable max backtest
- `reports/` - Generated backtest results
- `visualizations/` - Performance charts
