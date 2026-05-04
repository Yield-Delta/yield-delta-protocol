// AI Engine Types
export interface RebalanceRecommendation {
  vault: string;
  newTickLower: number;
  newTickUpper: number;
  confidence: number; // 0-10000 (0-100%)
  urgency: 'low' | 'medium' | 'high' | 'critical';
  expectedReturns: number;
  currentUtilization: number;
  optimalUtilization: number;
  reasoning?: string;
}

export interface AIEngineAnalysisRequest {
  vault_address: string;
  current_tick?: number;
  current_tick_lower?: number;
  current_tick_upper?: number;
  total_liquidity?: string;
  token0_amount?: string;
  token1_amount?: string;
}

export interface AIEngineAnalysisResponse {
  success: boolean;
  recommendation: RebalanceRecommendation;
  market_conditions?: {
    volatility: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    volume_24h: number;
  };
  timestamp: number;
}

// Contract Types
export interface AIRebalanceRequest {
  vault: string;
  newTickLower: number;
  newTickUpper: number;
  confidence: bigint;
  timestamp: bigint;
  deadline: bigint;
  executed: boolean;
}

export interface AIModel {
  version: string;
  signer: string;
  isActive: boolean;
  successRate: bigint;
  totalRequests: bigint;
}

// Service Configuration
export interface ServiceConfig {
  seiRpcUrl: string;
  seiChainId: number;
  aiModelSignerPrivateKey: string;
  aiOracleAddress: string;
  vaultFactoryAddress: string;
  vaults: string[];
  aiEngineUrl: string;
  cronSchedule: string;
  minConfidenceThreshold: number;
  requestDeadlineSeconds: number;
  logLevel: string;
  aiModelVersion: string;
  solana?: SolanaConfig;
}

// Submission Result
export interface SubmissionResult {
  success: boolean;
  requestId?: string;
  transactionHash?: string;
  error?: string;
  gasUsed?: bigint;
}

export interface ExecutionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasUsed?: bigint;
}

// Health Check
export interface HealthStatus {
  service: 'healthy' | 'degraded' | 'unhealthy';
  aiEngine: boolean;
  blockchain: boolean;
  lastCheck: Date;
  errors: string[];
}

// Vault State (from on-chain)
export interface VaultState {
  address: string;
  currentTickLower: number;
  currentTickUpper: number;
  totalLiquidity: bigint;
  token0Balance: bigint;
  token1Balance: bigint;
  lastRebalanceTime: bigint;
}

// ============ Solana Types ============

export interface SolanaConfig {
  rpcUrl: string;
  chainId: number;
  commitment: 'confirmed' | 'finalized' | 'processed';
  vaultProgramId: string;
  tokenProgramId: string;
  associatedTokenProgramId: string;
  vaults: string[];
  signerPrivateKey?: string;
}

export interface SolanaVaultState {
  address: string;
  poolAddress: string;
  tokenAMint: string;
  tokenBMint: string;
  liquidity: bigint;
  tokenABalance: bigint;
  tokenBBalance: bigint;
  lowerPrice: number;
  upperPrice: number;
  lastRebalanceTime: number;
  feeGrowthGlobal: bigint;
}

export interface SolanaTransaction {
  txId: string;
  signature: string;
  status: 'confirmed' | 'failed' | 'pending';
  blockTime: number;
  fee: bigint;
}

export interface SolanaSubmissionResult {
  success: boolean;
  txId?: string;
  signature?: string;
  error?: string;
  slot?: number;
}
