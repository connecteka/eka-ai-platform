#!/bin/sh
# EKA-AI Platform Startup Script
# Verifies frontend build before starting server

echo "═══════════════════════════════════════════════════════════════"
echo "  EKA-AI Platform Starting..."
echo "═══════════════════════════════════════════════════════════════"

# Check if dist folder exists
echo "📁 Checking frontend build..."
if [ -d "/app/dist" ]; then
    echo "✅ dist folder exists"
    ls -la /app/dist/
    
    if [ -f "/app/dist/index.html" ]; then
        echo "✅ index.html exists"
        echo "📄 First 10 lines of index.html:"
        head -10 /app/dist/index.html
    else
        echo "❌ index.html NOT FOUND"
    fi
    
    if [ -d "/app/dist/assets" ]; then
        echo "✅ assets folder exists"
        ls -la /app/dist/assets/ | head -10
    else
        echo "⚠️ assets folder NOT FOUND"
    fi
else
    echo "❌ dist folder NOT FOUND - Frontend not built!"
fi

echo ""
echo "🚀 Starting Gunicorn server..."
echo "═══════════════════════════════════════════════════════════════"

# Start the server
exec gunicorn wsgi:application \
    -w 4 \
    -k uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:${PORT:-8001} \
    --timeout 120 \
    --keep-alive 5 \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
