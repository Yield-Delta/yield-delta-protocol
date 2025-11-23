#!/bin/bash

# Start All Services for Kairos Vault Integration Testing
# This script starts all required local services

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Kairos Vault Integration - Service Startup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if tmux is available
if ! command -v tmux &> /dev/null; then
    echo -e "${RED}tmux not found. Installing...${NC}"
    sudo apt-get update && sudo apt-get install -y tmux
fi

# Create tmux session
SESSION_NAME="kairos-vault"

# Kill existing session if it exists
tmux kill-session -t $SESSION_NAME 2>/dev/null || true

echo -e "${BLUE}Creating tmux session: $SESSION_NAME${NC}"
echo ""

# Create new session and first window for AI Engine
tmux new-session -d -s $SESSION_NAME -n "ai-engine"

# Start AI Engine in first window
tmux send-keys -t $SESSION_NAME:0 "cd /workspaces/yield-delta-protocol/ai-engine" C-m
tmux send-keys -t $SESSION_NAME:0 "echo -e '${YELLOW}Starting AI Engine on port 8000...${NC}'" C-m
tmux send-keys -t $SESSION_NAME:0 "source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate" C-m
tmux send-keys -t $SESSION_NAME:0 "pip install -q -r requirements.txt" C-m
tmux send-keys -t $SESSION_NAME:0 "uvicorn api_bridge:app --host 0.0.0.0 --port 8000 --reload" C-m

# Wait for AI Engine to start
sleep 3

# Create second window for Kairos
tmux new-window -t $SESSION_NAME:1 -n "kairos"
tmux send-keys -t $SESSION_NAME:1 "cd /workspaces/yield-delta-protocol/kairos" C-m
tmux send-keys -t $SESSION_NAME:1 "echo -e '${YELLOW}Starting Kairos Agent...${NC}'" C-m
tmux send-keys -t $SESSION_NAME:1 "sleep 5" C-m  # Wait for AI Engine
tmux send-keys -t $SESSION_NAME:1 "bun run start" C-m

# Create third window for Backend Signer (optional)
tmux new-window -t $SESSION_NAME:2 -n "backend-signer"
tmux send-keys -t $SESSION_NAME:2 "cd /workspaces/yield-delta-protocol/backend-signer" C-m
tmux send-keys -t $SESSION_NAME:2 "echo -e '${YELLOW}Backend Signer ready (press Enter to start or Ctrl+C to skip)${NC}'" C-m
tmux send-keys -t $SESSION_NAME:2 "# npm start" C-m

# Create fourth window for testing/monitoring
tmux new-window -t $SESSION_NAME:3 -n "testing"
tmux send-keys -t $SESSION_NAME:3 "cd /workspaces/yield-delta-protocol" C-m
tmux send-keys -t $SESSION_NAME:3 "clear" C-m
tmux send-keys -t $SESSION_NAME:3 "echo -e '${GREEN}All services starting...${NC}'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:3 "echo -e '${BLUE}Service Status:${NC}'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  Window 0: AI Engine (port 8000)'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  Window 1: Kairos Agent'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  Window 2: Backend Signer (optional)'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  Window 3: Testing (current)'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:3 "echo -e '${YELLOW}Switch windows with: Ctrl+b then 0/1/2/3${NC}'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo -e '${YELLOW}Detach from tmux: Ctrl+b then d${NC}'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo -e '${YELLOW}Kill all services: tmux kill-session -t kairos-vault${NC}'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:3 "sleep 8" C-m
tmux send-keys -t $SESSION_NAME:3 "echo -e '${GREEN}Checking service health...${NC}'" C-m
tmux send-keys -t $SESSION_NAME:3 "sleep 2" C-m
tmux send-keys -t $SESSION_NAME:3 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:3 "echo 'AI Engine Health:'" C-m
tmux send-keys -t $SESSION_NAME:3 "curl -s http://localhost:8000/health | jq . || echo 'Not ready yet...'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:3 "echo -e '${GREEN}✅ Services are starting!${NC}'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:3 "echo 'To test the integration, run:'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  ./TEST_DEPOSIT.sh'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo ''" C-m

# Select the testing window
tmux select-window -t $SESSION_NAME:3

echo ""
echo -e "${GREEN}✅ All services are starting in tmux session: $SESSION_NAME${NC}"
echo ""
echo -e "${BLUE}To view services:${NC}"
echo "  tmux attach -t $SESSION_NAME"
echo ""
echo -e "${BLUE}Tmux Controls:${NC}"
echo "  Ctrl+b then 0/1/2/3  - Switch between windows"
echo "  Ctrl+b then d        - Detach (services keep running)"
echo "  Ctrl+b then [        - Scroll mode (q to exit)"
echo ""
echo -e "${BLUE}To stop all services:${NC}"
echo "  tmux kill-session -t $SESSION_NAME"
echo ""
echo -e "${YELLOW}Attaching to session in 3 seconds...${NC}"
sleep 3

# Attach to the session
tmux attach -t $SESSION_NAME
