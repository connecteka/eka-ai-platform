# EKA-AI Platform - Production Deployment Guide
## Complete Setup for 200K Users

---

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        DNS / CDN                              │
│  www.eka-ai.in  →  Landing Page (Marketing)                  │
│  app.eka-ai.in  →  SaaS Application                          │
│  api.eka-ai.in  →  Backend API (This Repo)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                   ┌──────────┴──────────┐
                   │    Railway.app      │
                   │  (Auto-scaling)     │
                   └──────────┬──────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
   │SUPABASE │          │MONGODB  │          │ REDIS   │
   │(Primary)│          │(Chat/   │          │ (Cache) │
   │         │          │Files)   │          │         │
   └─────────┘          └─────────┘          └─────────┘
```

**Tech Stack:**
- **Backend:** FastAPI (Python 3.11)
- **Databases:** Supabase (PostgreSQL) + MongoDB Atlas
- **Cache:** Redis (Railway managed)
- **Deployment:** Railway.app (Auto-scaling)
- **Monitoring:** Sentry + Railway Dashboard

---

## 📋 Pre-Deployment Checklist

### 1. Accounts Setup
- [ ] Railway.app account (https://railway.app)
- [ ] MongoDB Atlas account (https://cloud.mongodb.com)
- [ ] Supabase account (already have)
- [ ] Sentry account (optional) (https://sentry.io)

### 2. API Keys (Provided)
| Service | Key | Status |
|---------|-----|--------|
| Gemini | Get from https://aistudio.google.com/app/apikey | ⚠️ Required |
| Emergent | `sk-emergent-eBdD4BdC6Fd9f7a5dF` | ✅ Ready |

### 3. Secrets to Generate
| Secret | Command | Purpose |
|--------|---------|---------|
| JWT_SECRET | `openssl rand -hex 32` | Authentication |
| PayU Keys | PayU Dashboard | Payments |

---

## 🚀 Step-by-Step Deployment

### STEP 1: MongoDB Atlas Setup (15 minutes)

1. Go to https://cloud.mongodb.com
2. Create a new cluster (M10 or higher for production)
3. Choose region: Mumbai (ap-south-1) for India users
4. Create a database user
5. Add IP whitelist: `0.0.0.0/0` (allow all - Railway uses dynamic IPs)
6. Get connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/eka_ai?retryWrites=true&w=majority
   ```

---

### STEP 2: Create Railway Project (10 minutes)

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Select: `connecteka/eka-ai-platform`
5. Click **"Deploy"**

---

### STEP 3: Add Redis (1 minute)

1. In Railway project, click **"New"**
2. Select **"Database"** → **"Add Redis"**
3. Railway auto-creates and sets `REDIS_URL`

---

### STEP 4: Configure Environment Variables (10 minutes)

Go to **Project → Variables** and add:

#### Required Variables
```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/eka_ai
MONGODB_DATABASE=eka_ai

# AI Keys
# Get Gemini key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key
EMERGENT_LLM_KEY=sk-emergent-eBdD4BdC6Fd9f7a5dF

# Security (Generate JWT_SECRET)
JWT_SECRET=your-generated-secret-32-chars-min
ALLOWED_ORIGINS=https://www.eka-ai.in,https://app.eka-ai.in

# Payments (Get from PayU)
PAYU_MERCHANT_KEY=your-payu-key
PAYU_MERCHANT_SALT=your-payu-salt
```

#### Optional Variables
```bash
# Monitoring
SENTRY_DSN=https://your-sentry-dsn

# Feature Flags (default: true)
ENABLE_RATE_LIMITING=true
ENABLE_CACHING=true
ENABLE_MONITORING=true
ENABLE_SECURITY_HARDENING=true
```

---

### STEP 5: Configure Custom Domain (5 minutes)

1. Go to **Project → Settings → Domains**
2. Click **"Custom Domain"**
3. Add: `api.eka-ai.in`
4. Copy the CNAME value provided by Railway
5. Go to your DNS provider (Cloudflare/GoDaddy/etc)
6. Add CNAME record:
   - Name: `api`
   - Value: `[railway-provided-url]`
7. Wait 5-10 minutes for DNS propagation

---

### STEP 6: Deploy (Automatic)

Railway automatically deploys on every push to `main`.

To trigger manually:
1. Go to **Deployments** tab
2. Click **"Redeploy"**

---

## ✅ Verification Steps

### 1. Health Check
```bash
curl https://api.eka-ai.in/api/health
```
Expected response:
```json
{"status": "healthy", "timestamp": "2026-02-15T..."}
```

### 2. Detailed Health
```bash
curl https://api.eka-ai.in/health/detailed
```
Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "supabase": true,
    "mongo": true,
    "redis": true
  }
}
```

### 3. Root Endpoint
```bash
curl https://api.eka-ai.in/
```
Expected response:
```json
{
  "status": "EKA-AI Backend is running",
  "version": "3.0.0",
  "database": "MongoDB",
  "ai_enabled": true
}
```

---

## 📊 Scaling Configuration

### Auto-Scaling Settings
Railway automatically scales based on:
- CPU usage > 70%
- Memory usage > 80%
- Request queue depth

Manual configuration:
```
Min Replicas: 2 (always running)
Max Replicas: 20 (handles 200K users)
Memory per instance: 2GB
CPU per instance: 2 vCPUs
```

---

## 💰 Cost Estimate (200K Users)

| Component | Cost/Month |
|-----------|-----------|
| Railway Compute (10 instances) | ~$150 |
| MongoDB Atlas (M10) | ~$60 |
| Redis (Railway managed) | Included |
| Bandwidth (1TB) | Included |
| **Total** | **~$210/month** |

---

## 🔧 Troubleshooting

### Issue: MongoDB Connection Failed
**Solution:**
1. Check `MONGO_URL` is correct
2. Verify IP whitelist includes `0.0.0.0/0`
3. Check database user password

### Issue: AI Chat Not Working
**Solution:**
1. Verify `EMERGENT_LLM_KEY` is set
2. Check logs in Railway dashboard
3. Ensure key is valid at https://emergent.sh

### Issue: CORS Errors
**Solution:**
1. Check `ALLOWED_ORIGINS` includes your frontend URL
2. Verify format: `https://app.eka-ai.in` (no trailing slash)

### Issue: High Memory Usage
**Solution:**
1. Increase memory per instance: Settings → Service → Memory
2. Enable connection pooling (already configured)
3. Add Redis caching (already configured)

---

## 🚨 Emergency Rollback

If deployment fails:
1. Go to Railway Dashboard → Deployments
2. Find previous working deployment
3. Click **"Rollback"**

Or switch back to old entry point:
```bash
# In railway.toml, change:
startCommand = "cd backend && python -m uvicorn server:app --host 0.0.0.0 --port $PORT"
```

---

## 📞 Support

- **Railway Docs:** https://docs.railway.app
- **MongoDB Docs:** https://docs.mongodb.com
- **EKA-AI Issues:** https://github.com/connecteka/eka-ai-platform/issues

---

**Ready to deploy?** Start with Step 1: MongoDB Atlas setup.