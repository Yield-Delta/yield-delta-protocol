import { ethers, Contract, Wallet, Provider, JsonRpcProvider } from 'ethers';
import { ServiceConfig, SubmissionResult, ExecutionResult, AIModel } from '../types';
import logger from '../utils/logger';

// AIOracle ABI (minimal interface needed for the signing service)
const AI_ORACLE_ABI = [
  // Read functions
  'function aiModels(string) view returns (string version, address signer, bool isActive, uint256 successRate, uint256 totalRequests)',
  'function requests(bytes32) view returns (address vault, int24 newTickLower, int24 newTickUpper, uint256 confidence, uint256 timestamp, uint256 deadline, bool executed)',
  'function primaryModel() view returns (string)',
  'function totalRequests() view returns (uint256)',
  'function successfulRequests() view returns (uint256)',
  'function getModelPerformance(string) view returns (uint256 successRate, uint256 totalRequests, bool isActive)',

  // Write functions
  'function submitRebalanceRequest(address vault, int24 newTickLower, int24 newTickUpper, uint256 confidence, uint256 deadline, string model, bytes signature) returns (bytes32 requestId)',
  'function executeRebalanceRequest(bytes32 requestId, string model) returns (bool success)',

  // Events
  'event AIRequestSubmitted(bytes32 indexed requestId, address indexed vault, string model)',
  'event AIRequestExecuted(bytes32 indexed requestId, bool success, uint256 gasUsed)',
];

export class AIOracleService {
  private provider: JsonRpcProvider;
  private signer: Wallet;
  private contract: Contract;
  private config: ServiceConfig;

  constructor(config: ServiceConfig) {
    this.config = config;

    // Initialize provider
    this.provider = new JsonRpcProvider(config.seiRpcUrl);

    // Initialize signer
    this.signer = new Wallet(config.aiModelSignerPrivateKey, this.provider);

    // Initialize contract
    this.contract = new Contract(
      config.aiOracleAddress,
      AI_ORACLE_ABI,
      this.signer
    );

    logger.info(`AIOracle service initialized`, {
      oracleAddress: config.aiOracleAddress,
      signerAddress: this.signer.address,
    });
  }

  /**
   * Get the signer's address
   */
  getSignerAddress(): string {
    return this.signer.address;
  }

  /**
   * Check if the AI model is registered and active
   */
  async isModelActive(modelVersion: string): Promise<boolean> {
    try {
      const [, , isActive] = await this.contract.getModelPerformance(modelVersion);
      return isActive;
    } catch (error) {
      logger.error('Error checking model status', { modelVersion, error });
      return false;
    }
  }

  /**
   * Get AI model info
   */
  async getModelInfo(modelVersion: string): Promise<AIModel | null> {
    try {
      const result = await this.contract.aiModels(modelVersion);
      return {
        version: result.version,
        signer: result.signer,
        isActive: result.isActive,
        successRate: result.successRate,
        totalRequests: result.totalRequests,
      };
    } catch (error) {
      logger.error('Error getting model info', { modelVersion, error });
      return null;
    }
  }

  /**
   * Create the message hash for signing
   */
  createMessageHash(
    vault: string,
    newTickLower: number,
    newTickUpper: number,
    confidence: number,
    deadline: number
  ): string {
    // Must match the contract's hash creation exactly
    const packedData = ethers.solidityPacked(
      ['address', 'int24', 'int24', 'uint256', 'uint256'],
      [vault, newTickLower, newTickUpper, confidence, deadline]
    );

    return ethers.keccak256(packedData);
  }

  /**
   * Sign a rebalance request
   */
  async signRebalanceRequest(
    vault: string,
    newTickLower: number,
    newTickUpper: number,
    confidence: number,
    deadline: number
  ): Promise<string> {
    const messageHash = this.createMessageHash(
      vault,
      newTickLower,
      newTickUpper,
      confidence,
      deadline
    );

    // Sign the message hash (ethers will add the Ethereum Signed Message prefix)
    const signature = await this.signer.signMessage(ethers.getBytes(messageHash));

    logger.debug('Signed rebalance request', {
      vault,
      newTickLower,
      newTickUpper,
      confidence,
      deadline,
      messageHash,
    });

    return signature;
  }

  /**
   * Submit a rebalance request to the AIOracle contract
   */
  async submitRebalanceRequest(
    vault: string,
    newTickLower: number,
    newTickUpper: number,
    confidence: number,
    deadline: number,
    modelVersion: string
  ): Promise<SubmissionResult> {
    try {
      // Sign the request
      const signature = await this.signRebalanceRequest(
        vault,
        newTickLower,
        newTickUpper,
        confidence,
        deadline
      );

      logger.info('Submitting rebalance request to AIOracle', {
        vault,
        newTickLower,
        newTickUpper,
        confidence,
        deadline,
        modelVersion,
      });

      // Submit to contract
      const tx = await this.contract.submitRebalanceRequest(
        vault,
        newTickLower,
        newTickUpper,
        confidence,
        deadline,
        modelVersion,
        signature
      );

      logger.info('Transaction submitted, waiting for confirmation...', {
        txHash: tx.hash,
      });

      // Wait for confirmation
      const receipt = await tx.wait();

      // Extract requestId from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'AIRequestSubmitted';
        } catch {
          return false;
        }
      });

      let requestId: string | undefined;
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        requestId = parsed?.args?.requestId;
      }

      logger.info('Rebalance request submitted successfully', {
        requestId,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
      });

      return {
        success: true,
        requestId,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed,
      };
    } catch (error: any) {
      logger.error('Failed to submit rebalance request', {
        vault,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Execute a pending rebalance request
   */
  async executeRebalanceRequest(
    requestId: string,
    modelVersion: string
  ): Promise<ExecutionResult> {
    try {
      logger.info('Executing rebalance request', { requestId, modelVersion });

      const tx = await this.contract.executeRebalanceRequest(
        requestId,
        modelVersion
      );

      logger.info('Execution transaction submitted, waiting for confirmation...', {
        txHash: tx.hash,
      });

      const receipt = await tx.wait();

      // Check for execution event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'AIRequestExecuted';
        } catch {
          return false;
        }
      });

      let success = false;
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        success = parsed?.args?.success || false;
      }

      logger.info('Rebalance request executed', {
        requestId,
        success,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
      });

      return {
        success,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed,
      };
    } catch (error: any) {
      logger.error('Failed to execute rebalance request', {
        requestId,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Submit and execute a rebalance request in one flow
   */
  async submitAndExecute(
    vault: string,
    newTickLower: number,
    newTickUpper: number,
    confidence: number,
    deadline: number,
    modelVersion: string
  ): Promise<{ submission: SubmissionResult; execution?: ExecutionResult }> {
    // Submit the request
    const submission = await this.submitRebalanceRequest(
      vault,
      newTickLower,
      newTickUpper,
      confidence,
      deadline,
      modelVersion
    );

    if (!submission.success || !submission.requestId) {
      return { submission };
    }

    // Execute the request
    const execution = await this.executeRebalanceRequest(
      submission.requestId,
      modelVersion
    );

    return { submission, execution };
  }

  /**
   * Check blockchain connection health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();

      logger.debug('Blockchain health check passed', {
        chainId: network.chainId.toString(),
        blockNumber,
      });

      return network.chainId === BigInt(this.config.seiChainId);
    } catch (error) {
      logger.error('Blockchain health check failed', { error });
      return false;
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  }

  /**
   * Get signer balance
   */
  async getSignerBalance(): Promise<bigint> {
    return await this.provider.getBalance(this.signer.address);
  }
}

export default AIOracleService;
