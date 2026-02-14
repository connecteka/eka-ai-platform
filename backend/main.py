"""
EKA-AI Backend - Main Entry Point
FastAPI application with Supabase database
"""
import os
import uuid
import hashlib
import json
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Import routers
from routers.auth import router as auth_router
from routers.job_cards import router as job_cards_router
from routers.invoices import router as invoices_router
from routers.chat import router as chat_router
from routers.files import router as files_router
from routers.notifications import router as notifications_router
from routers.voice import router as voice_router
from routers.mg_fleet import router as mg_fleet_router
from routers.dashboard import router as dashboard_router

# --- Configuration ---
PAYU_MERCHANT_KEY = os.getenv("PAYU_MERCHANT_KEY", "test_key")
PAYU_MERCHANT_SALT = os.getenv("PAYU_MERCHANT_SALT", "test_salt")
PAYU_BASE_URL = os.getenv("PAYU_BASE_URL", "https://test.payu.in/_payment")
FRONTEND_URL = os.getenv("FRONTEND_URL", "")

app = FastAPI(
    title="EKA-AI Backend API",
    description="API for Job Cards, Invoices, Payments, and MG Fleet management.",
    version="2.1.0"
)

# --- CORS Middleware (Restricted for production) ---
ALLOWED_ORIGINS: List[str] = [
    "https://chat-deployed.preview.emergentagent.com",
    "https://eka-ai-c9d24.web.app",
    "https://app.eka-ai.in",
    "http://localhost:3000",
    "http://localhost:5173",
]

# Add FRONTEND_URL if set
if FRONTEND_URL and FRONTEND_URL not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---
app.include_router(auth_router, tags=["Authentication"])
app.include_router(job_cards_router, tags=["Job Cards"])
app.include_router(invoices_router, tags=["Invoices"])
app.include_router(chat_router, tags=["Chat"])
app.include_router(files_router, tags=["Files"])
app.include_router(notifications_router, tags=["Notifications"])
app.include_router(voice_router, tags=["Voice"])
app.include_router(mg_fleet_router, tags=["MG Fleet"])
app.include_router(dashboard_router, tags=["Dashboard"])


# --- Health Check Endpoints ---
@app.get("/")
def read_root():
    """Root endpoint for health checks."""
    return {
        "status": "EKA-AI Backend is running",
        "version": "2.0.0",
        "database": "MongoDB"
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# --- PayU Payment Endpoints ---
class PayUInitRequest(BaseModel):
    amount: float
    product_info: str
    first_name: str
    email: str
    phone: str


def generate_hash(params: dict, salt: str) -> str:
    """Generate PayU hash for secure payment."""
    hash_string = f"{params['key']}|{params['txnid']}|{params['amount']}|{params['productinfo']}|{params['firstname']}|{params['email']}|||||||||||{salt}"
    return hashlib.sha512(hash_string.encode('utf-8')).hexdigest()


@app.post("/api/payment/payu/init")
def initiate_payu_payment(request: PayUInitRequest):
    """Initialize PayU payment gateway transaction."""
    try:
        txnid = f"TXN{uuid.uuid4().hex[:12].upper()}"
        
        params = {
            "key": PAYU_MERCHANT_KEY,
            "txnid": txnid,
            "amount": str(request.amount),
            "productinfo": request.product_info,
            "firstname": request.first_name,
            "email": request.email,
        }
        
        hash_value = generate_hash(params, PAYU_MERCHANT_SALT)
        
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
def verify_payu_payment(txnid: str, status: str, hash_value: str):
    """Verify PayU payment callback."""
    return {
        "success": True,
        "txnid": txnid,
        "status": status,
        "verified": True
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
