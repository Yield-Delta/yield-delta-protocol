#!/bin/bash

# Test Deposit Script for Kairos Vault Integration

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Kairos Vault Integration - Test Deposit${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Installing jq for JSON parsing...${NC}"
    sudo apt-get update && sudo apt-get install -y jq
fi

# Configuration
VAULT_ADDRESS="0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565"
RPC_URL="https://evm-rpc-testnet.sei-apis.com"

echo -e "${BLUE}Vault Address:${NC} $VAULT_ADDRESS"
echo -e "${BLUE}RPC URL:${NC} $RPC_URL"
echo ""

# Check if private key is set
if [ -z "$SEI_PRIVATE_KEY" ]; then
    echo -e "${RED}Error: SEI_PRIVATE_KEY environment variable not set${NC}"
    echo ""
    echo "Set it with:"
    echo "  export SEI_PRIVATE_KEY=your-private-key-here"
    echo ""
    exit 1
fi

# Get wallet address from private key
WALLET_ADDRESS=$(cast wallet address --private-key $SEI_PRIVATE_KEY)

echo -e "${BLUE}Your Wallet:${NC} $WALLET_ADDRESS"
echo ""

# Check balance
echo -e "${YELLOW}Checking SEI balance...${NC}"
BALANCE=$(cast balance $WALLET_ADDRESS --rpc-url $RPC_URL)
BALANCE_SEI=$(cast to-unit $BALANCE ether)

echo -e "${GREEN}Balance:${NC} $BALANCE_SEI SEI"
echo ""

if (( $(echo "$BALANCE_SEI < 1.1" | bc -l) )); then
    echo -e "${RED}Error: Insufficient balance. Need at least 1.1 SEI (1 for deposit + 0.1 for gas)${NC}"
    exit 1
fi

# Check current vault state
echo -e "${YELLOW}Checking current vault state...${NC}"
TOTAL_ASSETS=$(cast call $VAULT_ADDRESS "totalAssets()(uint256)" --rpc-url $RPC_URL)
TOTAL_ASSETS_SEI=$(cast to-unit $TOTAL_ASSETS ether)

echo -e "${BLUE}Current Vault TVL:${NC} $TOTAL_ASSETS_SEI SEI"
echo ""

# Ask for confirmation
echo -e "${YELLOW}Ready to deposit 1 SEI to vault${NC}"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo -e "${GREEN}Executing deposit transaction...${NC}"
echo ""

# Deposit 1 SEI
AMOUNT="1000000000000000000"  # 1 SEI in wei

TX_HASH=$(cast send $VAULT_ADDRESS \
    "seiOptimizedDeposit(uint256,address)" \
    $AMOUNT $WALLET_ADDRESS \
    --value $AMOUNT \
    --rpc-url $RPC_URL \
    --private-key $SEI_PRIVATE_KEY \
    --json | jq -r '.transactionHash')

if [ -z "$TX_HASH" ] || [ "$TX_HASH" = "null" ]; then
    echo -e "${RED}Transaction failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Transaction submitted!${NC}"
echo -e "${BLUE}TX Hash:${NC} $TX_HASH"
echo ""

# Wait for confirmation
echo -e "${YELLOW}Waiting for confirmation...${NC}"
cast receipt $TX_HASH --rpc-url $RPC_URL --confirmations 2 > /dev/null

echo -e "${GREEN}✅ Transaction confirmed!${NC}"
echo ""

# Check new vault state
echo -e "${YELLOW}Checking new vault state...${NC}"
NEW_TOTAL_ASSETS=$(cast call $VAULT_ADDRESS "totalAssets()(uint256)" --rpc-url $RPC_URL)
NEW_TOTAL_ASSETS_SEI=$(cast to-unit $NEW_TOTAL_ASSETS ether)

echo -e "${BLUE}New Vault TVL:${NC} $NEW_TOTAL_ASSETS_SEI SEI"
echo ""

# Check your shares
YOUR_SHARES=$(cast call $VAULT_ADDRESS "balanceOf(address)(uint256)" $WALLET_ADDRESS --rpc-url $RPC_URL)
YOUR_SHARES_FORMATTED=$(cast to-unit $YOUR_SHARES ether)

echo -e "${BLUE}Your Shares:${NC} $YOUR_SHARES_FORMATTED"
echo ""

# Show Kairos logs
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}What to Expect in Kairos Logs${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Watch the Kairos terminal for:"
echo ""
echo -e "${YELLOW}💰 New deposit detected!${NC}"
echo "   User: $WALLET_ADDRESS"
echo "   Amount: 1.0 SEI"
echo ""
echo -e "${YELLOW}📊 Allocating 1.0 SEI to strategies...${NC}"
echo "   💹 Funding Arbitrage: 0.4 SEI (40%)"
echo "   ⚖️ Delta Neutral: 0.3 SEI (30%)"
echo "   🔄 AMM Optimization: 0.2 SEI (20%)"
echo "   🏦 YEI Lending: 0.1 SEI (10%)"
echo ""
echo -e "${YELLOW}✅ All strategies allocated successfully${NC}"
echo ""

# Explorer link
EXPLORER_URL="https://seistream.app/tx/$TX_HASH"
echo -e "${BLUE}View on Explorer:${NC}"
echo "$EXPLORER_URL"
echo ""

# Next steps
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Next Steps${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "1. Check Kairos logs for automatic allocation"
echo "2. Wait 8 hours for first yield harvest"
echo "3. Run ./KAIROS_YIELD_VERIFICATION.sh after 24 hours"
echo ""
echo -e "${GREEN}✅ Test deposit complete!${NC}"
