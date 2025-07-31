"use client";``

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import gsap from 'gsap';
import styles from './VaultCard.module.css';

interface VaultData {
  name: string;
  apy: number;
  tvl: string;
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

  useEffect(() => {
    if (cardRef.current) {
      // Card entrance animation
      gsap.fromTo(cardRef.current,
        { 
          opacity: 0, 
          y: 50,
          scale: 0.9
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.8, 
          delay: index * 0.2,
          ease: "back.out(1.7)"
        }
      );
    }

    // Animate APY counter
    gsap.to({ value: 0 }, {
      value: vault.apy,
      duration: 2,
      delay: index * 0.2 + 0.5,
      ease: "power2.out",
      onUpdate: function() {
        setDisplayApy(Number(this.targets()[0].value.toFixed(1)));
      }
    });
  }, [vault.apy, index]);

  const handleHover = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

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
      className={`${styles.vaultCard} cursor-pointer group relative overflow-hidden`}
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
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
              className={styles.apyValue}
            >
              {displayApy}%
            </span>
          </div>
          
          <div className={styles.metricRow}>
            <span className={styles.metricLabel}>TVL</span>
            <span className={styles.tvlValue}>{vault.tvl}</span>
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