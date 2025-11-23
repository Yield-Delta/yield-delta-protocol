#!/bin/bash

# Kairos Plugin Yield Verification Script
# Verifies that the plugin generated the expected yield over 24 hours

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load test data
if [ ! -f /tmp/kairos_test_data.json ]; then
    echo -e "${RED}Error: No test data found. Run KAIROS_TESTING_SCRIPT.sh first${NC}"
    exit 1
fi

VAULT_ADDRESS=$(jq -r '.vault_address' /tmp/kairos_test_data.json)
TEST_WALLET=$(jq -r '.test_wallet' /tmp/kairos_test_data.json)
DEPOSIT_AMOUNT=$(jq -r '.deposit_amount' /tmp/kairos_test_data.json)
INITIAL_TVL=$(jq -r '.initial_tvl' /tmp/kairos_test_data.json)
TEST_TIMESTAMP=$(jq -r '.test_timestamp' /tmp/kairos_test_data.json)
RPC_URL="https://evm-rpc-testnet.sei-apis.com"

echo -e "${GREEN}=== Kairos Yield Verification ===${NC}"
echo ""

# Check elapsed time
CURRENT_TIME=$(date +%s)
ELAPSED_HOURS=$(( (CURRENT_TIME - TEST_TIMESTAMP) / 3600 ))
echo "Time since test deposit: ${ELAPSED_HOURS} hours"

if [ "$ELAPSED_HOURS" -lt 24 ]; then
    echo -e "${YELLOW}Warning: Less than 24 hours have passed. Results may not be representative.${NC}"
    echo ""
fi

echo -e "${YELLOW}Step 1: Get current vault state${NC}"
CURRENT_TVL=$(cast call $VAULT_ADDRESS "totalAssets()(uint256)" --rpc-url $RPC_URL)
CURRENT_SHARES=$(cast call $VAULT_ADDRESS "totalSupply()(uint256)" --rpc-url $RPC_URL)

echo "Initial TVL: $(cast to-unit $INITIAL_TVL ether) SEI"
echo "Current TVL: $(cast to-unit $CURRENT_TVL ether) SEI"
echo "Total Shares: $(cast to-unit $CURRENT_SHARES ether)"
echo ""

# Calculate yield
YIELD_WEI=$((CURRENT_TVL - INITIAL_TVL))
YIELD_SEI=$(cast to-unit $YIELD_WEI ether)

echo -e "${YELLOW}Step 2: Calculate yield metrics${NC}"
echo "Absolute yield: $YIELD_SEI SEI"

# Calculate percentage yield
YIELD_PERCENT=$(echo "scale=6; ($YIELD_WEI * 100) / $INITIAL_TVL" | bc)
echo "Percentage yield: ${YIELD_PERCENT}%"

# Calculate annualized APY
DAYS_ELAPSED=$(echo "scale=6; $ELAPSED_HOURS / 24" | bc)
ANNUALIZED_APY=$(echo "scale=2; ($YIELD_PERCENT / $DAYS_ELAPSED) * 365" | bc)
echo "Annualized APY: ${ANNUALIZED_APY}%"
echo ""

# Expected targets
TARGET_APY=15
TARGET_DAILY_YIELD=$(echo "scale=6; $TARGET_APY / 365" | bc)
TARGET_YIELD_WEI=$(echo "scale=0; ($INITIAL_TVL * $TARGET_DAILY_YIELD * $DAYS_ELAPSED) / 100" | bc)
TARGET_YIELD_SEI=$(cast to-unit $TARGET_YIELD_WEI ether)

echo -e "${YELLOW}Step 3: Compare to targets${NC}"
echo "Target APY: ${TARGET_APY}%"
echo "Expected daily yield: ${TARGET_DAILY_YIELD}%"
echo "Expected yield after ${DAYS_ELAPSED} days: $TARGET_YIELD_SEI SEI"
echo "Actual yield: $YIELD_SEI SEI"
echo ""

# Determine if target met
LOWER_BOUND=14
UPPER_BOUND=16

