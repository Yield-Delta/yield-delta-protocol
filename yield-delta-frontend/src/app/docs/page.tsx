import React from 'react'
import Link from 'next/link'

export default function DocsPage() {
  return (
    <div className="docs-container">
      {/* Hero Section */}
      <header className="docs-animate-in docs-animate-delay-1">
        <h1 className="docs-title">
          Yield Delta Documentation
        </h1>
        <p className="docs-subtitle">
          Welcome to the comprehensive documentation for <strong>Yield Delta</strong> - the next-generation AI-powered DeFi platform built on SEI Network.
        </p>
      </header>

      {/* What is Yield Delta Section */}
      <section className="docs-animate-in docs-animate-delay-2">
        <h2 className="docs-section-title">What is Yield Delta?</h2>
        <p className="docs-text-large">
          Yield Delta is an <strong>AI-powered yield optimization platform</strong> that combines cutting-edge machine learning with the lightning-fast SEI blockchain to maximize your DeFi yields while minimizing risk.
        </p>
        
        {/* Key Benefits List */}
        <ul className="docs-list docs-list--primary">
          <li><strong>AI-Driven Intelligence:</strong> Advanced machine learning algorithms continuously analyze market conditions and optimize your liquidity positions</li>
          <li><strong>Lightning Fast Execution:</strong> Built on SEI Network with 400ms block finality for near-instant transaction processing</li>
          <li><strong>Risk Mitigation:</strong> Sophisticated hedging strategies protect against impermanent loss and market volatility</li>
          <li><strong>User-Friendly Interface:</strong> Beautiful 3D visualizations and intuitive controls make DeFi accessible to everyone</li>
          <li><strong>Maximum Yields:</strong> Intelligent rebalancing ensures your assets are always working optimally across multiple protocols</li>
        </ul>
        
        {/* Key Innovation Features */}
        <div className="docs-feature-grid">
          <div className="docs-feature-card">
            <div className="docs-feature-icon">🧠</div>
            <h3 className="docs-feature-title">AI-Powered Optimization</h3>
            <p className="docs-feature-description">
              Machine learning algorithms continuously optimize liquidity positions using advanced predictive analytics and real-time market data analysis.
            </p>
          </div>
          
          <div className="docs-feature-card">
            <div className="docs-feature-icon">⚡</div>
            <h3 className="docs-feature-title">SEI Network Speed</h3>
            <p className="docs-feature-description">
              Leverage 400ms block finality for rapid rebalancing and near-instant transaction execution, ensuring optimal position management.
            </p>
          </div>
          
          <div className="docs-feature-card">
            <div className="docs-feature-icon">🛡️</div>
            <h3 className="docs-feature-title">Impermanent Loss Protection</h3>
            <p className="docs-feature-description">
              Advanced hedging strategies and dynamic risk management algorithms minimize IL exposure while maximizing yield potential.
            </p>
          </div>
          
          <div className="docs-feature-card">
            <div className="docs-feature-icon">📊</div>
            <h3 className="docs-feature-title">Real-time Analytics</h3>
            <p className="docs-feature-description">
              Beautiful 3D visualizations powered by Three.js and GSAP provide deep insights into your portfolio performance and market trends.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="docs-animate-in docs-animate-delay-3">
        <h2 className="docs-section-title">Quick Start</h2>
        <p className="docs-text-large">
          Choose your path to get started with Yield Delta:
        </p>
        
        <div className="docs-quickstart-grid">
          <Link href="/docs/getting-started" className="docs-quickstart-card">
            <h3 className="docs-quickstart-title">🏗️ For Developers</h3>
            <p className="docs-quickstart-description">
              Build on top of Yield Delta, integrate our APIs, or contribute to the protocol. Access comprehensive guides, code examples, and development tools.
            </p>
            <div className="docs-quickstart-link">
              Development Guide
            </div>
          </Link>
          
          <Link href="/docs/features" className="docs-quickstart-card">
            <h3 className="docs-quickstart-title">💰 For Liquidity Providers</h3>
            <p className="docs-quickstart-description">
              Learn how to provide liquidity and maximize your yields with AI optimization. Start earning competitive returns today.
            </p>
            <div className="docs-quickstart-link">
              Features Overview
            </div>
          </Link>
        </div>
      </section>

      {/* Core Features Overview */}
      <section>
        <h2 className="docs-section-title">Core Features Overview</h2>
        <p className="docs-text">
          Yield Delta offers a comprehensive suite of tools and features designed to maximize your DeFi experience:
        </p>
        
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
                  <Link href="/docs/features/ai-rebalancing" className="docs-network-link">
                    AI-Powered Rebalancing
                  </Link>
                </td>
                <td>Automated position optimization using advanced ML algorithms and predictive analytics</td>
                <td>
                  <span className="docs-status-badge docs-status-live">
                    <span className="docs-status-indicator"></span>
                    Live
                  </span>
                </td>
              </tr>
              <tr>
                <td>
                  <Link href="/docs/features/vaults" className="docs-network-link">
                    Vault Management
                  </Link>
                </td>
                <td>ERC-4626 compatible yield vaults with automatic compounding and gas optimization</td>
                <td>
                  <span className="docs-status-badge docs-status-live">
                    <span className="docs-status-indicator"></span>
                    Live
                  </span>
                </td>
              </tr>
              <tr>
                <td>
                  <Link href="/docs/features/ai-chat" className="docs-network-link">
                    Liqui Chat AI Assistant
                  </Link>
                </td>
                <td>Intelligent AI assistant for DeFi strategy optimization and portfolio management</td>
                <td>
                  <span className="docs-status-badge docs-status-live">
                    <span className="docs-status-indicator"></span>
                    Live
                  </span>
                </td>
              </tr>
              <tr>
                <td>
                  <Link href="/docs/features/market-data" className="docs-network-link">
                    Market Analytics
                  </Link>
                </td>
                <td>Real-time market data, advanced trading insights, and performance metrics</td>
                <td>
                  <span className="docs-status-badge docs-status-live">
                    <span className="docs-status-indicator"></span>
                    Live
                  </span>
                </td>
              </tr>
              <tr>
                <td>
                  <Link href="/docs/demo-mode" className="docs-network-link">
                    Demo Trading Mode
                  </Link>
                </td>
                <td>Risk-free testing environment with simulated funds for strategy validation</td>
                <td>
                  <span className="docs-status-badge docs-status-live">
                    <span className="docs-status-indicator"></span>
                    Live
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Architecture Overview */}
      <section>
        <h2 className="docs-section-title">Platform Architecture</h2>
        <p className="docs-text">
          Yield Delta is built on a sophisticated multi-layer architecture that ensures scalability, security, and optimal performance:
        </p>
        
        <div className="docs-info-card">
          <h3 className="docs-subsection-title">System Components</h3>
          <ul className="docs-list docs-list--ordered">
            <li><strong>Frontend Layer:</strong> Next.js application with Three.js 3D visualizations and responsive design</li>
            <li><strong>API Gateway:</strong> Node.js backend with RESTful endpoints and WebSocket real-time connections</li>
            <li><strong>AI Engine:</strong> Python-based machine learning service using ONNX runtime for model inference</li>
            <li><strong>Smart Contracts:</strong> Solidity contracts deployed on SEI Network with ERC-4626 vault standards</li>
            <li><strong>Liqui Chat Agent:</strong> ElizaOS-powered AI assistant for intelligent DeFi guidance</li>
            <li><strong>Blockchain Integration:</strong> Direct connection to SEI Network with 400ms block finality</li>
          </ul>
          
          <div className="docs-info-card" style="margin-top: var(--docs-space-xl); background: var(--docs-glass-bg-hover);">
            <pre className="docs-text" style="font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace; font-size: var(--docs-font-sm); line-height: 1.4; color: var(--docs-text-secondary); margin: 0;">
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   AI Engine     │
│   Next.js       │◄──►│   Node.js       │◄──►│   Python/ONNX   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │ Smart Contracts │    │ ML Optimization │
         │              │   Solidity      │    │ Risk Models     │
         │              └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  ElizaOS Agent  │    │   SEI Network   │    │ Portfolio Mgmt  │
│  Liqui Chat     │    │   400ms blocks  │    │ & Rebalancing   │
└─────────────────┘    └─────────────────┘    └─────────────────┘</pre>
          </div>
        </div>
      </section>

      {/* Network Information */}
      <section>
        <h2 className="docs-section-title">SEI Network Details</h2>
        <p className="docs-text">
          Yield Delta is built on the SEI Network, a high-performance blockchain optimized for DeFi applications:
        </p>
        
        <div className="docs-info-card">
          <h3 className="docs-subsection-title">Network Specifications</h3>
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
              <span className="docs-network-label">Block Finality</span>
              <span className="docs-network-value">~400ms (Ultra-fast)</span>
            </li>
            <li>
              <span className="docs-network-label">Consensus</span>
              <span className="docs-network-value">Tendermint BFT</span>
            </li>
            <li>
              <span className="docs-network-label">Block Explorer</span>
              <a 
                href="https://seitrace.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="docs-network-link"
              >
                SeiTrace →
              </a>
            </li>
            <li>
              <span className="docs-network-label">RPC Endpoint</span>
              <span className="docs-network-value">https://rpc.sei-apis.com</span>
            </li>
          </ul>
          
          <h3 className="docs-subsection-title">Why SEI Network?</h3>
          <ul className="docs-list docs-list--features">
            <li><strong>Ultra-Fast Finality:</strong> 400ms block times enable near-instant transaction confirmation</li>
            <li><strong>Low Gas Costs:</strong> Optimized for DeFi with minimal transaction fees</li>
            <li><strong>EVM Compatible:</strong> Full Ethereum Virtual Machine compatibility for seamless development</li>
            <li><strong>Parallel Processing:</strong> Advanced transaction processing for higher throughput</li>
          </ul>
        </div>
      </section>

      {/* Getting Help & Support */}
      <section>
        <h2 className="docs-section-title">Getting Help & Support</h2>
        <p className="docs-text">
          Need assistance? Our community and support channels are here to help you succeed with Yield Delta:
        </p>
        
        <div className="docs-community-grid">
          <a 
            href="https://discord.gg/sei" 
            target="_blank" 
            rel="noopener noreferrer"
            className="docs-community-card"
          >
            <h3 className="docs-community-title">💬 Discord Community</h3>
            <p className="docs-community-description">Join our active community for real-time support, discussions, and protocol updates</p>
          </a>
          
          <a 
            href="https://github.com/your-org/yield-delta-protocol" 
            target="_blank" 
            rel="noopener noreferrer"
            className="docs-community-card"
          >
            <h3 className="docs-community-title">⭐ GitHub Repository</h3>
            <p className="docs-community-description">Contribute to the protocol, report issues, and access open-source code</p>
          </a>
          
          <a 
            href="https://twitter.com/yield_delta" 
            target="_blank" 
            rel="noopener noreferrer"
            className="docs-community-card"
          >
            <h3 className="docs-community-title">🐦 Twitter Updates</h3>
            <p className="docs-community-description">Follow @yield_delta for the latest news, features, and protocol announcements</p>
          </a>
        </div>
        
        <div className="docs-info-card">
          <h3 className="docs-subsection-title">Additional Resources</h3>
          <ul className="docs-list">
            <li><strong>Technical Support:</strong> For integration help and technical questions, visit our GitHub Discussions</li>
            <li><strong>Bug Reports:</strong> Found an issue? Please report it on our GitHub Issues page</li>
            <li><strong>Feature Requests:</strong> Have ideas for improvements? Share them in our Discord #feature-requests channel</li>
            <li><strong>Documentation Feedback:</strong> Help us improve these docs by submitting feedback or corrections</li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="docs-footer">
        <p>Built with precision and passion by the Yield Delta team on SEI Network</p>
        <p style="font-size: var(--docs-font-xs); margin-top: var(--docs-space-md); opacity: 0.7;">© 2024 Yield Delta Protocol. Open source and community-driven.</p>
      </footer>
    </div>
  )
}