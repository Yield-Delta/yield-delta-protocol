#!/bin/bash
set -e

echo "========================================="
echo "Kairos ElizaOS Agent - Railway Deployment"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}Error: Railway CLI is not installed${NC}"
    echo "Install it with: npm install -g @railway/cli"
    echo "Or visit: https://docs.railway.app/develop/cli"
    exit 1
fi

echo -e "${GREEN}✓ Railway CLI is installed${NC}"
echo ""

# Check if authenticated
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠ Not authenticated with Railway${NC}"
    echo "Please login first:"
    echo "  railway login"
    exit 1
fi

echo -e "${GREEN}✓ Authenticated with Railway${NC}"
RAILWAY_USER=$(railway whoami 2>&1)
echo -e "${BLUE}  User: $RAILWAY_USER${NC}"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please create .env file with required environment variables"
    exit 1
fi

echo -e "${GREEN}✓ Environment file found${NC}"
echo ""

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}Error: Dockerfile not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Dockerfile found${NC}"
echo ""

# Ask user to link or create project
echo -e "${YELLOW}Choose deployment option:${NC}"
echo "1) Link to existing Railway project"
echo "2) Create new Railway project"
echo "3) Deploy to currently linked project"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}Linking to existing project...${NC}"
        railway link
        ;;
    2)
        echo ""
        echo -e "${BLUE}Creating new project...${NC}"
        railway init
        ;;
    3)
        echo ""
        echo -e "${BLUE}Using currently linked project...${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}Current project status:${NC}"
railway status || true
echo ""

# Ask if user wants to set environment variables
read -p "Do you want to upload environment variables from .env file? (y/n): " upload_env

if [ "$upload_env" = "y" ] || [ "$upload_env" = "Y" ]; then
    echo ""
    echo -e "${YELLOW}⚠ WARNING: This will upload ALL variables from .env file${NC}"
    echo "Make sure .env does not contain local-only variables"
    read -p "Continue? (y/n): " confirm

    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        echo ""
        echo -e "${BLUE}Uploading environment variables...${NC}"

        # Read .env file and set variables
        while IFS='=' read -r key value; do
            # Skip comments and empty lines
            [[ $key =~ ^#.*$ ]] && continue
            [[ -z "$key" ]] && continue

            # Remove quotes from value if present
            value=$(echo $value | sed -e 's/^"//' -e 's/"$//')

            # Set the variable
            echo "Setting $key..."
            railway variables set "$key=$value" 2>&1 | grep -v "Warning" || true
        done < .env

        echo -e "${GREEN}✓ Environment variables uploaded${NC}"
    else
        echo -e "${YELLOW}Skipped environment variable upload${NC}"
        echo "You can set them manually in Railway dashboard or use:"
        echo "  railway variables set KEY=value"
    fi
else
    echo -e "${YELLOW}⚠ Remember to set environment variables in Railway dashboard${NC}"
fi

echo ""
read -p "Do you want to deploy now? (y/n): " deploy_now

if [ "$deploy_now" = "y" ] || [ "$deploy_now" = "Y" ]; then
    echo ""
    echo -e "${BLUE}Starting deployment...${NC}"
    echo ""
    railway up

    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}Deployment initiated!${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo "Monitor deployment with:"
    echo "  railway logs --follow"
    echo ""
    echo "Check deployment status:"
    echo "  railway status"
    echo ""
    echo "Get service URL:"
    echo "  railway domain"
    echo ""
    echo "Once deployed, verify endpoints:"
    echo "  curl https://your-service.railway.app/health"
    echo "  curl https://your-service.railway.app/api/agents"
else
    echo ""
    echo -e "${YELLOW}Deployment skipped${NC}"
    echo "Deploy later with:"
    echo "  railway up"
fi

echo ""
echo -e "${BLUE}For more information, see RAILWAY_DEPLOYMENT.md${NC}"
