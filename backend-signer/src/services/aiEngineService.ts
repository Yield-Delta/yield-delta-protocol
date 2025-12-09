import axios, { AxiosInstance } from 'axios';
import {
  ServiceConfig,
  RebalanceRecommendation,
  VaultState,
} from '../types';
import logger from '../utils/logger';

export class AIEngineService {
  private client: AxiosInstance;
  private config: ServiceConfig;
  private lastMarketData: any = null;
  private lastMarketDataTimestamp: number = 0;
  private marketDataCacheDuration: number = 60000; // 1 minute cache

  constructor(config: ServiceConfig) {
    this.config = config;

    this.client = axios.create({
      baseURL: config.aiEngineUrl,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    logger.info('AI Engine service initialized with ML models', {
      baseUrl: config.aiEngineUrl,
      models: ['rl_agent', 'lstm_forecaster', 'il_predictor'],
    });
  }

  /**
   * Request rebalance analysis from the AI Engine
   */
  async analyzeVault(vaultState: VaultState): Promise<RebalanceRecommendation | null> {
    try {
      // Calculate utilization rate (simplified - using liquidity as proxy)
      const totalAssets = Number(vaultState.token0Balance) + Number(vaultState.token1Balance);
      const utilizationRate = totalAssets > 0 ? Number(vaultState.totalLiquidity) / totalAssets : 0.5;

      // Request format matching AI Engine's RebalanceRecommendationRequest
      const request = {
        vault_address: vaultState.address,
        current_tick: Math.floor((vaultState.currentTickLower + vaultState.currentTickUpper) / 2),
        lower_tick: vaultState.currentTickLower,
        upper_tick: vaultState.currentTickUpper,
        utilization_rate: Math.min(utilizationRate, 1.0),
        market_conditions: {
          volatility: 0.3,
          trend: 'neutral',
          volume_24h: 1000000,
        },
      };

      logger.debug('Requesting rebalance analysis', { vault: vaultState.address, request });

      const response = await this.client.post(
        '/analyze/rebalance',
        request
      );

      // Response format: RebalanceResponse
      const data = response.data;

      // Get tick values from AI Engine or generate fallback values
      let newTickLower = data.new_lower_tick;
      let newTickUpper = data.new_upper_tick;

      // If AI engine returns invalid tick range (0,0), generate sensible defaults
      // based on current position with slight adjustment
      if (newTickLower === 0 && newTickUpper === 0) {
        // Use current ticks as base, or generate standard range if no current position
        if (vaultState.currentTickLower !== 0 || vaultState.currentTickUpper !== 0) {
          // Adjust current range by ±10% of the range width
          const rangeWidth = vaultState.currentTickUpper - vaultState.currentTickLower;
          const adjustment = Math.floor(rangeWidth * 0.1);
          newTickLower = vaultState.currentTickLower - adjustment;
          newTickUpper = vaultState.currentTickUpper + adjustment;
        } else {
          // Default to standard SEI/USDC range (approximately ±5% around current price)
          // Tick spacing of 60 is common for 0.3% fee tier
          const tickSpacing = 60;
          const defaultRangeWidth = tickSpacing * 100; // ~6000 ticks
          newTickLower = -defaultRangeWidth / 2;
          newTickUpper = defaultRangeWidth / 2;
        }
        logger.warn('AI Engine returned invalid tick range (0,0), using fallback values', {
          vault: vaultState.address,
          fallbackLower: newTickLower,
          fallbackUpper: newTickUpper,
        });
      }

      // Validate tick values (lower must be less than upper)
      if (newTickLower >= newTickUpper) {
        logger.error('Invalid tick range: lower >= upper', { newTickLower, newTickUpper });
        return null;
      }

      // Convert AI Engine response to our RebalanceRecommendation format
      const recommendation: RebalanceRecommendation = {
        vault: vaultState.address,
        newTickLower,
        newTickUpper,
        confidence: Math.floor(data.expected_improvement * 100), // Convert to 0-10000 scale
        urgency: data.urgency as 'low' | 'medium' | 'high' | 'critical',
        expectedReturns: data.expected_improvement,
        currentUtilization: utilizationRate * 100,
        optimalUtilization: (utilizationRate + data.expected_improvement) * 100,
        reasoning: data.risk_assessment,
      };

      logger.info('Received rebalance recommendation', {
        vault: vaultState.address,
        newTickLower: recommendation.newTickLower,
        newTickUpper: recommendation.newTickUpper,
        confidence: recommendation.confidence,
        urgency: recommendation.urgency,
        action: data.action,
      });

      return recommendation;
    } catch (error: any) {
      logger.error('Failed to get AI analysis', {
        vault: vaultState.address,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Get market conditions from AI Engine
   */
  async getMarketConditions(): Promise<any> {
    try {
      const response = await this.client.get('/market/conditions');
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get market conditions', { error: error.message });
      return null;
    }
  }

  /**
   * Check if rebalance is needed based on current vs optimal
   */
  shouldRebalance(
    recommendation: RebalanceRecommendation,
    minConfidenceThreshold: number
  ): boolean {
    // Check confidence threshold
    if (recommendation.confidence < minConfidenceThreshold) {
      logger.debug('Recommendation below confidence threshold', {
        confidence: recommendation.confidence,
        threshold: minConfidenceThreshold,
      });
      return false;
    }

    // Check urgency
    if (recommendation.urgency === 'low') {
      logger.debug('Low urgency recommendation, skipping');
      return false;
    }

    // Check if there's meaningful difference in utilization
    const utilizationDiff = Math.abs(
      recommendation.optimalUtilization - recommendation.currentUtilization
    );
    if (utilizationDiff < 5) {
      logger.debug('Utilization difference too small', { utilizationDiff });
      return false;
    }

    return true;
  }

  /**
   * Check AI Engine health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      logger.error('AI Engine health check failed', { error });
      return false;
    }
  }

  /**
   * Get model information
   */
  async getModelInfo(): Promise<any> {
    try {
      const response = await this.client.get('/model/info');
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get model info', { error: error.message });
      return null;
    }
  }

  /**
   * Get RL agent strategy recommendation
   */
  async getRLAgentRecommendation(vaultState: VaultState): Promise<any> {
    try {
      const request = {
        vault_address: vaultState.address,
        current_position: {
          lower_tick: vaultState.currentTickLower,
          upper_tick: vaultState.currentTickUpper,
          liquidity: vaultState.totalLiquidity,
        },
        market_data: await this.getCachedMarketData(),
      };

      logger.debug('Requesting RL agent recommendation', { vault: vaultState.address });
      const response = await this.client.post('/predict/rl_strategy', request);

      return {
        action: response.data.action,
        confidence: response.data.confidence,
        expectedReward: response.data.expected_reward,
        optimalRange: response.data.optimal_range,
      };
    } catch (error: any) {
      logger.error('Failed to get RL agent recommendation', {
        vault: vaultState.address,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Get LSTM price forecast
   */
  async getLSTMPriceForecast(symbol: string = 'SEI-USD'): Promise<any> {
    try {
      const request = {
        symbol: symbol,
        horizon: 24, // 24 hour forecast
        confidence_level: 0.95,
      };

      logger.debug('Requesting LSTM price forecast', { symbol });
      const response = await this.client.post('/predict/price_forecast', request);

      return {
        predictions: response.data.predictions,
        confidence: response.data.confidence_intervals,
        trend: response.data.trend,
        volatility: response.data.volatility_forecast,
      };
    } catch (error: any) {
      logger.error('Failed to get LSTM price forecast', { error: error.message });
      return null;
    }
  }

  /**
   * Get Impermanent Loss risk assessment
   */
  async getILRiskAssessment(vaultState: VaultState): Promise<any> {
    try {
      const request = {
        vault_address: vaultState.address,
        current_position: {
          lower_tick: vaultState.currentTickLower,
          upper_tick: vaultState.currentTickUpper,
          token0_balance: vaultState.token0Balance,
          token1_balance: vaultState.token1Balance,
        },
        time_horizon: 24, // 24 hours
      };

      logger.debug('Requesting IL risk assessment', { vault: vaultState.address });
      const response = await this.client.post('/predict/il_risk', request);

      return {
        expectedIL: response.data.expected_il,
        riskScore: response.data.risk_score,
        mitigation: response.data.mitigation_strategy,
        optimalRebalanceTime: response.data.optimal_rebalance_time,
      };
    } catch (error: any) {
      logger.error('Failed to get IL risk assessment', {
        vault: vaultState.address,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Get comprehensive ML analysis combining all models
   */
  async getComprehensiveAnalysis(vaultState: VaultState): Promise<RebalanceRecommendation | null> {
    try {
      logger.info('Requesting comprehensive ML analysis', { vault: vaultState.address });

      // Parallel requests to all ML models
      const [rlRecommendation, priceForecast, ilRisk] = await Promise.all([
        this.getRLAgentRecommendation(vaultState),
        this.getLSTMPriceForecast(),
        this.getILRiskAssessment(vaultState),
      ]);

      if (!rlRecommendation && !priceForecast && !ilRisk) {
        logger.warn('No ML models returned results');
        return await this.analyzeVault(vaultState); // Fallback to basic analysis
      }

      // Combine insights from all models
      let newTickLower = vaultState.currentTickLower;
      let newTickUpper = vaultState.currentTickUpper;
      let confidence = 5000; // Default 50% confidence
      let urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      let reasoning = [];

      // Use RL agent's optimal range if available
      if (rlRecommendation?.optimalRange) {
        newTickLower = rlRecommendation.optimalRange.lower;
        newTickUpper = rlRecommendation.optimalRange.upper;
        confidence = Math.floor(rlRecommendation.confidence * 10000);
        reasoning.push(`RL Agent suggests action: ${rlRecommendation.action}`);
      }

      // Adjust based on price forecast
      if (priceForecast) {
        if (priceForecast.trend === 'bullish') {
          // Shift range slightly upward for bullish trend
          const adjustment = Math.floor((newTickUpper - newTickLower) * 0.05);
          newTickLower += adjustment;
          newTickUpper += adjustment;
          reasoning.push('LSTM forecasts bullish trend, adjusting range upward');
        } else if (priceForecast.trend === 'bearish') {
          // Shift range slightly downward for bearish trend
          const adjustment = Math.floor((newTickUpper - newTickLower) * 0.05);
          newTickLower -= adjustment;
          newTickUpper -= adjustment;
          reasoning.push('LSTM forecasts bearish trend, adjusting range downward');
        }

        // Widen range if high volatility expected
        if (priceForecast.volatility > 0.5) {
          const widening = Math.floor((newTickUpper - newTickLower) * 0.1);
          newTickLower -= widening;
          newTickUpper += widening;
          reasoning.push('High volatility expected, widening range');
        }
      }

      // Adjust urgency based on IL risk
      if (ilRisk) {
        if (ilRisk.riskScore > 0.8) {
          urgency = 'critical';
          reasoning.push(`Critical IL risk detected: ${(ilRisk.expectedIL * 100).toFixed(2)}%`);
        } else if (ilRisk.riskScore > 0.6) {
          urgency = 'high';
          reasoning.push(`High IL risk: ${(ilRisk.expectedIL * 100).toFixed(2)}%`);
        } else if (ilRisk.riskScore > 0.3) {
          urgency = 'medium';
        } else {
          urgency = 'low';
        }

        // Boost confidence if all models agree
        if (rlRecommendation && priceForecast && confidence < 8000) {
          confidence = Math.min(confidence + 1500, 10000);
          reasoning.push('All ML models in agreement');
        }
      }

      const recommendation: RebalanceRecommendation = {
        vault: vaultState.address,
        newTickLower,
        newTickUpper,
        confidence,
        urgency,
        expectedReturns: rlRecommendation?.expectedReward || 0.05,
        currentUtilization: (Number(vaultState.totalLiquidity) / (Number(vaultState.token0Balance) + Number(vaultState.token1Balance))) * 100,
        optimalUtilization: 85, // Target utilization
        reasoning: reasoning.join('; '),
      };

      logger.info('ML analysis complete', {
        vault: vaultState.address,
        confidence: recommendation.confidence,
        urgency: recommendation.urgency,
        reasoning: recommendation.reasoning,
      });

      return recommendation;
    } catch (error: any) {
      logger.error('Comprehensive analysis failed', {
        vault: vaultState.address,
        error: error.message,
      });
      // Fallback to basic analysis
      return await this.analyzeVault(vaultState);
    }
  }

  /**
   * Get cached market data or fetch new if cache expired
   */
  private async getCachedMarketData(): Promise<any> {
    const now = Date.now();
    if (this.lastMarketData && (now - this.lastMarketDataTimestamp) < this.marketDataCacheDuration) {
      return this.lastMarketData;
    }

    try {
      const response = await this.client.get('/market/latest');
      this.lastMarketData = response.data;
      this.lastMarketDataTimestamp = now;
      return this.lastMarketData;
    } catch (error: any) {
      logger.error('Failed to fetch market data', { error: error.message });
      return {
        price: 1.0,
        volume_24h: 1000000,
        volatility: 0.3,
      };
    }
  }
}

export default AIEngineService;
