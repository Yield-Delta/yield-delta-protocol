import {
  logger,
  type IAgentRuntime,
  type Project,
  type ProjectAgent,
} from "@elizaos/core";
import starterPlugin from "./plugin.ts";
import { character } from "./character.ts";
import seiYieldDeltaPlugin from "../node_modules/@elizaos/plugin-sei-yield-delta/src/index.ts";
import vaultIntegrationPlugin from "./vault-integration-plugin";
import { getOracleProviderDecision } from "./oracle-provider.ts";

const withOptionalOracleProvider = () => {
  const decision = getOracleProviderDecision();
  if (!decision.disable) {
    logger.info(`YEI oracle polling provider enabled (${decision.reason})`);
    return seiYieldDeltaPlugin;
  }

  const providers = (seiYieldDeltaPlugin as any).providers;
  if (!Array.isArray(providers)) {
    logger.warn(
      `YEI oracle provider should be disabled (${decision.reason}), but no plugin providers were found to filter; returning plugin with no providers`,
    );
    return {
      ...(seiYieldDeltaPlugin as any),
      providers: [],
    };
  }

  const filteredProviders = providers.filter(
    (provider: any) => provider?.name !== "seiOracle",
  );

  logger.warn(
    `YEI oracle polling provider disabled for this runtime (${decision.reason})`,
  );

  return {
    ...(seiYieldDeltaPlugin as any),
    providers: filteredProviders,
  };
};

// Memoized reference; populated on first access of projectAgent.plugins so that
// env/config is fully resolved and no logging side-effects occur at import time.
let _configuredSeiYieldDeltaPlugin:
  | ReturnType<typeof withOptionalOracleProvider>
  | undefined;

const initCharacter = ({ runtime }: { runtime: IAgentRuntime }) => {
  logger.info("Initializing character");
  logger.info({ name: character.name }, "Name:");
  logger.info(
    "🏦 Vault Integration enabled - automatic yield generation active",
  );
};

export const projectAgent: ProjectAgent = {
  character,
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime }),
  get plugins() {
    _configuredSeiYieldDeltaPlugin ??= withOptionalOracleProvider();
    return [
      _configuredSeiYieldDeltaPlugin, // Base SEI Yield Delta strategies (optionally without polling oracle provider)
      vaultIntegrationPlugin, // Vault automation and monitoring
    ];
  },
} as ProjectAgent;

const project: Project = {
  agents: [projectAgent],
};

export { character } from "./character.ts";

export default project;
