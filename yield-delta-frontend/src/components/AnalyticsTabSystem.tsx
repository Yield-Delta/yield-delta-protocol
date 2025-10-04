"use client"

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, BarChart3, PieChart, Activity, Zap, Target } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  badge?: string | number;
}

interface AnalyticsTabSystemProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
}

export default function AnalyticsTabSystem({ 
  tabs, 
  defaultTab,
  className = "" 
}: AnalyticsTabSystemProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [tabIndicator, setTabIndicator] = useState({ width: 0, left: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateIndicator();
  }, [activeTab]);

  const updateIndicator = () => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    const activeTabElement = tabsRef.current[activeIndex];
    
    if (activeTabElement) {
      setTabIndicator({
        width: activeTabElement.offsetWidth,
        left: activeTabElement.offsetLeft
      });
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`analytics-tabs ${className}`}>
      {/* Tab Navigation */}
      <div 
        ref={containerRef}
        className="analytics-tabs__nav"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-xs)',
          padding: 'var(--space-xs)',
          background: 'var(--glass-bg-light)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          backdropFilter: 'blur(20px)',
          marginBottom: 'var(--space-xl)',
          overflow: 'hidden'
        }}
      >
        {/* Active Tab Indicator */}
        <motion.div
          className="analytics-tabs__indicator"
          style={{
            position: 'absolute',
            top: 'var(--space-xs)',
            height: 'calc(100% - var(--space-md))',
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
            borderRadius: 'var(--radius-md)',
            zIndex: 1,
            boxShadow: '0 4px 12px hsl(var(--primary) / 0.3)'
          }}
          animate={{
            width: tabIndicator.width,
            left: tabIndicator.left
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        />

        {/* Tab Buttons */}
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={el => { tabsRef.current[index] = el; }}
            onClick={() => handleTabClick(tab.id)}
            className="analytics-tabs__button"
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              padding: 'var(--space-sm) var(--space-lg)',
              minHeight: 'var(--touch-target-min)',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: activeTab === tab.id ? 'white' : 'hsl(var(--muted-foreground))',
              fontSize: '0.9rem',
              fontWeight: activeTab === tab.id ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              whiteSpace: 'nowrap'
            }}
          >
            {/* Icon */}
            <span 
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '1.1rem'
              }}
            >
              {tab.icon}
            </span>
            
            {/* Label */}
            <span>{tab.label}</span>
            
            {/* Badge */}
            {tab.badge && (
              <span
                style={{
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: activeTab === tab.id 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : 'hsl(var(--primary) / 0.2)',
                  color: activeTab === tab.id 
                    ? 'white' 
                    : 'hsl(var(--primary))',
                  borderRadius: 'var(--radius-sm)',
                  minWidth: '20px',
                  textAlign: 'center'
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="analytics-tabs__content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              duration: 0.2,
              ease: "easeInOut"
            }}
          >
            {activeTabContent}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .analytics-tabs__nav {
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          
          .analytics-tabs__nav::-webkit-scrollbar {
            display: none;
          }
          
          .analytics-tabs__button {
            flex-shrink: 0;
          }
        }
        
        @media (max-width: 480px) {
          .analytics-tabs__nav {
            gap: 0;
          }
          
          .analytics-tabs__button {
            padding: var(--space-sm);
            min-width: 60px;
          }
          
          .analytics-tabs__button span:last-child {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

// Example usage component demonstrating different analytics views
export function AnalyticsTabsExample() {
  const mockMetricsContent = (
    <div className="analytics-grid analytics-grid--stats">
      <div className="analytics-card analytics-card--metric">
        <h3 className="analytics-metric-value text-cyan">$2.4M</h3>
        <p className="analytics-metric-label">Total Value Locked</p>
        <p className="analytics-description">+12.5% from last month</p>
      </div>
      <div className="analytics-card analytics-card--metric">
        <h3 className="analytics-metric-value text-purple">18.3%</h3>
        <p className="analytics-metric-label">Average APY</p>
        <p className="analytics-description">Across all strategies</p>
      </div>
      <div className="analytics-card analytics-card--metric">
        <h3 className="analytics-metric-value text-pink">847</h3>
        <p className="analytics-metric-label">Active Positions</p>
        <p className="analytics-description">+23 new this week</p>
      </div>
    </div>
  );

  const mockPortfolioContent = (
    <div className="space-y-lg">
      <div className="analytics-card">
        <h3 className="analytics-metric-label mb-4">Portfolio Distribution</h3>
        <div className="space-y-md">
          {[
            { name: 'ETH-USDT Arbitrage', percentage: 45, color: 'var(--color-cyan)' },
            { name: 'BTC Delta Neutral', percentage: 30, color: 'var(--color-purple)' },
            { name: 'SEI-USDC LP', percentage: 25, color: 'var(--color-pink)' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="analytics-description">{item.name}</span>
              <div className="flex items-center gap-2">
                <div 
                  style={{
                    width: '100px',
                    height: '6px',
                    background: 'var(--glass-bg-light)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}
                >
                  <div 
                    style={{
                      width: `${item.percentage}%`,
                      height: '100%',
                      background: item.color,
                      borderRadius: '3px'
                    }}
                  />
                </div>
                <span className="analytics-description font-semibold">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const analyticsTabsData: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <TrendingUp size={18} />,
      content: mockMetricsContent,
      badge: '5'
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: <PieChart size={18} />,
      content: mockPortfolioContent,
      badge: '3'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: <BarChart3 size={18} />,
      content: <div className="analytics-card text-center p-8">Performance analytics coming soon...</div>
    },
    {
      id: 'strategies',
      label: 'Strategies',
      icon: <Target size={18} />,
      content: <div className="analytics-card text-center p-8">Strategy details coming soon...</div>
    },
    {
      id: 'ai-insights',
      label: 'AI Insights',
      icon: <Zap size={18} />,
      content: <div className="analytics-card text-center p-8">AI insights coming soon...</div>,
      badge: 'NEW'
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: <Activity size={18} />,
      content: <div className="analytics-card text-center p-8">Recent activity coming soon...</div>
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h2 className="analytics-heading mb-4">Analytics Dashboard</h2>
        <p className="analytics-subheading">
          Comprehensive insights into your DeFi portfolio performance
        </p>
      </div>
      
      <AnalyticsTabSystem 
        tabs={analyticsTabsData}
        defaultTab="overview"
      />
    </div>
  );
}