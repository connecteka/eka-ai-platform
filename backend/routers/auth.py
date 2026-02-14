"""
Authentication routes for EKA-AI Backend.
Handles login, registration, Google OAuth, and session management.
Uses Supabase as the database backend.
"""
import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Response, Cookie, Request
from pydantic import BaseModel

from models.schemas import UserLogin, UserRegister, GoogleAuthSession
from utils.supabase_db import (
    get_user_by_email, get_user_by_id, create_user, update_user,
    create_session, get_session_by_token, delete_sessions_by_user, delete_session_by_token,
    get_user_subscription, get_user_usage, check_usage_limit, get_supabase
)
from utils.security import hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class GoogleTokenRequest(BaseModel):
    """Request body for direct Google OAuth token verification."""
    access_token: str


class GoogleCodeRequest(BaseModel):
    """Request body for Google OAuth authorization code exchange."""
    code: str


# Google OAuth Client credentials (from environment)
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")

# Plan limits
PLAN_LIMITS = {
    "starter": {"ai_queries": 100, "job_cards": 40},
    "growth": {"ai_queries": 500, "job_cards": 120},
    "elite": {"ai_queries": -1, "job_cards": -1},  # -1 = unlimited
}


@router.get("/usage")
async def get_current_usage(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get current user's usage and limits."""
    token = session_token
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = get_session_by_token(token)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    user_id = session.get("user_id")
    subscription = get_user_subscription(user_id)
    plan = subscription.get("plan", "starter")
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["starter"])
    usage = get_user_usage(user_id)
    
    return {
        "plan": plan,
        "usage": {
            "ai_queries": usage.get("ai_queries", 0),
            "job_cards": usage.get("job_cards", 0)
        },
        "limits": limits,
        "subscription_status": subscription.get("status", "active")
    }


@router.post("/google/callback")
async def google_oauth_callback(request: GoogleCodeRequest, response: Response):
    """
    Exchange Google authorization code for tokens and create session.
    This is used with the 'auth-code' flow from @react-oauth/google.
    """
    try:
        # Exchange authorization code for tokens
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": request.code,
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": "postmessage",
                    "grant_type": "authorization_code"
                },
                timeout=10.0
            )
            
            if token_response.status_code != 200:
                error_data = token_response.json()
                print(f"Token exchange failed: {error_data}")
                raise HTTPException(status_code=401, detail="Failed to exchange authorization code")
            
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            
            if not access_token:
                raise HTTPException(status_code=401, detail="No access token received")
            
            # Get user info with access token
            userinfo_response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10.0
            )
            
            if userinfo_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Failed to get user info from Google")
            
            user_info = userinfo_response.json()
        
        email = user_info.get("email")
        name = user_info.get("name", email.split("@")[0] if email else "User")
        picture = user_info.get("picture", "")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")
        
        # Check if user exists
        existing_user = get_user_by_email(email)
        
        if existing_user:
            update_user(email, {"name": name, "picture": picture})
            user_id = existing_user.get("user_id")
        else:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            create_user({
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "role": "user",
                "auth_provider": "google"
            })
        
        # Create session
        session_token = f"google_session_{uuid.uuid4().hex}"
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        delete_sessions_by_user(user_id)
        create_session({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at.isoformat()
        })
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7 * 24 * 60 * 60
        )
        
        user_doc = get_user_by_id(user_id)
        if user_doc and "password" in user_doc:
            del user_doc["password"]
        
        return {"success": True, "user": user_doc, "token": session_token}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Google OAuth Callback Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


