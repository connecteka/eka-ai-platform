"""
Authentication routes for EKA-AI Backend.
Handles login, registration, Google OAuth, and session management.
"""
import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Response, Cookie, Request

from models.schemas import UserLogin, UserRegister, GoogleAuthSession
from utils.database import users_collection, user_sessions_collection, serialize_doc
from utils.security import hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/google/session")
async def process_google_session(session_data: GoogleAuthSession, response: Response):
    """
    Process Google OAuth session_id from Emergent Auth.
    Exchanges session_id for user data and creates a persistent session.
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
        
        existing_user = users_collection.find_one({"email": email}, {"_id": 0})
        
        if existing_user:
            users_collection.update_one(
                {"email": email},
                {"$set": {
                    "name": name,
                    "picture": picture,
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            user_id = existing_user.get("user_id")
        else:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            users_collection.insert_one({
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "role": "user",
                "auth_provider": "google",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            })
        
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        user_sessions_collection.delete_many({"user_id": user_id})
        
        user_sessions_collection.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc)
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
        
        user_doc = users_collection.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
        
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
    
    session_doc = user_sessions_collection.find_one({"session_token": token}, {"_id": 0})
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        user_sessions_collection.delete_one({"session_token": token})
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_id = session_doc.get("user_id")
    user_doc = users_collection.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
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
        user_sessions_collection.delete_one({"session_token": token})
    
    response.delete_cookie(key="session_token", path="/", secure=True, samesite="none")
    
    return {"success": True, "message": "Logged out successfully"}


@router.post("/register")
def register_user(user: UserRegister, response: Response):
    """Register a new user with email/password."""
    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    
    # Hash password for security
    hashed_pw = hash_password(user.password)
    
    doc = {
        "user_id": user_id,
        "email": user.email,
        "password": hashed_pw,
        "name": user.name,
        "workshop_name": user.workshop_name,
        "role": "user",
        "auth_provider": "email",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    users_collection.insert_one(doc)
    
    session_token = f"email_session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    user_sessions_collection.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
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
    
    user_doc = users_collection.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    
    return {"success": True, "user": user_doc, "token": session_token}


@router.post("/login")
def login_user(credentials: UserLogin, response: Response):
    """Login user with email/password."""
    user = users_collection.find_one({"email": credentials.email})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password (supports both hashed and legacy plain text)
    if not verify_password(credentials.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_id = user.get("user_id")
    
    if not user_id:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        users_collection.update_one(
            {"email": credentials.email},
            {"$set": {"user_id": user_id}}
        )
    
    user_sessions_collection.delete_many({"user_id": user_id})
    
    session_token = f"email_session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    user_sessions_collection.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
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
    
    user_data = users_collection.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    
    return {"success": True, "user": user_data, "token": session_token}
