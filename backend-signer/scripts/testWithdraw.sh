#!/bin/bash

# Test withdrawal functionality
# Usage: ./testWithdraw.sh <AMOUNT_IN_SHARES> <YOUR_ADDRESS> <YOUR_PRIVATE_KEY>

set -e

AMOUNT_SHARES=${1:-"0.5"}
USER_ADDRESS=${2}
PRIVATE_KEY=${3}

if [ -z "$USER_ADDRESS" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "Usage: ./testWithdraw.sh <AMOUNT_IN_SHARES> <YOUR_ADDRESS> <YOUR_PRIVATE_KEY>"
    echo "Example: ./testWithdraw.sh 0.5 0x123... 0xabc..."
    exit 1
fi

RPC_URL="https://evm-rpc-testnet.sei-apis.com"
VAULT_ADDRESS="0xD460d6C569631A1BDc6FAF28D47BF376aFDD90D0"

# Convert shares to wei
AMOUNT_WEI=$(cast --to-wei $AMOUNT_SHARES ether)

echo "============================================"
echo "Testing SEI Vault Withdrawal"
echo "============================================"
echo "Vault: $VAULT_ADDRESS"
echo "Amount: $AMOUNT_SHARES shares ($AMOUNT_WEI wei)"
echo "User: $USER_ADDRESS"
echo ""

# Check shares before
echo "Checking vault shares..."
SHARES_BEFORE=$(cast call $VAULT_ADDRESS "balanceOf(address)(uint256)" $USER_ADDRESS --rpc-url $RPC_URL)
SHARES_BEFORE_ETH=$(cast --to-unit $SHARES_BEFORE ether)
echo "Shares: $SHARES_BEFORE_ETH"

if [ $(echo "$SHARES_BEFORE_ETH < $AMOUNT_SHARES" | bc) -eq 1 ]; then
    echo "ERROR: Insufficient shares"
    exit 1
fi

# Calculate expected assets
EXPECTED_ASSETS=$(cast call $VAULT_ADDRESS "convertToAssets(uint256)(uint256)" $AMOUNT_WEI --rpc-url $RPC_URL)
EXPECTED_ASSETS_ETH=$(cast --to-unit $EXPECTED_ASSETS ether)
echo "Expected to receive: $EXPECTED_ASSETS_ETH SEI"

# Check SEI balance before
SEI_BEFORE=$(cast balance $USER_ADDRESS --rpc-url $RPC_URL)
SEI_BEFORE_ETH=$(cast --to-unit $SEI_BEFORE ether)
echo "SEI balance before: $SEI_BEFORE_ETH"

# Make withdrawal
echo ""
echo "Making withdrawal..."
TX_HASH=$(cast send $VAULT_ADDRESS \
    "withdraw(uint256,address,address)(uint256)" \
    $AMOUNT_WEI \
    $USER_ADDRESS \
    $USER_ADDRESS \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --json | jq -r '.transactionHash')

echo "Transaction: $TX_HASH"

# Wait for confirmation
echo "Waiting for confirmation..."
sleep 5

# Check shares after
echo ""
echo "Checking vault shares after withdrawal..."
SHARES_AFTER=$(cast call $VAULT_ADDRESS "balanceOf(address)(uint256)" $USER_ADDRESS --rpc-url $RPC_URL)
SHARES_AFTER_ETH=$(cast --to-unit $SHARES_AFTER ether)
echo "Shares after: $SHARES_AFTER_ETH"

# Check SEI balance after
SEI_AFTER=$(cast balance $USER_ADDRESS --rpc-url $RPC_URL)
SEI_AFTER_ETH=$(cast --to-unit $SEI_AFTER ether)
echo "SEI balance after: $SEI_AFTER_ETH"

# Calculate what we received
SHARES_BURNED=$(echo "$SHARES_BEFORE - $SHARES_AFTER" | bc)
SHARES_BURNED_ETH=$(cast --to-unit $SHARES_BURNED ether)

SEI_RECEIVED=$(echo "$SEI_AFTER - $SEI_BEFORE" | bc)
SEI_RECEIVED_ETH=$(cast --to-unit $SEI_RECEIVED ether)

echo ""
echo "✓ Withdrawal successful!"
echo "  Shares burned: $SHARES_BURNED_ETH"
echo "  SEI received: $SEI_RECEIVED_ETH"
echo "  Transaction: https://seitrace.com/tx/$TX_HASH?chain=atlantic-2"
