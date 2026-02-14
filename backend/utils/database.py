"""
Database Compatibility Layer for EKA-AI Backend.
Provides a unified interface that works with both MongoDB (legacy) and Supabase.
During migration, this allows gradual transition from MongoDB to Supabase.
"""
import os
from datetime import datetime, timezone
from typing import Optional, Dict, List, Any

# Check which database to use
USE_SUPABASE = os.environ.get("USE_SUPABASE", "true").lower() == "true"
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

# Supabase client
supabase_client = None
if USE_SUPABASE and SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected to Supabase")
    except Exception as e:
        print(f"⚠️ Supabase connection failed: {e}")
        USE_SUPABASE = False

# MongoDB fallback
mongo_client = None
mongo_db = None
if not USE_SUPABASE or not supabase_client:
    try:
        from pymongo import MongoClient
        from bson import ObjectId
        MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
        DB_NAME = os.environ.get("DB_NAME", "eka_ai")
        mongo_client = MongoClient(MONGO_URL)
        mongo_db = mongo_client[DB_NAME]
        print("✅ Connected to MongoDB")
    except Exception as e:
        print(f"⚠️ MongoDB connection failed: {e}")


def serialize_doc(doc: dict) -> dict:
    """Convert database record to JSON-serializable format."""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == "_id":
            result["id"] = str(value)
        elif hasattr(value, 'hex'):  # ObjectId
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        else:
            result[key] = value
    return result


def serialize_docs(docs: list) -> list:
    """Convert list of database records."""
    if not docs:
        return []
    return [serialize_doc(doc) for doc in docs]


# ==================== GENERIC COLLECTION OPERATIONS ====================

class DatabaseCollection:
    """Unified collection interface for both MongoDB and Supabase."""
    
    def __init__(self, table_name: str):
        self.table_name = table_name
        self.use_supabase = USE_SUPABASE and supabase_client is not None
    
    def find(self, query: dict = None, projection: dict = None, sort: tuple = None, limit: int = 100) -> List[Dict]:
        """Find documents matching query."""
        if self.use_supabase:
            return self._supabase_find(query, projection, sort, limit)
        return self._mongo_find(query, projection, sort, limit)
    
    def find_one(self, query: dict, projection: dict = None) -> Optional[Dict]:
        """Find single document."""
        if self.use_supabase:
            return self._supabase_find_one(query, projection)
        return self._mongo_find_one(query, projection)
    
    def insert_one(self, doc: dict) -> Dict:
        """Insert single document."""
        if self.use_supabase:
            return self._supabase_insert(doc)
        return self._mongo_insert(doc)
    
    def update_one(self, query: dict, update: dict) -> Dict:
        """Update single document."""
        if self.use_supabase:
            return self._supabase_update(query, update)
        return self._mongo_update(query, update)
    
    def delete_one(self, query: dict) -> bool:
        """Delete single document."""
        if self.use_supabase:
            return self._supabase_delete(query)
        return self._mongo_delete(query)
    
    def delete_many(self, query: dict) -> int:
        """Delete multiple documents."""
        if self.use_supabase:
            return self._supabase_delete_many(query)
        return self._mongo_delete_many(query)
    
    def count_documents(self, query: dict = None) -> int:
        """Count documents matching query."""
        if self.use_supabase:
            return self._supabase_count(query)
        return self._mongo_count(query)
    
    # MongoDB implementations
    def _mongo_find(self, query, projection, sort, limit):
        if mongo_db is None:
            return []
        coll = mongo_db[self.table_name]
        cursor = coll.find(query or {}, projection)
        if sort:
            cursor = cursor.sort(sort[0], sort[1])
        if limit:
            cursor = cursor.limit(limit)
        return list(cursor)
    
    def _mongo_find_one(self, query, projection):
        if mongo_db is None:
            return None
        coll = mongo_db[self.table_name]
        return coll.find_one(query, projection)
    
    def _mongo_insert(self, doc):
        if mongo_db is None:
            return None
        coll = mongo_db[self.table_name]
        result = coll.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc
    
    def _mongo_update(self, query, update):
        if mongo_db is None:
            return None
        coll = mongo_db[self.table_name]
        if "$set" in update:
            coll.update_one(query, update)
        else:
            coll.update_one(query, {"$set": update})
        return coll.find_one(query)
    
    def _mongo_delete(self, query):
        if mongo_db is None:
            return False
        coll = mongo_db[self.table_name]
        result = coll.delete_one(query)
        return result.deleted_count > 0
    
    def _mongo_delete_many(self, query):
        if mongo_db is None:
            return 0
        coll = mongo_db[self.table_name]
        result = coll.delete_many(query)
        return result.deleted_count
    
    def _mongo_count(self, query):
        if mongo_db is None:
            return 0
        coll = mongo_db[self.table_name]
        return coll.count_documents(query or {})
    
    # Supabase implementations
    def _supabase_find(self, query, projection, sort, limit):
        try:
            q = supabase_client.table(self.table_name).select("*")
            if query:
                for key, value in query.items():
                    if isinstance(value, dict):
                        if "$in" in value:
                            q = q.in_(key, value["$in"])
                        elif "$gte" in value:
                            q = q.gte(key, value["$gte"])
                        elif "$lte" in value:
                            q = q.lte(key, value["$lte"])
                    else:
                        q = q.eq(key, value)
            if sort:
                desc = sort[1] == -1 if isinstance(sort[1], int) else sort[1] == "desc"
                q = q.order(sort[0], desc=desc)
            if limit:
                q = q.limit(limit)
            response = q.execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Supabase find error: {e}")
            return []
    
    def _supabase_find_one(self, query, projection):
        try:
            q = supabase_client.table(self.table_name).select("*")
            for key, value in query.items():
                q = q.eq(key, value)
            response = q.limit(1).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Supabase find_one error: {e}")
            return None
    
    def _supabase_insert(self, doc):
        try:
            doc["created_at"] = datetime.now(timezone.utc).isoformat()
            doc["updated_at"] = datetime.now(timezone.utc).isoformat()
            response = supabase_client.table(self.table_name).insert(doc).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Supabase insert error: {e}")
            return None
    
    def _supabase_update(self, query, update):
        try:
            data = update.get("$set", update)
            data["updated_at"] = datetime.now(timezone.utc).isoformat()
            q = supabase_client.table(self.table_name).update(data)
            for key, value in query.items():
                q = q.eq(key, value)
            response = q.execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Supabase update error: {e}")
            return None
    
    def _supabase_delete(self, query):
        try:
            q = supabase_client.table(self.table_name).delete()
            for key, value in query.items():
                q = q.eq(key, value)
            q.execute()
            return True
        except Exception as e:
            print(f"Supabase delete error: {e}")
            return False
    
    def _supabase_delete_many(self, query):
        try:
            q = supabase_client.table(self.table_name).delete()
            for key, value in query.items():
                q = q.eq(key, value)
            response = q.execute()
            return len(response.data) if response.data else 0
        except Exception as e:
            print(f"Supabase delete_many error: {e}")
            return 0
    
    def _supabase_count(self, query):
        try:
            q = supabase_client.table(self.table_name).select("*", count="exact")
            if query:
                for key, value in query.items():
                    if isinstance(value, dict):
                        if "$in" in value:
                            q = q.in_(key, value["$in"])
                    else:
                        q = q.eq(key, value)
            response = q.execute()
            return response.count if hasattr(response, 'count') else len(response.data or [])
        except Exception as e:
            print(f"Supabase count error: {e}")
            return 0


