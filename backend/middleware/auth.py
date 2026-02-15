"""
JWT Authentication Middleware for EKA-AI Platform (FastAPI Version)
Implements RBAC for protected endpoints
"""

from functools import wraps
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
from datetime import datetime, timezone, timedelta

security = HTTPBearer()

def get_jwt_secret():
    secret = os.getenv('JWT_SECRET')
    if not secret:
        raise ValueError("JWT_SECRET environment variable not set")
    return secret

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Validate JWT token and return current user.
    Usage: 
        @router.get("/protected")
        async def protected_endpoint(user: dict = Depends(get_current_user)):
            ...
    """
    token = credentials.credentials
    
    try:
        payload = jwt.decode(
            token, 
            get_jwt_secret(), 
            algorithms=['HS256'],
            options={"require": ["sub", "role", "workshop_id", "exp", "iat"]}
        )
        
        return {
            'user_id': payload['sub'],
            'role': payload['role'],
            'workshop_id': payload['workshop_id'],
            'email': payload.get('email')
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=500, detail="Server configuration error")

def require_roles(allowed_roles: list):
    """
    Dependency factory for role-based access control.
    Usage:
        @router.get("/admin-only")
        async def admin_endpoint(
            user: dict = Depends(require_roles(['OWNER', 'MANAGER']))
        ):
            ...
    """
    async def role_checker(credentials: HTTPAuthorizationCredentials = Depends(security)):
        user = await get_current_user(credentials)
        
        if user['role'] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Insufficient privileges. Required: {allowed_roles}"
            )
        return user
    
    return role_checker


def generate_token(user_id: str, role: str, workshop_id: str, email: str = None, expiry_hours: int = 24) -> str:
    """
    Generate a JWT token for a user.
    
    Args:
        user_id: UUID of the user
        role: User role (OWNER, MANAGER, TECHNICIAN, FLEET, CUSTOMER)
        workshop_id: UUID of the user's workshop
        email: Optional user email
        expiry_hours: Token validity in hours (default 24)
    
    Returns:
        JWT token string
    """
    now = datetime.now(timezone.utc)
    exp_time = now + timedelta(hours=expiry_hours)
    
    payload = {
        'sub': user_id,
        'role': role,
        'workshop_id': workshop_id,
        'email': email,
        'iat': int(now.timestamp()),
        'exp': int(exp_time.timestamp())
    }
    
    return jwt.encode(payload, get_jwt_secret(), algorithm='HS256')


def workshop_isolation_check(current_workshop_id: str, entity_workshop_id: str) -> bool:
    """
    Verify that the current user has access to the specified workshop's data.
    Prevents cross-tenant data access.
    
    Args:
        current_workshop_id: Current user's workshop ID
        entity_workshop_id: Workshop ID of the entity being accessed
    
    Returns:
        True if access is allowed, False otherwise
    """
    if not current_workshop_id:
        return False
    return current_workshop_id == entity_workshop_id
