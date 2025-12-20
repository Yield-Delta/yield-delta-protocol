'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DocsHomePage() {
  return (
    <div className="docs-content">
      {/* Back to Vaults Navigation */}
      <div className="mb-6">
        <Link href="/vaults">
          <Button
            variant="outline"
            className="gap-2 hover:gap-3 transition-all duration-300 group"
            style={{
              background: 'linear-gradient(135deg, rgba(155, 93, 229, 0.08) 0%, rgba(0, 245, 212, 0.06) 100%)',
              border: '1px solid rgba(155, 93, 229, 0.3)',
              backdropFilter: 'blur(10px)',
              minHeight: '44px',
              minWidth: '44px',
              padding: '0.75rem 1.25rem',
            }}
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="font-semibold">Back to Vaults</span>
          </Button>
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-8">Yield Delta Documentation</h1>
      
      <p className="text-lg text-muted-foreground mb-8">
        Welcome to the comprehensive documentation for <strong>Yield Delta</strong> - the next-generation AI-powered DeFi platform built on SEI Network.
      </p>

      <h2 className="text-2xl font-semibold mb-4">What is Yield Delta?</h2>
      
      <p className="mb-6">
        Yield Delta is an <strong>AI-powered yield optimization platform</strong> that combines cutting-edge machine learning with the lightning-fast SEI blockchain to maximize your DeFi yields while minimizing risk.
      </p>

      <h3 className="text-xl font-semibold mb-4">Key Innovations</h3>

      <ul className="space-y-2 mb-8">
        <li className="flex items-center">
          <span className="mr-2">🧠</span>
          <strong>AI-Powered Optimization</strong> - Machine learning algorithms continuously optimize liquidity positions
        </li>
        <li className="flex items-center">
          <span className="mr-2">⚡</span>
          <strong>SEI Network Speed</strong> - Leverage 400ms block finality for rapid rebalancing
        </li>
        <li className="flex items-center">
          <span className="mr-2">🛡️</span>
          <strong>68-70% Impermanent Loss Reduction</strong> - Proven advanced hedging strategies minimize IL risk
        </li>
        <li className="flex items-center">
          <span className="mr-2">📊</span>
          <strong>Real-time Analytics</strong> - Beautiful 3D visualizations powered by Three.js and GSAP
        </li>
      </ul>

      {/* Investor Highlight Section - IL Reduction Proof */}
      <div className="relative overflow-hidden rounded-2xl p-8 mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(20, 184, 166, 0.06) 100%)',
          border: '2px solid rgba(6, 182, 212, 0.3)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Investor Highlight
          </span>
        </div>

        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
          68-70% Reduction in Impermanent Loss
        </h2>

        <p className="text-lg mb-6 text-muted-foreground">
          Our proprietary AI-driven hedging mechanism has been proven to reduce impermanent loss by <strong className="text-cyan-400">68-70%</strong> compared to traditional AMM positions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-black/20 border border-cyan-500/20">
            <div className="text-2xl font-bold text-cyan-400 mb-1">68-70%</div>
            <div className="text-sm text-muted-foreground">IL Reduction</div>
          </div>
          <div className="p-4 rounded-lg bg-black/20 border border-teal-500/20">
            <div className="text-2xl font-bold text-teal-400 mb-1">400ms</div>
            <div className="text-sm text-muted-foreground">Rebalance Speed</div>
          </div>
          <div className="p-4 rounded-lg bg-black/20 border border-green-500/20">
            <div className="text-2xl font-bold text-green-400 mb-1">24/7</div>
            <div className="text-sm text-muted-foreground">AI Monitoring</div>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-3">How We Achieve This:</h3>

        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-3">
            <span className="text-cyan-400 mt-1">▸</span>
            <div>
              <strong className="text-cyan-300">Dynamic Range Adjustment:</strong>
              <span className="text-muted-foreground"> AI continuously optimizes liquidity ranges based on price action, volatility, and volume patterns</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-cyan-400 mt-1">▸</span>
            <div>
              <strong className="text-cyan-300">Predictive Rebalancing:</strong>
              <span className="text-muted-foreground"> Machine learning models predict market movements and rebalance positions before significant divergence occurs</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-cyan-400 mt-1">▸</span>
            <div>
              <strong className="text-cyan-300">Multi-Strategy Hedging:</strong>
              <span className="text-muted-foreground"> Combines concentrated liquidity, delta-neutral strategies, and arbitrage opportunities</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-cyan-400 mt-1">▸</span>
            <div>
              <strong className="text-cyan-300">SEI's Speed Advantage:</strong>
              <span className="text-muted-foreground"> 400ms block finality enables rapid position adjustments that aren't possible on slower chains</span>
            </div>
          </li>
        </ul>

        <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/30">
          <p className="text-sm">
            <strong className="text-cyan-400">Backtested Performance:</strong> Over 6 months of historical data across major pairs (ETH/USDC, WBTC/ETH, etc.) shows consistent 68-70% IL reduction compared to standard V3 positions with identical capital allocation.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <a
            href="/docs/impermanent-loss-reduction"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            <span>View Detailed Technical Analysis</span>
            <span className="transition-transform duration-300 hover:translate-x-1">→</span>
          </a>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
      
      <p className="mb-6">Choose your path to get started:</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Testnet Setup Card */}
        <a
          href="/docs/testnet-setup"
          className="group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Gradient overlay on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <span className="text-xl">🧪</span>
              </div>
              <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Testnet Setup
              </h3>
            </div>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              Configure your wallet for SEI testnet and get started with Yield Delta.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
              <span>Setup Guide</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </div>
          </div>

          {/* Subtle shadow effect */}
          <div className="absolute inset-0 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)' }}
          />
        </a>

        {/* Understanding Metrics Card */}
        <a
          href="/docs/understanding-metrics"
          className="group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Understanding Metrics
              </h3>
            </div>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              Learn about Sharpe Ratio, APY, and other key metrics to evaluate vaults.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
              <span>Metrics Guide</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </div>
          </div>

          <div className="absolute inset-0 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: '0 8px 32px rgba(168, 85, 247, 0.15)' }}
          />
        </a>

        {/* For Developers Card */}
        <a
          href="/docs/getting-started"
          className="group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <span className="text-xl">🏗️</span>
              </div>
              <h3 className="text-lg font-semibold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                For Developers
              </h3>
            </div>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              Build on top of Yield Delta, integrate our APIs, or contribute to the protocol.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <span>Development Guide</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </div>
          </div>

          <div className="absolute inset-0 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: '0 8px 32px rgba(34, 197, 94, 0.15)' }}
          />
        </a>

        {/* For Liquidity Providers Card */}
        <a
          href="/docs/features"
          className="group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(234, 179, 8, 0.05) 100%)',
            border: '1px solid rgba(249, 115, 22, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 179, 8, 0.08) 100%)',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                <span className="text-xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                For Liquidity Providers
              </h3>
            </div>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              Learn how to provide liquidity and maximize your yields with AI optimization.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400">
              <span>Features Overview</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </div>
          </div>

          <div className="absolute inset-0 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: '0 8px 32px rgba(249, 115, 22, 0.15)' }}
          />
        </a>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Core Features</h2>
      
      <div className="docs-table-container mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left">Feature</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors duration-200">
              <td className="px-4 py-3">
                <a href="/docs/features/ai-rebalancing" className="text-primary hover:text-primary/80 font-medium">
                  AI-Powered Rebalancing
                </a>
              </td>
              <td className="px-4 py-3 text-muted-foreground">Automated position optimization using ML</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Live
                </span>
              </td>
            </tr>
            <tr className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors duration-200">
              <td className="px-4 py-3">
                <a href="/docs/features/vaults" className="text-primary hover:text-primary/80 font-medium">
                  Vault Management
                </a>
              </td>
              <td className="px-4 py-3 text-muted-foreground">ERC-4626 compatible yield vaults</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Live
                </span>
              </td>
            </tr>
            <tr className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors duration-200">
              <td className="px-4 py-3">
                <span className="font-medium">Liqui Chat</span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">AI assistant for DeFi strategy</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Live
                </span>
              </td>
            </tr>
            <tr className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors duration-200">
              <td className="px-4 py-3">
                <span className="font-medium">Market Analytics</span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">Real-time market data and insights</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Live
                </span>
              </td>
            </tr>
            <tr className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors duration-200">
              <td className="px-4 py-3">
                <a href="/docs/demo-mode" className="text-primary hover:text-primary/80 font-medium">
                  Demo Mode
                </a>
              </td>
              <td className="px-4 py-3 text-muted-foreground">Risk-free testing environment</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Live
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Network Information</h2>

      <div className="docs-alert-base docs-alert-info mb-6">
        <p className="text-lg font-semibold mb-2">🧪 Currently on SEI Testnet</p>
        <p className="mb-4">
          Yield Delta is deployed on <strong>SEI Atlantic-2 Testnet</strong>. You need to configure your wallet to use testnet before connecting.
        </p>
        <a href="/docs/testnet-setup" className="text-primary hover:text-primary/80 font-medium">
          → Follow the Testnet Setup Guide
        </a>
      </div>

      <div className="docs-glass-card mb-8">
        <ul className="space-y-2">
          <li><strong>Network</strong>: SEI Atlantic-2 (Testnet)</li>
          <li><strong>Chain ID</strong>: 1328</li>
          <li><strong>Native Token</strong>: SEI (testnet)</li>
          <li><strong>Block Time</strong>: ~400ms</li>
          <li><strong>RPC URL</strong>: https://evm-rpc-testnet.sei-apis.com</li>
          <li><strong>Explorer</strong>: <a href="https://seitrace.com" className="text-primary hover:text-primary/80" target="_blank" rel="noopener noreferrer">SeiTrace</a></li>
          <li><strong>Faucet</strong>: <a href="https://atlantic-2.app.sei.io/faucet" className="text-primary hover:text-primary/80" target="_blank" rel="noopener noreferrer">Get Testnet Tokens</a></li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Community & Support</h2>
      
      <ul className="space-y-2 mb-8">
        <li><strong>Discord</strong>: <a href="https://discord.gg/sei" className="text-primary hover:text-primary/80">Join our community</a></li>
        <li><strong>GitHub</strong>: <a href="https://github.com/yield-delta/yield-delta-protocol" className="text-primary hover:text-primary/80">Contribute to the project</a></li>
        <li><strong>Twitter</strong>: <a href="https://x.com/yielddelta" className="text-primary hover:text-primary/80">@yielddelta</a></li>
      </ul>

      <hr className="my-8" />

      <p className="text-center text-muted-foreground italic">
        Built with ❤️ by Yield Delta on SEI Network
      </p>
    </div>
  );
}