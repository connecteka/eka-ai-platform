# EKA-AI Platform

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/eka-ai-platform)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Governed Automobile Intelligence Platform** for automobile workshops and fleet management.

## 🚗 Overview

EKA-AI is India's first governed AI platform for the automobile industry. It provides intelligent solutions for:

- 🔧 **Job Card Management** - Digital job cards with AI-powered diagnostics
- 📊 **Fleet Management** - MG Fleet tracking and maintenance
- 💰 **GST Invoicing** - Automated invoice generation with PDF export
- 🤖 **AI Diagnostics** - Vehicle diagnostic assistance using Gemini AI
- 🔐 **Customer Approvals** - Digital approval workflow for estimates

## 📚 Documentation

Complete documentation is available via **GitBook**:

👉 **[View Documentation](https://docs.eka-ai.in)** *(Update with your actual GitBook URL)*

Or browse the documentation locally:
- [Getting Started](./getting-started/)
- [Introduction](./introduction/)
- [Core Modules](./core-modules/)
- [MG Fleet & Finance](./mg-fleet-and-finance/)
- [Legal & Compliance](./legal-and-compliance/)

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Frontend│────▶│  FastAPI Backend│────▶│  MongoDB Atlas  │
│   (Vite + TS)   │     │  (Python 3.11)  │     │  (Database)     │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │  Redis   │  │Supabase  │  │  Gemini  │
            │ (Cache)  │  │ (Auth)   │  │   AI     │
            └──────────┘  └──────────┘  └──────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- MongoDB Atlas account
- Supabase account
- Redis (optional, for caching)

### Installation

```bash
# Clone the repository
git clone https://github.com/connecteka/eka-ai-platform.git
cd eka-ai-platform

# Install frontend dependencies
npm install

# Install backend dependencies
pip install -r backend/requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
# Frontend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:8001

# Backend
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/eka_ai
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-key
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-key
REDIS_URL=redis://localhost:6379
```

## 🐳 Docker Deployment

```bash
# Build the image
docker build -t eka-ai-platform .

# Run the container
docker run -p 8001:8001 --env-file .env eka-ai-platform
```

## ☁️ Railway Deployment

1. Fork this repository
2. Create a new project on [Railway](https://railway.app)
3. Connect your GitHub repository
4. Add the required environment variables
5. Deploy!

## 📝 Features

### Job Cards
- Create and manage digital job cards
- Track vehicle service history
- AI-powered diagnostic suggestions
- Customer approval workflow
- Digital signatures

### Invoicing
- GST-compliant invoice generation
- Automatic tax calculations (CGST/SGST/IGST)
- PDF generation with WeasyPrint
- Payment integration (PayU)

### Fleet Management
- MG Fleet vehicle tracking
- Service scheduling
- Recall management
- PDI (Pre-Delivery Inspection) checklists

### AI Integration
- Vehicle diagnostic assistance
- Natural language queries
- Gemini AI-powered recommendations

## 🛠️ Tech Stack

**Frontend:**
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- React Router v7

**Backend:**
- FastAPI
- Python 3.11
- MongoDB (Motor)
- Supabase
- Redis
- WeasyPrint (PDF)

**Infrastructure:**
- Railway (Hosting)
- MongoDB Atlas (Database)
- Supabase (Auth/Storage)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Developed by **Go4Garage Private Limited**

---

<p align="center">
  Made with ❤️ for automobile workshops across India
</p>
