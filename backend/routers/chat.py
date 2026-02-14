"""
AI Chat routes for EKA-AI Backend.
Handles AI chat endpoints and session management with AI Governance.
"""
import os
import re
import uuid
import json
import asyncio
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse, JSONResponse

from models.schemas import ChatRequest, ChatStreamRequest, ChatSessionCreate, ChatMessageSave
from utils.database import chat_sessions_collection, serialize_doc, serialize_docs

# AI Governance Integration
from services.ai_governance import AIGovernance, UserRole

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])

# Initialize AI Governance
governance = AIGovernance()

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")


@router.post("")
async def chat_with_ai(request: ChatRequest):
    """Main AI chat endpoint using Emergent LLM integration with AI Governance."""
    
    # Extract user message for governance check
    user_text = ""
    if request.history:
        last_msg = request.history[-1]
        if last_msg.role == "user" and last_msg.parts:
            user_text = last_msg.parts[0].get("text", "")
    
    # AI Governance Check - 4-Layer Safety System
    user_context = {
        "user_id": getattr(request, 'user_id', 'anonymous'),
        "role": UserRole.TECHNICIAN,  # Default role, should come from auth
        "workshop_id": getattr(request, 'workshop_id', None),
        "subscription_tier": "FREE"  # Should come from user profile
    }
    
    decision = governance.evaluate_query(
        query=user_text,
        user_context=user_context
    )
    
    # Log governance decision
    governance.log_decision(decision)
    
    # Handle blocked queries
    if decision.final_action == "BLOCK":
        return JSONResponse(
            status_code=403,
            content={
                "response_content": {
                    "visual_text": decision.response_template or "This query cannot be processed.",
                    "audio_text": "Query blocked by safety system."
                },
                "job_status_update": request.status,
                "ui_triggers": {
                    "theme_color": "#F59E0B", 
                    "brand_identity": "BLOCKED", 
                    "show_orange_border": True,
                    "governance_alert": True
                },
                "governance": decision.to_dict()
            }
        )
    
    # Handle queries needing clarification
    if decision.final_action == "CLARIFY":
        return {
            "response_content": {
                "visual_text": decision.response_template or "I need more information to help you accurately.",
                "audio_text": "Please provide more details."
            },
            "job_status_update": request.status,
            "ui_triggers": {
                "theme_color": "#3B82F6",
                "brand_identity": "CLARIFY",
                "show_orange_border": False
            },
            "governance": decision.to_dict()
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
async def chat_stream(request: ChatStreamRequest):
    """SSE streaming endpoint for AI chat responses."""
    
    async def generate_stream():
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
def create_chat_session(session_data: ChatSessionCreate):
    """Create a new chat session."""
    session_id = f"chat-{uuid.uuid4().hex[:12]}"
    doc = {
        "session_id": session_id,
        "title": session_data.title or "New Conversation",
        "context": session_data.context or {},
        "messages": [],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    result = chat_sessions_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"success": True, "data": serialize_doc(doc), "session_id": session_id}


@router.get("/sessions")
def get_chat_sessions(limit: int = Query(20, ge=1, le=100)):
    """Get all chat sessions, ordered by most recent."""
    cursor = chat_sessions_collection.find({}).sort("updated_at", -1).limit(limit)
    docs = list(cursor)
    return {"success": True, "sessions": serialize_docs(docs)}


@router.get("/sessions/{session_id}")
def get_chat_session(session_id: str):
    """Get a single chat session with all messages."""
    doc = chat_sessions_collection.find_one({"session_id": session_id})
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
    
    session = chat_sessions_collection.find_one({"session_id": session_id})
    update_data = {
        "$push": {"messages": msg_doc},
        "$set": {"updated_at": datetime.now(timezone.utc)}
    }
    
    if session and session.get("title") == "New Conversation" and message.role == "user":
        title = message.content[:50] + "..." if len(message.content) > 50 else message.content
        update_data["$set"]["title"] = title
    
    result = chat_sessions_collection.update_one(
        {"session_id": session_id},
        update_data
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    return {"success": True, "message": msg_doc}


@router.delete("/sessions/{session_id}")
def delete_chat_session(session_id: str):
    """Delete a chat session."""
    result = chat_sessions_collection.delete_one({"session_id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return {"success": True, "message": "Session deleted"}
