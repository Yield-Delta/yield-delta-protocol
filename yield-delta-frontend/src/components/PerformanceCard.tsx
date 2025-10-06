"use client"

import { Card, CardContent } from '@/components/ui/card';
import styles from './PerformanceCard.module.css';
import { TrendingUp, DollarSign, Shield, Activity } from 'lucide-react';

interface PerformanceCardProps {
  metric: string;
  description: string;
  comparison: string;
  color: string;
  positive?: boolean;
}

export default function PerformanceCard({ 
  metric, 
  description, 
  comparison, 
  color, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  positive: _positive = true 
}: PerformanceCardProps) {

  const getIcon = () => {
    if (description.toLowerCase().includes('apy') || description.toLowerCase().includes('trend')) {
      return <TrendingUp size={64} />;
    } else if (description.toLowerCase().includes('value') || description.toLowerCase().includes('tvl')) {
      return <DollarSign size={64} />;
    } else if (description.toLowerCase().includes('loss') || description.toLowerCase().includes('security')) {
      return <Shield size={64} />;
    } else {
      return <Activity size={64} />;
    }
  };

  return (
    <Card 
      className={`${styles.performanceCard} group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 animate-fade-in-up`}
      style={{ 
        perspective: '1000px !important',
        minHeight: '280px !important',
        width: '100% !important',
        display: 'flex !important',
        flexDirection: 'column',
        backdropFilter: 'blur(24px) !important',
        WebkitBackdropFilter: 'blur(24px) !important',
        border: '2px solid hsl(var(--primary) / 0.3) !important',
        background: 'hsl(var(--card) / 0.9) !important',
        borderRadius: '16px !important',
        boxShadow: '0 8px 32px hsl(var(--primary) / 0.2), inset 0 1px 0 hsl(var(--border) / 0.5) !important',
        transition: 'all 300ms ease-in-out !important'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.5)';
        e.currentTarget.style.boxShadow = '0 20px 60px hsl(var(--primary) / 0.3), inset 0 1px 0 hsl(var(--border) / 0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.3)';
        e.currentTarget.style.boxShadow = '0 8px 32px hsl(var(--primary) / 0.2), inset 0 1px 0 hsl(var(--border) / 0.5)';
      }}
    >
      <CardContent 
        className="p-6 text-center h-full flex flex-col justify-center"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2rem 1.5rem',
          paddingTop: '2rem',
          paddingBottom: '1.5rem'
        }}
      >
        {/* Main Content Container */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          flex: '1',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          {/* 3D Animated Icon */}
          <div 
            className="mb-2 flex justify-center animate-float"
            style={{
              transformStyle: 'preserve-3d',
              filter: `drop-shadow(0 4px 8px ${color}40)`,
              marginBottom: '0.5rem'
            }}
          >
            <div style={{ color: color }}>
              {getIcon()}
            </div>
          </div>
          
          <div 
            className={`${styles.metric} text-4xl font-bold mb-3 transition-all duration-300`}
            style={{ 
              color: `${color} !important`,
              filter: `drop-shadow(0 0 12px ${color}) !important`,
              fontSize: '3.25rem !important',
              fontWeight: '900 !important',
              lineHeight: '1 !important',
              marginBottom: '0.75rem !important',
              textAlign: 'center'
            }}
          >
            {metric}
          </div>
          <div 
            className={`${styles.description} text-lg font-semibold mb-2 text-foreground`}
            style={{
              fontSize: '1.25rem !important',
              fontWeight: '700 !important',
              lineHeight: '1.3 !important',
              marginBottom: '0.5rem !important',
              color: 'hsl(var(--foreground)) !important',
              textAlign: 'center'
            }}
          >
            {description}
          </div>
          <div 
            className={`${styles.comparison} text-sm text-muted-foreground mb-6`}
            style={{
              fontSize: '1rem !important',
              lineHeight: '1.4 !important',
              opacity: '0.85 !important',
              marginBottom: '1.5rem !important',
              color: 'hsl(var(--muted-foreground)) !important',
              textAlign: 'center'
            }}
          >
            {comparison}
          </div>
        </div>
        
        {/* Status Row - Better Positioned */}
        <div 
          className={`${styles.statusRow} flex items-center justify-center gap-3`}
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            width: 'fit-content',
            minWidth: '120px'
          }}
        >
          <div 
            className={`${styles.statusIndicator}`}
            style={{ 
              backgroundColor: color,
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              flexShrink: 0,
              animation: 'pulseGlow 2s ease-in-out infinite',
              boxShadow: `0 0 12px ${color}80, 0 0 4px ${color}`
            }}
          />
          <span 
            style={{
              fontSize: '0.95rem',
              fontWeight: 'bold',
              color: color,
              letterSpacing: '0.8px',
              textShadow: `0 0 8px ${color}50`,
              filter: `drop-shadow(0 0 4px ${color}40)`,
              fontFamily: 'inherit',
              textTransform: 'uppercase'
            }}
          >
            ACTIVE
          </span>
        </div>
      </CardContent>
      
      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px) rotateX(-15deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) rotateX(0deg);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotateX(0deg) rotateY(0deg);
          }
          50% {
            transform: translateY(-10px) rotateX(15deg) rotateY(10deg);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </Card>
  );
}