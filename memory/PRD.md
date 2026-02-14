# EKA-AI Platform - Product Requirements Document

## Original Problem Statement
Build a "launch ready" automobile workshop management platform with AI-powered diagnostics, job card management, and customer approval workflows.

## Core Requirements
- AI-powered vehicle diagnostics and chat
- Job card CRUD operations
- Invoice generation with GST
- Customer approval workflows
- MG Fleet management
- Mobile-responsive UI

## What's Been Implemented

### ✅ Completed (Feb 2026)

**Database Migration (Feb 14, 2026)**
- Migrated from MongoDB to Supabase PostgreSQL
- Created all required tables with proper indexes
- Implemented Row Level Security (RLS)
- Backend usage tracking for plan limits

**Authentication System**
- Email/password registration and login
- Google OAuth integration (configured)
- Session-based authentication with secure cookies
- Usage tracking per user (`/api/auth/usage`)

**Backend APIs**
- `/api/auth/*` - Authentication endpoints
- `/api/job-cards/*` - Job card CRUD
- `/api/invoices/*` - Invoice management
- `/api/chat/*` - AI chat with sessions
- `/api/notifications/*` - Notification system
- `/api/payment/payu/*` - PayU payment gateway

**Frontend**
- Claude.ai-style dark theme
- Mobile-responsive with hamburger menu
- Pricing page with 3 tiers (Starter/Growth/Elite)
- Chat interface post-login

**Integrations Configured**
- Supabase (Database)
- Google OAuth (Client ID + Secret)
- Resend Email (API Key configured)
- PayU Payment Gateway (structure ready)

### ⚠️ Requires User Action

**For Production Deployment:**
1. Set `EMERGENT_LLM_KEY` for AI chat functionality
2. Set PayU merchant credentials (`PAYU_MERCHANT_KEY`, `PAYU_MERCHANT_SALT`)
3. Configure Twilio for WhatsApp notifications (optional)

## Architecture

```
/app
├── backend/                    # FastAPI + Supabase
│   ├── main.py                # Entry point with CORS config
│   ├── routers/               # API route handlers
│   │   ├── auth.py           # Authentication (Supabase)
│   │   ├── chat.py           # AI chat with usage limits
│   │   ├── job_cards.py      # Job card CRUD
│   │   └── ...
│   ├── utils/
│   │   ├── supabase_db.py    # Supabase client functions
│   │   └── database.py       # Compatibility layer
│   └── migrations/
│       └── supabase_schema_complete.sql
└── frontend/                  # React + Vite
    ├── src/
    │   ├── pages/            # Page components
    │   └── components/       # Reusable UI components
    └── .env                  # Supabase + API config
```

## Database Schema (Supabase)

**Existing Tables:**
- `user_profiles` - User accounts with auth
- `workshops` - Workshop entities
- `job_cards` - Service job cards
- `invoices` - GST invoices
- `vehicles` - Vehicle registry

**New Tables (Created Feb 14):**
- `user_sessions` - Auth sessions
- `chat_sessions` - AI chat history
- `subscriptions` - User plans
- `usage_tracking` - Monthly limits
- `notifications` - User notifications

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | Email login |
| `/api/auth/google` | POST | Google OAuth |
| `/api/auth/me` | GET | Current user |
| `/api/auth/usage` | GET | Usage & limits |
| `/api/chat` | POST | AI chat |
| `/api/chat/sessions` | GET/POST | Chat sessions |
| `/api/job-cards` | CRUD | Job card management |

## Subscription Plans

| Plan | Price | AI Queries | Job Cards |
|------|-------|------------|-----------|
| Starter | ₹1,499/mo | 100/mo | 40/mo |
| Growth | ₹2,999/mo | 500/mo | 120/mo |
| Elite | ₹5,999/mo | Unlimited | Unlimited |

## Environment Variables

**Backend (.env):**
```
SUPABASE_URL=https://gymkrbjujghwvphessns.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
GOOGLE_CLIENT_ID=429173688791-...
GOOGLE_CLIENT_SECRET=GOCSPX-...
JWT_SECRET=02831e7d6c...
RESEND_API_KEY=re_iMxNN1kb_...
EMERGENT_LLM_KEY=  # Required for AI
PAYU_MERCHANT_KEY=  # Required for payments
```

**Frontend (.env):**
```
VITE_API_URL=https://chat-deployed.preview.emergentagent.com
VITE_SUPABASE_URL=https://gymkrbjujghwvphessns.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
VITE_GOOGLE_CLIENT_ID=429173688791-...
```

## Test Credentials
- Email: `testuser@ekaai.com`
- Password: `Test123456`

## Backlog / Future Tasks

**P1 - High Priority:**
- [ ] Integrate real PayU payment flow on pricing page
- [ ] Add EMERGENT_LLM_KEY for AI chat
- [ ] Configure WhatsApp notifications (Twilio)

**P2 - Medium Priority:**
- [ ] Implement email notifications (Resend configured)
- [ ] Add subscription upgrade/downgrade flow
- [ ] Export to MP4 feature

**P3 - Low Priority:**
- [ ] Enhanced analytics dashboard
- [ ] Multi-technician accounts for Elite plan
- [ ] Brand customization options

## Changelog

**Feb 14, 2026:**
- Migrated database from MongoDB to Supabase
- Implemented backend usage tracking
- Added plan-based limits (Starter/Growth/Elite)
- Configured Google OAuth credentials
- Configured Resend email API
- Restricted CORS to specific domains
- Created comprehensive SQL migration scripts

**Previous:**
- UI/UX overhaul to Claude.ai style
- Mobile responsiveness fixes
- Repository cleanup
- Production readiness testing
