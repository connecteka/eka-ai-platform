"""
MG Fleet routes for EKA-AI Backend.
Handles MG Fleet contracts and vehicle management.
"""
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId

from models.schemas import MGContractCreate
from utils.database import mg_contracts_collection, mg_vehicle_logs_collection, serialize_doc, serialize_docs

router = APIRouter(prefix="/api/mg", tags=["MG Fleet"])


@router.post("/contracts", status_code=201)
def create_mg_contract(contract: MGContractCreate):
    """Create a new MG Fleet contract."""
    doc = contract.model_dump()
    doc["status"] = "Active"
    doc["created_at"] = datetime.now(timezone.utc)
    
    result = mg_contracts_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"success": True, "data": serialize_doc(doc)}


@router.get("/contracts")
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


@router.get("/reports/{contract_id}")
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
