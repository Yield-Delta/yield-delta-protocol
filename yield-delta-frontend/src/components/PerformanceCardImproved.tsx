"use client"

import { TrendingUp, DollarSign, Shield, Activity, Zap, Eye } from 'lucide-react';

interface PerformanceCardProps {
  metric: string;
  description: string;
  comparison: string;
  color: string;
  positive?: boolean;
  icon?: 'trending' | 'dollar' | 'shield' | 'activity' | 'zap' | 'eye';
}

export default function PerformanceCardImproved({ 
  metric, 
  description, 
  comparison, 
  color, 
  positive = true,
  icon = 'activity'
}: PerformanceCardProps) {

  const getIcon = () => {
    const iconProps = { size: 48, color };
    
    switch (icon) {
      case 'trending':
        return <TrendingUp {...iconProps} />;
      case 'dollar':
        return <DollarSign {...iconProps} />;
      case 'shield':
        return <Shield {...iconProps} />;
      case 'zap':
        return <Zap {...iconProps} />;
      case 'eye':
        return <Eye {...iconProps} />;
      default:
        return <Activity {...iconProps} />;
    }
  };

  return (
    <div 
      className="analytics-card analytics-card--performance group cursor-pointer transition-all duration-300 hover:scale-105 hover:translate-y-[-8px]"
      style={{
        background: `radial-gradient(circle at top, ${color}08, rgba(30, 41, 59, 0.95))`,
        borderColor: `${color}30`,
        boxShadow: `0 8px 32px ${color}15`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}50`;
        e.currentTarget.style.boxShadow = `0 20px 60px ${color}25`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${color}30`;
        e.currentTarget.style.boxShadow = `0 8px 32px ${color}15`;
      }}
    >
      {/* Icon */}
      <div 
        className="flex-center mb-6 animate-bounce"
        style={{
          filter: `drop-shadow(0 4px 12px ${color}40)`,
          animationDuration: '3s'
        }}
      >
        {getIcon()}
      </div>
      
      {/* Metric Value */}
      <div 
        className="analytics-metric-value text-center mb-4"
        style={{ 
          color,
          filter: `drop-shadow(0 0 12px ${color}60)`,
          textShadow: `0 0 20px ${color}40`
        }}
      >
        {metric}
      </div>
      
      {/* Description */}
      <div className="analytics-metric-label text-center mb-3 text-white">
        {description}
      </div>
      
      {/* Comparison */}
      <div className="analytics-description text-center mb-6">
        {comparison}
      </div>

      {/* Status Indicator */}
      <div className="mt-auto flex-center">
        <div 
          className={`status-indicator ${positive ? 'status-indicator--success' : 'status-indicator--warning'}`}
          style={{
            backgroundColor: `${color}15`,
            borderColor: `${color}40`,
            color
          }}
        >
          <div 
            className="status-indicator__dot"
            style={{ backgroundColor: color }}
          />
          <span style={{ color }}>
            {positive ? 'OPTIMIZED' : 'MONITORING'}
          </span>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${color}05, transparent 60%)`
        }}
      />
    </div>
  );
}