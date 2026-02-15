"""
Enterprise configuration module
Database connection pools and health checks
"""

import os
import logging

logger = logging.getLogger(__name__)

# Database health check functions
def check_supabase_health() -> bool:
    """Check Supabase connection health"""
    try:
        from main import supabase
        if supabase:
            # Try a simple query
            response = supabase.table('job_cards').select('id', count='exact').limit(1).execute()
            return True
        return False
    except Exception as e:
        logger.error(f"Supabase health check failed: {e}")
        return False

def check_mongo_health() -> bool:
    """Check MongoDB connection health"""
    mongo_url = os.getenv("MONGODB_URL")
    if not mongo_url:
        return False
    
    try:
        from pymongo import MongoClient
        client = MongoClient(mongo_url, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        return True
    except Exception:
        return False

def check_redis_health() -> bool:
    """Check Redis connection health"""
    redis_url = os.getenv("REDIS_URL")
    if not redis_url:
        return False
    
    try:
        import redis
        r = redis.from_url(redis_url, socket_connect_timeout=5)
        r.ping()
        return True
    except Exception:
        return False

__all__ = [
    'check_supabase_health',
    'check_mongo_health', 
    'check_redis_health',
]
