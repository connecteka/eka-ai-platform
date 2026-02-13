# EKA-AI Platform - Product Requirements Document

## Project Overview
**Name:** EKA-AI Platform  
**Type:** Automobile Intelligence System  
**Client:** Go4Garage Private Limited  
**Date Created:** February 2026  

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

## What's Been Implemented
### February 13, 2026
1. ✅ Full-stack setup with Vite + FastAPI + MongoDB
2. ✅ AI Chat with Gemini integration (Emergent LLM Key)
3. ✅ Job Cards CRUD with statistics
4. ✅ Dashboard page with metrics
5. ✅ Login/Registration system
6. ✅ Dark theme implementation
7. ✅ Responsive navigation

### February 13, 2026 - Update 5
19. ✅ Added **Real App Screen Recordings** for demos:
    - **Chat Demo**: 3 real screenshots (empty chat, message typed, AI response with diagnostics)
    - **Dashboard Demo**: Real screenshot showing $45K revenue, 2350 subscriptions, recent sales
    - Both marked with **"Live Recording"** green badge
20. ✅ **Smooth Transition Animations** between steps:
    - Fade-out/scale-down on exit (300ms)
    - Fade-in/scale-up on enter (500ms)
    - Black overlay during transition
21. ✅ **Interactive Cursor Hotspots**:
    - Animated cursor pointer on active areas
    - Ripple/ping effect around cursor
    - Context labels (e.g., "Type Here", "Send")
22. ✅ **Enhanced UI**:
    - Progress bar with segment markers for each step
    - "Restart" button in controls
    - "Playing/Paused" status indicator
    - Scan line effect on real recordings for video feel
    - Browser chrome (red/yellow/green buttons) for authenticity

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

## Next Tasks
1. Implement real SSE streaming for AI chat
2. Add file upload capability
3. Integrate PDF generation for invoices
4. Add authentication middleware (JWT)
