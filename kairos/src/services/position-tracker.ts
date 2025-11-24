import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Position Tracker Service
 *
 * Tracks simulated positions for testnet demonstration.
 * Real deposits happen on-chain, but strategy allocations are simulated
 * with realistic APR calculations.
 */

export interface StrategyPosition {
  id: string;
  strategy: 'funding-arbitrage' | 'delta-neutral' | 'amm-optimization' | 'yei-lending';
  amount: string; // In wei
  entryTime: number;
  lastHarvestTime: number;
  accumulatedYield: string; // In wei
  apr: number; // Annual percentage rate
  status: 'active' | 'closed';
}

export interface PositionSummary {
  totalDeposited: string;
  totalYield: string;
  currentValue: string;
  effectiveAPR: number;
  positions: {
    strategy: string;
    amount: string;
    yield: string;
    apr: number;
    duration: string;
  }[];
}

// Strategy APRs (realistic estimates)
const STRATEGY_APRS = {
  'funding-arbitrage': 0.20,  // 20% APR
  'delta-neutral': 0.12,      // 12% APR
  'amm-optimization': 0.15,   // 15% APR (fees + rewards)
  'yei-lending': 0.05,        // 5% APR
};

class PositionTracker {
  private positions: Map<string, StrategyPosition> = new Map();
  private dataFile: string;
  private initialized: boolean = false;

  constructor() {
    this.dataFile = path.join(process.cwd(), '.eliza', 'data', 'positions.json');
    this.loadPositions();
  }

