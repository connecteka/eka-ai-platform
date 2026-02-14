"""
AI Chat routes for EKA-AI Backend.
Handles AI chat endpoints and session management with Supabase.
"""
import os
import re
import uuid
import json
import asyncio
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Query, Request, Cookie

from models.schemas import ChatRequest, ChatStreamRequest, ChatSessionCreate, ChatMessageSave
from utils.supabase_db import (
    get_chat_sessions, get_chat_session_by_id, create_chat_session,
    update_chat_session, add_message_to_chat, delete_chat_session,
    get_user_subscription, increment_usage, check_usage_limit, get_session_by_token,
    serialize_doc, serialize_docs
)
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

# Plan limits for AI queries
PLAN_LIMITS = {
    "starter": {"ai_queries": 100, "job_cards": 40},
    "growth": {"ai_queries": 500, "job_cards": 120},
    "elite": {"ai_queries": -1, "job_cards": -1},
}


def get_user_from_request(request: Request, session_token: Optional[str] = None) -> Optional[str]:
    """Extract user_id from request."""
    token = session_token
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        return None
    
    session = get_session_by_token(token)
    return session.get("user_id") if session else None


@router.post("")
async def chat_with_ai(request: ChatRequest, req: Request, session_token: Optional[str] = Cookie(None)):
    """Main AI chat endpoint using Emergent LLM integration with usage tracking."""
    
    # Get user for usage tracking
    user_id = get_user_from_request(req, session_token)
    
    # Check usage limits if user is authenticated
    if user_id:
        subscription = get_user_subscription(user_id)
        plan = subscription.get("plan", "starter")
        limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["starter"])
        
        allowed, current, limit = check_usage_limit(user_id, "ai_queries", limits)
        if not allowed:
            return {
                "response_content": {
                    "visual_text": f"You have reached your monthly AI query limit ({limit} queries). Please upgrade your plan for more queries.",
                    "audio_text": "AI query limit reached."
                },
                "job_status_update": request.status,
                "ui_triggers": {"theme_color": "#FF0000", "brand_identity": "LIMIT_REACHED", "show_orange_border": False},
                "usage": {"current": current, "limit": limit, "plan": plan}
            }
    
    if not EMERGENT_LLM_KEY:
        return {
            "response_content": {
                "visual_text": "AI service not configured. Please set up the EMERGENT_LLM_KEY.",
                "audio_text": "AI service unavailable."
            },
            "job_status_update": request.status,
            "ui_triggers": {"theme_color": "#FF0000", "brand_identity": "OFFLINE", "show_orange_border": False}
        }
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        user_text = ""
        if request.history:
            last_msg = request.history[-1]
            if last_msg.role == "user" and last_msg.parts:
                user_text = last_msg.parts[0].get("text", "")
        
        system_prompt = f"""You are EKA-AI, an expert automobile intelligence assistant for Go4Garage. 

Your expertise includes:
- Vehicle diagnostics and troubleshooting
- Job card management and workflow
- Service estimates and pricing
- Maintenance schedules
- MG Fleet management
- GST invoicing for automobile services

Guidelines:
1. Be professional yet friendly
2. Provide accurate automotive advice
3. When a vehicle registration number is detected, acknowledge it for job card creation
4. Format responses clearly with bullet points when listing items
5. Include cost estimates when discussing repairs (in INR)
6. Mention warranty considerations when relevant

Current context:
- Operating mode: {"Workshop" if request.operating_mode == 1 else "MG Fleet" if request.operating_mode == 2 else "General"}
- Intelligence mode: {request.intelligence_mode}
"""
        
        if request.context:
            system_prompt += f"""
Vehicle Context:
- Type: {request.context.get('vehicleType', 'Unknown')}
- Brand: {request.context.get('brand', 'Unknown')}
- Model: {request.context.get('model', 'Unknown')}
- Year: {request.context.get('year', 'Unknown')}
- Fuel: {request.context.get('fuelType', 'Unknown')}
- Registration: {request.context.get('registrationNumber', 'Not provided')}
"""
        
        session_id = f"eka-chat-{uuid.uuid4().hex[:8]}"
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_prompt
        ).with_model("gemini", "gemini-2.0-flash")
        
        user_message = UserMessage(text=user_text)
        response_text = await chat.send_message(user_message)
        
        # Track usage after successful response
        if user_id:
            increment_usage(user_id, "ai_queries", 1)
        
        reg_pattern = r'([A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{0,2}[\s-]?\d{1,4})'
        show_orange_border = bool(re.search(reg_pattern, user_text, re.IGNORECASE))
        
        new_status = request.status
        if "diagnos" in user_text.lower():
            new_status = "DIAGNOSED"
        elif "estimate" in user_text.lower():
            new_status = "ESTIMATED"
        elif "approv" in user_text.lower():
            new_status = "CUSTOMER_APPROVAL"
        
        return {
            "response_content": {
                "visual_text": response_text,
                "audio_text": response_text[:200] if response_text else ""
            },
            "job_status_update": new_status,
            "ui_triggers": {
                "theme_color": "#F45D3D",
                "brand_identity": "EKA-AI",
                "show_orange_border": show_orange_border
            }
        }
        
    except Exception as e:
        print(f"AI Chat Error: {str(e)}")
        return {
            "response_content": {
                "visual_text": "I apologize, but I encountered an issue processing your request. Please try again.",
                "audio_text": "Error processing request."
            },
            "job_status_update": request.status,
            "ui_triggers": {"theme_color": "#F45D3D", "brand_identity": "EKA-AI", "show_orange_border": False}
        }


