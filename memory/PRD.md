# EKA-AI Platform - Product Requirements Document

## Project Overview
**Name:** EKA-AI Platform  
**Type:** Automobile Intelligence System  
**Client:** Go4Garage Private Limited  
**Date Created:** February 2026  
**Last Updated:** February 14, 2026 (Update 25 - EKA Claude.ai-style UI Integration)

## Original Problem Statement
Build the EKA-AI Platform - a comprehensive automobile intelligence system with a Claude-like chat interface for vehicle diagnostics, job card management, and fleet operations.

## Architecture
### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4 with warm cream light theme
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
- [x] Warm cream light theme with amber (#F98906) accent
- [x] Mobile-responsive design
- [x] MG Fleet management module
- [x] Invoice generation with GST support
- [x] PDI Checklist with interactive modal
- [x] 17-Section Job Card Detail Page (MEGA TEMPLATE)
- [x] **Full-width header on Login Page**
- [x] **Comprehensive legal footer with all compliance links**
- [x] **Complete Legal Page (Privacy, Terms, Refund, Cookies, GDPR)**
- [x] **NEW: EKA Claude.ai-style UI for /app/* routes**
- [x] **NEW: useLocalUser hook (no Supabase dependency)**

## What's Been Implemented

### February 14, 2026 - Update 25 (EKA Claude.ai-style UI Integration)
64. **New EKA App Router (EkaAppRouter.tsx)**:
    - Handles all `/app/*` routes with nested routing
    - Routes: dashboard, chat, chats, job-cards, invoices, mg-fleet, settings
    - Auto-redirect from `/app` to `/app/dashboard`

65. **useLocalUser Hook (src/hooks/useLocalUser.ts)**:
    - Custom authentication hook using localStorage
    - Reads `token` and `user` from localStorage
    - JSON parsing with error handling
    - Multi-tab sync via storage events
    - signOut clears storage and redirects to /login
    - **No Supabase dependency**

66. **EkaAppShell Updated**:
    - Uses useLocalUser instead of useAuth
    - Dark theme sidebar + topbar
    - Proper auth flow with redirect to /login if not authenticated

67. **EkaSidebar Updated**:
    - Uses useLocalUser hook
    - Sign out functionality clears localStorage

68. **EkaTopBar Updated**:
    - Uses useLocalUser hook  
    - Displays user info from localStorage

### February 14, 2026 - Update 24 (Full-Width Header & Legal Compliance)
61. **LoginPage Full-Width Header Implementation**:
    - Header now spans entire page width above both columns
    - Contains: Logo, navigation links (Meet EKA-AI, Pricing, Contact sales), Try EKA-AI button
    - Mobile menu button for responsive design
    - Clean dark theme with amber (#F98906) accent

62. **Comprehensive Legal Footer**:
    - Full-width footer with 4-column grid layout
    - Brand column: Logo, company name, CIN number
    - Product links: Features, Pricing, API Documentation, Integrations
    - Company links: About Us, Careers, Blog, Contact
    - **Legal links**: Privacy Policy, Terms of Service, Refund Policy, Cookie Policy, GDPR Compliance
    - Trust badges: SSL Secured, GDPR Compliant, ISO 27001
    - Social links: Twitter/X, LinkedIn, GitHub
    - Copyright notice with year

63. **Enhanced Legal Page (LegalPage.tsx)**:
    - Complete rewrite with dark theme matching LoginPage
    - Quick navigation tabs for all 5 sections
    - **Privacy Policy**: Data collection, usage, sharing, security, retention, rights
    - **Terms of Service**: Acceptance, service description, user responsibilities, pricing, liability
    - **Refund & Cancellation Policy**: Cancellation process, eligibility, non-refundable items, process
    - **Cookie Policy**: Types of cookies, management, third-party cookies
    - **GDPR Compliance**: Legal basis, data subject rights, data transfers, DPO contact
    - Contact Us section with email, phone, and address
    - Hash-based navigation (#privacy, #terms, #refund, #cookies, #gdpr)
    - Back to Home link in header

### February 14, 2026 - Update 23 (FINAL LAUNCH VERSION)
60. **Complete Design System Overhaul - Launch Ready**:
    - **Primary Color**: `#F98906` (Amber) with dark text `#1A1A1A`
    - **Background**: `#FFF5E6` (Warm Cream)
    - **Typography**: Elegant serif fonts (Playfair Display, Source Serif 4)

### Previous Updates Summary
- **Update 22**: Brand color updated to coral (#da7756)
- **Update 21**: JobCardDetailPage refactored (2500+ lines → 243 lines + 10 components)
- **Update 20**: Backend fully connected to MongoDB with real data
- **Update 19**: Digital Signature, Photo Upload, Email Invoice with Resend
- **Update 17**: 17-Section Job Card Detail Page (MEGA TEMPLATE)
- **Update 16**: Guided Product Tour (React Joyride)
- **Update 15**: WhatsApp Notifications (MOCKED), Voice Input (Whisper)
- **Update 12-13**: Claude.ai-Style Frontend Rebuild

## Routes
### App Routes (Sidebar Navigation)
- `/` - Login Page (default)
- `/login` - Login Page (alias)
- `/legal` - Legal Information (Privacy, Terms, Refund, Cookies, GDPR)
- `/pricing` - Pricing Page

### NEW: EKA Claude.ai-style UI Routes (`/app/*`)
- `/app` - Redirects to `/app/dashboard`
- `/app/dashboard` - EkaDashboardPage (4 KPI cards, charts)
- `/app/chat` - EkaChatPage (AI chat interface)
- `/app/chats` - ChatsPage (chat history)
- `/app/job-cards/*` - JobCardsPage
- `/app/invoices` - InvoicesPage
- `/app/mg-fleet` - MGFleetPage
- `/app/settings` - SettingsPage

### Original Routes (Legacy)
- `/dashboard` - Dashboard (original light theme)
- `/job-cards` - Job Cards Management
- `/job-cards/:id` - Job Card Detail (17 sections)
- `/pdi` - PDI/Artifacts
- `/fleet` - MG Fleet Management  
- `/invoices` - Invoices
- `/settings` - Settings

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password (✅ Tested)
- `POST /api/auth/google` - Direct Google OAuth
- `GET /api/auth/me` - Get current user (✅ Tested)
- `POST /api/auth/logout` - Logout (✅ Tested)

### Job Cards (FULLY CONNECTED TO MONGODB)
- `GET /api/job-cards` - List all job cards
- `POST /api/job-cards` - Create job card
- `GET /api/job-cards/{id}` - Get single job card
- `PUT /api/job-cards/{id}` - Update job card
- `DELETE /api/job-cards/{id}` - Delete job card
- `GET /api/job-cards/{id}/detail` - Full details with vehicle, customer, services, parts, payment
- `GET /api/job-cards/{id}/insights` - AI insights and health score
- `GET /api/job-cards/{id}/notes` - Get internal notes
- `POST /api/job-cards/{id}/notes` - Add internal note
- `GET /api/job-cards/{id}/timeline` - Activity timeline
- `POST /api/job-cards/{id}/timeline` - Add timeline entry
- `POST /api/job-cards/{id}/signature` - Save digital signature

## Backlog (P0/P1/P2)

### P0 - Critical
- [x] All P0 items completed

### P1 - Important
- [x] Full-width header on Login Page - COMPLETED
- [x] Legal footer with all compliance links - COMPLETED
- [x] Complete Legal Page - COMPLETED
- [ ] **Email Invoice activation** (requires user to provide RESEND_API_KEY)

### P2 - Nice to Have
- [ ] Real WhatsApp integration (currently mocked, requires Twilio credentials)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Export demos to MP4
- [ ] Cloud storage for files (S3/GCS)

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
- **Frontend**: Fully functional with full-width header and legal compliance footer
- **Backend**: All APIs working and connected to MongoDB
- **Database**: 5 job cards with complete vehicle, customer, services, and parts data
- **Legal Compliance**: All required policies in place (Privacy, Terms, Refund, Cookies, GDPR)
- **Email Service**: DISABLED (requires RESEND_API_KEY)
- **WhatsApp**: MOCKED (requires Twilio credentials)

## Testing Status
- **Backend Auth Tests**: 13/13 passing (100%)
- **Frontend Tests**: All UI elements verified
- **Test Report**: /app/test_reports/iteration_16.json

## Next Steps
1. User to provide `RESEND_API_KEY` to enable email invoice feature
2. Consider implementing real WhatsApp integration (requires Twilio)
3. Add advanced analytics features
