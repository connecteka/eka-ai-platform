"""
Job Cards routes for EKA-AI Backend.
Handles CRUD operations for workshop job cards.
"""
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId

from models.schemas import JobCardCreate, JobCardUpdate, JobCardTransition
from utils.database import job_cards_collection, serialize_doc, serialize_docs

router = APIRouter(prefix="/api/job-cards", tags=["Job Cards"])


@router.get("/stats/overview")
@router.get("/stats")
def get_job_card_stats():
    """Get job card statistics."""
    total = job_cards_collection.count_documents({})
    
    pending = job_cards_collection.count_documents({
        "status": {"$in": ["Pending", "CREATED", "pending"]}
    })
    
    in_progress = job_cards_collection.count_documents({
        "status": {"$in": ["In-Progress", "IN_PROGRESS", "in_progress", "DIAGNOSED", "ESTIMATED"]}
    })
    
    completed = job_cards_collection.count_documents({
        "status": {"$in": ["Completed", "CLOSED", "completed", "INVOICED"]}
    })
    
    cancelled = job_cards_collection.count_documents({
        "status": {"$in": ["Cancelled", "CANCELLED", "cancelled"]}
    })
    
    active = pending + in_progress
    
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


@router.post("", status_code=201)
def create_job_card(job_card: JobCardCreate):
    """Create a new job card."""
    doc = job_card.model_dump()
    doc["created_at"] = datetime.now(timezone.utc)
    doc["updated_at"] = datetime.now(timezone.utc)
    result = job_cards_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"success": True, "data": serialize_doc(doc)}


@router.get("")
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
    
    return {
        "success": True, 
        "data": serialize_docs(docs), 
        "job_cards": serialize_docs(docs),
        "count": len(docs), 
        "total": total
    }


@router.get("/{job_card_id}")
def get_job_card_by_id(job_card_id: str):
    """Retrieve a single job card by ID."""
    try:
        doc = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job card ID format")
    
    if not doc:
        raise HTTPException(status_code=404, detail="Job Card not found")
    return {"success": True, "data": serialize_doc(doc)}


@router.put("/{job_card_id}")
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


@router.delete("/{job_card_id}")
def delete_job_card(job_card_id: str):
    """Delete a job card."""
    try:
        result = job_cards_collection.delete_one({"_id": ObjectId(job_card_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job card ID format")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job Card not found")
    
    return {"success": True, "message": "Job Card deleted successfully"}


@router.post("/{job_card_id}/transition")
def transition_job_card(job_card_id: str, transition: JobCardTransition):
    """Transition a job card to a new status."""
    valid_statuses = [
        "Pending", "In-Progress", "Completed", "Cancelled", "On-Hold",
        "CREATED", "CONTEXT_VERIFIED", "DIAGNOSED", "ESTIMATED",
        "CUSTOMER_APPROVAL", "IN_PROGRESS", "PDI", "INVOICED", "CLOSED"
    ]
    
    if transition.new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
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
