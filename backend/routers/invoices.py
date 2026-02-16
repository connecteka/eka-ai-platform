"""
Invoices routes for EKA-AI Backend.
Handles invoice CRUD, PDF generation, and email delivery with InvoiceManager.
"""
import io
import uuid
import base64
import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from bson import ObjectId
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client

from models.schemas import InvoiceCreate
from utils.database import invoices_collection, serialize_doc, serialize_docs, job_cards_collection
from services.email_service import send_email_async, generate_invoice_email_html, is_email_enabled

# Invoice Manager Integration
from services.invoice_manager import InvoiceManager, InvoiceStatus

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])

# Initialize Invoice Manager with Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
invoice_manager = None
if supabase_url and supabase_key:
    try:
        supabase_client: Client = create_client(supabase_url, supabase_key)
        invoice_manager = InvoiceManager(supabase_client)
    except Exception as e:
        print(f"Warning: Could not initialize InvoiceManager: {e}")


class EmailInvoiceRequest(BaseModel):
    """Request body for emailing an invoice."""
    recipient_email: EmailStr
    recipient_name: Optional[str] = None


@router.post("", status_code=201)
def create_invoice(invoice: InvoiceCreate):
    """Create a new invoice."""
    invoice_number = f"EKA-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    doc = invoice.model_dump()
    doc["invoice_number"] = invoice_number
    doc["created_at"] = datetime.now(timezone.utc)
    doc["updated_at"] = datetime.now(timezone.utc)
    
    result = invoices_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"success": True, "data": serialize_doc(doc)}


@router.get("")
def get_all_invoices(
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100)
):
    """Retrieve all invoices."""
    query = {}
    if status:
        query["status"] = status
    
    cursor = invoices_collection.find(query).sort("created_at", -1).limit(limit)
    docs = list(cursor)
    
    return {"success": True, "data": serialize_docs(docs)}


