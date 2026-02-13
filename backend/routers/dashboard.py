"""
Dashboard routes for EKA-AI Backend.
Handles dashboard metrics and analytics.
"""
from fastapi import APIRouter

from utils.database import job_cards_collection, invoices_collection, mg_contracts_collection

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/metrics")
def get_dashboard_metrics():
    """Get dashboard metrics overview."""
    total_jobs = job_cards_collection.count_documents({})
    pending_jobs = job_cards_collection.count_documents({"status": {"$in": ["Pending", "CREATED"]}})
    completed_jobs = job_cards_collection.count_documents({"status": {"$in": ["Completed", "CLOSED"]}})
    in_progress = job_cards_collection.count_documents({"status": {"$in": ["In-Progress", "IN_PROGRESS"]}})
    
    paid_invoices = list(invoices_collection.find({"status": "Paid"}))
    total_revenue = sum(inv.get("total_amount", 0) for inv in paid_invoices)
    
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
