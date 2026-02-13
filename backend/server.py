import os
import uuid
from datetime import datetime, timezone
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


# ==================== AUTH ENDPOINTS (Simple) ====================

@app.post("/api/auth/register")
def register_user(user: UserRegister):
    """Register a new user."""
    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    doc = user.model_dump()
    doc["created_at"] = datetime.now(timezone.utc)
    doc["role"] = "user"
    
    result = users_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    del doc["password"]  # Don't return password
    
    return {"success": True, "user": serialize_doc(doc)}


@app.post("/api/auth/login")
def login_user(credentials: UserLogin):
    """Login user (simplified - no JWT for demo)."""
    user = users_collection.find_one({"email": credentials.email})
    
    if not user or user.get("password") != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_data = serialize_doc(user)
    del user_data["password"]
    
    return {
        "success": True,
        "user": user_data,
        "token": f"demo-token-{user_data['id']}"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
