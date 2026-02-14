"""
Email Service for EKA-AI Backend.
Handles sending emails via Resend API with professional templates.
"""
import os
import asyncio
import logging
import base64
import resend
from typing import Optional, List
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Initialize Resend API key
resend.api_key = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")

def is_email_enabled() -> bool:
    """Check if email service is properly configured."""
    api_key = os.environ.get("RESEND_API_KEY", "")
    return bool(api_key and api_key.startswith("re_"))


async def send_email_async(
    to_email: str,
    subject: str,
    html_content: str,
    attachments: Optional[List[dict]] = None
) -> dict:
    """
    Send an email using Resend API (async).
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML content of the email
        attachments: List of attachments with 'filename', 'content' (base64), and 'content_type'
        
    Returns:
        dict with status, message, and email_id
    """
    if not is_email_enabled():
        logger.warning("Email service not configured. Set RESEND_API_KEY in environment.")
        return {
            "status": "error",
            "message": "Email service not configured. Set RESEND_API_KEY to enable.",
            "email_id": None
        }
    
    params = {
        "from": SENDER_EMAIL,
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }
    
    # Add attachments if provided
    if attachments:
        params["attachments"] = attachments
    
    try:
        # Run sync SDK in thread to keep FastAPI non-blocking
        email = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent successfully to {to_email}")
        return {
            "status": "success",
            "message": f"Email sent to {to_email}",
            "email_id": email.get("id")
        }
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return {
            "status": "error",
            "message": f"Failed to send email: {str(e)}",
            "email_id": None
        }


def send_email_sync(
    to_email: str,
    subject: str,
    html_content: str,
    attachments: Optional[List[dict]] = None
) -> dict:
    """
    Send an email using Resend API (sync).
    """
    if not is_email_enabled():
        return {
            "status": "error",
            "message": "Email service not configured. Set RESEND_API_KEY to enable.",
            "email_id": None
        }
    
    params = {
        "from": SENDER_EMAIL,
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }
    
    if attachments:
        params["attachments"] = attachments
    
    try:
        email = resend.Emails.send(params)
        return {
            "status": "success",
            "message": f"Email sent to {to_email}",
            "email_id": email.get("id")
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to send email: {str(e)}",
            "email_id": None
        }


class EmailService:
    """Legacy class for backwards compatibility."""
    
    @staticmethod
    def send_transactional(to_email, subject, html_content):
        return send_email_sync(to_email, subject, html_content)

    @staticmethod
    def send_welcome(to_email, user_name):
        html = generate_welcome_email_html(user_name)
        return send_email_sync(to_email, "Welcome to EKA-AI - Your Workshop Intelligence Partner", html)


