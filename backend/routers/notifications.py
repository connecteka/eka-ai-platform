"""
WhatsApp/SMS Notifications router for EKA-AI Backend.
Handles sending notifications for job card status updates.

NOTE: This is currently MOCKED. To enable real WhatsApp notifications:
1. Sign up for Twilio: https://www.twilio.com/
2. Get WhatsApp-enabled number from Twilio
3. Add to .env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER
4. Set NOTIFICATIONS_ENABLED=true in .env
"""
import os
from datetime import datetime, timezone
from typing import Optional, List
from enum import Enum

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

from utils.database import job_cards_collection, users_collection, notifications_collection, serialize_doc

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

# Environment variables for Twilio (when ready to use real notifications)
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.environ.get("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
NOTIFICATIONS_ENABLED = os.environ.get("NOTIFICATIONS_ENABLED", "false").lower() == "true"


class NotificationType(str, Enum):
    JOB_CREATED = "job_created"
    STATUS_UPDATE = "status_update"
    APPROVAL_REQUIRED = "approval_required"
    PDI_COMPLETE = "pdi_complete"
    READY_FOR_PICKUP = "ready_for_pickup"
    INVOICE_GENERATED = "invoice_generated"


class NotificationRequest(BaseModel):
    phone_number: str
    message: str
    notification_type: NotificationType
    job_card_id: Optional[str] = None


class NotificationResponse(BaseModel):
    success: bool
    message_id: Optional[str] = None
    status: str
    mocked: bool = True


# Status to notification message mapping
STATUS_MESSAGES = {
    "CREATED": "🚗 Job Card Created: Your vehicle {reg} has been registered at our workshop. We'll keep you updated on the progress.",
    "CONTEXT_VERIFIED": "✅ Vehicle Verified: Your {reg} details have been verified. Diagnosis will begin shortly.",
    "DIAGNOSED": "🔍 Diagnosis Complete: We've identified the issues with your {reg}. An estimate is being prepared.",
    "ESTIMATED": "💰 Estimate Ready: The repair estimate for your {reg} is ready. Please review and approve.",
    "CUSTOMER_APPROVAL": "⏳ Awaiting Approval: Your approval is needed to proceed with repairs on {reg}. Check your approval link.",
    "IN_PROGRESS": "🔧 Work Started: Repairs on your {reg} have begun. We'll notify you when complete.",
    "PDI": "📋 Quality Check: Your {reg} is undergoing our 120-point Pre-Delivery Inspection.",
    "PDI_COMPLETED": "✅ Inspection Complete: Your {reg} has passed our quality inspection!",
    "INVOICED": "🧾 Invoice Ready: Your invoice for {reg} service is ready. Payment details enclosed.",
    "CLOSED": "🎉 Ready for Pickup: Your {reg} is ready! Thank you for choosing Go4Garage."
}


async def send_whatsapp_message(phone_number: str, message: str) -> dict:
    """
    Send WhatsApp message via Twilio.
    Currently MOCKED - replace with real Twilio implementation when ready.
    """
    if NOTIFICATIONS_ENABLED and TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
        try:
            from twilio.rest import Client
            client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            
            # Format phone number for WhatsApp
            to_number = f"whatsapp:{phone_number}" if not phone_number.startswith("whatsapp:") else phone_number
            
            message_response = client.messages.create(
                body=message,
                from_=TWILIO_WHATSAPP_NUMBER,
                to=to_number
            )
            
            return {
                "success": True,
                "message_id": message_response.sid,
                "status": message_response.status,
                "mocked": False
            }
        except Exception as e:
            print(f"Twilio Error: {str(e)}")
            return {
                "success": False,
                "status": f"error: {str(e)}",
                "mocked": False
            }
    else:
        # MOCKED response - log to database instead
        mock_id = f"mock_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
        print(f"[MOCKED WhatsApp] To: {phone_number}")
        print(f"[MOCKED WhatsApp] Message: {message}")
        
        return {
            "success": True,
            "message_id": mock_id,
            "status": "mocked_delivered",
            "mocked": True
        }


def log_notification(phone_number: str, message: str, notification_type: str, 
                     job_card_id: str = None, result: dict = None):
    """Log notification to database for tracking."""
    doc = {
        "phone_number": phone_number,
        "message": message,
        "notification_type": notification_type,
        "job_card_id": job_card_id,
        "sent_at": datetime.now(timezone.utc),
        "result": result or {},
        "mocked": result.get("mocked", True) if result else True
    }
    notifications_collection.insert_one(doc)


@router.post("/send", response_model=NotificationResponse)
async def send_notification(
    request: NotificationRequest,
    background_tasks: BackgroundTasks
):
    """
    Send a WhatsApp notification to a customer.
    Currently MOCKED - logs to database instead of sending real messages.
    """
    result = await send_whatsapp_message(request.phone_number, request.message)
    
    # Log notification in background
    background_tasks.add_task(
        log_notification,
        request.phone_number,
        request.message,
        request.notification_type,
        request.job_card_id,
        result
    )
    
    return NotificationResponse(**result)


@router.post("/job-card-update/{job_card_id}")
async def notify_job_card_status(
    job_card_id: str,
    background_tasks: BackgroundTasks
):
    """
    Send notification when job card status changes.
    Called automatically when job card transitions to a new status.
    """
    from bson import ObjectId
    
    try:
        job_card = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job card ID")
    
    if not job_card:
        raise HTTPException(status_code=404, detail="Job card not found")
    
    status = job_card.get("status", "CREATED")
    phone = job_card.get("customer_phone") or job_card.get("phone")
    reg_number = job_card.get("vehicle_registration") or job_card.get("registration_number", "your vehicle")
    
    if not phone:
        return {
            "success": False,
            "message": "No phone number on job card",
            "notification_sent": False
        }
    
    # Get appropriate message template
    message_template = STATUS_MESSAGES.get(status, "📱 Update on your vehicle {reg} at Go4Garage.")
    message = message_template.format(reg=reg_number)
    
    # Add workshop details
    message += "\n\n🏪 Go4Garage Workshop\n📞 Contact: +91 98765 43210"
    
    # Send notification
    result = await send_whatsapp_message(phone, message)
    
    # Log notification
    background_tasks.add_task(
        log_notification,
        phone,
        message,
        f"status_update_{status}",
        job_card_id,
        result
    )
    
    return {
        "success": result["success"],
        "message": message,
        "notification_sent": True,
        "mocked": result.get("mocked", True),
        "status": status
    }


@router.get("/history")
def get_notification_history(
    job_card_id: Optional[str] = None,
    phone_number: Optional[str] = None,
    limit: int = 50
):
    """Get notification history with optional filtering."""
    query = {}
    if job_card_id:
        query["job_card_id"] = job_card_id
    if phone_number:
        query["phone_number"] = phone_number
    
    cursor = notifications_collection.find(query).sort("sent_at", -1).limit(limit)
    docs = list(cursor)
    
    # Serialize
    from utils.database import serialize_docs
    return {
        "success": True,
        "notifications": serialize_docs(docs),
        "count": len(docs)
    }


@router.get("/status")
def get_notification_status():
    """Get notification service status."""
    return {
        "enabled": NOTIFICATIONS_ENABLED,
        "provider": "twilio_whatsapp" if NOTIFICATIONS_ENABLED else "mocked",
        "twilio_configured": bool(TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN),
        "whatsapp_number": TWILIO_WHATSAPP_NUMBER if NOTIFICATIONS_ENABLED else "N/A (mocked)",
        "message": "Notifications are MOCKED. Set TWILIO credentials and NOTIFICATIONS_ENABLED=true to enable real WhatsApp messages."
    }


@router.post("/test")
async def send_test_notification(phone_number: str = "+919876543210"):
    """Send a test notification (mocked by default)."""
    message = "🧪 Test Notification from EKA-AI\n\nThis is a test message from Go4Garage workshop management system.\n\nIf you received this via WhatsApp, notifications are working!"
    
    result = await send_whatsapp_message(phone_number, message)
    
    log_notification(phone_number, message, "test", None, result)
    
    return {
        "success": result["success"],
        "message": "Test notification sent" if result["success"] else "Failed to send",
        "mocked": result.get("mocked", True),
        "details": result
    }
