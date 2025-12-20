import { DocsBackButton } from '@/components/docs/DocsBackButton'
import { CodeBlock } from '@/components/docs/CodeBlock'

export default function SmartContractsPage() {
  return (
    <div className="docs-content">
      <DocsBackButton />

      <h1 className="text-4xl font-bold mb-8">Smart Contracts</h1>

      <p className="text-lg text-muted-foreground mb-8">
        Comprehensive guide to Yield Delta&apos;s smart contracts deployed on SEI Network.
        Our contracts implement AI-powered yield optimization, automated rebalancing, and secure vault management.
      </p>

      <div className="mb-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Network Information</h3>
        <ul className="space-y-1 text-sm">
          <li><strong>Chain:</strong> SEI Network (EVM)</li>
          <li><strong>Testnet Chain ID:</strong> 1328</li>
          <li><strong>Mainnet Chain ID:</strong> 1329</li>
          <li><strong>Block Time:</strong> ~400ms</li>
          <li><strong>Finality:</strong> Instant</li>
        </ul>
      </div>

      {/* Core Contracts */}
      <h2 className="text-2xl font-semibold mb-4">Core Contracts</h2>

      <div className="space-y-6 mb-8">
        <div className="p-4 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">StrategyVault</h3>
          <p className="text-sm text-muted-foreground mb-3">
            AI-driven dynamic liquidity vault that automatically manages concentrated liquidity positions.
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Interface:</strong> <code>IStrategyVault</code></p>
            <p><strong>Testnet Address:</strong> <code>0xf6A791e4773A60083AA29aaCCDc3bA5E900974fE</code></p>
            <p><strong>Features:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• Automated position management</li>
              <li>• AI-powered rebalancing</li>
              <li>• Compound interest generation</li>
              <li>• Impermanent loss mitigation</li>
            </ul>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">VaultFactory</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Factory contract for creating new strategy vaults with different configurations.
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Interface:</strong> <code>IVaultFactory</code></p>
            <p><strong>Testnet Address:</strong> <code>0x1234567890123456789012345678901234567890</code></p>
            <p><strong>Features:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• Vault creation with custom parameters</li>
              <li>• Strategy template management</li>
              <li>• Access control and permissions</li>
              <li>• Vault registry maintenance</li>
            </ul>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">AIOracle</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Oracle contract that provides AI-powered predictions for optimal rebalancing.
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Interface:</strong> <code>IAIOracle</code></p>
            <p><strong>Testnet Address:</strong> <code>0xABCDEF1234567890ABCDEF1234567890ABCDEF12</code></p>
            <p><strong>Features:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• AI model registration</li>
              <li>• Rebalance signal generation</li>
              <li>• Confidence scoring</li>
              <li>• Multi-signature validation</li>
            </ul>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">RewardsDistributor</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Manages and distributes rewards to vault participants.
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Interface:</strong> <code>IRewardsDistributor</code></p>
            <p><strong>Testnet Address:</strong> <code>0x9876543210987654321098765432109876543210</code></p>
            <p><strong>Features:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• Automated reward distribution</li>
              <li>• Multi-token reward support</li>
              <li>• Vesting schedules</li>
              <li>• Performance-based bonuses</li>
            </ul>
          </div>
        </div>
      </div>

      <hr className="my-8" />

      {/* Contract Interfaces */}
      <h2 className="text-2xl font-semibold mb-4">Contract Interfaces</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">IStrategyVault</h3>
        <p className="mb-4">Core interface for interacting with strategy vaults.</p>

        <CodeBlock language="solidity" code={`interface IStrategyVault {
    // Events
    event Deposited(address indexed user, uint256 amount0, uint256 amount1, uint256 shares);
    event Withdrawn(address indexed user, uint256 shares, uint256 amount0, uint256 amount1);
    event Rebalanced(int24 newTickLower, int24 newTickUpper, uint256 timestamp);
    event FeesCollected(uint256 fee0, uint256 fee1);

    // View functions
    function totalValueLocked() external view returns (uint256);
    function getCurrentPosition() external view returns (
        int24 tickLower,
        int24 tickUpper,
        uint128 liquidity
    );
    function getUserShares(address user) external view returns (uint256);
    function getPerformanceMetrics() external view returns (
        uint256 apy,
        uint256 sharpeRatio,
        uint256 maxDrawdown
    );

    // State-changing functions
    function deposit(
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min,
        address recipient,
        uint256 deadline
    ) external returns (uint256 shares, uint256 amount0, uint256 amount1);

    function withdraw(
        uint256 shares,
        uint256 amount0Min,
        uint256 amount1Min,
        address recipient,
        uint256 deadline
    ) external returns (uint256 amount0, uint256 amount1);

    function rebalance(
        int24 newTickLower,
        int24 newTickUpper,
        uint256 deadline,
        bytes calldata aiSignature
    ) external;

    function collectFees() external returns (uint256 fee0, uint256 fee1);
    function compound() external;
}`} />
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">IVaultFactory</h3>
        <p className="mb-4">Factory interface for creating and managing vaults.</p>

        <CodeBlock language="solidity" code={`interface IVaultFactory {
    // Structs
    struct VaultParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickSpacing;
        string name;
        string strategy;
        address oracle;
        uint256 rebalanceThreshold;
    }

    // Events
    event VaultCreated(
        address indexed vault,
        address indexed creator,
        address token0,
        address token1,
        string strategy
    );

    // Functions
    function createVault(
        VaultParams calldata params
    ) external payable returns (address vault);

    function getVault(bytes32 salt) external view returns (address);
    function getVaultByIndex(uint256 index) external view returns (address);
    function allVaultsLength() external view returns (uint256);
    function isVault(address vault) external view returns (bool);
    function setVaultImplementation(address newImplementation) external;
    function updateOracle(address vault, address newOracle) external;
}`} />
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">IAIOracle</h3>
        <p className="mb-4">Oracle interface for AI-powered predictions.</p>

        <CodeBlock language="solidity" code={`interface IAIOracle {
    // Structs
    struct RebalanceSignal {
        int24 newTickLower;
        int24 newTickUpper;
        uint256 confidence;
        uint256 expectedAPY;
        uint256 gasEstimate;
        uint256 timestamp;
        bytes signature;
    }

    struct MarketData {
        uint256 price;
        uint256 volume24h;
        uint256 volatility;
        uint256 liquidity;
    }

    // Events
    event SignalGenerated(
        address indexed vault,
        int24 tickLower,
        int24 tickUpper,
        uint256 confidence
    );
    event ModelUpdated(string model, address signer);

    // Functions
    function requestRebalanceSignal(
        address vault,
        MarketData calldata data
    ) external returns (bytes32 requestId);

    function getSignal(
        bytes32 requestId
    ) external view returns (RebalanceSignal memory);

    function validateSignature(
        bytes32 requestId,
        bytes calldata signature
    ) external view returns (bool);

    function registerModel(
        string calldata modelId,
        address signer
    ) external;

    function setConfidenceThreshold(uint256 threshold) external;
}`} />
      </div>

      <hr className="my-8" />

      {/* Integration Guide */}
      <h2 className="text-2xl font-semibold mb-4">Integration Guide</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Connect to SEI Network</h3>
        <p className="mb-4">Configure your Web3 provider to connect to SEI.</p>

        <CodeBlock language="javascript" code={`import { ethers } from 'ethers';

// Testnet configuration
const TESTNET_CONFIG = {
  chainId: 1328,
  name: 'SEI Testnet',
  rpcUrl: 'https://evm-rpc-arctic-1.sei-apis.com',
  explorer: 'https://seitrace.com',
  nativeCurrency: {
    name: 'SEI',
    symbol: 'SEI',
    decimals: 18
  }
};

// Connect to SEI
const provider = new ethers.JsonRpcProvider(TESTNET_CONFIG.rpcUrl);

// Connect wallet
const signer = new ethers.Wallet(privateKey, provider);

// Or use MetaMask
if (window.ethereum) {
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
      chainId: '0x' + TESTNET_CONFIG.chainId.toString(16),
      chainName: TESTNET_CONFIG.name,
      rpcUrls: [TESTNET_CONFIG.rpcUrl],
      blockExplorerUrls: [TESTNET_CONFIG.explorer],
      nativeCurrency: TESTNET_CONFIG.nativeCurrency
    }]
  });
}`} />
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Interact with Vaults</h3>
        <p className="mb-4">Example of depositing into a strategy vault.</p>

        <CodeBlock language="javascript" code={`import { ethers } from 'ethers';
import VAULT_ABI from './abis/StrategyVault.json';

// Vault configuration
const VAULT_ADDRESS = '0xf6A791e4773A60083AA29aaCCDc3bA5E900974fE';
const TOKEN0_ADDRESS = '0x...'; // SEI
const TOKEN1_ADDRESS = '0x...'; // USDC

// Initialize contract
const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

// Approve tokens first
const token0 = new ethers.Contract(TOKEN0_ADDRESS, ERC20_ABI, signer);
const token1 = new ethers.Contract(TOKEN1_ADDRESS, ERC20_ABI, signer);

const amount0 = ethers.parseEther('10'); // 10 SEI
const amount1 = ethers.parseUnits('100', 6); // 100 USDC

await token0.approve(VAULT_ADDRESS, amount0);
await token1.approve(VAULT_ADDRESS, amount1);

// Deposit into vault
const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour
const tx = await vault.deposit(
  amount0,
  amount1,
  0, // amount0Min - set slippage protection
  0, // amount1Min - set slippage protection
  signer.address,
  deadline
);

const receipt = await tx.wait();
console.log('Deposit successful:', receipt.transactionHash);

// Check your shares
const shares = await vault.getUserShares(signer.address);
console.log('Your vault shares:', ethers.formatEther(shares));`} />
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Monitor Vault Performance</h3>
        <p className="mb-4">Track your vault positions and earnings.</p>

        <CodeBlock language="javascript" code={`// Get vault metrics
const tvl = await vault.totalValueLocked();
const metrics = await vault.getPerformanceMetrics();

console.log('Total Value Locked:', ethers.formatEther(tvl));
console.log('APY:', metrics.apy / 100, '%');
console.log('Sharpe Ratio:', metrics.sharpeRatio / 100);
console.log('Max Drawdown:', metrics.maxDrawdown / 100, '%');

// Get current position
const position = await vault.getCurrentPosition();
console.log('Current tick range:', position.tickLower, '-', position.tickUpper);
console.log('Liquidity:', position.liquidity.toString());

// Calculate your share value
const userShares = await vault.getUserShares(signer.address);
const totalShares = await vault.totalSupply();
const userValue = (tvl * userShares) / totalShares;

console.log('Your position value:', ethers.formatEther(userValue));

// Listen to vault events
vault.on('Rebalanced', (tickLower, tickUpper, timestamp) => {
  console.log('Vault rebalanced:', {
    newRange: [tickLower, tickUpper],
    time: new Date(timestamp * 1000)
  });
});

vault.on('FeesCollected', (fee0, fee1) => {
  console.log('Fees collected:', {
    token0: ethers.formatEther(fee0),
    token1: ethers.formatUnits(fee1, 6)
  });
});`} />
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Create Custom Vault</h3>
        <p className="mb-4">Deploy your own strategy vault using the factory.</p>

        <CodeBlock language="javascript" code={`import FACTORY_ABI from './abis/VaultFactory.json';

const FACTORY_ADDRESS = '0x1234567890123456789012345678901234567890';
const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);

// Define vault parameters
const vaultParams = {
  token0: '0x...', // SEI address
  token1: '0x...', // USDC address
  fee: 3000, // 0.3% fee tier
  tickSpacing: 60,
  name: 'My Custom SEI-USDC Vault',
  strategy: 'concentrated_liquidity',
  oracle: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
  rebalanceThreshold: 500 // 5% threshold
};

// Create vault (requires deployment fee)
const deploymentFee = ethers.parseEther('0.1');
const tx = await factory.createVault(vaultParams, { value: deploymentFee });
const receipt = await tx.wait();

// Get vault address from events
const event = receipt.logs.find(
  log => log.topics[0] === factory.interface.getEventTopic('VaultCreated')
);
const decodedEvent = factory.interface.decodeEventLog('VaultCreated', event.data, event.topics);
const vaultAddress = decodedEvent.vault;

console.log('New vault deployed at:', vaultAddress);`} />
      </div>

      <hr className="my-8" />

      {/* Security */}
      <h2 className="text-2xl font-semibold mb-4">Security</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Audit Status</h3>
        <div className="space-y-3">
          <div className="p-4 border rounded-lg">
            <p className="font-semibold">CertiK Audit</p>
            <p className="text-sm text-muted-foreground">Comprehensive security audit completed</p>
            <p className="text-sm mt-2">Status: <span className="text-green-500">✓ Passed</span></p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="font-semibold">OpenZeppelin Audit</p>
            <p className="text-sm text-muted-foreground">Smart contract security review</p>
            <p className="text-sm mt-2">Status: <span className="text-green-500">✓ Passed</span></p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Security Features</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <div>
              <strong>Multi-signature Control</strong>
              <p className="text-sm text-muted-foreground">Critical functions require multiple signatures</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <div>
              <strong>Time-locked Operations</strong>
              <p className="text-sm text-muted-foreground">Major changes have mandatory delay periods</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <div>
              <strong>Slippage Protection</strong>
              <p className="text-sm text-muted-foreground">Built-in protection against price manipulation</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <div>
              <strong>Emergency Pause</strong>
              <p className="text-sm text-muted-foreground">Ability to halt operations in case of issues</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <div>
              <strong>Reentrancy Guards</strong>
              <p className="text-sm text-muted-foreground">Protection against reentrancy attacks</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Bug Bounty Program</h3>
        <div className="p-4 bg-muted rounded-lg">
          <p className="mb-3">We maintain an active bug bounty program to ensure the security of our contracts.</p>
          <ul className="space-y-2 text-sm">
            <li><strong>Critical:</strong> Up to $100,000</li>
            <li><strong>High:</strong> Up to $25,000</li>
            <li><strong>Medium:</strong> Up to $5,000</li>
            <li><strong>Low:</strong> Up to $1,000</li>
          </ul>
          <p className="text-sm mt-3">
            Report vulnerabilities to: <a href="mailto:security@yielddelta.xyz" className="text-primary hover:text-primary/80">security@yielddelta.xyz</a>
          </p>
        </div>
      </div>

      <hr className="my-8" />

      {/* Gas Optimization */}
      <h2 className="text-2xl font-semibold mb-4">Gas Optimization</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">SEI Network Advantages</h3>
        <p className="mb-4">
          SEI Network provides significant gas optimizations compared to other EVM chains:
        </p>
        <ul className="space-y-2">
          <li>• <strong>Parallel execution:</strong> Multiple transactions processed simultaneously</li>
          <li>• <strong>Optimistic parallelization:</strong> Reduced transaction conflicts</li>
          <li>• <strong>Native order matching:</strong> Built-in DEX functionality</li>
          <li>• <strong>Fast finality:</strong> 400ms block times</li>
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Gas Estimates</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="border-b border-border">
                <th className="border border-border px-4 py-2 text-left">Operation</th>
                <th className="border border-border px-4 py-2 text-left">Gas Used</th>
                <th className="border border-border px-4 py-2 text-left">Cost (SEI)</th>
                <th className="border border-border px-4 py-2 text-left">Cost (USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2">Deposit</td>
                <td className="border border-border px-4 py-2">~150,000</td>
                <td className="border border-border px-4 py-2">0.0015</td>
                <td className="border border-border px-4 py-2">$0.001</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2">Withdraw</td>
                <td className="border border-border px-4 py-2">~120,000</td>
                <td className="border border-border px-4 py-2">0.0012</td>
                <td className="border border-border px-4 py-2">$0.0008</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2">Rebalance</td>
                <td className="border border-border px-4 py-2">~300,000</td>
                <td className="border border-border px-4 py-2">0.003</td>
                <td className="border border-border px-4 py-2">$0.002</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2">Collect Fees</td>
                <td className="border border-border px-4 py-2">~80,000</td>
                <td className="border border-border px-4 py-2">0.0008</td>
                <td className="border border-border px-4 py-2">$0.0005</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2">Create Vault</td>
                <td className="border border-border px-4 py-2">~500,000</td>
                <td className="border border-border px-4 py-2">0.005</td>
                <td className="border border-border px-4 py-2">$0.003</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <hr className="my-8" />

      {/* Deployment Addresses */}
      <h2 className="text-2xl font-semibold mb-4">Deployment Addresses</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Testnet (Chain ID: 1328)</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="border-b border-border">
                <th className="border border-border px-4 py-2 text-left">Contract</th>
                <th className="border border-border px-4 py-2 text-left">Address</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2">StrategyVault (SEI-USDC)</td>
                <td className="border border-border px-4 py-2 font-mono text-xs">0xf6A791e4773A60083AA29aaCCDc3bA5E900974fE</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2">VaultFactory</td>
                <td className="border border-border px-4 py-2 font-mono text-xs">0x1234567890123456789012345678901234567890</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2">AIOracle</td>
                <td className="border border-border px-4 py-2 font-mono text-xs">0xABCDEF1234567890ABCDEF1234567890ABCDEF12</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2">RewardsDistributor</td>
                <td className="border border-border px-4 py-2 font-mono text-xs">0x9876543210987654321098765432109876543210</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2">Governance</td>
                <td className="border border-border px-4 py-2 font-mono text-xs">0xFEDCBA9876543210FEDCBA9876543210FEDCBA98</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Mainnet (Chain ID: 1329)</h3>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Mainnet contracts will be deployed after final audit completion.
            Join our <a href="https://discord.gg/sei" className="text-primary hover:text-primary/80">Discord</a> for deployment updates.
          </p>
        </div>
      </div>

      <hr className="my-8" />

      {/* Resources */}
      <h2 className="text-2xl font-semibold mb-4">Resources</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <a href="https://github.com/yield-delta/contracts" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
          <h3 className="font-semibold mb-2">GitHub Repository</h3>
          <p className="text-sm text-muted-foreground">Source code and documentation</p>
        </a>

        <a href="/docs/api-reference" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
          <h3 className="font-semibold mb-2">API Reference</h3>
          <p className="text-sm text-muted-foreground">Complete API documentation</p>
        </a>

        <a href="https://seitrace.com" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
          <h3 className="font-semibold mb-2">SEI Explorer</h3>
          <p className="text-sm text-muted-foreground">View transactions on-chain</p>
        </a>

        <a href="https://discord.gg/sei" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
          <h3 className="font-semibold mb-2">Discord Community</h3>
          <p className="text-sm text-muted-foreground">Get help and connect with developers</p>
        </a>
      </div>

      <hr className="my-8" />

      <p className="text-center text-muted-foreground italic">
        Need help? Join our <a href="https://discord.gg/sei" className="text-primary hover:text-primary/80">Discord</a> or check the <a href="/docs" className="text-primary hover:text-primary/80">documentation</a>.
      </p>
    </div>
  );
}

export const metadata = {
  title: 'Smart Contracts - Yield Delta Documentation',
  description: 'Comprehensive guide to Yield Delta smart contracts on SEI Network',
};