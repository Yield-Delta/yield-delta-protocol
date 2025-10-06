"use client";

"use client";

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import styles from './VaultCard.module.css';
import { useRouter } from 'next/navigation';

interface VaultData {
  address: string;
  name: string;
  apy: number;
  tvl: number | string;
  risk: 'Low' | 'Medium' | 'High';
  color: string;
  description: string;
}

interface VaultCardProps {
  vault: VaultData;
  index: number;
}

export default function VaultCard({ vault, index }: VaultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const apyRef = useRef<HTMLSpanElement>(null);
  const [displayApy, setDisplayApy] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const handleViewVault = () => {
    // Use the actual vault address from the vault data
    const vaultAddress = vault.address;
    if (vaultAddress) {
      router.push(`/vault?address=${vaultAddress}&tab=analytics`);
    } else {
      console.error('No address found for vault:', vault.name);
    }
  };

  const formatTvl = (tvl: number | string) => {
    if (typeof tvl === 'string') return tvl;
    return tvl >= 1000000 ? `$${(tvl / 1000000).toFixed(1)}M` : 
           tvl >= 1000 ? `$${(tvl / 1000).toFixed(0)}K` : 
           `$${tvl.toFixed(0)}`;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  // Animate APY counter with CSS transition
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setDisplayApy(vault.apy);
      }, index * 200 + 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, vault.apy, index]);


  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return styles.riskLow;
      case 'Medium': return styles.riskMedium;
      case 'High': return styles.riskHigh;
      default: return styles.riskLow;
    }
  };

  return (
    <Card 
      ref={cardRef}
      className={`${styles.vaultCard} cursor-pointer group relative overflow-hidden transition-all duration-700 ease-out hover:scale-105 ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-12 scale-90'
      }`}
      style={{
        width: '100%',
        minWidth: '280px',
        maxWidth: '320px',
        minHeight: '280px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        transitionDelay: isVisible ? `${index * 200}ms` : '0ms'
      }}
    >
      {/* Animated Background Gradient */}
      <div 
        className={styles.backgroundGradient}
        style={{
          background: `linear-gradient(45deg, ${vault.color}20, transparent)`
        }}
      />
      
      {/* Data Streams */}
      <div className={`${styles.dataStream} ${styles.dataStreamLeft}`} />
      <div className={`${styles.dataStream} ${styles.dataStreamRight}`} />
      
      <CardHeader className={styles.cardHeader}>
        <div className={styles.headerContent}>
          <CardTitle className={styles.vaultTitle}>
            {vault.name}
          </CardTitle>
          <Badge className={`${styles.riskBadge} ${getRiskColor(vault.risk)}`}>
            {vault.risk} Risk
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className={styles.cardContent}>
        <div className={styles.contentSpace}>
          <div className={styles.metricRow}>
            <span className={styles.metricLabel}>APY</span>
            <span 
              ref={apyRef}
              className={`${styles.apyValue} transition-all duration-1000 ease-out`}
              style={{
                transform: isVisible ? 'scale(1)' : 'scale(0.8)',
                opacity: isVisible ? 1 : 0.5
              }}
            >
              {displayApy.toFixed(1)}%
            </span>
          </div>
          
          <div className={styles.metricRow}>
            <span className={styles.metricLabel}>TVL</span>
            <span className={styles.tvlValue}>{formatTvl(vault.tvl)}</span>
          </div>
          
          <p className={styles.description}>
            {vault.description}
          </p>
          
          {/* Vault Status Indicator */}
          <div className={styles.statusRow}>
            <div 
              className={styles.statusIndicator}
              style={{ backgroundColor: vault.color }}
            />
            <span className={styles.statusText}>Active & Optimizing</span>
          </div>
          
          {/* Action Button (Landing Page) */}
          <div className={styles.buttonRow}>
            <Button 
              variant="outline" 
              className={styles.analyticsButton}
              onClick={handleViewVault}
              style={{ 
                position: 'relative', 
                overflow: 'hidden',
                margin: '0 auto',
                display: 'block'
              }}
            >
              <span className="font-bold tracking-wide text-center" style={{ display: 'inline-block' }}>
                View Vault
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Pulsing Indicator */}
      <div 
        className="absolute -top-2 -right-2 w-4 h-4 rounded-full animate-pulse-glow"
        style={{ backgroundColor: vault.color }}
      />
    </Card>
  );
}