@router.get("/{invoice_id}")
def get_invoice_by_id(invoice_id: str):
    """Get a single invoice by ID."""
    try:
        doc = invoices_collection.find_one({"_id": ObjectId(invoice_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid invoice ID format")
    
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"success": True, "data": serialize_doc(doc)}


@router.get("/{invoice_id}/pdf")
def generate_invoice_pdf(invoice_id: str):
    """Generate PDF for an invoice."""
    try:
        doc = invoices_collection.find_one({"_id": ObjectId(invoice_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid invoice ID format")
    
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch, cm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.enums import TA_CENTER, TA_RIGHT
        
        buffer = io.BytesIO()
        pdf = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=1*cm, leftMargin=1*cm, topMargin=1*cm, bottomMargin=1*cm)
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, alignment=TA_CENTER, textColor=colors.HexColor('#F45D3D'))
        
        elements = []
        
        elements.append(Paragraph("EKA-AI", title_style))
        elements.append(Paragraph("Go4Garage Private Limited", ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=12, alignment=TA_CENTER, textColor=colors.gray)))
        elements.append(Spacer(1, 0.5*inch))
        
        elements.append(Paragraph("TAX INVOICE", ParagraphStyle('InvTitle', parent=styles['Heading2'], fontSize=16, alignment=TA_CENTER)))
        elements.append(Spacer(1, 0.25*inch))
        
        invoice_number = doc.get('invoice_number', f"INV-{invoice_id[:8].upper()}")
        created_at = doc.get('created_at', datetime.now(timezone.utc))
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        
        details_data = [
            ['Invoice Number:', invoice_number, 'Date:', created_at.strftime('%d/%m/%Y')],
            ['Customer:', doc.get('customer_name', 'N/A'), 'Status:', doc.get('status', 'Draft')],
            ['GSTIN:', doc.get('customer_gstin', 'N/A'), 'Job Card:', doc.get('job_card_id', 'N/A')[:8] if doc.get('job_card_id') else 'N/A']
        ]
        
        details_table = Table(details_data, colWidths=[2*cm, 6*cm, 2*cm, 6*cm])
        details_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(details_table)
        elements.append(Spacer(1, 0.5*inch))
        
        items = doc.get('items', [])
        if items:
            header = ['Description', 'HSN/SAC', 'Qty', 'Rate', 'GST %', 'Amount']
            table_data = [header]
            
            for item in items:
                row = [
                    item.get('description', 'N/A')[:40],
                    item.get('hsn_sac_code', '-'),
                    str(item.get('quantity', 1)),
                    f"{item.get('unit_price', 0):,.2f}",
                    f"{item.get('gst_rate', 18)}%",
                    f"{item.get('total_amount', 0):,.2f}"
                ]
                table_data.append(row)
            
            items_table = Table(table_data, colWidths=[6*cm, 2*cm, 1.5*cm, 2.5*cm, 1.5*cm, 3*cm])
            items_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F45D3D')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
            ]))
            elements.append(items_table)
        
        elements.append(Spacer(1, 0.3*inch))
        
        taxable = doc.get('total_taxable_value', doc.get('amount', 0))
        cgst = doc.get('cgst', 0)
        sgst = doc.get('sgst', 0)
        igst = doc.get('igst', 0)
        total_tax = cgst + sgst + igst
        grand_total = doc.get('total_amount', taxable + total_tax)
        
        totals_data = [
            ['', 'Taxable Value:', f"Rs. {taxable:,.2f}"],
            ['', 'CGST:', f"Rs. {cgst:,.2f}"],
            ['', 'SGST:', f"Rs. {sgst:,.2f}"],
            ['', 'IGST:', f"Rs. {igst:,.2f}"],
            ['', 'Grand Total:', f"Rs. {grand_total:,.2f}"],
        ]
        
        totals_table = Table(totals_data, colWidths=[10*cm, 3*cm, 3.5*cm])
        totals_table.setStyle(TableStyle([
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTSIZE', (1, -1), (-1, -1), 12),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('TEXTCOLOR', (1, -1), (-1, -1), colors.HexColor('#F45D3D')),
            ('LINEABOVE', (1, -1), (-1, -1), 1, colors.black),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(totals_table)
        elements.append(Spacer(1, 0.5*inch))
        
        footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, alignment=TA_CENTER, textColor=colors.gray)
        elements.append(Paragraph("This is a computer-generated invoice.", footer_style))
        elements.append(Paragraph("Thank you for your business!", footer_style))
        elements.append(Paragraph("EKA-AI | Go4Garage Private Limited | GSTIN: 27AAAAA0000A1Z5", footer_style))
        
        pdf.build(elements)
        buffer.seek(0)
        
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=invoice-{invoice_number}.pdf"
            }
        )
        
    except ImportError:
        raise HTTPException(status_code=500, detail="PDF generation library not installed")
    except Exception as e:
        print(f"PDF Generation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")


