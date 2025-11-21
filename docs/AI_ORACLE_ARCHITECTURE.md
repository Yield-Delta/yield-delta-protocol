# AI Oracle and Rebalancing Architecture

## Executive Summary

The Yield Delta Protocol implements an AI-driven rebalancing system for dynamic liquidity vaults on the SEI Network. The architecture consists of three main layers:

1. **AI Engine (Python)** - Machine learning models for liquidity optimization
2. **AIOracle Smart Contract (Solidity)** - On-chain oracle for validating and executing AI recommendations
3. **Integration Layer** - API bridges and ElizaOS/Kairos agent integration

---

## 1. AIOracle Contract Architecture

**Contract:** `contracts/src/AIOracle.sol`
**Deployed Address:** `0x4199f86F3Bd73cF6ae5E89C8E28863d4B12fb18E` (SEI Atlantic-2)

### What the AIOracle Does

The `AIOracle` is the **on-chain gateway** between off-chain AI analysis and on-chain vault operations. It:

1. **Validates AI Signatures** - Ensures only authorized AI models can submit rebalance requests
2. **Manages Requests** - Stores, tracks, and prevents replay of rebalance requests
3. **Routes Execution** - Calls vault's `rebalance()` function with AI-recommended parameters
4. **Tracks Metrics** - Records success rates and performance per AI model

### Core Data Structures

```solidity
struct AIRebalanceRequest {
    address vault;           // Target vault address
    int24 newTickLower;      // New lower tick for liquidity range
    int24 newTickUpper;      // New upper tick for liquidity range
    uint256 confidence;      // AI model confidence (0-10000 = 0-100%)
    uint256 timestamp;       // Request creation time
    uint256 deadline;        // Expiration timestamp
    bool executed;           // Execution status
}

struct AIModel {
    string version;          // Model identifier (e.g., "liquidity-optimizer-v1.0")
    address signer;          // Authorized signer for this model
    bool isActive;           // Whether model can submit requests
    uint256 successRate;     // Historical success rate
    uint256 totalRequests;   // Total requests processed
}
```

### Key Functions

| Function | Access | Description |
|----------|--------|-------------|
| `registerAIModel(model, signer)` | Owner only | Register new AI model with signing address |
| `submitRebalanceRequest(...)` | Anyone (with valid signature) | Submit signed rebalance request |
| `executeRebalanceRequest(requestId)` | Anyone | Execute a pending request on vault |
| `deactivateModel(model)` | Owner only | Disable an AI model |

### Security Mechanisms

1. **ECDSA Signature Verification** - Messages signed off-chain must recover to registered model signer
2. **Chain Validation** - Only operates on SEI network (chain ID 1328)
3. **Request Replay Protection** - Each request ID can only be executed once
4. **Deadline Enforcement** - Expired requests cannot be executed
5. **ReentrancyGuard** - Protects execution from reentrancy attacks

---

## 2. Who/What Calls the Rebalance?

### The Intended Flow

```
AI Engine (Python ML)
    → API Bridge (FastAPI)
        → Backend Signing Service [NOT YET BUILT]
            → AIOracle (on-chain)
                → StrategyVault.rebalance()
```

### Current Implementation Status

| Component | Status | Description |
|-----------|--------|-------------|
| **AI Engine** | Implemented | Python ML models for market analysis |
| **API Bridge** | Implemented | FastAPI endpoints at port 8000 |
| **Backend Signing Service** | **NOT IMPLEMENTED** | The missing critical piece |
| **AIOracle Contract** | Implemented | Deployed to SEI testnet |
| **StrategyVault** | Implemented | `rebalance()` function ready |
| **Kairos Plugin** | Template only | Needs custom actions |

### What About Kairos AI Agent?

The `/kairos/` directory contains a **starter template** for ElizaOS, not a production implementation. Currently it only has:
- Basic `HELLO_WORLD` action
- Template service structure
- No blockchain or rebalancing integration

