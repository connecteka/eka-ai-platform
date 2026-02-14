# EKA-AI Platform

**Governed Automobile Intelligence** - AI-powered diagnostics and workshop management for automobile service centers.

## 🚀 Features

- **AI Chat Interface** - Claude-like experience for vehicle diagnostics
- **Job Card Management** - Create, track, and manage service jobs
- **Invoice Generation** - GST-compliant billing with digital signatures
- **Fleet Management** - Multi-vehicle tracking for enterprise clients (PRO)
- **Analytics Dashboard** - Business insights and performance metrics (PRO)

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Shadcn/UI |
| Backend | FastAPI (Python) |
| Database | MongoDB |
| Hosting | Firebase Hosting (Frontend) |

## 📁 Project Structure

```
eka-ai-platform/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom hooks
│   │   └── lib/        # Utilities
│   ├── .env.production # Production env vars
│   ├── firebase.json   # Firebase config
│   └── .firebaserc     # Firebase project
├── backend/            # FastAPI backend
│   ├── routes/         # API routes
│   ├── models/         # Data models
│   └── main.py         # Entry point
└── memory/             # Documentation
```

## 🚀 Deployment

### Frontend (Firebase Hosting)

```bash
cd frontend
npm install
npm run build
firebase login
firebase deploy --only hosting
```

**Live URL:** https://eka-ai-c9d24.web.app

### Backend (Railway/Render/Cloud Run)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🔧 Environment Variables

### Frontend (`frontend/.env.production`)
```
VITE_API_URL=https://your-backend-url.com
VITE_GOOGLE_CLIENT_ID=your-oauth-client-id
```

### Backend (`backend/.env`)
```
MONGO_URL=mongodb://...
DB_NAME=eka_ai
```

## 📄 License

MIT License - Go4Garage Private Limited

## 📞 Contact

- **Website:** https://eka-ai.in
- **Email:** connect@go4garage.in
- **CIN:** U74999KA2024PTC189XXX
