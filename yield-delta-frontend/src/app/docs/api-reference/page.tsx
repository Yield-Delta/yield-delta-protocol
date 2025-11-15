export default function APIReferencePage() {
  return (
    <div className="docs-content">
      <h1 className="text-4xl font-bold mb-8">API Reference</h1>

      <p className="text-lg text-muted-foreground mb-8">
        Complete API reference for integrating with Yield Delta&apos;s AI-powered yield optimization platform on SEI Network.
      </p>

      <div className="mb-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Base URL</h3>
        <code className="text-sm">https://api.yielddelta.io/api</code>
        <p className="text-sm text-muted-foreground mt-2">Development: <code>http://localhost:3000/api</code></p>
      </div>

      <div className="mb-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Chain Information</h3>
        <ul className="space-y-1 text-sm">
          <li><strong>Network:</strong> SEI Network</li>
          <li><strong>Chain ID:</strong> 1328 (Testnet) / 1329 (Mainnet)</li>
          <li><strong>Block Time:</strong> ~400ms</li>
        </ul>
      </div>

      {/* Authentication */}
      <h2 className="text-2xl font-semibold mb-4">Authentication</h2>

      <p className="mb-4">
        Some endpoints require API key authentication. Include your API key in the request headers:
      </p>

      <pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
        <code>{`headers: {
  'X-API-Key': 'your-api-key-here',
  'Content-Type': 'application/json'
}`}</code>
      </pre>

      <p className="mb-6">
        <strong>Public endpoints</strong> (no authentication required): <code>/health</code>, <code>/market/data</code>, <code>/vaults</code>
      </p>

      {/* Rate Limiting */}
      <h2 className="text-2xl font-semibold mb-4">Rate Limiting</h2>

      <ul className="space-y-2 mb-6">
        <li><strong>Limit:</strong> 100 requests per minute</li>
        <li><strong>Headers:</strong></li>
        <ul className="ml-6 space-y-1">
          <li><code>X-RateLimit-Limit</code> - Total request limit</li>
          <li><code>X-RateLimit-Remaining</code> - Remaining requests</li>
          <li><code>X-RateLimit-Reset</code> - Reset timestamp</li>
        </ul>
      </ul>

      <hr className="my-8" />

      {/* Health Endpoints */}
      <h2 className="text-2xl font-semibold mb-4">Health</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">GET /health</h3>
        <p className="mb-4">Check API and service health status.</p>

        <h4 className="font-semibold mb-2">Response</h4>
        <pre className="bg-muted p-4 rounded-lg mb-4 overflow-x-auto">
          <code>{`{
  "status": "healthy",
  "timestamp": "2024-01-23T15:30:00Z",
  "version": "1.0.0",
  "chain": "SEI",
  "chainId": 1328,
  "services": {
    "api": "operational",
    "ai_engine": "operational",
    "blockchain": "operational"
  }
}`}</code>
        </pre>
      </div>

      <hr className="my-8" />

      {/* Vault Endpoints */}
      <h2 className="text-2xl font-semibold mb-4">Vaults</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">GET /vaults</h3>
        <p className="mb-4">List all vaults with optional filtering.</p>

        <h4 className="font-semibold mb-2">Query Parameters</h4>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="border-b border-border">
                <th className="border border-border px-4 py-2 text-left">Parameter</th>
                <th className="border border-border px-4 py-2 text-left">Type</th>
                <th className="border border-border px-4 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2"><code>strategy</code></td>
                <td className="border border-border px-4 py-2">string</td>
                <td className="border border-border px-4 py-2">Filter by strategy type</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2"><code>active</code></td>
                <td className="border border-border px-4 py-2">boolean</td>
                <td className="border border-border px-4 py-2">Filter by active status</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2"><code>page</code></td>
                <td className="border border-border px-4 py-2">number</td>
                <td className="border border-border px-4 py-2">Page number (default: 1)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2"><code>limit</code></td>
                <td className="border border-border px-4 py-2">number</td>
                <td className="border border-border px-4 py-2">Items per page (default: 50, max: 1000)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="font-semibold mb-2">Response</h4>
        <pre className="bg-muted p-4 rounded-lg mb-4 overflow-x-auto">
          <code>{`{
  "success": true,
  "data": [
    {
      "address": "0xf6A791e4773A60083AA29aaCCDc3bA5E900974fE",
      "name": "SEI-USDC Concentrated LP",
      "strategy": "concentrated_liquidity",
      "tokenA": "SEI",
      "tokenB": "USDC",
      "fee": 0.003,
      "tickSpacing": 60,
      "tvl": 1250000,
      "apy": 0.125,
      "chainId": 1328,
      "active": true,
      "performance": {
        "totalReturn": 0.087,
        "sharpeRatio": 1.45,
        "maxDrawdown": 0.023,
        "winRate": 0.68
      }
    }
  ],
  "count": 1,
  "chainId": 1328
}`}</code>
        </pre>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">POST /vaults</h3>
        <p className="mb-4">Create a new vault.</p>

        <h4 className="font-semibold mb-2">Request Body</h4>
        <pre className="bg-muted p-4 rounded-lg mb-4 overflow-x-auto">
          <code>{`{
  "name": "SEI-USDC Concentrated LP",
  "strategy": "concentrated_liquidity",
  "tokenA": "SEI",
  "tokenB": "USDC",
  "fee": 0.003,
  "tickSpacing": 60,
  "chainId": 1328
}`}</code>
        </pre>

        <h4 className="font-semibold mb-2">Strategy Types</h4>
        <ul className="space-y-1 mb-4">
          <li><code>concentrated_liquidity</code> - Concentrated liquidity positions</li>
          <li><code>yield_farming</code> - Yield farming strategies</li>
          <li><code>arbitrage</code> - Cross-DEX arbitrage</li>
          <li><code>hedge</code> - Hedging strategies</li>
          <li><code>stable_max</code> - Stablecoin maximizer</li>
          <li><code>sei_hypergrowth</code> - High-risk SEI growth strategy</li>
          <li><code>blue_chip</code> - Blue-chip token strategy</li>
          <li><code>delta_neutral</code> - Delta neutral market making</li>
        </ul>

        <h4 className="font-semibold mb-2">Response</h4>
        <pre className="bg-muted p-4 rounded-lg mb-4 overflow-x-auto">
          <code>{`{
  "success": true,
  "data": {
    "address": "0x1234567890123456789012345678901234567890",
    "name": "SEI-USDC Concentrated LP",
    "strategy": "concentrated_liquidity",
    "tokenA": "SEI",
    "tokenB": "USDC",
    "fee": 0.003,
    "tickSpacing": 60,
    "tvl": 0,
    "apy": 0,
    "chainId": 1328,
    "active": true
  },
  "message": "Vault created successfully",
  "chainId": 1328
}`}</code>
        </pre>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">GET /vaults/{`{address}`}</h3>
        <p className="mb-4">Get detailed vault information.</p>

        <h4 className="font-semibold mb-2">Parameters</h4>
        <ul className="space-y-1 mb-4">
          <li><code>address</code> - SEI vault address (required)</li>
        </ul>

        <h4 className="font-semibold mb-2">Response</h4>
        <pre className="bg-muted p-4 rounded-lg mb-4 overflow-x-auto">
          <code>{`{
  "success": true,
  "data": {
    "address": "0xf6A791e4773A60083AA29aaCCDc3bA5E900974fE",
    "name": "SEI-USDC Concentrated LP",
    "strategy": "concentrated_liquidity",
    "tokenA": "SEI",
    "tokenB": "USDC",
    "fee": 0.003,
    "tvl": 1250000,
    "apy": 0.125,
    "position": {
      "lowerTick": -887220,
      "upperTick": 887220,
      "liquidity": "1000000000000000000",
      "tokensOwed0": "50000000",
      "tokensOwed1": "125000000"
    },
    "risk": {
      "impermanentLoss": 0.023,
      "volatility": 0.18
    }
  },
  "chainId": 1328
}`}</code>
        </pre>
      </div>

      <hr className="my-8" />

      {/* AI Endpoints */}
      <h2 className="text-2xl font-semibold mb-4">AI Predictions</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">POST /ai/predict</h3>
        <p className="mb-4">Generate AI-powered liquidity range predictions.</p>

        <h4 className="font-semibold mb-2">Request Body</h4>
        <pre className="bg-muted p-4 rounded-lg mb-4 overflow-x-auto">
          <code>{`{
  "vaultAddress": "0xf6A791e4773A60083AA29aaCCDc3bA5E900974fE",
  "marketData": {
    "currentPrice": 0.485,
    "volume24h": 15678234,
    "volatility": 0.25,
    "liquidity": 125000000
  },
  "timeframe": "1d",
  "chainId": 1328
}`}</code>
        </pre>

        <h4 className="font-semibold mb-2">Timeframe Options</h4>
        <ul className="space-y-1 mb-4">
          <li><code>1h</code> - 1 hour prediction</li>
          <li><code>4h</code> - 4 hour prediction</li>
          <li><code>1d</code> - 1 day prediction (default)</li>
          <li><code>7d</code> - 7 day prediction</li>
          <li><code>30d</code> - 30 day prediction</li>
        </ul>

        <h4 className="font-semibold mb-2">Response</h4>
        <pre className="bg-muted p-4 rounded-lg mb-4 overflow-x-auto">
          <code>{`{
  "success": true,
  "data": {
    "vaultAddress": "0xf6A791e4773A60083AA29aaCCDc3bA5E900974fE",
    "prediction": {
      "optimalRange": {
        "lowerPrice": 0.425,
        "upperPrice": 0.545,
        "lowerTick": -12000,
        "upperTick": 12000,
        "currentTick": 0,
        "tickSpacing": 60
      },
      "confidence": 0.87,
      "expectedReturn": {
        "daily": 0.0012,
        "weekly": 0.0084,
        "monthly": 0.036
      },
      "riskMetrics": {
        "impermanentLossRisk": 0.18,
        "rebalanceFrequency": "medium",
        "maxDrawdown": 0.12,
        "sharpeRatio": 1.45
      },
      "seiOptimizations": {
        "gasOptimized": true,
        "fastFinality": true,
        "parallelExecution": true,
        "estimatedGasCost": 0.001,
        "blockConfirmations": 1
      },
      "signals": {
        "action": "balanced",
        "urgency": "medium",
        "nextRebalanceTime": "2024-01-24T03:30:00Z",
        "marketSentiment": "bullish"
      }
    },
    "metadata": {
      "modelVersion": "2.1.0",
      "features": [
        "price_momentum",
        "volatility_clustering",
        "liquidity_depth",
        "sei_specific_metrics"
      ],
      "processingTime": "~500ms",
      "chainOptimized": "SEI"
    }
  },
  "timestamp": "2024-01-23T15:30:00Z",
  "chainId": 1328
}`}</code>
        </pre>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">POST /ai/rebalance</h3>
        <p className="mb-4">Trigger or schedule vault rebalancing.</p>

        <h4 className="font-semibold mb-2">Request Body</h4>
        <pre className="bg-muted p-4 rounded-lg mb-4 overflow-x-auto">
          <code>{`{
  "vaultAddress": "0xf6A791e4773A60083AA29aaCCDc3bA5E900974fE",
  "strategy": "threshold_based",
  "parameters": {
    "newLowerTick": -15000,
    "newUpperTick": 15000,
    "slippageTolerance": 0.005,
    "maxGasPrice": 0.001,
    "deadline": 1706023800
  },
  "chainId": 1328
}`}</code>
        </pre>

        <h4 className="font-semibold mb-2">Strategy Options</h4>
        <ul className="space-y-1 mb-4">
          <li><code>immediate</code> - Execute rebalance immediately</li>
          <li><code>scheduled</code> - Schedule for future execution</li>
          <li><code>threshold_based</code> - Execute when thresholds are met (default)</li>
        </ul>

        <h4 className="font-semibold mb-2">Response</h4>
        <pre className="bg-muted p-4 rounded-lg mb-4 overflow-x-auto">
          <code>{`{
  "success": true,
  "data": {
    "transactionHash": "0xabc123...",
    "status": "pending",
    "gasUsed": "0.001",
    "executionTime": "450ms",
    "newPosition": {
      "lowerTick": -15000,
      "upperTick": 15000,
      "liquidity": "1050000000000000000"
    }
  },
  "timestamp": "2024-01-23T15:30:00Z",
  "chainId": 1328
}`}</code>
        </pre>
      </div>

      <hr className="my-8" />

      {/* Market Data Endpoints */}
      <h2 className="text-2xl font-semibold mb-4">Market Data</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">GET /market/data</h3>
        <p className="mb-4">Get current market data for SEI ecosystem tokens.</p>

        <h4 className="font-semibold mb-2">Query Parameters</h4>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="border-b border-border">
                <th className="border border-border px-4 py-2 text-left">Parameter</th>
                <th className="border border-border px-4 py-2 text-left">Type</th>
                <th className="border border-border px-4 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2"><code>symbols</code></td>
                <td className="border border-border px-4 py-2">string</td>
                <td className="border border-border px-4 py-2">Comma-separated symbols (e.g., &quot;SEI-USDC,ATOM-SEI&quot;)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2"><code>timeframe</code></td>
                <td className="border border-border px-4 py-2">string</td>
                <td className="border border-border px-4 py-2">Data timeframe (1m, 5m, 15m, 1h, 4h, 1d)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="font-semibold mb-2">Response</h4>
        <pre className="bg-muted p-4 rounded-lg mb-4 overflow-x-auto">
          <code>{`{
  "success": true,
  "data": [
    {
      "symbol": "SEI-USDC",
      "price": 0.485,
      "change24h": 0.023,
      "changePercent24h": 4.98,
      "volume24h": "14.2M",
      "volumeUSD24h": 14200000,
      "high24h": 0.492,
      "low24h": 0.467,
      "liquidity": {
        "totalLocked": 125000000,
        "sei": 257732474,
        "usdc": 125000000
      },
      "seiMetrics": {
        "blockTime": 0.4,
        "tps": 5000,
        "gasPrice": 0.000001,
        "validators": 100
      },
      "timestamp": "2024-01-23T15:30:00Z",
      "source": "SEI_DEX_AGGREGATOR"
    }
  ],
  "timestamp": "2024-01-23T15:30:00Z",
  "chainId": 1328
}`}</code>
        </pre>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">POST /market/data</h3>
        <p className="mb-4">Get historical market data.</p>

        <h4 className="font-semibold mb-2">Request Body</h4>
        <pre className="bg-muted p-4 rounded-lg mb-4 overflow-x-auto">
          <code>{`{
  "symbols": ["SEI-USDC", "ATOM-SEI"],
  "timeframe": "1h",
  "limit": 100,
  "chainId": 1328
}`}</code>
        </pre>

        <h4 className="font-semibold mb-2">Response</h4>
        <pre className="bg-muted p-4 rounded-lg mb-4 overflow-x-auto">
          <code>{`{
  "success": true,
  "data": [
    {
      "symbol": "SEI-USDC",
      "timeframe": "1h",
      "data": [
        {
          "timestamp": "2024-01-23T14:00:00Z",
          "open": 0.483,
          "high": 0.489,
          "low": 0.481,
          "close": 0.485,
          "volume": 7800000,
          "volumeUSD": 3783000,
          "trades": 453
        }
      ]
    }
  ],
  "metadata": {
    "timeframe": "1h",
    "limit": 100,
    "symbols": ["SEI-USDC", "ATOM-SEI"]
  },
  "timestamp": "2024-01-23T15:30:00Z",
  "chainId": 1328
}`}</code>
        </pre>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">GET /market/arbitrage</h3>
        <p className="mb-4">Scan for arbitrage opportunities across SEI DEXes.</p>

        <h4 className="font-semibold mb-2">Query Parameters</h4>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="border-b border-border">
                <th className="border border-border px-4 py-2 text-left">Parameter</th>
                <th className="border border-border px-4 py-2 text-left">Type</th>
                <th className="border border-border px-4 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2"><code>tokens</code></td>
                <td className="border border-border px-4 py-2">string</td>
                <td className="border border-border px-4 py-2">Comma-separated token symbols</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2"><code>minProfit</code></td>
                <td className="border border-border px-4 py-2">number</td>
                <td className="border border-border px-4 py-2">Minimum profit threshold (default: 0.005)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="font-semibold mb-2">Response</h4>
        <pre className="bg-muted p-4 rounded-lg mb-4 overflow-x-auto">
          <code>{`{
  "success": true,
  "data": [
    {
      "path": ["SEI", "USDC", "SEI"],
      "exchanges": ["DragonSwap", "SeiSwap"],
      "profit": 0.0125,
      "profitUSD": 156.25,
      "confidence": 0.92,
      "gasEstimate": 0.002,
      "netProfit": 0.0105,
      "execution": {
        "optimal": true,
        "urgency": "medium",
        "estimatedTime": "800ms"
      }
    }
  ],
  "scan": {
    "totalOpportunities": 1,
    "avgProfit": 0.0125,
    "timestamp": "2024-01-23T15:30:00Z"
  },
  "chainId": 1328
}`}</code>
        </pre>
      </div>

      <hr className="my-8" />

      {/* Smart Contract Integration */}
      <h2 className="text-2xl font-semibold mb-4">Smart Contract Integration</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Key Contracts</h3>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="border-b border-border">
                <th className="border border-border px-4 py-2 text-left">Contract</th>
                <th className="border border-border px-4 py-2 text-left">Description</th>
                <th className="border border-border px-4 py-2 text-left">Interface</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2"><code>StrategyVault</code></td>
                <td className="border border-border px-4 py-2">AI-driven dynamic liquidity vault</td>
                <td className="border border-border px-4 py-2"><code>IStrategyVault</code></td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2"><code>VaultFactory</code></td>
                <td className="border border-border px-4 py-2">Factory for creating vaults</td>
                <td className="border border-border px-4 py-2">-</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2"><code>AIOracle</code></td>
                <td className="border border-border px-4 py-2">Oracle for AI rebalancing decisions</td>
                <td className="border border-border px-4 py-2">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold mb-3">Core Functions</h3>

        <h4 className="font-semibold mb-2">StrategyVault</h4>
        <pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
          <code>{`// Deposit tokens and mint vault shares
function deposit(
  uint256 amount0,
  uint256 amount1,
  address recipient
) external returns (uint256 shares)

// Withdraw tokens and burn shares
function withdraw(
  uint256 shares,
  address recipient
) external returns (uint256 amount0, uint256 amount1)

// Execute AI-powered rebalance
function rebalance(
  int24 newTickLower,
  int24 newTickUpper,
  bytes calldata signature
) external`}</code>
        </pre>

        <h4 className="font-semibold mb-2">VaultFactory</h4>
        <pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
          <code>{`// Create a new strategy vault
function createVault(
  VaultCreationParams calldata params
) external payable returns (address vault)

// Get vault by creation salt
function getVault(bytes32 salt) external view returns (address)

// Get total number of vaults
function allVaultsLength() external view returns (uint256)`}</code>
        </pre>

        <h4 className="font-semibold mb-2">AIOracle</h4>
        <pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
          <code>{`// Register AI model
function registerAIModel(
  string calldata model,
  address signer
) external

// Submit rebalance request
function submitRebalanceRequest(
  address vault,
  int24 newTickLower,
  int24 newTickUpper,
  uint256 confidence,
  uint256 deadline
) external returns (bytes32 requestId)`}</code>
        </pre>
      </div>

      <hr className="my-8" />

      {/* Error Codes */}
      <h2 className="text-2xl font-semibold mb-4">Error Codes</h2>

      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="border-b border-border">
              <th className="border border-border px-4 py-2 text-left">Code</th>
              <th className="border border-border px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2"><code>400</code></td>
              <td className="border border-border px-4 py-2">Bad Request - Invalid request data</td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2"><code>401</code></td>
              <td className="border border-border px-4 py-2">Unauthorized - Invalid or missing API key</td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2"><code>404</code></td>
              <td className="border border-border px-4 py-2">Not Found - Resource not found</td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2"><code>429</code></td>
              <td className="border border-border px-4 py-2">Too Many Requests - Rate limit exceeded</td>
            </tr>
            <tr className="border-b border-border">
              <td className="border border-border px-4 py-2"><code>500</code></td>
              <td className="border border-border px-4 py-2">Internal Server Error - Server error</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* SEI-Specific Features */}
      <h2 className="text-2xl font-semibold mb-4">SEI-Specific Features</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Network Advantages</h3>
        <ul className="space-y-2 mb-6">
          <li><strong>Fast Finality:</strong> 400ms block time enables rapid rebalancing</li>
          <li><strong>Parallel Execution:</strong> Optimized transaction processing</li>
          <li><strong>Low Gas Costs:</strong> Efficient operations at minimal cost</li>
          <li><strong>MEV Protection:</strong> Built-in protection against frontrunning</li>
          <li><strong>EVM Compatibility:</strong> Standard Ethereum tooling works</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">Gas Estimates (in SEI)</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="border-b border-border">
                <th className="border border-border px-4 py-2 text-left">Operation</th>
                <th className="border border-border px-4 py-2 text-left">Estimated Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2">Swap</td>
                <td className="border border-border px-4 py-2">0.001 SEI</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2">Add Liquidity</td>
                <td className="border border-border px-4 py-2">0.002 SEI</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2">Remove Liquidity</td>
                <td className="border border-border px-4 py-2">0.002 SEI</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2">Rebalance</td>
                <td className="border border-border px-4 py-2">0.003 SEI</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2">Vault Creation</td>
                <td className="border border-border px-4 py-2">0.005 SEI</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold mb-3">Supported Tokens</h3>
        <ul className="space-y-1 mb-6">
          <li><code>SEI</code> - Native SEI token</li>
          <li><code>USDC</code> - USD Coin</li>
          <li><code>USDT</code> - Tether USD</li>
          <li><code>ATOM</code> - Cosmos Hub</li>
          <li><code>ETH</code> - Wrapped Ethereum</li>
          <li><code>BTC</code> - Wrapped Bitcoin</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">Supported DEXes</h3>
        <ul className="space-y-1 mb-6">
          <li><strong>DragonSwap</strong> - Primary DEX for SEI</li>
          <li><strong>SeiSwap</strong> - Native AMM</li>
          <li><strong>AstroPort</strong> - Multi-chain DEX</li>
          <li><strong>WhiteWhale</strong> - Cross-chain liquidity</li>
        </ul>
      </div>

      <hr className="my-8" />

      {/* Code Examples */}
      <h2 className="text-2xl font-semibold mb-4">Code Examples</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">JavaScript/TypeScript</h3>

        <h4 className="font-semibold mb-2">Fetching Vault Data</h4>
        <pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
          <code>{`const response = await fetch('https://api.yielddelta.io/api/vaults', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});

const { data } = await response.json();
console.log('Vaults:', data);`}</code>
        </pre>

        <h4 className="font-semibold mb-2">Creating a Vault</h4>
        <pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
          <code>{`const response = await fetch('https://api.yielddelta.io/api/vaults', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key',
  },
  body: JSON.stringify({
    name: 'My SEI Vault',
    strategy: 'concentrated_liquidity',
    tokenA: 'SEI',
    tokenB: 'USDC',
    fee: 0.003,
    tickSpacing: 60,
    chainId: 1328,
  }),
});

const { data } = await response.json();
console.log('Created vault:', data.address);`}</code>
        </pre>

        <h4 className="font-semibold mb-2">Getting AI Predictions</h4>
        <pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
          <code>{`const response = await fetch('https://api.yielddelta.io/api/ai/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key',
  },
  body: JSON.stringify({
    vaultAddress: '0xf6A791e4773A60083AA29aaCCDc3bA5E900974fE',
    marketData: {
      currentPrice: 0.485,
      volume24h: 15678234,
      volatility: 0.25,
      liquidity: 125000000,
    },
    timeframe: '1d',
    chainId: 1328,
  }),
});

const { data } = await response.json();
console.log('AI Prediction:', data.prediction);`}</code>
        </pre>

        <h4 className="font-semibold mb-2">Interacting with Smart Contracts (ethers.js)</h4>
        <pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
          <code>{`import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://evm-rpc-arctic-1.sei-apis.com');
const signer = new ethers.Wallet(privateKey, provider);

const vaultABI = [...]; // Your vault ABI
const vaultAddress = '0xf6A791e4773A60083AA29aaCCDc3bA5E900974fE';
const vault = new ethers.Contract(vaultAddress, vaultABI, signer);

// Deposit into vault
const amount0 = ethers.parseEther('10'); // 10 SEI
const amount1 = ethers.parseUnits('5', 6); // 5 USDC

const tx = await vault.deposit(amount0, amount1, signer.address);
await tx.wait();
console.log('Deposited successfully!');`}</code>
        </pre>
      </div>

      <hr className="my-8" />

      {/* Next Steps */}
      <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>

      <ul className="space-y-2 mb-8">
        <li>
          <a href="/docs/getting-started" className="text-primary hover:text-primary/80">
            Getting Started
          </a> - Set up your development environment
        </li>
        <li>
          <a href="/docs/features" className="text-primary hover:text-primary/80">
            Features
          </a> - Explore platform capabilities
        </li>
        <li>
          <a href="/vaults" className="text-primary hover:text-primary/80">
            Vaults
          </a> - Browse available vaults
        </li>
        <li>
          <a href="https://discord.gg/sei" className="text-primary hover:text-primary/80">
            Discord
          </a> - Join the community for support
        </li>
      </ul>

      <hr className="my-8" />

      <p className="text-center text-muted-foreground italic">
        Need help? Join our <a href="https://discord.gg/sei" className="text-primary hover:text-primary/80">Discord</a> or check the <a href="/docs" className="text-primary hover:text-primary/80">documentation</a>.
      </p>
    </div>
  );
}

export const metadata = {
  title: 'API Reference - Yield Delta Documentation',
  description: 'Complete API reference for Yield Delta - AI-powered yield optimization on SEI Network',
};