**Kairos could be used to call rebalance**, but it needs to be developed with:
1. Custom actions to trigger analysis
2. Wallet/signing integration
3. Connection to AIOracle contract

### What Needs to Be Built

The **Backend Signing Service** is the missing critical component. It needs to:

```typescript
// Pseudo-code for the required service
class RebalanceSubmitter {
    private aiSigner: ethers.Wallet;      // Private key for AI model
    private aiOracle: ethers.Contract;    // AIOracle contract instance

    async submitRebalance(recommendation: RebalanceRecommendation) {
        const { vault, newTickLower, newTickUpper, confidence, deadline } = recommendation;

        // 1. Create message hash (must match contract's verification)
        const messageHash = ethers.utils.solidityKeccak256(
            ['address', 'int24', 'int24', 'uint256', 'uint256'],
            [vault, newTickLower, newTickUpper, confidence, deadline]
        );

        // 2. Sign with AI model's private key
        const signature = await this.aiSigner.signMessage(
            ethers.utils.arrayify(messageHash)
        );

        // 3. Submit to AIOracle
        const tx = await this.aiOracle.submitRebalanceRequest(
            vault,
            newTickLower,
            newTickUpper,
            confidence,
            deadline,
            "liquidity-optimizer-v1.0",
            signature
        );
        await tx.wait();

        // 4. Execute the request
        const requestId = /* extract from events */;
        await this.aiOracle.executeRebalanceRequest(requestId, "liquidity-optimizer-v1.0");
    }
}
```

---

## 3. Complete Rebalancing Flow

### Step-by-Step Process

#### Step 1: Market Analysis (AI Engine)
**File:** `ai-engine/sei_dlp_ai/core/engine.py`

The AI engine continuously monitors market conditions:
- Price movements and volatility
- Liquidity utilization
- Pool tick distribution

#### Step 2: Optimal Range Prediction
**File:** `ai-engine/sei_dlp_ai/models/liquidity_optimizer.py`

Uses ML models (RandomForest/ONNX) to calculate:
- Optimal tick ranges
- Expected returns
- Confidence scores

#### Step 3: API Bridge Processing
**File:** `ai-engine/api_bridge.py`

Endpoint `/analyze/rebalance`:
- Receives vault state
- Runs optimization
- Returns recommendation with urgency

#### Step 4: Signature Generation (Missing)
The Backend Signing Service would:
- Receive recommendation
- Sign with AI model's private key
- Submit to blockchain

#### Step 5: On-Chain Submission
`AIOracle.submitRebalanceRequest()`:
- Verifies signature
- Stores request
- Returns request ID

#### Step 6: Execution
`AIOracle.executeRebalanceRequest()`:
- Validates request
- Calls `vault.rebalance()`
- Updates metrics

---

## 4. Key Addresses and Roles

### Deployed Contracts (SEI Atlantic-2 Testnet)

| Contract | Address |
|----------|---------|
| AIOracle | `0x4199f86F3Bd73cF6ae5E89C8E28863d4B12fb18E` |
| VaultFactory | `0x37b8E91705bc42d5489Dae84b00B87356342B267` |
| Native SEI Vault | `0xAC64527866CCfA796Fa87A257B3f927179a895e6` |
| USDC Vault | `0xcF796aEDcC293db74829e77df7c26F482c9dBEC0` |

### Registered AI Models (from deployment script)

| Model Version | Signer Address |
|---------------|----------------|
| `liquidity-optimizer-v1.0` | `0x1234...` (placeholder) |
| `risk-manager-v1.0` | `0x0987...` (placeholder) |

**Note:** These are placeholder addresses that need to be replaced with actual controlled addresses.

### Role Definitions

| Role | Responsibilities |
|------|------------------|
| **Oracle Owner** | Register models, manage protocol |
| **Vault Owner** | Emergency pause, update oracle address |
| **AI Model Signer** | Sign rebalance requests (off-chain) |
| **Anyone** | Submit signed requests, execute requests |

