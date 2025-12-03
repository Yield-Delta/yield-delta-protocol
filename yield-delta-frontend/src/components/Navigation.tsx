'use client'

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
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

interface NavLink {
  href: string;
  label: string;
  icon: string;
  desc: string;
  color: string;
}

// Memoized navigation links to prevent recreation on every render
const NAV_LINKS: readonly NavLink[] = [
  { href: '/vaults', label: 'Vaults', icon: '🏦', desc: 'Earn yield', color: 'rgba(6, 182, 212, 0.08)' },
  { href: '/market', label: 'Market', icon: '📈', desc: 'Live prices', color: 'rgba(139, 92, 246, 0.08)' },
  { href: '/market-sentiment', label: 'Sentiment', icon: '🎯', desc: 'Market mood', color: 'rgba(99, 102, 241, 0.08)' },
  { href: '/dashboard', label: 'Portfolio', icon: '📊', desc: 'Your assets', color: 'rgba(6, 182, 212, 0.08)' },
  { href: '/portfolio/rebalance', label: 'Rebalance', icon: '⚖️', desc: 'Optimize', color: 'rgba(139, 92, 246, 0.08)' },
  { href: '/docs', label: 'Docs', icon: '📚', desc: 'Learn more', color: 'rgba(99, 102, 241, 0.08)' },
] as const;