  private loadPositions(): void {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf-8'));
        this.positions = new Map(Object.entries(data));
        console.log(`📊 Loaded ${this.positions.size} positions from storage`);
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load positions:', error);
      this.positions = new Map();
      this.initialized = true;
    }
  }

  private savePositions(): void {
    try {
      const dir = path.dirname(this.dataFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = Object.fromEntries(this.positions);
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save positions:', error);
    }
  }

  /**
   * Add a new position for a strategy allocation
   */
  addPosition(
    strategy: StrategyPosition['strategy'],
    amount: bigint,
    depositTxHash?: string
  ): StrategyPosition {
    const id = `${strategy}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const position: StrategyPosition = {
      id,
      strategy,
      amount: amount.toString(),
      entryTime: now,
      lastHarvestTime: now,
      accumulatedYield: '0',
      apr: STRATEGY_APRS[strategy],
      status: 'active',
    };

    this.positions.set(id, position);
    this.savePositions();

    console.log(`📝 Position opened: ${strategy}`);
    console.log(`   ID: ${id}`);
    console.log(`   Amount: ${ethers.formatEther(amount)} SEI`);
    console.log(`   APR: ${(position.apr * 100).toFixed(1)}%`);

    return position;
  }

  /**
   * Calculate yield for a position based on time elapsed
   */
  calculateYield(position: StrategyPosition): bigint {
    const now = Date.now();
    const elapsed = now - position.lastHarvestTime;
    const hoursElapsed = elapsed / (1000 * 60 * 60);

    // Calculate yield: amount * APR * (hours / 8760)
    const amount = BigInt(position.amount);
    const aprBps = BigInt(Math.floor(position.apr * 10000)); // Convert to basis points
    const yield_ = (amount * aprBps * BigInt(Math.floor(hoursElapsed))) / (8760n * 10000n);

    return yield_;
  }

  /**
   * Harvest yield from all active positions
   */
  harvestAll(): bigint {
    let totalYield = 0n;
    const now = Date.now();

    for (const [id, position] of this.positions) {
      if (position.status !== 'active') continue;

      const yield_ = this.calculateYield(position);
      if (yield_ > 0n) {
        position.accumulatedYield = (BigInt(position.accumulatedYield) + yield_).toString();
        position.lastHarvestTime = now;
        totalYield += yield_;

        console.log(`🌾 Harvested ${ethers.formatEther(yield_)} SEI from ${position.strategy}`);
      }
    }

    if (totalYield > 0n) {
      this.savePositions();
      console.log(`💰 Total harvested: ${ethers.formatEther(totalYield)} SEI`);
    }

    return totalYield;
  }

  /**
   * Get summary of all positions
   */
  getSummary(): PositionSummary {
    let totalDeposited = 0n;
    let totalYield = 0n;
    const positionDetails: PositionSummary['positions'] = [];

    for (const [id, position] of this.positions) {
      if (position.status !== 'active') continue;

      const amount = BigInt(position.amount);
      const pendingYield = this.calculateYield(position);
      const accumulated = BigInt(position.accumulatedYield);
      const totalPositionYield = accumulated + pendingYield;

      totalDeposited += amount;
      totalYield += totalPositionYield;

      const durationMs = Date.now() - position.entryTime;
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationDays = Math.floor(durationHours / 24);
      const remainingHours = durationHours % 24;

      positionDetails.push({
        strategy: position.strategy,
        amount: ethers.formatEther(amount),
        yield: ethers.formatEther(totalPositionYield),
        apr: position.apr * 100,
        duration: durationDays > 0
          ? `${durationDays}d ${remainingHours}h`
          : `${durationHours}h`,
      });
    }

    const currentValue = totalDeposited + totalYield;

    // Calculate effective APR
    let effectiveAPR = 0;
    if (totalDeposited > 0n) {
      const oldestPosition = Array.from(this.positions.values())
        .filter(p => p.status === 'active')
        .sort((a, b) => a.entryTime - b.entryTime)[0];

      if (oldestPosition) {
        const durationYears = (Date.now() - oldestPosition.entryTime) / (1000 * 60 * 60 * 24 * 365);
        if (durationYears > 0) {
          effectiveAPR = (Number(totalYield) / Number(totalDeposited) / durationYears) * 100;
        }
      }
    }

    return {
      totalDeposited: ethers.formatEther(totalDeposited),
      totalYield: ethers.formatEther(totalYield),
      currentValue: ethers.formatEther(currentValue),
      effectiveAPR,
      positions: positionDetails,
    };
  }

  /**
   * Get positions by strategy
   */
  getPositionsByStrategy(strategy: StrategyPosition['strategy']): StrategyPosition[] {
    return Array.from(this.positions.values())
      .filter(p => p.strategy === strategy && p.status === 'active');
  }

  /**
   * Get all active positions
   */
  getAllActivePositions(): StrategyPosition[] {
    return Array.from(this.positions.values())
      .filter(p => p.status === 'active');
  }

  /**
   * Close a position
   */
  closePosition(id: string): boolean {
    const position = this.positions.get(id);
    if (!position) return false;

    // Harvest final yield before closing
    const finalYield = this.calculateYield(position);
    position.accumulatedYield = (BigInt(position.accumulatedYield) + finalYield).toString();
    position.status = 'closed';

    this.savePositions();
    console.log(`📕 Position closed: ${id}`);

    return true;
  }

  /**
   * Print formatted summary to console
   */
  printSummary(): void {
    const summary = this.getSummary();

    console.log('\n' + '='.repeat(50));
    console.log('📊 POSITION TRACKER SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Deposited: ${summary.totalDeposited} SEI`);
    console.log(`Total Yield: ${summary.totalYield} SEI`);
    console.log(`Current Value: ${summary.currentValue} SEI`);
    console.log(`Effective APR: ${summary.effectiveAPR.toFixed(2)}%`);
    console.log('-'.repeat(50));

    if (summary.positions.length === 0) {
      console.log('No active positions');
    } else {
      for (const pos of summary.positions) {
        console.log(`\n${pos.strategy.toUpperCase()}`);
        console.log(`  Amount: ${pos.amount} SEI`);
        console.log(`  Yield: ${pos.yield} SEI`);
        console.log(`  APR: ${pos.apr.toFixed(1)}%`);
        console.log(`  Duration: ${pos.duration}`);
      }
    }
    console.log('\n' + '='.repeat(50));
  }
}

// Singleton instance
export const positionTracker = new PositionTracker();

export default positionTracker;
