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

## Routes
### App Routes (Sidebar Navigation)
- `/app` - Dashboard
- `/app/job-cards` - Job Cards Management
- `/app/pdi` - PDI/Artifacts
- `/app/fleet` - MG Fleet Management  
- `/app/invoices` - Invoices
- `/app/settings` - Settings
- `/app/pricing` - Pricing

## API Endpoints
- `GET /api/health` - Health check
- `POST /api/chat` - AI chat with Gemini
- `GET/POST/PUT/DELETE /api/job-cards` - Job cards CRUD
- `GET /api/job-cards/stats` - Job card statistics
- `GET/POST /api/invoices` - Invoice management
- `GET/POST /api/mg/contracts` - MG Fleet contracts
- `GET /api/dashboard/metrics` - Dashboard metrics

## Backlog (P0/P1/P2)
### P0 - Critical
- [ ] Real SSE streaming for AI responses

### P1 - Important  
- [ ] File upload to cloud storage
- [ ] PDF invoice generation
- [ ] WhatsApp integration for notifications
- [ ] Session persistence for chat

### P2 - Nice to Have
- [ ] Voice input transcription
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Custom system prompts
- [ ] Export demos to MP4
- [ ] Product tour for first-time users

## Next Tasks
1. Implement real SSE streaming for AI chat
2. Add file upload capability
3. Integrate PDF generation for invoices
4. Add authentication middleware (JWT)
