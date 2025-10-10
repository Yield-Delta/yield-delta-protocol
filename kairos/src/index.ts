import { logger, type IAgentRuntime, type Project, type ProjectAgent } from '@elizaos/core';
import starterPlugin from './plugin.ts';
import { character } from './character.ts';
// @ts-ignore - GitHub package not in npm registry
import seiYieldDeltaPlugin from '../node_modules/@elizaos/plugin-sei-yield-delta/dist/index.mjs';

const initCharacter = ({ runtime }: { runtime: IAgentRuntime }) => {
  logger.info('Initializing character');
  logger.info({ name: character.name }, 'Name:');
};

export const projectAgent: ProjectAgent = {
  character,
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime }),
  // plugins: [starterPlugin], <-- Import custom plugins here
  plugins: [seiYieldDeltaPlugin]
};

const project: Project = {
  agents: [projectAgent],
};

export { character } from './character.ts';

export default project;
