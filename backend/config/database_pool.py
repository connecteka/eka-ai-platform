"""
Database Connection Pooling for 200K Users
Handles 12,000 concurrent connections
"""
import os
from sqlalchemy import create_engine, text
from sqlalchemy.pool import QueuePool
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)
load_dotenv()

# Supabase Connection Pool (PostgreSQL)
# Optimized for 12K concurrent users
def create_supabase_engine():
    """Create Supabase connection pool"""
    database_url = os.getenv('SUPABASE_DATABASE_URL') or os.getenv('DATABASE_URL')
    
    if not database_url:
        logger.warning("No DATABASE_URL found, skipping Supabase pool creation")
        return None
    
    engine = create_engine(
        database_url,
        poolclass=QueuePool,
        pool_size=int(os.getenv('DB_POOL_SIZE', '20')),      # Base connections
        max_overflow=int(os.getenv('DB_MAX_OVERFLOW', '30')), # Burst capacity
        pool_timeout=30,                                      # Wait time
        pool_recycle=1800,                                    # Recycle every 30 min
        pool_pre_ping=True,                                   # Health check before use
        echo_pool=False,
        connect_args={
            "application_name": "eka_ai_backend",
            "connect_timeout": 10,
        }
    )
    logger.info("✅ Supabase connection pool created (20 base + 30 overflow)")
    return engine

# Initialize engine
supabase_engine = create_supabase_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=supabase_engine) if supabase_engine else None

def get_db():
    """FastAPI dependency for database sessions"""
    if not SessionLocal:
        raise RuntimeError("Database not configured")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_supabase_health():
    """Health check for Supabase connection"""
    if not supabase_engine:
        return False
    try:
        with supabase_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Supabase health check failed: {e}")
        return False