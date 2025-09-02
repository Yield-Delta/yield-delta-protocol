'use client';

import { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Activity, AlertTriangle, 
  ChevronDown, ChevronUp, DollarSign, BarChart3,
  Target, Clock, Shield, Zap, Wifi, WifiOff
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useMarketSentiment, type MarketData, type VaultConditions } from '@/hooks/useMarketSentiment';

interface VaultStrategy {
  name: string;
  type: 'DELTA_NEUTRAL' | 'DIRECTIONAL' | 'ARBITRAGE' | 'HYBRID';
  recommendedAllocation: number;
  expectedAPY: number;
  riskScore: number;
  timeHorizon: 'SHORT' | 'MEDIUM' | 'LONG';
  status: 'ACTIVE' | 'CAUTION' | 'AVOID';
  description: string;
}

export default function MarketSentimentPage() {
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());
  
  // Use the custom hook for market sentiment data
  const {
    marketData,
    vaultConditions,
    lastUpdated,
    isLoading,
    error,
    connectionStatus,
    refresh,
    toggleWebSocket,
    hasData,
    isConnected
  } = useMarketSentiment({
    symbols: ['SEI', 'ETH', 'BTC', 'SOL'],
    autoRefresh: true,
    refreshInterval: 30000,
    enableWebSocket: false // Will enable this when Cloudflare Workers are deployed
  });

  // Vault strategies configuration
  const vaultStrategies: VaultStrategy[] = [
    {
      name: 'SEI Delta Neutral',
      type: 'DELTA_NEUTRAL',
      recommendedAllocation: 35,
      expectedAPY: 18.5,
      riskScore: 3,
      timeHorizon: 'MEDIUM',
      status: 'ACTIVE',
      description: 'Market-neutral strategy leveraging SEI\'s 400ms finality'
    },
    {
      name: 'ETH Momentum',
      type: 'DIRECTIONAL',
      recommendedAllocation: 25,
      expectedAPY: 24.2,
      riskScore: 6,
      timeHorizon: 'SHORT',
      status: 'CAUTION',
      description: 'Directional exposure with dynamic hedging'
    },
    {
      name: 'Cross-Chain Arbitrage',
      type: 'ARBITRAGE',
      recommendedAllocation: 20,
      expectedAPY: 12.8,
      riskScore: 2,
      timeHorizon: 'SHORT',
      status: 'ACTIVE',
      description: 'Price discrepancy exploitation across chains'
    },
    {
      name: 'Hybrid Yield',
      type: 'HYBRID',
      recommendedAllocation: 20,
      expectedAPY: 16.3,
      riskScore: 4,
      timeHorizon: 'LONG',
      status: 'ACTIVE',
      description: 'Combined strategies for optimal risk-adjusted returns'
    }
  ];


  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    const totalAllocation = vaultStrategies.reduce((sum, strategy) => sum + strategy.recommendedAllocation, 0);
    const weightedAPY = vaultStrategies.reduce((sum, strategy) => 
      sum + (strategy.expectedAPY * strategy.recommendedAllocation / totalAllocation), 0
    );
    const avgRisk = vaultStrategies.reduce((sum, strategy) => 
      sum + (strategy.riskScore * strategy.recommendedAllocation / totalAllocation), 0
    );
    
    return {
      totalAllocation,
      weightedAPY,
      avgRisk,
      activeStrategies: vaultStrategies.filter(s => s.status === 'ACTIVE').length
    };
  }, [vaultStrategies]);

  const toggleAssetExpansion = (symbol: string) => {
    const newExpanded = new Set(expandedAssets);
    if (newExpanded.has(symbol)) {
      newExpanded.delete(symbol);
    } else {
      newExpanded.add(symbol);
    }
    setExpandedAssets(newExpanded);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return 'text-green-500';
      case 'BEARISH': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      POSITIVE: 'bg-green-100 text-green-800 border-green-200',
      NEGATIVE: 'bg-red-100 text-red-800 border-red-200',
      NEUTRAL: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[impact as keyof typeof colors] || colors.NEUTRAL;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      CAUTION: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      AVOID: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || colors.ACTIVE;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Enhanced Vault Market Sentiment
            </h1>
            <p className="text-slate-300">
              Real-time market intelligence for DeFi vault strategies
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-slate-300 border-slate-600">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-slate-400" />
              )}
              <Badge variant="outline" className="text-slate-300 border-slate-600 text-xs">
                {connectionStatus}
              </Badge>
            </div>
            <Button 
              onClick={refresh}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={isLoading}
            >
              <Activity className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-300">
                <AlertTriangle className="w-4 h-4" />
                <span>Warning: {error}. Showing mock data for demonstration.</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Overview */}
        {vaultConditions && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Overall Sentiment</p>
                    <p className={`font-bold text-lg ${getSentimentColor(vaultConditions.overallSentiment)}`}>
                      {vaultConditions.overallSentiment}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Delta Opportunities</p>
                    <p className="font-bold text-lg text-blue-400">
                      {vaultConditions.deltaOpportunities}/10
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Market Efficiency</p>
                    <p className="font-bold text-lg text-purple-400">
                      {vaultConditions.marketEfficiency}%
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Risk Level</p>
                    <p className="font-bold text-lg text-orange-400">
                      {vaultConditions.riskLevel}/10
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asset Analysis */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Asset Analysis
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Click on assets for detailed analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {marketData.map((asset) => (
                  <div key={asset.symbol}>
                    <Button
                      variant="ghost"
                      className="w-full p-4 h-auto justify-start hover:bg-slate-700/50"
                      onClick={() => toggleAssetExpansion(asset.symbol)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <div className="text-left">
                            <p className="font-semibold text-white">{asset.symbol}</p>
                            <p className="text-slate-300 text-sm">
                              ${asset.price.toLocaleString()}
                            </p>
                          </div>
                          <Badge className={getImpactBadge(asset.vaultImpact)}>
                            {asset.vaultImpact}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`font-semibold ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(1)}%
                            </p>
                            <p className="text-slate-300 text-sm">24h</p>
                          </div>
                          {expandedAssets.has(asset.symbol) ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </Button>

                    {expandedAssets.has(asset.symbol) && (
                      <div className="mt-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wide">Volatility</p>
                            <p className="text-white font-semibold">{asset.volatility.toFixed(1)}%</p>
                            <Progress value={asset.volatility} className="mt-1 h-2" />
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wide">DN Suitability</p>
                            <p className="text-white font-semibold">{asset.deltaNeutralSuitability}/100</p>
                            <Progress value={asset.deltaNeutralSuitability} className="mt-1 h-2" />
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wide">Liquidity</p>
                            <p className="text-white font-semibold">{asset.liquidityScore}/100</p>
                            <Progress value={asset.liquidityScore} className="mt-1 h-2" />
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wide">Trend Strength</p>
                            <p className="text-white font-semibold">{asset.trendStrength}/100</p>
                            <Progress value={asset.trendStrength} className="mt-1 h-2" />
                          </div>
                        </div>
                        {asset.supportLevel && asset.resistanceLevel && (
                          <div className="mt-4 flex items-center gap-6">
                            <div>
                              <p className="text-slate-400 text-xs uppercase tracking-wide">Support</p>
                              <p className="text-green-400 font-semibold">
                                ${asset.supportLevel.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-xs uppercase tracking-wide">Resistance</p>
                              <p className="text-red-400 font-semibold">
                                ${asset.resistanceLevel.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-xs uppercase tracking-wide">Funding Rate</p>
                              <p className={`font-semibold ${asset.fundingRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {(asset.fundingRate * 100).toFixed(3)}%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Strategy Recommendations */}
          <div className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Portfolio Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Expected APY</p>
                    <p className="text-2xl font-bold text-green-400">
                      {portfolioMetrics.weightedAPY.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Risk Score</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {portfolioMetrics.avgRisk.toFixed(1)}/10
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-2">Active Strategies</p>
                  <p className="text-xl font-semibold text-blue-400">
                    {portfolioMetrics.activeStrategies}/{vaultStrategies.length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Strategy Recommendations
                </CardTitle>
                <CardDescription className="text-slate-300">
                  AI-optimized vault allocation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {vaultStrategies.map((strategy) => (
                  <div key={strategy.name} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{strategy.name}</h4>
                      <Badge className={getStatusBadge(strategy.status)}>
                        {strategy.status}
                      </Badge>
                    </div>
                    <p className="text-slate-300 text-sm mb-3">{strategy.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-slate-400">Allocation</p>
                        <p className="text-white font-semibold">{strategy.recommendedAllocation}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Expected APY</p>
                        <p className="text-green-400 font-semibold">{strategy.expectedAPY}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Risk Score</p>
                        <p className="text-orange-400 font-semibold">{strategy.riskScore}/10</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Horizon</p>
                        <p className="text-blue-400 font-semibold">{strategy.timeHorizon}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Progress value={strategy.recommendedAllocation} className="h-2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Funding Rates */}
        {vaultConditions && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Funding Rates (8hr)
              </CardTitle>
              <CardDescription className="text-slate-300">
                Real-time funding rates across major perpetual markets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(vaultConditions.fundingRates).map(([symbol, rate]) => (
                  <div key={symbol} className="text-center p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-slate-400 text-sm uppercase tracking-wide">{symbol}</p>
                    <p className={`text-xl font-bold ${rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(rate * 100).toFixed(3)}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}