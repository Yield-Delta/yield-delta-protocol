"use client"

import React, { useMemo, useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import DemoBanner from '@/components/DemoBanner';
import { TrendingUp, PieChart, DollarSign, Activity, Plus, ArrowRight, Wallet, BarChart3, Settings, Bell, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';
import { useVaults } from '@/hooks/useVaults';
import { useMultipleVaultPositions } from '@/hooks/useMultipleVaultPositions';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';

interface VaultWithPosition {
  address: string;
  name: string;
  strategy: string;
  shares: string;
  shareValue: string;
  totalDeposited: string;
  apy: number;
  pnl: number;
  pnlPercent: number;
}

const DashboardPage = () => {
  const [mounted, setMounted] = useState(false);
  const { address: userAddress } = useAccount();
  const { data: vaults, isLoading: vaultsLoading } = useVaults();

  // Handle hydration - only render dynamic content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get vault addresses for the multi-position hook
  const vaultAddresses = useMemo(() => {
    return vaults?.map(v => v.address) || [];
  }, [vaults]);

  // Fetch all positions in a single hook call (proper React hook usage)
  const { positions: rawPositions, isLoading: positionsLoading } = useMultipleVaultPositions(vaultAddresses);

  // Combine vault data with positions
  const vaultPositions = useMemo(() => {
    if (!vaults || !userAddress || !mounted) return [];

    return vaults
      .map(vault => {
        const positionData = rawPositions.find(p => p.address === vault.address);

        if (!positionData?.hasPosition || !positionData.position) return null;

        const position = positionData.position;
        const shareValue = parseFloat(formatEther(BigInt(position.shareValue)));
        const totalDeposited = parseFloat(formatEther(BigInt(position.totalDeposited)));
        const pnl = shareValue - totalDeposited;
        const pnlPercent = totalDeposited > 0 ? (pnl / totalDeposited) * 100 : 0;

        return {
          address: vault.address,
          name: vault.name,
          strategy: vault.strategy,
          shares: position.shares,
          shareValue: position.shareValue,
          totalDeposited: position.totalDeposited,
          apy: vault.apy * 100,
          pnl,
          pnlPercent,
        } as VaultWithPosition;
      })
      .filter((pos): pos is VaultWithPosition => pos !== null);
  }, [vaults, userAddress, rawPositions, mounted]);

  // Calculate portfolio overview from real positions
  const portfolioOverview = useMemo(() => {
    if (vaultPositions.length === 0) {
      return {
        totalValue: 0,
        totalPnL: 0,
        pnlPercent: 0,
        dailyYield: 0,
        activePositions: 0,
        totalYieldEarned: 0,
        avgAPY: 0,
      };
    }

    const totalValue = vaultPositions.reduce((sum, pos) => {
      return sum + parseFloat(formatEther(BigInt(pos.shareValue)));
    }, 0);

    const totalDeposited = vaultPositions.reduce((sum, pos) => {
      return sum + parseFloat(formatEther(BigInt(pos.totalDeposited)));
    }, 0);

    const totalPnL = totalValue - totalDeposited;
    const pnlPercent = totalDeposited > 0 ? (totalPnL / totalDeposited) * 100 : 0;

    const avgAPY = vaultPositions.reduce((sum, pos) => sum + pos.apy, 0) / vaultPositions.length;
    const dailyYield = (totalValue * avgAPY / 100) / 365;

    return {
      totalValue,
      totalPnL,
      pnlPercent,
      dailyYield,
      activePositions: vaultPositions.length,
      totalYieldEarned: totalPnL > 0 ? totalPnL : 0,
      avgAPY,
    };
  }, [vaultPositions]);

  const getStrategyClass = (strategy: string) => {
    switch (strategy) {
      case 'concentrated_liquidity': return 'concentrated';
      case 'yield_farming': return 'farming';
      case 'arbitrage': return 'arbitrage';
      case 'delta_neutral': return 'neutral';
      case 'stable_max': return 'concentrated';
      default: return 'concentrated';
    }
  };

  const formatSEI = (amount: number) => {
    return `${amount.toFixed(4)} SEI`;
  };

  const isLoading = !mounted || vaultsLoading || positionsLoading;
  const hasNoPositions = mounted && !vaultsLoading && !positionsLoading && userAddress && vaultPositions.length === 0;

  return (
    <div className={styles.dashboardContainer}>
      {/* Navigation */}
      <Navigation variant="dark" showWallet={true} showLaunchApp={false} />

      {/* Demo Banner */}
      <DemoBanner />

      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <div className={styles.headerIcon}>
              <PieChart className="w-6 h-6" />
            </div>
            <div className={styles.headerText}>
              <h1>Vault Dashboard</h1>
              <p>Manage your DeFi positions on SEI Testnet</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconButton}>
              <Bell className="w-5 h-5" />
            </button>
            <button className={styles.iconButton}>
              <Settings className="w-5 h-5" />
            </button>
            {vaultPositions.length > 0 && (
              <Link
                href="/dashboard/rebalance"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Rebalance
              </Link>
            )}
            <Link
              href="/vaults"
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Position
            </Link>
          </div>
        </div>
      </div>

      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mr-3" />
              <span className="text-lg text-gray-300">Loading your portfolio...</span>
            </div>
          )}

          {/* No Wallet Connected */}
          {mounted && !userAddress && !vaultsLoading && (
            <div className="text-center py-20">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-6">Please connect your wallet to view your portfolio</p>
            </div>
          )}

          {/* No Positions Empty State */}
          {hasNoPositions && userAddress && (
            <div className="text-center py-20">
              <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Active Positions</h2>
              <p className="text-gray-400 mb-6">You haven&apos;t deposited to any vaults yet.</p>
              <Link
                href="/vaults"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                <Plus className="w-5 h-5" />
                Explore Vaults
              </Link>
            </div>
          )}

          {/* Portfolio with Positions */}
          {!isLoading && vaultPositions.length > 0 && (
            <>
              {/* Portfolio Overview Stats */}
              <div className={styles.statsGrid}>
                {[
                  {
                    label: 'Total Portfolio Value',
                    value: formatSEI(portfolioOverview.totalValue),
                    change: `${portfolioOverview.pnlPercent >= 0 ? '+' : ''}${portfolioOverview.pnlPercent.toFixed(2)}%`,
                    icon: Wallet,
                    color: 'purple',
                    trend: portfolioOverview.pnlPercent >= 0 ? 'up' : 'down'
                  },
                  {
                    label: 'Total P&L',
                    value: formatSEI(portfolioOverview.totalPnL),
                    change: `${portfolioOverview.pnlPercent >= 0 ? '+' : ''}${portfolioOverview.pnlPercent.toFixed(2)}%`,
                    icon: TrendingUp,
                    color: portfolioOverview.totalPnL >= 0 ? 'green' : 'red',
                    trend: portfolioOverview.totalPnL >= 0 ? 'up' : 'down'
                  },
                  {
                    label: 'Estimated Daily Yield',
                    value: formatSEI(portfolioOverview.dailyYield),
                    change: `${portfolioOverview.avgAPY.toFixed(1)}% APY`,
                    icon: DollarSign,
                    color: 'blue',
                    trend: 'up'
                  },
                  {
                    label: 'Active Positions',
                    value: portfolioOverview.activePositions.toString(),
                    change: `${vaults?.length || 0} vaults available`,
                    icon: Activity,
                    color: 'orange',
                    trend: 'up'
                  },
                  {
                    label: 'Total Yield Earned',
                    value: formatSEI(portfolioOverview.totalYieldEarned),
                    change: 'From all positions',
                    icon: TrendingUp,
                    color: 'pink',
                    trend: 'up'
                  },
                  {
                    label: 'Avg APY',
                    value: `${portfolioOverview.avgAPY.toFixed(1)}%`,
                    change: 'Across positions',
                    icon: BarChart3,
                    color: 'cyan',
                    trend: 'up'
                  }
                ].map((stat, index) => (
                  <div key={index} className={`${styles.statCard} ${styles.fadeIn}`}>
                    <div className={styles.statCardHeader}>
                      <div className={`${styles.statIcon} ${styles[stat.color]}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div className={`${styles.changeBadge} ${styles[stat.trend === 'up' ? 'positive' : 'negative']}`}>
                        {stat.change}
                      </div>
                    </div>
                    <div className={styles.statValue}>{stat.value}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Main Dashboard Content */}
              <div className={styles.mainCard}>
                <div className={styles.mainCardHeader}>
                  <Activity className={`w-5 h-5 ${styles.mainCardIcon}`} />
                  <h2 className={styles.mainCardTitle}>Your Positions</h2>
                </div>
                <div className={styles.positionsContainer}>
                  {vaultPositions.map((position) => (
                    <Link href={`/vault?address=${position.address}`} key={position.address} className={styles.positionCard}>
                      <div className={styles.positionHeader}>
                        <div className={styles.positionInfo}>
                          <div className={styles.positionTitle}>{position.name}</div>
                          <div className={`${styles.strategyBadge} ${styles[getStrategyClass(position.strategy)]}`}>
                            {position.strategy.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>
                        <ArrowRight className={`w-5 h-5 ${styles.arrowIcon}`} />
                      </div>
                      <div className={styles.metricsGrid}>
                        <div className={styles.metric}>
                          <div className={styles.metricLabel}>Value</div>
                          <div className={`${styles.metricValue} ${styles.white}`}>
                            {formatSEI(parseFloat(formatEther(BigInt(position.shareValue))))}
                          </div>
                        </div>
                        <div className={styles.metric}>
                          <div className={styles.metricLabel}>P&L</div>
                          <div className={`${styles.metricValue} ${position.pnl >= 0 ? styles.positive : styles.negative}`}>
                            {position.pnl >= 0 ? '+' : ''}{formatSEI(position.pnl)} ({position.pnlPercent.toFixed(2)}%)
                          </div>
                        </div>
                        <div className={styles.metric}>
                          <div className={styles.metricLabel}>APY</div>
                          <div className={`${styles.metricValue} ${styles.blue}`}>{position.apy.toFixed(1)}%</div>
                        </div>
                        <div className={styles.metric}>
                          <div className={styles.metricLabel}>Shares</div>
                          <div className={`${styles.metricValue} ${styles.green}`}>
                            {parseFloat(formatEther(BigInt(position.shares))).toFixed(4)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className={styles.sectionDivider}>
                  <Link href="/vaults" className={styles.addPositionButton}>
                    <Plus className="w-5 h-5" />
                    Add New Position
                  </Link>
                </div>
              </div>

              {/* Quick Actions */}
              <div className={styles.actionsGrid}>
                <Link href="/dashboard/rebalance" className={styles.actionCard}>
                  <BarChart3 className={`w-8 h-8 ${styles.actionIcon} ${styles.yellow}`} />
                  <div className={styles.actionTitle}>Portfolio Rebalancing</div>
                  <div className={styles.actionDescription}>Optimize your yield with AI-powered analysis</div>
                </Link>

                <Link href="/vaults" className={styles.actionCard}>
                  <TrendingUp className={`w-8 h-8 ${styles.actionIcon} ${styles.purple}`} />
                  <div className={styles.actionTitle}>Explore Vaults</div>
                  <div className={styles.actionDescription}>Discover new yield opportunities</div>
                </Link>

                <Link href="/market" className={styles.actionCard}>
                  <Activity className={`w-8 h-8 ${styles.actionIcon} ${styles.green}`} />
                  <div className={styles.actionTitle}>Market Overview</div>
                  <div className={styles.actionDescription}>View live vault statistics</div>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
