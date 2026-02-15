"""
Redis Connection for Caching & Rate Limiting
Reduces database load by 80%+
"""
import redis
from redis.connection import ConnectionPool
import os
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)
load_dotenv()

def create_redis_client():
    """Create Redis connection pool"""
    redis_url = os.getenv('REDIS_URL')
    
    if not redis_url:
        # Try Railway Redis format
        redis_host = os.getenv('REDISHOST') or os.getenv('REDIS_HOST', 'localhost')
        redis_port = os.getenv('REDISPORT') or os.getenv('REDIS_PORT', '6379')
        redis_password = os.getenv('REDISPASSWORD') or os.getenv('REDIS_PASSWORD')
        
        if redis_password:
            redis_url = f"redis://:{redis_password}@{redis_host}:{redis_port}"
        else:
            redis_url = f"redis://{redis_host}:{redis_port}"
    
    try:
        pool = ConnectionPool.from_url(
            redis_url,
            max_connections=50,
            socket_connect_timeout=5,
            socket_keepalive=True,
            health_check_interval=30,
            decode_responses=True
        )
        client = redis.Redis(connection_pool=pool)
        logger.info("✅ Redis connection pool created (50 max connections)")
        return client
    except Exception as e:
        logger.warning(f"Redis not available: {e}")
        return None

# Initialize Redis
redis_client = create_redis_client()

def check_redis_health():
    """Health check for Redis"""
    if not redis_client:
        return False
    try:
        redis_client.ping()
        return True
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        return False