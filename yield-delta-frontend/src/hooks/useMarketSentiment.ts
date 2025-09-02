'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types for market sentiment data
export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: string;
  volatility: number;
  vaultImpact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  deltaNeutralSuitability: number;
  liquidityScore: number;
  trendStrength: number;
  supportLevel?: number;
  resistanceLevel?: number;
  fundingRate: number;
}

export interface VaultConditions {
  overallSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  volatilityRegime: 'LOW' | 'MEDIUM' | 'HIGH';
  deltaOpportunities: number;
  fundingRates: {
    btc: number;
    eth: number;
    sol: number;
    sei: number;
  };
  yieldEnvironment: 'FAVORABLE' | 'CHALLENGING' | 'MIXED';
  riskLevel: number;
  marketEfficiency: number;
  liquidityConditions: 'EXCELLENT' | 'GOOD' | 'POOR';
}

interface UseMarketSentimentOptions {
  symbols?: string[];
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableWebSocket?: boolean;
}

interface MarketSentimentState {
  marketData: MarketData[];
  vaultConditions: VaultConditions | null;
  lastUpdated: Date;
  isLoading: boolean;
  error: string | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

export function useMarketSentiment(options: UseMarketSentimentOptions = {}) {
  const {
    symbols = ['SEI', 'ETH', 'BTC', 'SOL'],
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableWebSocket = false
  } = options;

  const [state, setState] = useState<MarketSentimentState>({
    marketData: [],
    vaultConditions: null,
    lastUpdated: new Date(),
    isLoading: true,
    error: null,
    connectionStatus: 'disconnected'
  });

  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch market data from API
  const fetchMarketData = useCallback(async (): Promise<MarketData[]> => {
    const response = await fetch(`/api/market/data?symbols=${symbols.join(',')}`);
    if (!response.ok) {
      throw new Error('Failed to fetch market data');
    }

    const data = await response.json();
    return data.data || [];
  }, [symbols]);

  // Fetch vault conditions from API
  const fetchVaultConditions = useCallback(async (): Promise<VaultConditions> => {
    const response = await fetch('/api/market/vault-conditions');
    if (!response.ok) {
      throw new Error('Failed to fetch vault conditions');
    }

    const data = await response.json();
    return data.data;
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const [marketDataResult, vaultConditionsResult] = await Promise.allSettled([
        fetchMarketData(),
        fetchVaultConditions()
      ]);

      let marketData: MarketData[] = [];
      let vaultConditions: VaultConditions | null = null;
      let error: string | null = null;

      if (marketDataResult.status === 'fulfilled') {
        marketData = marketDataResult.value;
      } else {
        console.error('Market data fetch failed:', marketDataResult.reason);
        error = 'Failed to fetch market data';
      }

      if (vaultConditionsResult.status === 'fulfilled') {
        vaultConditions = vaultConditionsResult.value;
      } else {
        console.error('Vault conditions fetch failed:', vaultConditionsResult.reason);
        if (!error) error = 'Failed to fetch vault conditions';
      }

      setState(prev => ({
        ...prev,
        marketData,
        vaultConditions,
        lastUpdated: new Date(),
        isLoading: false,
        error
      }));

    } catch (err) {
      console.error('Error refreshing market sentiment data:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      }));
    }
  }, [fetchMarketData, fetchVaultConditions]);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (!enableWebSocket) return;

    setState(prev => ({ ...prev, connectionStatus: 'connecting' }));

    try {
      // In production, this would connect to your WebSocket server
      // For now, we'll simulate WebSocket updates
      const ws = new WebSocket('wss://echo.websocket.org');
      
      ws.onopen = () => {
        console.log('WebSocket connected for market sentiment');
        setState(prev => ({ ...prev, connectionStatus: 'connected' }));
        
        // Send subscription message
        ws.send(JSON.stringify({
          type: 'subscribe',
          symbols: symbols,
          channels: ['market_data', 'vault_conditions']
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'market_data_update') {
            setState(prev => ({
              ...prev,
              marketData: data.marketData || prev.marketData,
              lastUpdated: new Date()
            }));
          }
          
          if (data.type === 'vault_conditions_update') {
            setState(prev => ({
              ...prev,
              vaultConditions: data.vaultConditions || prev.vaultConditions,
              lastUpdated: new Date()
            }));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (enableWebSocket) {
            connectWebSocket();
          }
        }, 5000);
      };

      wsRef.current = ws;

    } catch (err) {
      console.error('Failed to establish WebSocket connection:', err);
      setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
    }
  }, [enableWebSocket, symbols]);

  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
  }, []);

  // Setup auto-refresh
  useEffect(() => {
    // Initial data fetch
    refreshData();

    // Setup WebSocket if enabled
    if (enableWebSocket) {
      connectWebSocket();
    }

    // Setup polling if auto-refresh is enabled and WebSocket is not
    if (autoRefresh && !enableWebSocket) {
      intervalRef.current = setInterval(refreshData, refreshInterval);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      disconnectWebSocket();
    };
  }, [autoRefresh, refreshInterval, enableWebSocket, refreshData, connectWebSocket, disconnectWebSocket]);

  // Manual refresh function
  const manualRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  // Toggle WebSocket connection
  const toggleWebSocket = useCallback(() => {
    if (state.connectionStatus === 'connected') {
      disconnectWebSocket();
    } else {
      connectWebSocket();
    }
  }, [state.connectionStatus, connectWebSocket, disconnectWebSocket]);

  return {
    // Data
    marketData: state.marketData,
    vaultConditions: state.vaultConditions,
    lastUpdated: state.lastUpdated,
    
    // Status
    isLoading: state.isLoading,
    error: state.error,
    connectionStatus: state.connectionStatus,
    
    // Actions
    refresh: manualRefresh,
    toggleWebSocket,
    
    // Computed values
    hasData: state.marketData.length > 0 || state.vaultConditions !== null,
    isConnected: state.connectionStatus === 'connected'
  };
}