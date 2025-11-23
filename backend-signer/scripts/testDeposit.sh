#!/bin/bash

# Test deposit functionality
# Usage: ./testDeposit.sh <AMOUNT_IN_SEI> <YOUR_ADDRESS> <YOUR_PRIVATE_KEY>

set -e

AMOUNT_SEI=${1:-"1"}
USER_ADDRESS=${2}
PRIVATE_KEY=${3}

if [ -z "$USER_ADDRESS" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "Usage: ./testDeposit.sh <AMOUNT_IN_SEI> <YOUR_ADDRESS> <YOUR_PRIVATE_KEY>"
    echo "Example: ./testDeposit.sh 1 0x123... 0xabc..."
    exit 1
fi

RPC_URL="https://evm-rpc-testnet.sei-apis.com"
VAULT_ADDRESS="0xD460d6C569631A1BDc6FAF28D47BF376aFDD90D0"

# Convert SEI to wei
AMOUNT_WEI=$(cast --to-wei $AMOUNT_SEI ether)

echo "============================================"
echo "Testing SEI Vault Deposit"
echo "============================================"
echo "Vault: $VAULT_ADDRESS"
echo "Amount: $AMOUNT_SEI SEI ($AMOUNT_WEI wei)"
echo "User: $USER_ADDRESS"
echo ""

# Check user's SEI balance
echo "Checking SEI balance..."
BALANCE=$(cast balance $USER_ADDRESS --rpc-url $RPC_URL)
BALANCE_ETH=$(cast --to-unit $BALANCE ether)
echo "Balance: $BALANCE_ETH SEI"

if [ $(echo "$BALANCE_ETH < $AMOUNT_SEI" | bc) -eq 1 ]; then
    echo "ERROR: Insufficient balance"
    exit 1
fi

# Check shares before
echo ""
echo "Checking vault shares before deposit..."
SHARES_BEFORE=$(cast call $VAULT_ADDRESS "balanceOf(address)(uint256)" $USER_ADDRESS --rpc-url $RPC_URL)
SHARES_BEFORE_ETH=$(cast --to-unit $SHARES_BEFORE ether)
echo "Shares before: $SHARES_BEFORE_ETH"

# Make deposit
echo ""
echo "Making deposit..."
TX_HASH=$(cast send $VAULT_ADDRESS \
    "seiOptimizedDeposit(uint256,address)" \
    $AMOUNT_WEI \
    $USER_ADDRESS \
    --value $AMOUNT_WEI \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --json | jq -r '.transactionHash')

echo "Transaction: $TX_HASH"

# Wait for confirmation
echo "Waiting for confirmation..."
sleep 5

# Check shares after
echo ""
echo "Checking vault shares after deposit..."
SHARES_AFTER=$(cast call $VAULT_ADDRESS "balanceOf(address)(uint256)" $USER_ADDRESS --rpc-url $RPC_URL)
SHARES_AFTER_ETH=$(cast --to-unit $SHARES_AFTER ether)
echo "Shares after: $SHARES_AFTER_ETH"

# Calculate shares received
SHARES_DIFF=$(echo "$SHARES_AFTER - $SHARES_BEFORE" | bc)
SHARES_DIFF_ETH=$(cast --to-unit $SHARES_DIFF ether)
echo ""
echo "✓ Deposit successful!"
echo "  Shares received: $SHARES_DIFF_ETH"
echo "  Transaction: https://seitrace.com/tx/$TX_HASH?chain=atlantic-2"
