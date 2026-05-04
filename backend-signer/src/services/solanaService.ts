import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  ServiceConfig,
  SolanaConfig,
  SolanaVaultState,
  SolanaSubmissionResult,
} from '../types';
import logger from '../utils/logger';

const REBALANCE_IX_DISCRIMINATOR = Buffer.from([0x8a, 0x12, 0x2f, 0x9a, 0xc5, 0x2c, 0xa2, 0xed]);

export class SolanaService {
  private connection: Connection;
  private config: SolanaConfig;
  private vaultProgramId: PublicKey;
  private signerKeypair: Keypair | null = null;

  constructor(config: ServiceConfig) {
    if (!config.solana) {
      throw new Error('Solana configuration not provided');
    }

    this.config = config.solana;
    this.vaultProgramId = new PublicKey(this.config.vaultProgramId);

    this.connection = new Connection(this.config.rpcUrl, {
      commitment: this.config.commitment,
      confirmTransactionInitialTimeout: 30000,
    });

    logger.info('Solana service initialized', {
      rpcUrl: this.config.rpcUrl,
      commitment: this.config.commitment,
      vaultProgramId: this.config.vaultProgramId,
    });
  }

  setSigner(keypair: Keypair) {
    this.signerKeypair = keypair;
    logger.info('Solana signer set', { pubkey: keypair.publicKey.toBase58() });
  }

  async getVaultState(vaultAddress: string): Promise<SolanaVaultState | null> {
    try {
      const vaultPubkey = new PublicKey(vaultAddress);
      const accountInfo = await this.connection.getParsedAccountInfo(vaultPubkey);

      if (!accountInfo.value) {
        logger.warn('Vault account not found', { vault: vaultAddress });
        return null;
      }

      const data = accountInfo.value.data as any;
      const parsed = data.parsed || data;

      return {
        address: vaultAddress,
        poolAddress: parsed.info?.poolAddress || '',
        tokenAMint: parsed.info?.tokenAMint || '',
        tokenBMint: parsed.info?.tokenBMint || '',
        liquidity: BigInt(parsed.info?.liquidity || 0),
        tokenABalance: BigInt(parsed.info?.tokenABalance || 0),
        tokenBBalance: BigInt(parsed.info?.tokenBBalance || 0),
        lowerPrice: parsed.info?.lowerPrice || 0,
        upperPrice: parsed.info?.upperPrice || 0,
        lastRebalanceTime: parsed.info?.lastRebalanceTime || 0,
        feeGrowthGlobal: BigInt(parsed.info?.feeGrowthGlobal || 0),
      };
    } catch (error: any) {
      logger.error('Failed to get vault state', { vault: vaultAddress, error: error.message });
      return null;
    }
  }

  async getAllVaultStates(): Promise<SolanaVaultState[]> {
    const states: SolanaVaultState[] = [];

    for (const vaultAddress of this.config.vaults) {
      const state = await this.getVaultState(vaultAddress);
      if (state) {
        states.push(state);
      }
    }

    logger.info('Fetched vault states', { count: states.length });
    return states;
  }

  async getTokenBalance(walletAddress: string, tokenMint: string): Promise<bigint> {
    try {
      if (tokenMint === 'So11111111111111111111111111111111111111111') {
        const walletPubkey = new PublicKey(walletAddress);
        const balance = await this.connection.getBalance(walletPubkey);
        return BigInt(balance);
      }

      const walletPubkey = new PublicKey(walletAddress);
      const tokenMintPubkey = new PublicKey(tokenMint);
      const programId = new PublicKey(this.config.tokenProgramId);

      const ata = await PublicKey.findProgramAddress(
        [walletPubkey.toBuffer(), programId.toBuffer(), tokenMintPubkey.toBuffer()],
        new PublicKey(this.config.associatedTokenProgramId)
      );

      try {
        const accountInfo = await this.connection.getParsedAccountInfo(ata[0]);
        if (accountInfo.value) {
          const data = accountInfo.value.data as any;
          return BigInt(data.parsed?.info?.amount || 0);
        }
      } catch {
        return BigInt(0);
      }

      return BigInt(0);
    } catch (error: any) {
      logger.error('Failed to get token balance', {
        wallet: walletAddress,
        mint: tokenMint,
        error: error.message,
      });
      return BigInt(0);
    }
  }

  async getSignerBalance(): Promise<bigint> {
    if (!this.signerKeypair) {
      return BigInt(0);
    }
    const balance = await this.connection.getBalance(this.signerKeypair.publicKey);
    return BigInt(balance);
  }

  async checkHealth(): Promise<boolean> {
    try {
      const version = await this.connection.getVersion();
      logger.debug('Solana connection health', { version: version['solana-core'] });
      return true;
    } catch (error) {
      logger.error('Solana health check failed', { error });
      return false;
    }
  }

  async submitRebalance(
    vaultAddress: string,
    newLowerPrice: number,
    newUpperPrice: number,
    signers: Keypair[]
  ): Promise<SolanaSubmissionResult> {
    if (!this.signerKeypair && signers.length === 0) {
      return { success: false, error: 'No signer available' };
    }

    try {
      const vaultPubkey = new PublicKey(vaultAddress);
      const tx = new Transaction();

      const rebalanceIx = new TransactionInstruction({
        programId: this.vaultProgramId,
        keys: [
          { pubkey: vaultPubkey, isSigner: false, isWritable: true },
          { pubkey: this.signerKeypair!.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: Buffer.concat([
          REBALANCE_IX_DISCRIMINATOR,
          Buffer.from(JSON.stringify({ lower: newLowerPrice, upper: newUpperPrice })),
        ]),
      });

      tx.add(rebalanceIx);

      const allSigners = this.signerKeypair ? [this.signerKeypair, ...signers] : signers;
      const signature = await sendAndConfirmTransaction(
        this.connection,
        tx,
        allSigners,
        { commitment: this.config.commitment }
      );

      logger.info('Solana rebalance submitted', {
        vault: vaultAddress,
        signature,
        lower: newLowerPrice,
        upper: newUpperPrice,
      });

      return {
        success: true,
        signature,
        txId: signature,
      };
    } catch (error: any) {
      logger.error('Failed to submit rebalance', {
        vault: vaultAddress,
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  }

  getSignerAddress(): string {
    return this.signerKeypair?.publicKey.toBase58() || '';
  }

  getConnection(): Connection {
    return this.connection;
  }

  getVaultProgramId(): PublicKey {
    return this.vaultProgramId;
  }
}

export default SolanaService;