def generate_invoice_email_html(
    customer_name: str,
    invoice_number: str,
    total_amount: float,
    due_date: Optional[str] = None,
    job_card_number: Optional[str] = None,
    workshop_name: str = "Go4Garage",
    vehicle_info: Optional[str] = None,
    services_summary: Optional[str] = None
) -> str:
    """Generate professional HTML email template for invoice delivery."""
    
    current_date = datetime.now().strftime("%B %d, %Y")
    
    # Build optional sections
    due_date_row = ""
    if due_date:
        due_date_row = f'''
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #E8DDD0;">
                <span style="color: #5C4A3D; font-size: 14px;">Due Date</span>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #E8DDD0; text-align: right;">
                <span style="color: #1A1A1A; font-size: 14px; font-weight: 500;">{due_date}</span>
            </td>
        </tr>'''
    
    job_card_row = ""
    if job_card_number:
        job_card_row = f'''
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #E8DDD0;">
                <span style="color: #5C4A3D; font-size: 14px;">Job Card</span>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #E8DDD0; text-align: right;">
                <span style="color: #1A1A1A; font-size: 14px; font-weight: 500;">{job_card_number}</span>
            </td>
        </tr>'''
    
    vehicle_row = ""
    if vehicle_info:
        vehicle_row = f'''
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #E8DDD0;">
                <span style="color: #5C4A3D; font-size: 14px;">Vehicle</span>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #E8DDD0; text-align: right;">
                <span style="color: #1A1A1A; font-size: 14px; font-weight: 500;">{vehicle_info}</span>
            </td>
        </tr>'''
    
    services_section = ""
    if services_summary:
        services_section = f'''
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
            <tr>
                <td style="padding: 16px; background-color: #FFFBF5; border-radius: 8px; border: 1px solid #E8DDD0;">
                    <p style="margin: 0 0 8px; color: #5C4A3D; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                        Services Performed
                    </p>
                    <p style="margin: 0; color: #1A1A1A; font-size: 14px; line-height: 1.6;">
                        {services_summary}
                    </p>
                </td>
            </tr>
        </table>'''

    return f'''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Invoice #{invoice_number} - {workshop_name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #FFF5E6; -webkit-font-smoothing: antialiased;">
    
    <!-- Preheader Text (hidden) -->
    <div style="display: none; max-height: 0; overflow: hidden;">
        Invoice #{invoice_number} - Total: ₹{total_amount:,.2f} - Thank you for choosing {workshop_name}
    </div>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF5E6; padding: 40px 20px;">
        <tr>
            <td align="center">
                
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(26, 26, 26, 0.08); border: 1px solid #E8DDD0;">
                    
                    <!-- Header with Brand -->
                    <tr>
                        <td style="background-color: #1A1A1A; padding: 32px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                                            <span style="color: #FFFFFF;">eka</span><span style="color: #F98906;">-ai</span>
                                        </h1>
                                        <p style="margin: 4px 0 0; color: #9CA3AF; font-size: 11px; letter-spacing: 0.5px;">
                                            GOVERNED AUTOMOBILE INTELLIGENCE
                                        </p>
                                    </td>
                                    <td align="right">
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="background-color: #F98906; padding: 8px 16px; border-radius: 6px;">
                                                    <span style="color: #1A1A1A; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                        Invoice
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Invoice Header -->
                    <tr>
                        <td style="padding: 40px 40px 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 4px; color: #5C4A3D; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Invoice Number
                                        </p>
                                        <h2 style="margin: 0; color: #1A1A1A; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                            {invoice_number}
                                        </h2>
                                    </td>
                                    <td align="right">
                                        <p style="margin: 0 0 4px; color: #5C4A3D; font-size: 13px;">
                                            Date Issued
                                        </p>
                                        <p style="margin: 0; color: #1A1A1A; font-size: 16px; font-weight: 500;">
                                            {current_date}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Greeting -->
                    <tr>
                        <td style="padding: 0 40px 32px;">
                            <p style="margin: 0; color: #2C1A0E; font-size: 16px; line-height: 1.7;">
                                Dear <strong style="color: #1A1A1A;">{customer_name}</strong>,
                            </p>
                            <p style="margin: 16px 0 0; color: #5C4A3D; font-size: 15px; line-height: 1.7;">
                                Thank you for choosing <strong>{workshop_name}</strong> for your vehicle service. 
                                Please find your invoice attached to this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Invoice Details Box -->
                    <tr>
                        <td style="padding: 0 40px 32px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF5E6; border-radius: 12px; border: 2px solid #F98906; overflow: hidden;">
                                
                                <!-- Amount Header -->
                                <tr>
                                    <td style="background-color: #F98906; padding: 20px 24px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td>
                                                    <p style="margin: 0; color: #1A1A1A; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                                                        Total Amount Due
                                                    </p>
                                                </td>
                                                <td align="right">
                                                    <p style="margin: 0; color: #1A1A1A; font-size: 32px; font-weight: 700; letter-spacing: -1px;">
                                                        ₹{total_amount:,.2f}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Details -->
                                <tr>
                                    <td style="padding: 24px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #E8DDD0;">
                                                    <span style="color: #5C4A3D; font-size: 14px;">Invoice Number</span>
                                                </td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #E8DDD0; text-align: right;">
                                                    <span style="color: #1A1A1A; font-size: 14px; font-weight: 600;">{invoice_number}</span>
                                                </td>
                                            </tr>
                                            {job_card_row}
                                            {vehicle_row}
                                            {due_date_row}
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            {services_section}
                        </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 0 40px 32px;" align="center">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="background-color: #1A1A1A; padding: 14px 32px; border-radius: 8px;">
                                        <a href="#" style="color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.3px;">
                                            View Invoice Details
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Help Section -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFBF5; border-radius: 8px; border: 1px solid #E8DDD0;">
                                <tr>
                                    <td style="padding: 20px 24px;">
                                        <p style="margin: 0 0 8px; color: #1A1A1A; font-size: 14px; font-weight: 600;">
                                            Questions about your invoice?
                                        </p>
                                        <p style="margin: 0; color: #5C4A3D; font-size: 14px; line-height: 1.6;">
                                            Contact us at <a href="mailto:support@go4garage.com" style="color: #F98906; text-decoration: none; font-weight: 500;">support@go4garage.com</a> 
                                            or call <a href="tel:+918012345678" style="color: #F98906; text-decoration: none; font-weight: 500;">+91-80-1234-5678</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1A1A1A; padding: 32px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 8px; color: #FFFFFF; font-size: 14px; font-weight: 500;">
                                            Thank you for your business!
                                        </p>
                                        <p style="margin: 0 0 16px; color: #9CA3AF; font-size: 12px; line-height: 1.6;">
                                            Go4Garage Private Limited<br>
                                            CIN: U74999KA2024PTC123456 | GSTIN: 29AABCG1234A1Z5
                                        </p>
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 0 8px;">
                                                    <a href="#" style="color: #9CA3AF; text-decoration: none; font-size: 11px;">Privacy Policy</a>
                                                </td>
                                                <td style="color: #4B5563;">|</td>
                                                <td style="padding: 0 8px;">
                                                    <a href="#" style="color: #9CA3AF; text-decoration: none; font-size: 11px;">Terms of Service</a>
                                                </td>
                                                <td style="color: #4B5563;">|</td>
                                                <td style="padding: 0 8px;">
                                                    <a href="#" style="color: #9CA3AF; text-decoration: none; font-size: 11px;">Unsubscribe</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
                
                <!-- Footer Note -->
                <table width="600" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 24px 20px; text-align: center;">
                            <p style="margin: 0; color: #9CA3AF; font-size: 11px; line-height: 1.5;">
                                This email was sent by Go4Garage regarding your recent vehicle service.<br>
                                © {datetime.now().year} Go4Garage Private Limited. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
                
            </td>
        </tr>
    </table>
</body>
</html>
'''


