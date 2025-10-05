"use client"

import React, { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, Eye, Clock, Zap } from 'lucide-react';

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  apy: number;
}

const MarketPage = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const statsCardsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(false);

  // Mock market data for SEI ecosystem
  const marketData: MarketData[] = [
    {
      symbol: 'SEI-USDC',
      price: 0.52,
      change24h: 8.4,
      volume24h: 2400000,
      marketCap: 156000000,
      liquidity: 8900000,
      apy: 12.5
    },
    {
      symbol: 'ATOM-SEI',
      price: 12.76,
      change24h: -2.1,
      volume24h: 890000,
      marketCap: 34000000,
      liquidity: 4200000,
      apy: 18.2
    },
    {
      symbol: 'ETH-SEI',
      price: 2456.89,
      change24h: 5.2,
      volume24h: 5600000,
      marketCap: 89000000,
      liquidity: 12000000,
      apy: 26.7
    },
    {
      symbol: 'BTC-SEI',
      price: 42356.78,
      change24h: 3.8,
      volume24h: 8900000,
      marketCap: 178000000,
      liquidity: 15600000,
      apy: 8.9
    }
  ];

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(decimals)}`;
  };


  // Intersection Observer for animations
  useEffect(() => {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsStatsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const tableObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsTableVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (statsCardsRef.current) {
      statsObserver.observe(statsCardsRef.current);
    }

    if (tableRef.current) {
      tableObserver.observe(tableRef.current);
    }

    return () => {
      if (statsCardsRef.current) {
        statsObserver.unobserve(statsCardsRef.current);
      }
      if (tableRef.current) {
        tableObserver.unobserve(tableRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, transparent 70%)',
              animationDelay: '0s',
              animationDuration: '4s'
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)',
              animationDelay: '2s',
              animationDuration: '5s'
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.5) 0%, transparent 70%)',
              animationDelay: '4s',
              animationDuration: '6s'
            }}
          />
        </div>
      </div>
      
      {/* Background overlay */}
      <div className="fixed inset-0 z-5 bg-gradient-to-b from-background/70 via-background/60 to-background/70 pointer-events-none" />

      {/* Navigation */}
      <Navigation variant="dark" showWallet={true} showLaunchApp={false} />
      
      {/* Header */}
      <div className="relative z-10" style={{ paddingTop: '3.5rem' }}>
        <div 
          className="border-b border-white/20 backdrop-blur-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(6, 182, 212, 0.12) 100%)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
                  SEI Market Overview
                </h1>
                <p className="text-gray-300 text-lg font-medium">Real-time trading data and liquidity metrics across the SEI ecosystem</p>
              </div>
              <div className="flex items-center gap-6">
                <div 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)' }}></div>
                  <span className="text-green-300 font-semibold">Live Data</span>
                </div>
                <div 
                  className="text-center px-4 py-3 rounded-xl"
                  style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="text-sm text-blue-300 font-medium">Chain ID</div>
                  <div className="text-2xl font-bold text-blue-400">1328</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div 
          ref={statsCardsRef} 
          className={`grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 transition-all duration-1000 ease-out ${
            isStatsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {[
            { label: 'Total Volume 24h', value: '$17.8M', change: '+12.4%', icon: BarChart3, color: 'blue' },
            { label: 'Total Liquidity', value: '$40.7M', change: '+5.8%', icon: DollarSign, color: 'green' },
            { label: 'Active Pairs', value: '24', change: '+2', icon: Activity, color: 'purple' },
            { label: 'Avg APY', value: '16.6%', change: '+2.5%', icon: TrendingUp, color: 'orange' }
          ].map((stat, index) => (
            <div 
              key={index} 
              className={`group cursor-pointer transition-all duration-700 ease-out hover:scale-105 ${
                isStatsVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-12 scale-95'
              }`}
              style={{
                transitionDelay: isStatsVisible ? `${index * 150}ms` : '0ms',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '24px',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              }}
              onMouseEnter={(e) => {
                const colors = { blue: '#3b82f6', green: '#10b981', purple: '#8b5cf6', orange: '#f59e0b' };
                const color = colors[stat.color as keyof typeof colors];
                e.currentTarget.style.borderColor = `${color}60`;
                e.currentTarget.style.boxShadow = `0 25px 50px rgba(0, 0, 0, 0.4), 0 0 30px ${color}40, 0 0 0 1px rgba(255, 255, 255, 0.15) inset`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <stat.icon className={`w-10 h-10 text-${stat.color}-400 group-hover:scale-110 transition-transform duration-300`} style={{ filter: 'drop-shadow(0 0 8px currentColor)' }} />
                <div 
                  className={`text-sm font-bold text-${stat.color}-300 px-3 py-2 rounded-xl`}
                  style={{
                    background: `rgba(${stat.color === 'blue' ? '59, 130, 246' : stat.color === 'green' ? '16, 185, 129' : stat.color === 'purple' ? '139, 92, 246' : '245, 158, 11'}, 0.2)`,
                    border: `1px solid rgba(${stat.color === 'blue' ? '59, 130, 246' : stat.color === 'green' ? '16, 185, 129' : stat.color === 'purple' ? '139, 92, 246' : '245, 158, 11'}, 0.3)`,
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  {stat.change}
                </div>
              </div>
              <div className="text-3xl font-black mb-2 text-white group-hover:text-white transition-colors" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}>{stat.value}</div>
              <div className="text-gray-300 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-6 mb-12">
          <span className="text-gray-300 text-lg font-semibold">Timeframe:</span>
          <div className="flex items-center gap-2">
            {['1h', '24h', '7d', '30d'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                  selectedTimeframe === timeframe
                    ? 'text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
                style={{
                  background: selectedTimeframe === timeframe 
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)'
                    : 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  border: selectedTimeframe === timeframe 
                    ? '1px solid rgba(59, 130, 246, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: selectedTimeframe === timeframe 
                    ? '0 0 20px rgba(59, 130, 246, 0.4)'
                    : '0 4px 15px rgba(0, 0, 0, 0.1)'
                }}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        {/* Market Data Table */}
        <div 
          ref={tableRef}
          className={`overflow-hidden transition-all duration-1000 ease-out ${
            isTableVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '32px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
          }}
        >
          <div className="p-8 border-b border-white/20">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
              <Eye className="w-6 h-6 text-blue-400" style={{ filter: 'drop-shadow(0 0 8px currentColor)' }} />
              Trading Pairs
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
                  <th className="text-left p-6 font-semibold text-gray-300 text-sm">Pair</th>
                  <th className="text-right p-6 font-semibold text-gray-300 text-sm">Price</th>
                  <th className="text-right p-6 font-semibold text-gray-300 text-sm">24h Change</th>
                  <th className="text-right p-6 font-semibold text-gray-300 text-sm">Volume</th>
                  <th className="text-right p-6 font-semibold text-gray-300 text-sm">Liquidity</th>
                  <th className="text-right p-6 font-semibold text-gray-300 text-sm">APY</th>
                  <th className="text-center p-6 font-semibold text-gray-300 text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((item, index) => (
                  <tr 
                    key={index} 
                    className="border-t border-white/10 transition-all duration-300 hover:scale-[1.01]"
                    style={{
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
                            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)'
                          }}
                        >
                          {item.symbol.split('-')[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg">{item.symbol}</div>
                          <div className="text-sm text-gray-300 font-medium">SEI Network</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="font-bold text-white text-lg">{formatNumber(item.price)}</div>
                    </td>
                    <td className="p-6 text-right">
                      <div 
                        className={`flex items-center justify-end gap-2 font-bold ${
                          item.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                        style={{
                          filter: 'drop-shadow(0 0 8px currentColor)'
                        }}
                      >
                        {item.change24h >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        {Math.abs(item.change24h)}%
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="font-bold text-white">{formatNumber(item.volume24h)}</div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="font-bold text-white">{formatNumber(item.liquidity)}</div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="text-orange-400 font-bold text-lg" style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}>{item.apy}%</div>
                    </td>
                    <td className="p-6 text-center">
                      <button 
                        className="text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 mx-auto font-bold hover:scale-105 group"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(59, 130, 246, 0.5)',
                          boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
                        }}
                      >
                        <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Trade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div 
          className="mt-16 text-center text-gray-300 text-sm p-8 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-blue-400" style={{ filter: 'drop-shadow(0 0 8px currentColor)' }} />
            <span className="font-semibold">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <p className="font-medium">Market data refreshes every 30 seconds • Powered by SEI Network</p>
        </div>
      </div>
    </div>
  );
};

export default MarketPage;