@router.post("/{invoice_id}/mark-paid")
def mark_invoice_paid(invoice_id: str):
    """Mark an invoice as paid."""
    try:
        result = invoices_collection.update_one(
            {"_id": ObjectId(invoice_id)},
            {"$set": {"status": "PAID", "paid_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        updated = invoices_collection.find_one({"_id": ObjectId(invoice_id)})
        return {"success": True, "data": serialize_doc(updated)}
    except HTTPException:
        raise
    except:
        raise HTTPException(status_code=400, detail="Invalid invoice ID format")


@router.post("/{invoice_id}/finalize")
def finalize_invoice(invoice_id: str):
    """Finalize an invoice."""
    try:
        result = invoices_collection.update_one(
            {"_id": ObjectId(invoice_id)},
            {"$set": {"status": "Finalized", "updated_at": datetime.now(timezone.utc)}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        updated = invoices_collection.find_one({"_id": ObjectId(invoice_id)})
        return {"success": True, "data": serialize_doc(updated)}
    except HTTPException:
        raise
    except:
        raise HTTPException(status_code=400, detail="Invalid invoice ID format")



@router.get("/email/status")
def get_email_status():
    """Check if email service is configured."""
    return {
        "success": True,
        "email_enabled": is_email_enabled(),
        "message": "Email service is configured" if is_email_enabled() else "Set RESEND_API_KEY to enable email"
    }


@router.post("/{invoice_id}/email")
async def email_invoice(invoice_id: str, request: EmailInvoiceRequest):
    """
    Email an invoice PDF to a customer.
    
    Generates the invoice PDF and sends it as an email attachment.
    """
    # Check if email service is enabled
    if not is_email_enabled():
        raise HTTPException(
            status_code=503, 
            detail="Email service not configured. Set RESEND_API_KEY environment variable."
        )
    
    # Get the invoice
    try:
        doc = invoices_collection.find_one({"_id": ObjectId(invoice_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid invoice ID format")
    
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Generate PDF
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch, cm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.enums import TA_CENTER, TA_RIGHT
        
        buffer = io.BytesIO()
        pdf = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=1*cm, leftMargin=1*cm, topMargin=1*cm, bottomMargin=1*cm)
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, alignment=TA_CENTER, textColor=colors.HexColor('#E8820C'))
        
        elements = []
        
        elements.append(Paragraph("EKA-AI", title_style))
        elements.append(Paragraph("Go4Garage Private Limited", ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=12, alignment=TA_CENTER, textColor=colors.gray)))
        elements.append(Spacer(1, 0.5*inch))
        
        elements.append(Paragraph("TAX INVOICE", ParagraphStyle('InvTitle', parent=styles['Heading2'], fontSize=16, alignment=TA_CENTER)))
        elements.append(Spacer(1, 0.25*inch))
        
        invoice_number = doc.get('invoice_number', f"INV-{invoice_id[:8].upper()}")
        created_at = doc.get('created_at', datetime.now(timezone.utc))
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        
        customer_name = request.recipient_name or doc.get('customer_name', 'Customer')
        
        details_data = [
            ['Invoice Number:', invoice_number, 'Date:', created_at.strftime('%d/%m/%Y')],
            ['Customer:', customer_name, 'Status:', doc.get('status', 'Draft')],
            ['GSTIN:', doc.get('customer_gstin', 'N/A'), 'Job Card:', doc.get('job_card_id', 'N/A')[:8] if doc.get('job_card_id') else 'N/A']
        ]
        
        details_table = Table(details_data, colWidths=[2*cm, 6*cm, 2*cm, 6*cm])
        details_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(details_table)
        elements.append(Spacer(1, 0.5*inch))
        
        # Items table
        items = doc.get('items', [])
        if items:
            header = ['Description', 'HSN/SAC', 'Qty', 'Rate', 'GST %', 'Amount']
            table_data = [header]
            
            for item in items:
                row = [
                    item.get('description', 'N/A')[:40],
                    item.get('hsn_sac_code', '-'),
                    str(item.get('quantity', 1)),
                    f"{item.get('unit_price', 0):,.2f}",
                    f"{item.get('gst_rate', 18)}%",
                    f"{item.get('total_amount', 0):,.2f}"
                ]
                table_data.append(row)
            
            items_table = Table(table_data, colWidths=[6*cm, 2*cm, 1.5*cm, 2.5*cm, 1.5*cm, 3*cm])
            items_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E8820C')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
            ]))
            elements.append(items_table)
        
        elements.append(Spacer(1, 0.3*inch))
        
        # Totals
        taxable = doc.get('total_taxable_value', doc.get('amount', 0))
        cgst = doc.get('cgst', 0)
        sgst = doc.get('sgst', 0)
        igst = doc.get('igst', 0)
        total_tax = cgst + sgst + igst
        grand_total = doc.get('total_amount', taxable + total_tax)
        
        totals_data = [
            ['', 'Taxable Value:', f"Rs. {taxable:,.2f}"],
            ['', 'CGST:', f"Rs. {cgst:,.2f}"],
            ['', 'SGST:', f"Rs. {sgst:,.2f}"],
            ['', 'IGST:', f"Rs. {igst:,.2f}"],
            ['', 'Grand Total:', f"Rs. {grand_total:,.2f}"],
        ]
        
        totals_table = Table(totals_data, colWidths=[10*cm, 3*cm, 3.5*cm])
        totals_table.setStyle(TableStyle([
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTSIZE', (1, -1), (-1, -1), 12),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('TEXTCOLOR', (1, -1), (-1, -1), colors.HexColor('#E8820C')),
            ('LINEABOVE', (1, -1), (-1, -1), 1, colors.black),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(totals_table)
        elements.append(Spacer(1, 0.5*inch))
        
        footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, alignment=TA_CENTER, textColor=colors.gray)
        elements.append(Paragraph("This is a computer-generated invoice.", footer_style))
        elements.append(Paragraph("Thank you for your business!", footer_style))
        elements.append(Paragraph("EKA-AI | Go4Garage Private Limited | GSTIN: 29AABCG1234A1Z5", footer_style))
        
        pdf.build(elements)
        pdf_content = buffer.getvalue()
        buffer.close()
        
    except ImportError:
        raise HTTPException(status_code=500, detail="PDF generation library not installed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")
    
    # Generate email HTML
    email_html = generate_invoice_email_html(
        customer_name=customer_name,
        invoice_number=invoice_number,
        total_amount=grand_total,
        job_card_number=doc.get('job_card_id', '')[:8] if doc.get('job_card_id') else None
    )
    
    # Prepare attachment
    pdf_base64 = base64.standard_b64encode(pdf_content).decode('utf-8')
    attachments = [
        {
            "filename": f"invoice-{invoice_number}.pdf",
            "content": pdf_base64,
            "content_type": "application/pdf"
        }
    ]
    
    # Send email
    result = await send_email_async(
        to_email=request.recipient_email,
        subject=f"Invoice #{invoice_number} from Go4Garage",
        html_content=email_html,
        attachments=attachments
    )
    
    if result["status"] == "success":
        # Update invoice with email sent timestamp
        invoices_collection.update_one(
            {"_id": ObjectId(invoice_id)},
            {
                "$set": {
                    "email_sent_at": datetime.now(timezone.utc),
                    "email_sent_to": request.recipient_email,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        return {
            "success": True,
            "message": f"Invoice emailed to {request.recipient_email}",
            "email_id": result.get("email_id")
        }
    else:
        raise HTTPException(status_code=500, detail=result.get("message", "Failed to send email"))



# ==================== INVOICE MANAGER INTEGRATION ====================

@router.post("/generate-from-job-card")
def generate_invoice_from_job_card(job_card_id: str, workshop_id: str):
    """
    Generate a GST-compliant invoice from a job card using InvoiceManager.
    
    This endpoint:
    1. Fetches the job card details
    2. Creates invoice items from services and parts
    3. Calculates GST (CGST/SGST or IGST)
    4. Generates a unique invoice number
    5. Saves the invoice to database
    """
    from bson import ObjectId
    
    # Fetch job card
    try:
        job_card = job_cards_collection.find_one({"_id": ObjectId(job_card_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid job card ID format")
    
    if not job_card:
        raise HTTPException(status_code=404, detail="Job card not found")
    
    # Get services and parts for this job card
    from utils.database import services_collection, parts_collection
    
    services = list(services_collection.find({"job_card_id": job_card_id}))
    parts = list(parts_collection.find({"job_card_id": job_card_id}))
    
    # Build invoice items
    invoice_items = []
    
    # Add services as line items
    for svc in services:
        from decimal import Decimal
        item = invoice_manager.create_invoice_item(
            description=svc.get("service_type", "Service"),
            hsn_sac_code="998714",  # Maintenance and repair services
            quantity=Decimal("1"),
            unit_price=Decimal(str(svc.get("cost", 0))),
            item_type="LABOR"
        )
        invoice_items.append(item)
    
    # Add parts as line items
    for part in parts:
        from decimal import Decimal
        qty = part.get("quantity", "1")
        # Parse quantity (handle "2 pcs" format)
        try:
            qty_num = float(qty.split()[0]) if isinstance(qty, str) else float(qty)
        except:
            qty_num = 1
        
        item = invoice_manager.create_invoice_item(
            description=part.get("name", "Part"),
            hsn_sac_code=part.get("hsn_code", "8708"),  # Auto parts
            quantity=Decimal(str(qty_num)),
            unit_price=Decimal(str(part.get("unit_price", 0))),
            item_type="PART"
        )
        invoice_items.append(item)
    
    # Generate invoice
    try:
        invoice = invoice_manager.generate_invoice(
            job_card_id=job_card_id,
            workshop_id=workshop_id,
            customer_id=str(job_card.get("customer_id", "")),
            items=invoice_items,
            notes=f"Invoice generated from Job Card #{job_card.get('job_card_number', 'N/A')}"
        )
        
        # Save to MongoDB
        invoice_doc = invoice.to_dict()
        invoice_doc["created_at"] = datetime.now(timezone.utc)
        invoice_doc["updated_at"] = datetime.now(timezone.utc)
        
        result = invoices_collection.insert_one(invoice_doc)
        invoice_doc["_id"] = result.inserted_id
        
        return {
            "success": True,
            "message": "Invoice generated successfully",
            "data": serialize_doc(invoice_doc),
            "invoice_id": str(result.inserted_id),
            "invoice_number": invoice.invoice_number
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Invoice generation failed: {str(e)}")


@router.get("/{invoice_id}/pdf-gst")
def generate_gst_invoice_pdf(invoice_id: str):
    """
    Generate a professional GST-compliant PDF invoice using InvoiceManager.
    
    This produces a properly formatted invoice with:
    - Company header with GSTIN
    - Bill-to and Ship-to sections
    - HSN/SAC codes for each item
    - Proper GST breakdown (CGST/SGST or IGST)
    - Authorized signature area
    """
    from bson import ObjectId
    
    try:
        doc = invoices_collection.find_one({"_id": ObjectId(invoice_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid invoice ID format")
    
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    try:
        # Convert MongoDB document to Invoice object
        from decimal import Decimal
        
        items = []
        for item_data in doc.get("items", []):
            item = invoice_manager.create_invoice_item(
                description=item_data.get("description", ""),
                hsn_sac_code=item_data.get("hsn_sac_code", ""),
                quantity=Decimal(str(item_data.get("quantity", 1))),
                unit_price=Decimal(str(item_data.get("unit_price", 0))),
                discount_amount=Decimal(str(item_data.get("discount_amount", 0))),
                gst_rate=Decimal(str(item_data.get("gst_rate", 18))),
                item_type=item_data.get("item_type", "PART")
            )
            items.append(item)
        
        invoice = invoice_manager.generate_invoice(
            job_card_id=doc.get("job_card_id", ""),
            workshop_id=doc.get("workshop_id", ""),
            customer_id=doc.get("customer_id", ""),
            items=items,
            notes=doc.get("notes", ""),
            due_days=30
        )
        
        # Generate PDF using InvoiceManager
        pdf_buffer = invoice_manager.generate_pdf(invoice)
        
        invoice_number = doc.get("invoice_number", "UNKNOWN")
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=GST-Invoice-{invoice_number}.pdf"
            }
        )
        
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"PDF library not installed: {str(e)}")
    except Exception as e:
        print(f"GST PDF Generation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating GST PDF: {str(e)}")
