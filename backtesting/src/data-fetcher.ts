/**
 * Data fetcher for historical price and pool data
 * Fetches from CoinGecko and DragonSwap GraphQL
 */

import axios from 'axios';
import { PriceData, PoolData } from './types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const DRAGONSWAP_GRAPHQL = process.env.DRAGONSWAP_GRAPHQL_URL ||
  'https://api.goldsky.com/api/public/project_clu1fg6ajhsho01x7ajld3f5a/subgraphs/dragonswap-v3-prod/1.0.5/gn';

/**
 * Fetch historical price data from CoinGecko
 */
export async function fetchHistoricalPrices(
  coinId: string,
  days: number = 90
): Promise<PriceData[]> {
  try {
    console.log(`Fetching ${days} days of price data for ${coinId}...`);

    const response = await axios.get(
      `${COINGECKO_API}/coins/${coinId}/market_chart`,
      {
        params: {
          vs_currency: 'usd',
          days: days,
          interval: 'daily'
        }
      }
    );

    const prices = response.data.prices || [];
    const volumes = response.data.total_volumes || [];

    const priceData: PriceData[] = prices.map((price: [number, number], index: number) => {
      const timestamp = price[0];
      const close = price[1];
      const volume = volumes[index]?.[1] || 0;

      return {
        timestamp,
        date: new Date(timestamp),
        open: close, // CoinGecko doesn't provide OHLC for free tier
        high: close * 1.01, // Approximate
        low: close * 0.99, // Approximate
        close,
        volume
      };
    });

    console.log(`✓ Fetched ${priceData.length} price data points`);
    return priceData;
  } catch (error) {
    console.error('Error fetching price data:', error);
    throw error;
  }
}

/**
 * Fetch pool data from DragonSwap GraphQL
 * Note: This requires the GraphQL endpoint to be available
 */
export async function fetchPoolData(
  poolAddress: string,
  startTimestamp: number,
  endTimestamp: number
): Promise<PoolData[]> {
  try {
    console.log(`Fetching pool data for ${poolAddress}...`);

    // GraphQL query for pool day data
    const query = `
      query poolDayDatas($pool: String!, $startTime: Int!, $endTime: Int!) {
        poolDayDatas(
          where: {
            pool: $pool
            date_gte: $startTime
            date_lte: $endTime
          }
          orderBy: date
          orderDirection: asc
        ) {
          date
          liquidity
          volumeUSD
          feesUSD
          token0Price
          token1Price
          tvlUSD
        }
      }
    `;

    const response = await axios.post(DRAGONSWAP_GRAPHQL, {
      query,
      variables: {
        pool: poolAddress.toLowerCase(),
        startTime: startTimestamp,
        endTime: endTimestamp
      }
    });

    const poolDayDatas = response.data?.data?.poolDayDatas || [];

    const poolData: PoolData[] = poolDayDatas.map((day: any) => ({
      timestamp: day.date * 1000,
      date: new Date(day.date * 1000),
      liquidity: parseFloat(day.liquidity),
      volumeUSD: parseFloat(day.volumeUSD),
      feesUSD: parseFloat(day.feesUSD),
      token0Price: parseFloat(day.token0Price),
      token1Price: parseFloat(day.token1Price),
      tvlUSD: parseFloat(day.tvlUSD)
    }));

    if (poolData.length === 0) {
      console.warn('⚠️  No pool data returned from GraphQL, generating synthetic data');
      return generateSyntheticPoolData(startTimestamp, endTimestamp);
    }

    console.log(`✓ Fetched ${poolData.length} pool data points`);
    return poolData;
  } catch (error) {
    console.error('Error fetching pool data:', error);
    console.warn('⚠️  Using synthetic pool data for backtest');
    return generateSyntheticPoolData(startTimestamp, endTimestamp);
  }
}

/**
 * Generate synthetic pool data when real data isn't available
 * Based on realistic assumptions for SEI ecosystem
 */
function generateSyntheticPoolData(
  startTimestamp: number,
  endTimestamp: number
): PoolData[] {
  const data: PoolData[] = [];
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor((endTimestamp - startTimestamp) / dayMs);

  console.log(`Generating ${days} days of synthetic pool data...`);

  for (let i = 0; i <= days; i++) {
    const timestamp = startTimestamp + (i * dayMs);
    const date = new Date(timestamp);

    // Realistic SEI/USDC pool assumptions
    const baseTVL = 250000; // $250k TVL
    const baseVolume = 50000; // $50k daily volume
    const feeRate = 0.003; // 0.3% fee

    // Add some variance
    const variance = 1 + (Math.sin(i / 7) * 0.15); // Weekly cycles
    const randomFactor = 0.9 + Math.random() * 0.2;

    data.push({
      timestamp,
      date,
      liquidity: baseTVL * variance,
      volumeUSD: baseVolume * variance * randomFactor,
      feesUSD: baseVolume * variance * randomFactor * feeRate,
      token0Price: 0.5, // SEI ~$0.50
      token1Price: 1.0, // USDC = $1.00
      tvlUSD: baseTVL * variance
    });
  }

  return data;
}

/**
 * Calculate fees earned for a liquidity position
 */
export function calculateFeesEarned(
  poolData: PoolData,
  positionLiquidity: number,
  totalPoolLiquidity: number
): number {
  if (totalPoolLiquidity === 0) return 0;

  // Fees are proportional to liquidity share
  const liquidityShare = positionLiquidity / totalPoolLiquidity;
  return poolData.feesUSD * liquidityShare;
}

/**
 * Calculate impermanent loss
 */
export function calculateImpermanentLoss(
  initialPrice: number,
  currentPrice: number,
  initialValue: number
): number {
  if (initialPrice === 0) return 0;

  const priceRatio = currentPrice / initialPrice;
  const sqrt = Math.sqrt(priceRatio);

  // IL formula: 2*sqrt(priceRatio)/(1+priceRatio) - 1
  const lpValue = (2 * sqrt) / (1 + priceRatio);
  const holdValue = 1; // Normalized

  const ilPercent = lpValue - holdValue;
  return initialValue * ilPercent;
}

/**
 * Save data to CSV for analysis
 */
export function saveDataToCSV(data: any[], filename: string): void {
  // Implementation would use csv-writer package
  console.log(`Saving data to ${filename}...`);
  // TODO: Implement CSV writing
}
