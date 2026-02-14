"""
Supabase Database Client for EKA-AI Backend.
Replaces MongoDB with Supabase PostgreSQL.
"""
import os
from datetime import datetime, timezone
from typing import Optional, Dict, List, Any
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

# Initialize Supabase client
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_supabase() -> Client:
    """Get Supabase client instance."""
    global supabase
    if not supabase:
        if SUPABASE_URL and SUPABASE_KEY:
            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    return supabase


def serialize_doc(doc: dict) -> dict:
    """Convert database record to JSON-serializable format."""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
        else:
            result[key] = value
    return result


def serialize_docs(docs: list) -> list:
    """Convert list of database records."""
    if not docs:
        return []
    return [serialize_doc(doc) for doc in docs]


# ==================== USERS (using user_profiles table) ====================

def get_user_by_email(email: str) -> Optional[Dict]:
    """Get user by email from user_profiles table."""
    client = get_supabase()
    if not client:
        return None
    try:
        response = client.table("user_profiles").select("*").eq("email", email).execute()
        if response.data:
            user = response.data[0]
            # Map user_profiles fields to expected user fields
            return {
                "id": user.get("id"),
                "user_id": user.get("id"),  # Use id as user_id
                "email": user.get("email"),
                "name": user.get("full_name"),
                "role": user.get("role", "user"),
                "workshop_id": user.get("workshop_id"),
                "phone": user.get("phone"),
                "auth_provider": "email",
                "created_at": user.get("created_at"),
                "updated_at": user.get("updated_at"),
                "password": user.get("password_hash")  # If stored
            }
        return None
    except Exception as e:
        print(f"get_user_by_email error: {e}")
        return None


def get_user_by_id(user_id: str) -> Optional[Dict]:
    """Get user by user_id from user_profiles table."""
    client = get_supabase()
    if not client:
        return None
    try:
        response = client.table("user_profiles").select("*").eq("id", user_id).execute()
        if response.data:
            user = response.data[0]
            return {
                "id": user.get("id"),
                "user_id": user.get("id"),
                "email": user.get("email"),
                "name": user.get("full_name"),
                "role": user.get("role", "user"),
                "workshop_id": user.get("workshop_id"),
                "phone": user.get("phone"),
                "auth_provider": user.get("auth_provider", "email"),
                "picture": user.get("picture"),
                "created_at": user.get("created_at"),
                "updated_at": user.get("updated_at")
            }
        return None
    except Exception as e:
        print(f"get_user_by_id error: {e}")
        return None


