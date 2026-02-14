"""
MG Fleet Management routes for EKA-AI Backend.
Handles Minimum Guarantee contracts, vehicle logs, and billing.
"""
from datetime import datetime, timezone
from typing import Optional, List
from decimal import Decimal

from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from pydantic import BaseModel

from utils.database import (
    serialize_doc, serialize_docs,
    mg_contracts_collection, mg_vehicle_logs_collection, 
    mg_calculation_logs_collection, vehicles_collection
)

# MG Service Integration
from services.mg_service import MGEngine

router = APIRouter(prefix="/api/mg-fleet", tags=["MG Fleet"])

# Initialize MG Engine
mg_engine = MGEngine()


class ContractCreate(BaseModel):
    """Request body for creating an MG contract."""
    customer_id: str
    contract_type: str  # FIXED_KM, VARIABLE_KM, HYBRID
    assured_km: float
    rate_per_km: float
    vehicle_ids: List[str]
    start_date: str
    end_date: str
    billing_frequency: str = "MONTHLY"
    terms_conditions: Optional[str] = None


class VehicleLogCreate(BaseModel):
    """Request body for logging vehicle KM."""
    vehicle_id: str
    log_date: str
    opening_km: float
    closing_km: float
    notes: Optional[str] = None


@router.post("/contracts", status_code=201)
def create_contract(contract: ContractCreate):
    """
    Create a new Minimum Guarantee contract.
    
    The contract ensures the workshop gets paid for max(assured_km, actual_km)
    regardless of actual vehicle usage.
    """
    try:
        # Generate contract number
        year = datetime.now().year
        count = mg_contracts_collection.count_documents({}) + 1
        contract_number = f"MG-{year}-{count:05d}"
        
        # Create contract document
        contract_doc = {
            "contract_number": contract_number,
            "customer_id": contract.customer_id,
            "contract_type": contract.contract_type,
            "assured_km": Decimal(str(contract.assured_km)),
            "rate_per_km": Decimal(str(contract.rate_per_km)),
            "vehicle_ids": contract.vehicle_ids,
            "start_date": contract.start_date,
            "end_date": contract.end_date,
            "billing_frequency": contract.billing_frequency,
            "terms_conditions": contract.terms_conditions,
            "status": "ACTIVE",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        result = mg_contracts_collection.insert_one(contract_doc)
        contract_doc["_id"] = result.inserted_id
        
        return {
            "success": True,
            "message": "MG Contract created successfully",
            "data": serialize_doc(contract_doc)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create contract: {str(e)}")


@router.get("/contracts")
def get_all_contracts(
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100)
):
    """Retrieve all MG contracts with optional filtering."""
    query = {}
    if status:
        query["status"] = status
    
    cursor = mg_contracts_collection.find(query).sort("created_at", -1).limit(limit)
    docs = list(cursor)
    
    return {
        "success": True,
        "data": serialize_docs(docs),
        "count": len(docs)
    }


@router.get("/contracts/{contract_id}")
def get_contract_by_id(contract_id: str):
    """Get a single contract by ID."""
    try:
        doc = mg_contracts_collection.find_one({"_id": ObjectId(contract_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid contract ID format")
    
    if not doc:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    return {"success": True, "data": serialize_doc(doc)}


@router.post("/vehicle-logs", status_code=201)
def create_vehicle_log(log: VehicleLogCreate):
    """
    Log daily KM reading for a vehicle under MG contract.
    
    Calculates total KM as closing_km - opening_km.
    """
    try:
        total_km = log.closing_km - log.opening_km
        
        log_doc = {
            "vehicle_id": log.vehicle_id,
            "log_date": log.log_date,
            "opening_km": Decimal(str(log.opening_km)),
            "closing_km": Decimal(str(log.closing_km)),
            "total_km": Decimal(str(total_km)),
            "notes": log.notes,
            "created_at": datetime.now(timezone.utc)
        }
        
        result = mg_vehicle_logs_collection.insert_one(log_doc)
        log_doc["_id"] = result.inserted_id
        
        return {
            "success": True,
            "message": "Vehicle log recorded",
            "data": serialize_doc(log_doc)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create log: {str(e)}")


@router.get("/vehicle-logs/{vehicle_id}")
def get_vehicle_logs(
    vehicle_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get KM logs for a specific vehicle."""
    query = {"vehicle_id": vehicle_id}
    
    if start_date and end_date:
        query["log_date"] = {"$gte": start_date, "$lte": end_date}
    
    logs = list(mg_vehicle_logs_collection.find(query).sort("log_date", -1))
    
    return {
        "success": True,
        "data": serialize_docs(logs),
        "count": len(logs)
    }


@router.post("/contracts/{contract_id}/generate-bill")
def generate_monthly_bill(contract_id: str, billing_period: str):
    """
    Generate a monthly bill for an MG contract.
    
    Uses the formula: MAX(assured_km, actual_km) × rate_per_km
    
    Args:
        contract_id: The MG contract ID
        billing_period: Format "YYYY-MM" (e.g., "2026-02")
    """
    try:
        # Get contract
        contract = mg_contracts_collection.find_one({"_id": ObjectId(contract_id)})
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        # Get all vehicle logs for this billing period
        # Parse period to get start and end dates
        from datetime import datetime
        period_start = f"{billing_period}-01"
        year, month = billing_period.split("-")
        if month == "12":
            next_period = f"{int(year)+1}-01-01"
        else:
            next_period = f"{year}-{int(month)+1:02d}-01"
        
        vehicle_ids = contract.get("vehicle_ids", [])
        
        total_assured_km = Decimal(str(contract.get("assured_km", 0)))
        total_actual_km = Decimal("0")
        
        vehicle_breakdown = []
        
        for vehicle_id in vehicle_ids:
            logs = mg_vehicle_logs_collection.find({
                "vehicle_id": vehicle_id,
                "log_date": {"$gte": period_start, "$lt": next_period}
            })
            
            vehicle_total = sum(log.get("total_km", 0) for log in logs)
            total_actual_km += Decimal(str(vehicle_total))
            
            vehicle_info = vehicles_collection.find_one({"_id": ObjectId(vehicle_id)})
            vehicle_breakdown.append({
                "vehicle_id": vehicle_id,
                "registration": vehicle_info.get("registration_number", "Unknown") if vehicle_info else "Unknown",
                "km_driven": float(vehicle_total)
            })
        
        # Calculate using MG Service logic
        rate_per_km = Decimal(str(contract.get("rate_per_km", 0)))
        
        # Formula: MAX(assured_km, actual_km) × rate
        billable_km = max(total_assured_km, total_actual_km)
        base_amount = billable_km * rate_per_km
        
        # Calculate extra KM charges if applicable
        extra_km = max(Decimal("0"), total_actual_km - total_assured_km)
        extra_km_charges = extra_km * rate_per_km * Decimal("0.5")  # 50% rate for extra KM
        
        # Calculate GST (18%)
        gst_rate = Decimal("0.18")
        gst_amount = base_amount * gst_rate
        
        total_amount = base_amount + extra_km_charges + gst_amount
        
        # Save calculation log
        calc_log = {
            "contract_id": contract_id,
            "billing_period": billing_period,
            "assured_km": float(total_assured_km),
            "actual_km": float(total_actual_km),
            "billable_km": float(billable_km),
            "rate_per_km": float(rate_per_km),
            "base_amount": float(base_amount),
            "extra_km": float(extra_km),
            "extra_km_charges": float(extra_km_charges),
            "gst_amount": float(gst_amount),
            "total_amount": float(total_amount),
            "vehicle_breakdown": vehicle_breakdown,
            "calculation_formula": "MAX(assured_km, actual_km) × rate_per_km",
            "created_at": datetime.now(timezone.utc)
        }
        
        result = mg_calculation_logs_collection.insert_one(calc_log)
        calc_log["_id"] = result.inserted_id
        
        return {
            "success": True,
            "message": f"Bill generated for {billing_period}",
            "data": {
                "billing_period": billing_period,
                "assured_km": float(total_assured_km),
                "actual_km": float(total_actual_km),
                "billable_km": float(billable_km),
                "rate_per_km": float(rate_per_km),
                "base_amount": float(base_amount),
                "extra_km_charges": float(extra_km_charges),
                "gst_amount": float(gst_amount),
                "total_amount": float(total_amount),
                "vehicle_breakdown": vehicle_breakdown
            },
            "calculation_log_id": str(result.inserted_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bill generation failed: {str(e)}")


@router.get("/contracts/{contract_id}/bills")
def get_contract_bills(contract_id: str):
    """Get all billing history for a contract."""
    bills = list(mg_calculation_logs_collection.find(
        {"contract_id": contract_id}
    ).sort("billing_period", -1))
    
    return {
        "success": True,
        "data": serialize_docs(bills),
        "count": len(bills)
    }


@router.get("/dashboard/stats")
def get_fleet_dashboard_stats():
    """Get MG Fleet dashboard statistics."""
    total_contracts = mg_contracts_collection.count_documents({})
    active_contracts = mg_contracts_collection.count_documents({"status": "ACTIVE"})
    
    # Calculate total fleet size
    pipeline = [
        {"$match": {"status": "ACTIVE"}},
        {"$group": {"_id": None, "total_vehicles": {"$sum": {"$size": "$vehicle_ids"}}}}
    ]
    fleet_result = list(mg_contracts_collection.aggregate(pipeline))
    total_fleet_vehicles = fleet_result[0]["total_vehicles"] if fleet_result else 0
    
    # Calculate this month's revenue
    current_period = datetime.now().strftime("%Y-%m")
    revenue_pipeline = [
        {"$match": {"billing_period": current_period}},
        {"$group": {"_id": None, "total_revenue": {"$sum": "$total_amount"}}}
    ]
    revenue_result = list(mg_calculation_logs_collection.aggregate(revenue_pipeline))
    monthly_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0
    
    return {
        "success": True,
        "data": {
            "total_contracts": total_contracts,
            "active_contracts": active_contracts,
            "total_fleet_vehicles": total_fleet_vehicles,
            "monthly_revenue": monthly_revenue,
            "current_period": current_period
        }
    }
