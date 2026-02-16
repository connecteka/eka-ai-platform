"""
Database configuration and utilities for EKA-AI Backend.
"""
import os
from datetime import datetime
from bson import ObjectId
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB Configuration - Support both MONGO_URL and MONGODB_URL
MONGO_URL = os.environ.get("MONGO_URL") or os.environ.get("MONGODB_URL")
DB_NAME = os.environ.get("DB_NAME", "eka_ai_db")

# Validate MongoDB URL in production
if not MONGO_URL:
    import os
    if os.getenv("NODE_ENV") == "production" or os.getenv("ENVIRONMENT") == "production":
        raise ValueError(
            "🔴 CRITICAL: MONGO_URL (or MONGODB_URL) environment variable is not set in production! "
            "Please set your MongoDB Atlas connection string in Railway Variables."
        )
    # Fallback for development only
    MONGO_URL = "mongodb://localhost:27017"

# Initialize MongoDB client
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
job_cards_collection = db["job_cards"]
invoices_collection = db["invoices"]
mg_contracts_collection = db["mg_contracts"]
mg_vehicle_logs_collection = db["mg_vehicle_logs"]
mg_calculation_logs_collection = db["mg_calculation_logs"]
chat_sessions_collection = db["chat_sessions"]
users_collection = db["users"]
user_sessions_collection = db["user_sessions"]
files_collection = db["files"]
vehicles_collection = db["vehicles"]
customers_collection = db["customers"]
services_collection = db["services"]
parts_collection = db["parts"]
job_card_notes_collection = db["job_card_notes"]
job_card_timeline_collection = db["job_card_timeline"]
signatures_collection = db["signatures"]
notifications_collection = db["notifications"]


def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serializable format."""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == "_id":
            result["id"] = str(value)
        elif isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        else:
            result[key] = value
    return result


def serialize_docs(docs: list) -> list:
    """Convert list of MongoDB documents."""
    return [serialize_doc(doc) for doc in docs]


def create_indexes():
    """Create database indexes for better performance."""
    job_cards_collection.create_index("vehicle_registration")
    job_cards_collection.create_index("status")
    invoices_collection.create_index("job_card_id")
    chat_sessions_collection.create_index("user_id")
    users_collection.create_index("email", unique=True)
    print("Database indexes created.")


def close_connection():
    """Close the MongoDB connection."""
    client.close()
    print("MongoDB connection closed.")
