import dotenv from 'dotenv';
import { ServiceConfig } from '../types';
import logger from './logger';

dotenv.config();

function getEnvVar(name: string, required: boolean = true, defaultValue?: string): string {
  const value = process.env[name] || defaultValue;

  if (required && !value) {
    logger.error(`Missing required environment variable: ${name}`);
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value || '';
}

function getEnvNumber(name: string, required: boolean = true, defaultValue?: number): number {
  const strValue = getEnvVar(name, required, defaultValue?.toString());
  const numValue = parseInt(strValue, 10);

  if (isNaN(numValue)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }

  return numValue;
}

export function loadConfig(): ServiceConfig {
  return {
    // Network
    seiRpcUrl: getEnvVar('SEI_RPC_URL', true, 'https://evm-rpc-arctic-1.sei-apis.com'),
    seiChainId: getEnvNumber('SEI_CHAIN_ID', false, 1328),

    // Signer
    aiModelSignerPrivateKey: getEnvVar('AI_MODEL_SIGNER_PRIVATE_KEY', true),

    // Contracts
    aiOracleAddress: getEnvVar('AI_ORACLE_ADDRESS', true, '0x4199f86F3Bd73cF6ae5E89C8E28863d4B12fb18E'),
    vaultFactoryAddress: getEnvVar('VAULT_FACTORY_ADDRESS', true, '0x37b8E91705bc42d5489Dae84b00B87356342B267'),

    // Vaults to monitor
    vaults: getEnvVar('VAULTS', true).split(',').map(v => v.trim()).filter(v => v),

    // AI Engine
    aiEngineUrl: getEnvVar('AI_ENGINE_URL', true, 'http://localhost:8000'),

    // Service settings
    cronSchedule: getEnvVar('CRON_SCHEDULE', false, '*/5 * * * *'),
    minConfidenceThreshold: getEnvNumber('MIN_CONFIDENCE_THRESHOLD', false, 7500),
    requestDeadlineSeconds: getEnvNumber('REQUEST_DEADLINE_SECONDS', false, 300),
    logLevel: getEnvVar('LOG_LEVEL', false, 'info'),
    aiModelVersion: getEnvVar('AI_MODEL_VERSION', false, 'liquidity-optimizer-v1.0'),
  };
}

export function validateConfig(config: ServiceConfig): void {
  // Validate private key format
  if (!config.aiModelSignerPrivateKey.match(/^0x[a-fA-F0-9]{64}$/)) {
    throw new Error('Invalid private key format. Must be 0x followed by 64 hex characters');
  }

  // Validate addresses
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;

  if (!addressRegex.test(config.aiOracleAddress)) {
    throw new Error('Invalid AI Oracle address format');
  }

  if (!addressRegex.test(config.vaultFactoryAddress)) {
    throw new Error('Invalid Vault Factory address format');
  }

  for (const vault of config.vaults) {
    if (!addressRegex.test(vault)) {
      throw new Error(`Invalid vault address format: ${vault}`);
    }
  }

  // Validate thresholds
  if (config.minConfidenceThreshold < 0 || config.minConfidenceThreshold > 10000) {
    throw new Error('MIN_CONFIDENCE_THRESHOLD must be between 0 and 10000');
  }

  if (config.requestDeadlineSeconds < 60 || config.requestDeadlineSeconds > 3600) {
    throw new Error('REQUEST_DEADLINE_SECONDS must be between 60 and 3600');
  }

  logger.info('Configuration validated successfully');
}

export default { loadConfig, validateConfig };
