export default function FAQPage() {
  return (
    <div className="docs-content">
      <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
      
      <p className="text-lg text-muted-foreground mb-8">
        Common questions about Yield Delta vaults, share calculations, and yield optimization.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Understanding Vault Shares</h2>

      <div className="space-y-6 mb-8">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">Why don&apos;t I receive 1 share per 1 SEI deposited?</h3>
          <p className="mb-2">
            Yield Delta vaults use a <strong>share-based system</strong> similar to mutual funds. The number of shares you receive depends on the current share price, which changes as the vault earns yield.
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            <strong>Formula:</strong> shares = (depositAmount × totalSupply) ÷ totalAssets
          </p>
          <p className="text-sm">
            <strong>Example:</strong> If the vault has 100 shares worth 150 SEI total, the share price is 1.50 SEI. Depositing 5 SEI gives you 5 ÷ 1.50 = 3.333 shares, which are worth exactly 5 SEI.
          </p>
        </div>

        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">Why does the deposit preview show different shares than before?</h3>
          <p className="mb-2">
            Share prices update in <strong>real-time</strong> based on the vault&apos;s performance. If the vault has earned yield since your last deposit, the share price will be higher, so you&apos;ll receive fewer shares (but they&apos;re worth more SEI each).
          </p>
          <p className="text-sm">
            This is actually good news - it means the vault is performing well! Your SEI value remains correct regardless of how many shares you receive.
          </p>
        </div>

        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">How do I know my deposit is valued correctly?</h3>
          <p className="mb-2">
            Check the <strong>Share Value</strong> column in your position summary. This shows the current SEI value of your shares.
          </p>
          <div className="bg-muted p-3 rounded text-sm mt-2">
            <p className="mb-1"><strong>Your Position:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>Your Shares: <strong>3.7594</strong></li>
              <li>Share Value: <strong>5.0000 SEI</strong> ← Matches your deposit ✓</li>
              <li>Price/Share: <strong>1.3300 SEI</strong></li>
            </ul>
          </div>
        </div>

        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">What happens to my shares when the vault earns yield?</h3>
          <p className="mb-2">
            Your share <strong>count stays the same</strong>, but the <strong>value per share increases</strong>. This means the total SEI value of your shares goes up automatically.
          </p>
          <div className="bg-muted p-3 rounded text-sm mt-2">
            <p className="mb-1"><strong>Example Over Time:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>Day 1: 3.7594 shares × 1.3300 SEI = <strong>5.00 SEI</strong></li>
              <li>Day 7: 3.7594 shares × 1.4500 SEI = <strong>5.45 SEI</strong> (+9% gain)</li>
              <li>Day 30: 3.7594 shares × 1.5800 SEI = <strong>5.94 SEI</strong> (+18.8% gain)</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Deposits & Withdrawals</h2>

      <div className="space-y-6 mb-8">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">What is the minimum deposit amount?</h3>
          <p>
            Most vaults have a minimum deposit of <strong>1 SEI</strong>, though this varies by vault strategy. You&apos;ll see the minimum clearly displayed in the deposit modal.
          </p>
        </div>

        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">How long does it take for my deposit to be confirmed?</h3>
          <p className="mb-2">
            On SEI Network, transactions confirm in approximately <strong>400 milliseconds</strong>. You&apos;ll see your shares appear in your position within 1-2 seconds after submitting the transaction.
          </p>
        </div>

        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">Can I withdraw my funds at any time?</h3>
          <p className="mb-2">
            Most vaults allow withdrawals at any time, but some strategies may have a <strong>lock period</strong> (typically 24-48 hours) after your initial deposit. Check the vault details page for specific lock requirements.
          </p>
          <p className="text-sm text-muted-foreground">
            Your position summary shows &quot;Lock Time Remaining&quot; - if this shows 0, you can withdraw immediately.
          </p>
        </div>

        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">Why is my withdrawal amount different from my deposit?</h3>
          <p className="mb-2">
            Your withdrawal amount reflects <strong>your deposit plus or minus any gains/losses</strong> from vault performance.
          </p>
          <ul className="ml-4 text-sm space-y-1">
            <li><strong>Higher withdrawal:</strong> The vault earned yield - congratulations! 🎉</li>
            <li><strong>Lower withdrawal:</strong> The vault experienced losses (e.g., from impermanent loss or market movements)</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Fees & Performance</h2>

      <div className="space-y-6 mb-8">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">What fees does Yield Delta charge?</h3>
          <ul className="space-y-2">
            <li><strong>Management Fee:</strong> 2% annually (charged continuously, ~0.0055% per day)</li>
            <li><strong>Performance Fee:</strong> 10% of profits above your highest previous value (high water mark)</li>
            <li><strong>Gas Fees:</strong> Standard SEI network fees (typically 0.001-0.005 SEI per transaction)</li>
            <li><strong>No deposit/withdrawal fees</strong></li>
          </ul>
        </div>

        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">How is the performance fee calculated?</h3>
          <p className="mb-2">
            Performance fees only apply to <strong>new profits</strong>. We use a &quot;high water mark&quot; system - if your position value drops and then recovers, you don&apos;t pay performance fees twice.
          </p>
          <div className="bg-muted p-3 rounded text-sm mt-2">
            <p className="mb-1"><strong>Example:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>Deposit: 100 SEI</li>
              <li>Value grows to 120 SEI → Performance fee on 20 SEI profit = 2 SEI</li>
              <li>Value drops to 110 SEI → No fee (below high water mark)</li>
              <li>Value grows to 130 SEI → Performance fee only on (130 - 120) = 10 SEI new profit = 1 SEI</li>
            </ul>
          </div>
        </div>

        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">What are the typical APYs for different vault strategies?</h3>
          <ul className="space-y-2 text-sm">
            <li><strong>Concentrated Liquidity Vaults:</strong> 15-45% APY (higher risk, higher reward)</li>
            <li><strong>Yield Farming Vaults:</strong> 8-25% APY (medium risk, stable returns)</li>
            <li><strong>Arbitrage Vaults:</strong> 12-30% APY (market-neutral strategy)</li>
            <li><strong>Delta Neutral Vaults:</strong> 10-20% APY (lowest risk, hedge against market movements)</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">
            Note: APYs are estimates based on current market conditions and historical performance. Actual returns may vary.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">AI & Optimization</h2>

      <div className="space-y-6 mb-8">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">How does AI optimization work?</h3>
          <p className="mb-2">
            Our AI engine continuously monitors market conditions and automatically rebalances vault positions to maximize yield while minimizing risk. The AI considers:
          </p>
          <ul className="ml-4 space-y-1 text-sm">
            <li>Current liquidity pool fees and volumes</li>
            <li>Price volatility and trends</li>
            <li>Gas costs for rebalancing</li>
            <li>Impermanent loss projections</li>
            <li>Historical performance patterns</li>
          </ul>
        </div>

        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">How often does the AI rebalance positions?</h3>
          <p>
            Rebalancing frequency depends on market conditions and vault strategy. Typically every <strong>1-6 hours</strong>, but can be more frequent during high volatility or less frequent in stable markets to save on gas costs.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Security & Risks</h2>

      <div className="space-y-6 mb-8">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">Are the smart contracts audited?</h3>
          <p>
            Yes, all Yield Delta smart contracts undergo thorough security audits. We also use automated testing with <strong>Slither</strong> and <strong>Mythril</strong> for continuous security monitoring.
          </p>
        </div>

        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">What are the main risks of using vaults?</h3>
          <ul className="space-y-2 text-sm">
            <li><strong>Smart Contract Risk:</strong> Potential bugs in vault or underlying protocol contracts</li>
            <li><strong>Impermanent Loss:</strong> Value changes due to price divergence in liquidity pools</li>
            <li><strong>Market Risk:</strong> Overall market downturns affecting asset values</li>
            <li><strong>Slippage:</strong> Price impact when rebalancing large positions</li>
            <li><strong>Gas Costs:</strong> High gas prices can reduce net returns</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">
            We recommend starting with smaller amounts and diversifying across multiple vaults to manage risk.
          </p>
        </div>

        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">Is there deposit insurance?</h3>
          <p>
            DeFi protocols typically don&apos;t offer deposit insurance like traditional banks. However, Yield Delta implements multiple security measures including multi-sig controls, time-locks on critical functions, and automated risk monitoring.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Technical Questions</h2>

      <div className="space-y-6 mb-8">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">Are vaults ERC-4626 compatible?</h3>
          <p>
            Yes! All Yield Delta vaults implement the <strong>ERC-4626 standard</strong>, making them compatible with any protocol or application that supports tokenized vaults.
          </p>
        </div>

        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">Can I integrate Yield Delta vaults into my dApp?</h3>
          <p className="mb-2">
            Absolutely! Our vaults are designed for composability. Check out the <a href="/docs/api-reference" className="text-primary hover:text-primary/80">API Reference</a> for integration details.
          </p>
        </div>

        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-xl font-semibold mb-2">How can I verify share calculations?</h3>
          <p className="mb-2">
            All share calculations are transparent and verifiable on-chain:
          </p>
          <pre className="bg-muted p-3 rounded text-xs mt-2 overflow-x-auto">
            <code>{`// Read from the vault contract:
uint256 totalSupply = vault.totalSupply();
uint256 totalAssets = vault.totalAssets();
uint256 pricePerShare = (totalAssets * 1e18) / totalSupply;

// Calculate shares for deposit:
uint256 shares = (depositAmount * totalSupply) / totalAssets;

// Calculate SEI value for shares:
uint256 seiValue = (shares * totalAssets) / totalSupply;`}</code>
          </pre>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Still Have Questions?</h2>

      <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
        <p className="mb-4">
          Can&apos;t find what you&apos;re looking for? We&apos;re here to help!
        </p>
        <ul className="space-y-2">
          <li><strong>Discord:</strong> <a href="https://discord.gg/sei" className="text-primary hover:text-primary/80">Join our community</a> for real-time support</li>
          <li><strong>Documentation:</strong> <a href="/docs/features/vaults" className="text-primary hover:text-primary/80">Vault Management Guide</a></li>
          <li><strong>GitHub:</strong> <a href="https://github.com/yield-delta/yield-delta-protocol/issues" className="text-primary hover:text-primary/80">Open an issue</a> for technical questions</li>
        </ul>
      </div>

      <hr className="my-8" />

      <p className="text-center text-muted-foreground italic">
        Updated November 2025 - Documentation is continuously improved based on community feedback
      </p>
    </div>
  );
}

export const metadata = {
  title: 'FAQ - Yield Delta Documentation',
  description: 'Frequently asked questions about Yield Delta vaults, share calculations, fees, and yield optimization.',
};
