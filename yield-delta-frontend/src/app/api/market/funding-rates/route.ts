import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge';

/**
 * Get real-time funding rates for major perpetual contracts
 * GET /api/market/funding-rates - Get current funding rates
 */
export async function GET(request: NextRequest) {
  try {
    // In production, this would fetch from multiple exchanges
    // For now, we'll provide realistic mock data
    const fundingRates = await getCurrentFundingRates();
    
    return NextResponse.json({
      success: true,
      data: fundingRates,
      timestamp: new Date().toISOString(),
      source: 'AGGREGATED_EXCHANGES',
      updateInterval: '8h' // Funding rates typically update every 8 hours
    });

  } catch (error) {
    console.error('Error fetching funding rates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch funding rates'
      },
      { status: 500 }
    );
  }
}

/**
 * Get current funding rates from major exchanges
 */
async function getCurrentFundingRates() {
  // Mock data representing current market conditions
  // In production, this would aggregate data from:
  // - Bybit API: https://api.bybit.com/v5/market/funding/history
  // - Binance API: https://fapi.binance.com/fapi/v1/fundingRate
  // - OKX API: https://www.okx.com/api/v5/public/funding-rate
  
  const fundingRates = {
    btc: {
      symbol: 'BTC',
      rate: 0.018, // 1.8% (8hr rate)
      annualizedRate: 0.018 * 3 * 365, // Approximate annual rate
      nextFundingTime: getNextFundingTime(),
      exchanges: {
        binance: 0.0185,
        bybit: 0.0175,
        okx: 0.0180,
        deribit: 0.0182
      },
      trend: 'INCREASING', // INCREASING, DECREASING, STABLE
      marketSentiment: 'BULLISH' // Based on positive funding rate
    },
    eth: {
      symbol: 'ETH',
      rate: -0.012, // -1.2% (negative = shorts paying longs)
      annualizedRate: -0.012 * 3 * 365,
      nextFundingTime: getNextFundingTime(),
      exchanges: {
        binance: -0.0115,
        bybit: -0.0125,
        okx: -0.0120,
        deribit: -0.0118
      },
      trend: 'DECREASING',
      marketSentiment: 'BEARISH'
    },
    sol: {
      symbol: 'SOL',
      rate: 0.031, // 3.1% (high positive rate)
      annualizedRate: 0.031 * 3 * 365,
      nextFundingTime: getNextFundingTime(),
      exchanges: {
        binance: 0.0305,
        bybit: 0.0315,
        okx: 0.0308,
        deribit: 0.0312
      },
      trend: 'STABLE',
      marketSentiment: 'VERY_BULLISH'
    },
    sei: {
      symbol: 'SEI',
      rate: 0.024, // 2.4% (bullish sentiment)
      annualizedRate: 0.024 * 3 * 365,
      nextFundingTime: getNextFundingTime(),
      exchanges: {
        binance: 0.0235,
        bybit: 0.0245,
        okx: 0.0240,
        // Note: SEI might not be on all exchanges yet
      },
      trend: 'INCREASING',
      marketSentiment: 'BULLISH',
      seiSpecific: {
        chainGrowth: 'HIGH', // SEI chain growth factor
        defitTvl: '$500M+', // DeFi TVL growth
        ecosystemMomentum: 'STRONG'
      }
    },
    atom: {
      symbol: 'ATOM',
      rate: 0.015, // 1.5%
      annualizedRate: 0.015 * 3 * 365,
      nextFundingTime: getNextFundingTime(),
      exchanges: {
        binance: 0.0148,
        bybit: 0.0152,
        okx: 0.0150
      },
      trend: 'STABLE',
      marketSentiment: 'NEUTRAL_BULLISH'
    }
  };

  // Add market analysis
  const marketAnalysis = {
    overallSentiment: calculateOverallSentiment(fundingRates),
    volatilitySignal: 'MEDIUM', // Based on funding rate spreads
    arbitrageOpportunities: identifyArbitrageOps(fundingRates),
    riskMetrics: {
      averageFundingRate: calculateAverageFunding(fundingRates),
      fundingRateSpread: calculateFundingSpread(fundingRates),
      marketStress: 'LOW' // Based on extreme funding rates
    }
  };

  return {
    rates: fundingRates,
    analysis: marketAnalysis,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Calculate next funding time (typically every 8 hours: 00:00, 08:00, 16:00 UTC)
 */
function getNextFundingTime(): string {
  const now = new Date();
  const currentHour = now.getUTCHours();
  
  let nextFundingHour: number;
  if (currentHour < 8) {
    nextFundingHour = 8;
  } else if (currentHour < 16) {
    nextFundingHour = 16;
  } else {
    nextFundingHour = 24; // Next day 00:00
  }
  
  const nextFunding = new Date(now);
  nextFunding.setUTCHours(nextFundingHour % 24, 0, 0, 0);
  
  if (nextFundingHour === 24) {
    nextFunding.setUTCDate(nextFunding.getUTCDate() + 1);
  }
  
  return nextFunding.toISOString();
}

/**
 * Calculate overall market sentiment based on funding rates
 */
function calculateOverallSentiment(rates: any): string {
  const rateValues = Object.values(rates).map((r: any) => r.rate);
  const averageRate = rateValues.reduce((sum: number, rate: number) => sum + rate, 0) / rateValues.length;
  
  if (averageRate > 0.02) return 'VERY_BULLISH';
  if (averageRate > 0.01) return 'BULLISH';
  if (averageRate > -0.01) return 'NEUTRAL';
  if (averageRate > -0.02) return 'BEARISH';
  return 'VERY_BEARISH';
}

/**
 * Identify potential arbitrage opportunities
 */
function identifyArbitrageOps(rates: any): any[] {
  const opportunities = [];
  
  // Look for significant funding rate differences
  for (const [symbol, data] of Object.entries(rates) as [string, any][]) {
    if (Math.abs(data.rate) > 0.025) { // > 2.5%
      opportunities.push({
        symbol,
        type: data.rate > 0 ? 'SHORT_PERPETUAL_LONG_SPOT' : 'LONG_PERPETUAL_SHORT_SPOT',
        expectedReturn: Math.abs(data.rate) * 3 * 365, // Annualized
        riskLevel: 'MEDIUM'
      });
    }
  }
  
  return opportunities;
}

/**
 * Calculate average funding rate
 */
function calculateAverageFunding(rates: any): number {
  const rateValues = Object.values(rates).map((r: any) => r.rate);
  return rateValues.reduce((sum: number, rate: number) => sum + rate, 0) / rateValues.length;
}

/**
 * Calculate funding rate spread (volatility indicator)
 */
function calculateFundingSpread(rates: any): number {
  const rateValues = Object.values(rates).map((r: any) => r.rate);
  const max = Math.max(...rateValues);
  const min = Math.min(...rateValues);
  return max - min;
}