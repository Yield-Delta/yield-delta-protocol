import { Service, type IAgentRuntime } from '@elizaos/core';
import { ethers } from 'ethers';

/**
 * SEI Vault Manager Service
 *
 * This service manages the integration between the vault contracts and the AI agent.
 * It monitors deposit/withdrawal events and automatically allocates capital to strategies.
 *
 * Key Responsibilities:
 * - Watch for deposit events from SEIVault contract
 * - Allocate deposits to strategies (40/30/20/10 split)
 * - Harvest yield periodically (every 8 hours)
 * - Deposit harvested yield back to vault
 * - Track positions for all strategies
 */
export class SEIVaultManager extends Service {
  static serviceType = 'vault-manager';

  get capabilityDescription(): string {
    return 'Manages SEI vault deposits, allocations, and yield harvesting for automated DeFi strategies';
  }

  private vaultContract: ethers.Contract | null = null;
  private oracleContract: ethers.Contract | null = null;
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;

  // Strategy allocations (percentages)
  private readonly ALLOCATIONS = {
    fundingArbitrage: 40,
    deltaNeutral: 30,
    ammOptimization: 20,
    yeiLending: 10,
  };

  // Position tracking
  private positions = {
    fundingArbitrage: [] as any[],
    deltaNeutral: [] as any[],
    ammOptimization: [] as any[],
    yeiLending: [] as any[],
  };

  // Harvest timing
  private lastHarvestTime: number = 0;
  private readonly HARVEST_INTERVAL = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
  private isStarted: boolean = false;

  async initialize(runtime: IAgentRuntime): Promise<void> {
    // Base initialization - called first
    console.log('🔧 SEI Vault Manager base initialization...');
  }

  async start(runtime: IAgentRuntime): Promise<void> {
    if (this.isStarted) {
      console.log('⚠️ SEI Vault Manager already started');
      return;
    }
    console.log('🔧 Initializing SEI Vault Manager...');

    // Get configuration from environment
    const vaultAddress = process.env.NATIVE_SEI_VAULT;
    const oracleAddress = process.env.AI_ORACLE;
    const rpcUrl = process.env.SEI_RPC_URL;
    const privateKey = process.env.SEI_PRIVATE_KEY;

    if (!vaultAddress || !oracleAddress || !rpcUrl || !privateKey) {
      throw new Error('Missing required environment variables for vault manager');
    }

    // Initialize provider and signer
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);

    // Initialize vault contract
    const vaultABI = [
      'event SEIOptimizedDeposit(address indexed user, uint256 amount, uint256 shares, uint256 blockTime)',
      'event Withdrawal(address indexed user, uint256 amount, uint256 shares, uint256 blockTime)',
      'function totalAssets() view returns (uint256)',
      'function totalSupply() view returns (uint256)',
      'function depositYield() payable',
    ];

    this.vaultContract = new ethers.Contract(vaultAddress, vaultABI, this.signer);

    // Initialize oracle contract
    const oracleABI = [
      'function executeAIRequest(address vault, bytes memory data) external',
      'function isAIAgent(address agent) view returns (bool)',
    ];

    this.oracleContract = new ethers.Contract(oracleAddress, oracleABI, this.signer);

    // Start watching for deposit events
    await this.watchDeposits(runtime);

    console.log('✅ SEI Vault Manager initialized');
    console.log(`📍 Vault: ${vaultAddress}`);
    console.log(`📍 Oracle: ${oracleAddress}`);

