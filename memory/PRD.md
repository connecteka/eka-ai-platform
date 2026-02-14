# EKA-AI Platform - Product Requirements Document

## Project Overview
**Name:** EKA-AI Platform  
**Type:** Automobile Intelligence System  
**Client:** Go4Garage Private Limited  
**Date Created:** February 2026  
**Last Updated:** February 14, 2026 (Update 20 - Backend Data Integration Complete)

## Original Problem Statement
Build the EKA-AI Platform - a comprehensive automobile intelligence system with a Claude-like chat interface for vehicle diagnostics, job card management, and fleet operations.

## Architecture
### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4 with dark theme
- **Key Components:**
  - ClaudeLikeChat: AI-powered chat interface
  - Job Cards Management with 17-section detail page
  - Dashboard with metrics
  - MG Fleet Management
  - Invoice Generation
  - PDI Checklist Generator (interactive modal)

### Backend  
- **Framework:** FastAPI (Python)
- **Database:** MongoDB
- **AI Integration:** Emergent LLM Key with Gemini 2.0 Flash

## User Personas
1. **Workshop Owner** - Manages job cards, invoices, and staff
2. **Service Advisor** - Interacts with customers, uses AI for diagnostics
3. **Technician** - Updates job status, completes PDI checklists
4. **Customer** - Receives approval links, views service history

