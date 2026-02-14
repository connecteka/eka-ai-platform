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
from pydantic import BaseModel

from models.schemas import UserLogin, UserRegister, GoogleAuthSession
from utils.database import users_collection, user_sessions_collection, serialize_doc
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
                    "redirect_uri": "postmessage",  # Required for popup flow
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
        
        # Create session
        session_token = f"google_session_{uuid.uuid4().hex}"
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
        
        return {
            "success": True,
            "user": user_doc,
            "token": session_token
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Google OAuth Callback Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


@router.post("/google")
async def google_oauth_login(request: GoogleTokenRequest, response: Response):
    """
    Direct Google OAuth login - verifies access token with Google and creates session.
    REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    """
    try:
        # Verify the access token with Google's userinfo endpoint
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
        
        # Check if user exists
        existing_user = users_collection.find_one({"email": email}, {"_id": 0})
        
        if existing_user:
            # Update existing user
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
            # Create new user
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
        
        # Create session
        session_token = f"google_session_{uuid.uuid4().hex}"
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        # Remove old sessions for this user
        user_sessions_collection.delete_many({"user_id": user_id})
        
        # Create new session
        user_sessions_collection.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc)
        })
        
        # Set cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7 * 24 * 60 * 60
        )
        
        # Get user doc for response
        user_doc = users_collection.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
        
        return {
            "success": True,
            "user": user_doc,
            "token": session_token
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Google OAuth Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


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