    this.isStarted = true;
  }

  async stop(): Promise<void> {
    if (!this.isStarted) {
      return;
    }
    console.log('🛑 Stopping SEI Vault Manager...');

    // Remove all event listeners
    if (this.vaultContract) {
      await this.vaultContract.removeAllListeners();
    }

    this.isStarted = false;
    console.log('✅ SEI Vault Manager stopped');
  }

  /**
   * Watch for deposit events and automatically allocate to strategies
   */
  private async watchDeposits(runtime: IAgentRuntime): Promise<void> {
    if (!this.vaultContract) {
      throw new Error('Vault contract not initialized');
    }

    console.log('👀 Watching for vault deposits...');

    this.vaultContract.on(
      'SEIOptimizedDeposit',
      async (user: string, amount: bigint, shares: bigint, blockTime: bigint) => {
        console.log(`\n💰 New deposit detected!`);
        console.log(`   User: ${user}`);
        console.log(`   Amount: ${ethers.formatEther(amount)} SEI`);
        console.log(`   Shares: ${ethers.formatEther(shares)}`);

        try {
          // Allocate deposit to strategies
          await this.allocateDeposit(runtime, amount);
        } catch (error) {
          console.error('❌ Failed to allocate deposit:', error);
        }
      }
    );

    // Also watch for withdrawals (may need to unwind positions)
    this.vaultContract.on(
      'Withdrawal',
      async (user: string, amount: bigint, shares: bigint, blockTime: bigint) => {
        console.log(`\n💸 Withdrawal detected!`);
        console.log(`   User: ${user}`);
        console.log(`   Amount: ${ethers.formatEther(amount)} SEI`);
        console.log(`   Shares: ${ethers.formatEther(shares)}`);

        // TODO: Implement position unwinding if needed
      }
    );
  }

  /**
   * Allocate a deposit to all strategies according to allocation percentages
   */
  async allocateDeposit(runtime: IAgentRuntime, totalAmount: bigint): Promise<void> {
    console.log(`\n📊 Allocating ${ethers.formatEther(totalAmount)} SEI to strategies...`);

    // Calculate allocations
    const allocations = {
      fundingArbitrage: (totalAmount * BigInt(this.ALLOCATIONS.fundingArbitrage)) / 100n,
      deltaNeutral: (totalAmount * BigInt(this.ALLOCATIONS.deltaNeutral)) / 100n,
      ammOptimization: (totalAmount * BigInt(this.ALLOCATIONS.ammOptimization)) / 100n,
      yeiLending: (totalAmount * BigInt(this.ALLOCATIONS.yeiLending)) / 100n,
    };

    console.log(`   💹 Funding Arbitrage: ${ethers.formatEther(allocations.fundingArbitrage)} SEI (${this.ALLOCATIONS.fundingArbitrage}%)`);
    console.log(`   ⚖️ Delta Neutral: ${ethers.formatEther(allocations.deltaNeutral)} SEI (${this.ALLOCATIONS.deltaNeutral}%)`);
    console.log(`   🔄 AMM Optimization: ${ethers.formatEther(allocations.ammOptimization)} SEI (${this.ALLOCATIONS.ammOptimization}%)`);
    console.log(`   🏦 YEI Lending: ${ethers.formatEther(allocations.yeiLending)} SEI (${this.ALLOCATIONS.yeiLending}%)`);

    try {
      // Execute all strategy allocations in parallel
      await Promise.all([
        this.executeFundingArbitrage(runtime, allocations.fundingArbitrage),
        this.executeDeltaNeutral(runtime, allocations.deltaNeutral),
        this.executeAMMOptimization(runtime, allocations.ammOptimization),
        this.executeYEILending(runtime, allocations.yeiLending),
      ]);

      console.log('✅ All strategies allocated successfully');
    } catch (error) {
      console.error('❌ Error during allocation:', error);
      throw error;
    }
  }

  /**
   * Execute funding rate arbitrage strategy
   */
  private async executeFundingArbitrage(runtime: IAgentRuntime, amount: bigint): Promise<void> {
    console.log(`\n💹 Executing Funding Arbitrage with ${ethers.formatEther(amount)} SEI...`);

    // Import the funding arbitrage action from the plugin
    const fundingArbitrageAction = runtime.actions.find(
      (action) => action.name === 'FUNDING_ARBITRAGE'
    );

    if (!fundingArbitrageAction) {
      console.warn('⚠️ Funding arbitrage action not found in runtime');
      return;
    }

    // Execute the action with allocation parameter
    const result = await fundingArbitrageAction.handler(
      runtime,
      {
        userId: 'vault-manager',
        roomId: 'vault-automation',
        content: { text: 'execute' },
      } as any,
      {
        values: {},
        data: {},
        text: 'execute funding arbitrage',
      } as any,
      { allocation: amount, autoExecute: true }
    );

    if (result) {
      this.positions.fundingArbitrage.push({
        timestamp: Date.now(),
        amount: amount,
        strategy: 'funding-arbitrage',
        result: result,
      });
      console.log('✅ Funding arbitrage position opened');
    }
  }

  /**
   * Execute delta neutral LP strategy
   */
  private async executeDeltaNeutral(runtime: IAgentRuntime, amount: bigint): Promise<void> {
    console.log(`\n⚖️ Executing Delta Neutral with ${ethers.formatEther(amount)} SEI...`);

    const deltaNeutralAction = runtime.actions.find(
      (action) => action.name === 'DELTA_NEUTRAL'
    );

    if (!deltaNeutralAction) {
      console.warn('⚠️ Delta neutral action not found in runtime');
      return;
    }

    const result = await deltaNeutralAction.handler(
      runtime,
      {
        userId: 'vault-manager',
        roomId: 'vault-automation',
        content: { text: 'execute' },
      } as any,
      {
        values: {},
        data: {},
        text: 'execute delta neutral',
      } as any,
      { allocation: amount, autoExecute: true }
    );

    if (result) {
      this.positions.deltaNeutral.push({
        timestamp: Date.now(),
        amount: amount,
        strategy: 'delta-neutral',
        result: result,
      });
      console.log('✅ Delta neutral position created');
    }
  }

  /**
   * Execute AMM optimization strategy
   */
  private async executeAMMOptimization(runtime: IAgentRuntime, amount: bigint): Promise<void> {
    console.log(`\n🔄 Executing AMM Optimization with ${ethers.formatEther(amount)} SEI...`);

    const ammOptimizeAction = runtime.actions.find(
      (action) => action.name === 'AMM_OPTIMIZE'
    );

    if (!ammOptimizeAction) {
      console.warn('⚠️ AMM optimization action not found in runtime');
      return;
    }

    const result = await ammOptimizeAction.handler(
      runtime,
      {
        userId: 'vault-manager',
        roomId: 'vault-automation',
        content: { text: 'execute' },
      } as any,
      {
        values: {},
        data: {},
        text: 'execute amm optimization',
      } as any,
      { allocation: amount, autoExecute: true }
    );

    if (result) {
      this.positions.ammOptimization.push({
        timestamp: Date.now(),
        amount: amount,
        strategy: 'amm-optimization',
        result: result,
      });
      console.log('✅ AMM optimization executed');
    }
  }

  /**
   * Execute YEI Finance lending strategy
   */
  private async executeYEILending(runtime: IAgentRuntime, amount: bigint): Promise<void> {
    console.log(`\n🏦 Executing YEI Lending with ${ethers.formatEther(amount)} SEI...`);

    const yeiLendingAction = runtime.actions.find(
      (action) => action.name === 'YEI_LENDING'
    );

    if (!yeiLendingAction) {
      console.warn('⚠️ YEI lending action not found in runtime');
      return;
    }

    const result = await yeiLendingAction.handler(
      runtime,
      {
        userId: 'vault-manager',
        roomId: 'vault-automation',
        content: { text: 'execute' },
      } as any,
      {
        values: {},
        data: {},
        text: 'execute yei lending',
      } as any,
      { allocation: amount, autoExecute: true }
    );

    if (result) {
      this.positions.yeiLending.push({
        timestamp: Date.now(),
        amount: amount,
        strategy: 'yei-lending',
        result: result,
      });
      console.log('✅ YEI lending deposit successful');
    }
  }

  /**
   * Harvest yield from all strategies
   * Should be called every 8 hours
   */
  async harvestYield(runtime: IAgentRuntime): Promise<bigint> {
    const now = Date.now();
    if (now - this.lastHarvestTime < this.HARVEST_INTERVAL) {
      console.log('⏳ Not time to harvest yet');
      return 0n;
    }

    console.log('\n🌾 Harvesting yield from all strategies...');

    let totalYield = 0n;

    try {
      // Collect yield from each strategy
      // TODO: Implement actual yield collection from each strategy
      // For now, simulate with estimated returns

      const fundingYield = this.calculateEstimatedYield('fundingArbitrage', 0.20); // 20% APR
      const deltaNeutralYield = this.calculateEstimatedYield('deltaNeutral', 0.12); // 12% APR
      const ammYield = this.calculateEstimatedYield('ammOptimization', 0.10); // 10% APR
      const yeiYield = this.calculateEstimatedYield('yeiLending', 0.05); // 5% APR

      totalYield = fundingYield + deltaNeutralYield + ammYield + yeiYield;

      console.log(`   💹 Funding Arbitrage: ${ethers.formatEther(fundingYield)} SEI`);
      console.log(`   ⚖️ Delta Neutral: ${ethers.formatEther(deltaNeutralYield)} SEI`);
      console.log(`   🔄 AMM Optimization: ${ethers.formatEther(ammYield)} SEI`);
      console.log(`   🏦 YEI Lending: ${ethers.formatEther(yeiYield)} SEI`);
      console.log(`   🎯 Total Yield: ${ethers.formatEther(totalYield)} SEI`);

      if (totalYield > 0n) {
        await this.depositYieldToVault(totalYield);
        this.lastHarvestTime = now;
      }

      return totalYield;
    } catch (error) {
      console.error('❌ Error harvesting yield:', error);
      return 0n;
    }
  }

  /**
   * Calculate estimated yield for a strategy based on positions and APR
   */
  private calculateEstimatedYield(strategy: keyof typeof this.positions, apr: number): bigint {
    const positions = this.positions[strategy];
    let totalYield = 0n;

    for (const position of positions) {
      const timeSinceOpen = Date.now() - position.timestamp;
      const hoursElapsed = timeSinceOpen / (1000 * 60 * 60);

      // Calculate yield: amount * APR * (hours / 8760)
      const yield8h = (position.amount * BigInt(Math.floor(apr * 10000))) / BigInt(8760 * 10000);
      const yieldAccrued = yield8h * BigInt(Math.floor(hoursElapsed / 8));

      totalYield += yieldAccrued;
    }

    return totalYield;
  }

  /**
   * Deposit harvested yield back to the vault
   */
  private async depositYieldToVault(yieldAmount: bigint): Promise<void> {
    if (!this.vaultContract || !this.signer) {
      throw new Error('Vault contract not initialized');
    }

    console.log(`\n💰 Depositing ${ethers.formatEther(yieldAmount)} SEI yield to vault...`);

    try {
      // Call depositYield() on the vault contract
      const tx = await this.vaultContract.depositYield({ value: yieldAmount });
      console.log(`   📝 Transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(`   ✅ Yield deposited successfully in block ${receipt.blockNumber}`);
    } catch (error) {
      console.error('❌ Failed to deposit yield to vault:', error);
      throw error;
    }
  }

  /**
   * Get current vault metrics
   */
  async getVaultMetrics(): Promise<{
    totalAssets: bigint;
    totalShares: bigint;
    sharePrice: bigint;
    positionCount: number;
  }> {
    if (!this.vaultContract) {
      throw new Error('Vault contract not initialized');
    }

    const totalAssets = await this.vaultContract.totalAssets();
    const totalShares = await this.vaultContract.totalSupply();
    const sharePrice = totalShares > 0n ? (totalAssets * ethers.parseEther('1')) / totalShares : 0n;

    const positionCount =
      this.positions.fundingArbitrage.length +
      this.positions.deltaNeutral.length +
      this.positions.ammOptimization.length +
      this.positions.yeiLending.length;

    return {
      totalAssets,
      totalShares,
      sharePrice,
      positionCount,
    };
  }
}

export default SEIVaultManager;