def generate_welcome_email_html(user_name: str) -> str:
    """Generate professional HTML email template for welcome emails."""
    
    return f'''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to EKA-AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #FFF5E6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF5E6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(26, 26, 26, 0.08); border: 1px solid #E8DDD0;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #1A1A1A; padding: 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 32px; font-weight: 700;">
                                <span style="color: #FFFFFF;">eka</span><span style="color: #F98906;">-ai</span>
                            </h1>
                            <p style="margin: 8px 0 0; color: #9CA3AF; font-size: 12px; letter-spacing: 1px;">
                                GOVERNED AUTOMOBILE INTELLIGENCE
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 48px 40px;">
                            <h2 style="margin: 0 0 24px; color: #1A1A1A; font-size: 28px; font-weight: 700; text-align: center;">
                                Welcome, {user_name}!
                            </h2>
                            
                            <p style="margin: 0 0 24px; color: #5C4A3D; font-size: 16px; line-height: 1.7; text-align: center;">
                                Your workshop is now powered by AI intelligence. Get ready to transform how you diagnose, manage, and grow your automotive business.
                            </p>
                            
                            <!-- Features Grid -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                                <tr>
                                    <td style="padding: 16px; background-color: #FFF5E6; border-radius: 8px; text-align: center; width: 50%;">
                                        <p style="margin: 0 0 8px; font-size: 24px;">🔧</p>
                                        <p style="margin: 0; color: #1A1A1A; font-size: 14px; font-weight: 600;">AI Diagnostics</p>
                                    </td>
                                    <td style="width: 16px;"></td>
                                    <td style="padding: 16px; background-color: #FFF5E6; border-radius: 8px; text-align: center; width: 50%;">
                                        <p style="margin: 0 0 8px; font-size: 24px;">📋</p>
                                        <p style="margin: 0; color: #1A1A1A; font-size: 14px; font-weight: 600;">Job Cards</p>
                                    </td>
                                </tr>
                                <tr><td colspan="3" style="height: 16px;"></td></tr>
                                <tr>
                                    <td style="padding: 16px; background-color: #FFF5E6; border-radius: 8px; text-align: center; width: 50%;">
                                        <p style="margin: 0 0 8px; font-size: 24px;">🧾</p>
                                        <p style="margin: 0; color: #1A1A1A; font-size: 14px; font-weight: 600;">GST Invoicing</p>
                                    </td>
                                    <td style="width: 16px;"></td>
                                    <td style="padding: 16px; background-color: #FFF5E6; border-radius: 8px; text-align: center; width: 50%;">
                                        <p style="margin: 0 0 8px; font-size: 24px;">📊</p>
                                        <p style="margin: 0; color: #1A1A1A; font-size: 14px; font-weight: 600;">Analytics</p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="#" style="display: inline-block; background-color: #F98906; color: #1A1A1A; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                                            Get Started
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1A1A1A; padding: 32px 40px; text-align: center;">
                            <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                                © {datetime.now().year} Go4Garage Private Limited. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
'''