// Memoized mobile menu item component for better performance
const MobileMenuItem = memo<{ item: NavLink; onClose: () => void }>(({ item, onClose }) => (
  <Link
    href={item.href}
    onClick={onClose}
    className="mobile-menu-item group"
  >
    <div
      className="relative flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-500 h-full overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        willChange: 'transform, opacity'
      }}
    >
      {/* Hover gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: item.color,
        }}
        aria-hidden="true"
      />

      <span className="text-4xl mb-3 transform group-active:scale-110 transition-transform duration-300" aria-hidden="true">
        {item.icon}
      </span>
      <span className="text-white font-semibold text-base mb-1 relative z-10">{item.label}</span>
      <span className="text-gray-400 text-xs relative z-10">{item.desc}</span>
    </div>
  </Link>
));

MobileMenuItem.displayName = 'MobileMenuItem';

export function Navigation({ variant = 'transparent', className = '', showWallet = true, showLaunchApp = true }: NavigationProps) {
  const logoRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

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

    // Set will-change for performance
    gsap.set(logoElement, { willChange: 'transform, filter' });

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
      gsap.set(logoElement, { willChange: 'auto' });
      logoElement.removeEventListener('mouseenter', handleMouseEnter);
      logoElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // GSAP Mobile Menu Animation - Premium Spring Physics with Performance Optimization
  useEffect(() => {
    if (!mobileMenuRef.current) return;

    const menuElement = mobileMenuRef.current;
    const menuItems = menuElement.querySelectorAll('.mobile-menu-item');
    const backdrop = menuElement.querySelector('.mobile-menu-backdrop');
    const orbs = menuElement.querySelectorAll('.mobile-menu-orb');
    const header = menuElement.querySelector('.mobile-menu-header');
    const footer = menuElement.querySelector('.mobile-menu-footer');

    // Kill previous timeline if exists
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    if (mobileMenuOpen) {
      // Disable body scroll
      document.body.style.overflow = 'hidden';

      // Set will-change for all animated elements
      gsap.set([menuElement, backdrop, header, menuItems, footer, orbs], { willChange: 'transform, opacity, filter' });

      // Set initial states with more dramatic transforms
      gsap.set(menuElement, { opacity: 0 });
      gsap.set(backdrop, { opacity: 0, scale: 1.1 });
      gsap.set(header, { opacity: 0, y: -30, filter: 'blur(10px)' });
      gsap.set(menuItems, { opacity: 0, y: 50, scale: 0.8, filter: 'blur(8px)' });
      gsap.set(footer, { opacity: 0, y: 30, filter: 'blur(10px)' });
      gsap.set(orbs, { scale: 0, opacity: 0, filter: 'blur(20px)' });

      // Sophisticated spring-based animation
      const tl = gsap.timeline({
        onComplete: () => {
          // Remove will-change after animation completes for better performance
          gsap.set([menuElement, backdrop, header, menuItems, footer, orbs], { willChange: 'auto' });
        }
      });

      // Backdrop fade with scale
      tl.to(backdrop, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'power3.out'
      }, 0)

      // Container fade
      .to(menuElement, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      }, 0)

      // Orbs with elastic spring
      .to(orbs, {
        scale: 1,
        opacity: 0.3,
        filter: 'blur(60px)',
        duration: 1.2,
        ease: 'elastic.out(1, 0.6)',
        stagger: 0.15
      }, 0.1)

      // Header with smooth blur removal
      .to(header, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power3.out'
      }, 0.2)

      // Menu items with sophisticated stagger
      .to(menuItems, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.7,
        ease: 'power3.out',
        stagger: {
          each: 0.06,
          from: 'start',
          ease: 'power2.inOut'
        }
      }, 0.3)

      // Footer
      .to(footer, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power3.out'
      }, 0.5);

      timelineRef.current = tl;
    }
  }, [mobileMenuOpen]);

  // Focus trap for accessibility
  useEffect(() => {
    if (!mobileMenuOpen || !mobileMenuRef.current) return;

    const menuElement = mobileMenuRef.current;
    const focusableElements = menuElement.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the close button when menu opens
    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [mobileMenuOpen]); // Temporary - will add closeMobileMenu to dependencies after defining it

  // Mobile menu close handler with premium animation - memoized to prevent recreation
  const closeMobileMenu = useCallback(() => {
    if (!mobileMenuRef.current) {
      setMobileMenuOpen(false);
      document.body.style.overflow = '';
      // Return focus to hamburger button
      hamburgerButtonRef.current?.focus();
      return;
    }

    const menuElement = mobileMenuRef.current;
    const menuItems = menuElement.querySelectorAll('.mobile-menu-item');
    const backdrop = menuElement.querySelector('.mobile-menu-backdrop');
    const header = menuElement.querySelector('.mobile-menu-header');
    const footer = menuElement.querySelector('.mobile-menu-footer');

    // Set will-change for closing animation
    gsap.set([footer, menuItems, header, backdrop, menuElement], { willChange: 'transform, opacity, filter' });

    const tl = gsap.timeline({
      onComplete: () => {
        setMobileMenuOpen(false);
        document.body.style.overflow = '';
        // Return focus to hamburger button
        hamburgerButtonRef.current?.focus();
        // Remove will-change
        gsap.set([footer, menuItems, header, backdrop, menuElement], { willChange: 'auto' });
      }
    });

    // Smooth exit with blur and scale
    tl.to(footer, {
      opacity: 0,
      y: 20,
      filter: 'blur(8px)',
      duration: 0.3,
      ease: 'power2.in'
    }, 0)
    .to(menuItems, {
      opacity: 0,
      y: -30,
      scale: 0.85,
      filter: 'blur(8px)',
      duration: 0.4,
      ease: 'power2.in',
      stagger: {
        each: 0.04,
        from: 'end'
      }
    }, 0.05)
    .to(header, {
      opacity: 0,
      y: -20,
      filter: 'blur(8px)',
      duration: 0.3,
      ease: 'power2.in'
    }, 0.1)
    .to(backdrop, {
      opacity: 0,
      scale: 1.05,
      duration: 0.4,
      ease: 'power2.in'
    }, 0.15)
    .to(menuElement, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in'
    }, 0.2);
  }, []);

  // Toggle menu handler - memoized
  const toggleMobileMenu = useCallback(() => {
    if (mobileMenuOpen) {
      closeMobileMenu();
    } else {
      setMobileMenuOpen(true);
    }
  }, [mobileMenuOpen, closeMobileMenu]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      // Ensure body scroll is restored
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <nav
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        position: 'fixed',
        height: '3.5rem',
        isolation: 'isolate',
        zIndex: 99999
      }}
      role="navigation"
      aria-label="Main navigation"
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
              ref={hamburgerButtonRef}
              onClick={toggleMobileMenu}
              className="mobile-menu-btn"
              aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Premium Full-Screen Mobile Menu Overlay */}
      {!showLaunchApp && mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          className="fixed inset-0 z-[99999]"
          style={{
            width: '100vw',
            height: '100vh',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          {/* Premium backdrop with advanced blur */}
          <div
            className="absolute inset-0 mobile-menu-backdrop"
            onClick={closeMobileMenu}
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(180deg, rgba(10, 10, 18, 0.97) 0%, rgba(13, 17, 23, 0.98) 50%, rgba(10, 10, 18, 0.97) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}
            aria-hidden="true"
          />

          {/* Premium mesh gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 20% 20%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)
              `,
              mixBlendMode: 'screen',
              animation: 'premiumMeshMove 20s ease-in-out infinite',
            }}
            aria-hidden="true"
          />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }}
            aria-hidden="true"
          />

          {/* Premium floating orbs with enhanced blur */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div
              className="absolute mobile-menu-orb"
              style={{
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(6, 182, 212, 0.1) 40%, transparent 70%)',
                top: '5%',
                left: '-10%',
                filter: 'blur(80px)',
                animation: 'floatOrbPremium 10s ease-in-out infinite',
              }}
            />
            <div
              className="absolute mobile-menu-orb"
              style={{
                width: '350px',
                height: '350px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)',
                bottom: '10%',
                right: '-10%',
                filter: 'blur(70px)',
                animation: 'floatOrbPremium 12s ease-in-out infinite reverse',
              }}
            />
            <div
              className="absolute mobile-menu-orb"
              style={{
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.08) 40%, transparent 70%)',
                top: '50%',
                right: '15%',
                filter: 'blur(60px)',
                animation: 'floatOrbPremium 14s ease-in-out infinite',
                animationDelay: '-4s',
              }}
            />
          </div>

          {/* Noise texture overlay for depth */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.015]"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
              mixBlendMode: 'overlay',
            }}
            aria-hidden="true"
          />

          {/* Close button - Premium design */}
          <button
            ref={closeButtonRef}
            onClick={closeMobileMenu}
            className="absolute top-6 right-6 z-10 p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              willChange: 'transform'
            }}
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-white/90" aria-hidden="true" />
          </button>

          {/* Menu Content - Premium Layout */}
          <div
            className="relative z-10 flex flex-col h-full px-6 py-8 safe-area-inset"
            onClick={(e) => {
              // Close menu when clicking on empty space (not on links/buttons)
              if (e.target === e.currentTarget) {
                closeMobileMenu();
              }
            }}
          >
            {/* Header Section */}
            <div
              className="mobile-menu-header flex-shrink-0 pt-4 pb-8"
              onClick={(e) => {
                if (e.target === e.currentTarget) closeMobileMenu();
              }}
            >
              <h2
                id="mobile-menu-title"
                className="text-4xl font-bold text-center mb-2"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #6366f1 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}
              >
                Yield Delta
              </h2>
              <p className="text-gray-400 text-sm text-center font-medium tracking-wide">
                DeFi Yield Optimization
              </p>
            </div>

            {/* Main Menu Items - Premium Cards */}
            <nav
              className="flex-1 flex items-center justify-center"
              aria-label="Mobile menu navigation"
              onClick={(e) => {
                if (e.target === e.currentTarget) closeMobileMenu();
              }}
            >
              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                {NAV_LINKS.map((item) => (
                  <MobileMenuItem key={item.href} item={item} onClose={closeMobileMenu} />
                ))}
              </div>
            </nav>

            {/* Footer Section - Premium CTA */}
            <div
              className="mobile-menu-footer flex-shrink-0 pt-6 pb-8 space-y-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) closeMobileMenu();
              }}
            >
              {/* Deploy CTA - Premium gradient button */}
              <Link
                href="/vaults/deploy"
                onClick={closeMobileMenu}
                className="mobile-menu-item block w-full max-w-md mx-auto"
              >
                <div
                  className="relative flex items-center justify-center gap-3 p-5 rounded-2xl transition-all duration-500 overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(6, 182, 212, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    willChange: 'transform'
                  }}
                >
                  {/* Animated gradient overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
                    }}
                    aria-hidden="true"
                  />

                  <span className="text-2xl relative z-10 group-active:scale-110 transition-transform duration-300" aria-hidden="true">🚀</span>
                  <span
                    className="font-bold text-lg relative z-10"
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

              {/* Close hint */}
              <p className="text-gray-500 text-xs text-center font-medium">
                Tap anywhere to close or press ESC
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
