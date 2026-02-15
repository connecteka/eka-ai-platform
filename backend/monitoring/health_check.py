"""
Health Check Endpoints for Railway Deployment
Provides: /health, /health/detailed, /metrics
"""
from fastapi import APIRouter, Response, status
from fastapi.responses import JSONResponse
import time
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# App start time for uptime calculation
START_TIME = time.time()

@router.get("/health", tags=["Health"])
async def health_check():
    """
    Basic health check - fast response for load balancers
    Returns: 200 OK if app is running
    """
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "eka-ai-backend",
        "version": "3.0.0"
    }

@router.get("/health/detailed", tags=["Health"])
async def detailed_health_check():
    """
    Detailed health check with all dependencies
    Returns: Status of Supabase, MongoDB, Redis
    """
    from backend.config import (
        check_supabase_health,
        check_mongo_health,
        check_redis_health,
        redis_client
    )
    
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "uptime_seconds": int(time.time() - START_TIME),
        "version": "3.0.0",
        "checks": {}
    }
    
    # Check Supabase
    try:
        supabase_ok = check_supabase_health()
        health_status["checks"]["supabase"] = {
            "status": "up" if supabase_ok else "down"
        }
    except Exception as e:
        logger.error(f"Supabase health check error: {e}")
        health_status["checks"]["supabase"] = {
            "status": "down",
            "error": str(e)
        }
    
    # Check MongoDB
    try:
        mongo_ok = check_mongo_health()
        health_status["checks"]["mongodb"] = {
            "status": "up" if mongo_ok else "down"
        }
    except Exception as e:
        logger.error(f"MongoDB health check error: {e}")
        health_status["checks"]["mongodb"] = {
            "status": "down",
            "error": str(e)
        }
    
    # Check Redis
    try:
        redis_ok = check_redis_health()
        health_status["checks"]["redis"] = {
            "status": "up" if redis_ok else "down"
        }
        
        # Add Redis stats if available
        if redis_ok and redis_client:
            try:
                info = redis_client.info('memory')
                health_status["checks"]["redis"]["memory_used"] = info.get('used_memory_human')
            except:
                pass
    except Exception as e:
        logger.error(f"Redis health check error: {e}")
        health_status["checks"]["redis"] = {
            "status": "down",
            "error": str(e)
        }
    
    # Determine overall status
    all_checks = health_status["checks"].values()
    critical_down = sum(1 for c in all_checks if c["status"] == "down")
    
    if critical_down == 0:
        health_status["status"] = "healthy"
    elif critical_down == len(all_checks):
        health_status["status"] = "critical"
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=health_status
        )
    else:
        health_status["status"] = "degraded"
    
    return health_status

@router.get("/health/ready", tags=["Health"])
async def readiness_check():
    """
    Kubernetes/Railway readiness probe
    Returns: 200 if app is ready to receive traffic
    """
    from backend.config import check_supabase_health
    
    # App is ready if it can connect to primary database
    if check_supabase_health():
        return {"status": "ready"}
    else:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "not_ready", "reason": "database_unavailable"}
        )

@router.get("/health/live", tags=["Health"])
async def liveness_check():
    """
    Kubernetes/Railway liveness probe
    Returns: 200 if app is alive (even if degraded)
    """
    return {"status": "alive", "timestamp": time.time()}

@router.get("/metrics", tags=["Monitoring"])
async def prometheus_metrics():
    """
    Prometheus metrics endpoint
    Returns: Metrics in Prometheus format for scraping
    """
    # If you have prometheus_client installed
    try:
        from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
        return Response(
            content=generate_latest(),
            media_type=CONTENT_TYPE_LATEST
        )
    except ImportError:
        # Fallback: return basic metrics as JSON
        from backend.config import redis_client
        from backend.middleware.cache import cache_manager
        
        metrics = {
            "uptime_seconds": int(time.time() - START_TIME),
            "cache_stats": cache_manager.get_stats() if redis_client else {"status": "disabled"},
        }
        return metrics