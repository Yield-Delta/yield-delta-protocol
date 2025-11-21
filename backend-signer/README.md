# Backend Signer Service

The Backend Signer Service is the critical bridge between the Yield Delta AI Engine and the on-chain AIOracle contract. It automates the process of:

1. Fetching rebalance recommendations from the AI Engine
2. Signing those recommendations with the registered AI model's private key
3. Submitting signed requests to the AIOracle smart contract
4. Executing the rebalance operations on target vaults

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   AI Engine     │────▶│  Backend Signer  │────▶│   AIOracle      │
│  (Python ML)    │     │   (This Service) │     │  (Smart Contract)│
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  StrategyVault  │
                                                 │   rebalance()   │
                                                 └─────────────────┘
```

## How It Works

### 1. Scheduled Monitoring
The service runs on a configurable cron schedule (default: every 5 minutes) to check all monitored vaults for rebalancing opportunities.

### 2. Vault State Collection
For each vault, the service fetches:
- Current tick range (lower/upper)
- Total liquidity
- Token balances
- Last rebalance timestamp

### 3. AI Analysis
The vault state is sent to the AI Engine's `/analyze/rebalance` endpoint, which returns:
- Recommended new tick range
- Confidence score (0-100%)
- Urgency level
- Expected returns

### 4. Decision Making
The service decides whether to rebalance based on:
- Confidence threshold (default: 75%)
- Urgency level (skips "low")
- Time since last rebalance (1 hour cooldown)
- Utilization improvement (must improve by >5%)

### 5. Signature Generation
If rebalance is warranted, the service:
- Creates a message hash matching the contract's verification logic
- Signs with the AI model's private key using EIP-191 (Ethereum Signed Message)

### 6. On-Chain Submission
The signed request is submitted to `AIOracle.submitRebalanceRequest()`:
- Contract verifies signature recovers to registered model signer
- Request is stored with unique ID
- Event is emitted

### 7. Execution
Immediately after submission, the service calls `AIOracle.executeRebalanceRequest()`:
- Contract validates the request
- Calls vault's `rebalance()` function
- Updates success metrics

## Installation

```bash
cd backend-signer
npm install
```

## Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AI_MODEL_SIGNER_PRIVATE_KEY` | Private key for signing requests | `0x...` |
| `VAULTS` | Comma-separated vault addresses | `0xAC64...,0xcF79...` |

### Optional Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SEI_RPC_URL` | `https://evm-rpc-arctic-1.sei-apis.com` | SEI network RPC |
| `AI_ENGINE_URL` | `http://localhost:8000` | AI Engine API URL |
| `CRON_SCHEDULE` | `*/5 * * * *` | Check frequency |
| `MIN_CONFIDENCE_THRESHOLD` | `7500` | Min confidence (75%) |
| `REQUEST_DEADLINE_SECONDS` | `300` | Request validity (5 min) |
| `AI_MODEL_VERSION` | `liquidity-optimizer-v1.0` | Model identifier |

## Generating a Signer Key

Generate a new private key for the AI model:

```bash
node -e "console.log(require('ethers').Wallet.createRandom().privateKey)"
```

**Important:** This address must be registered on the AIOracle contract as the signer for your model version.

## Running the Service

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### With PM2 (Recommended)
```bash
pm2 start dist/index.js --name "backend-signer"
pm2 logs backend-signer
```

## Service Components

### AIOracleService
Handles all interactions with the AIOracle smart contract:
- Message signing
- Request submission
- Request execution
- Health checks

### AIEngineService
Communicates with the AI Engine API:
- Fetches rebalance recommendations
- Gets market conditions
- Validates if rebalance is needed

### VaultService
Reads on-chain vault state:
- Current tick ranges
- Liquidity amounts
- Token balances
- Last rebalance time

### RebalanceSubmitter
Orchestrates the complete flow:
- Runs the monitoring cycle
- Coordinates between services
- Handles errors and logging

## Security Considerations

1. **Private Key Security**: Store `AI_MODEL_SIGNER_PRIVATE_KEY` securely (use secrets manager in production)
2. **Model Registration**: Ensure the signer address is registered on AIOracle before running
3. **Balance Monitoring**: Keep the signer funded with SEI for gas
4. **Confidence Threshold**: Set appropriately to avoid over-trading
5. **Rate Limiting**: The 1-hour cooldown prevents excessive rebalancing

## Logs

Logs are written to:
- Console (colored output)
- `logs/combined.log` (all levels)
- `logs/error.log` (errors only)

Log level is controlled by `LOG_LEVEL` env var (default: `info`).

## Monitoring

### Health Checks
The service performs health checks on startup and each cycle:
- AI Engine connectivity
- Blockchain connection
- Signer balance

### Metrics
Each execution logs:
- Request IDs
- Transaction hashes
- Gas used
- Success/failure status

## Troubleshooting

### "Model not active"
Register your model on AIOracle:
```solidity
aiOracle.registerAIModel("liquidity-optimizer-v1.0", signerAddress);
```

### "Invalid AI signature"
Ensure your private key matches the registered signer address.

### "Request expired"
Increase `REQUEST_DEADLINE_SECONDS` or improve network latency.

### "Signer balance too low"
Fund the signer address with SEI for gas fees.

## Contract Addresses (SEI Atlantic-2 Testnet)

| Contract | Address |
|----------|---------|
| AIOracle | `0x4199f86F3Bd73cF6ae5E89C8E28863d4B12fb18E` |
| VaultFactory | `0x37b8E91705bc42d5489Dae84b00B87356342B267` |
| Native SEI Vault | `0xAC64527866CCfA796Fa87A257B3f927179a895e6` |
| USDC Vault | `0xcF796aEDcC293db74829e77df7c26F482c9dBEC0` |

## Development

### Project Structure
```
backend-signer/
├── src/
│   ├── index.ts           # Entry point
│   ├── services/
│   │   ├── aiOracleService.ts    # Contract interactions
│   │   ├── aiEngineService.ts    # AI API client
│   │   ├── vaultService.ts       # Vault state reader
│   │   └── rebalanceSubmitter.ts # Main orchestrator
│   ├── types/
│   │   └── index.ts       # TypeScript interfaces
│   └── utils/
│       ├── config.ts      # Configuration loader
│       └── logger.ts      # Winston logger
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

### Building
```bash
npm run build
```

### Type Checking
```bash
npx tsc --noEmit
```

## License

MIT
