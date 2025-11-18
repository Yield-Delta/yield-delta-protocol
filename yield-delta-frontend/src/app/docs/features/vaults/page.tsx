export default function VaultsPage() {
  return (
    <div className="docs-content">
      <h1 className="text-4xl font-bold mb-8">Vault Management</h1>
      
      <p className="text-lg text-muted-foreground mb-8">
        Yield Delta&apos;s vault system provides secure, gas-optimized yield generation using ERC-4626 compatible smart contracts with advanced AI optimization.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Overview</h2>
      
      <p className="mb-6">
        Our vault architecture combines traditional DeFi vault functionality with cutting-edge AI-powered optimization specifically designed for the SEI Network&apos;s high-speed environment.
      </p>

      <h3 className="text-xl font-semibold mb-4">Key Features</h3>
      
      <ul className="space-y-2 mb-8">
        <li><strong>ERC-4626 Compatibility</strong>: Standard vault interface for maximum interoperability</li>
        <li><strong>AI-Driven Optimization</strong>: Machine learning algorithms continuously optimize positions</li>
        <li><strong>Gas Efficiency</strong>: Optimized for SEI&apos;s 400ms block finality</li>
        <li><strong>Multiple Strategies</strong>: Support for various yield generation approaches</li>
        <li><strong>Auto-Compounding</strong>: Automatic reinvestment of rewards</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">Vault Types</h2>

      <h3 className="text-xl font-semibold mb-4">Concentrated Liquidity Vaults</h3>
      
      <p className="mb-4"><strong>Strategy</strong>: Automated concentrated liquidity provision on DEXs</p>
      
      <pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
        <code>{`interface ConcentratedLiquidityVault {
  tokenA: Token;
  tokenB: Token;
  fee: number;        // Pool fee tier (0.01%, 0.05%, 0.3%, 1%)
  tickSpacing: number; // Price range granularity
  strategy: {
    rebalanceFrequency: number; // Rebalance every N blocks
    riskTolerance: 'low' | 'medium' | 'high';
    maxSlippage: number;        // Maximum allowed slippage
  };
}`}</code>
      </pre>
      
      <p className="mb-4"><strong>Benefits</strong>:</p>
      <ul className="space-y-2 mb-4">
        <li>Higher capital efficiency than traditional LP</li>
        <li>AI-optimized tick ranges for maximum fees</li>
        <li>Automatic rebalancing to maintain optimal positions</li>
        <li>Impermanent loss protection through hedging</li>
      </ul>
      
      <p className="mb-8"><strong>Target APY</strong>: 15-45% depending on pair and market conditions</p>

      <h3 className="text-xl font-semibold mb-4">Yield Farming Vaults</h3>
      
      <p className="mb-4"><strong>Strategy</strong>: Automated yield farming across multiple protocols</p>
      
      <pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
        <code>{`interface YieldFarmingVault {
  protocols: Protocol[];      // Supported farming protocols
  assets: Token[];           // Supported deposit tokens
  strategy: {
    allocation: Record<string, number>; // Protocol allocation %
    harvestFrequency: number;          // Auto-harvest timing
    compoundingRatio: number;          // % of rewards to compound
  };
}`}</code>
      </pre>
      
      <p className="mb-4"><strong>Benefits</strong>:</p>
      <ul className="space-y-2 mb-4">
        <li>Diversified risk across multiple protocols</li>
        <li>Automated harvesting and compounding</li>
        <li>Gas-efficient batch operations</li>
        <li>AI-driven allocation optimization</li>
      </ul>
      
      <p className="mb-8"><strong>Target APY</strong>: 8-25% with lower volatility</p>

      <h3 className="text-xl font-semibold mb-4">Arbitrage Vaults</h3>
      
      <p className="mb-4"><strong>Strategy</strong>: Automated arbitrage opportunities across SEI ecosystem</p>
      
      <pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
        <code>{`interface ArbitrageVault {
  exchanges: DEX[];          // Monitored DEXs
  tokens: Token[];          // Arbitrage token pairs
  strategy: {
    minProfitThreshold: number;    // Minimum profit to execute
    maxPositionSize: number;       // Risk management
    executionSpeed: 'fast' | 'optimal'; // Speed vs profit optimization
  };
}`}</code>
      </pre>
      
      <p className="mb-4"><strong>Benefits</strong>:</p>
      <ul className="space-y-2 mb-4">
        <li>Market-neutral strategy</li>
        <li>Profit from price inefficiencies</li>
        <li>Low correlation with market movements</li>
        <li>High-frequency AI execution</li>
      </ul>
      
      <p className="mb-8"><strong>Target APY</strong>: 12-30% with consistent returns</p>

      <h2 className="text-2xl font-semibold mb-4">Vault Architecture</h2>

      <h3 className="text-xl font-semibold mb-4">Smart Contract Structure</h3>
      
      <pre className="bg-muted p-4 rounded-lg mb-8 overflow-x-auto">
        <code>{`contract YieldDeltaVault is ERC4626, Ownable, ReentrancyGuard {
    // Core vault state
    IERC20 public immutable asset;
    string public strategy;
    uint256 public totalAssets;
    uint256 public totalSupply;
    
    // Fee structure
    uint256 public managementFee = 200;    // 2% annual
    uint256 public performanceFee = 1000;  // 10% of profits
    uint256 public constant MAX_FEE = 2000; // 20% maximum
    
    // AI integration
    address public aiOracle;
    uint256 public lastRebalance;
    uint256 public rebalanceInterval = 3600; // 1 hour minimum
    
    // Position tracking
    struct Position {
        uint128 liquidity;
        int24 tickLower;
        int24 tickUpper;
        uint256 fees0;
        uint256 fees1;
    }
    
    mapping(address => Position) public positions;
    
    // Core ERC4626 functions
    function deposit(uint256 assets, address receiver) 
        external override nonReentrant returns (uint256 shares);
        
    function withdraw(uint256 assets, address receiver, address owner)
        external override nonReentrant returns (uint256 shares);
        
    function redeem(uint256 shares, address receiver, address owner)
        external override nonReentrant returns (uint256 assets);
    
    // AI-powered functions
    function aiRebalance(RebalanceParams calldata params) 
        external onlyAIOracle;
        
    function updateStrategy(StrategyParams calldata params)
        external onlyOwner;
}`}</code>
      </pre>

      <h2 className="text-2xl font-semibold mb-4">Understanding Vault Shares</h2>

      <p className="mb-4">
        Yield Delta vaults use a <strong>share-based system</strong>, similar to mutual funds or ETFs. When you deposit, you receive vault shares that represent your proportional ownership of the vault&apos;s total value.
      </p>

      <h3 className="text-xl font-semibold mb-4">Why Shares Instead of Direct Deposits?</h3>
      
      <p className="mb-4">
        The share system ensures <strong>fair distribution of profits and losses</strong> among all vault participants. As the vault earns yield, the value of each share increases - meaning your shares become worth more SEI over time.
      </p>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <span className="text-xl">💡</span> Key Concept
        </h4>
        <p className="mb-2">
          <strong>Share Price = Total Vault Assets ÷ Total Shares Outstanding</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          When you deposit, you receive fewer shares if the vault has performed well (higher share price), but the SEI value remains correct. When you withdraw, you burn shares and receive SEI based on the current share price.
        </p>
      </div>

      <h3 className="text-xl font-semibold mb-4">Share Calculation Examples</h3>

      <div className="space-y-6 mb-8">
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Scenario 1: First Deposit (Empty Vault)</h4>
          <ul className="space-y-1 text-sm ml-4">
            <li>You deposit: <strong>5 SEI</strong></li>
            <li>Vault total assets: <strong>0 SEI</strong></li>
            <li>Total shares: <strong>0</strong></li>
            <li>➡️ You receive: <strong>5 shares</strong> (1:1 ratio)</li>
          </ul>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Scenario 2: After Vault Earns 50% Profit</h4>
          <ul className="space-y-1 text-sm ml-4">
            <li>Vault grew from 100 SEI to <strong>150 SEI</strong></li>
            <li>Total shares: <strong>100</strong></li>
            <li>Share price: <strong>1.50 SEI per share</strong></li>
            <li>You deposit: <strong>5 SEI</strong></li>
            <li>➡️ You receive: <strong>3.333 shares</strong></li>
            <li>✅ Your share value: 3.333 × 1.50 = <strong>5 SEI</strong> (correct!)</li>
          </ul>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Scenario 3: Withdrawal After More Gains</h4>
          <ul className="space-y-1 text-sm ml-4">
            <li>Your shares: <strong>3.333</strong></li>
            <li>Vault grew further, share price now: <strong>1.75 SEI per share</strong></li>
            <li>Your share value: 3.333 × 1.75 = <strong>5.833 SEI</strong></li>
            <li>➡️ You earned: <strong>0.833 SEI profit</strong> (16.7% return on 5 SEI)</li>
          </ul>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4">What You See in the UI</h3>

      <pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
        <code>{`// Deposit Modal Preview
Depositing: 5 SEI
You will receive: 3.7594 shares
Rate: 1 SEI = 0.7519 shares
Share Price: 1.3300 SEI per share

// Your Position (After Deposit)
Your Shares: 3.7594
Share Value: 5.0000 SEI
Price/Share: 1.3300 SEI

// Withdraw Modal
Your Shares: 3.7594
Share Value: 5.8325 SEI  ← Value increased!
Price/Share: 1.5513 SEI  ← Share price went up
Profit: +0.8325 SEI (+16.65%)`}</code>
      </pre>

      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-8">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <span className="text-xl">⚠️</span> Important Notes
        </h4>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>Share prices are dynamic</strong> - They change based on vault performance, not fixed at 1:1
          </li>
          <li>
            <strong>Your SEI value is always accurate</strong> - Fewer shares × higher price = correct value
          </li>
          <li>
            <strong>Profits compound automatically</strong> - As vault earns, your shares become more valuable
          </li>
          <li>
            <strong>Early depositors benefit</strong> - Lower share prices when you deposit mean more potential gains
          </li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mb-4">User Interface</h2>

      <h3 className="text-xl font-semibold mb-4">Vault Dashboard</h3>
      
      <p className="mb-4">The vault interface provides comprehensive information and controls:</p>
      
      <pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
        <code>{`interface VaultDashboard {
  overview: {
    totalDeposited: number;
    currentValue: number;
    unrealizedPnL: number;
    realizedPnL: number;
    shares: number;
    apy: {
      current: number;
      average7d: number;
      average30d: number;
    };
  };
  
  performance: {
    timeline: PerformanceDataPoint[];
    benchmark: BenchmarkComparison;
    fees: FeeBreakdown;
    transactions: Transaction[];
  };
  
  actions: {
    deposit: (amount: number) => Promise<TransactionResult>;
    withdraw: (amount: number) => Promise<TransactionResult>;
    rebalance: () => Promise<TransactionResult>;
  };
}`}</code>
      </pre>

      <h3 className="text-xl font-semibold mb-4">Deposit Flow</h3>
      
      <ol className="space-y-2 mb-6">
        <li><strong>Select Vault</strong>: Choose from available vault strategies</li>
        <li><strong>Enter Amount</strong>: Specify deposit amount with balance validation</li>
        <li><strong>Preview Shares</strong>: See exactly how many shares you&apos;ll receive at current price</li>
        <li><strong>Review Terms</strong>: Confirm fees, risks, and expected returns</li>
        <li><strong>Execute Transaction</strong>: Submit to blockchain with gas estimation</li>
        <li><strong>Confirmation</strong>: Receive transaction hash and updated position with your new shares</li>
      </ol>

      <h3 className="text-xl font-semibold mb-4">Withdrawal Flow</h3>
      
      <ol className="space-y-2 mb-6">
        <li><strong>View Position</strong>: Check your current shares, value, and profit/loss</li>
        <li><strong>Enter Amount</strong>: Specify how many shares to withdraw</li>
        <li><strong>Preview SEI Amount</strong>: See exactly how much SEI you&apos;ll receive at current share price</li>
        <li><strong>Check Lock Period</strong>: Ensure any time locks have expired</li>
        <li><strong>Execute Transaction</strong>: Submit withdrawal to blockchain</li>
        <li><strong>Confirmation</strong>: Receive SEI in your wallet and updated position</li>
      </ol>

      <h2 className="text-2xl font-semibold mb-4">Risk Management</h2>

      <h3 className="text-xl font-semibold mb-4">Automated Risk Controls</h3>
      
      <pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
        <code>{`interface RiskManagement {
  maxDrawdown: number;        // Maximum acceptable loss
  stopLoss: number;          // Automatic exit threshold
  positionLimits: {
    maxSinglePosition: number;   // Per-position size limit
    maxTotalExposure: number;    // Total exposure limit
    diversificationMin: number;  // Minimum diversification
  };
  
  monitoring: {
    realTimeRisk: boolean;
    alertThresholds: AlertConfig;
    automaticActions: ActionConfig;
  };
}`}</code>
      </pre>

      <h3 className="text-xl font-semibold mb-4">Risk Metrics</h3>
      
      <div className="space-y-4 mb-8">
        <div>
          <h4 className="font-semibold">Value at Risk (VaR)</h4>
          <ul className="ml-4 space-y-1">
            <li>1-day VaR at 95% confidence</li>
            <li>Maximum expected loss over 24 hours</li>
            <li>Updated every block</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold">Sharpe Ratio</h4>
          <ul className="ml-4 space-y-1">
            <li>Risk-adjusted return measurement</li>
            <li>Calculated over rolling 30-day periods</li>
            <li>Compared against SEI staking baseline</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold">Maximum Drawdown</h4>
          <ul className="ml-4 space-y-1">
            <li>Largest peak-to-trough decline</li>
            <li>Historical and rolling metrics</li>
            <li>Protection mechanisms activated at thresholds</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Analytics & Reporting</h2>

      <h3 className="text-xl font-semibold mb-4">Performance Tracking</h3>
      
      <pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
        <code>{`interface VaultAnalytics {
  returns: {
    daily: number[];
    cumulative: number;
    benchmark: number;
    alpha: number;      // Excess return vs benchmark
    beta: number;       // Market correlation
  };
  
  risk: {
    volatility: number;
    sharpe: number;
    maxDrawdown: number;
    var95: number;
  };
  
  operations: {
    rebalanceCount: number;
    gasEfficiency: number;
    successRate: number;
    averageSlippage: number;
  };
}`}</code>
      </pre>

      <h3 className="text-xl font-semibold mb-4">Fee Transparency</h3>
      
      <p className="mb-4">All fees are clearly displayed and tracked:</p>
      
      <ul className="space-y-2 mb-8">
        <li><strong>Management Fee</strong>: 2% annually, charged continuously</li>
        <li><strong>Performance Fee</strong>: 10% of profits above high water mark</li>
        <li><strong>Gas Costs</strong>: Actual blockchain fees (typically 0.001-0.005 SEI)</li>
        <li><strong>Slippage</strong>: Market impact of large trades</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>

      <h3 className="text-xl font-semibold mb-4">Quick Deposit</h3>
      
      <ol className="space-y-2 mb-6">
        <li><strong>Connect Wallet</strong>: Ensure you have SEI for gas fees</li>
        <li><strong>Choose Vault</strong>: Select strategy based on risk preference</li>
        <li><strong>Deposit Funds</strong>: Minimum 1 SEI, maximum varies by vault</li>
        <li><strong>Monitor Performance</strong>: Track returns in real-time</li>
      </ol>

      <h3 className="text-xl font-semibold mb-4">Best Practices</h3>
      
      <ul className="space-y-2 mb-8">
        <li><strong>Start Small</strong>: Begin with small deposits to understand the system</li>
        <li><strong>Diversify</strong>: Use multiple vault strategies to reduce risk</li>
        <li><strong>Monitor Regularly</strong>: Check performance and rebalance if needed</li>
        <li><strong>Understand Fees</strong>: Factor in all costs when calculating returns</li>
      </ul>

      <hr className="my-8" />

      <p className="text-center text-muted-foreground italic">
        Vault management combines the security of traditional DeFi with the intelligence of AI optimization.
      </p>
    </div>
  );
}

export const metadata = {
  title: 'Vault Management - Yield Delta Documentation',
  description: 'Learn about Yield Delta&apos;s ERC-4626 compatible vaults with AI-powered optimization for maximum yield generation.',
};