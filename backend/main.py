import os
import uuid
import hashlib
import json
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# --- Configuration ---
PAYU_MERCHANT_KEY = os.getenv("PAYU_MERCHANT_KEY", "test_key")
PAYU_MERCHANT_SALT = os.getenv("PAYU_MERCHANT_SALT", "test_salt")
PAYU_BASE_URL = os.getenv("PAYU_BASE_URL", "https://test.payu.in/_payment")

app = FastAPI(
    title="EKA-AI Backend API",
    description="API for Job Cards, Invoices, Payments, and MG Fleet management.",
    version="2.0.0"
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== PYDANTIC MODELS ====================

class JobCardBase(BaseModel):
    customer_name: str
    vehicle_registration: str
    status: str = Field(default="Pending", description="Pending, In-Progress, Completed, Cancelled")
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

class JobCard(JobCardBase):
    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class JobCardTransition(BaseModel):
    new_status: str
    notes: Optional[str] = None

class InvoiceBase(BaseModel):
    job_card_id: int
    customer_name: str
    amount: float
    cgst: Optional[float] = 0
    sgst: Optional[float] = 0
    igst: Optional[float] = 0
    total_amount: float
    status: str = Field(default="Draft", description="Draft, Finalized, Paid, Cancelled")

class InvoiceCreate(InvoiceBase):
    pass

class Invoice(InvoiceBase):
    id: int
    invoice_number: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class PayUInitRequest(BaseModel):
    amount: float
    product_info: str
    first_name: str
    email: str
    phone: str
    plan_id: Optional[str] = "basic"

class PayUResponse(BaseModel):
    key: str
    txnid: str
    amount: float
    productinfo: str
    firstname: str
    email: str
    phone: str
    surl: str
    furl: str
    hash: str

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

class MGContract(MGContractBase):
    id: int
    status: str = "Active"
    created_at: Optional[str] = None


# ==================== API ENDPOINTS ====================

@app.get("/")
def read_root():
    """Root endpoint for health checks."""
    return {
        "status": "EKA-AI Backend is running",
        "version": "2.0.0",
        "supabase_connected": supabase is not None
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# ==================== JOB CARDS CRUD ====================

@app.post("/api/job-cards", response_model=dict, status_code=201)
def create_job_card(job_card: JobCardCreate):
    """Create a new job card."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        data = supabase.table('job_cards').insert(job_card.dict()).execute()
        return {"success": True, "data": data.data[0] if data.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/job-cards")
def get_all_job_cards(
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Retrieve all job cards with optional filtering."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        query = supabase.table('job_cards').select('*').order('id', desc=True)
        
        if status:
            query = query.eq('status', status)
        
        query = query.limit(limit).offset(offset)
        data = query.execute()
        
        return {"success": True, "data": data.data if data.data else [], "count": len(data.data) if data.data else 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/job-cards/{job_card_id}")
def get_job_card_by_id(job_card_id: int):
    """Retrieve a single job card by its ID."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        data = supabase.table('job_cards').select('*').eq('id', job_card_id).single().execute()
        if not data.data:
            raise HTTPException(status_code=404, detail="Job Card not found")
        return {"success": True, "data": data.data}
    except Exception as e:
        if "no rows" in str(e).lower() or "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Job Card not found")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.put("/api/job-cards/{job_card_id}")
def update_job_card(job_card_id: int, job_card: JobCardUpdate):
    """Update an existing job card."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        # Check if job card exists
        existing = supabase.table('job_cards').select('id').eq('id', job_card_id).single().execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Job Card not found")
        
        # Update with non-null values only
        update_data = {k: v for k, v in job_card.dict().items() if v is not None}
        update_data['updated_at'] = datetime.now().isoformat()
        
        data = supabase.table('job_cards').update(update_data).eq('id', job_card_id).execute()
        return {"success": True, "data": data.data[0] if data.data else None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.delete("/api/job-cards/{job_card_id}")
def delete_job_card(job_card_id: int):
    """Delete a job card."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        # Check if job card exists
        existing = supabase.table('job_cards').select('id').eq('id', job_card_id).single().execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Job Card not found")
        
        data = supabase.table('job_cards').delete().eq('id', job_card_id).execute()
        return {"success": True, "message": "Job Card deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.post("/api/job-cards/{job_card_id}/transition")
def transition_job_card(job_card_id: int, transition: JobCardTransition):
    """Transition a job card to a new status."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    valid_statuses = ["Pending", "In-Progress", "Completed", "Cancelled", "On-Hold"]
    if transition.new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    try:
        update_data = {
            "status": transition.new_status,
            "updated_at": datetime.now().isoformat()
        }
        if transition.notes:
            update_data["transition_notes"] = transition.notes
        
        data = supabase.table('job_cards').update(update_data).eq('id', job_card_id).execute()
        return {"success": True, "data": data.data[0] if data.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/job-cards/stats/overview")
def get_job_card_stats():
    """Get job card statistics."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        # Get counts by status
        statuses = ["Pending", "In-Progress", "Completed", "Cancelled"]
        stats = {}
        
        for status in statuses:
            count_data = supabase.table('job_cards').select('*', count='exact').eq('status', status).execute()
            stats[status.lower().replace('-', '_')] = count_data.count if hasattr(count_data, 'count') else 0
        
        # Get total
        total_data = supabase.table('job_cards').select('*', count='exact').execute()
        stats['total'] = total_data.count if hasattr(total_data, 'count') else 0
        
        return {"success": True, "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ==================== INVOICES CRUD ====================

@app.post("/api/invoices", response_model=dict, status_code=201)
def create_invoice(invoice: InvoiceCreate):
    """Create a new invoice."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        # Generate invoice number
        invoice_number = f"EKA-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        invoice_data = invoice.dict()
        invoice_data['invoice_number'] = invoice_number
        
        data = supabase.table('invoices').insert(invoice_data).execute()
        return {"success": True, "data": data.data[0] if data.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/invoices")
def get_all_invoices(
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100)
):
    """Retrieve all invoices."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        query = supabase.table('invoices').select('*').order('id', desc=True)
        if status:
            query = query.eq('status', status)
        
        data = query.limit(limit).execute()
        return {"success": True, "data": data.data if data.data else []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/invoices/{invoice_id}")
def get_invoice_by_id(invoice_id: int):
    """Get a single invoice by ID."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        data = supabase.table('invoices').select('*').eq('id', invoice_id).single().execute()
        if not data.data:
            raise HTTPException(status_code=404, detail="Invoice not found")
        return {"success": True, "data": data.data}
    except Exception as e:
        if "no rows" in str(e).lower():
            raise HTTPException(status_code=404, detail="Invoice not found")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.post("/api/invoices/{invoice_id}/finalize")
def finalize_invoice(invoice_id: int):
    """Finalize an invoice (mark as ready for payment)."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        data = supabase.table('invoices').update({
            "status": "Finalized",
            "updated_at": datetime.now().isoformat()
        }).eq('id', invoice_id).execute()
        return {"success": True, "data": data.data[0] if data.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.post("/api/invoices/{invoice_id}/pdf")
def generate_invoice_pdf(invoice_id: int):
    """Generate PDF for an invoice."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        # Get invoice data
        invoice = supabase.table('invoices').select('*').eq('id', invoice_id).single().execute()
        if not invoice.data:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # In production, this would generate a real PDF
        # For now, return a mock PDF URL
        pdf_url = f"/api/invoices/{invoice_id}/download.pdf"
        
        return {
            "success": True,
            "pdf_url": pdf_url,
            "message": "PDF generation endpoint - implement with WeasyPrint or similar"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# ==================== PAYU PAYMENT INTEGRATION ====================

@app.post("/api/subscription/payu-init")
def init_payu_payment(request: PayUInitRequest):
    """Initialize a PayU payment transaction."""
    try:
        # Generate transaction ID
        txnid = f"EKA{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:6].upper()}"
        
        # Calculate hash
        hash_string = f"{PAYU_MERCHANT_KEY}|{txnid}|{request.amount}|{request.product_info}|{request.first_name}|{request.email}|||||||||||{PAYU_MERCHANT_SALT}"
        hash_value = hashlib.sha512(hash_string.encode()).hexdigest()
        
        # Build response
        payment_data = {
            "key": PAYU_MERCHANT_KEY,
            "txnid": txnid,
            "amount": request.amount,
            "productinfo": request.product_info,
            "firstname": request.first_name,
            "email": request.email,
            "phone": request.phone,
            "surl": f"{os.environ.get('FRONTEND_URL', 'https://app.eka-ai.in')}/payment/success",
            "furl": f"{os.environ.get('FRONTEND_URL', 'https://app.eka-ai.in')}/payment/failure",
            "hash": hash_value
        }
        
        return {
            "success": True,
            "payment_url": PAYU_BASE_URL,
            "payment_data": payment_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment initialization error: {str(e)}")


@app.post("/api/payment/payu/verify")
def verify_payu_payment(
    txnid: str,
    status: str,
    hash: str
):
    """Verify PayU payment response."""
    try:
        # Verify hash
        hash_string = f"{PAYU_MERCHANT_SALT}|{status}|||||||||||{txnid}|{PAYU_MERCHANT_KEY}"
        calculated_hash = hashlib.sha512(hash_string.encode()).hexdigest()
        
        if calculated_hash.lower() != hash.lower():
            return {"success": False, "message": "Hash verification failed"}
        
        # Update payment status in database
        if supabase:
            supabase.table('payments').update({
                "status": status,
                "verified_at": datetime.now().isoformat()
            }).eq('transaction_id', txnid).execute()
        
        return {"success": True, "status": status, "txnid": txnid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification error: {str(e)}")


# ==================== MG FLEET ENDPOINTS ====================

@app.post("/api/mg/contracts", response_model=dict, status_code=201)
def create_mg_contract(contract: MGContractCreate):
    """Create a new MG Fleet contract."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        data = supabase.table('mg_contracts').insert(contract.dict()).execute()
        return {"success": True, "data": data.data[0] if data.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/mg/contracts")
def get_mg_contracts(
    status: Optional[str] = Query("Active"),
    limit: int = Query(50)
):
    """Get all MG Fleet contracts."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        query = supabase.table('mg_contracts').select('*').order('id', desc=True)
        if status:
            query = query.eq('status', status)
        
        data = query.limit(limit).execute()
        return {"success": True, "data": data.data if data.data else []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/mg/reports/{contract_id}")
def get_mg_report(contract_id: int):
    """Get utilization report for an MG contract."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        # Get contract details
        contract = supabase.table('mg_contracts').select('*').eq('id', contract_id).single().execute()
        if not contract.data:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        # Get vehicle logs
        logs = supabase.table('mg_vehicle_logs').select('*').eq('contract_id', contract_id).execute()
        
        # Calculate utilization
        total_km = sum(log.get('km_driven', 0) for log in (logs.data or []))
        monthly_limit = contract.data.get('monthly_km_limit', 1000)
        utilization_pct = (total_km / monthly_limit) * 100 if monthly_limit > 0 else 0
        
        return {
            "success": True,
            "contract_id": contract_id,
            "total_km_driven": total_km,
            "monthly_limit": monthly_limit,
            "utilization_percentage": round(utilization_pct, 2),
            "logs": logs.data or []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.post("/api/mg/vehicle-logs")
def add_vehicle_log(contract_id: int, km_driven: int, log_date: str):
    """Add a vehicle log entry for MG contract."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        data = supabase.table('mg_vehicle_logs').insert({
            "contract_id": contract_id,
            "km_driven": km_driven,
            "log_date": log_date,
            "created_at": datetime.now().isoformat()
        }).execute()
        return {"success": True, "data": data.data[0] if data.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ==================== PUBLIC APPROVAL ENDPOINT ====================

@app.get("/api/public/job-card")
def get_public_job_card(token: str):
    """Get job card details for public approval (token-based)."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        # Validate token and get job card
        # In production, tokens would be stored in a separate table with expiration
        data = supabase.table('job_cards').select('*').eq('approval_token', token).single().execute()
        if not data.data:
            raise HTTPException(status_code=404, detail="Invalid or expired token")
        
        return {"success": True, "data": data.data}
    except Exception as e:
        if "no rows" in str(e).lower():
            raise HTTPException(status_code=404, detail="Invalid or expired token")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.post("/api/public/job-card/approve")
def approve_job_card(token: str, approved: bool = True):
    """Approve or reject a job card via public token."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        status = "Customer Approved" if approved else "Customer Rejected"
        data = supabase.table('job_cards').update({
            "status": status,
            "customer_approved": approved,
            "approved_at": datetime.now().isoformat()
        }).eq('approval_token', token).execute()
        
        return {
            "success": True,
            "message": f"Job card {'approved' if approved else 'rejected'} successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ==================== DASHBOARD METRICS ====================

@app.get("/api/dashboard/metrics")
def get_dashboard_metrics():
    """Get dashboard metrics overview."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
    
    try:
        # Job cards stats
        job_cards_total = supabase.table('job_cards').select('*', count='exact').execute()
        pending_jobs = supabase.table('job_cards').select('*', count='exact').eq('status', 'Pending').execute()
        completed_jobs = supabase.table('job_cards').select('*', count='exact').eq('status', 'Completed').execute()
        
        # Revenue stats
        invoices = supabase.table('invoices').select('total_amount').eq('status', 'Paid').execute()
        total_revenue = sum(inv.get('total_amount', 0) for inv in (invoices.data or []))
        
        return {
            "success": True,
            "metrics": {
                "total_job_cards": job_cards_total.count if hasattr(job_cards_total, 'count') else 0,
                "pending_jobs": pending_jobs.count if hasattr(pending_jobs, 'count') else 0,
                "completed_jobs": completed_jobs.count if hasattr(completed_jobs, 'count') else 0,
                "total_revenue": total_revenue,
                "active_mg_contracts": 0  # Would query mg_contracts table
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
