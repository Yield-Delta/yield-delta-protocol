import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import {
  isHexAddress,
  hasVerifiedTestnetOracleConfig,
  getOracleProviderDecision,
  KNOWN_MAINNET_ORACLE_DEFAULTS,
} from "../oracle-provider.ts";

// Valid testnet addresses: correct format and NOT in the known mainnet defaults set.
const VALID_TESTNET_ADDRESSES = {
  YEI_API3_CONTRACT: "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  YEI_PYTH_CONTRACT: "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
  YEI_SEI_ORACLE: "0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
  YEI_USDC_ORACLE: "0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
  YEI_USDT_ORACLE: "0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
  YEI_ETH_ORACLE: "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
  YEI_BTC_ORACLE: "0x1234567890123456789012345678901234567890",
};

// Save and restore env around each test so no state leaks between tests.
const savedEnv: Record<string, string | undefined> = {};
const ORACLE_ENV_KEYS = [
  "DISABLE_YEI_ORACLE_PROVIDER",
  "ENABLE_YEI_ORACLE_PROVIDER",
  "SEI_NETWORK",
  "YEI_API3_CONTRACT",
  "YEI_PYTH_CONTRACT",
  "YEI_SEI_ORACLE",
  "YEI_USDC_ORACLE",
  "YEI_USDT_ORACLE",
  "YEI_ETH_ORACLE",
  "YEI_BTC_ORACLE",
];

beforeEach(() => {
  for (const key of ORACLE_ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of ORACLE_ENV_KEYS) {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  }
});

// ---------------------------------------------------------------------------
// isHexAddress
// ---------------------------------------------------------------------------
describe("isHexAddress", () => {
  it("returns true for a valid 40-char hex address with 0x prefix", () => {
    expect(isHexAddress("0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")).toBe(
      true,
    );
  });

  it("returns true for mixed-case addresses (EIP-55 checksum format)", () => {
    expect(isHexAddress("0x2880aB155794e7179c9eE2e38200202908C17B43")).toBe(
      true,
    );
  });

  it("returns false for undefined", () => {
    expect(isHexAddress(undefined)).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isHexAddress("")).toBe(false);
  });

  it("returns false for an address without 0x prefix", () => {
    expect(isHexAddress("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")).toBe(
      false,
    );
  });

  it("returns false for an address shorter than 42 chars", () => {
    expect(isHexAddress("0xAAAA")).toBe(false);
  });

  it("returns false for an address with non-hex characters", () => {
    expect(isHexAddress("0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG")).toBe(
      false,
    );
  });

  it("trims surrounding whitespace before validating", () => {
    expect(isHexAddress("  0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA  ")).toBe(
      true,
    );
  });
});

