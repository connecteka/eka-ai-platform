#!/bin/bash
# Cloud Shell Deployment Script for EKA-AI Platform
# Run this in Google Cloud Shell: https://shell.cloud.google.com

set -e

echo "=========================================="
echo "  EKA-AI Cloud Shell Deployment Script   "
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if in Cloud Shell
if [ -z "$CLOUD_SHELL" ]; then
    echo -e "${YELLOW}⚠️  Not in Cloud Shell. This script is designed for Google Cloud Shell.${NC}"
    echo "   Go to: https://shell.cloud.google.com"
    echo ""
fi

# 1. Clone repo
echo -e "${YELLOW}📥 Step 1: Cloning repository...${NC}"
if [ -d "eka-ai-platform" ]; then
    echo "   Directory exists, pulling latest changes..."
    cd eka-ai-platform
    git pull origin main
else
    git clone https://github.com/connecteka/eka-ai-platform.git
    cd eka-ai-platform
fi

# 2. Install dependencies
echo -e "${YELLOW}📦 Step 2: Installing dependencies...${NC}"
npm install

# 3. Build
echo -e "${YELLOW}🛠️  Step 3: Building application...${NC}"
npm run build

# 4. Check Firebase CLI
echo -e "${YELLOW}🔍 Step 4: Checking Firebase CLI...${NC}"
if ! command -v firebase &> /dev/null; then
    echo "   Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# 5. Firebase Login
echo -e "${YELLOW}🔐 Step 5: Firebase Login${NC}"
echo "   A browser window will open for authentication..."
npx firebase-tools login

# 6. Initialize Hosting
echo -e "${YELLOW}🚀 Step 6: Initialize Firebase Hosting${NC}"
echo ""
echo "   When prompted:"
echo "   - Select: 'Use an existing project'"
echo "   - Choose: 'eka-ai-platform' (or 'eka-ai-c9d24')"
echo "   - Public directory: 'dist'"
echo "   - Configure as single-page app: 'Yes'"
echo "   - Set up automatic builds: 'No'"
echo ""
read -p "   Press Enter to continue..."

npx firebase-tools init hosting

# 7. Deploy
echo -e "${YELLOW}🌐 Step 7: Deploying to Firebase...${NC}"
npx firebase-tools deploy --only hosting

# Done
echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  ✅ Deployment Complete!               ${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo "   Your site should be available at:"
echo "   https://eka-ai-platform.web.app"
echo ""
echo -e "${YELLOW}   Note: It may take a few minutes for the site to propagate.${NC}"