def create_user(user_data: Dict) -> Dict:
    """Create a new user in user_profiles table."""
    client = get_supabase()
    if not client:
        return None
    try:
        # Map to user_profiles schema
        profile_data = {
            "full_name": user_data.get("name"),
            "email": user_data.get("email"),
            "role": user_data.get("role", "user"),
            "phone": user_data.get("phone"),
            "password_hash": user_data.get("password"),
            "auth_provider": user_data.get("auth_provider", "email"),
            "picture": user_data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        response = client.table("user_profiles").insert(profile_data).execute()
        if response.data:
            user = response.data[0]
            return {
                "id": user.get("id"),
                "user_id": user.get("id"),
                "email": user.get("email"),
                "name": user.get("full_name"),
                "role": user.get("role")
            }
        return None
    except Exception as e:
        print(f"create_user error: {e}")
        return None


def update_user(email: str, update_data: Dict) -> Dict:
    """Update user by email in user_profiles table."""
    client = get_supabase()
    if not client:
        return None
    try:
        # Map to user_profiles schema
        profile_update = {}
        if "name" in update_data:
            profile_update["full_name"] = update_data["name"]
        if "picture" in update_data:
            profile_update["picture"] = update_data["picture"]
        if "phone" in update_data:
            profile_update["phone"] = update_data["phone"]
        profile_update["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        response = client.table("user_profiles").update(profile_update).eq("email", email).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"update_user error: {e}")
        return None


# ==================== USER SESSIONS ====================

def create_session(session_data: Dict) -> Dict:
    """Create a new user session."""
    client = get_supabase()
    if not client:
        return None
    session_data["created_at"] = datetime.now(timezone.utc).isoformat()
    response = client.table("user_sessions").insert(session_data).execute()
    return response.data[0] if response.data else None


def get_session_by_token(token: str) -> Optional[Dict]:
    """Get session by token."""
    client = get_supabase()
    if not client:
        return None
    response = client.table("user_sessions").select("*").eq("session_token", token).execute()
    return response.data[0] if response.data else None


def delete_sessions_by_user(user_id: str) -> bool:
    """Delete all sessions for a user."""
    client = get_supabase()
    if not client:
        return False
    client.table("user_sessions").delete().eq("user_id", user_id).execute()
    return True


def delete_session_by_token(token: str) -> bool:
    """Delete session by token."""
    client = get_supabase()
    if not client:
        return False
    client.table("user_sessions").delete().eq("session_token", token).execute()
    return True


# ==================== USAGE TRACKING ====================

def get_user_usage(user_id: str, month: str = None) -> Dict:
    """Get user's usage for current month."""
    client = get_supabase()
    if not client:
        return {"ai_queries": 0, "job_cards": 0}
    
    if not month:
        month = datetime.now(timezone.utc).strftime("%Y-%m")
    
    response = client.table("usage_tracking").select("*").eq("user_id", user_id).eq("month", month).execute()
    if response.data:
        return response.data[0]
    return {"user_id": user_id, "month": month, "ai_queries": 0, "job_cards": 0}


def increment_usage(user_id: str, usage_type: str, amount: int = 1) -> Dict:
    """Increment user's usage count."""
    client = get_supabase()
    if not client:
        return None
    
    month = datetime.now(timezone.utc).strftime("%Y-%m")
    current = get_user_usage(user_id, month)
    
    if current.get("id"):
        # Update existing record
        new_value = current.get(usage_type, 0) + amount
        response = client.table("usage_tracking").update({
            usage_type: new_value,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", current["id"]).execute()
    else:
        # Create new record
        data = {
            "user_id": user_id,
            "month": month,
            "ai_queries": amount if usage_type == "ai_queries" else 0,
            "job_cards": amount if usage_type == "job_cards" else 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        response = client.table("usage_tracking").insert(data).execute()
    
    return response.data[0] if response.data else None


def check_usage_limit(user_id: str, usage_type: str, plan_limits: Dict) -> tuple:
    """Check if user has exceeded their plan limit. Returns (allowed, current, limit)."""
    usage = get_user_usage(user_id)
    current = usage.get(usage_type, 0)
    limit = plan_limits.get(usage_type, 0)
    
    if limit == -1:  # Unlimited
        return True, current, -1
    
    return current < limit, current, limit


# ==================== SUBSCRIPTIONS ====================

def get_user_subscription(user_id: str) -> Dict:
    """Get user's subscription details."""
    client = get_supabase()
    if not client:
        return {"plan": "starter", "status": "active"}
    
    response = client.table("subscriptions").select("*").eq("user_id", user_id).eq("status", "active").execute()
    if response.data:
        return response.data[0]
    return {"user_id": user_id, "plan": "starter", "status": "active"}


def update_subscription(user_id: str, plan: str, status: str = "active") -> Dict:
    """Update or create user subscription."""
    client = get_supabase()
    if not client:
        return None
    
    existing = get_user_subscription(user_id)
    data = {
        "user_id": user_id,
        "plan": plan,
        "status": status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if existing.get("id"):
        response = client.table("subscriptions").update(data).eq("id", existing["id"]).execute()
    else:
        data["created_at"] = datetime.now(timezone.utc).isoformat()
        response = client.table("subscriptions").insert(data).execute()
    
    return response.data[0] if response.data else None


# ==================== JOB CARDS ====================

def get_job_cards(user_id: str = None, limit: int = 50) -> List[Dict]:
    """Get job cards, optionally filtered by user."""
    client = get_supabase()
    if not client:
        return []
    
    query = client.table("job_cards").select("*").order("created_at", desc=True).limit(limit)
    if user_id:
        query = query.eq("user_id", user_id)
    
    response = query.execute()
    return response.data if response.data else []


def get_job_card_by_id(job_card_id: str) -> Optional[Dict]:
    """Get job card by ID."""
    client = get_supabase()
    if not client:
        return None
    response = client.table("job_cards").select("*").eq("id", job_card_id).execute()
    return response.data[0] if response.data else None


def create_job_card(job_data: Dict) -> Dict:
    """Create a new job card."""
    client = get_supabase()
    if not client:
        return None
    job_data["created_at"] = datetime.now(timezone.utc).isoformat()
    job_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    response = client.table("job_cards").insert(job_data).execute()
    return response.data[0] if response.data else None


def update_job_card(job_card_id: str, update_data: Dict) -> Dict:
    """Update job card."""
    client = get_supabase()
    if not client:
        return None
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    response = client.table("job_cards").update(update_data).eq("id", job_card_id).execute()
    return response.data[0] if response.data else None


def delete_job_card(job_card_id: str) -> bool:
    """Delete job card."""
    client = get_supabase()
    if not client:
        return False
    client.table("job_cards").delete().eq("id", job_card_id).execute()
    return True


# ==================== CHAT SESSIONS ====================

def get_chat_sessions(user_id: str = None, limit: int = 20) -> List[Dict]:
    """Get chat sessions."""
    client = get_supabase()
    if not client:
        return []
    
    query = client.table("chat_sessions").select("*").order("updated_at", desc=True).limit(limit)
    if user_id:
        query = query.eq("user_id", user_id)
    
    response = query.execute()
    return response.data if response.data else []


def get_chat_session_by_id(session_id: str) -> Optional[Dict]:
    """Get chat session by ID."""
    client = get_supabase()
    if not client:
        return None
    response = client.table("chat_sessions").select("*").eq("session_id", session_id).execute()
    return response.data[0] if response.data else None


def create_chat_session(session_data: Dict) -> Dict:
    """Create a new chat session."""
    client = get_supabase()
    if not client:
        return None
    session_data["created_at"] = datetime.now(timezone.utc).isoformat()
    session_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    if "messages" not in session_data:
        session_data["messages"] = []
    response = client.table("chat_sessions").insert(session_data).execute()
    return response.data[0] if response.data else None


def update_chat_session(session_id: str, update_data: Dict) -> Dict:
    """Update chat session."""
    client = get_supabase()
    if not client:
        return None
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    response = client.table("chat_sessions").update(update_data).eq("session_id", session_id).execute()
    return response.data[0] if response.data else None


def add_message_to_chat(session_id: str, message: Dict) -> Dict:
    """Add a message to chat session."""
    client = get_supabase()
    if not client:
        return None
    
    session = get_chat_session_by_id(session_id)
    if not session:
        return None
    
    messages = session.get("messages", [])
    messages.append(message)
    
    update_data = {
        "messages": messages,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Update title if first user message
    if session.get("title") == "New Conversation" and message.get("role") == "user":
        content = message.get("content", "")
        update_data["title"] = content[:50] + "..." if len(content) > 50 else content
    
    response = client.table("chat_sessions").update(update_data).eq("session_id", session_id).execute()
    return response.data[0] if response.data else None


def delete_chat_session(session_id: str) -> bool:
    """Delete chat session."""
    client = get_supabase()
    if not client:
        return False
    client.table("chat_sessions").delete().eq("session_id", session_id).execute()
    return True


# ==================== INVOICES ====================

def get_invoices(user_id: str = None, limit: int = 50) -> List[Dict]:
    """Get invoices."""
    client = get_supabase()
    if not client:
        return []
    
    query = client.table("invoices").select("*").order("created_at", desc=True).limit(limit)
    if user_id:
        query = query.eq("user_id", user_id)
    
    response = query.execute()
    return response.data if response.data else []


def create_invoice(invoice_data: Dict) -> Dict:
    """Create a new invoice."""
    client = get_supabase()
    if not client:
        return None
    invoice_data["created_at"] = datetime.now(timezone.utc).isoformat()
    invoice_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    response = client.table("invoices").insert(invoice_data).execute()
    return response.data[0] if response.data else None


# ==================== NOTIFICATIONS ====================

def get_notifications(user_id: str, limit: int = 20) -> List[Dict]:
    """Get user notifications."""
    client = get_supabase()
    if not client:
        return []
    
    response = client.table("notifications").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
    return response.data if response.data else []


def create_notification(notification_data: Dict) -> Dict:
    """Create a notification."""
    client = get_supabase()
    if not client:
        return None
    notification_data["created_at"] = datetime.now(timezone.utc).isoformat()
    notification_data["read"] = False
    response = client.table("notifications").insert(notification_data).execute()
    return response.data[0] if response.data else None


def mark_notification_read(notification_id: str) -> bool:
    """Mark notification as read."""
    client = get_supabase()
    if not client:
        return False
    client.table("notifications").update({"read": True}).eq("id", notification_id).execute()
    return True
