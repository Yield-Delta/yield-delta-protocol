/**
 * Code Block Visual Test Page
 * Tests the enhanced code snippet styling implementation
 */

'use client';

import { CodeBlock, InlineCode } from '@/components/CodeBlock';

export default function CodeTestPage() {
  return (
    <div className="docs-content max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Code Block Styling Test</h1>

      <p className="text-lg text-muted-foreground mb-8">
        This page tests the enhanced code snippet styling with rounded corners, borders, and shadows.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Standard HTML Code Blocks</h2>

      <p className="mb-4">
        These code blocks use standard HTML <InlineCode>pre</InlineCode> and <InlineCode>code</InlineCode> tags
        and should automatically receive the enhanced styling from <InlineCode>code-blocks.css</InlineCode>.
      </p>

      <h3 className="text-xl font-semibold mb-4">TypeScript Example</h3>

      <pre>
        <code>{`// TypeScript interface example
interface VaultConfig {
  name: string;
  strategy: 'aggressive' | 'moderate' | 'conservative';
  minDeposit: number;
  maxTVL: number;
}

const seiVault: VaultConfig = {
  name: 'SEI-USDC Liquidity',
  strategy: 'moderate',
  minDeposit: 100,
  maxTVL: 1000000,
};

console.log(\`Vault: \${seiVault.name}\`);`}</code>
      </pre>

      <h3 className="text-xl font-semibold mb-4">Solidity Smart Contract</h3>

      <pre>
        <code>{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract YieldDeltaVault {
    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    function deposit() external payable {
        require(msg.value > 0, "Must deposit non-zero amount");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }
}`}</code>
      </pre>

      <h3 className="text-xl font-semibold mb-4">Python AI Model</h3>

      <pre>
        <code>{`# AI rebalancing model
import numpy as np
from sklearn.ensemble import RandomForestRegressor

class YieldOptimizer:
    def __init__(self, model_path: str):
        self.model = RandomForestRegressor(n_estimators=100)
        self.features = ['price', 'volume', 'liquidity', 'volatility']

    def predict_optimal_range(self, market_data: dict) -> tuple:
        """Predict optimal liquidity range for maximum yield"""
        X = np.array([[market_data[f] for f in self.features]])
        prediction = self.model.predict(X)

        lower_bound = prediction[0] * 0.95
        upper_bound = prediction[0] * 1.05

        return (lower_bound, upper_bound)

    def calculate_expected_yield(self, position_size: float) -> float:
        """Calculate expected APY for given position"""
        base_yield = 0.15  # 15% base APY
        size_bonus = min(position_size / 10000, 0.05)  # Up to 5% bonus
        return base_yield + size_bonus`}</code>
      </pre>

      <h2 className="text-2xl font-semibold mb-4 mt-12">Enhanced CodeBlock Component</h2>

      <p className="mb-4">
        The <InlineCode>CodeBlock</InlineCode> component adds extra features like copy buttons,
        language badges, and line numbers.
      </p>

      <h3 className="text-xl font-semibold mb-4">With Language Badge</h3>

      <CodeBlock language="typescript">
{`// React hook for vault interactions
import { useVaultDeposit } from '@/hooks/useVaultDeposit';

export function VaultDepositButton() {
  const { deposit, isPending, isSuccess } = useVaultDeposit();

  const handleDeposit = async () => {
    try {
      await deposit('1000000000000000000'); // 1 SEI
      console.log('Deposit successful!');
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  return (
    <button onClick={handleDeposit} disabled={isPending}>
      {isPending ? 'Depositing...' : 'Deposit 1 SEI'}
    </button>
  );
}`}
      </CodeBlock>

      <h3 className="text-xl font-semibold mb-4">With Filename</h3>

      <CodeBlock language="bash" filename=".env.local">
{`# Environment configuration for Yield Delta
NEXT_PUBLIC_SEI_CHAIN_ID=1328
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_VAULT_ADDRESS=0x1234567890abcdef

# AI Engine
OPENAI_API_KEY=sk-your-key-here
AI_ENGINE_URL=http://localhost:8000

# Demo mode (for testing without wallet)
NEXT_PUBLIC_DEMO_MODE=true`}
      </CodeBlock>

      <h3 className="text-xl font-semibold mb-4">With Line Numbers</h3>

      <CodeBlock language="javascript" showLineNumbers={true}>
{`// Calculate impermanent loss protection
function calculateILProtection(entryPrice, currentPrice, liquidity) {
  const priceRatio = currentPrice / entryPrice;
  const sqrtRatio = Math.sqrt(priceRatio);

  // IL formula: 2 * sqrt(price_ratio) / (1 + price_ratio) - 1
  const impermanentLoss = 2 * sqrtRatio / (1 + priceRatio) - 1;

  // Calculate hedge amount
  const hedgeAmount = Math.abs(impermanentLoss) * liquidity * 0.8;

  return {
    il: impermanentLoss * 100,
    hedgeAmount: hedgeAmount,
    protected: hedgeAmount > 0
  };
}`}
      </CodeBlock>

      <h2 className="text-2xl font-semibold mb-4 mt-12">Inline Code Styling</h2>

      <p className="mb-4">
        Inline code elements like <InlineCode>const x = 10;</InlineCode> and <InlineCode>npm install</InlineCode> should
        have consistent styling with a subtle background and border.
      </p>

      <p className="mb-4">
        You can use inline code within paragraphs to highlight important values like <InlineCode>maxTVL</InlineCode>,
        function names like <InlineCode>calculateYield()</InlineCode>, or file paths like <InlineCode>/src/app/vaults</InlineCode>.
      </p>

      <h2 className="text-2xl font-semibold mb-4 mt-12">Styling Features</h2>

      <ul className="space-y-2 mb-8">
        <li>✅ <strong>Rounded corners</strong> (12px on code blocks, 6px on inline code)</li>
        <li>✅ <strong>Subtle borders</strong> for definition and separation</li>
        <li>✅ <strong>Depth shadows</strong> for elevated appearance</li>
        <li>✅ <strong>Hover effects</strong> with enhanced glow and shadow</li>
        <li>✅ <strong>Copy button</strong> (appears on hover for CodeBlock component)</li>
        <li>✅ <strong>Language badges</strong> for syntax identification</li>
        <li>✅ <strong>Smooth scrollbars</strong> for long code snippets</li>
        <li>✅ <strong>Mobile responsive</strong> with adjusted padding and font sizes</li>
        <li>✅ <strong>Dark mode optimized</strong> with proper contrast</li>
        <li>✅ <strong>Accessibility</strong> with keyboard focus indicators</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4 mt-12">Long Code Example (Test Scrolling)</h2>

      <pre>
        <code>{`// Very long line to test horizontal scrolling behavior in code blocks with rounded corners and shadows
const veryLongVariableName = "This is a very long string that should trigger horizontal scrolling to ensure the scrollbar styling is visible and working correctly with rounded corners";

// Complex nested object
const complexVaultConfiguration = {
  strategy: { type: 'concentrated-liquidity', tickRange: { lower: -887220, upper: 887220 } },
  riskParameters: { maxDrawdown: 0.15, sharpeTarget: 2.5, volatilityThreshold: 0.25 },
  rebalancing: { frequency: '1h', slippageTolerance: 0.005, gasOptimization: true },
};`}</code>
      </pre>

      <div className="mt-12 p-6 bg-primary/10 border border-primary/30 rounded-lg">
        <p className="text-sm">
          <strong>Note:</strong> Hover over code blocks to see the enhanced shadow and glow effects.
          The CodeBlock component also shows a copy button on hover.
        </p>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Code Block Test - Yield Delta Documentation',
  description: 'Visual test page for enhanced code snippet styling',
};
