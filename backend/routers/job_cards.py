"""
Job Cards routes for EKA-AI Backend.
Handles CRUD operations for workshop job cards with FSM enforcement.
"""
from datetime import datetime, timezone
from typing import Optional, List
import random
import string

from fastapi import APIRouter, HTTPException, Query, BackgroundTasks, Request
from bson import ObjectId

from models.schemas import (
    JobCardCreate, JobCardUpdate, JobCardTransition,
    InternalNoteCreate, SignatureData
)
from utils.database import (
    job_cards_collection, serialize_doc, serialize_docs,
    vehicles_collection, customers_collection, services_collection,
    parts_collection, job_card_notes_collection, job_card_timeline_collection,
    signatures_collection, files_collection, invoices_collection
)

# Job Card Manager Integration
from services.job_card_manager import JobCardManager, JobStatus

router = APIRouter(prefix="/api/job-cards", tags=["Job Cards"])

# Initialize Job Card Manager
job_card_manager = JobCardManager()


def generate_job_card_number():
    """Generate a unique job card number."""
    year = datetime.now().year
    count = job_cards_collection.count_documents({}) + 1
    return f"JC-{year}-{count:05d}"


def get_client_ip(request: Request) -> str:
    """Get client IP address from request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


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
async def transition_job_card(
    job_card_id: str, 
    transition: JobCardTransition,
    background_tasks: BackgroundTasks,
    send_notification: bool = True,
    request: Request = None
):
    """
    Transition a job card to a new status with FSM validation.
    
    Uses JobCardManager to enforce valid state transitions:
    CREATED → CONTEXT_VERIFIED → DIAGNOSED → ESTIMATED → CUSTOMER_APPROVAL → 
    IN_PROGRESS → PDI → INVOICED → CLOSED
    
    Optionally sends WhatsApp notification to customer.
    """
    try:
        # Get current job card
        job_card = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
        if not job_card:
            raise HTTPException(status_code=404, detail="Job Card not found")
        
        # Get user ID from request (or default)
        user_id = "system"
        if request:
            # Extract from auth header or session
            pass
        
        # Use JobCardManager for FSM transition
        result = job_card_manager.transition_state(
            job_card_id=job_card_id,
            action=transition.new_status,
            user_id=user_id,
            notes=transition.notes
        )
        
        if not result.success:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid state transition: {result.error_message}"
            )
        
        # Update in database
        update_data = {
            "status": transition.new_status,
            "updated_at": datetime.now(timezone.utc)
        }
        if transition.notes:
            update_data["transition_notes"] = transition.notes
        
        job_cards_collection.update_one(
            {"_id": ObjectId(job_card_id)},
            {"$set": update_data}
        )
        
        updated = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
        
        # Add timeline entry
        timeline_entry = {
            "job_card_id": job_card_id,
            "timestamp": datetime.now(timezone.utc),
            "description": f"Status changed to {transition.new_status}",
            "actor": user_id,
            "status": "completed"
        }
        job_card_timeline_collection.insert_one(timeline_entry)
        
        # Send notification in background if requested
        if send_notification:
            background_tasks.add_task(
                trigger_status_notification,
                job_card_id
            )
        
        return {
            "success": True, 
            "data": serialize_doc(updated), 
            "notification_queued": send_notification,
            "fsm_valid": True,
            "previous_state": result.previous_state,
            "new_state": result.new_state
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Transition failed: {str(e)}")


async def trigger_status_notification(job_card_id: str):
    """Background task to trigger status notification."""
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            await client.post(
                f"http://localhost:8001/api/notifications/job-card-update/{job_card_id}",
                timeout=10.0
            )
    except Exception as e:
        print(f"Notification trigger error: {str(e)}")


# ==================== DETAILED JOB CARD ENDPOINTS ====================

@router.get("/{job_card_id}/detail")
def get_job_card_detail(job_card_id: str):
    """
    Get comprehensive job card details including:
    - Vehicle information
    - Customer information
    - Services and parts
    - Payment breakdown
    - Timeline and notes
    - Photos and documents
    """
    try:
        job_card = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job card ID format")
    
    if not job_card:
        raise HTTPException(status_code=404, detail="Job Card not found")
    
    job_card_id_str = str(job_card["_id"])
    
    # Get related vehicle
    vehicle = vehicles_collection.find_one({"job_card_id": job_card_id_str})
    if not vehicle:
        # Create default vehicle from job card data
        vehicle = {
            "registration_number": job_card.get("vehicle_registration", "N/A"),
            "make": "Unknown",
            "model": job_card.get("vehicle_model", "Unknown"),
            "variant": None,
            "year": 2022,
            "fuel_type": "Petrol",
            "chassis_vin": None,
            "engine_number": None,
            "odometer_reading": 0,
            "color": "Unknown",
            "insurance_valid_till": None,
            "puc_valid_till": None,
            "last_service_date": None,
            "last_service_km": None,
            "tyre_condition": None
        }
    
    # Get related customer
    customer = customers_collection.find_one({"job_card_id": job_card_id_str})
    if not customer:
        # Create default customer from job card data
        customer = {
            "name": job_card.get("customer_name", "Unknown"),
            "phone": job_card.get("phone", "N/A"),
            "email": job_card.get("email"),
            "address": None,
            "total_visits": 1,
            "lifetime_value": job_card.get("estimated_cost", 0) or 0,
            "rating": 0,
            "member_since": None,
            "preferences": []
        }
    
    # Get services
    services = list(services_collection.find({"job_card_id": job_card_id_str}))
    services_list = []
    for svc in services:
        services_list.append({
            "id": str(svc["_id"]),
            "service_type": svc.get("service_type", "General Service"),
            "description": svc.get("description", ""),
            "technician": svc.get("technician", "Unassigned"),
            "priority": svc.get("priority", "normal"),
            "status": svc.get("status", "queued"),
            "estimated_time": svc.get("estimated_time", "1h 00m"),
            "actual_time": svc.get("actual_time"),
            "cost": svc.get("cost", 0)
        })
    
    # Get parts
    parts = list(parts_collection.find({"job_card_id": job_card_id_str}))
    parts_list = []
    for part in parts:
        parts_list.append({
            "id": str(part["_id"]),
            "name": part.get("name", "Unknown Part"),
            "part_number": part.get("part_number", "N/A"),
            "category": part.get("category", "General"),
            "quantity": part.get("quantity", "1"),
            "unit_price": part.get("unit_price", 0),
            "total": part.get("total", 0),
            "warranty": part.get("warranty"),
            "availability": part.get("availability", "in-stock"),
            "availability_note": part.get("availability_note")
        })
    
    # Calculate payment
    parts_total = sum(p.get("total", 0) for p in parts_list)
    services_total = sum(s.get("cost", 0) for s in services_list)
    subtotal = parts_total + services_total
    cgst = round(subtotal * 0.09, 2)
    sgst = round(subtotal * 0.09, 2)
    grand_total = subtotal + cgst + sgst
    
    payment = {
        "subtotal": subtotal,
        "discounts": job_card.get("discounts", []),
        "cgst": cgst,
        "sgst": sgst,
        "igst": 0,
        "grand_total": grand_total,
        "amount_paid": job_card.get("amount_paid", 0),
        "balance_due": grand_total - job_card.get("amount_paid", 0),
        "payment_status": job_card.get("payment_status", "pending"),
        "payment_mode": job_card.get("payment_mode"),
        "transaction_id": job_card.get("transaction_id"),
        "paid_on": job_card.get("paid_on")
    }
    
    # Get timeline
    timeline = list(job_card_timeline_collection.find({"job_card_id": job_card_id_str}).sort("timestamp", 1))
    timeline_list = []
    for entry in timeline:
        timeline_list.append({
            "id": str(entry["_id"]),
            "timestamp": entry.get("timestamp", datetime.now(timezone.utc)).isoformat() if isinstance(entry.get("timestamp"), datetime) else entry.get("timestamp", ""),
            "description": entry.get("description", ""),
            "actor": entry.get("actor", "System"),
            "status": entry.get("status", "completed")
        })
    
    # Get notes
    notes = list(job_card_notes_collection.find({"job_card_id": job_card_id_str}).sort("timestamp", 1))
    notes_list = []
    for note in notes:
        notes_list.append({
            "id": str(note["_id"]),
            "author": note.get("author", "Unknown"),
            "timestamp": note.get("timestamp", datetime.now(timezone.utc)).isoformat() if isinstance(note.get("timestamp"), datetime) else note.get("timestamp", ""),
            "text": note.get("text", ""),
            "is_ai": note.get("is_ai", False),
            "attachments": note.get("attachments", [])
        })
    
    # Get photos
    photos = list(files_collection.find({
        "job_card_id": job_card_id_str,
        "category": "vehicle_photo"
    }))
    photo_list = [serialize_doc(p) for p in photos]
    
    # Get documents
    documents = list(files_collection.find({
        "job_card_id": job_card_id_str,
        "category": {"$ne": "vehicle_photo"}
    }))
    doc_list = [serialize_doc(d) for d in documents]
    
    # Get signature
    signature = signatures_collection.find_one({"job_card_id": job_card_id_str})
    
    # Get related job cards (same vehicle or customer)
    related = []
    if vehicle.get("registration_number"):
        related_cards = job_cards_collection.find({
            "vehicle_registration": vehicle.get("registration_number"),
            "_id": {"$ne": job_card["_id"]}
        }).limit(5)
        for rc in related_cards:
            related.append({
                "id": str(rc["_id"]),
                "job_card_number": rc.get("job_card_number", f"JC-{str(rc['_id'])[-5:]}"),
                "date": rc.get("created_at").isoformat() if isinstance(rc.get("created_at"), datetime) else rc.get("created_at", ""),
                "service": rc.get("details", "Service"),
                "relation": "Same vehicle",
                "badge": "Previous",
                "badge_variant": "info"
            })
    
    response = {
        "id": job_card_id_str,
        "job_card_number": job_card.get("job_card_number", f"JC-{job_card_id_str[-5:].upper()}"),
        "status": job_card.get("status", "Pending"),
        "priority": job_card.get("priority", "normal"),
        "created_at": job_card.get("created_at").isoformat() if isinstance(job_card.get("created_at"), datetime) else job_card.get("created_at", ""),
        "updated_at": job_card.get("updated_at").isoformat() if isinstance(job_card.get("updated_at"), datetime) else job_card.get("updated_at", ""),
        "created_by": job_card.get("created_by", "System"),
        "bay_number": job_card.get("bay_number"),
        "technician": job_card.get("technician"),
        "promised_delivery": job_card.get("promised_delivery"),
        
        "vehicle": vehicle if "_id" not in vehicle else serialize_doc(vehicle),
        "customer": customer if "_id" not in customer else serialize_doc(customer),
        "services": services_list,
        "parts": parts_list,
        "payment": payment,
        "timeline": timeline_list,
        "notes": notes_list,
        
        "pre_inspection": job_card.get("pre_inspection", {}),
        "photos": photo_list,
        "documents": doc_list,
        "related_job_cards": related,
        
        "approval_status": job_card.get("approval_status", "pending"),
        "signature": serialize_doc(signature) if signature else None,
        "feedback": job_card.get("feedback")
    }
    
    return {"success": True, "data": response}


@router.get("/{job_card_id}/insights")
def get_job_card_insights(job_card_id: str):
    """
    Get EKA-AI generated insights for a job card.
    Includes predictive maintenance, alerts, and cost optimization.
    """
    try:
        job_card = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job card ID format")
    
    if not job_card:
        raise HTTPException(status_code=404, detail="Job Card not found")
    
    job_card_id_str = str(job_card["_id"])
    
    # Get vehicle info for predictions
    vehicle = vehicles_collection.find_one({"job_card_id": job_card_id_str})
    odometer = vehicle.get("odometer_reading", 30000) if vehicle else 30000
    
    # Get customer info for savings
    customer = customers_collection.find_one({"job_card_id": job_card_id_str})
    total_visits = customer.get("total_visits", 5) if customer else 5
    
    # Generate insights (in production, this would use ML models)
    insights = [
        {
            "type": "predictive",
            "icon": "🔮",
            "title": "Next Service Prediction",
            "body": f"Based on driving patterns (avg 1,400 km/month), next service at {odometer + 5000:,} km — approximately in 3-4 months. Recommend scheduling proactive reminder 2 weeks before.",
            "confidence": random.randint(88, 96),
            "action": "Schedule Reminder",
            "border_color": "#E8952F",
            "bg_color": "#FEF6EC"
        },
        {
            "type": "alert",
            "icon": "⚠️",
            "title": "Attention Required",
            "body": "Rear brake pads at 40% wear (measured during current inspection). At current driving pattern, estimated 5,000 km before replacement needed. Delaying may cause rotor damage (+₹3,500 additional cost).",
            "priority": "Medium Priority",
            "risk_delayed": "₹3,500 additional rotor cost",
            "risk_now": "₹1,800 brake pads only",
            "action": "Add to Current Job Card",
            "border_color": "#F59E0B",
            "bg_color": "#FFFBEB"
        },
        {
            "type": "savings",
            "icon": "💡",
            "title": "Cost Savings Detected",
            "body": f"By bundling services in this visit, customer saves ₹400 compared to separate visits. Customer's lifetime savings with Go4Garage: ₹{total_visits * 400:,} across {total_visits} visits.",
            "savings_this_visit": 400,
            "lifetime_savings": total_visits * 400,
            "action": "View Savings Report",
            "border_color": "#16A34A",
            "bg_color": "#ECFDF5"
        }
    ]
    
    # Vehicle health score
    health_score = {
        "overall": random.randint(70, 85),
        "engine": random.randint(85, 95),
        "brakes": random.randint(55, 75),
        "tyres": random.randint(70, 85),
        "ac": random.randint(50, 70),
        "electrical": random.randint(88, 98),
        "body": random.randint(80, 92)
    }
    
    return {
        "success": True,
        "data": {
            "insights": insights,
            "health_score": health_score,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    }


@router.post("/{job_card_id}/notes")
def add_internal_note(job_card_id: str, note: InternalNoteCreate):
    """Add an internal note to a job card."""
    try:
        job_card = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job card ID format")
    
    if not job_card:
        raise HTTPException(status_code=404, detail="Job Card not found")
    
    note_doc = {
        "job_card_id": str(job_card["_id"]),
        "author": note.author,
        "text": note.text,
        "is_ai": False,
        "attachments": note.attachments,
        "timestamp": datetime.now(timezone.utc)
    }
    
    result = job_card_notes_collection.insert_one(note_doc)
    note_doc["_id"] = result.inserted_id
    
    # Also add to timeline
    timeline_entry = {
        "job_card_id": str(job_card["_id"]),
        "timestamp": datetime.now(timezone.utc),
        "description": f"Note added: {note.text[:50]}...",
        "actor": note.author,
        "status": "completed"
    }
    job_card_timeline_collection.insert_one(timeline_entry)
    
    return {"success": True, "data": serialize_doc(note_doc)}


@router.get("/{job_card_id}/notes")
def get_internal_notes(job_card_id: str):
    """Get all internal notes for a job card."""
    try:
        job_card = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job card ID format")
    
    if not job_card:
        raise HTTPException(status_code=404, detail="Job Card not found")
    
    notes = list(job_card_notes_collection.find({"job_card_id": str(job_card["_id"])}).sort("timestamp", 1))
    
    return {"success": True, "data": serialize_docs(notes)}


@router.post("/{job_card_id}/signature")
def save_signature(job_card_id: str, signature: SignatureData, request: Request):
    """Save customer signature for approval."""
    try:
        job_card = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job card ID format")
    
    if not job_card:
        raise HTTPException(status_code=404, detail="Job Card not found")
    
    # Save signature
    sig_doc = {
        "job_card_id": str(job_card["_id"]),
        "signature_image": signature.signature_image,
        "customer_name": signature.customer_name,
        "verified_via": signature.verified_via,
        "otp_verified": signature.otp_verified,
        "ip_address": signature.ip_address or get_client_ip(request),
        "signed_at": datetime.now(timezone.utc)
    }
    
    # Upsert - update if exists, insert if not
    signatures_collection.update_one(
        {"job_card_id": str(job_card["_id"])},
        {"$set": sig_doc},
        upsert=True
    )
    
    # Update job card approval status
    job_cards_collection.update_one(
        {"_id": job_card["_id"]},
        {"$set": {
            "approval_status": "approved",
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    # Add to timeline
    timeline_entry = {
        "job_card_id": str(job_card["_id"]),
        "timestamp": datetime.now(timezone.utc),
        "description": f"Customer approval received - Signed by {signature.customer_name}",
        "actor": signature.customer_name,
        "status": "completed"
    }
    job_card_timeline_collection.insert_one(timeline_entry)
    
    return {"success": True, "message": "Signature saved successfully"}


@router.get("/{job_card_id}/timeline")
def get_timeline(job_card_id: str):
    """Get activity timeline for a job card."""
    try:
        job_card = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job card ID format")
    
    if not job_card:
        raise HTTPException(status_code=404, detail="Job Card not found")
    
    timeline = list(job_card_timeline_collection.find({"job_card_id": str(job_card["_id"])}).sort("timestamp", 1))
    
    return {"success": True, "data": serialize_docs(timeline)}


@router.post("/{job_card_id}/timeline")
def add_timeline_entry(job_card_id: str, description: str, actor: str, status: str = "completed"):
    """Add an entry to the job card timeline."""
    try:
        job_card = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job card ID format")
    
    if not job_card:
        raise HTTPException(status_code=404, detail="Job Card not found")
    
    entry = {
        "job_card_id": str(job_card["_id"]),
        "timestamp": datetime.now(timezone.utc),
        "description": description,
        "actor": actor,
        "status": status
    }
    
    result = job_card_timeline_collection.insert_one(entry)
    entry["_id"] = result.inserted_id
    
    return {"success": True, "data": serialize_doc(entry)}


# ==================== SERVICES MANAGEMENT ====================

@router.get("/{job_card_id}/services")
def get_services(job_card_id: str):
    """Get all services for a job card."""
    services = list(services_collection.find({"job_card_id": job_card_id}))
    return {"success": True, "data": serialize_docs(services)}


@router.post("/{job_card_id}/services")
def add_service(job_card_id: str, service_type: str, description: str, technician: str = "Unassigned", 
                priority: str = "normal", estimated_time: str = "1h 00m", cost: float = 0):
    """Add a service to a job card."""
    try:
        job_card = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job card ID format")
    
    if not job_card:
        raise HTTPException(status_code=404, detail="Job Card not found")
    
    service = {
        "job_card_id": str(job_card["_id"]),
        "service_type": service_type,
        "description": description,
        "technician": technician,
        "priority": priority,
        "status": "queued",
        "estimated_time": estimated_time,
        "actual_time": None,
        "cost": cost,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = services_collection.insert_one(service)
    service["_id"] = result.inserted_id
    
    return {"success": True, "data": serialize_doc(service)}


@router.put("/{job_card_id}/services/{service_id}")
def update_service(job_card_id: str, service_id: str, status: Optional[str] = None, 
                   actual_time: Optional[str] = None, technician: Optional[str] = None):
    """Update a service."""
    update_data = {"updated_at": datetime.now(timezone.utc)}
    if status:
        update_data["status"] = status
    if actual_time:
        update_data["actual_time"] = actual_time
    if technician:
        update_data["technician"] = technician
    
    try:
        result = services_collection.update_one(
            {"_id": ObjectId(service_id), "job_card_id": job_card_id},
            {"$set": update_data}
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid service ID format")
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    
    service = services_collection.find_one({"_id": ObjectId(service_id)})
    return {"success": True, "data": serialize_doc(service)}


# ==================== PARTS MANAGEMENT ====================

@router.get("/{job_card_id}/parts")
def get_parts(job_card_id: str):
    """Get all parts for a job card."""
    parts = list(parts_collection.find({"job_card_id": job_card_id}))
    return {"success": True, "data": serialize_docs(parts)}


@router.post("/{job_card_id}/parts")
def add_part(job_card_id: str, name: str, part_number: str, category: str,
             quantity: str, unit_price: float, warranty: Optional[str] = None):
    """Add a part to a job card."""
    try:
        job_card = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job card ID format")
    
    if not job_card:
        raise HTTPException(status_code=404, detail="Job Card not found")
    
    # Parse quantity for total calculation
    qty_num = float(quantity.split()[0]) if quantity else 1
    total = qty_num * unit_price
    
    part = {
        "job_card_id": str(job_card["_id"]),
        "name": name,
        "part_number": part_number,
        "category": category,
        "quantity": quantity,
        "unit_price": unit_price,
        "total": total,
        "warranty": warranty,
        "availability": "in-stock",
        "availability_note": None,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = parts_collection.insert_one(part)
    part["_id"] = result.inserted_id
    
    return {"success": True, "data": serialize_doc(part)}
