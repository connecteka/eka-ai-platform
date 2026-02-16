"""
Subscription and usage limit enforcement for EKA-AI.
Handles free tier limits, Pro subscriptions, and usage tracking.
"""

from datetime import datetime, timezone, timedelta
from functools import wraps
from typing import Optional
from fastapi import HTTPException, Request, Cookie
from utils.database import users_collection, user_sessions_collection, usage_tracking_collection

# Free tier limits
FREE_DAILY_QUERY_LIMIT = 5

# Subscription tiers
TIER_FREE = "free"
TIER_PRO_AI = "pro_ai"  # ₹299/month - Unlimited AI for car owners
TIER_STARTER = "starter"  # ₹1,499/month - 50 queries/day
TIER_GROWTH = "growth"  # ₹2,999/month - 200 queries/day
TIER_ELITE = "elite"  # ₹5,999/month - Unlimited

# Query limits per tier (daily)
TIER_LIMITS = {
    TIER_FREE: FREE_DAILY_QUERY_LIMIT,
    TIER_PRO_AI: -1,  # Unlimited
    TIER_STARTER: 50,
    TIER_GROWTH: 200,
    TIER_ELITE: -1,  # Unlimited
}


def get_current_user_id(request: Request, session_token: Optional[str] = Cookie(None)) -> Optional[str]:
    """Get current user ID from session token."""
    token = session_token
    
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        return None
    
    session_doc = user_sessions_collection.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        return None
    
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        user_sessions_collection.delete_one({"session_token": token})
        return None
    
    return session_doc.get("user_id")


def get_user_tier(user_id: str) -> str:
    """Get user's subscription tier."""
    if not user_id:
        return TIER_FREE
    
    user = users_collection.find_one({"user_id": user_id}, {"_id": 0, "subscription_tier": 1, "subscription_expires": 1})
    if not user:
        return TIER_FREE
    
    tier = user.get("subscription_tier", TIER_FREE)
    expires = user.get("subscription_expires")
    
    # Check if subscription expired
    if expires and tier != TIER_FREE:
        if isinstance(expires, str):
            expires = datetime.fromisoformat(expires.replace("Z", "+00:00"))
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        
        if expires < datetime.now(timezone.utc):
            # Subscription expired, downgrade to free
            users_collection.update_one(
                {"user_id": user_id},
                {"$set": {"subscription_tier": TIER_FREE, "updated_at": datetime.now(timezone.utc)}}
            )
            return TIER_FREE
    
    return tier


def get_daily_usage(user_id: str) -> int:
    """Get today's query usage for a user."""
    if not user_id:
        # For anonymous users, return 0 (they shouldn't be using chat without auth anyway)
        return 0
    
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    
    # Count usage for today
    count = usage_tracking_collection.count_documents({
        "user_id": user_id,
        "timestamp": {"$gte": today, "$lt": tomorrow},
        "type": "chat_query"
    })
    
    return count


def check_usage_limit(user_id: str) -> tuple[bool, int, int]:
    """
    Check if user has exceeded their daily limit.
    Returns: (allowed, used, limit)
    """
    tier = get_user_tier(user_id)
    limit = TIER_LIMITS.get(tier, FREE_DAILY_QUERY_LIMIT)
    
    # Unlimited tier
    if limit == -1:
        return True, 0, -1
    
    used = get_daily_usage(user_id)
    allowed = used < limit
    
    return allowed, used, limit


def increment_usage(user_id: str, query_type: str = "chat_query", metadata: dict = None):
    """Record a usage event."""
    if not user_id:
        return
    
    doc = {
        "user_id": user_id,
        "type": query_type,
        "timestamp": datetime.now(timezone.utc),
    }
    
    if metadata:
        doc["metadata"] = metadata
    
    usage_tracking_collection.insert_one(doc)


def require_subscription(min_tier: str = TIER_FREE):
    """
    Decorator to enforce subscription tier requirements.
    Usage: @require_subscription(TIER_PRO_AI) for Pro-only features
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Find request in args/kwargs
            request = kwargs.get('request')
            if not request and args:
                for arg in args:
                    if hasattr(arg, 'headers'):
                        request = arg
                        break
            
            if not request:
                raise HTTPException(status_code=500, detail="Request object not found")
            
            user_id = get_current_user_id(request)
            tier = get_user_tier(user_id)
            
            # Check tier hierarchy
            tier_order = [TIER_FREE, TIER_PRO_AI, TIER_STARTER, TIER_GROWTH, TIER_ELITE]
            user_tier_index = tier_order.index(tier) if tier in tier_order else 0
            required_tier_index = tier_order.index(min_tier) if min_tier in tier_order else 0
            
            if user_tier_index < required_tier_index:
                raise HTTPException(
                    status_code=403,
                    detail={
                        "error": "Subscription required",
                        "required_tier": min_tier,
                        "current_tier": tier,
                        "message": f"This feature requires {min_tier} subscription or higher"
                    }
                )
            
            # Add user info to kwargs
            kwargs['current_user_id'] = user_id
            kwargs['current_tier'] = tier
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def check_chat_limit(func):
    """
    Decorator to check and enforce daily chat query limits.
    Records usage if allowed.
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Find request in args/kwargs
        request = kwargs.get('request')
        if not request and args:
            for arg in args:
                if hasattr(arg, 'headers'):
                    request = arg
                    break
        
        if not request:
            raise HTTPException(status_code=500, detail="Request object not found")
        
        user_id = get_current_user_id(request)
        
        # Check limit
        allowed, used, limit = check_usage_limit(user_id)
        
        if not allowed:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Daily limit reached",
                    "used": used,
                    "limit": limit,
                    "message": f"You've used all {limit} free queries for today. Upgrade to Pro for unlimited access.",
                    "upgrade_url": "/pricing"
                }
            )
        
        # Record usage before processing
        if user_id:
            increment_usage(user_id, "chat_query")
        
        # Add usage info to kwargs for response
        kwargs['current_user_id'] = user_id
        kwargs['usage_info'] = {"used": used + 1, "limit": limit}
        
        return await func(*args, **kwargs)
    return wrapper


def get_subscription_info(user_id: str) -> dict:
    """Get full subscription info for a user."""
    if not user_id:
        return {
            "tier": TIER_FREE,
            "tier_name": "Free",
            "daily_limit": FREE_DAILY_QUERY_LIMIT,
            "used_today": 0,
            "remaining": FREE_DAILY_QUERY_LIMIT,
            "unlimited": False,
            "expires": None
        }
    
    tier = get_user_tier(user_id)
    limit = TIER_LIMITS.get(tier, FREE_DAILY_QUERY_LIMIT)
    used = get_daily_usage(user_id)
    unlimited = limit == -1
    
    user = users_collection.find_one(
        {"user_id": user_id}, 
        {"_id": 0, "subscription_expires": 1, "subscription_started": 1}
    )
    
    return {
        "tier": tier,
        "tier_name": tier.replace("_", " ").title(),
        "daily_limit": limit if not unlimited else None,
        "used_today": used,
        "remaining": max(0, limit - used) if not unlimited else None,
        "unlimited": unlimited,
        "expires": user.get("subscription_expires") if user else None,
        "started": user.get("subscription_started") if user else None
    }