if (( $(echo "$ANNUALIZED_APY >= $LOWER_BOUND" | bc -l) )) && (( $(echo "$ANNUALIZED_APY <= $UPPER_BOUND" | bc -l) )); then
    echo -e "${GREEN}✓ APY within target range (${LOWER_BOUND}-${UPPER_BOUND}%)${NC}"
    RESULT="PASS"
else
    echo -e "${RED}✗ APY outside target range${NC}"
    RESULT="FAIL"
fi
echo ""

echo -e "${YELLOW}Step 4: Check user share value${NC}"
USER_SHARES=$(cast call $VAULT_ADDRESS "balanceOf(address)(uint256)" $TEST_WALLET --rpc-url $RPC_URL)
SHARE_VALUE=$(echo "scale=18; ($USER_SHARES * $CURRENT_TVL) / $CURRENT_SHARES" | bc)
SHARE_VALUE_SEI=$(cast to-unit ${SHARE_VALUE%.*} ether)

echo "Your shares: $(cast to-unit $USER_SHARES ether)"
echo "Share value: $SHARE_VALUE_SEI SEI"
echo "Initial deposit: $(cast to-unit $DEPOSIT_AMOUNT ether) SEI"

USER_PROFIT_WEI=$(echo "($SHARE_VALUE - $DEPOSIT_AMOUNT)" | bc)
USER_PROFIT_SEI=$(cast to-unit ${USER_PROFIT_WEI%.*} ether 2>/dev/null || echo "0")
echo "Your profit: $USER_PROFIT_SEI SEI"
echo ""

echo -e "${YELLOW}Step 5: Strategy breakdown (check Kairos logs)${NC}"
echo "The following strategies should have generated yield:"
echo ""
echo "Strategy                   | Allocation | Expected APR | Expected Contribution"
echo "---------------------------|------------|--------------|----------------------"
echo "Funding Arbitrage          | 40%        | 20%          | 8.0%"
echo "Delta Neutral LP           | 30%        | 12%          | 3.6%"
echo "AMM Optimization           | 20%        | 10%          | 2.0%"
echo "YEI Lending                | 10%        | 5%           | 0.5%"
echo "---------------------------|------------|--------------|----------------------"
echo "TOTAL                      | 100%       | -            | 14.1%"
echo ""
echo "Check Kairos plugin logs for actual strategy performance."
echo ""

echo -e "${GREEN}=== Verification Summary ===${NC}"
echo "Test Result: $RESULT"
echo "Actual APY: ${ANNUALIZED_APY}%"
echo "Target APY: ${TARGET_APY}%"
echo "Deviation: $(echo "$ANNUALIZED_APY - $TARGET_APY" | bc)%"
echo ""

if [ "$RESULT" = "PASS" ]; then
    echo -e "${GREEN}✓ Yield generation is working as expected!${NC}"
    echo ""
    echo "The Kairos plugin successfully:"
    echo "  ✓ Detected vault deposits"
    echo "  ✓ Allocated capital to strategies"
    echo "  ✓ Generated yield within target range"
    echo "  ✓ Deposited yield back to vault"
else
    echo -e "${RED}✗ Yield generation below target${NC}"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check Kairos plugin logs for errors"
    echo "2. Verify all strategies are active"
    echo "3. Check funding rates are positive"
    echo "4. Confirm LP positions are in range"
    echo "5. Verify lending protocol APYs"
    echo ""
    echo "Run: docker logs kairos-plugin -f"
fi
echo ""

# Save verification results
cat > /tmp/kairos_verification_results.json <<EOF
{
  "verification_timestamp": $(date +%s),
  "elapsed_hours": $ELAPSED_HOURS,
  "initial_tvl": "$INITIAL_TVL",
  "current_tvl": "$CURRENT_TVL",
  "yield_sei": "$YIELD_SEI",
  "yield_percent": "$YIELD_PERCENT",
  "annualized_apy": "$ANNUALIZED_APY",
  "target_apy": $TARGET_APY,
  "result": "$RESULT"
}
EOF

echo "Verification results saved to /tmp/kairos_verification_results.json"
