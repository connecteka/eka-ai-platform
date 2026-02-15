"""
MongoDB Connection Pooling
For chat sessions, files, and high-throughput operations
"""
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)
load_dotenv()

def create_mongo_client():
    """Create MongoDB connection pool"""
    mongo_url = os.getenv('MONGODB_URL')
    
    if not mongo_url:
        logger.warning("No MONGODB_URL found, MongoDB features disabled")
        return None, None
    
    client = MongoClient(
        mongo_url,
        maxPoolSize=50,           # Maximum connections
        minPoolSize=10,           # Keep warm connections
        maxIdleTimeMS=30000,      # Close idle after 30s
        waitQueueTimeoutMS=5000,  # Wait max 5s
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=10000,
        retryWrites=True,
        retryReads=True,
        appName="eka_ai_backend"
    )
    
    db_name = os.getenv('MONGODB_DATABASE', 'eka_ai')
    db = client[db_name]
    
    logger.info("✅ MongoDB connection pool created (50 max, 10 min)")
    return client, db

# Initialize client
mongo_client, mongo_db = create_mongo_client()

# Collection shortcuts (if mongo is configured)
if mongo_db:
    chat_sessions = mongo_db['chat_sessions']
    ai_logs = mongo_db['ai_logs']
    notifications = mongo_db['notifications']
    analytics = mongo_db['analytics']
else:
    chat_sessions = ai_logs = notifications = analytics = None

def check_mongo_health():
    """Health check for MongoDB"""
    if not mongo_client:
        return False
    try:
        mongo_client.admin.command('ping')
        return True
    except ConnectionFailure as e:
        logger.error(f"MongoDB health check failed: {e}")
        return False