# Google Cloud Platform (GCP) Migration Guide

Use your existing GCP resources from the previous repository (`ekaaiurgaa-glitch/eka-ai-platform`).

---

## 📋 GCP Resources from Previous Repository

### Previous Repository GCP Setup:
- **Project ID**: `eka-ai-platform`
- **Region**: `asia-south1` (Mumbai)
- **Service**: App Engine (Standard Environment)
- **URL**: `https://eka-ai-platform.el.r.appspot.com`

### Current Repository Changes:
- **Project ID**: `eka-ai-c9d24` (Firebase project)
- **New Deployment**: Cloud Run OR keep using App Engine

---

## 🎯 Option A: Continue Using Previous GCP Project (RECOMMENDED)

Use your existing `eka-ai-platform` GCP project with the new codebase.

### Step 1: Get GCP Service Account Key from Previous Repo

If you have access to the previous repository's secrets:

1. Go to: https://github.com/ekaaiurgaa-glitch/eka-ai-platform/settings/secrets/actions
2. Copy the `GCP_SA_KEY` value
3. Add it to your new repository

### Step 2: OR Create New Service Account Key

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=eka-ai-platform
2. Find service account: `github-actions@eka-ai-platform.iam.gserviceaccount.com`
3. Click on it → **Keys** tab → **Add Key** → **Create new key**
4. Select **JSON** → **Create**
5. Download the JSON file
6. Copy the entire JSON content

### Step 3: Add to GitHub Secrets

Go to: https://github.com/connecteka/eka-ai-platform/settings/secrets/actions

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `GCP_SA_KEY` | Entire JSON content from downloaded key |
| `GCP_PROJECT_ID` | `eka-ai-platform` |

### Step 4: Update Deployment Workflow

The workflow `.github/workflows/deploy-gcp-appengine.yml` is already configured to use your existing GCP project.

### Step 5: Deploy

Push to main branch:
```bash
git add .
git commit -m "deploy: Using existing GCP project eka-ai-platform"
git push origin main
```

---

## 🎯 Option B: Use New Firebase-Linked GCP Project

Use the GCP project linked to your Firebase project (`eka-ai-c9d24`).

### Step 1: Enable Required APIs

1. Go to: https://console.cloud.google.com/apis/dashboard?project=eka-ai-c9d24
2. Enable these APIs:
   - ☑️ Cloud Run API
   - ☑️ Cloud Build API
   - ☑️ Container Registry API

### Step 2: Create Service Account

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=eka-ai-c9d24
2. Click **Create Service Account**
3. Name: `github-actions-deployer`
4. Grant roles:
   - ☑️ Cloud Run Admin
   - ☑️ Service Account User
   - ☑️ Storage Admin
   - ☑️ Cloud Build Service Account
5. Create Key → JSON → Download
6. Copy JSON content to `GCP_SA_KEY` secret

### Step 3: Use Cloud Run Workflow

The workflow `.github/workflows/deploy-backend.yml` is configured for Cloud Run deployment.

---

## 🔧 Required Secrets Comparison

### Using Previous GCP Project (App Engine):
```
GCP_SA_KEY          = Service account JSON from eka-ai-platform
GCP_PROJECT_ID      = eka-ai-platform
FIREBASE_TOKEN      = Your new Firebase token (for hosting)
MONGODB_URI         = MongoDB Atlas connection string
GEMINI_API_KEY      = Google AI Studio API key
JWT_SECRET          = Generated secret
```

### Using New GCP Project (Cloud Run):
```
GCP_SA_KEY          = Service account JSON from eka-ai-c9d24
GCP_PROJECT_ID      = eka-ai-c9d24
FIREBASE_TOKEN      = Your new Firebase token (for hosting)
MONGODB_URI         = MongoDB Atlas connection string
GEMINI_API_KEY      = Google AI Studio API key
JWT_SECRET          = Generated secret
```

---

## 📊 Which Option to Choose?

| Factor | Option A (Previous GCP) | Option B (New GCP) |
|--------|-------------------------|-------------------|
| **Existing data** | ✅ Keeps existing App Engine data | ❌ Starts fresh |
| **URL changes** | ❌ Same URL (may conflict with old app) | ✅ New URL |
| **Firebase integration** | ⚠️ Separate from Firebase | ✅ Integrated with Firebase |
| **Cost** | May have existing billing | Fresh billing setup |
| **Complexity** | Simple (just update code) | More setup required |

### Recommendation:
- **Choose Option A** if you want to keep existing data and have the same backend URL
- **Choose Option B** if you want a clean separation and better Firebase integration

---

## 🚀 Quick Deploy (Option A - Previous GCP)

If you have the `GCP_SA_KEY` from the previous repo:

```bash
# 1. Add secret to GitHub
echo "Add GCP_SA_KEY to https://github.com/connecteka/eka-ai-platform/settings/secrets/actions"

# 2. Also add:
# - FIREBASE_TOKEN (you already have this)
# - MONGODB_URI
# - GEMINI_API_KEY
# - JWT_SECRET

# 3. Push to deploy
git add .
git commit -m "deploy: Use existing GCP project"
git push origin main
```

---

## 🔍 Verify Deployment

After deployment, check:

```bash
# For App Engine (Option A)
curl https://eka-ai-platform.el.r.appspot.com/api/health

# For Cloud Run (Option B)
curl https://eka-ai-backend-xxx-uc.a.run.app/api/health
```

---

## 🆘 Troubleshooting

### "Permission denied" error
- Verify service account has correct roles
- Check GCP_PROJECT_ID matches your project

### "App not found" error
- For Option A: Ensure App Engine is enabled in `eka-ai-platform` project
- Go to: https://console.cloud.google.com/appengine?project=eka-ai-platform

### "Billing not enabled"
- Both projects need billing enabled
- Go to: https://console.cloud.google.com/billing

---

## 📞 Next Steps

**Which option do you prefer?**

**Option A**: Use existing `eka-ai-platform` GCP project (need GCP_SA_KEY from previous repo)

**Option B**: Use new `eka-ai-c9d24` GCP project (need to create new service account)

Once you decide, I'll help you get the correct `GCP_SA_KEY` and complete the deployment!
