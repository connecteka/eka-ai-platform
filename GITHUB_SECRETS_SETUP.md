# GitHub Secrets Setup Guide

To enable automatic deployment with the correct Supabase credentials, you need to add these secrets to your GitHub repository.

## Required Secrets

Go to: `Settings > Secrets and variables > Actions > New repository secret`

### 1. Supabase Secrets (REQUIRED)

| Secret Name | Value |
|-------------|-------|
| `VITE_SUPABASE_URL` | `https://gymkrbjujghwvphessns.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5bWtyYmp1amdod3ZwaGVzc25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjk0MzAsImV4cCI6MjA4NTcwNTQzMH0.11m6K6CZqARiCIyTUgLx-AL0xEtEsT-3-ljp4NJ1Jz4` |

### 2. Firebase Service Account (REQUIRED for Firebase Deployment)

| Secret Name | Value |
|-------------|-------|
| `FIREBASE_SERVICE_ACCOUNT` | Your Firebase service account JSON |

**How to get Firebase Service Account:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `eka-ai-platform`
3. Settings ⚙️ > Project Settings > Service Accounts
4. Click "Generate new private key"
5. Copy the entire JSON content

### 3. Optional Secrets

| Secret Name | Value | Purpose |
|-------------|-------|---------|
| `VITE_API_URL` | `https://api.eka-ai.in` | Production backend URL |
| `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | Google Sign-In |
| `VITE_GOOGLE_CLIENT_SECRET` | Your Google OAuth Secret | Google Sign-In |
| `VITE_GEMINI_API_KEY` | Your Gemini API Key | AI Chat feature |
| `VITE_PAYU_MERCHANT_KEY` | Your PayU Key | Payment processing |
| `VITE_PAYU_SALT` | Your PayU Salt | Payment verification |

## Quick Setup Script

If you have the GitHub CLI installed:

```bash
# Set Supabase secrets
gh secret set VITE_SUPABASE_URL -b"https://gymkrbjujghwvphessns.supabase.co"
gh secret set VITE_SUPABASE_ANON_KEY -b"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5bWtyYmp1amdod3ZwaGVzc25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjk0MzAsImV4cCI6MjA4NTcwNTQzMH0.11m6K6CZqARiCIyTUgLx-AL0xEtEsT-3-ljp4NJ1Jz4"

# Set Firebase Service Account (from file)
gh secret set FIREBASE_SERVICE_ACCOUNT < path/to/serviceAccount.json
```

## Verification

After setting secrets, push to main branch:

```bash
git push origin main
```

Then check GitHub Actions to verify deployment succeeds.
