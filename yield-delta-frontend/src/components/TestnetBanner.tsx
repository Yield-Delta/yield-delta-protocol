'use client'

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Network } from 'lucide-react';
import { useAccount } from 'wagmi';
import { isTestnetChain } from '@/lib/chainUtils';

interface TestnetBannerProps {
  className?: string;
  variant?: 'banner' | 'badge';
}

export function TestnetBanner({ className, variant = 'banner' }: TestnetBannerProps) {
  const { chain } = useAccount();
  const isTestnet = chain ? isTestnetChain(chain.id) : true; // Default to testnet warning if not connected

  if (!isTestnet && chain) return null;

  // Badge variant - compact floating indicator
  if (variant === 'badge') {
    return (
      <div
        className={cn(
          "fixed bottom-4 right-4 z-50",
          "px-3 py-2 rounded-lg",
          "bg-gradient-to-r from-amber-500/90 to-orange-500/90",
          "border border-amber-400/50",
          "backdrop-blur-sm shadow-lg",
          "flex items-center gap-2",
          "text-white text-xs font-semibold",
          "transition-all duration-300 hover:scale-105",
          "animate-pulse-subtle",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <Network className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">SEI Testnet</span>
        <span className="sm:hidden">Testnet</span>
        <div
          className="w-2 h-2 rounded-full bg-amber-200 animate-pulse"
          aria-hidden="true"
        />
      </div>
    );
  }

  // Banner variant - vibrant, prominent top banner with improved spacing
  return (
    <div
      className={cn(
        "testnet-banner-container fixed left-0 right-0 z-40",
        "bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600",
        "border-b-2 border-orange-400/50",
        "shadow-lg shadow-orange-500/20",
        "animate-testnet-glow",
        className
      )}
      style={{
        isolation: 'isolate',
        top: '3.5rem'
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-slow" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {/* Warning Icon with Pulsing Effect */}
          <div className="relative flex-shrink-0">
            <AlertTriangle
              className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg"
              aria-hidden="true"
            />
            <div className="absolute inset-0 animate-ping">
              <AlertTriangle
                className="h-5 w-5 sm:h-6 sm:w-6 text-white/40"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Content with Clear Hierarchy */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-center sm:text-left">
            <div className="font-bold text-white text-sm sm:text-base tracking-wide drop-shadow-md">
              TESTNET ENVIRONMENT
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/40" aria-hidden="true" />
            <div className="text-white/95 text-xs sm:text-sm font-medium mt-0.5 sm:mt-0">
              SEI Atlantic-2 Testnet
              <span className="hidden md:inline"> • Not Real Money</span>
            </div>
          </div>

          {/* Pulsing Status Indicator */}
          <div className="relative flex-shrink-0 hidden sm:flex items-center gap-2">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-white shadow-lg" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-white animate-ping opacity-75" />
            </div>
          </div>
        </div>

        {/* Additional Warning Text - Mobile Friendly */}
        <div className="text-center mt-2 sm:mt-1.5">
          <p className="text-white/90 text-xs font-medium">
            All transactions use test tokens only
            <span className="hidden sm:inline"> • No real funds at risk</span>
          </p>
        </div>
      </div>

      {/* Animated gradient line at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"
        aria-hidden="true"
      />
    </div>
  );
}

export default TestnetBanner;
