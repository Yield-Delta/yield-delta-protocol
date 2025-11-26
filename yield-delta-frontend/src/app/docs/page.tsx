export default function DocsHomePage() {
  return (
    <div className="docs-content">
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
          <strong>Impermanent Loss Protection</strong> - Advanced hedging strategies minimize IL risk
        </li>
        <li className="flex items-center">
          <span className="mr-2">📊</span>
          <strong>Real-time Analytics</strong> - Beautiful 3D visualizations powered by Three.js and GSAP
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
      
      <p className="mb-6">Choose your path to get started:</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">🧪 Testnet Setup</h3>
          <p className="text-muted-foreground mb-4">
            Configure your wallet for SEI testnet and get started with Yield Delta.
          </p>
          <a href="/docs/testnet-setup" className="text-primary hover:text-primary/80 font-medium">
            Setup Guide →
          </a>
        </div>

        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">📊 Understanding Metrics</h3>
          <p className="text-muted-foreground mb-4">
            Learn about Sharpe Ratio, APY, and other key metrics to evaluate vaults.
          </p>
          <a href="/docs/understanding-metrics" className="text-primary hover:text-primary/80 font-medium">
            Metrics Guide →
          </a>
        </div>

        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">🏗️ For Developers</h3>
          <p className="text-muted-foreground mb-4">
            Build on top of Yield Delta, integrate our APIs, or contribute to the protocol.
          </p>
          <a href="/docs/getting-started" className="text-primary hover:text-primary/80 font-medium">
            Development Guide →
          </a>
        </div>

        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">💰 For Liquidity Providers</h3>
          <p className="text-muted-foreground mb-4">
            Learn how to provide liquidity and maximize your yields with AI optimization.
          </p>
          <a href="/docs/features" className="text-primary hover:text-primary/80 font-medium">
            Features Overview →
          </a>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Core Features</h2>
      
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="border-b border-border">
              <th className="border border-border px-4 py-2 text-left">Feature</th>
              <th className="border border-border px-4 py-2 text-left">Description</th>
              <th className="border border-border px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2">
                <a href="/docs/features/ai-rebalancing" className="text-primary hover:text-primary/80">
                  AI-Powered Rebalancing
                </a>
              </td>
              <td className="border border-border px-4 py-2">Automated position optimization using ML</td>
              <td className="border border-border px-4 py-2">✅ Live</td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2">
                <a href="/docs/features/vaults" className="text-primary hover:text-primary/80">
                  Vault Management
                </a>
              </td>
              <td className="border border-border px-4 py-2">ERC-4626 compatible yield vaults</td>
              <td className="border border-border px-4 py-2">✅ Live</td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2">Liqui Chat</td>
              <td className="border border-border px-4 py-2">AI assistant for DeFi strategy</td>
              <td className="border border-border px-4 py-2">✅ Live</td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2">Market Analytics</td>
              <td className="border border-border px-4 py-2">Real-time market data and insights</td>
              <td className="border border-border px-4 py-2">✅ Live</td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2">
                <a href="/docs/demo-mode" className="text-primary hover:text-primary/80">
                  Demo Mode
                </a>
              </td>
              <td className="border border-border px-4 py-2">Risk-free testing environment</td>
              <td className="border border-border px-4 py-2">✅ Live</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Network Information</h2>

      <div className="bg-blue-500/10 border-2 border-blue-500/30 p-6 rounded-lg mb-6">
        <p className="text-lg font-semibold mb-2">🧪 Currently on SEI Testnet</p>
        <p className="mb-4">
          Yield Delta is deployed on <strong>SEI Atlantic-2 Testnet</strong>. You need to configure your wallet to use testnet before connecting.
        </p>
        <a href="/docs/testnet-setup" className="text-primary hover:text-primary/80 font-medium">
          → Follow the Testnet Setup Guide
        </a>
      </div>

      <ul className="space-y-2 mb-8">
        <li><strong>Network</strong>: SEI Atlantic-2 (Testnet)</li>
        <li><strong>Chain ID</strong>: 1328</li>
        <li><strong>Native Token</strong>: SEI (testnet)</li>
        <li><strong>Block Time</strong>: ~400ms</li>
        <li><strong>RPC URL</strong>: https://evm-rpc-testnet.sei-apis.com</li>
        <li><strong>Explorer</strong>: <a href="https://seitrace.com" className="text-primary hover:text-primary/80" target="_blank" rel="noopener noreferrer">SeiTrace</a></li>
        <li><strong>Faucet</strong>: <a href="https://atlantic-2.app.sei.io/faucet" className="text-primary hover:text-primary/80" target="_blank" rel="noopener noreferrer">Get Testnet Tokens</a></li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">Community & Support</h2>
      
      <ul className="space-y-2 mb-8">
        <li><strong>Discord</strong>: <a href="https://discord.gg/sei" className="text-primary hover:text-primary/80">Join our community</a></li>
        <li><strong>GitHub</strong>: <a href="https://github.com/yield-delta/yield-delta-protocol" className="text-primary hover:text-primary/80">Contribute to the project</a></li>
        <li><strong>Twitter</strong>: <a href="https://twitter.com/yielddelta" className="text-primary hover:text-primary/80">@SEI_DLP</a></li>
      </ul>

      <hr className="my-8" />

      <p className="text-center text-muted-foreground italic">
        Built with ❤️ by Yield Delta on SEI Network
      </p>
    </div>
  );
}

export const metadata = {
  title: 'Yield Delta Documentation',
  description: 'Complete guide to Yield Delta - AI-powered yield optimization on SEI Network',
};