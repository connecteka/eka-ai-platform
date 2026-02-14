# 🔐 Migrate Secrets from Previous Repository

This guide helps you copy secrets from `ekaaiurgaa-glitch/eka-ai-platform` to `connecteka/eka-ai-platform`.

---

## 📋 Secrets Comparison

### Previous Repository (`ekaaiurgaa-glitch/eka-ai-platform`)

| Secret Name | Used In | Purpose |
|-------------|---------|---------|
| `FIREBASE_SERVICE_ACCOUNT` | firebase-deploy.yml | Firebase deployment |
| `VITE_API_URL` | deploy.yml | Backend API URL |
| `VITE_SUPABASE_URL` | deploy.yml | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | deploy.yml | Supabase public key |
| `AWS_ACCESS_KEY_ID` | deploy.yml | AWS deployment (optional) |
| `AWS_SECRET_ACCESS_KEY` | deploy.yml | AWS deployment (optional) |
| `EC2_HOST` | deploy.yml | EC2 deployment (optional) |
| `EC2_SSH_KEY` | deploy.yml | EC2 SSH key (optional) |

### New Repository (`connecteka/eka-ai-platform`) - REQUIRED

| Secret Name | Used In | Purpose |
|-------------|---------|---------|
| `FIREBASE_TOKEN` | All workflows | Firebase CLI token |
| `GCP_SA_KEY` | deploy-backend.yml | Google Cloud service account |
| `MONGODB_URI` | deploy-backend.yml | MongoDB connection string |
| `GEMINI_API_KEY` | deploy-backend.yml | AI API key |
| `JWT_SECRET` | deploy-backend.yml | JWT signing secret |
| `RESEND_API_KEY` | deploy-backend.yml | Email service (optional) |
| `VITE_SUPABASE_URL` | deploy-frontend.yml | Supabase URL (if using) |
| `VITE_SUPABASE_ANON_KEY` | deploy-frontend.yml | Supabase key (if using) |
| `BACKEND_URL` | deploy-frontend.yml | Production backend URL |

---

## 🔄 Secret Mapping

### What Changes:

| Previous | Current | Action |
|----------|---------|--------|
| `FIREBASE_SERVICE_ACCOUNT` | `FIREBASE_TOKEN` | Generate new CLI token |
| `VITE_API_URL` | `BACKEND_URL` | Same value, different name |
| `VITE_SUPABASE_URL` | `VITE_SUPABASE_URL` | Copy as-is |
| `VITE_SUPABASE_ANON_KEY` | `VITE_SUPABASE_ANON_KEY` | Copy as-is |
| N/A | `GCP_SA_KEY` | Create new Google Cloud SA |
| N/A | `MONGODB_URI` | Create MongoDB Atlas cluster |
| N/A | `GEMINI_API_KEY` | Get from Google AI Studio |
| N/A | `JWT_SECRET` | Generate with openssl |

---

## 🚀 Migration Steps

### Step 1: Extract Secrets from Previous Repo

Go to: https://github.com/ekaaiurgaa-glitch/eka-ai-platform/settings/secrets/actions

Copy these secret values (you'll need them):
1. `VITE_SUPABASE_URL`
2. `VITE_SUPABASE_ANON_KEY`
3. `VITE_API_URL` (will become `BACKEND_URL`)

### Step 2: Generate New Secrets

#### 2.1 Firebase Token
```bash
npm install -g firebase-tools
firebase login:ci
# Copy the token output
```

#### 2.2 Google Cloud Service Account
1. Go to https://console.cloud.google.com/iam-admin/serviceaccounts
2. Select project: `eka-ai-c9d24`
3. Create Service Account: `github-actions-deployer`
4. Grant roles:
   - Cloud Run Admin
   - Service Account User
   - Storage Admin
5. Create Key → JSON → Download
6. Copy entire JSON content

#### 2.3 MongoDB URI
1. Go to https://cloud.mongodb.com/
2. Create free M0 cluster
3. Database Access → Add New User
4. Network Access → Allow from anywhere: `0.0.0.0/0`
5. Clusters → Connect → Drivers → Python
6. Copy connection string

#### 2.4 Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Create API Key
3. Copy the key

#### 2.5 JWT Secret
```bash
openssl rand -hex 32
# Copy the output
```

### Step 3: Add Secrets to New Repo

Go to: https://github.com/connecteka/eka-ai-platform/settings/secrets/actions

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `FIREBASE_TOKEN` | From Step 2.1 |
| `GCP_SA_KEY` | From Step 2.2 (entire JSON) |
| `MONGODB_URI` | From Step 2.3 |
| `GEMINI_API_KEY` | From Step 2.4 |
| `JWT_SECRET` | From Step 2.5 |
| `VITE_SUPABASE_URL` | From Step 1 (previous repo) |
| `VITE_SUPABASE_ANON_KEY` | From Step 1 (previous repo) |
| `BACKEND_URL` | From Step 1 (was `VITE_API_URL`) |

---

## ⚡ Quick Migration Script

Run this PowerShell script to help collect secrets:

```powershell
# Run: .
.\scripts\migrate-secrets-from-previous.ps1
```

This will:
1. Show you what secrets to copy from previous repo
2. Guide you through generating new secrets
3. Create a summary file with all values ready to paste into GitHub

---

## 🔍 Verification

After adding all secrets, verify:

1. Go to: https://github.com/connecteka/eka-ai-platform/settings/secrets/actions
2. You should see 8 secrets listed
3. Trigger a test deployment

---

## 🆘 Troubleshooting

### Firebase deployment fails
```
Error: Failed to authenticate
```
- Verify `FIREBASE_TOKEN` is valid
- Run `firebase login:ci` again to generate new token

### Cloud Run deployment fails
```
Error: Permission denied
```
- Verify `GCP_SA_KEY` has correct roles
- Check service account email matches project

### MongoDB connection fails
```
Error: Connection refused
```
- Verify `MONGODB_URI` format
- Check IP whitelist includes `0.0.0.0/0`
- Test locally: `mongosh "$MONGODB_URI"`

---

## 📊 Summary

| Repository | Firebase Project | Database | Deployment |
|------------|------------------|----------|------------|
| Previous (`ekaaiurgaa-glitch`) | `eka-ai-platform` | Supabase | Firebase + AWS/EC2 |
| Current (`connecteka`) | `eka-ai-c9d24` | MongoDB | Firebase + Cloud Run |

**Key Changes:**
- Different Firebase project
- Changed from Supabase to MongoDB
- Changed from AWS/EC2 to Google Cloud Run
- Added AI governance and new services

---

**Need help?** Check the GitHub Actions logs for detailed error messages after triggering a deployment.
