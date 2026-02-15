"""
Rate Limiting Middleware
Prevents DDoS and API abuse
Supports: 1000 req/min per IP default
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi import FastAPI, Request
import os
import logging

logger = logging.getLogger(__name__)

# Check if rate limiting is enabled
RATE_LIMITING_ENABLED = os.getenv('ENABLE_RATE_LIMITING', 'true').lower() == 'true'

# Initialize limiter with Redis if available
def create_limiter():
    """Create rate limiter with Redis backend"""
    if not RATE_LIMITING_ENABLED:
        logger.info("⚠️ Rate limiting disabled")
        return None
    
    try:
        # Try to get Redis URL
        redis_url = os.getenv('REDIS_URL')
        if not redis_url:
            # Try Railway format
            redis_host = os.getenv('REDISHOST') or os.getenv('REDIS_HOST', 'localhost')
            redis_port = os.getenv('REDISPORT') or os.getenv('REDIS_PORT', '6379')
            redis_password = os.getenv('REDISPASSWORD') or os.getenv('REDIS_PASSWORD')
            
            if redis_password:
                redis_url = f"redis://:{redis_password}@{redis_host}:{redis_port}"
            else:
                redis_url = f"redis://{redis_host}:{redis_port}"
        
        limiter = Limiter(
            key_func=get_remote_address,
            storage_uri=redis_url,
            strategy="fixed-window",  # Can be "moving-window" for more accuracy
            default_limits=["1000/hour"],  # Global default: 1000 requests per hour
        )
        logger.info("✅ Rate limiter initialized with Redis")
        return limiter
    except Exception as e:
        logger.warning(f"Could not initialize Redis rate limiter: {e}")
        logger.info("Falling back to memory-based rate limiting")
        
        # Fallback to memory-based (not recommended for production with multiple instances)
        limiter = Limiter(
            key_func=get_remote_address,
            default_limits=["1000/hour"],
        )
        return limiter

# Create global limiter instance
limiter = create_limiter()

def setup_rate_limiting(app: FastAPI):
    """
    Setup rate limiting for FastAPI application
    Call this in your main app setup
    """
    if not RATE_LIMITING_ENABLED or not limiter:
        logger.info("Rate limiting not enabled")
        return app
    
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)
    logger.info("✅ Rate limiting middleware added")
    return app

# Rate limit tiers for different endpoints
class RateLimitTiers:
    """
    Predefined rate limit tiers for different API endpoints
    
    Usage:
        @limiter.limit(RateLimitTiers.STRICT)
        async def sensitive_endpoint(request: Request):
            pass
    """
    STRICT = "10/minute"      # 10 requests per minute - for login, payment
    NORMAL = "100/minute"     # 100 requests per minute - for regular APIs
    RELAXED = "500/minute"    # 500 requests per minute - for read-heavy
    BURST = "1000/minute"     # 1000 requests per minute - for batch operations
    HEALTH = "60/minute"      # Health checks - generous but not unlimited

# Decorator for exempting routes from rate limiting
def exempt_from_limit(func):
    """Mark endpoint as exempt from rate limiting"""
    func.__exempt_from_limit__ = True
    return func

__all__ = ['limiter', 'setup_rate_limiting', 'RateLimitTiers', 'exempt_from_limit']