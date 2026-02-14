# EKA-AI Platform - Product Requirements Document

## Project Overview
**Name:** EKA-AI Platform  
**Type:** Automobile Intelligence System  
**Client:** Go4Garage Private Limited  
**Date Created:** February 2026  
**Last Updated:** February 14, 2026 (Update 28 - Demo Videos & Legal Documents)

## Original Problem Statement
Build the EKA-AI Platform - a comprehensive automobile intelligence system with a Claude-like chat interface for vehicle diagnostics, job card management, and fleet operations.

## Architecture
### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4 with dual theme system
  - **Dark Theme:** Login page, Pricing page, Sidebar (#0D0D0D)
  - **Light Theme:** Main content area (#FAFAFA)
- **Key Components:**
  - EkaChatPage: Claude-like AI chat interface (default landing after login)
  - Job Cards Management with 17-section detail page
  - Dashboard with metrics (PRO feature)
  - MG Fleet Management (PRO feature)
  - Invoice Generation
  - PDI Checklist Generator (PRO feature)

### Backend  
- **Framework:** FastAPI (Python)
- **Database:** MongoDB
- **AI Integration:** Emergent LLM Key with Gemini 2.0 Flash

## Brand Identity
- **Logo:** eka-aı (stylized with amber/orange hyphen and dotless i)
- **Mascot:** Small image without circle border
- **Primary Color:** #F98906 (Amber/Orange)
- **Background Dark:** #0D0D0D
- **Background Light:** #FAFAFA

## Pricing Plans (from eka-ai.in)
| Plan | Price | Job Cards | AI Queries | Features |
|------|-------|-----------|------------|----------|
| STARTER | ₹1,499/mo + GST | 40/month | 100/month | Basic features |
| GROWTH | ₹2,999/mo + GST | 120/month | 500/month | + Analytics, WhatsApp |
| ELITE | ₹5,999/mo + GST | Unlimited | Unlimited | + Fleet, Multi-tech |

## Free Tier Limits
- 10 AI queries per day (stored in localStorage)
- Limited to: Chat, Search, Job Cards, Invoices
- PRO features locked: Dashboard, Fleet Mgmt, PDI Checklist

## User Personas
1. **Workshop Owner** - Manages job cards, invoices, and staff
2. **Service Advisor** - Interacts with customers, uses AI for diagnostics
3. **Technician** - Updates job status, completes PDI checklists
4. **Customer** - Receives approval links, views service history

## Core Requirements
- [x] Claude-like AI chat interface with automobile expertise
- [x] Job card CRUD with state machine workflow
- [x] Dashboard with real-time metrics (PRO)
- [x] Dual theme system (dark sidebar, light content)
- [x] Mobile-responsive design
- [x] MG Fleet management module (PRO)
- [x] Invoice generation with GST support
- [x] PDI Checklist with interactive modal (PRO)
- [x] 17-Section Job Card Detail Page
- [x] Full-width header on Login Page
- [x] Comprehensive legal footer
- [x] Pricing page synced with eka-ai.in
- [x] Usage limits for free tier
- [x] PRO badges on premium features

## What's Been Implemented

### February 14, 2026 - Update 27 (Launch Ready UI Overhaul)

**Priority 1 Complete:**
1. **Chat-First Experience**: Login now redirects to `/app/chat` (not dashboard)
2. **Dual Theme System**: Dark sidebar (#0D0D0D) + Light content area (#FAFAFA)
3. **Brand Consistency**: "eka-aı" branding with mascot across all pages
4. **PRO Badges**: Dashboard, Fleet Mgmt, PDI Checklist marked with lock icons
5. **Usage Limits**: 10 free queries/day with visual indicator
6. **Upgrade Flow**: Upgrade buttons in sidebar, topbar, and chat page

**Priority 2 Complete:**
7. **Pricing Page**: 3 tiers (STARTER ₹1,499, GROWTH ₹2,999, ELITE ₹5,999)
8. **Search Page**: New `/app/search` page added
9. **Sidebar Navigation**: Chat, Search, Job Cards, Invoices (FREE) | Dashboard, Fleet, PDI (PRO)
10. **Routing Fix**: All `/app/*` routes now use EkaAppShell consistently

**Files Modified:**
- `frontend/src/components/layout/EkaSidebar.tsx` - Complete rewrite with PRO badges
- `frontend/src/components/layout/EkaTopBar.tsx` - White theme, upgrade button, mascot
- `frontend/src/components/layout/EkaAppShell.tsx` - White background for content
- `frontend/src/pages/EkaChatPage.tsx` - Light theme, usage limits, PRO chip
- `frontend/src/pages/PricingPage.tsx` - Complete rewrite with 3 tiers from eka-ai.in
- `frontend/src/pages/EkaSearchPage.tsx` - NEW search page
- `frontend/src/pages/LoginPage.tsx` - Updated branding to "eka-aı"
- `frontend/src/EkaAppRouter.tsx` - Default redirect to chat, added all routes
- `frontend/src/App.tsx` - Fixed routing conflict (removed duplicate /app/* routes)

### Previous Updates Summary
- **Update 26**: UI Revert Verification (git reset)
- **Update 25**: EKA Claude.ai-style UI Integration
- **Update 24**: Full-Width Header & Legal Compliance
- **Update 23**: Final Launch Version Design
- **Update 22**: Brand color updates
- **Update 21**: JobCardDetailPage refactoring

## Routes

### Public Routes
- `/` - Login Page (default)
- `/login` - Login Page (alias)
- `/pricing` - Pricing Page (3 tiers)
- `/legal` - Legal Information

### App Routes (`/app/*` - all use EkaAppShell)
- `/app` → Redirects to `/app/chat`
- `/app/chat` - EkaChatPage (AI chat, DEFAULT after login)
- `/app/search` - EkaSearchPage
- `/app/job-cards` - JobCardsPage
- `/app/job-cards/:id` - JobCardDetailPage
- `/app/invoices` - InvoicesPage
- `/app/dashboard` - EkaDashboardPage (PRO)
- `/app/mg-fleet` - MGFleetPage (PRO)
- `/app/pdi` - PDIPage (PRO)
- `/app/settings` - SettingsPage

### Legacy Routes (AppShell - for backwards compatibility)
- `/dashboard`, `/job-cards`, `/invoices`, `/settings`, etc.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Job Cards
- `GET /api/job-cards` - List all job cards
- `POST /api/job-cards` - Create job card
- `GET /api/job-cards/{id}` - Get single job card
- `PUT /api/job-cards/{id}` - Update job card
- `GET /api/job-cards/{id}/detail` - Full details

## Testing Status
- **Iteration 19**: Priority 1 tests - 100% pass (12/12)
- **Iteration 20**: Priority 2 tests - Found sidebar inconsistency
- **Iteration 21**: Retest after fix - 100% pass (9/9)

**Test Reports:** `/app/test_reports/iteration_21.json`

## Test Credentials
- **Email:** `testuser@test.com`
- **Password:** `test123456`

## Backlog

### P1 - Important
- [ ] Backend enforcement of usage limits
- [ ] Payment gateway integration (currently shows alert)
- [ ] Email Invoice activation (requires RESEND_API_KEY)

### P2 - Nice to Have
- [ ] WhatsApp integration (requires Twilio)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Export demos to MP4

## Project Health
- **Frontend**: ✅ Launch ready with dual theme system
- **Backend**: ✅ All APIs working
- **Database**: ✅ Connected to MongoDB
- **Pricing**: ✅ Synced with eka-ai.in
- **Usage Limits**: ⚠️ Client-side only (localStorage)
- **Payments**: ⚠️ MOCKED (shows alert)
