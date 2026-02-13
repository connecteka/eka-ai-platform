# EKA-AI Platform - Product Requirements Document

## Project Overview
**Name:** EKA-AI Platform  
**Type:** Automobile Intelligence System  
**Client:** Go4Garage Private Limited  
**Date Created:** February 2026  
**Last Updated:** February 13, 2026 (Update 17)

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

### February 13, 2026 - Update 11 (Video Demo Recordings)
39. ✅ **Feature Video Carousel with Real Recordings** (User Video Request):
    - Created actual screen recordings of app features using Playwright
    - Videos auto-play in the feature carousel on login page
    - "Live Recording" badge displayed on each video
    - Recorded demos: PDI Process, Job Cards, AI Chat, Dashboard
    - Videos stored in `/videos/*.webm` format
    - Each carousel slide now shows the actual app in action
    - Videos loop continuously with muted audio

### February 13, 2026 - Update 12 (Claude.ai-Style Frontend Rebuild)
40. ✅ **Phase 1: Claude.ai-Style Layout Architecture** (User Build Request):
    - **AppShell.tsx**: New master authenticated layout component
      - Wraps all protected routes with sidebar + topbar + content area
      - Context provider for intelligenceMode and sidebar state
      - Loading screen while checking authentication
      - Auto-redirect to login if not authenticated
    - **Sidebar.tsx**: Complete Claude.ai-style sidebar rebuild
      - Collapsible design (260px → 64px icon-only mode)
      - Toggle button with smooth animation
      - EKA AI branding with orange logo
      - "New Chat" button that creates session and navigates to /chat
      - Recent chats section grouped by Today/Yesterday/This Week
      - Active chat highlight with orange left border
      - Navigation items with badges (Job Cards shows count)
      - Pro Plan upgrade CTA section
      - User profile display with avatar, name, and email
      - Settings button at bottom
    - **TopBar.tsx**: New minimal sticky header
      - Dynamic page title based on route
      - Model selector dropdown (only visible on /chat)
        - Gemini Flash, Gemini Pro, RAG + Agent options
      - Notification bell with orange indicator
      - User avatar dropdown with Settings and Sign out
    - **DashboardPage.tsx**: Complete rebuild with Recharts
      - 4 KPI cards (Open Job Cards, Completed Today, Revenue, AI Queries)
      - Revenue Trend area chart (30-day data)
      - Job Status donut chart with legend
      - Recent Job Cards table with status badges
      - AI Activity feed
      - "Start AI Chat" button
    - **ChatPage.tsx**: Claude.ai-style chat interface
      - Welcome screen with EKA logo
      - "How can I help with the garage today?" title
      - 4 suggestion chips with icons
      - Messages area with user/AI message bubbles
      - Vehicle context strip (when vehicle detected)
      - Input area with attach, voice, and send buttons
      - SSE streaming integration maintained
      - Model selector in topbar
    - **App.tsx**: Updated routing structure
      - Public routes outside AppShell (/, /login, /pricing, etc.)
      - Protected routes inside AppShell (/app/*, /chat, etc.)
      - OAuth callback handling maintained
    - **Testing**: All 42 features verified working (100% pass rate)

### February 13, 2026 - Update 17 (Market Launch Ready Job Card Detail Page)
47. ✅ **Complete Job Card Detail Page Rebuild (MEGA TEMPLATE)**:
    - **17 SECTIONS IMPLEMENTED**:
      1. **Top Navigation Bar** (sticky) - Go4Garage branding, Job Cards active, search, notifications with badge
      2. **Job Card Header + SLA Timer** - JC-2025-00847, In Progress/High Priority badges, live countdown (04:32:XX)
      3. **Quick Actions Bar** - Call Customer, WhatsApp Update (green), Print Job Card, Export PDF, Gate Pass, Generate Invoice
      4. **Vehicle & Customer Info** - Side-by-side cards with EKA-AI Verified badge, 12 vehicle fields, customer stats (7 Visits, ₹42,800, 4.8⭐)
      5. **Pre-Inspection Checklist + Vehicle Photos** - EXTERIOR/INTERIOR/UNDER HOOD sections, 4 Photos grid with upload
      6. **Service Details / Work Log Table** - 4 services with priority dots, status badges, progress bar (shimmer animation)
      7. **Parts & Inventory Table** - 5 items with warranty badges, availability status (In Stock/Low/Ordered)
      8. **Cost Breakdown + Payment Status** - GST calculations (CGST/SGST), Grand Total ₹10,302 in orange, payment progress bar
      9. **EKA-AI Insights Panel (HERO)** - Gradient background, 3 insight cards (Predictive/Alert/Savings), 🐘 mascot, Ask EKA chat input
      10. **Vehicle Health Score** - Circular score (78/100), sub-system scores (Engine/Brakes/Tyres/AC/Electrical/Body)
      11. **Service History** - Expandable accordion with past job cards, "View Full Job Card" links
      12. **Activity Timeline + Internal Notes** - 13 timeline entries with color-coded dots, chat-style notes with AI auto-notes
      13. **Customer Approval & Digital Signature** - Approved items checklist, OTP-verified signature placeholder
      14. **Customer Feedback / Rating** - 5-star ratings, customer review, EKA-AI Sentiment (Positive 98%)
      15. **Documents & Attachments** - 6 files list with View/Download, drag-and-drop upload area
      16. **Related Job Cards** - 3 cards (Previous/Repeat/Same Owner) with EKA-AI Detected badge
      17. **Footer** - Go4Garage branding, eka-ai. logo, Quick Links, copyright, GSTIN/CIN
    - **Design Token System**: Complete CSS variables for colors, shadows, spacing, typography, z-index, transitions
    - **Brand Colors**: EKA-AI orange (#E8952F), Go4Garage purple (#5B2D8E), green (#3CB44B)
    - **Indian Localization**: ₹ currency with commas, GST (CGST/SGST), UPI, Indian names, vehicle registration (KA 01 AB 1234)
    - **Animations**: SLA countdown (live useEffect timer), pulsing dots, shimmer progress bar, hover transitions
    - **All Data Hardcoded**: Sample data as specified - Maruti Suzuki Swift VXi, Amit Sharma, etc.
    - **Testing**: 100% pass rate - all 17 sections verified working

### February 13, 2026 - Update 16 (Guided Product Tour)
46. ✅ **Guided Product Tour (React Joyride)**:
    - **ProductTour.tsx**: New component with 9-step tour
    - **Tour Steps**:
      1. Welcome to EKA-AI (centered intro)
      2. Navigation Sidebar
      3. Start New Chat button
      4. Dashboard KPI Stats
      5. Revenue Trend chart
      6. Job Cards Management nav
      7. AI Chat Assistant nav
      8. User Profile section
      9. You're All Set (finish with help tip)
    - **Features**:
      - Auto-starts for first-time users (1.5s delay after dashboard load)
      - localStorage persistence (`eka_tour_completed` with version tracking)
      - Returning users don't see tour automatically
      - Help button (?) in TopBar restarts tour anytime
      - Skip Tour option to dismiss early
      - Dark theme styling (#1A1A1B bg, #F45D3D primary)
    - **Data-testids added** for tour targets:
      - Dashboard: `dashboard-stats`, `revenue-chart`
      - Sidebar: `sidebar-nav`, `new-chat-btn`, `nav-job-cards`, `nav-chat`, `user-profile`
      - TopBar: `tour-help-btn`
      - Chat: `chat-input-area`, `voice-input-btn`
      - Job Cards: `job-cards-filter`, `new-job-card-btn`
    - **Testing**: All 14 features verified working (100% pass rate)
    - Created `routers/notifications.py` with full WhatsApp notification infrastructure
    - **Endpoints**:
      - `GET /api/notifications/status` - Check service status
      - `POST /api/notifications/send` - Send custom notification
      - `POST /api/notifications/test` - Send test notification
      - `POST /api/notifications/job-card-update/{id}` - Auto-notify on status change
      - `GET /api/notifications/history` - View notification logs
    - **Status-based message templates** for all 9 job card states
    - **Automatic notification trigger** on job card status transition (via background task)
    - **MOCKED**: Logs to MongoDB instead of sending real WhatsApp messages
    - **To Enable Real WhatsApp**: Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`, `NOTIFICATIONS_ENABLED=true`
45. ✅ **Voice Input Transcription (OpenAI Whisper)**:
    - Created `routers/voice.py` with Whisper-based transcription
    - **Endpoints**:
      - `GET /api/voice/status` - Service status (enabled via EMERGENT_LLM_KEY)
      - `GET /api/voice/supported-languages` - 20+ supported languages
      - `POST /api/voice/transcribe` - Transcribe audio file
      - `POST /api/voice/transcribe-for-chat` - Transcribe for chat input
    - **Frontend integration** in ChatPage.tsx:
      - Voice button with recording state (Mic/MicOff/Loader icons)
      - Recording timer display
      - MediaRecorder API for browser audio capture
      - Auto-transcription and input population
    - **Testing**: All 15 backend tests passed (100% success rate)

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
- [x] ~~Complete Login/Signup flow~~ ✅ COMPLETED (Update 10)

### P1 - Important  
- [x] ~~Refactor backend server.py into separate routers~~ ✅ COMPLETED (Update 14)
- [x] ~~Phase 2 Frontend: InvoicesPage, MGFleetPage, PDIPage rebuilds~~ ✅ COMPLETED (Update 12)
- [x] ~~Phase 3 Frontend: LoginPage dark theme, ChatsPage grouping, StatCard polish~~ ✅ COMPLETED (Update 13)
- [x] ~~Add password hashing for production security~~ ✅ COMPLETED (Update 14)
- [x] ~~WhatsApp integration for notifications~~ ✅ COMPLETED - MOCKED (Update 15)
- [x] ~~Voice input transcription (OpenAI Whisper)~~ ✅ COMPLETED (Update 15)
- [x] ~~Guided product tour for first-time users~~ ✅ COMPLETED (Update 16)
- [ ] Email invoice to customers (SendGrid/Resend)

### P2 - Nice to Have
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Custom system prompts
- [ ] Export demos to MP4
- [ ] Product tour for first-time users
- [ ] Cloud storage for files (S3/GCS)
- [ ] Enhanced sign-up with workshop details (GST, address)

## Next Tasks
1. Email invoice to customers (SendGrid/Resend)
2. Enable real WhatsApp notifications (requires Twilio credentials)
3. Multi-language UI support
4. Export demos to MP4

## Backend Architecture (v3.0)
```
/app/backend/
├── server.py                # Main FastAPI app (minimal, includes routers)
├── routers/
│   ├── auth.py             # Authentication (login, register, OAuth)
│   ├── job_cards.py        # Job cards CRUD & stats + notification trigger
│   ├── chat.py             # AI chat & sessions
│   ├── invoices.py         # Invoice CRUD & PDF
│   ├── mg_fleet.py         # MG Fleet contracts
│   ├── files.py            # File upload/download
│   ├── dashboard.py        # Dashboard metrics
│   ├── notifications.py    # WhatsApp/SMS notifications (MOCKED)
│   └── voice.py            # Voice transcription (Whisper)
├── models/
│   └── schemas.py          # Pydantic models
└── utils/
    ├── database.py         # MongoDB config & utilities
    └── security.py         # Password hashing (bcrypt)
```

## Test Credentials
- **Working**: `testuser@test.com` / `test123456`
- **Previous (invalid)**: `test@test.com` / `password123`