def generate_job_status_email_html(
    customer_name: str,
    job_card_number: str,
    vehicle_info: str,
    status: str,
    status_message: str,
    workshop_name: str = "Go4Garage"
) -> str:
    """Generate HTML email for job status updates."""
    
    status_colors = {
        "pending": "#F59E0B",
        "in_progress": "#3B82F6", 
        "completed": "#10B981",
        "ready_for_pickup": "#8B5CF6",
        "delivered": "#6B7280"
    }
    
    status_color = status_colors.get(status.lower().replace(" ", "_"), "#F98906")
    
    return f'''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Update - {job_card_number}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #FFF5E6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF5E6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(26, 26, 26, 0.08); border: 1px solid #E8DDD0;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #1A1A1A; padding: 32px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <h1 style="margin: 0; font-size: 24px; font-weight: 700;">
                                            <span style="color: #FFFFFF;">eka</span><span style="color: #F98906;">-ai</span>
                                        </h1>
                                    </td>
                                    <td align="right">
                                        <span style="background-color: {status_color}; color: #FFFFFF; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                                            {status.replace("_", " ")}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 8px; color: #1A1A1A; font-size: 24px; font-weight: 700;">
                                Job Status Update
                            </h2>
                            <p style="margin: 0 0 24px; color: #5C4A3D; font-size: 14px;">
                                Job Card: <strong>{job_card_number}</strong>
                            </p>
                            
                            <p style="margin: 0 0 24px; color: #2C1A0E; font-size: 16px; line-height: 1.7;">
                                Dear <strong>{customer_name}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 32px; color: #5C4A3D; font-size: 15px; line-height: 1.7;">
                                {status_message}
                            </p>
                            
                            <!-- Vehicle Info Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF5E6; border-radius: 8px; border: 1px solid #E8DDD0;">
                                <tr>
                                    <td style="padding: 20px 24px;">
                                        <p style="margin: 0 0 4px; color: #5C4A3D; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Vehicle
                                        </p>
                                        <p style="margin: 0; color: #1A1A1A; font-size: 16px; font-weight: 600;">
                                            {vehicle_info}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1A1A1A; padding: 24px 40px; text-align: center;">
                            <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                                {workshop_name} | Powered by EKA-AI
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
'''
