"""
Pydantic models/schemas for the EKA-AI Backend API.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ==================== JOB CARDS ====================

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


# ==================== INVOICES ====================

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


# ==================== MG FLEET ====================

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


# ==================== CHAT ====================

class ChatMessage(BaseModel):
    role: str
    parts: List[Dict[str, str]]


class ChatRequest(BaseModel):
    history: List[ChatMessage]
    context: Optional[Dict[str, Any]] = None
    status: Optional[str] = "CREATED"
    intelligence_mode: Optional[str] = "FAST"
    operating_mode: Optional[int] = 0


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


# ==================== AUTH ====================

class UserLogin(BaseModel):
    email: str
    password: str


class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    workshop_name: Optional[str] = None


class GoogleAuthSession(BaseModel):
    session_id: str
