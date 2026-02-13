"""
Invoices routes for EKA-AI Backend.
Handles invoice CRUD, PDF generation, and email delivery.
"""
import io
import uuid
import base64
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from bson import ObjectId
from pydantic import BaseModel, EmailStr

from models.schemas import InvoiceCreate
from utils.database import invoices_collection, serialize_doc, serialize_docs
from services.email_service import send_email_async, generate_invoice_email_html, is_email_enabled

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])


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
