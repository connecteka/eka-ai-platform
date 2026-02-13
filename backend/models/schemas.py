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


# ==================== JOB CARD DETAIL (Extended) ====================

class VehicleInfo(BaseModel):
    registration_number: str
    make: str
    model: str
    variant: Optional[str] = None
    year: int
    fuel_type: str
    chassis_vin: Optional[str] = None
    engine_number: Optional[str] = None
    odometer_reading: int
    color: str
    insurance_valid_till: Optional[str] = None
    puc_valid_till: Optional[str] = None
    last_service_date: Optional[str] = None
    last_service_km: Optional[int] = None
    tyre_condition: Optional[str] = None


class CustomerInfo(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    total_visits: int = 0
    lifetime_value: float = 0
    rating: float = 0
    member_since: Optional[str] = None
    preferences: List[str] = []


class ServiceItem(BaseModel):
    id: str
    service_type: str
    description: str
    technician: str
    priority: str = "normal"
    status: str = "queued"
    estimated_time: str
    actual_time: Optional[str] = None
    cost: float = 0


class PartItem(BaseModel):
    id: str
    name: str
    part_number: str
    category: str
    quantity: str
    unit_price: float
    total: float
    warranty: Optional[str] = None
    availability: str = "in-stock"
    availability_note: Optional[str] = None


class PaymentInfo(BaseModel):
    subtotal: float
    discounts: List[Dict[str, Any]] = []
    cgst: float = 0
    sgst: float = 0
    igst: float = 0
    grand_total: float
    amount_paid: float = 0
    balance_due: float = 0
    payment_status: str = "pending"
    payment_mode: Optional[str] = None
    transaction_id: Optional[str] = None
    paid_on: Optional[str] = None


class TimelineEntry(BaseModel):
    id: str
    timestamp: str
    description: str
    actor: str
    status: str = "completed"


class InternalNote(BaseModel):
    id: str
    author: str
    timestamp: str
    text: str
    is_ai: bool = False
    attachments: List[str] = []


class InternalNoteCreate(BaseModel):
    text: str
    author: str
    attachments: List[str] = []


class SignatureData(BaseModel):
    job_card_id: str
    signature_image: str  # Base64 encoded PNG
    customer_name: str
    verified_via: str = "manual"  # manual, otp, digital
    otp_verified: bool = False
    ip_address: Optional[str] = None


class JobCardDetailResponse(BaseModel):
    id: str
    job_card_number: str
    status: str
    priority: str = "normal"
    created_at: str
    updated_at: str
    created_by: str
    bay_number: Optional[str] = None
    technician: Optional[str] = None
    promised_delivery: Optional[str] = None
    
    vehicle: VehicleInfo
    customer: CustomerInfo
    services: List[ServiceItem] = []
    parts: List[PartItem] = []
    payment: PaymentInfo
    timeline: List[TimelineEntry] = []
    notes: List[InternalNote] = []
    
    pre_inspection: Dict[str, Any] = {}
    photos: List[str] = []
    documents: List[Dict[str, Any]] = []
    related_job_cards: List[Dict[str, Any]] = []
    
    approval_status: str = "pending"
    signature: Optional[Dict[str, Any]] = None
    feedback: Optional[Dict[str, Any]] = None


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
