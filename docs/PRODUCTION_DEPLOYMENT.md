# Production Deployment Guide

Complete guide for deploying EKA-AI Platform to production (Firebase + Cloud Run).

---

## 🚀 Quick Start (One-Click Deploy)

### Prerequisites
- Google Cloud SDK (`gcloud`) installed
- Firebase CLI (`firebase-tools`) installed
- Node.js 20+ and npm
- Access to Google Cloud project: `named-dialect-486912-c7`

### Option 1: Automated Script (Recommended)

```powershell
# In PowerShell (Cloud Shell or local)
./scripts/manual-deploy.ps1
```

### Option 2: Manual Steps

```powershell
# 1. Build frontend
npm ci
npm run build

# 2. Deploy backend to Cloud Run
gcloud run deploy eka-ai-backend `
  --source ./backend `
  --platform managed `
  --region asia-south1 `
  --allow-unauthenticated `
  --set-env-vars="SUPABASE_URL=xxx,SUPABASE_KEY=xxx" `
  --memory 512Mi

# 3. Get backend URL
$BACKEND_URL = gcloud run services describe eka-ai-backend --region asia-south1 --format "value(status.url)"

# 4. Deploy frontend to Firebase
firebase deploy --only hosting
```

---

## 📋 Pre-Deployment Checklist

- [ ] All tests passing (`npm run test:run`)
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Environment variables configured in `.env`
- [ ] Supabase credentials available
- [ ] Firebase CLI authenticated (`firebase login`)
- [ ] GCloud CLI authenticated (`gcloud auth login`)

---

## 🔐 Required Secrets

### Local `.env` File
```bash
# Supabase
SUPABASE_URL=https://gymkrbjujghwvphessns.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIs...

# PayU (for payments)
PAYU_KEY=your_payu_key
PAYU_SALT=your_payu_salt

# Frontend
VITE_SUPABASE_URL=https://gymkrbjujghwvphessns.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_API_URL=https://eka-ai-backend-xxxxx.a.run.app
```

### GitHub Secrets (for CI/CD)

| Secret Name | Description |
|-------------|-------------|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON key |
| `GCP_SA_KEY` | Google Cloud service account key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase service role key |
| `VITE_SUPABASE_URL` | Same as above (for frontend) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (for frontend) |
| `VITE_API_URL` | Cloud Run backend URL |

---

## 📁 Deployment Files Reference

| File | Purpose |
|------|---------|
| `.github/workflows/deploy-production.yml` | CI/CD pipeline |
| `.github/workflows/prebuild-check.yml` | Pre-merge validation |
| `.github/workflows/firebase-deploy.yml` | Frontend-only deploy |
| `scripts/manual-deploy.ps1` | Manual deployment script |
| `backend/Dockerfile` | Backend container config |
| `backend/.gcloudignore` | Cloud Run build exclusions |
| `firebase.json` | Firebase hosting config |

---

## 🐛 Troubleshooting

### Backend Deploy Fails
```bash
# Check service account permissions
gcloud projects add-iam-policy-binding named-dialect-486912-c7 `
  --member="serviceAccount:YOUR-SA@named-dialect-486912-c7.iam.gserviceaccount.com" `
  --role="roles/run.admin"

# Verify env vars are set
gcloud run services describe eka-ai-backend --region asia-south1

# View logs
gcloud logging tail "run.googleapis.com%2Frequests" --freshness=1h
```

### Frontend Deploy Fails
```bash
# Re-authenticate Firebase
firebase logout
firebase login

# Check project is correct
firebase projects:list
firebase use eka-ai-platform
```

### Database Connection Issues
- Verify Supabase IP allowlist includes Cloud Run IPs
- Check `SUPABASE_KEY` has service_role access
- Verify RLS policies are configured

---

## 📊 Post-Deployment Verification

### Health Checks
```bash
# Backend health
curl https://eka-ai-backend-xxxxx.a.run.app/api/health

# Frontend accessible
open https://eka-ai-platform.web.app
```

### Smoke Tests
1. Login with test credentials
2. Create a job card
3. Generate an invoice
4. Check MG Fleet view
5. Verify dark theme displays correctly

---

## 🔄 Rollback Procedures

### Backend Rollback
```bash
# List revisions
gcloud run revisions list --service eka-ai-backend --region asia-south1

# Rollback to previous revision
gcloud run services update-traffic eka-ai-backend \
  --region asia-south1 \
  --to-revisions LATEST-1=100
```

### Frontend Rollback
```bash
# Firebase hosting keeps previous versions automatically
# Check Firebase Console > Hosting for rollback options
```

---

## 📞 Support

- **Backend Issues**: Check Cloud Run logs in Google Cloud Console
- **Frontend Issues**: Check Firebase Hosting console
- **Database Issues**: Check Supabase Dashboard > Logs
- **CI/CD Issues**: Check GitHub Actions tab in repository
