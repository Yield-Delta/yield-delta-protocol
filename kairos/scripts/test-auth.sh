#!/bin/bash

# Test authentication for Kairos ElizaOS agent
# Usage: ./scripts/test-auth.sh [URL] [API_KEY]

# Default values
DEFAULT_URL="http://localhost:3000"
DEFAULT_API_KEY="egUaYvBLRmP9NYm7o2HCioQWyjfh4IvmZQVkHk5cGa0="

# Get URL and API key from arguments or use defaults
URL="${1:-$DEFAULT_URL}"
API_KEY="${2:-$DEFAULT_API_KEY}"

echo "========================================="
echo "Kairos Agent Authentication Test"
echo "========================================="
echo "URL: $URL"
echo "API Key: ${API_KEY:0:20}..."
echo ""

# Test 1: Health check without API key (should work - not protected)
echo "Test 1: Health check (no auth required)"
echo "----------------------------------------"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$URL/health" 2>&1)
if [ "$RESPONSE" = "200" ]; then
    echo "✓ Health check passed (HTTP $RESPONSE)"
else
    echo "✗ Health check failed (HTTP $RESPONSE)"
fi
echo ""

# Test 2: API endpoint without API key (should fail with 401)
echo "Test 2: /api/agents without API key (should fail)"
echo "----------------------------------------"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$URL/api/agents" 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
if [ "$HTTP_CODE" = "401" ]; then
    echo "✓ Correctly rejected without API key (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "200" ]; then
    echo "⚠ Authentication is DISABLED - endpoint accessible without API key"
else
    echo "✗ Unexpected response (HTTP $HTTP_CODE)"
fi
echo ""

# Test 3: API endpoint with wrong API key (should fail with 401)
echo "Test 3: /api/agents with wrong API key (should fail)"
echo "----------------------------------------"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -H "X-API-KEY: wrong-api-key" "$URL/api/agents" 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
if [ "$HTTP_CODE" = "401" ]; then
    echo "✓ Correctly rejected with wrong API key (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "200" ]; then
    echo "⚠ Authentication is DISABLED or not checking key correctly"
else
    echo "✗ Unexpected response (HTTP $HTTP_CODE)"
fi
echo ""

# Test 4: API endpoint with correct API key (should succeed with 200)
echo "Test 4: /api/agents with correct API key (should succeed)"
echo "----------------------------------------"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -H "X-API-KEY: $API_KEY" "$URL/api/agents" 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Successfully authenticated (HTTP $HTTP_CODE)"
    echo ""
    echo "Response preview:"
    echo "$BODY" | head -c 500
    if [ ${#BODY} -gt 500 ]; then
        echo "..."
    fi
elif [ "$HTTP_CODE" = "401" ]; then
    echo "✗ Authentication failed - API key may be incorrect (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
else
    echo "✗ Unexpected response (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
fi
echo ""

# Test 5: Test CORS preflight
echo "Test 5: CORS preflight (OPTIONS request)"
echo "----------------------------------------"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
    -H "Origin: https://www.yielddelta.xyz" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: X-API-KEY" \
    "$URL/api/agents" 2>&1)

if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "204" ]; then
    echo "✓ CORS preflight passed (HTTP $RESPONSE)"
else
    echo "✗ CORS preflight failed (HTTP $RESPONSE)"
fi
echo ""

echo "========================================="
echo "Test Summary"
echo "========================================="
echo "If all tests pass, authentication is working correctly."
echo "If Test 2 and 3 show '⚠ Authentication is DISABLED',"
echo "then ELIZA_SERVER_AUTH_TOKEN is not set in the environment."
echo ""
echo "For Railway deployment, ensure the environment variable"
echo "is set in the Railway dashboard under Variables."
echo "========================================="
