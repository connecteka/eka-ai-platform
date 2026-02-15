#!/bin/bash
# Load Testing Suite for Railway Deployment
# Usage: ./scripts/run-load-tests.sh [api-url]

set -e

API_URL=${1:-"https://api.eka-ai.in"}
RESULTS_DIR="./test-results/$(date +%Y%m%d_%H%M%S)"

mkdir -p "$RESULTS_DIR"

echo "🚀 EKA-AI Load Testing Suite"
echo "Target: $API_URL"
echo "Results: $RESULTS_DIR"
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "❌ k6 not found. Install from: https://k6.io/docs/get-started/installation/"
    exit 1
fi

# 1. Load Test (200K users simulation)
echo "📊 Test 1: Load Test (12K concurrent users)"
echo "Duration: ~45 minutes"
k6 run \
  --env API_URL="$API_URL" \
  --out json="$RESULTS_DIR/load-test.json" \
  --summary-export="$RESULTS_DIR/load-test-summary.json" \
  tests/load/k6/railway-load-test.js

echo ""
echo "✅ Load test completed"
echo ""

# 2. Spike Test (sudden traffic)
echo "⚡ Test 2: Spike Test (20K sudden users)"
echo "Duration: ~10 minutes"
k6 run \
  --env API_URL="$API_URL" \
  --out json="$RESULTS_DIR/spike-test.json" \
  --summary-export="$RESULTS_DIR/spike-test-summary.json" \
  tests/load/k6/spike-test.js

echo ""
echo "✅ Spike test completed"
echo ""

# 3. Quick Smoke Test (if others pass)
echo "🚬 Test 3: Quick Smoke Test"
k6 run \
  --env API_URL="$API_URL" \
  --duration 30s \
  --vus 10 \
  tests/load/k6/railway-load-test.js

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ ALL TESTS COMPLETED"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Results saved to: $RESULTS_DIR"
echo ""
echo "View results:"
echo "  cat $RESULTS_DIR/load-test-summary.json"
echo ""
echo "Analyze with k6 cloud:"
echo "  k6 cloud $RESULTS_DIR/load-test.json"