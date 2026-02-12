import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from supabase import create_client, Client

# --- Configuration & Supabase Connection ---

# These will be loaded from environment variables.
# In Cloud Run, we will inject these using Secret Manager.
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Create a single Supabase client instance.
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Successfully connected to Supabase.")
except Exception as e:
    print(f"Error connecting to Supabase: {e}")
    # In a real app, you might want to handle this more gracefully.
    # For now, it will raise an error on startup if keys are missing.
    supabase = None

app = FastAPI(
    title="EKA-AI Backend API",
    description="API for Job Cards, Invoices, and other platform features.",
    version="1.0.0"
)

# --- CORS Middleware ---
# This allows your frontend (on Firebase) to talk to this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, you should restrict this to your Firebase hosting URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic Data Models (Defines the structure of our data) ---

class JobCardBase(BaseModel):
    customer_name: str
    vehicle_registration: str
    status: str = Field(default="Pending", description="e.g., Pending, In-Progress, Completed")
    details: Optional[str] = None

class JobCardCreate(JobCardBase):
    pass

class JobCard(JobCardBase):
    id: int

# --- API Endpoints ---

@app.get("/")
def read_root():
    """Root endpoint for health checks."""
    return {"status": "EKA-AI Backend is running"}


@app.post("/api/job-cards", response_model=JobCard, status_code=201)
def create_job_card(job_card: JobCardCreate):
    """
    Create a new job card.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
        
    try:
        data, count = supabase.table('job_cards').insert(job_card.dict()).execute()
        # The returned data is a list containing a dictionary
        return data[1][0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/job-cards", response_model=List[JobCard])
def get_all_job_cards():
    """
    Retrieve all job cards.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
        
    try:
        data, count = supabase.table('job_cards').select('*').order('id', desc=True).execute()
        return data[1]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/job-cards/{job_card_id}", response_model=JobCard)
def get_job_card_by_id(job_card_id: int):
    """
    Retrieve a single job card by its ID.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not available.")
        
    try:
        data, count = supabase.table('job_cards').select('*').eq('id', job_card_id).single().execute()
        if not data[1]:
            raise HTTPException(status_code=404, detail="Job Card not found")
        return data[1]
    except Exception as e:
        # Handle cases where .single() finds no record
        if "JSON object requested, but multiple rows returned" in str(e):
             raise HTTPException(status_code=500, detail="Multiple records found for single ID.")
        raise HTTPException(status_code=404, detail="Job Card not found")
