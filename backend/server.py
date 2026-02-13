import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB Configuration
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "eka_ai_db")

# Emergent LLM Key for AI
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

# Initialize MongoDB
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
job_cards_collection = db["job_cards"]
invoices_collection = db["invoices"]
mg_contracts_collection = db["mg_contracts"]
mg_vehicle_logs_collection = db["mg_vehicle_logs"]
chat_sessions_collection = db["chat_sessions"]
users_collection = db["users"]


def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serializable format"""
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
    """Convert list of MongoDB documents"""
    return [serialize_doc(doc) for doc in docs]


# Pydantic Models
class JobCardBase(BaseModel):
    customer_name: str
    vehicle_registration: str
    status: str = Field(default="Pending")
    details: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    vehicle_model: Optional[str] = None
    estimated_cost: Optional[float] = None


class JobCardCreate(JobCardBase):
    pass


class JobCardUpdate(BaseModel):
    customer_name: Optional[str] = None
    vehicle_registration: Optional[str] = None
    status: Optional[str] = None
    details: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    vehicle_model: Optional[str] = None
    estimated_cost: Optional[float] = None


class JobCardTransition(BaseModel):
    new_status: str
    notes: Optional[str] = None


class InvoiceBase(BaseModel):
    job_card_id: str
    customer_name: str
    amount: float
    cgst: Optional[float] = 0
    sgst: Optional[float] = 0
    igst: Optional[float] = 0
    total_amount: float
    status: str = Field(default="Draft")


class InvoiceCreate(InvoiceBase):
    pass


class MGContractBase(BaseModel):
    customer_name: str
    vehicle_registration: str
    contract_type: str
    start_date: str
    end_date: str
    monthly_km_limit: int
    monthly_fee: float


class MGContractCreate(MGContractBase):
    pass


class ChatMessage(BaseModel):
    role: str
    parts: List[Dict[str, str]]


class ChatRequest(BaseModel):
    history: List[ChatMessage]
    context: Optional[Dict[str, Any]] = None
    status: Optional[str] = "CREATED"
    intelligence_mode: Optional[str] = "FAST"
    operating_mode: Optional[int] = 0


class UserLogin(BaseModel):
    email: str
    password: str


class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    workshop_name: Optional[str] = None


# Lifespan for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create indexes
    job_cards_collection.create_index("vehicle_registration")
    job_cards_collection.create_index("status")
    invoices_collection.create_index("job_card_id")
    chat_sessions_collection.create_index("user_id")
    users_collection.create_index("email", unique=True)
    print("✅ EKA-AI Backend started with MongoDB")
    yield
    # Shutdown
    client.close()
    print("❌ MongoDB connection closed")


app = FastAPI(
    title="EKA-AI Backend API",
    description="API for Job Cards, Invoices, AI Chat, and MG Fleet management.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== ROOT & HEALTH ====================

@app.get("/")
def read_root():
    return {
        "status": "EKA-AI Backend is running",
        "version": "2.0.0",
        "database": "MongoDB",
        "ai_enabled": EMERGENT_LLM_KEY is not None
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


# ==================== AI CHAT ENDPOINT ====================

@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest):
    """Main AI chat endpoint using Emergent LLM integration"""
    
    if not EMERGENT_LLM_KEY:
        return {
            "response_content": {
                "visual_text": "⚠️ AI service not configured. Please set up the EMERGENT_LLM_KEY.",
                "audio_text": "AI service unavailable."
            },
            "job_status_update": request.status,
            "ui_triggers": {"theme_color": "#FF0000", "brand_identity": "OFFLINE", "show_orange_border": False}
        }
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        # Build conversation history
        messages_text = []
        for msg in request.history:
            role = msg.role
            text = msg.parts[0].get("text", "") if msg.parts else ""
            messages_text.append(f"{role}: {text}")
        
        # Get the latest user message
        user_text = ""
        if request.history:
            last_msg = request.history[-1]
            if last_msg.role == "user" and last_msg.parts:
                user_text = last_msg.parts[0].get("text", "")
        
        # Build context-aware system prompt
        system_prompt = """You are EKA-AI, an expert automobile intelligence assistant for Go4Garage. 

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
        
        # Initialize chat with Gemini
        session_id = f"eka-chat-{uuid.uuid4().hex[:8]}"
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_prompt
        ).with_model("gemini", "gemini-2.0-flash")
        
        # Send message
        user_message = UserMessage(text=user_text)
        response_text = await chat.send_message(user_message)
        
        # Detect vehicle registration for job card trigger
        import re
        reg_pattern = r'([A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{0,2}[\s-]?\d{1,4})'
        show_orange_border = bool(re.search(reg_pattern, user_text, re.IGNORECASE))
        
        # Determine status update
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
                "visual_text": f"I apologize, but I encountered an issue processing your request. Please try again or rephrase your question.",
                "audio_text": "Error processing request."
            },
            "job_status_update": request.status,
            "ui_triggers": {"theme_color": "#F45D3D", "brand_identity": "EKA-AI", "show_orange_border": False}
        }


