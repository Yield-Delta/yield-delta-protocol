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

  constructor(config: ServiceConfig) {
    this.config = config;

    this.client = axios.create({
      baseURL: config.aiEngineUrl,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    logger.info('AI Engine service initialized', {
      baseUrl: config.aiEngineUrl,
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

      // Convert AI Engine response to our RebalanceRecommendation format
      const recommendation: RebalanceRecommendation = {
        vault: vaultState.address,
        newTickLower: data.new_lower_tick,
        newTickUpper: data.new_upper_tick,
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
}

export default AIEngineService;
