import React from 'react'
import Link from 'next/link'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Yield Delta Documentation
            </h1>
            <p className="text-xl text-muted-foreground">
              Welcome to the comprehensive documentation for <strong>Yield Delta</strong> - the next-generation AI-powered DeFi platform built on SEI Network.
            </p>
          </div>

          {/* What is Yield Delta */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What is Yield Delta?</h2>
            <p className="mb-4">
              Yield Delta is an <strong>AI-powered yield optimization platform</strong> that combines cutting-edge machine learning with the lightning-fast SEI blockchain to maximize your DeFi yields while minimizing risk.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <div className="p-4 border rounded-lg bg-card">
                <h3 className="font-semibold mb-2">🧠 AI-Powered Optimization</h3>
                <p className="text-sm text-muted-foreground">Machine learning algorithms continuously optimize liquidity positions</p>
              </div>
              <div className="p-4 border rounded-lg bg-card">
                <h3 className="font-semibold mb-2">⚡ SEI Network Speed</h3>
                <p className="text-sm text-muted-foreground">Leverage 400ms block finality for rapid rebalancing</p>
              </div>
              <div className="p-4 border rounded-lg bg-card">
                <h3 className="font-semibold mb-2">🛡️ Impermanent Loss Protection</h3>
                <p className="text-sm text-muted-foreground">Advanced hedging strategies minimize IL risk</p>
              </div>
              <div className="p-4 border rounded-lg bg-card">
                <h3 className="font-semibold mb-2">📊 Real-time Analytics</h3>
                <p className="text-sm text-muted-foreground">Beautiful 3D visualizations powered by Three.js and GSAP</p>
              </div>
            </div>
          </section>

          {/* Quick Start */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
            <p className="mb-4">Choose your path to get started:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-card">
                <h3 className="text-lg font-semibold mb-2">🏗️ For Developers</h3>
                <p className="text-muted-foreground mb-4">Build on top of Yield Delta, integrate our APIs, or contribute to the protocol.</p>
                <Link href="/docs/getting-started" className="text-primary hover:text-primary/80 font-medium">
                  Development Guide →
                </Link>
              </div>
              
              <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-card">
                <h3 className="text-lg font-semibold mb-2">💰 For Liquidity Providers</h3>
                <p className="text-muted-foreground mb-4">Learn how to provide liquidity and maximize your yields with AI optimization.</p>
                <Link href="/docs/features" className="text-primary hover:text-primary/80 font-medium">
                  Features Overview →
                </Link>
              </div>
            </div>
          </section>

          {/* Core Features */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Core Features</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-3 text-left">Feature</th>
                    <th className="border border-border p-3 text-left">Description</th>
                    <th className="border border-border p-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3">
                      <Link href="/docs/features/ai-rebalancing" className="text-primary hover:text-primary/80">
                        AI-Powered Rebalancing
                      </Link>
                    </td>
                    <td className="border border-border p-3">Automated position optimization using ML</td>
                    <td className="border border-border p-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">✅ Live</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">
                      <Link href="/docs/features/vaults" className="text-primary hover:text-primary/80">
                        Vault Management
                      </Link>
                    </td>
                    <td className="border border-border p-3">ERC-4626 compatible yield vaults</td>
                    <td className="border border-border p-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">✅ Live</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">
                      <Link href="/docs/features/ai-chat" className="text-primary hover:text-primary/80">
                        Liqui Chat
                      </Link>
                    </td>
                    <td className="border border-border p-3">AI assistant for DeFi strategy</td>
                    <td className="border border-border p-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">✅ Live</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">
                      <Link href="/docs/features/market-data" className="text-primary hover:text-primary/80">
                        Market Analytics
                      </Link>
                    </td>
                    <td className="border border-border p-3">Real-time market data and insights</td>
                    <td className="border border-border p-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">✅ Live</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">
                      <Link href="/docs/demo-mode" className="text-primary hover:text-primary/80">
                        Demo Mode
                      </Link>
                    </td>
                    <td className="border border-border p-3">Risk-free testing environment</td>
                    <td className="border border-border p-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">✅ Live</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Network Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Network Information</h2>
            <div className="bg-card border rounded-lg p-6">
              <ul className="space-y-2">
                <li><strong>Chain ID:</strong> 713715 (SEI Devnet) / 1328 (SEI Mainnet)</li>
                <li><strong>Native Token:</strong> SEI</li>
                <li><strong>Block Time:</strong> ~400ms</li>
                <li><strong>Explorer:</strong> <a href="https://seitrace.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">SeiTrace</a></li>
              </ul>
            </div>
          </section>

          {/* Community & Support */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Community &amp; Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a 
                href="https://discord.gg/sei" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 border rounded-lg hover:shadow-lg transition-shadow bg-card text-center"
              >
                <h3 className="font-semibold mb-2">Discord</h3>
                <p className="text-sm text-muted-foreground">Join our community</p>
              </a>
              
              <a 
                href="https://github.com/your-org/sei-dlp-core" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 border rounded-lg hover:shadow-lg transition-shadow bg-card text-center"
              >
                <h3 className="font-semibold mb-2">GitHub</h3>
                <p className="text-sm text-muted-foreground">Contribute to the project</p>
              </a>
              
              <a 
                href="https://twitter.com/sei_dlp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 border rounded-lg hover:shadow-lg transition-shadow bg-card text-center"
              >
                <h3 className="font-semibold mb-2">Twitter</h3>
                <p className="text-sm text-muted-foreground">@SEI_DLP</p>
              </a>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
            <p><em>Built with ❤️ by Yield Delta on SEI Network</em></p>
          </footer>
        </div>
      </div>
    </div>
  )
}