# ==================== AI CHAT SSE STREAMING ====================
from fastapi.responses import StreamingResponse, FileResponse
from fastapi import File, UploadFile
import asyncio
import json
import io

class ChatStreamRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None


class ChatSessionCreate(BaseModel):
    title: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class ChatMessageSave(BaseModel):
    session_id: str
    role: str
    content: str


# ==================== CHAT SESSIONS CRUD ====================

@app.post("/api/chat/sessions", status_code=201)
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


@app.get("/api/chat/sessions")
def get_chat_sessions(limit: int = Query(20, ge=1, le=100)):
    """Get all chat sessions, ordered by most recent."""
    cursor = chat_sessions_collection.find({}).sort("updated_at", -1).limit(limit)
    docs = list(cursor)
    return {"success": True, "sessions": serialize_docs(docs)}


@app.get("/api/chat/sessions/{session_id}")
def get_chat_session(session_id: str):
    """Get a single chat session with all messages."""
    doc = chat_sessions_collection.find_one({"session_id": session_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return {"success": True, "data": serialize_doc(doc)}


@app.post("/api/chat/sessions/{session_id}/messages")
def add_message_to_session(session_id: str, message: ChatMessageSave):
    """Add a message to an existing chat session."""
    msg_doc = {
        "id": uuid.uuid4().hex[:8],
        "role": message.role,
        "content": message.content,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # Update title based on first user message
    session = chat_sessions_collection.find_one({"session_id": session_id})
    update_data = {
        "$push": {"messages": msg_doc},
        "$set": {"updated_at": datetime.now(timezone.utc)}
    }
    
    # Auto-generate title from first user message
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


@app.delete("/api/chat/sessions/{session_id}")
def delete_chat_session(session_id: str):
    """Delete a chat session."""
    result = chat_sessions_collection.delete_one({"session_id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return {"success": True, "message": "Session deleted"}


@app.post("/api/chat/stream")
async def chat_stream(request: ChatStreamRequest):
    """SSE streaming endpoint for AI chat responses"""
    
    async def generate_stream():
        if not EMERGENT_LLM_KEY:
            yield f"data: {json.dumps({'type': 'error', 'content': 'AI service not configured'})}\n\n"
            return
        
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            # Build system prompt
            system_prompt = """You are EKA-AI, an expert automobile intelligence assistant for Go4Garage. 
            
Your expertise includes vehicle diagnostics, job card management, service estimates, and MG Fleet management.
Be professional yet friendly. Provide accurate automotive advice with cost estimates in INR when relevant."""
            
            if request.context:
                system_prompt += f"\n\nVehicle Context: {json.dumps(request.context)}"
            
            # Initialize chat
            session_id = request.session_id or f"eka-stream-{uuid.uuid4().hex[:8]}"
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=session_id,
                system_message=system_prompt
            ).with_model("gemini", "gemini-2.0-flash")
            
            # Send start event
            yield f"data: {json.dumps({'type': 'start', 'session_id': session_id})}\n\n"
            
            # Get full response
            user_message = UserMessage(text=request.message)
            response_text = await chat.send_message(user_message)
            
            # Stream response character by character (simulated streaming)
            words = response_text.split(' ')
            buffer = ""
            
            for i, word in enumerate(words):
                buffer += word + " "
                # Send chunks of ~5 words
                if (i + 1) % 5 == 0 or i == len(words) - 1:
                    yield f"data: {json.dumps({'type': 'chunk', 'content': buffer})}\n\n"
                    buffer = ""
                    await asyncio.sleep(0.05)  # Small delay for streaming effect
            
            # Detect vehicle registration
            import re
            reg_pattern = r'([A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{0,2}[\s-]?\d{1,4})'
            show_orange_border = bool(re.search(reg_pattern, request.message, re.IGNORECASE))
            
            # Send completion event
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


# ==================== JOB CARDS CRUD ====================

# Stats endpoint must come before the {job_card_id} route
@app.get("/api/job-cards/stats/overview")
@app.get("/api/job-cards/stats")
def get_job_card_stats():
    """Get job card statistics."""
    # Count by various status names (supporting both old and new status naming)
    total = job_cards_collection.count_documents({})
    
    # Count pending (multiple possible names)
    pending = job_cards_collection.count_documents({
        "status": {"$in": ["Pending", "CREATED", "pending"]}
    })
    
    # Count in-progress
    in_progress = job_cards_collection.count_documents({
        "status": {"$in": ["In-Progress", "IN_PROGRESS", "in_progress", "DIAGNOSED", "ESTIMATED"]}
    })
    
    # Count completed
    completed = job_cards_collection.count_documents({
        "status": {"$in": ["Completed", "CLOSED", "completed", "INVOICED"]}
    })
    
    # Count cancelled
    cancelled = job_cards_collection.count_documents({
        "status": {"$in": ["Cancelled", "CANCELLED", "cancelled"]}
    })
    
    # Active = pending + in_progress
    active = pending + in_progress
    
    # Detailed status breakdown
    by_status = {
        "CUSTOMER_APPROVAL": job_cards_collection.count_documents({"status": "CUSTOMER_APPROVAL"}),
        "PDI": job_cards_collection.count_documents({"status": "PDI"}),
        "PDI_COMPLETED": job_cards_collection.count_documents({"status": "PDI_COMPLETED"}),
        "CREATED": job_cards_collection.count_documents({"status": {"$in": ["CREATED", "Pending"]}}),
        "IN_PROGRESS": job_cards_collection.count_documents({"status": {"$in": ["IN_PROGRESS", "In-Progress"]}}),
        "COMPLETED": job_cards_collection.count_documents({"status": {"$in": ["CLOSED", "Completed"]}}),
    }
    
    stats = {
        "total": total,
        "pending": pending,
        "in_progress": in_progress,
        "completed": completed,
        "cancelled": cancelled,
        "active": active,
        "by_status": by_status
    }
    
    return {"success": True, "data": stats, **stats}


@app.post("/api/job-cards", status_code=201)
def create_job_card(job_card: JobCardCreate):
    """Create a new job card."""
    doc = job_card.model_dump()
    doc["created_at"] = datetime.now(timezone.utc)
    doc["updated_at"] = datetime.now(timezone.utc)
    result = job_cards_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"success": True, "data": serialize_doc(doc)}


@app.get("/api/job-cards")
def get_all_job_cards(
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Retrieve all job cards with optional filtering."""
    query = {}
    if status:
        query["status"] = status
    
    cursor = job_cards_collection.find(query).sort("created_at", -1).skip(offset).limit(limit)
    docs = list(cursor)
    total = job_cards_collection.count_documents(query)
    
    # Return in format expected by frontend
    return {
        "success": True, 
        "data": serialize_docs(docs), 
        "job_cards": serialize_docs(docs),  # For frontend compatibility
        "count": len(docs), 
        "total": total
    }


@app.get("/api/job-cards/{job_card_id}")
def get_job_card_by_id(job_card_id: str):
    """Retrieve a single job card by ID."""
    try:
        doc = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job card ID format")
    
    if not doc:
        raise HTTPException(status_code=404, detail="Job Card not found")
    return {"success": True, "data": serialize_doc(doc)}


@app.put("/api/job-cards/{job_card_id}")
def update_job_card(job_card_id: str, job_card: JobCardUpdate):
    """Update an existing job card."""
    try:
        existing = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job card ID format")
    
    if not existing:
        raise HTTPException(status_code=404, detail="Job Card not found")
    
    update_data = {k: v for k, v in job_card.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    job_cards_collection.update_one({"_id": ObjectId(job_card_id)}, {"$set": update_data})
    updated = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
    
    return {"success": True, "data": serialize_doc(updated)}


@app.delete("/api/job-cards/{job_card_id}")
def delete_job_card(job_card_id: str):
    """Delete a job card."""
    try:
        result = job_cards_collection.delete_one({"_id": ObjectId(job_card_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job card ID format")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job Card not found")
    
    return {"success": True, "message": "Job Card deleted successfully"}


@app.post("/api/job-cards/{job_card_id}/transition")
def transition_job_card(job_card_id: str, transition: JobCardTransition):
    """Transition a job card to a new status."""
    valid_statuses = ["Pending", "In-Progress", "Completed", "Cancelled", "On-Hold", 
                     "CREATED", "CONTEXT_VERIFIED", "DIAGNOSED", "ESTIMATED", 
                     "CUSTOMER_APPROVAL", "IN_PROGRESS", "PDI", "INVOICED", "CLOSED"]
    
    if transition.new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status")
    
    try:
        update_data = {
            "status": transition.new_status,
            "updated_at": datetime.now(timezone.utc)
        }
        if transition.notes:
            update_data["transition_notes"] = transition.notes
        
        result = job_cards_collection.update_one(
            {"_id": ObjectId(job_card_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Job Card not found")
        
        updated = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
        return {"success": True, "data": serialize_doc(updated)}
    except HTTPException:
        raise
    except:
        raise HTTPException(status_code=400, detail="Invalid job card ID format")


# ==================== INVOICES CRUD ====================

@app.post("/api/invoices", status_code=201)
def create_invoice(invoice: InvoiceCreate):
    """Create a new invoice."""
    invoice_number = f"EKA-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    doc = invoice.model_dump()
    doc["invoice_number"] = invoice_number
    doc["created_at"] = datetime.now(timezone.utc)
    doc["updated_at"] = datetime.now(timezone.utc)
    
    result = invoices_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"success": True, "data": serialize_doc(doc)}


@app.get("/api/invoices")
def get_all_invoices(
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100)
):
    """Retrieve all invoices."""
    query = {}
    if status:
        query["status"] = status
    
    cursor = invoices_collection.find(query).sort("created_at", -1).limit(limit)
    docs = list(cursor)
    
    return {"success": True, "data": serialize_docs(docs)}


@app.get("/api/invoices/{invoice_id}")
def get_invoice_by_id(invoice_id: str):
    """Get a single invoice by ID."""
    try:
        doc = invoices_collection.find_one({"_id": ObjectId(invoice_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid invoice ID format")
    
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"success": True, "data": serialize_doc(doc)}


@app.get("/api/invoices/{invoice_id}/pdf")
def generate_invoice_pdf(invoice_id: str):
    """Generate PDF for an invoice."""
    try:
        doc = invoices_collection.find_one({"_id": ObjectId(invoice_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid invoice ID format")
    
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Generate PDF using reportlab
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch, cm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
        from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
        
        buffer = io.BytesIO()
        pdf = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=1*cm, leftMargin=1*cm, topMargin=1*cm, bottomMargin=1*cm)
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, alignment=TA_CENTER, textColor=colors.HexColor('#F45D3D'))
        normal_style = styles['Normal']
        
        elements = []
        
        # Header
        elements.append(Paragraph("EKA-AI", title_style))
        elements.append(Paragraph("Go4Garage Private Limited", ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=12, alignment=TA_CENTER, textColor=colors.gray)))
        elements.append(Spacer(1, 0.5*inch))
        
        # Invoice Title
        elements.append(Paragraph(f"TAX INVOICE", ParagraphStyle('InvTitle', parent=styles['Heading2'], fontSize=16, alignment=TA_CENTER)))
        elements.append(Spacer(1, 0.25*inch))
        
        # Invoice Details
        invoice_number = doc.get('invoice_number', f"INV-{invoice_id[:8].upper()}")
        created_at = doc.get('created_at', datetime.now(timezone.utc))
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        
        details_data = [
            ['Invoice Number:', invoice_number, 'Date:', created_at.strftime('%d/%m/%Y')],
            ['Customer:', doc.get('customer_name', 'N/A'), 'Status:', doc.get('status', 'Draft')],
            ['GSTIN:', doc.get('customer_gstin', 'N/A'), 'Job Card:', doc.get('job_card_id', 'N/A')[:8] if doc.get('job_card_id') else 'N/A']
        ]
        
        details_table = Table(details_data, colWidths=[2*cm, 6*cm, 2*cm, 6*cm])
        details_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(details_table)
        elements.append(Spacer(1, 0.5*inch))
        
        # Line Items Table
        items = doc.get('items', [])
        if items:
            header = ['Description', 'HSN/SAC', 'Qty', 'Rate (₹)', 'GST %', 'Amount (₹)']
            table_data = [header]
            
            for item in items:
                row = [
                    item.get('description', 'N/A')[:40],
                    item.get('hsn_sac_code', '-'),
                    str(item.get('quantity', 1)),
                    f"{item.get('unit_price', 0):,.2f}",
                    f"{item.get('gst_rate', 18)}%",
                    f"{item.get('total_amount', 0):,.2f}"
                ]
                table_data.append(row)
            
            items_table = Table(table_data, colWidths=[6*cm, 2*cm, 1.5*cm, 2.5*cm, 1.5*cm, 3*cm])
            items_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F45D3D')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
            ]))
            elements.append(items_table)
        
        elements.append(Spacer(1, 0.3*inch))
        
        # Totals
        taxable = doc.get('total_taxable_value', doc.get('amount', 0))
        cgst = doc.get('cgst', 0)
        sgst = doc.get('sgst', 0)
        igst = doc.get('igst', 0)
        total_tax = cgst + sgst + igst
        grand_total = doc.get('total_amount', taxable + total_tax)
        
        totals_data = [
            ['', 'Taxable Value:', f"₹ {taxable:,.2f}"],
            ['', 'CGST:', f"₹ {cgst:,.2f}"],
            ['', 'SGST:', f"₹ {sgst:,.2f}"],
            ['', 'IGST:', f"₹ {igst:,.2f}"],
            ['', 'Grand Total:', f"₹ {grand_total:,.2f}"],
        ]
        
        totals_table = Table(totals_data, colWidths=[10*cm, 3*cm, 3.5*cm])
        totals_table.setStyle(TableStyle([
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTSIZE', (1, -1), (-1, -1), 12),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('TEXTCOLOR', (1, -1), (-1, -1), colors.HexColor('#F45D3D')),
            ('LINEABOVE', (1, -1), (-1, -1), 1, colors.black),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(totals_table)
        elements.append(Spacer(1, 0.5*inch))
        
        # Footer
        footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, alignment=TA_CENTER, textColor=colors.gray)
        elements.append(Paragraph("This is a computer-generated invoice.", footer_style))
        elements.append(Paragraph("Thank you for your business!", footer_style))
        elements.append(Paragraph("EKA-AI | Go4Garage Private Limited | GSTIN: 27AAAAA0000A1Z5", footer_style))
        
        pdf.build(elements)
        buffer.seek(0)
        
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=invoice-{invoice_number}.pdf"
            }
        )
        
    except ImportError:
        raise HTTPException(status_code=500, detail="PDF generation library not installed. Run: pip install reportlab")
    except Exception as e:
        print(f"PDF Generation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")


@app.post("/api/invoices/{invoice_id}/mark-paid")
def mark_invoice_paid(invoice_id: str):
    """Mark an invoice as paid."""
    try:
        result = invoices_collection.update_one(
            {"_id": ObjectId(invoice_id)},
            {"$set": {"status": "PAID", "paid_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        updated = invoices_collection.find_one({"_id": ObjectId(invoice_id)})
        return {"success": True, "data": serialize_doc(updated)}
    except HTTPException:
        raise
    except:
        raise HTTPException(status_code=400, detail="Invalid invoice ID format")


@app.post("/api/invoices/{invoice_id}/finalize")
def finalize_invoice(invoice_id: str):
    """Finalize an invoice."""
    try:
        result = invoices_collection.update_one(
            {"_id": ObjectId(invoice_id)},
            {"$set": {"status": "Finalized", "updated_at": datetime.now(timezone.utc)}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        updated = invoices_collection.find_one({"_id": ObjectId(invoice_id)})
        return {"success": True, "data": serialize_doc(updated)}
    except HTTPException:
        raise
    except:
        raise HTTPException(status_code=400, detail="Invalid invoice ID format")


# ==================== MG FLEET ENDPOINTS ====================

@app.post("/api/mg/contracts", status_code=201)
def create_mg_contract(contract: MGContractCreate):
    """Create a new MG Fleet contract."""
    doc = contract.model_dump()
    doc["status"] = "Active"
    doc["created_at"] = datetime.now(timezone.utc)
    
    result = mg_contracts_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"success": True, "data": serialize_doc(doc)}


@app.get("/api/mg/contracts")
def get_mg_contracts(
    status: Optional[str] = Query("Active"),
    limit: int = Query(50)
):
    """Get all MG Fleet contracts."""
    query = {}
    if status:
        query["status"] = status
    
    cursor = mg_contracts_collection.find(query).sort("created_at", -1).limit(limit)
    docs = list(cursor)
    
    return {"success": True, "data": serialize_docs(docs)}


@app.get("/api/mg/reports/{contract_id}")
def get_mg_report(contract_id: str):
    """Get utilization report for an MG contract."""
    try:
        contract = mg_contracts_collection.find_one({"_id": ObjectId(contract_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid contract ID format")
    
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    logs = list(mg_vehicle_logs_collection.find({"contract_id": contract_id}))
    total_km = sum(log.get("km_driven", 0) for log in logs)
    monthly_limit = contract.get("monthly_km_limit", 1000)
    utilization_pct = (total_km / monthly_limit) * 100 if monthly_limit > 0 else 0
    
    return {
        "success": True,
        "contract_id": contract_id,
        "total_km_driven": total_km,
        "monthly_limit": monthly_limit,
        "utilization_percentage": round(utilization_pct, 2),
        "logs": serialize_docs(logs)
    }


# ==================== DASHBOARD METRICS ====================

@app.get("/api/dashboard/metrics")
def get_dashboard_metrics():
    """Get dashboard metrics overview."""
    total_jobs = job_cards_collection.count_documents({})
    pending_jobs = job_cards_collection.count_documents({"status": {"$in": ["Pending", "CREATED"]}})
    completed_jobs = job_cards_collection.count_documents({"status": {"$in": ["Completed", "CLOSED"]}})
    in_progress = job_cards_collection.count_documents({"status": {"$in": ["In-Progress", "IN_PROGRESS"]}})
    
    # Revenue calculation
    paid_invoices = list(invoices_collection.find({"status": "Paid"}))
    total_revenue = sum(inv.get("total_amount", 0) for inv in paid_invoices)
    
    # Active MG contracts
    active_contracts = mg_contracts_collection.count_documents({"status": "Active"})
    
    return {
        "success": True,
        "metrics": {
            "total_job_cards": total_jobs,
            "pending_jobs": pending_jobs,
            "completed_jobs": completed_jobs,
            "in_progress": in_progress,
            "total_revenue": total_revenue,
            "active_mg_contracts": active_contracts
        }
    }


# ==================== AUTH ENDPOINTS ====================
import httpx
from fastapi import Response, Cookie, Request

# User sessions collection
user_sessions_collection = db["user_sessions"]


class GoogleAuthSession(BaseModel):
    session_id: str


@app.post("/api/auth/google/session")
async def process_google_session(session_data: GoogleAuthSession, response: Response):
    """
    Process Google OAuth session_id from Emergent Auth.
    Exchanges session_id for user data and creates a persistent session.
    """
    try:
        # Call Emergent Auth to get user data
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
        
        # Check if user exists, create or update
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
            # Create new user with custom user_id
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
        
        # Create session with 7 day expiry
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        # Delete any existing sessions for this user
        user_sessions_collection.delete_many({"user_id": user_id})
        
        # Create new session
        user_sessions_collection.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc)
        })
        
        # Set httpOnly cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7 * 24 * 60 * 60  # 7 days in seconds
        )
        
        # Get user data to return
        user_doc = users_collection.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
        
        return {
            "success": True,
            "user": user_doc,
            "token": session_token
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Google Auth Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


@app.get("/api/auth/me")
async def get_current_user(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Get current authenticated user.
    Checks session_token from cookie first, then Authorization header.
    """
    token = session_token
    
    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session
    session_doc = user_sessions_collection.find_one({"session_token": token}, {"_id": 0})
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry with timezone awareness
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        user_sessions_collection.delete_one({"session_token": token})
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user_id = session_doc.get("user_id")
    user_doc = users_collection.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user_doc


@app.post("/api/auth/logout")
async def logout_user(
    request: Request,
    response: Response,
    session_token: Optional[str] = Cookie(None)
):
    """Logout user and clear session."""
    token = session_token
    
    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if token:
        user_sessions_collection.delete_one({"session_token": token})
    
    # Clear cookie
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="none"
    )
    
    return {"success": True, "message": "Logged out successfully"}


@app.post("/api/auth/register")
def register_user(user: UserRegister, response: Response):
    """Register a new user with email/password."""
    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user with custom user_id
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    
    doc = {
        "user_id": user_id,
        "email": user.email,
        "password": user.password,  # In production, hash this!
        "name": user.name,
        "workshop_name": user.workshop_name,
        "role": "user",
        "auth_provider": "email",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    users_collection.insert_one(doc)
    
    # Create session
    session_token = f"email_session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
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
    
    # Return user without password
    user_doc = users_collection.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    
    return {"success": True, "user": user_doc, "token": session_token}


@app.post("/api/auth/login")
def login_user(credentials: UserLogin, response: Response):
    """Login user with email/password."""
    user = users_collection.find_one({"email": credentials.email})
    
    if not user or user.get("password") != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_id = user.get("user_id")
    
    # If user doesn't have user_id (legacy), create one
    if not user_id:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        users_collection.update_one(
            {"email": credentials.email},
            {"$set": {"user_id": user_id}}
        )
    
    # Delete old sessions and create new one
    user_sessions_collection.delete_many({"user_id": user_id})
    
    session_token = f"email_session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
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
    
    user_data = users_collection.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    
    return {
        "success": True,
        "user": user_data,
        "token": session_token
    }


# ==================== FILE UPLOAD ENDPOINTS ====================
import os
import shutil
from pathlib import Path

# Create uploads directory
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Files collection
files_collection = db["files"]

ALLOWED_EXTENSIONS = {
    'image': ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    'document': ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'],
    'video': ['mp4', 'mov', 'avi', 'webm'],
}

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


def get_file_type(filename: str) -> str:
    """Determine file type from extension."""
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    for file_type, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return file_type
    return 'other'


from fastapi import Form as FastAPIForm

@app.post("/api/files/upload")
async def upload_file(
    file: UploadFile = File(...),
    job_card_id: Optional[str] = FastAPIForm(None),
    category: Optional[str] = FastAPIForm(None)
):
    """Upload a file (image, document, or video)."""
    
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    # Check extension
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    all_extensions = [e for exts in ALLOWED_EXTENSIONS.values() for e in exts]
    if ext not in all_extensions:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed: {', '.join(all_extensions)}")
    
    # Generate unique filename
    file_id = uuid.uuid4().hex
    safe_filename = f"{file_id}.{ext}"
    file_path = UPLOAD_DIR / safe_filename
    
    # Save file
    try:
        content = await file.read()
        
        # Check file size
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"File too large. Max size: {MAX_FILE_SIZE // (1024*1024)}MB")
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Create file record
        file_doc = {
            "file_id": file_id,
            "original_name": file.filename,
            "stored_name": safe_filename,
            "file_type": get_file_type(file.filename),
            "extension": ext,
            "size": len(content),
            "mime_type": file.content_type,
            "job_card_id": job_card_id,
            "category": category or "general",
            "uploaded_at": datetime.now(timezone.utc),
            "url": f"/api/files/{file_id}"
        }
        
        result = files_collection.insert_one(file_doc)
        file_doc["_id"] = result.inserted_id
        
        return {
            "success": True,
            "file": serialize_doc(file_doc),
            "url": f"/api/files/{file_id}",
            "file_id": file_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        # Clean up on error
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/api/files/{file_id}")
async def get_file(file_id: str):
    """Retrieve a file by ID."""
    file_doc = files_collection.find_one({"file_id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = UPLOAD_DIR / file_doc["stored_name"]
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        path=file_path,
        filename=file_doc["original_name"],
        media_type=file_doc.get("mime_type", "application/octet-stream")
    )


@app.get("/api/files")
def list_files(
    job_card_id: Optional[str] = None,
    category: Optional[str] = None,
    file_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100)
):
    """List uploaded files with optional filtering."""
    query = {}
    if job_card_id:
        query["job_card_id"] = job_card_id
    if category:
        query["category"] = category
    if file_type:
        query["file_type"] = file_type
    
    cursor = files_collection.find(query).sort("uploaded_at", -1).limit(limit)
    docs = list(cursor)
    
    return {"success": True, "files": serialize_docs(docs), "count": len(docs)}


@app.delete("/api/files/{file_id}")
def delete_file(file_id: str):
    """Delete a file."""
    file_doc = files_collection.find_one({"file_id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete from disk
    file_path = UPLOAD_DIR / file_doc["stored_name"]
    if file_path.exists():
        file_path.unlink()
    
    # Delete from database
    files_collection.delete_one({"file_id": file_id})
    
    return {"success": True, "message": "File deleted"}


@app.post("/api/files/upload-chunk")
async def upload_file_chunk(
    chunk: UploadFile = File(...),
    file_id: str = None,
    chunk_number: int = 0,
    total_chunks: int = 1,
    original_name: str = None
):
    """Upload file in chunks for large files."""
    
    # Create temp directory for chunks
    chunks_dir = UPLOAD_DIR / "chunks" / file_id
    chunks_dir.mkdir(parents=True, exist_ok=True)
    
    # Save chunk
    chunk_path = chunks_dir / f"chunk_{chunk_number}"
    content = await chunk.read()
    
    with open(chunk_path, "wb") as f:
        f.write(content)
    
    # Check if all chunks uploaded
    existing_chunks = list(chunks_dir.glob("chunk_*"))
    
    if len(existing_chunks) == total_chunks:
        # Combine chunks
        ext = original_name.rsplit('.', 1)[-1].lower() if original_name and '.' in original_name else 'bin'
        final_filename = f"{file_id}.{ext}"
        final_path = UPLOAD_DIR / final_filename
        
        with open(final_path, "wb") as outfile:
            for i in range(total_chunks):
                chunk_file = chunks_dir / f"chunk_{i}"
                with open(chunk_file, "rb") as infile:
                    outfile.write(infile.read())
        
        # Get final file size
        final_size = final_path.stat().st_size
        
        # Clean up chunks
        shutil.rmtree(chunks_dir)
        
        # Create file record
        file_doc = {
            "file_id": file_id,
            "original_name": original_name or f"file.{ext}",
            "stored_name": final_filename,
            "file_type": get_file_type(original_name or ""),
            "extension": ext,
            "size": final_size,
            "uploaded_at": datetime.now(timezone.utc),
            "url": f"/api/files/{file_id}"
        }
        
        files_collection.insert_one(file_doc)
        
        return {
            "success": True,
            "complete": True,
            "file_id": file_id,
            "url": f"/api/files/{file_id}"
        }
    
    return {
        "success": True,
        "complete": False,
        "chunks_received": len(existing_chunks),
        "total_chunks": total_chunks
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
