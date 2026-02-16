#!/bin/bash
set -e

echo "🚀 Starting EKA-AI Railway Deployment..."

echo "📦 Step 1: Cleaning old builds..."
rm -rf dist/

echo "📦 Step 2: Installing dependencies..."
npm ci

echo "🔍 Step 3: Verifying source files..."
if [ ! -d "src" ]; then
  echo "❌ ERROR: src/ folder not found!"
  exit 1
fi
echo "✅ Source files verified"

echo "🏗️  Step 4: Building application..."
npm run build

echo "🔍 Step 5: Verifying build output..."
node verify-build.js

echo "📂 Step 6: Build contents..."
ls -la dist/

echo "🎉 Build complete! Ready for Railway deployment."
