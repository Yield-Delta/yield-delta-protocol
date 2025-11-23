import { logger, type IAgentRuntime, type Project, type ProjectAgent } from '@elizaos/core';
import starterPlugin from './plugin.ts';
import { character } from './character.ts';
import seiYieldDeltaPlugin from '../node_modules/@elizaos/plugin-sei-yield-delta/src/index.ts';
import vaultIntegrationPlugin from './vault-integration-plugin';

const initCharacter = ({ runtime }: { runtime: IAgentRuntime }) => {
  logger.info('Initializing character');
  logger.info({ name: character.name }, 'Name:');
  logger.info('🏦 Vault Integration enabled - automatic yield generation active');
};

export const projectAgent: ProjectAgent = {
  character,
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime }),
  plugins: [
    seiYieldDeltaPlugin, // Base SEI Yield Delta strategies
    vaultIntegrationPlugin, // Vault automation and monitoring
  ],
};

const project: Project = {
  agents: [projectAgent],
};

export { character } from './character.ts';

export default project;
