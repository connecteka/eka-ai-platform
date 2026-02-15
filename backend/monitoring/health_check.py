"""
Health Check Endpoints
"""

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
import os
import time

router = APIRouter()

# Startup time for uptime calculation
START_TIME = time.time()

@router.get("/health")
def health():
    """Simple health check"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "eka-ai-backend"
    }

@router.get("/health/detailed")
def detailed_health():
    """Detailed health check with dependency status"""
    from config import check_supabase_health, check_mongo_health, check_redis_health
    
    checks = {
        "supabase": check_supabase_health(),
        "mongo": check_mongo_health(),
        "redis": check_redis_health(),
    }
    
    # Overall status
    all_healthy = all(checks.values())
    
    return {
        "status": "healthy" if all_healthy else "degraded",
        "checks": checks,
        "uptime_seconds": int(time.time() - START_TIME),
        "version": "3.0.0-enterprise"
    }

@router.get("/health/ready")
def readiness_check():
    """Kubernetes readiness probe"""
    from config import check_supabase_health
    
    if check_supabase_health():
        return {"status": "ready"}
    else:
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "reason": "database_unavailable"}
        )

@router.get("/health/live")
def liveness_check():
    """Kubernetes liveness probe"""
    return {"status": "alive"}
