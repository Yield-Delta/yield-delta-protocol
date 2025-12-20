'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import {
  Vault,
  TrendingUp,
  Target,
  PieChart,
  RefreshCw,
  BookOpen,
  CandlestickChart,
  Menu,
  X
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/vaults', label: 'Vaults', icon: Vault },
  { href: '/market', label: 'Market', icon: TrendingUp },
  { href: '/charts', label: 'Charts', icon: CandlestickChart },
  { href: '/market-sentiment', label: 'Sentiment', icon: Target },
  { href: '/dashboard', label: 'Portfolio', icon: PieChart },
  { href: '/portfolio/rebalance', label: 'Rebalance', icon: RefreshCw },
  { href: '/docs', label: 'Docs', icon: BookOpen },
];

export function GooeyNavigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* SVG Filter for Gooey Effect */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="gooey-effect">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="gooey"
            />
            <feBlend in="SourceGraphic" in2="gooey" />
          </filter>
        </defs>
      </svg>

      {/* Desktop Navigation - Show at 900px+ */}
      <nav className="hidden min-[900px]:flex items-center justify-center w-full">
        <motion.div
          className="flex items-center gap-6 px-6 py-2.5 rounded-full backdrop-blur-xl min-w-fit"
          style={{
            filter: 'url(#gooey-effect)',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            overflow: 'visible',
          }}
          layout
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className="relative px-3 py-2 rounded-full cursor-pointer whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  layout
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(20, 184, 166, 0.3) 100%)',
                        boxShadow: '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(20, 184, 166, 0.4)',
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                  <div className="relative z-10">
                    <span
                      className={`text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'text-cyan-400'
                          : 'text-white hover:text-cyan-400'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      </nav>

      {/* Mobile Floating Action Button - Hide at 900px+ */}
      <div className="max-[899px]:block hidden fixed bottom-6 right-6 z-50">
        <motion.button
          className="relative w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.8) 0%, rgba(20, 184, 166, 0.8) 100%)',
            boxShadow: '0 4px 20px rgba(6, 182, 212, 0.5), 0 8px 40px rgba(20, 184, 166, 0.4)',
            filter: 'url(#gooey-effect)',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-6 h-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Mobile Menu Items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute bottom-20 right-0 flex flex-col gap-3"
              style={{ filter: 'url(#gooey-effect)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {NAV_ITEMS.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <motion.div
                    key={item.href}
                    initial={{ scale: 0, x: 20 }}
                    animate={{
                      scale: 1,
                      x: 0,
                      transition: {
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                        delay: index * 0.05,
                      }
                    }}
                    exit={{
                      scale: 0,
                      x: 20,
                      transition: {
                        delay: (NAV_ITEMS.length - index - 1) * 0.05,
                      }
                    }}
                  >
                    <Link href={item.href} onClick={() => setIsOpen(false)}>
                      <motion.div
                        className="relative flex items-center gap-3 px-4 py-3 rounded-full min-w-[140px]"
                        style={{
                          background: isActive
                            ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.8) 0%, rgba(20, 184, 166, 0.8) 100%)'
                            : 'rgba(15, 23, 42, 0.9)',
                          border: `1px solid ${isActive ? 'rgba(6, 182, 212, 0.5)' : 'rgba(6, 182, 212, 0.25)'}`,
                          boxShadow: isActive
                            ? '0 4px 20px rgba(6, 182, 212, 0.4)'
                            : '0 2px 10px rgba(0, 0, 0, 0.3)',
                        }}
                        whileHover={{ scale: 1.05, x: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                        <span
                          className={`text-sm font-medium ${
                            isActive ? 'text-white' : 'text-gray-200'
                          }`}
                        >
                          {item.label}
                        </span>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
