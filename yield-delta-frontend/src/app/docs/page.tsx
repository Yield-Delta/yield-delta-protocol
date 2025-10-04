import React from 'react'
import Link from 'next/link'

export default function DocsPage() {
  return (
    <div className="docs-container docs-prose">
      {/* Hero Section */}
      <header className="docs-animate-in">
        <h1 className="docs-title">
          Yield Delta Documentation
        </h1>
        <p className="docs-subtitle">
          Welcome to the comprehensive documentation for <strong>Yield Delta</strong> - the next-generation AI-powered DeFi platform built on SEI Network.
        </p>
      </header>

      {/* What is Yield Delta Section */}
      <section className="docs-animate-in docs-animate-delay-1">
        <h2 className="docs-section-title">What is Yield Delta?</h2>
        <p className="text-lg mb-8 text-docs-text-secondary leading-relaxed">
          Yield Delta is an <strong className="text-docs-text-primary">AI-powered yield optimization platform</strong> that combines cutting-edge machine learning with the lightning-fast SEI blockchain to maximize your DeFi yields while minimizing risk.
        </p>
        
        {/* Key Innovation Features */}
        <div className="docs-feature-grid">
          <div className="docs-feature-card">
            <span className="docs-feature-icon">🧠</span>
            <h3 className="docs-feature-title">AI-Powered Optimization</h3>
            <p className="docs-feature-description">
              Machine learning algorithms continuously optimize liquidity positions using advanced predictive analytics
            </p>
          </div>
          
          <div className="docs-feature-card">
            <span className="docs-feature-icon">⚡</span>
            <h3 className="docs-feature-title">SEI Network Speed</h3>
            <p className="docs-feature-description">
              Leverage 400ms block finality for rapid rebalancing and near-instant transaction execution
            </p>
          </div>
          
          <div className="docs-feature-card">
            <span className="docs-feature-icon">🛡️</span>
            <h3 className="docs-feature-title">Impermanent Loss Protection</h3>
            <p className="docs-feature-description">
              Advanced hedging strategies and dynamic risk management minimize IL exposure
            </p>
          </div>
          
          <div className="docs-feature-card">
            <span className="docs-feature-icon">📊</span>
            <h3 className="docs-feature-title">Real-time Analytics</h3>
            <p className="docs-feature-description">
              Beautiful 3D visualizations powered by Three.js and GSAP provide deep insights
            </p>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="docs-animate-in docs-animate-delay-2">
        <h2 className="docs-section-title">Quick Start</h2>
        <p className="text-lg mb-8 text-docs-text-secondary">
          Choose your path to get started with Yield Delta:
        </p>
        
        <div className="docs-quickstart-grid">
          <Link href="/docs/getting-started" className="docs-quickstart-card">
            <h3 className="docs-quickstart-title">🏗️ For Developers</h3>
            <p className="docs-quickstart-description">
              Build on top of Yield Delta, integrate our APIs, or contribute to the protocol. Access comprehensive guides and examples.
            </p>
            <span className="docs-quickstart-link">
              Development Guide →
            </span>
          </Link>
          
          <Link href="/docs/features" className="docs-quickstart-card">
            <h3 className="docs-quickstart-title">💰 For Liquidity Providers</h3>
            <p className="docs-quickstart-description">
              Learn how to provide liquidity and maximize your yields with AI optimization. Start earning today.
            </p>
            <span className="docs-quickstart-link">
              Features Overview →
            </span>
          </Link>
        </div>
      </section>

      {/* Core Features Table */}
      <section className="docs-animate-in docs-animate-delay-3">
        <h2 className="docs-section-title">Core Features</h2>
        <div className="docs-table-container">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Link href="/docs/features/ai-rebalancing" className="docs-network-link font-medium">
                    AI-Powered Rebalancing
                  </Link>
                </td>
                <td>Automated position optimization using ML algorithms</td>
                <td>
                  <span className="docs-status-badge docs-status-live">✅ Live</span>
                </td>
              </tr>
              <tr>
                <td>
                  <Link href="/docs/features/vaults" className="docs-network-link font-medium">
                    Vault Management
                  </Link>
                </td>
                <td>ERC-4626 compatible yield vaults with auto-compounding</td>
                <td>
                  <span className="docs-status-badge docs-status-live">✅ Live</span>
                </td>
              </tr>
              <tr>
                <td>
                  <Link href="/docs/features/ai-chat" className="docs-network-link font-medium">
                    Liqui Chat
                  </Link>
                </td>
                <td>AI assistant for DeFi strategy and portfolio optimization</td>
                <td>
                  <span className="docs-status-badge docs-status-live">✅ Live</span>
                </td>
              </tr>
              <tr>
                <td>
                  <Link href="/docs/features/market-data" className="docs-network-link font-medium">
                    Market Analytics
                  </Link>
                </td>
                <td>Real-time market data and advanced trading insights</td>
                <td>
                  <span className="docs-status-badge docs-status-live">✅ Live</span>
                </td>
              </tr>
              <tr>
                <td>
                  <Link href="/docs/demo-mode" className="docs-network-link font-medium">
                    Demo Mode
                  </Link>
                </td>
                <td>Risk-free testing environment with simulated funds</td>
                <td>
                  <span className="docs-status-badge docs-status-live">✅ Live</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Architecture Overview */}
      <section>
        <h2 className="docs-section-title">Architecture Overview</h2>
        <div className="docs-network-card">
          <div className="bg-docs-glass-bg border border-docs-glass-border rounded-lg p-6">
            <pre className="text-sm text-docs-text-secondary overflow-x-auto">
{`┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   AI Engine     │
│   Next.js       │◄──►│   Node.js       │◄──►│   Python/ONNX   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │ Smart Contracts │    │ ML Models       │
         │              │   Solidity      │    │ Optimization    │
         │              └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  ElizaOS Agent  │    │   SEI Network   │    │ Risk Assessment │
│  Liqui Chat     │    │   400ms blocks  │    │ & Rebalancing   │
└─────────────────┘    └─────────────────┘    └─────────────────┘`}
            </pre>
          </div>
        </div>
      </section>

      {/* Network Information */}
      <section>
        <h2 className="docs-section-title">Network Information</h2>
        <div className="docs-network-card">
          <ul className="docs-network-list">
            <li>
              <span className="docs-network-label">Chain ID</span>
              <span className="docs-network-value">713715 (SEI Devnet) / 1328 (SEI Mainnet)</span>
            </li>
            <li>
              <span className="docs-network-label">Native Token</span>
              <span className="docs-network-value">SEI</span>
            </li>
            <li>
              <span className="docs-network-label">Block Time</span>
              <span className="docs-network-value">~400ms</span>
            </li>
            <li>
              <span className="docs-network-label">Explorer</span>
              <a 
                href="https://seitrace.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="docs-network-link"
              >
                SeiTrace
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* Community & Support */}
      <section>
        <h2 className="docs-section-title">Community & Support</h2>
        <div className="docs-community-grid">
          <a 
            href="https://discord.gg/sei" 
            target="_blank" 
            rel="noopener noreferrer"
            className="docs-community-card"
          >
            <h3 className="docs-community-title">💬 Discord</h3>
            <p className="docs-community-description">Join our community for support and discussions</p>
          </a>
          
          <a 
            href="https://github.com/your-org/sei-dlp-core" 
            target="_blank" 
            rel="noopener noreferrer"
            className="docs-community-card"
          >
            <h3 className="docs-community-title">⭐ GitHub</h3>
            <p className="docs-community-description">Contribute to the protocol and access source code</p>
          </a>
          
          <a 
            href="https://twitter.com/sei_dlp" 
            target="_blank" 
            rel="noopener noreferrer"
            className="docs-community-card"
          >
            <h3 className="docs-community-title">🐦 Twitter</h3>
            <p className="docs-community-description">Follow @SEI_DLP for latest updates</p>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="docs-footer">
        <p>Built with ❤️ by Yield Delta on SEI Network</p>
      </footer>
    </div>
  )
}