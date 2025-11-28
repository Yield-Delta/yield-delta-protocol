#!/bin/bash

# Deploy strategy vaults to SEI Atlantic-2 testnet
# This deploys: Delta Neutral, Yield Farming, and Arbitrage vaults

set -e

echo "================================================"
echo "Deploying Strategy Vaults to SEI Atlantic-2"
echo "================================================"

# Load .env file if it exists
if [ -f .env ]; then
    echo "Loading environment variables from .env..."
    set -a
    source .env
    set +a
fi

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY environment variable is not set"
    echo "Please set it with: export PRIVATE_KEY=your_private_key"
    exit 1
fi

# Deploy using forge script
forge script script/DeployStrategyVaults.s.sol:DeployStrategyVaultsScript \
    --rpc-url https://evm-rpc-testnet.sei-apis.com \
    --broadcast \
    --verify \
    --verifier blockscout \
    --verifier-url https://seitrace.com/api \
    -vvvv

echo ""
echo "================================================"
echo "Deployment complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Copy the deployed vault addresses from the output above"
echo "2. Update yield-delta-frontend/src/app/api/vaults/route.ts with the new addresses"
echo "3. Update the 'active' flag to true for each vault"
echo "4. Add the addresses to useVaults.ts validTestnetVaults array"
echo ""
