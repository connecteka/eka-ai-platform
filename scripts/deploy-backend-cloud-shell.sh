#!/bin/bash
# Backend Deployment Script for Google Cloud Run
# Run this in Google Cloud Shell: https://shell.cloud.google.com

set -e

echo "=========================================="
echo "  EKA-AI Backend Deployment to Cloud Run "
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}$1${NC}"; }
success() { echo -e "${GREEN}$1${NC}"; }
warning() { echo -e "${YELLOW}$1${NC}"; }
error() { echo -e "${RED}$1${NC}"; }

# Configuration
PROJECT_ID="named-dialect-486912-c7"
SERVICE_NAME="eka-ai-backend"
REGION="asia-south1"

# Check if in Cloud Shell
if [ -z "$CLOUD_SHELL" ]; then
    warning "⚠️  Not in Cloud Shell. This script is designed for Google Cloud Shell."
    echo "   Go to: https://shell.cloud.google.com"
    echo ""
fi

# Set project
log "Setting Google Cloud project..."
gcloud config set project $PROJECT_ID

# Check if backend directory exists
if [ ! -d "backend" ]; then
    error "❌ backend/ directory not found!"
    echo "   Make sure you're in the project root."
    exit 1
fi

cd backend

# Check required files
log "Checking backend files..."
if [ ! -f "main.py" ]; then
    error "❌ main.py not found in backend/"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    error "❌ Dockerfile not found in backend/"
    exit 1
fi

if [ ! -f "requirements.txt" ]; then
    error "❌ requirements.txt not found in backend/"
    exit 1
fi

success "✅ All required files present"

# Get environment variables from user
echo ""
log "=========================================="
log "  Environment Variables Setup"
log "=========================================="
echo ""

warning "You need to provide the following credentials:"
echo ""

# Check if .env file exists and source it
if [ -f ".env" ]; then
    log "Found .env file. Loading variables..."
    export $(grep -v '^#' .env | xargs)
fi

# Prompt for Supabase URL
if [ -z "$SUPABASE_URL" ]; then
    read -p "Enter SUPABASE_URL (e.g., https://xxxxx.supabase.co): " SUPABASE_URL
fi

# Prompt for Supabase Key
if [ -z "$SUPABASE_KEY" ]; then
    read -p "Enter SUPABASE_KEY (service_role key): " SUPABASE_KEY
fi

# Validate inputs
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    error "❌ SUPABASE_URL and SUPABASE_KEY are required!"
    exit 1
fi

echo ""
success "✅ Environment variables configured"

# Build environment variables string for Cloud Run
ENV_VARS="SUPABASE_URL=${SUPABASE_URL},SUPABASE_KEY=${SUPABASE_KEY}"

# Optional: Add PayU credentials
if [ -n "$PAYU_MERCHANT_KEY" ] && [ -n "$PAYU_MERCHANT_SALT" ]; then
    ENV_VARS="${ENV_VARS},PAYU_MERCHANT_KEY=${PAYU_MERCHANT_KEY},PAYU_MERCHANT_SALT=${PAYU_MERCHANT_SALT}"
fi

echo ""
log "=========================================="
log "  Deploying to Cloud Run"
log "=========================================="
echo ""

# Deploy to Cloud Run
log "Building and deploying..."
echo "   Service: $SERVICE_NAME"
echo "   Region: $REGION"
echo "   Project: $PROJECT_ID"
echo ""

gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars "$ENV_VARS" \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 300 \
    --quiet

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo ""
success "=========================================="
success "  ✅ Deployment Successful!"
success "=========================================="
echo ""
success "Backend URL: $SERVICE_URL"
success "Health Check: $SERVICE_URL/api/health"
echo ""
log "Next steps:"
echo "   1. Update frontend API URL in GitHub Secrets:"
echo "      VITE_API_URL = $SERVICE_URL"
echo ""
echo "   2. Test the API:"
echo "      curl $SERVICE_URL/api/health"
echo ""
echo "   3. Update CORS in backend/main.py to allow your frontend:"
echo "      allow_origins=['https://eka-ai-c9d24.web.app']"
echo ""

# Save the URL to a file for reference
echo "$SERVICE_URL" > ../.backend-url.txt
log "Backend URL saved to .backend-url.txt"