## Core Requirements
- [x] Claude-like AI chat interface with automobile expertise
- [x] Job card CRUD with state machine workflow
- [x] Dashboard with real-time metrics
- [x] Dark theme with brand orange (#E8952F) accent
- [x] Mobile-responsive design
- [x] MG Fleet management module
- [x] Invoice generation with GST support
- [x] PDI Checklist with interactive modal
- [x] 17-Section Job Card Detail Page (MEGA TEMPLATE)

## What's Been Implemented

### February 14, 2026 - Update 20 (Backend Data Integration Complete)
56. **Backend Now Fully Connected to MongoDB**:
    - All 5 job cards seeded with complete data:
      - Vehicle records (make, model, VIN, odometer, insurance, etc.)
      - Customer records (contact, visit history, lifetime value, preferences)
      - Services (4 types per job card with technician assignments)
      - Parts (5 types per job card with pricing and availability)
      - Timeline entries with activity tracking
    - All API endpoints returning REAL data from database
    - Pre-inspection checklist data stored in job cards
    - Payment calculations now dynamic based on parts/services

57. **Verified Working API Endpoints**:
    - `GET /api/job-cards/{id}/detail` - Returns complete job card with vehicle, customer, services, parts, payment
    - `GET /api/job-cards/{id}/insights` - AI-generated predictions and health score
    - `GET/POST /api/job-cards/{id}/notes` - Internal notes management
    - `GET /api/job-cards/{id}/timeline` - Activity timeline
    - `POST /api/job-cards/{id}/signature` - Digital signature storage
    - `POST /api/files/upload` - Photo uploads with file validation

### Previous Updates Summary
- **Update 19**: Digital Signature, Photo Upload, Email Invoice with Resend
- **Update 17**: 17-Section Job Card Detail Page (MEGA TEMPLATE)
- **Update 16**: Guided Product Tour (React Joyride)
- **Update 15**: WhatsApp Notifications (MOCKED), Voice Input (Whisper)
- **Update 12-13**: Claude.ai-Style Frontend Rebuild

## Routes
### App Routes (Sidebar Navigation)
- `/` - Login Page (default)
- `/app` - Dashboard
- `/app/dashboard` - Dashboard
- `/app/job-cards` - Job Cards Management
- `/app/job-cards/:id` - Job Card Detail (17 sections)
- `/app/pdi` - PDI/Artifacts
- `/app/fleet` - MG Fleet Management  
- `/app/invoices` - Invoices
- `/app/settings` - Settings
- `/app/pricing` - Pricing

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Direct Google OAuth
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Job Cards (FULLY CONNECTED TO MONGODB)
- `GET /api/job-cards` - List all job cards
- `POST /api/job-cards` - Create job card
- `GET /api/job-cards/{id}` - Get single job card
- `PUT /api/job-cards/{id}` - Update job card
- `DELETE /api/job-cards/{id}` - Delete job card
- `GET /api/job-cards/{id}/detail` - **Full details** with vehicle, customer, services, parts, payment
- `GET /api/job-cards/{id}/insights` - AI insights and health score
- `GET /api/job-cards/{id}/notes` - Get internal notes
- `POST /api/job-cards/{id}/notes` - Add internal note
- `GET /api/job-cards/{id}/timeline` - Activity timeline
- `POST /api/job-cards/{id}/timeline` - Add timeline entry
- `POST /api/job-cards/{id}/signature` - Save digital signature
- `GET /api/job-cards/{id}/services` - Get services
- `POST /api/job-cards/{id}/services` - Add service
- `GET /api/job-cards/{id}/parts` - Get parts
- `POST /api/job-cards/{id}/parts` - Add part

### Files
- `POST /api/files/upload` - Upload file/photo
- `GET /api/files` - List files
- `GET /api/files/{id}` - Download file
- `DELETE /api/files/{id}` - Delete file

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/{id}/pdf` - Generate PDF
- `GET /api/invoices/email/status` - Email service status
- `POST /api/invoices/{id}/email` - Email invoice (requires RESEND_API_KEY)

## Database Schema (MongoDB Collections)

### job_cards
```json
{
  "_id": ObjectId,
  "customer_name": string,
  "vehicle_registration": string,
  "status": string,
  "job_card_number": string,
  "priority": string,
  "bay_number": string,
  "technician": string,
  "created_by": string,
  "pre_inspection": object,
  "amount_paid": number,
  "payment_status": string,
  "created_at": datetime,
  "updated_at": datetime
}
```

### vehicles
```json
{
  "_id": ObjectId,
  "job_card_id": string,
  "registration_number": string,
  "make": string,
  "model": string,
  "variant": string,
  "year": number,
  "fuel_type": string,
  "chassis_vin": string,
  "engine_number": string,
  "odometer_reading": number,
  "color": string,
  "insurance_valid_till": string,
  "puc_valid_till": string,
  "last_service_date": string,
  "last_service_km": number,
  "tyre_condition": string
}
```

### customers
```json
{
  "_id": ObjectId,
  "job_card_id": string,
  "name": string,
  "phone": string,
  "email": string,
  "address": string,
  "total_visits": number,
  "lifetime_value": number,
  "rating": number,
  "member_since": string,
  "preferences": array
}
```

### services
```json
{
  "_id": ObjectId,
  "job_card_id": string,
  "service_type": string,
  "description": string,
  "technician": string,
  "priority": string,
  "status": string,
  "estimated_time": string,
  "actual_time": string,
  "cost": number,
  "created_at": datetime
}
```

### parts
```json
{
  "_id": ObjectId,
  "job_card_id": string,
  "name": string,
  "part_number": string,
  "category": string,
  "quantity": string,
  "unit_price": number,
  "total": number,
  "warranty": string,
  "availability": string,
  "availability_note": string,
  "created_at": datetime
}
```

## Backlog (P0/P1/P2)

### P0 - Critical
- [x] All P0 items completed

### P1 - Important
- [x] Backend connected to real MongoDB data
- [x] Digital Signature capture
- [x] Photo Upload functionality
- [ ] **Email Invoice activation** (requires user to provide RESEND_API_KEY)

### P2 - Nice to Have
- [ ] Real WhatsApp integration (currently mocked, requires Twilio credentials)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Export demos to MP4
- [ ] Cloud storage for files (S3/GCS)
- [ ] Refactor JobCardDetailPage.tsx (2500+ lines) into smaller components

## Test Credentials
- **Working**: `testuser@test.com` / `test123456`

## Environment Variables Required
```
# Backend (.env)
MONGO_URL=mongodb://localhost:27017
DB_NAME=eka_ai_db
EMERGENT_LLM_KEY=sk-emergent-xxx
RESEND_API_KEY=re_xxx  # Optional - enables email invoice feature

# Frontend (.env)
VITE_API_URL=https://your-preview-url.com
```

## Project Health
- **Frontend**: Fully functional with 17-section Job Card Detail Page
- **Backend**: All APIs working and connected to MongoDB
- **Database**: 5 job cards with complete vehicle, customer, services, and parts data
- **Email Service**: DISABLED (requires RESEND_API_KEY)
- **WhatsApp**: MOCKED (requires Twilio credentials)

## Next Steps
1. User to provide `RESEND_API_KEY` to enable email invoice feature
2. Consider refactoring JobCardDetailPage.tsx for maintainability
3. Implement real WhatsApp notifications if needed (requires Twilio)
