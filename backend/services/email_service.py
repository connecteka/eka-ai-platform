"""
Email Service for EKA-AI Backend.
Handles sending emails via Resend API.
"""
import os
import asyncio
import logging
import base64
import resend
from typing import Optional, List
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
        html = f"<h1>Welcome to EKA-AI, {user_name}!</h1><p>Your workshop is now powered by intelligence.</p>"
        return send_email_sync(to_email, "Welcome to the Future of Repair", html)


def generate_invoice_email_html(
    customer_name: str,
    invoice_number: str,
    total_amount: float,
    due_date: Optional[str] = None,
    job_card_number: Optional[str] = None,
    workshop_name: str = "Go4Garage"
) -> str:
    """Generate HTML content for invoice email."""
    
    due_date_html = f'<p style="margin: 8px 0 0; color: #6b7280; font-size: 13px;"><strong>Due Date:</strong> {due_date}</p>' if due_date else ""
    job_card_html = f'<p style="margin: 8px 0 0; color: #6b7280; font-size: 13px;"><strong>Job Card:</strong> {job_card_number}</p>' if job_card_number else ""
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #5B2D8E 0%, #7433A2 100%); padding: 30px 40px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                    <span style="color: #ffffff;">Go</span><span style="color: #3CB44B;">4</span><span style="color: #ffffff;">Garage</span>
                                </h1>
                                <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">
                                    Powered by <span style="color: #E8820C;">●</span> EKA-AI
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                                    Invoice #{invoice_number}
                                </h2>
                                
                                <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                    Dear <strong>{customer_name}</strong>,
                                </p>
                                
                                <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                    Thank you for choosing {workshop_name}. Please find your invoice attached to this email.
                                </p>
                                
                                <!-- Invoice Summary Box -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FEF6EC; border-radius: 8px; border: 1px solid rgba(232, 130, 12, 0.2); margin-bottom: 30px;">
                                    <tr>
                                        <td style="padding: 24px;">
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td>
                                                        <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                                                            Invoice Number
                                                        </p>
                                                        <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                                                            {invoice_number}
                                                        </p>
                                                    </td>
                                                    <td align="right">
                                                        <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                                                            Total Amount
                                                        </p>
                                                        <p style="margin: 0; color: #E8820C; font-size: 24px; font-weight: 700;">
                                                            ₹{total_amount:,.2f}
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                            {due_date_html}
                                            {job_card_html}
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="margin: 0 0 30px; color: #4b5563; font-size: 14px; line-height: 1.6;">
                                    If you have any questions about this invoice, please don't hesitate to contact us.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center">
                                            <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">
                                                Thank you for your business!
                                            </p>
                                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                                Go4Garage Private Limited | Powered by EKA-AI<br>
                                                GSTIN: 29AABCG1234A1Z5
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    
                    <!-- Footer Note -->
                    <table width="600" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="padding: 20px; text-align: center;">
                                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                                    This email was sent by Go4Garage regarding your recent service.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
