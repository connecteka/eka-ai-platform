# GitHub Actions Secrets Setup Guide

This guide explains how to set up all required secrets for automated deployment via GitHub Actions.

---

## 📋 Required Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

### 🔥 Firebase Secrets

| Secret Name | How to Get | Description |
|-------------|------------|-------------|
| `FIREBASE_TOKEN` | `firebase login:ci` | CI token for Firebase deployment |

**Get FIREBASE_TOKEN:**
```bash
npm install -g firebase-tools
firebase login:ci
# Copy the token output
```

---

### ☁️ Google Cloud Secrets

| Secret Name | How to Get | Description |
|-------------|------------|-------------|
| `GCP_SA_KEY` | Service Account JSON | Google Cloud service account key |

**Setup Google Cloud Service Account:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `eka-ai-c9d24`
3. IAM & Admin → Service Accounts → Create
4. Name: `github-actions-deployer`
5. Grant roles:
   - Cloud Run Admin
   - Service Account User
   - Storage Admin
   - Cloud Build Service Account
6. Create Key → JSON → Download
7. Copy entire JSON content to `GCP_SA_KEY` secret

---

### 🗄️ Database Secrets

| Secret Name | How to Get | Description |
|-------------|------------|-------------|
| `MONGODB_URI` | MongoDB Atlas | MongoDB connection string |

**Get MongoDB URI:**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create cluster (free tier M0)
3. Database Access → Add New Database User
4. Network Access → Add IP Address → Allow from anywhere (0.0.0.0/0)
5. Clusters → Connect → Drivers → Python
6. Copy connection string, replace `<password>`
7. Format: `mongodb+srv://username:password@cluster.mongodb.net/eka-ai`

---

### 🔐 Application Secrets

| Secret Name | How to Get | Description |
|-------------|------------|-------------|
| `GEMINI_API_KEY` | Google AI Studio | Gemini API key for AI |
| `JWT_SECRET` | Generate | Secret key for JWT tokens |
| `RESEND_API_KEY` | Resend.com | Email service API key (optional) |

**Get GEMINI_API_KEY:**
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Get API Key → Create API Key
3. Copy to secret

**Generate JWT_SECRET:**
```bash
openssl rand -hex 32
# Copy output to JWT_SECRET
```

**Get RESEND_API_KEY (Optional):**
1. Sign up at [Resend](https://resend.com)
2. API Keys → Create API Key
3. Copy to secret

---

### 🌐 Supabase Secrets (if using)

| Secret Name | How to Get | Description |
|-------------|------------|-------------|
| `VITE_SUPABASE_URL` | Supabase Project | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Project | Supabase anon/public key |

**Get Supabase credentials:**
1. Go to [Supabase](https://supabase.com)
2. Select project → Settings → API
3. Copy URL and anon key

---

### 🔗 Backend URL (for frontend)

| Secret Name | How to Get | Description |
|-------------|------------|-------------|
| `BACKEND_URL` | After first backend deploy | Cloud Run backend URL |

**Get after first deployment:**
```bash
gcloud run services describe eka-ai-backend --region us-central1 --format="value(status.url)"
```

---

## 📝 Secrets Summary

You need to create these **8 secrets**:

```
FIREBASE_TOKEN          - From: firebase login:ci
GCP_SA_KEY              - From: Google Cloud Console (JSON)
MONGODB_URI             - From: MongoDB Atlas
GEMINI_API_KEY          - From: Google AI Studio
JWT_SECRET              - From: openssl rand -hex 32
RESEND_API_KEY          - From: Resend.com (optional)
VITE_SUPABASE_URL       - From: Supabase (optional)
VITE_SUPABASE_ANON_KEY  - From: Supabase (optional)
BACKEND_URL             - From: First backend deployment
```

---

## 🚀 Deployment Workflows

Once secrets are set up, deployments happen automatically:

### Full Stack Deployment
```bash
# Push to main branch triggers:
.github/workflows/deploy-full-stack.yml
# - Tests → Build → Deploy Backend → Deploy Frontend
```

### Backend Only
```bash
# Push changes to backend/ folder triggers:
.github/workflows/deploy-backend.yml
```

### Frontend Only
```bash
# Push changes outside backend/ triggers:
.github/workflows/deploy-frontend.yml
```

---

## ✅ Manual Deployment

You can also trigger manually:

1. Go to GitHub repo → Actions
2. Select workflow (e.g., "Deploy Full Stack")
3. Click "Run workflow"
4. Choose options:
   - Deploy Backend: Yes/No
   - Deploy Frontend: Yes/No

---

## 🔍 Troubleshooting

### Firebase deployment fails
- Check `FIREBASE_TOKEN` is valid
- Verify Firebase project ID: `eka-ai-c9d24`
- Ensure `.firebaserc` has correct project

### Cloud Run deployment fails
- Check `GCP_SA_KEY` has required permissions
- Verify service account roles
- Check API is enabled: `gcloud services enable run.googleapis.com`

### MongoDB connection fails
- Check `MONGODB_URI` format
- Verify IP whitelist includes `0.0.0.0/0`
- Test connection locally: `mongosh "$MONGODB_URI"`

---

## 📊 Deployment Status

Check deployment status:
- **Frontend:** https://eka-ai-c9d24.web.app
- **Backend:** Check Cloud Run console or GitHub Actions logs

---

## 🆘 Emergency Rollback

If deployment fails:

```bash
# Rollback Cloud Run
gcloud run services update-traffic eka-ai-backend --to-revisions=LATEST=0,PREVIOUS=100

# Rollback Firebase (use previous version)
firebase hosting:clone eka-ai-c9d24:live eka-ai-c9d24:rollback --token "$FIREBASE_TOKEN"
```

---

**Questions?** Check GitHub Actions logs for detailed error messages.
