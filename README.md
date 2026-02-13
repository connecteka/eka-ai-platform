# 🚗 EKA-AI Platform

**Governed Automobile Intelligence System**  
**Go4Garage Private Limited**

[![Production Ready](https://img.shields.io/badge/status-production%20ready-success)](https://github.com/connecteka/eka-ai-platform)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-green)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)](https://mongodb.com)
[![Tests](https://img.shields.io/badge/tests-31%2F31%20passing-success)](./test_reports/)

---

## 🎯 Overview

EKA-AI is a comprehensive automobile workshop management platform powered by AI. It features:

- **AI Chat Assistant** - Claude-like interface for vehicle diagnostics (Gemini 2.0 Flash)
- **Job Card Management** - Full CRUD with state machine workflow
- **Digital Signature Capture** - Canvas-based customer approval
- **Invoice Generation** - GST-compliant PDF invoices with email delivery
- **Vehicle Documentation** - Photo upload and management
- **WhatsApp Notifications** - Customer status updates (Twilio integration)
- **Voice Input** - Speech-to-text transcription (OpenAI Whisper)
- **Guided Product Tour** - First-time user onboarding

---

## 🏗️ Architecture

```
eka-ai-platform/
├── frontend/                     # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # Shadcn/UI components
│   │   │   └── features/        # Feature components (SignaturePad)
│   │   ├── pages/               # Application pages
│   │   ├── hooks/               # Custom React hooks
│   │   └── lib/                 # Utilities
│   └── package.json
│
├── backend/                      # FastAPI (Python)
│   ├── routers/                 # API route handlers
│   │   ├── auth.py              # Authentication
│   │   ├── job_cards.py         # Job card CRUD + insights
│   │   ├── invoices.py          # Invoice + PDF + Email
│   │   ├── chat.py              # AI chat sessions
│   │   ├── files.py             # File uploads
│   │   ├── notifications.py     # WhatsApp notifications
│   │   └── voice.py             # Voice transcription
│   ├── services/                # Business logic
│   │   └── email_service.py     # Resend email integration
│   ├── models/                  # Pydantic schemas
│   ├── utils/                   # Database & security
│   └── requirements.txt
│
├── memory/                       # Project documentation
│   └── PRD.md                   # Product Requirements Document
│
├── test_reports/                # Test results
└── uploads/                     # Uploaded files storage
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB

### Frontend Setup

```bash
cd frontend
yarn install
yarn dev
```

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

### Environment Variables

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8001
```

**Backend** (`backend/.env`):
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=eka_ai
EMERGENT_LLM_KEY=your_key_here

# Optional
RESEND_API_KEY=re_xxxxx          # Email invoices
TWILIO_ACCOUNT_SID=xxxxx         # WhatsApp notifications
TWILIO_AUTH_TOKEN=xxxxx
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

### Job Cards
- `GET /api/job-cards` - List job cards
- `POST /api/job-cards` - Create job card
- `GET /api/job-cards/{id}/detail` - Full job card details
- `GET /api/job-cards/{id}/insights` - AI insights
- `POST /api/job-cards/{id}/signature` - Save digital signature
- `POST /api/job-cards/{id}/notes` - Add internal note

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/{id}/pdf` - Download PDF
- `POST /api/invoices/{id}/email` - Email invoice to customer

### Files
- `POST /api/files/upload` - Upload file (images, documents)
- `GET /api/files/{id}` - Download file

### AI Chat
- `POST /api/chat` - Send message
- `POST /api/chat/stream` - SSE streaming response
- `GET /api/chat/sessions` - List sessions

---

## 🎨 Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| EKA Orange | `#E8820C` | Primary accent, CTAs |
| Go4Garage Purple | `#7433A2` | Secondary, headers |
| Success Green | `#3CB44B` | Status indicators |
| Background | `#FFFFFF` | Light theme base |

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend lint
cd frontend
yarn lint
```

---

## 📄 License

Proprietary - Go4Garage Private Limited © 2025

---

## 🙏 Acknowledgments

- Powered by **Emergent Labs** AI infrastructure
- Built with **Gemini 2.0 Flash** for AI capabilities
- **Resend** for transactional emails
- **Twilio** for WhatsApp notifications
