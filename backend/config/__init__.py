"""
Database Configuration Module
Centralized connection pooling for Supabase, MongoDB, and Redis
"""
from .database_pool import supabase_engine, SessionLocal, get_db, check_supabase_health
from .mongodb_pool import mongo_client, mongo_db, check_mongo_health
from .redis_client import redis_client, check_redis_health

__all__ = [
    'supabase_engine',
    'SessionLocal',
    'get_db',
    'mongo_client',
    'mongo_db',
    'redis_client',
    'check_supabase_health',
    'check_mongo_health',
    'check_redis_health',
]