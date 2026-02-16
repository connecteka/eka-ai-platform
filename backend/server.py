"""
EKA-AI Backend API Server
A comprehensive automobile intelligence system with Job Cards, AI Chat, Invoices, and Fleet Management.

Version: 3.0.0 (Refactored with APIRouter)
"""
import os
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import database utilities
from utils.database import create_indexes, close_connection

# Import routers
from routers import auth, job_cards, chat, invoices, mg_fleet, files, dashboard, notifications, voice

# Environment
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown."""
    # Startup
    create_indexes()
    print("EKA-AI Backend started with MongoDB (Refactored v3.0)")
    yield
    # Shutdown
    close_connection()
    print("MongoDB connection closed")


# Initialize FastAPI app
app = FastAPI(
    title="EKA-AI Backend API",
    description="API for Job Cards, Invoices, AI Chat, and MG Fleet management.",
    version="3.0.0",
    lifespan=lifespan
)

# CORS Middleware - Production Secure Configuration
import os

# Get allowed origins from environment or use production defaults
ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS", 
    "https://app.eka-ai.in,https://eka-ai-platform.web.app,https://eka-ai-c9d24.web.app"
).split(",")

# Add localhost for development
if os.getenv("NODE_ENV") != "production":
    ALLOWED_ORIGINS.extend(["http://localhost:3000", "http://localhost:5173"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"],
    max_age=600,
)


# ==================== REGISTER ROUTERS ====================
app.include_router(auth.router)
app.include_router(job_cards.router)
app.include_router(chat.router)
app.include_router(invoices.router)
app.include_router(mg_fleet.router)
app.include_router(files.router)
app.include_router(dashboard.router)
app.include_router(notifications.router)
app.include_router(voice.router)


# ==================== ROOT & HEALTH ENDPOINTS ====================

@app.get("/")
def read_root():
    """Root endpoint - API status."""
    return {
        "status": "EKA-AI Backend is running",
        "version": "3.0.0",
        "database": "MongoDB",
        "ai_enabled": EMERGENT_LLM_KEY is not None,
        "architecture": "Modular APIRouter"
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/health")
def health_check_root():
    """Health check endpoint at root for Railway/load balancers."""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)


# WSGI compatibility alias (for Gunicorn)

flask_app = app

