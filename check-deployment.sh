#!/bin/bash
echo "🔍 Checking EKA-AI Deployment..."

# Check if build exists
if [ ! -d "dist" ]; then
  echo "❌ dist/ folder missing"
  exit 1
fi

# Check key files
files=("index.html")
for file in "${files[@]}"; do
  if [ ! -e "dist/$file" ]; then
    echo "❌ dist/$file missing"
    exit 1
  fi
  echo "✅ dist/$file exists"
done

# Check assets folder
if [ ! -d "dist/assets" ]; then
  echo "⚠️  dist/assets folder not found (may be OK if using different structure)"
else
  echo "✅ dist/assets folder exists"
fi

# Check index.html size (should be > 1KB)
size=$(stat -f%z "dist/index.html" 2>/dev/null || stat -c%s "dist/index.html")
if [ "$size" -lt 1000 ]; then
  echo "❌ dist/index.html too small ($size bytes) - possible build failure"
  exit 1
fi
echo "✅ dist/index.html size: $size bytes"

# Check for EKA-AI content
if grep -q "EKA-AI" "dist/index.html"; then
  echo "✅ EKA-AI branding found in build"
else
  echo "⚠️  EKA-AI branding not found in build"
fi

echo "🎉 All checks passed!"
