import { loadConfig, validateConfig } from '../../src/utils/config';
import { ServiceConfig } from '../../src/types';
import logger from '../../src/utils/logger';

// Mock logger
jest.mock('../../src/utils/logger');

describe('Config Utils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('loadConfig', () => {
    it('should load config with all required environment variables', () => {
      process.env = {
        ...process.env,
        AI_MODEL_SIGNER_PRIVATE_KEY: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        AI_ORACLE_ADDRESS: '0x4199f86F3Bd73cF6ae5E89C8E28863d4B12fb18E',
        VAULT_FACTORY_ADDRESS: '0x37b8E91705bc42d5489Dae84b00B87356342B267',
        VAULTS: '0xvault1,0xvault2,0xvault3',
        AI_ENGINE_URL: 'http://localhost:8000',
      };

      const config = loadConfig();

      expect(config).toEqual({
        seiRpcUrl: 'https://evm-rpc-arctic-1.sei-apis.com',
        seiChainId: 1328,
        aiModelSignerPrivateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        aiOracleAddress: '0x4199f86F3Bd73cF6ae5E89C8E28863d4B12fb18E',
        vaultFactoryAddress: '0x37b8E91705bc42d5489Dae84b00B87356342B267',
        vaults: ['0xvault1', '0xvault2', '0xvault3'],
        aiEngineUrl: 'http://localhost:8000',
        cronSchedule: '*/5 * * * *',
        minConfidenceThreshold: 7500,
        requestDeadlineSeconds: 300,
        logLevel: 'info',
        aiModelVersion: 'liquidity-optimizer-v1.0',
      });
    });

    it('should use custom values when provided', () => {
      process.env = {
        ...process.env,
        AI_MODEL_SIGNER_PRIVATE_KEY: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        AI_ORACLE_ADDRESS: '0x1234567890123456789012345678901234567890',
        VAULT_FACTORY_ADDRESS: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        VAULTS: '0xvault1',
        AI_ENGINE_URL: 'http://ai-engine:9000',
        SEI_RPC_URL: 'http://custom-rpc.com',
        SEI_CHAIN_ID: '1329',
        CRON_SCHEDULE: '*/10 * * * *',
        MIN_CONFIDENCE_THRESHOLD: '8000',
        REQUEST_DEADLINE_SECONDS: '600',
        LOG_LEVEL: 'debug',
        AI_MODEL_VERSION: 'v2.0.0',
      };

      const config = loadConfig();

      expect(config.seiRpcUrl).toBe('http://custom-rpc.com');
      expect(config.seiChainId).toBe(1329);
      expect(config.cronSchedule).toBe('*/10 * * * *');
      expect(config.minConfidenceThreshold).toBe(8000);
      expect(config.requestDeadlineSeconds).toBe(600);
      expect(config.logLevel).toBe('debug');
      expect(config.aiModelVersion).toBe('v2.0.0');
    });

    it('should throw error for missing required environment variable', () => {
      process.env = {
        ...process.env,
        // Missing AI_MODEL_SIGNER_PRIVATE_KEY
        AI_ORACLE_ADDRESS: '0x4199f86F3Bd73cF6ae5E89C8E28863d4B12fb18E',
        VAULT_FACTORY_ADDRESS: '0x37b8E91705bc42d5489Dae84b00B87356342B267',
        VAULTS: '0xvault1',
        AI_ENGINE_URL: 'http://localhost:8000',
      };

      expect(() => loadConfig()).toThrow('Missing required environment variable: AI_MODEL_SIGNER_PRIVATE_KEY');
    });

    it('should throw error for invalid number format', () => {
      process.env = {
        ...process.env,
        AI_MODEL_SIGNER_PRIVATE_KEY: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        AI_ORACLE_ADDRESS: '0x4199f86F3Bd73cF6ae5E89C8E28863d4B12fb18E',
        VAULT_FACTORY_ADDRESS: '0x37b8E91705bc42d5489Dae84b00B87356342B267',
        VAULTS: '0xvault1',
        AI_ENGINE_URL: 'http://localhost:8000',
        SEI_CHAIN_ID: 'not-a-number',
      };

      expect(() => loadConfig()).toThrow('Environment variable SEI_CHAIN_ID must be a number');
    });

    it('should handle empty vault addresses correctly', () => {
      process.env = {
        ...process.env,
        AI_MODEL_SIGNER_PRIVATE_KEY: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        AI_ORACLE_ADDRESS: '0x4199f86F3Bd73cF6ae5E89C8E28863d4B12fb18E',
        VAULT_FACTORY_ADDRESS: '0x37b8E91705bc42d5489Dae84b00B87356342B267',
        VAULTS: '0xvault1, , 0xvault2', // Has empty spaces
        AI_ENGINE_URL: 'http://localhost:8000',
      };

      const config = loadConfig();

      expect(config.vaults).toEqual(['0xvault1', '0xvault2']);
    });
  });

  describe('validateConfig', () => {
    let validConfig: ServiceConfig;

    beforeEach(() => {
      validConfig = {
        seiRpcUrl: 'https://evm-rpc-arctic-1.sei-apis.com',
        seiChainId: 1328,
        aiModelSignerPrivateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        aiOracleAddress: '0x4199f86F3Bd73cF6ae5E89C8E28863d4B12fb18E',
        vaultFactoryAddress: '0x37b8E91705bc42d5489Dae84b00B87356342B267',
        vaults: ['0x1234567890123456789012345678901234567890'],
        aiEngineUrl: 'http://localhost:8000',
        cronSchedule: '*/5 * * * *',
        minConfidenceThreshold: 7500,
        requestDeadlineSeconds: 300,
        logLevel: 'info',
        aiModelVersion: 'v1.0.0',
      };
    });

    it('should validate correct config', () => {
      expect(() => validateConfig(validConfig)).not.toThrow();
      expect(logger.info).toHaveBeenCalledWith('Configuration validated successfully');
    });

    it('should throw error for invalid private key format', () => {
      validConfig.aiModelSignerPrivateKey = 'invalid-key';
      expect(() => validateConfig(validConfig)).toThrow(
        'Invalid private key format. Must be 0x followed by 64 hex characters'
      );

      validConfig.aiModelSignerPrivateKey = '0x123'; // Too short
      expect(() => validateConfig(validConfig)).toThrow(
        'Invalid private key format. Must be 0x followed by 64 hex characters'
      );
    });

    it('should throw error for invalid AI Oracle address', () => {
      validConfig.aiOracleAddress = 'invalid-address';
      expect(() => validateConfig(validConfig)).toThrow('Invalid AI Oracle address format');

      validConfig.aiOracleAddress = '0x123'; // Too short
      expect(() => validateConfig(validConfig)).toThrow('Invalid AI Oracle address format');
    });

    it('should throw error for invalid Vault Factory address', () => {
      validConfig.vaultFactoryAddress = '0xGHIJKL'; // Invalid hex
      expect(() => validateConfig(validConfig)).toThrow('Invalid Vault Factory address format');
    });

    it('should throw error for invalid vault address', () => {
      validConfig.vaults = ['0x1234567890123456789012345678901234567890', 'invalid-vault'];
      expect(() => validateConfig(validConfig)).toThrow(
        'Invalid vault address format: invalid-vault'
      );
    });

    it('should throw error for confidence threshold out of range', () => {
      validConfig.minConfidenceThreshold = -1;
      expect(() => validateConfig(validConfig)).toThrow(
        'MIN_CONFIDENCE_THRESHOLD must be between 0 and 10000'
      );

      validConfig.minConfidenceThreshold = 10001;
      expect(() => validateConfig(validConfig)).toThrow(
        'MIN_CONFIDENCE_THRESHOLD must be between 0 and 10000'
      );
    });

    it('should throw error for deadline seconds out of range', () => {
      validConfig.requestDeadlineSeconds = 59;
      expect(() => validateConfig(validConfig)).toThrow(
        'REQUEST_DEADLINE_SECONDS must be between 60 and 3600'
      );

      validConfig.requestDeadlineSeconds = 3601;
      expect(() => validateConfig(validConfig)).toThrow(
        'REQUEST_DEADLINE_SECONDS must be between 60 and 3600'
      );
    });

    it('should accept edge case values', () => {
      validConfig.minConfidenceThreshold = 0;
      expect(() => validateConfig(validConfig)).not.toThrow();

      validConfig.minConfidenceThreshold = 10000;
      expect(() => validateConfig(validConfig)).not.toThrow();

      validConfig.requestDeadlineSeconds = 60;
      expect(() => validateConfig(validConfig)).not.toThrow();

      validConfig.requestDeadlineSeconds = 3600;
      expect(() => validateConfig(validConfig)).not.toThrow();
    });
  });
});