import { logger, type IAgentRuntime, type Project, type ProjectAgent } from '@elizaos/core';
import starterPlugin from './plugin.ts';
import { character } from './character.ts';
import seiYieldDeltaPlugin from '../node_modules/@elizaos/plugin-sei-yield-delta/src/index.ts';
import vaultIntegrationPlugin from './vault-integration-plugin';

const KNOWN_MAINNET_ORACLE_DEFAULTS = new Set([
  '0x2880ab155794e7179c9ee2e38200202908c17b43',
  '0xa2acdc40e5ebce7f8554e66ece6734937a48b3f3',
  '0xeab459ad7611d5223a408a2e73b69173f61bb808',
  '0x284db472a483e115e3422dd30288b24182e36ddb',
  '0x3e45fb956d2ba2cb5fa561c40e5912225e64f7b2',
  '0xf0f6e8b018d7834e3693e9a0f389282c3f59f1f6',
  '0x1111111111111111111111111111111111111111',
]);

const isTruthy = (value?: string): boolean => {
  if (!value) return false;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
};

const isHexAddress = (value?: string): boolean => {
  if (!value) return false;
  const normalized = value.trim();
  return /^0x[a-fA-F0-9]{40}$/.test(normalized);
};

const hasVerifiedTestnetOracleConfig = (): boolean => {
  const requiredOracleVars = [
    process.env.YEI_API3_CONTRACT,
    process.env.YEI_PYTH_CONTRACT,
    process.env.YEI_SEI_ORACLE,
    process.env.YEI_USDC_ORACLE,
    process.env.YEI_USDT_ORACLE,
    process.env.YEI_ETH_ORACLE,
    process.env.YEI_BTC_ORACLE,
  ];

  for (const address of requiredOracleVars) {
    if (!isHexAddress(address)) {
      return false;
    }

    if (KNOWN_MAINNET_ORACLE_DEFAULTS.has(address!.toLowerCase())) {
      return false;
    }
  }

  return true;
};

const getOracleProviderDecision = (): { disable: boolean; reason: string } => {
  const explicitDisable = process.env.DISABLE_YEI_ORACLE_PROVIDER;
  if (explicitDisable !== undefined) {
    return {
      disable: isTruthy(explicitDisable),
      reason: 'explicit DISABLE_YEI_ORACLE_PROVIDER override',
    };
  }

  const isTestnet = (process.env.SEI_NETWORK || '').toLowerCase().includes('testnet');
  if (!isTestnet) {
    return { disable: false, reason: 'non-testnet network' };
  }

  // On testnet, require explicit opt-in plus non-default, valid oracle addresses.
  if (!isTruthy(process.env.ENABLE_YEI_ORACLE_PROVIDER)) {
    return {
      disable: true,
      reason: 'testnet requires ENABLE_YEI_ORACLE_PROVIDER=true',
    };
  }

  if (!hasVerifiedTestnetOracleConfig()) {
    return {
      disable: true,
      reason: 'testnet oracle addresses are missing/invalid or still using known defaults',
    };
  }

  return {
    disable: false,
    reason: 'testnet oracle provider explicitly enabled with verified addresses',
  };
};

const withOptionalOracleProvider = () => {
  const decision = getOracleProviderDecision();
  if (!decision.disable) {
    logger.info(`YEI oracle polling provider enabled (${decision.reason})`);
    return seiYieldDeltaPlugin;
  }

  const providers = (seiYieldDeltaPlugin as any).providers;
  if (!Array.isArray(providers)) {
    logger.warn(
      `YEI oracle provider should be disabled (${decision.reason}), but no plugin providers were found to filter`
    );
    return seiYieldDeltaPlugin;
  }

  const filteredProviders = providers.filter((provider: any) => provider?.name !== 'seiOracle');

  logger.warn(`YEI oracle polling provider disabled for this runtime (${decision.reason})`);

  return {
    ...(seiYieldDeltaPlugin as any),
    providers: filteredProviders,
  };
};

const configuredSeiYieldDeltaPlugin = withOptionalOracleProvider();

const initCharacter = ({ runtime }: { runtime: IAgentRuntime }) => {
  logger.info('Initializing character');
  logger.info({ name: character.name }, 'Name:');
  logger.info('🏦 Vault Integration enabled - automatic yield generation active');
};

export const projectAgent: ProjectAgent = {
  character,
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime }),
  plugins: [
    configuredSeiYieldDeltaPlugin, // Base SEI Yield Delta strategies (optionally without polling oracle provider)
    vaultIntegrationPlugin, // Vault automation and monitoring
  ],
};

const project: Project = {
  agents: [projectAgent],
};

export { character } from './character.ts';

export default project;
