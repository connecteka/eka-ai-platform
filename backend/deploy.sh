#!/bin/bash
# EKA-AI Backend Deployment Script for Google Cloud Run

set -e

echo "🚀 Deploying EKA-AI Backend to Cloud Run..."

# Configuration
SERVICE_NAME="eka-ai-backend"
REGION="asia-south1"
PROJECT_ID=$(gcloud config get-value project)

# Supabase credentials (set these or export before running)
SUPABASE_URL="${SUPABASE_URL:-https://gymkrbjujghwvphessns.supabase.co}"
SUPABASE_KEY="${SUPABASE_KEY:-your-anon-key}"

# Build and deploy
echo "📦 Building and deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="SUPABASE_URL=$SUPABASE_URL,SUPABASE_KEY=$SUPABASE_KEY,PAYU_MERCHANT_KEY=test_key,PAYU_MERCHANT_SALT=test_salt" \
  --memory 512Mi \
  --cpu 1 \
  --concurrency 80 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0

# Get the deployed URL
echo "🔗 Getting deployed service URL..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo ""
echo "✅ Deployment Complete!"
echo "📍 Service URL: $SERVICE_URL"
echo ""
echo "📝 Environment Variables Set:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_KEY"
echo "   - PAYU_MERCHANT_KEY"
echo "   - PAYU_MERCHANT_SALT"
echo ""
echo "🔍 Test the API:"
echo "   curl $SERVICE_URL/"
echo "   curl $SERVICE_URL/api/health"