@router.post("/google")
async def google_oauth_login(request: GoogleTokenRequest, response: Response):
    """
    Direct Google OAuth login - verifies access token with Google and creates session.
    """
    try:
        async with httpx.AsyncClient() as client:
            google_response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {request.access_token}"},
                timeout=10.0
            )
            
            if google_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google access token")
            
            user_info = google_response.json()
        
        email = user_info.get("email")
        name = user_info.get("name", email.split("@")[0] if email else "User")
        picture = user_info.get("picture", "")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")
        
        existing_user = get_user_by_email(email)
        
        if existing_user:
            update_user(email, {"name": name, "picture": picture})
            user_id = existing_user.get("user_id")
        else:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            create_user({
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "role": "user",
                "auth_provider": "google"
            })
        
        session_token = f"google_session_{uuid.uuid4().hex}"
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        delete_sessions_by_user(user_id)
        create_session({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at.isoformat()
        })
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7 * 24 * 60 * 60
        )
        
        user_doc = get_user_by_id(user_id)
        if user_doc and "password" in user_doc:
            del user_doc["password"]
        
        return {"success": True, "user": user_doc, "token": session_token}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Google OAuth Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


@router.post("/google/session")
async def process_google_session(session_data: GoogleAuthSession, response: Response):
    """
    Process Google OAuth session_id from Emergent Auth.
    """
    try:
        async with httpx.AsyncClient() as client:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_data.session_id},
                timeout=10.0
            )
            
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            user_info = auth_response.json()
        
        email = user_info.get("email")
        name = user_info.get("name", email.split("@")[0] if email else "User")
        picture = user_info.get("picture", "")
        session_token = user_info.get("session_token")
        
        if not email or not session_token:
            raise HTTPException(status_code=400, detail="Invalid user data from auth provider")
        
        existing_user = get_user_by_email(email)
        
        if existing_user:
            update_user(email, {"name": name, "picture": picture})
            user_id = existing_user.get("user_id")
        else:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            create_user({
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "role": "user",
                "auth_provider": "google"
            })
        
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        delete_sessions_by_user(user_id)
        create_session({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at.isoformat()
        })
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7 * 24 * 60 * 60
        )
        
        user_doc = get_user_by_id(user_id)
        if user_doc and "password" in user_doc:
            del user_doc["password"]
        
        return {"success": True, "user": user_doc, "token": session_token}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Google Auth Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


@router.get("/me")
async def get_current_user(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get current authenticated user."""
    token = session_token
    
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = get_session_by_token(token)
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        delete_session_by_token(token)
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_id = session_doc.get("user_id")
    user_doc = get_user_by_id(user_id)
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if "password" in user_doc:
        del user_doc["password"]
    
    return user_doc


@router.post("/logout")
async def logout_user(
    request: Request,
    response: Response,
    session_token: Optional[str] = Cookie(None)
):
    """Logout user and clear session."""
    token = session_token
    
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if token:
        delete_session_by_token(token)
    
    response.delete_cookie(key="session_token", path="/", secure=True, samesite="none")
    
    return {"success": True, "message": "Logged out successfully"}


@router.post("/register")
def register_user(user: UserRegister, response: Response):
    """Register a new user with email/password."""
    existing = get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = hash_password(user.password)
    
    create_user({
        "user_id": user_id,
        "email": user.email,
        "password": hashed_pw,
        "name": user.name,
        "workshop_name": user.workshop_name,
        "role": "user",
        "auth_provider": "email"
    })
    
    session_token = f"email_session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    create_session({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user_doc = get_user_by_id(user_id)
    if user_doc and "password" in user_doc:
        del user_doc["password"]
    
    return {"success": True, "user": user_doc, "token": session_token}


@router.post("/login")
def login_user(credentials: UserLogin, response: Response):
    """Login user with email/password."""
    user = get_user_by_email(credentials.email)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_id = user.get("user_id")
    
    if not user_id:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        update_user(credentials.email, {"user_id": user_id})
    
    delete_sessions_by_user(user_id)
    
    session_token = f"email_session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    create_session({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user_data = get_user_by_id(user_id)
    if user_data and "password" in user_data:
        del user_data["password"]
    
    return {"success": True, "user": user_data, "token": session_token}
