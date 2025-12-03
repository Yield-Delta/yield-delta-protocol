'use client'

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Logo from './Logo';
import { gsap } from 'gsap';
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

  // GSAP Logo Animation - Professional breathe effect
  useEffect(() => {
    if (!logoRef.current) return;

    const logoElement = logoRef.current;
    
    // Subtle breathing effect - professional and calming
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    
    tl.to(logoElement, {
      scale: 1.05,
      filter: 'drop-shadow(0 0 12px rgba(155, 93, 229, 0.4))',
      duration: 3,
      ease: 'sine.inOut'
    });

    // Professional hover enhancement
    const hoverTl = gsap.timeline({ paused: true });
    hoverTl.to(logoElement, {
      scale: 1.1,
      filter: 'drop-shadow(0 0 20px rgba(155, 93, 229, 0.6))',
      duration: 0.3,
      ease: 'power2.out'
    });

    const handleMouseEnter = () => hoverTl.play();
    const handleMouseLeave = () => hoverTl.reverse();

    logoElement.addEventListener('mouseenter', handleMouseEnter);
    logoElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      tl.kill();
      hoverTl.kill();
      logoElement.removeEventListener('mouseenter', handleMouseEnter);
      logoElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // GSAP Mobile Menu Animation
  useEffect(() => {
    if (!mobileMenuRef.current) return;

    const menuElement = mobileMenuRef.current;
    const menuItems = menuElement.querySelectorAll('.mobile-menu-item');
    const backdrop = menuElement.querySelector('.mobile-menu-backdrop');
    const orbs = menuElement.querySelectorAll('.mobile-menu-orb');

    if (mobileMenuOpen) {
      // Set initial states
      gsap.set(menuElement, { opacity: 0, scale: 0.9 });
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(menuItems, { opacity: 0, y: 30, scale: 0.9 });
      gsap.set(orbs, { scale: 0, opacity: 0 });

      // Animate in
      const tl = gsap.timeline();
      tl.to(menuElement, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' })
        .to(backdrop, { opacity: 1, duration: 0.2 }, 0)
        .to(orbs, { scale: 1, opacity: 0.2, duration: 0.6, ease: 'back.out(1.7)', stagger: 0.1 }, 0.1)
        .to(menuItems, { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.4, 
          ease: 'back.out(1.2)', 
          stagger: 0.08 
        }, 0.2);
    }
  }, [mobileMenuOpen]);

  // Mobile menu close handler with animation
  const closeMobileMenu = () => {
    if (!mobileMenuRef.current) {
      setMobileMenuOpen(false);
      return;
    }

    const menuElement = mobileMenuRef.current;
    const menuItems = menuElement.querySelectorAll('.mobile-menu-item');
    const backdrop = menuElement.querySelector('.mobile-menu-backdrop');

    const tl = gsap.timeline({
      onComplete: () => setMobileMenuOpen(false)
    });

    tl.to(menuItems, { 
      opacity: 0, 
      y: -20, 
      scale: 0.9, 
      duration: 0.2, 
      ease: 'power2.in', 
      stagger: 0.05 
    })
    .to(backdrop, { opacity: 0, duration: 0.2 }, 0)
    .to(menuElement, { opacity: 0, scale: 0.9, duration: 0.2, ease: 'power2.in' }, 0.1);
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
            className="logo-animation-gsap"
            style={{
              transformStyle: 'preserve-3d'
            }}
          >
            <Logo 
              variant="horizontal-svg" 
              size={48} 
              animated={false}
              className="flex-shrink-0 hidden md:block"
            />
            <Logo 
              variant="icon" 
              size={48} 
              animated={false}
              className="flex-shrink-0 md:hidden"
            />
          </div>
          <div className="nav-brand hidden sm:block md:hidden">
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

        {/* CENTER - App Navigation Links (only show when inside app, hidden on mobile via CSS) */}
        {!showLaunchApp && (
          <div className="nav-center-links">
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
            <Link
              href="/docs"
              className="text-foreground hover:text-primary transition-colors no-underline font-medium"
            >
              Docs
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
              <span>Launch App</span>
            </Link>
          )}

          {/* Wallet Connect - Always visible */}
          {showWallet && (
            <div className="wallet-container">
              <WalletConnectButton />
            </div>
          )}

          {/* Mobile Menu Button (hamburger - only show when inside app, visibility controlled by CSS) */}
          {!showLaunchApp && (
            <button
              onClick={() => mobileMenuOpen ? closeMobileMenu() : setMobileMenuOpen(true)}
              className="mobile-menu-btn"
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
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{
            width: '100vw',
            height: '100vh',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {/* Full-screen backdrop with gradient */}
          <div
            className="absolute inset-0 mobile-menu-backdrop"
            onClick={closeMobileMenu}
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #0a0a12 0%, #0d1117 25%, #161b22 50%, #0d1117 75%, #0a0a12 100%)',
            }}
          />

          {/* Animated mesh gradient background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
                radial-gradient(ellipse 50% 30% at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)
              `,
              animation: 'meshMove 15s ease-in-out infinite',
            }}
          />

          {/* Animated grid lines */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />

          {/* Floating orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute mobile-menu-orb"
              style={{
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)',
                top: '10%',
                left: '-5%',
                filter: 'blur(60px)',
                animation: 'floatOrb 8s ease-in-out infinite',
              }}
            />
            <div
              className="absolute mobile-menu-orb"
              style={{
                width: '250px',
                height: '250px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
                bottom: '15%',
                right: '-5%',
                filter: 'blur(50px)',
                animation: 'floatOrb 10s ease-in-out infinite reverse',
              }}
            />
            <div
              className="absolute mobile-menu-orb"
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
                top: '50%',
                right: '20%',
                filter: 'blur(40px)',
                animation: 'floatOrb 12s ease-in-out infinite',
                animationDelay: '-3s',
              }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={closeMobileMenu}
            className="absolute top-6 right-6 z-10 p-3 rounded-full mobile-menu-item"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
            }}
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Menu Content - Centered */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-6 py-20">
            {/* Logo/Brand at top */}
            <div className="mobile-menu-item mb-8">
              <h2
                className="text-3xl font-bold text-center"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #6366f1)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Yield Delta
              </h2>
              <p className="text-gray-500 text-sm text-center mt-1">DeFi Yield Optimization</p>
            </div>

            {/* Menu Items - Grid layout for better mobile UX */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {[
                { href: '/vaults', label: 'Vaults', icon: '🏦', desc: 'Earn yield' },
                { href: '/market', label: 'Market', icon: '📈', desc: 'Live prices' },
                { href: '/market-sentiment', label: 'Sentiment', icon: '🎯', desc: 'Market mood' },
                { href: '/dashboard', label: 'Portfolio', icon: '📊', desc: 'Your assets' },
                { href: '/portfolio/rebalance', label: 'Rebalance', icon: '⚖️', desc: 'Optimize' },
                { href: '/docs', label: 'Docs', icon: '📚', desc: 'Learn more' },
              ].map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="mobile-menu-item group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div
                    className="flex flex-col items-center justify-center p-5 rounded-2xl transition-all duration-300 h-full"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <span className="text-3xl mb-2">{item.icon}</span>
                    <span className="text-white font-semibold text-base">{item.label}</span>
                    <span className="text-gray-500 text-xs mt-1">{item.desc}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Deploy button - Full width CTA */}
            <Link
              href="/vaults/deploy"
              onClick={closeMobileMenu}
              className="mobile-menu-item w-full max-w-sm mt-6"
            >
              <div
                className="flex items-center justify-center gap-3 p-4 rounded-2xl transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                }}
              >
                <span className="text-2xl">🚀</span>
                <span
                  className="font-bold text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Deploy Your Vault
                </span>
              </div>
            </Link>

            {/* Bottom hint */}
            <p className="text-gray-600 text-xs mt-8 mobile-menu-item">
              Tap anywhere to close
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