---

## 5. Options for Calling Rebalance

### Option A: Dedicated Backend Service (Recommended)

A standalone Node.js/Python service that:
- Runs as a daemon process
- Connects to AI Engine API
- Holds AI model private keys securely
- Automatically submits and executes requests

**Pros:** Most reliable, can run 24/7, easy to monitor
**Cons:** Requires secure key management infrastructure

### Option B: Kairos AI Agent (ElizaOS Plugin)

Extend the Kairos plugin with:
- Custom `REBALANCE_VAULT` action
- Wallet integration for signing
- Market monitoring service

**Pros:** User-friendly chat interface, integrated with AI
**Cons:** Requires significant plugin development

### Option C: Keeper Network

Use a keeper network like Chainlink Keepers:
- Register condition-based triggers
- Keepers execute when conditions met

**Pros:** Decentralized, reliable execution
**Cons:** Additional infrastructure, costs

### Option D: Manual/Frontend Triggered

Add frontend UI to:
- Request analysis from AI Engine
- Display recommendations to user
- User approves and signs transaction

**Pros:** Human oversight
**Cons:** Not truly automated, defeats purpose of AI system

---

## 6. Implementation Recommendations

### High Priority

1. **Implement Backend Signing Service**
   - Create secure service for signing and submission
   - Use environment variables or HSM for key storage
   - Add monitoring and alerting

2. **Replace Placeholder Signer Addresses**
   - Generate secure keypairs for AI models
   - Register actual addresses in AIOracle
   - Store private keys securely

3. **Add Automated Monitoring Loop**
   - Deploy AI Engine as persistent service
   - Configure monitoring intervals
   - Set up alerts for critical conditions

### Medium Priority

4. **Customize Kairos Plugin** (if desired)
   - Create blockchain actions
   - Add portfolio monitoring
   - Implement natural language triggers

5. **Add Safety Thresholds**
   - Minimum confidence requirements
   - Maximum position size limits
   - Cool-down periods

### Low Priority

6. **Multi-signature Support**
   - For high-value operations
   - Timelock delays
   - Governance controls

---

## 7. Environment Configuration

```bash
# AI Engine
AI_ENGINE_URL=http://localhost:8000

# Blockchain
SEI_RPC_URL=https://evm-rpc-arctic-1.sei-apis.com
AI_MODEL_SIGNER_KEY=<private-key-for-signing>  # CRITICAL - store securely

# Contract Addresses
AI_ORACLE_ADDRESS=0x4199f86F3Bd73cF6ae5E89C8E28863d4B12fb18E
VAULT_FACTORY_ADDRESS=0x37b8E91705bc42d5489Dae84b00B87356342B267

# ElizaOS (if using Kairos)
ELIZAOS_BASE_URL=http://localhost:3000
ELIZAOS_API_KEY=your-api-key
```

---

## Summary

The **AIOracle contract is the on-chain gatekeeper** that validates AI-generated rebalance requests and routes them to vaults. It ensures only authorized AI models (verified by signature) can trigger rebalancing.

**The critical missing piece is a Backend Signing Service** that:
1. Receives recommendations from the AI Engine
2. Signs them with the registered AI model's private key
3. Submits to AIOracle
4. Executes the pending request

This service can be implemented as:
- A dedicated backend daemon (recommended)
- A Kairos/ElizaOS plugin
- A keeper network integration

The Kairos AI agent is currently just a template and would need significant development to handle rebalancing, but it could be used as a user-friendly interface for monitoring and manual triggers.

---

## Quick Reference: The Flow

```
Market Data → AI Engine Analysis → Optimal Range →
    [Backend Service Signs] → AIOracle Validates →
        Vault Executes Rebalance
```

**What's Built:** Everything except the signing service
**What's Needed:** Secure service to sign and submit transactions
