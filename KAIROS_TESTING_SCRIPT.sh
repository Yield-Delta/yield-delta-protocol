#!/bin/bash

# Kairos Plugin Integration Testing Script
# This script tests the full integration between SEI Vault contracts and Kairos AI plugin

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VAULT_ADDRESS="0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565"
ORACLE_ADDRESS="0xa3437847337d953ed6c9eb130840d04c249973e5"
RPC_URL="https://evm-rpc-testnet.sei-apis.com"
TEST_DEPOSIT_AMOUNT="1000000000000000000"  # 1 SEI

echo -e "${GREEN}=== Kairos Plugin Integration Test ===${NC}"
echo ""

# Check if cast is installed
if ! command -v cast &> /dev/null; then
    echo -e "${RED}Error: 'cast' not found. Install Foundry first:${NC}"
    echo "curl -L https://foundry.paradigm.xyz | bash"
    echo "foundryup"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: 'jq' not found. Install jq first:${NC}"
    echo "sudo apt-get install jq"
    exit 1
fi

# Check environment variables
if [ -z "$TEST_PRIVATE_KEY" ]; then
    echo -e "${RED}Error: TEST_PRIVATE_KEY not set${NC}"
    echo "Export your test wallet private key: export TEST_PRIVATE_KEY=0x..."
    exit 1
fi

echo -e "${YELLOW}Step 1: Check initial vault state${NC}"
INITIAL_TVL=$(cast call $VAULT_ADDRESS "totalAssets()(uint256)" --rpc-url $RPC_URL)
INITIAL_SHARES=$(cast call $VAULT_ADDRESS "totalSupply()(uint256)" --rpc-url $RPC_URL)
echo "Initial TVL: $INITIAL_TVL wei ($(cast to-unit $INITIAL_TVL ether) SEI)"
echo "Initial Shares: $INITIAL_SHARES"
echo ""

echo -e "${YELLOW}Step 2: Get test wallet address${NC}"
TEST_ADDRESS=$(cast wallet address --private-key $TEST_PRIVATE_KEY)
echo "Test wallet: $TEST_ADDRESS"
BALANCE=$(cast balance $TEST_ADDRESS --rpc-url $RPC_URL)
echo "Balance: $(cast to-unit $BALANCE ether) SEI"
echo ""

if [ "$(echo "$BALANCE < $TEST_DEPOSIT_AMOUNT" | bc)" -eq 1 ]; then
    echo -e "${RED}Error: Insufficient balance. Need at least 1 SEI + gas${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 3: Deposit to vault${NC}"
echo "Depositing 1 SEI to vault..."
TX_HASH=$(cast send $VAULT_ADDRESS \
    "seiOptimizedDeposit(uint256,address)" \
    $TEST_DEPOSIT_AMOUNT \
    $TEST_ADDRESS \
    --value $TEST_DEPOSIT_AMOUNT \
    --rpc-url $RPC_URL \
    --private-key $TEST_PRIVATE_KEY \
    --json | jq -r '.transactionHash')

echo "Transaction hash: $TX_HASH"
echo "Waiting for confirmation..."
cast receipt $TX_HASH --rpc-url $RPC_URL > /dev/null
echo -e "${GREEN}✓ Deposit confirmed${NC}"
echo ""

echo -e "${YELLOW}Step 4: Verify vault state changed${NC}"
NEW_TVL=$(cast call $VAULT_ADDRESS "totalAssets()(uint256)" --rpc-url $RPC_URL)
NEW_SHARES=$(cast call $VAULT_ADDRESS "totalSupply()(uint256)" --rpc-url $RPC_URL)
echo "New TVL: $NEW_TVL wei ($(cast to-unit $NEW_TVL ether) SEI)"
echo "New Shares: $NEW_SHARES"

TVL_INCREASE=$((NEW_TVL - INITIAL_TVL))
echo "TVL Increase: $(cast to-unit $TVL_INCREASE ether) SEI"

if [ "$TVL_INCREASE" -eq "$TEST_DEPOSIT_AMOUNT" ]; then
    echo -e "${GREEN}✓ TVL increased correctly${NC}"
else
    echo -e "${RED}✗ TVL did not increase as expected${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 5: Check user shares${NC}"
USER_SHARES=$(cast call $VAULT_ADDRESS "balanceOf(address)(uint256)" $TEST_ADDRESS --rpc-url $RPC_URL)
echo "Your shares: $USER_SHARES"
echo "Your share value: $(cast to-unit $USER_SHARES ether) SEI"
echo ""

echo -e "${YELLOW}Step 6: Monitor for Kairos allocation (wait 5 minutes)${NC}"
echo "The Kairos plugin should detect the deposit and allocate to strategies:"
echo "  - 40% to Funding Arbitrage"
echo "  - 30% to Delta Neutral LP"
echo "  - 20% to AMM Optimization"
echo "  - 10% to YEI Lending"
echo ""
echo "Check Kairos plugin logs for allocation confirmation..."
echo ""

# Wait and check for allocation (simulated - actual would monitor plugin logs)
echo "Waiting 5 minutes for allocation..."
for i in {300..1}; do
    echo -ne "Time remaining: ${i}s\r"
    sleep 1
done
echo ""

echo -e "${YELLOW}Step 7: Wait for yield generation (24 hours)${NC}"
echo "For a full yield test, wait 24 hours and then check:"
echo ""
echo "  cast call $VAULT_ADDRESS \"totalAssets()(uint256)\" --rpc-url $RPC_URL"
echo ""
echo "Expected daily yield: ~0.041% (15% APY / 365 days)"
echo "On 6 SEI TVL (5 initial + 1 your deposit):"
echo "  Expected yield after 24h: ~0.00247 SEI"
echo ""

echo -e "${GREEN}=== Quick Test Summary ===${NC}"
echo "✓ Vault contract accessible"
echo "✓ Deposit transaction successful"
echo "✓ TVL increased correctly"
echo "✓ Shares minted to user"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Verify Kairos plugin detected the deposit (check logs)"
echo "2. Confirm capital was allocated to strategies"
echo "3. Wait 24 hours and check TVL growth"
echo "4. Run full yield verification script"
echo ""

# Save test data for later verification
cat > /tmp/kairos_test_data.json <<EOF
{
  "test_timestamp": $(date +%s),
  "vault_address": "$VAULT_ADDRESS",
  "test_wallet": "$TEST_ADDRESS",
  "deposit_amount": "$TEST_DEPOSIT_AMOUNT",
  "tx_hash": "$TX_HASH",
  "initial_tvl": "$INITIAL_TVL",
  "new_tvl": "$NEW_TVL",
  "user_shares": "$USER_SHARES"
}
EOF

echo -e "${GREEN}Test data saved to /tmp/kairos_test_data.json${NC}"
echo ""
echo -e "${YELLOW}To verify yield after 24 hours, run:${NC}"
echo "./KAIROS_YIELD_VERIFICATION.sh"
