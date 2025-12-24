import { DocsBackButton } from '@/components/docs/DocsBackButton'

export default function FeaturesPage() {
  return (
    <div className="docs-content rounded-2xl p-8"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.3) 100%)',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      <DocsBackButton />

      <h1 className="text-4xl font-bold mb-8">Core Features</h1>
      
      <p className="text-lg text-muted-foreground mb-8">
        Yield Delta combines cutting-edge AI with the lightning-fast SEI blockchain to deliver unprecedented DeFi experiences.
      </p>

      <h2 className="text-2xl font-semibold mb-4">🏦 Vault Management</h2>
      
      <p className="mb-4"><strong>ERC-4626 Compatible Yield Vaults</strong></p>
      
      <p className="mb-4">Our vault system provides secure, gas-optimized yield generation:</p>
      
      <ul className="space-y-2 mb-6">
        <li><strong>Multiple Strategies</strong>: Concentrated liquidity, yield farming, arbitrage, hedge</li>
        <li><strong>Auto-Compounding</strong>: Rewards automatically reinvested</li>
        <li><strong>Risk Management</strong>: AI-powered risk assessment and mitigation</li>
        <li><strong>Transparent Fees</strong>: Clear fee structure with performance incentives</li>
      </ul>
      
      <p className="mb-8">
        <a href="/docs/features/vaults" className="text-primary hover:text-primary/80">
          Learn more about Vaults →
        </a>
      </p>

      <h2 className="text-2xl font-semibold mb-4">🤖 AI-Powered Rebalancing</h2>
      
      <p className="mb-4"><strong>Machine Learning Optimization</strong></p>
      
      <p className="mb-4">Advanced AI algorithms continuously optimize your positions:</p>
      
      <ul className="space-y-2 mb-6">
        <li><strong>Real-time Analysis</strong>: Market conditions analyzed every block</li>
        <li><strong>Optimal Ranges</strong>: ML-calculated tick ranges for maximum efficiency</li>
        <li><strong>Risk Assessment</strong>: Sophisticated risk modeling and prediction</li>
        <li><strong>Execution Timing</strong>: Perfect timing leveraging SEI&apos;s 400ms finality</li>
      </ul>
      
      <p className="mb-8">
        <a href="/docs/features/ai-rebalancing" className="text-primary hover:text-primary/80">
          Explore AI Rebalancing →
        </a>
      </p>

      <h2 className="text-2xl font-semibold mb-4">💬 Liqui Chat Assistant</h2>
      
      <p className="mb-4"><strong>ElizaOS-Powered AI Agent</strong></p>
      
      <p className="mb-4">Your personal DeFi strategy advisor:</p>
      
      <ul className="space-y-2 mb-6">
        <li><strong>Natural Language</strong>: Ask questions in plain English</li>
        <li><strong>Strategy Recommendations</strong>: Personalized advice based on your portfolio</li>
        <li><strong>Market Insights</strong>: Real-time market analysis and trends</li>
        <li><strong>Educational</strong>: Learn DeFi concepts through conversation</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">📊 Market Analytics</h2>
      
      <p className="mb-4"><strong>Real-time Data & Insights</strong></p>
      
      <p className="mb-4">Comprehensive market intelligence:</p>
      
      <ul className="space-y-2 mb-6">
        <li><strong>Live Price Feeds</strong>: Real-time prices across SEI ecosystem</li>
        <li><strong>Liquidity Metrics</strong>: TVL, utilization rates, yield data</li>
        <li><strong>Arbitrage Detection</strong>: Cross-DEX opportunity identification</li>
        <li><strong>Historical Analysis</strong>: Trend analysis and backtesting</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">💧 Advanced Liquidity Provision</h2>
      
      <p className="mb-4"><strong>Concentrated Liquidity Optimization</strong></p>
      
      <p className="mb-4">Next-generation liquidity provision:</p>
      
      <ul className="space-y-2 mb-6">
        <li><strong>Tick Range Optimization</strong>: AI-calculated optimal ranges</li>
        <li><strong>Impermanent Loss Protection</strong>: Advanced hedging strategies</li>
        <li><strong>Capital Efficiency</strong>: Maximize returns with minimal capital</li>
        <li><strong>Auto-Rebalancing</strong>: Maintain optimal positions automatically</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">🔥 SEI Network Advantages</h2>
      
      <p className="mb-4"><strong>Built for Speed & Efficiency</strong></p>
      
      <p className="mb-4">Leveraging SEI&apos;s unique advantages:</p>
      
      <ul className="space-y-2 mb-6">
        <li><strong>400ms Finality</strong>: Lightning-fast transaction confirmation</li>
        <li><strong>Low Gas Costs</strong>: Minimal fees (typically 0.001-0.005 SEI)</li>
        <li><strong>Parallel Execution</strong>: Multiple transactions processed simultaneously</li>
        <li><strong>MEV Protection</strong>: Built-in MEV resistance mechanisms</li>
        <li><strong>EVM Compatibility</strong>: Ethereum tooling and contracts work seamlessly</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">🛡️ Security Features</h2>
      
      <p className="mb-4"><strong>Enterprise-Grade Security</strong></p>
      
      <p className="mb-4">Multi-layered security approach:</p>
      
      <ul className="space-y-2 mb-6">
        <li><strong>Smart Contract Audits</strong>: Comprehensive security reviews</li>
        <li><strong>Time Locks</strong>: Protection against governance attacks</li>
        <li><strong>Emergency Pauses</strong>: Circuit breakers for unusual conditions</li>
        <li><strong>Formal Verification</strong>: Mathematical proof of contract correctness</li>
        <li><strong>Bug Bounty</strong>: Ongoing security research incentives</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">🎯 Performance Metrics</h2>
      
      <p className="mb-4"><strong>Transparent & Verifiable</strong></p>
      
      <p className="mb-4">Real-time performance tracking:</p>
      
      <ul className="space-y-2 mb-6">
        <li><strong>APY Calculation</strong>: Accurate yield calculations</li>
        <li><strong>Risk Metrics</strong>: Sharpe ratio, maximum drawdown, volatility</li>
        <li><strong>Benchmark Comparison</strong>: Performance vs market indices</li>
        <li><strong>Historical Performance</strong>: Long-term track record</li>
        <li><strong>Fee Transparency</strong>: All costs clearly displayed</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">🌐 Cross-Chain Features</h2>
      
      <p className="mb-4"><strong>Multi-Chain Compatibility</strong></p>
      
      <p className="mb-4">Expanding beyond SEI:</p>
      
      <ul className="space-y-2 mb-6">
        <li><strong>Bridge Integration</strong>: Seamless asset bridging</li>
        <li><strong>Cross-Chain Arbitrage</strong>: Profit from price differences</li>
        <li><strong>Unified Interface</strong>: Manage positions across chains</li>
        <li><strong>Yield Aggregation</strong>: Find best yields anywhere</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">📱 User Experience</h2>
      
      <p className="mb-4"><strong>Intuitive & Beautiful</strong></p>
      
      <p className="mb-4">Modern, responsive interface:</p>
      
      <ul className="space-y-2 mb-6">
        <li><strong>3D Visualizations</strong>: Beautiful vault and portfolio displays</li>
        <li><strong>Real-time Updates</strong>: Live data without page refreshes</li>
        <li><strong>Mobile Optimized</strong>: Full functionality on all devices</li>
        <li><strong>Dark/Light Mode</strong>: Customizable appearance</li>
        <li><strong>Accessibility</strong>: WCAG 2.1 compliant</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">🔗 Integration Features</h2>
      
      <p className="mb-4"><strong>Developer-Friendly APIs</strong></p>
      
      <p className="mb-4">Easy integration for builders:</p>
      
      <ul className="space-y-2 mb-6">
        <li><strong>RESTful APIs</strong>: Standard HTTP endpoints</li>
        <li><strong>WebSocket Streams</strong>: Real-time data feeds</li>
        <li><strong>GraphQL</strong>: Flexible data querying</li>
        <li><strong>SDKs</strong>: Official libraries for popular languages</li>
        <li><strong>Webhooks</strong>: Event notifications</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">🎮 Demo Mode</h2>
      
      <p className="mb-4"><strong>Risk-Free Testing</strong></p>
      
      <p className="mb-4">Try everything safely:</p>
      
      <ul className="space-y-2 mb-6">
        <li><strong>Realistic Simulations</strong>: Full UX without blockchain interaction</li>
        <li><strong>Educational Tool</strong>: Learn strategies safely</li>
        <li><strong>Demo Videos</strong>: Perfect for presentations</li>
        <li><strong>Development Testing</strong>: Test integrations safely</li>
      </ul>
      
      <p className="mb-8">
        <a href="/docs/demo-mode" className="text-primary hover:text-primary/80">
          Enable Demo Mode →
        </a>
      </p>

      <hr className="my-8" />

      <h2 className="text-2xl font-semibold mb-4">Feature Comparison</h2>
      
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="border-b border-border">
              <th className="border border-border px-4 py-2 text-left">Feature</th>
              <th className="border border-border px-4 py-2 text-left">Traditional DeFi</th>
              <th className="border border-border px-4 py-2 text-left">Yield Delta</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2">Rebalancing</td>
              <td className="border border-border px-4 py-2">Manual</td>
              <td className="border border-border px-4 py-2">AI-Automated</td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2">Speed</td>
              <td className="border border-border px-4 py-2">12s+ finality</td>
              <td className="border border-border px-4 py-2">400ms finality</td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2">Gas Costs</td>
              <td className="border border-border px-4 py-2">High ($5-50)</td>
              <td className="border border-border px-4 py-2">Low ($0.001)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2">Strategy</td>
              <td className="border border-border px-4 py-2">Static</td>
              <td className="border border-border px-4 py-2">Dynamic AI</td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2">Risk Management</td>
              <td className="border border-border px-4 py-2">Manual</td>
              <td className="border border-border px-4 py-2">AI-Powered</td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2">User Experience</td>
              <td className="border border-border px-4 py-2">Complex</td>
              <td className="border border-border px-4 py-2">Intuitive</td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2">Analytics</td>
              <td className="border border-border px-4 py-2">Basic</td>
              <td className="border border-border px-4 py-2">Advanced AI</td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2">Support</td>
              <td className="border border-border px-4 py-2">Community</td>
              <td className="border border-border px-4 py-2">AI Assistant</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
      
      <p className="mb-4">Ready to experience the future of DeFi?</p>
      
      <ol className="space-y-2 mb-8">
        <li>
          <a href="/docs/getting-started" className="text-primary hover:text-primary/80">
            <strong>Setup Development Environment</strong>
          </a> - Get up and running in minutes
        </li>
        <li>
          <a href="/docs/demo-mode" className="text-primary hover:text-primary/80">
            <strong>Try Demo Mode</strong>
          </a> - Experience features risk-free
        </li>
        <li>
          <a href="/docs/features/vaults" className="text-primary hover:text-primary/80">
            <strong>Deploy Your First Vault</strong>
          </a> - Start earning optimized yields
        </li>
        <li>
          <strong>Chat with Liqui</strong> - Get personalized strategy advice
        </li>
      </ol>

      <hr className="my-8" />

      <p className="text-center text-muted-foreground italic">
        Experience the power of Yield Delta - AI-optimized DeFi on SEI Network
      </p>
    </div>
  );
}

export const metadata = {
  title: 'Core Features - Yield Delta Documentation',
  description: 'Discover the core features of Yield Delta: AI-powered rebalancing, vault management, market analytics, and more.',
};