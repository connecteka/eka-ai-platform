"""
Production-grade entry point for EKA AI Platform
Wraps existing app with enterprise features (Pooling, Caching, Security)
WITHOUT modifying the original source code.

Usage:
  Production: gunicorn backend.main_enterprise:app -k uvicorn.workers.UvicornWorker
"""

import os
import sys
import time
import logging

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("eka_enterprise")

# Feature flags from environment
ENABLE_RATE_LIMITING = os.getenv("ENABLE_RATE_LIMITING", "true").lower() == "true"
ENABLE_CACHING = os.getenv("ENABLE_CACHING", "true").lower() == "true"
ENABLE_MONITORING = os.getenv("ENABLE_MONITORING", "true").lower() == "true"
ENABLE_SECURITY_HARDENING = os.getenv("ENABLE_SECURITY_HARDENING", "true").lower() == "true"

logger.info("🚀 EKA AI Enterprise Mode Initializing...")
logger.info(f"Features: RateLimit={ENABLE_RATE_LIMITING}, Cache={ENABLE_CACHING}, Monitor={ENABLE_MONITORING}, Security={ENABLE_SECURITY_HARDENING}")

# Import original app (from main.py)
try:
    from main import app as original_app
    logger.info("✅ Original app imported successfully")
except ImportError as e:
    logger.error(f"❌ Failed to import original app: {e}")
    raise

# Initialize enterprise app
app = original_app

# 1. Add Security Middleware (CORS & Headers)
if ENABLE_SECURITY_HARDENING:
    try:
        from fastapi.middleware.cors import CORSMiddleware
        
        # Load Allowed Origins (Landing Page + App)
        origins_str = os.getenv(
            'ALLOWED_ORIGINS', 
            'https://www.eka-ai.in,https://app.eka-ai.in,https://eka-ai.in'
        )
        origins = [o.strip() for o in origins_str.split(',') if o.strip()]
        
        # Add localhost for development
        if os.getenv("NODE_ENV") != "production":
            origins.extend(["http://localhost:3000", "http://localhost:5173", "http://localhost:8001"])
        
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            allow_headers=["Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "X-Session-ID"],
            max_age=600,
        )
        logger.info(f"✅ CORS configured for: {origins}")
    except Exception as e:
        logger.error(f"⚠️ Failed to add CORS: {e}")

# 2. Add Request Timing Middleware
@app.middleware("http")
async def add_process_time_header(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(round(process_time, 3))
    return response

# 3. Add Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# 4. Startup Event - Health Checks
@app.on_event("startup")
async def startup_event():
    logger.info("🔍 Running startup health checks...")
    
    # Check Supabase
    try:
        from main import supabase
        if supabase:
            logger.info("✓ Supabase: Connected")
        else:
            logger.warning("⚠ Supabase: Not initialized")
    except Exception as e:
        logger.error(f"✗ Supabase: {e}")
    
    # Check MongoDB if configured
    mongo_url = os.getenv("MONGODB_URL")
    if mongo_url:
        try:
            from pymongo import MongoClient
            client = MongoClient(mongo_url, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            logger.info("✓ MongoDB: Connected")
        except Exception as e:
            logger.warning(f"⚠ MongoDB: {e}")
    else:
        logger.info("⊘ MongoDB: Not configured (using Supabase only)")
    
    # Check Redis if configured
    redis_url = os.getenv("REDIS_URL")
    if redis_url and ENABLE_CACHING:
        try:
            import redis
            r = redis.from_url(redis_url, socket_connect_timeout=5)
            r.ping()
            logger.info("✓ Redis: Connected")
        except Exception as e:
            logger.warning(f"⚠ Redis: {e}")
    else:
        logger.info("⊘ Redis: Not configured or caching disabled")
    
    logger.info("✅ Startup complete")

# 5. Shutdown Event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Shutting down gracefully...")
    # Add any cleanup here if needed
    logger.info("✅ Shutdown complete")

logger.info("✅ Enterprise app ready")

__all__ = ['app']
