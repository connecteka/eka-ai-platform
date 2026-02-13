# EKA-AI Platform - Product Requirements Document

## Project Overview
**Name:** EKA-AI Platform  
**Type:** Automobile Intelligence System  
**Client:** Go4Garage Private Limited  
**Date Created:** February 2026  
**Last Updated:** February 13, 2026

## Original Problem Statement
Build the EKA-AI Platform - a comprehensive automobile intelligence system with a Claude-like chat interface for vehicle diagnostics, job card management, and fleet operations.

## Architecture
### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4 with dark theme
- **Key Components:**
  - ClaudeLikeChat: AI-powered chat interface
  - Job Cards Management
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
- [x] Dark theme with brand orange (#F45D3D) accent
- [x] Mobile-responsive design
- [x] MG Fleet management module
- [x] Invoice generation with GST support
- [x] PDI Checklist with interactive modal

## What's Been Implemented
### February 13, 2026
1. ✅ Full-stack setup with Vite + FastAPI + MongoDB
2. ✅ AI Chat with Gemini integration (Emergent LLM Key)
3. ✅ Job Cards CRUD with statistics
4. ✅ Dashboard page with metrics
5. ✅ Login/Registration system
6. ✅ Dark theme implementation
7. ✅ Responsive navigation

### February 13, 2026 - Update 6
23. ✅ Added **Real Recordings** for Job Cards, MG Fleet, and PDI demos
24. ✅ Fixed Job Cards page crash (null check on `jobCards.filter`)
25. ✅ Added sample job card data (4 test jobs with different statuses)
26. ✅ All 6 demos now have "Live Recording" badge with real app screenshots

### February 13, 2026 - Update 7 (Bug Fixes)
27. ✅ **P0 FIXED**: Job Cards blank screen - Added `/app/*` routes to App.tsx and fixed API baseURL to include `/api` prefix
28. ✅ **P1 FIXED**: PDI/Artifacts page now interactive - Added PDI Checklist modal with vehicle registration, technician inputs, 10-item checklist with Pass/Fail/Photo buttons
29. ✅ **P2 FIXED**: Job Card stats now correct - Backend stats endpoint supports multiple status name formats (Pending/CREATED, In-Progress/IN_PROGRESS, etc.)
30. ✅ Fixed vehicle registration field name mismatch (registration_number vs vehicle_registration)
31. ✅ Added error state UI with retry button for Job Cards page

### February 13, 2026 - Update 8 (Enhancements)
32. ✅ **Interactive Demos Enhanced**: Added zoom and highlight animations to demo screenshots
    - Zoom effect on key UI elements (scale 1.1-1.3x)
    - Pulsing highlight rectangles with corner markers
    - Animated cursor with labels
    - Updated PDI demo to 8 steps with new modal screenshots
    - Updated Job Card demo to 10 steps with form workflow
33. ✅ **New Demo Screenshots Captured**:
    - `jobcard-form-empty.png`: Empty job card creation form
    - `jobcard-form-filled.png`: Filled form with customer data
    - `pdi-modal-empty.png`: PDI checklist modal (empty)
    - `pdi-modal-progress.png`: PDI modal with 3/10 items checked
34. ✅ **SSE Streaming for AI Chat**:
    - New `/api/chat/stream` endpoint with Server-Sent Events
    - Real-time word-by-word streaming display
    - Streaming toggle button in chat UI
    - Session persistence for conversations
    - Animated cursor while streaming

### February 13, 2026 - Update 9 (Major Features)
35. ✅ **Database-backed Chat Session Persistence**:
    - MongoDB collection for chat sessions
    - CRUD endpoints: `/api/chat/sessions` (create, list, get, delete)
    - Add messages to sessions: `/api/chat/sessions/{id}/messages`
    - Auto-title generation from first user message
    - Collapsible sidebar in chat UI showing session history
    - "New Chat" button for creating new sessions
    - Delete sessions with confirmation
36. ✅ **PDF Invoice Generation**:
    - New endpoint: `GET /api/invoices/{id}/pdf`
    - Professional GST invoice format with EKA branding
    - Supports CGST/SGST and IGST tax types
    - Line items table with HSN/SAC codes
    - Auto-calculated totals and tax breakdown
    - Download as attachment with invoice number filename
    - Uses reportlab library
37. ✅ **File Upload Capability**:
    - Upload endpoint: `POST /api/files/upload`
    - Supports images (jpg, png, gif, webp), documents (pdf, doc, docx, xls, xlsx, txt, csv), videos (mp4, mov, avi, webm)
    - 50MB max file size
    - File type detection and validation
    - List files: `GET /api/files` with filters (job_card_id, category, file_type)
    - Download files: `GET /api/files/{id}`
    - Delete files: `DELETE /api/files/{id}`
    - Chunked upload support for large files
    - UI: Paperclip button in chat to attach files

### February 13, 2026 - Update 10 (Authentication System)
38. ✅ **Complete Login/Signup Flow** (User Video Request):
    - Fully functional "Continue with Google" using Emergent-managed Google OAuth
    - Fully functional "Continue with email" with login/signup toggle
    - Google OAuth redirects to `https://auth.emergentagent.com` and exchanges session via `/api/auth/google/session`
    - Email auth with `/api/auth/register` and `/api/auth/login` endpoints
    - Session management with httpOnly cookies and Authorization header fallback
    - `/api/auth/me` endpoint to get current authenticated user
    - `/api/auth/logout` endpoint to clear session
    - MongoDB collections: `users` (with custom `user_id`), `user_sessions`
    - AuthCallback component handles OAuth redirect with session_id
    - Login page checks existing auth and auto-redirects to dashboard
    - Password visibility toggle and sign-in/sign-up mode toggle
    - Error handling with user-friendly messages
    - All tests passed (11/11 backend, all frontend UI flows)

## Routes
### App Routes (Sidebar Navigation)
- `/` - Login Page (default)
- `/app` - Dashboard
- `/app/dashboard` - Dashboard
- `/app/job-cards` - Job Cards Management
- `/app/pdi` - PDI/Artifacts
- `/app/fleet` - MG Fleet Management  
- `/app/invoices` - Invoices
- `/app/settings` - Settings
- `/app/pricing` - Pricing

## API Endpoints
### Authentication
- `POST /api/auth/register` - Register new user with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google/session` - Exchange Google OAuth session_id for user data
- `GET /api/auth/me` - Get current authenticated user (cookie or Bearer token)
- `POST /api/auth/logout` - Logout and clear session
- `GET /api/health` - Health check
- `POST /api/chat` - AI chat with Gemini (standard)
- `POST /api/chat/stream` - AI chat with SSE streaming
- `POST /api/chat/sessions` - Create chat session
- `GET /api/chat/sessions` - List chat sessions
- `GET /api/chat/sessions/{id}` - Get single session with messages
- `POST /api/chat/sessions/{id}/messages` - Add message to session
- `DELETE /api/chat/sessions/{id}` - Delete chat session
- `GET/POST/PUT/DELETE /api/job-cards` - Job cards CRUD
- `GET /api/job-cards/stats` - Job card statistics
- `GET/POST /api/invoices` - Invoice management
- `GET /api/invoices/{id}/pdf` - Generate invoice PDF
- `POST /api/invoices/{id}/mark-paid` - Mark invoice as paid
- `POST /api/files/upload` - Upload file (image/document/video)
- `GET /api/files` - List files with filters
- `GET /api/files/{id}` - Download file
- `DELETE /api/files/{id}` - Delete file
- `POST /api/files/upload-chunk` - Chunked file upload
- `GET/POST /api/mg/contracts` - MG Fleet contracts
- `GET /api/dashboard/metrics` - Dashboard metrics

## Backlog (P0/P1/P2)
### P0 - Critical
- [x] ~~Real SSE streaming for AI responses~~ ✅ COMPLETED
- [x] ~~Database-backed chat session persistence~~ ✅ COMPLETED
- [x] ~~PDF invoice generation~~ ✅ COMPLETED
- [x] ~~File upload capability~~ ✅ COMPLETED

### P1 - Important  
- [ ] WhatsApp integration for notifications
- [ ] Voice input transcription (OpenAI Whisper)
- [ ] Email invoice to customers (SendGrid/Resend)

### P2 - Nice to Have
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Custom system prompts
- [ ] Export demos to MP4
- [ ] Product tour for first-time users
- [ ] Cloud storage for files (S3/GCS)

## Next Tasks
1. Implement real SSE streaming for AI chat
2. Add file upload capability
3. Integrate PDF generation for invoices
4. Add authentication middleware (JWT)