# ==================== COLLECTION INSTANCES ====================
# These match the original MongoDB collection names for compatibility

job_cards_collection = DatabaseCollection("job_cards")
invoices_collection = DatabaseCollection("invoices")
mg_contracts_collection = DatabaseCollection("mg_contracts")
mg_vehicle_logs_collection = DatabaseCollection("mg_vehicle_logs")
chat_sessions_collection = DatabaseCollection("chat_sessions")
users_collection = DatabaseCollection("users")
user_sessions_collection = DatabaseCollection("user_sessions")
files_collection = DatabaseCollection("files")
vehicles_collection = DatabaseCollection("vehicles")
customers_collection = DatabaseCollection("customers")
services_collection = DatabaseCollection("services")
parts_collection = DatabaseCollection("parts")
job_card_notes_collection = DatabaseCollection("job_card_notes")
job_card_timeline_collection = DatabaseCollection("job_card_timeline")
signatures_collection = DatabaseCollection("signatures")
notifications_collection = DatabaseCollection("notifications")
usage_tracking_collection = DatabaseCollection("usage_tracking")
subscriptions_collection = DatabaseCollection("subscriptions")


# ==================== HELPER FUNCTIONS ====================

def create_indexes():
    """Create database indexes (MongoDB only)."""
    if mongo_db:
        try:
            mongo_db["job_cards"].create_index("vehicle_registration")
            mongo_db["job_cards"].create_index("status")
            mongo_db["invoices"].create_index("job_card_id")
            mongo_db["chat_sessions"].create_index("user_id")
            mongo_db["users"].create_index("email", unique=True)
            print("✅ MongoDB indexes created")
        except Exception as e:
            print(f"⚠️ Index creation failed: {e}")


def close_connection():
    """Close database connections."""
    if mongo_client:
        mongo_client.close()
        print("MongoDB connection closed")
