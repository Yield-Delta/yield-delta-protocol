/**
 * AI Engine Client
 *
 * TypeScript client for the Python AI Engine API Bridge
 * Provides strategy optimization, market predictions, and risk analysis
 */

export interface VaultAnalysisRequest {
  vault_address: string;
  current_price: number;
  volume_24h: number;
  volatility: number;
  liquidity: number;
  timeframe?: string;
  chain_id?: number;
}

export interface OptimalRangeResponse {
  lower_tick: number;
  upper_tick: number;
  lower_price: number;
  upper_price: number;
  confidence: number;
  expected_apr: number;
  risk_score: number;
  reasoning: string;
}

export interface MarketPredictionRequest {
  symbol: string;
  historical_data: Array<{ [key: string]: any }>;
  prediction_horizon?: string;
  confidence_threshold?: number;
}

export interface PredictionResponse {
  prediction: number;
  confidence: number;
  trend: string;
  support_levels: number[];
  resistance_levels: number[];
  recommended_action: string;
}

export interface DeltaNeutralRequest {
  pair: string;
  position_size: number;
  current_price: number;
  volatility: number;
  market_conditions?: { [key: string]: any };
}

export interface DeltaNeutralResponse {
  pair: string;
  hedge_ratio: number;
  lower_tick: number;
  upper_tick: number;
  lower_price: number;
  upper_price: number;
  expected_neutrality: number;
  expected_apr: number;
  revenue_breakdown: { [key: string]: number };
  reasoning: string;
}

export interface RebalanceRecommendationRequest {
  vault_address: string;
  current_tick: number;
  lower_tick: number;
  upper_tick: number;
  utilization_rate: number;
  market_conditions: { [key: string]: any };
}

export interface RebalanceResponse {
  action: string;
  urgency: string;
  new_lower_tick: number;
  new_upper_tick: number;
  expected_improvement: number;
  risk_assessment: string;
  gas_cost_estimate: number;
}

export class AIEngineClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl?: string, timeout: number = 30000) {
    this.baseUrl = baseUrl || process.env.AI_ENGINE_URL || 'http://localhost:8000';
    this.timeout = timeout;
  }

  /**
   * Check if AI engine is healthy and available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        return data.status === 'healthy';
      }

      return false;
    } catch (error) {
      console.error('AI Engine health check failed:', error);
      return false;
    }
  }

  /**
   * Get optimal liquidity range for a vault
   */
  async getOptimalRange(request: VaultAnalysisRequest): Promise<OptimalRangeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict/optimal-range`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`AI Engine responded with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get optimal range from AI engine:', error);
      throw error;
    }
  }

  /**
   * Get market prediction for a symbol
   */
  async getMarketPrediction(request: MarketPredictionRequest): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict/market`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`AI Engine responded with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get market prediction from AI engine:', error);
      throw error;
    }
  }

  /**
   * Get delta neutral strategy parameters
   */
  async getDeltaNeutralStrategy(
    request: DeltaNeutralRequest
  ): Promise<DeltaNeutralResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/strategy/delta-neutral`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`AI Engine responded with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get delta neutral strategy from AI engine:', error);
      throw error;
    }
  }

  /**
   * Get rebalancing recommendation
   */
  async getRebalanceRecommendation(
    request: RebalanceRecommendationRequest
  ): Promise<RebalanceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/strategy/rebalance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`AI Engine responded with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get rebalance recommendation from AI engine:', error);
      throw error;
    }
  }
}

export default AIEngineClient;
