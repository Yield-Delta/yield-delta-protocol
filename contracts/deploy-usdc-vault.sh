#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== USDC Vault Deployment Script for SEI Atlantic-2 ===${NC}"
echo ""

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}Error: PRIVATE_KEY environment variable not set${NC}"
    echo "Please set your private key:"
    echo "  export PRIVATE_KEY=your_private_key_here"
    exit 1
fi

# SEI Atlantic-2 testnet RPC
RPC_URL="https://evm-rpc-testnet.sei-apis.com"
CHAIN_ID=1328

echo -e "${YELLOW}Network Configuration:${NC}"
echo "  Network: SEI Atlantic-2 Testnet"
echo "  Chain ID: $CHAIN_ID"
echo "  RPC URL: $RPC_URL"
echo ""

# Build the contracts first
echo -e "${YELLOW}Building contracts...${NC}"
forge build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

# Deploy the USDC vault
echo -e "${YELLOW}Deploying USDC Vault...${NC}"
forge script script/DeployUSDCVault.s.sol:DeployUSDCVaultScript \
    --rpc-url $RPC_URL \
    --broadcast \
    --chain-id $CHAIN_ID \
    --slow \
    -vvv

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo -e "${YELLOW}Important: Copy the deployed vault address and update:${NC}"
    echo "  1. Frontend configuration in src/app/api/vaults/route.ts"
    echo "  2. useEnhancedVaultDeposit.ts validTestnetVaults array"
    echo "  3. Any other references to the USDC vault"
else
    echo -e "${RED}Deployment failed!${NC}"
    exit 1
fi