// ---------------------------------------------------------------------------
// hasVerifiedTestnetOracleConfig
// ---------------------------------------------------------------------------
describe("hasVerifiedTestnetOracleConfig", () => {
  it("returns false when all oracle address env vars are unset", () => {
    expect(hasVerifiedTestnetOracleConfig()).toBe(false);
  });

  it("returns false when only some oracle env vars are set", () => {
    process.env.YEI_API3_CONTRACT = VALID_TESTNET_ADDRESSES.YEI_API3_CONTRACT;
    // The rest remain unset
    expect(hasVerifiedTestnetOracleConfig()).toBe(false);
  });

  it("returns false when an address is a known mainnet default", () => {
    const [firstDefault] = [...KNOWN_MAINNET_ORACLE_DEFAULTS];
    // Use a known mainnet address for one of the required vars
    Object.assign(process.env, VALID_TESTNET_ADDRESSES);
    process.env.YEI_API3_CONTRACT = firstDefault;
    expect(hasVerifiedTestnetOracleConfig()).toBe(false);
  });

  it("returns false when an address is not a valid hex address", () => {
    Object.assign(process.env, VALID_TESTNET_ADDRESSES);
    process.env.YEI_SEI_ORACLE = "not-an-address";
    expect(hasVerifiedTestnetOracleConfig()).toBe(false);
  });

  it("returns true when all oracle addresses are valid non-default hex addresses", () => {
    Object.assign(process.env, VALID_TESTNET_ADDRESSES);
    expect(hasVerifiedTestnetOracleConfig()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getOracleProviderDecision – decision matrix
// ---------------------------------------------------------------------------
describe("getOracleProviderDecision", () => {
  describe("DISABLE_YEI_ORACLE_PROVIDER takes precedence (highest priority)", () => {
    it("disables when DISABLE_YEI_ORACLE_PROVIDER=true", () => {
      process.env.DISABLE_YEI_ORACLE_PROVIDER = "true";
      process.env.SEI_NETWORK = "sei-mainnet";
      const result = getOracleProviderDecision();
      expect(result.disable).toBe(true);
      expect(result.reason).toContain("DISABLE_YEI_ORACLE_PROVIDER");
    });

    it('disables with truthy aliases: "1"', () => {
      process.env.DISABLE_YEI_ORACLE_PROVIDER = "1";
      const result = getOracleProviderDecision();
      expect(result.disable).toBe(true);
    });

    it('disables with truthy aliases: "yes"', () => {
      process.env.DISABLE_YEI_ORACLE_PROVIDER = "yes";
      const result = getOracleProviderDecision();
      expect(result.disable).toBe(true);
    });

    it('disables with truthy aliases: "TRUE" (case-insensitive)', () => {
      process.env.DISABLE_YEI_ORACLE_PROVIDER = "TRUE";
      const result = getOracleProviderDecision();
      expect(result.disable).toBe(true);
    });

    it("disables even when ENABLE_YEI_ORACLE_PROVIDER=true is also set", () => {
      process.env.DISABLE_YEI_ORACLE_PROVIDER = "true";
      process.env.ENABLE_YEI_ORACLE_PROVIDER = "true";
      process.env.SEI_NETWORK = "sei-testnet";
      Object.assign(process.env, VALID_TESTNET_ADDRESSES);
      const result = getOracleProviderDecision();
      expect(result.disable).toBe(true);
    });
  });

  describe("non-testnet network", () => {
    it("enables on mainnet with no explicit disable", () => {
      process.env.SEI_NETWORK = "sei-mainnet";
      const result = getOracleProviderDecision();
      expect(result.disable).toBe(false);
      expect(result.reason).toContain("non-testnet");
    });

    it("enables when SEI_NETWORK is unset (defaults to non-testnet)", () => {
      const result = getOracleProviderDecision();
      expect(result.disable).toBe(false);
      expect(result.reason).toContain("non-testnet");
    });

    it("enables on devnet (not a testnet)", () => {
      process.env.SEI_NETWORK = "sei-devnet";
      const result = getOracleProviderDecision();
      expect(result.disable).toBe(false);
    });
  });

  describe("testnet – requires explicit opt-in", () => {
    it("disables when on testnet and ENABLE_YEI_ORACLE_PROVIDER is unset", () => {
      process.env.SEI_NETWORK = "sei-testnet";
      const result = getOracleProviderDecision();
      expect(result.disable).toBe(true);
      expect(result.reason).toContain("ENABLE_YEI_ORACLE_PROVIDER");
    });

    it("disables when on testnet and ENABLE_YEI_ORACLE_PROVIDER=false", () => {
      process.env.SEI_NETWORK = "sei-testnet";
      process.env.ENABLE_YEI_ORACLE_PROVIDER = "false";
      const result = getOracleProviderDecision();
      expect(result.disable).toBe(true);
    });
  });

  describe("testnet – opted in but bad oracle addresses", () => {
    it("disables when addresses are missing", () => {
      process.env.SEI_NETWORK = "sei-testnet";
      process.env.ENABLE_YEI_ORACLE_PROVIDER = "true";
      // No oracle address env vars set
      const result = getOracleProviderDecision();
      expect(result.disable).toBe(true);
      expect(result.reason).toContain("missing/invalid");
    });

    it("disables when an address is a known mainnet default", () => {
      process.env.SEI_NETWORK = "sei-testnet";
      process.env.ENABLE_YEI_ORACLE_PROVIDER = "true";
      const [firstDefault] = [...KNOWN_MAINNET_ORACLE_DEFAULTS];
      Object.assign(process.env, VALID_TESTNET_ADDRESSES);
      process.env.YEI_API3_CONTRACT = firstDefault;
      const result = getOracleProviderDecision();
      expect(result.disable).toBe(true);
      expect(result.reason).toContain("missing/invalid");
    });

    it("disables when an address is syntactically invalid", () => {
      process.env.SEI_NETWORK = "sei-testnet";
      process.env.ENABLE_YEI_ORACLE_PROVIDER = "true";
      Object.assign(process.env, VALID_TESTNET_ADDRESSES);
      process.env.YEI_BTC_ORACLE = "not-a-valid-address";
      const result = getOracleProviderDecision();
      expect(result.disable).toBe(true);
    });
  });

  describe("testnet – fully opted in with valid addresses", () => {
    it("enables when opted-in with all valid non-default addresses", () => {
      process.env.SEI_NETWORK = "sei-testnet";
      process.env.ENABLE_YEI_ORACLE_PROVIDER = "true";
      Object.assign(process.env, VALID_TESTNET_ADDRESSES);
      const result = getOracleProviderDecision();
      expect(result.disable).toBe(false);
      expect(result.reason).toContain("explicitly enabled");
    });

    it('accepts truthy alias "1" for ENABLE_YEI_ORACLE_PROVIDER', () => {
      process.env.SEI_NETWORK = "sei-testnet";
      process.env.ENABLE_YEI_ORACLE_PROVIDER = "1";
      Object.assign(process.env, VALID_TESTNET_ADDRESSES);
      const result = getOracleProviderDecision();
      expect(result.disable).toBe(false);
    });

    it('accepts truthy alias "yes" for ENABLE_YEI_ORACLE_PROVIDER', () => {
      process.env.SEI_NETWORK = "sei-testnet";
      process.env.ENABLE_YEI_ORACLE_PROVIDER = "yes";
      Object.assign(process.env, VALID_TESTNET_ADDRESSES);
      const result = getOracleProviderDecision();
      expect(result.disable).toBe(false);
    });
  });
});
