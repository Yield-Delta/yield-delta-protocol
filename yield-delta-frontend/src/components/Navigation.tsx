'use client'

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Logo from './Logo';
import { Menu, X } from 'lucide-react';

const WalletConnectButton = dynamic(
  () => import('./WalletConnectButton').then(mod => ({ default: mod.WalletConnectButton })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-24 h-8 bg-secondary/20 animate-pulse rounded min-w-[120px] min-h-[32px]">
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }
);

interface NavigationProps {
  variant?: 'light' | 'dark' | 'transparent';
  className?: string;
  showWallet?: boolean;
  showLaunchApp?: boolean;
}

export function Navigation({ variant = 'transparent', className = '', showWallet = true, showLaunchApp = true }: NavigationProps) {
  const logoRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const baseClasses = "fixed top-0 left-0 right-0 z-50 h-14 transition-all duration-300 m-0 p-0";
  
  const variantClasses = {
    light: "bg-white/95 backdrop-blur-md border-b border-gray-200",
    dark: "bg-background/95 backdrop-blur-md",
    transparent: "bg-transparent"
  };

  // CSS-based logo animation classes
  const logoClasses = `
    transition-all duration-300 ease-in-out
    hover:scale-110 hover:drop-shadow-[0_0_20px_rgba(155,93,229,0.6)]
    animate-pulse
  `.replace(/\s+/g, ' ').trim();

  // Mobile menu close handler
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ 
        position: 'fixed', 
        height: '3.5rem',
        isolation: 'isolate',
        zIndex: 99999
      }}
    >
      <div className="simple-nav-container">
        {/* LEFT SIDE */}
        <div className="nav-left-simple">
          <div 
            ref={logoRef}
            className={logoClasses}
          >
            <Logo 
              variant="icon" 
              size={48} 
              animated={false}
              className="flex-shrink-0"
            />
          </div>
          <div className="nav-brand hidden sm:block">
            <div 
              className="font-bold gradient-text"
              style={{ 
                fontSize: '2rem',
                lineHeight: '1.2',
                fontWeight: '800'
              }}
            >
              Yield Delta
            </div>
          </div>
        </div>

        {/* CENTER - App Navigation Links (only show when inside app) */}
        {!showLaunchApp && (
          <div className="nav-center-links hidden md:flex items-center space-x-6">
            <Link 
              href="/vaults"
              className="text-foreground hover:text-primary transition-colors no-underline font-medium"
            >
              Vaults
            </Link>
            <Link
              href="/market"
              className="text-foreground hover:text-primary transition-colors no-underline font-medium"
            >
              Market
            </Link>
            <Link
              href="/market-sentiment"
              className="text-foreground hover:text-primary transition-colors no-underline font-medium"
            >
              Sentiment
            </Link>
            <Link
              href="/dashboard"
              className="text-foreground hover:text-primary transition-colors no-underline font-medium"
            >
              Portfolio
            </Link>
            <Link
              href="/portfolio/rebalance"
              className="text-foreground hover:text-primary transition-colors no-underline font-medium"
            >
              Rebalance
            </Link>
            <Link
              href="/vaults/deploy"
              className="text-foreground hover:text-primary transition-colors no-underline font-medium"
            >
              Deploy
            </Link>
          </div>
        )}

        {/* RIGHT SIDE */}
        <div className="nav-right-simple">
          {showLaunchApp && (
            <Link
              href="/vaults"
              className="btn-cyber"
            >
              <svg 
                className="w-4 h-4 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Launch App</span>
            </Link>
          )}
          {showWallet && (
            <div className="wallet-container">
              <WalletConnectButton />
            </div>
          )}
          
          {/* Mobile Menu Button (only show when inside app) */}
          {!showLaunchApp && (
            <button
              onClick={() => mobileMenuOpen ? closeMobileMenu() : setMobileMenuOpen(true)}
              className="md:hidden text-foreground hover:text-primary ml-2"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Full-Screen Mobile Menu Overlay */}
      {!showLaunchApp && mobileMenuOpen && (
        <div 
          ref={mobileMenuRef} 
          className={`
            md:hidden fixed inset-0 z-50 flex items-center justify-center 
            transition-all duration-300 ease-out
            ${mobileMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
          `}
        >
          {/* Backdrop with glass morphism */}
          <div 
            className="absolute inset-0 mobile-menu-backdrop"
            onClick={closeMobileMenu}
            style={{
              background: 'linear-gradient(135deg, hsl(216 100% 4% / 0.95), hsl(216 50% 8% / 0.95))',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            }}
          />
          
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(0, 245, 212, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 245, 212, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'slideDown 20s linear infinite'
            }} />
          </div>
          
          {/* Animated particles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: i % 2 === 0 ? 'hsl(180 100% 48%)' : 'hsl(262 80% 60%)',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.4,
                  animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                  boxShadow: `0 0 ${2 + Math.random() * 4}px currentColor`
                }}
              />
            ))}
          </div>
          
          {/* Floating orbs for ambiance */}
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute w-32 h-32 rounded-full opacity-20 mobile-menu-orb"
              style={{
                background: 'radial-gradient(circle, hsl(180 100% 48% / 0.6), transparent)',
                top: '20%',
                left: '10%',
                filter: 'blur(40px)',
                animation: 'float 6s ease-in-out infinite'
              }}
            />
            <div 
              className="absolute w-24 h-24 rounded-full opacity-30 mobile-menu-orb"
              style={{
                background: 'radial-gradient(circle, hsl(262 80% 60% / 0.5), transparent)',
                bottom: '30%',
                right: '15%',
                filter: 'blur(30px)',
                animation: 'float 8s ease-in-out infinite reverse'
              }}
            />
          </div>
          
          {/* Menu Content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-sm mx-auto px-8">
            {/* Menu Items */}
            <div className="flex flex-col space-y-8 text-center">
              {[
                { href: '/vaults', label: 'Vaults', icon: '🏦' },
                { href: '/market', label: 'Market', icon: '📈' },
                { href: '/market-sentiment', label: 'Sentiment', icon: '🎯' },
                { href: '/dashboard', label: 'Portfolio', icon: '📊' },
                { href: '/portfolio/rebalance', label: 'Rebalance', icon: '⚖️' },
                { href: '/vaults/deploy', label: 'Deploy', icon: '🚀' }
              ].map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="group relative mobile-menu-item"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div 
                    className="flex flex-col items-center space-y-2 p-4 rounded-2xl transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, hsl(216 50% 8% / 0.6), hsl(216 30% 15% / 0.6))',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid hsl(216 30% 18% / 0.5)',
                      boxShadow: '0 8px 32px hsl(180 100% 48% / 0.1)'
                    }}
                  >
                    <span className="text-2xl mb-1">{item.icon}</span>
                    <span 
                      className="text-lg font-semibold"
                      style={{
                        background: 'linear-gradient(135deg, hsl(180 100% 48%), hsl(262 80% 60%))',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        color: 'transparent'
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                  
                  {/* Hover glow effect */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, hsl(180 100% 48% / 0.1), hsl(262 80% 60% / 0.1))',
                      boxShadow: '0 0 20px hsl(180 100% 48% / 0.3), inset 0 1px 0 hsl(180 100% 48% / 0.2)'
                    }}
                  />
                </Link>
              ))}
            </div>
            
            {/* Close button hint */}
            <div className="mt-12 text-center">
              <p className="text-sm opacity-60" style={{ color: 'hsl(180 100% 48%)' }}>
                Tap anywhere to close
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