@router.post("/stream")
async def chat_stream(request: ChatStreamRequest, req: Request, session_token: Optional[str] = Cookie(None)):
    """SSE streaming endpoint for AI chat responses with usage tracking."""
    
    user_id = get_user_from_request(req, session_token)
    
    async def generate_stream():
        # Check usage limits
        if user_id:
            subscription = get_user_subscription(user_id)
            plan = subscription.get("plan", "starter")
            limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["starter"])
            
            allowed, current, limit = check_usage_limit(user_id, "ai_queries", limits)
            if not allowed:
                yield f"data: {json.dumps({'type': 'error', 'content': f'Monthly AI query limit reached ({limit}). Please upgrade your plan.'})}\n\n"
                return
        
        if not EMERGENT_LLM_KEY:
            yield f"data: {json.dumps({'type': 'error', 'content': 'AI service not configured'})}\n\n"
            return
        
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            system_prompt = """You are EKA-AI, an expert automobile intelligence assistant for Go4Garage. 
            
Your expertise includes vehicle diagnostics, job card management, service estimates, and MG Fleet management.
Be professional yet friendly. Provide accurate automotive advice with cost estimates in INR when relevant."""
            
            if request.context:
                system_prompt += f"\n\nVehicle Context: {json.dumps(request.context)}"
            
            session_id = request.session_id or f"eka-stream-{uuid.uuid4().hex[:8]}"
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=session_id,
                system_message=system_prompt
            ).with_model("gemini", "gemini-2.0-flash")
            
            yield f"data: {json.dumps({'type': 'start', 'session_id': session_id})}\n\n"
            
            user_message = UserMessage(text=request.message)
            response_text = await chat.send_message(user_message)
            
            # Track usage after successful response
            if user_id:
                increment_usage(user_id, "ai_queries", 1)
            
            words = response_text.split(' ')
            buffer = ""
            
            for i, word in enumerate(words):
                buffer += word + " "
                if (i + 1) % 5 == 0 or i == len(words) - 1:
                    yield f"data: {json.dumps({'type': 'chunk', 'content': buffer})}\n\n"
                    buffer = ""
                    await asyncio.sleep(0.05)
            
            reg_pattern = r'([A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{0,2}[\s-]?\d{1,4})'
            show_orange_border = bool(re.search(reg_pattern, request.message, re.IGNORECASE))
            
            yield f"data: {json.dumps({'type': 'done', 'full_text': response_text, 'show_orange_border': show_orange_border})}\n\n"
            
        except Exception as e:
            print(f"SSE Chat Error: {str(e)}")
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


# ==================== CHAT SESSIONS CRUD ====================

@router.post("/sessions", status_code=201)
def create_new_chat_session(session_data: ChatSessionCreate):
    """Create a new chat session."""
    session_id = f"chat-{uuid.uuid4().hex[:12]}"
    doc = {
        "session_id": session_id,
        "title": session_data.title or "New Conversation",
        "context": session_data.context or {},
        "messages": []
    }
    result = create_chat_session(doc)
    return {"success": True, "data": serialize_doc(result), "session_id": session_id}


@router.get("/sessions")
def get_all_chat_sessions(limit: int = Query(20, ge=1, le=100)):
    """Get all chat sessions, ordered by most recent."""
    sessions = get_chat_sessions(limit=limit)
    return {"success": True, "sessions": serialize_docs(sessions)}


@router.get("/sessions/{session_id}")
def get_single_chat_session(session_id: str):
    """Get a single chat session with all messages."""
    doc = get_chat_session_by_id(session_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return {"success": True, "data": serialize_doc(doc)}


@router.post("/sessions/{session_id}/messages")
def add_message_to_session(session_id: str, message: ChatMessageSave):
    """Add a message to an existing chat session."""
    msg_doc = {
        "id": uuid.uuid4().hex[:8],
        "role": message.role,
        "content": message.content,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    result = add_message_to_chat(session_id, msg_doc)
    if not result:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    return {"success": True, "message": msg_doc}


@router.delete("/sessions/{session_id}")
def delete_single_chat_session(session_id: str):
    """Delete a chat session."""
    success = delete_chat_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return {"success": True, "message": "Session deleted"}
