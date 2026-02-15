# Deploy EKA-AI to Railway (200K Users Scale)

## Prerequisites
- Railway account: https://railway.app
- GitHub repo connected
- SSH key added (✅ Done)

---

## Step 1: Create New Project

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose: `connecteka/eka-ai-platform`
5. Click "Deploy"

---

## Step 2: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically:
   - Create the database
   - Set `DATABASE_URL` environment variable
   - Connect to your app

---

## Step 3: Add Redis Cache

1. Click "New"
2. Select "Database" → "Add Redis"
3. Railway will set `REDIS_URL` automatically

---

## Step 4: Configure Environment Variables

Go to Project → Variables → Add these:

### Database (Supabase)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### OR use Railway Postgres only:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### MongoDB (if using hybrid)
```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/eka_ai
MONGODB_DATABASE=eka_ai
```

### Redis (Railway provides)
```
REDIS_URL=${{Redis.REDIS_URL}}
```

### Security
```
ALLOWED_ORIGINS=https://www.eka-ai.in,https://app.eka-ai.in
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ENFORCE_HTTPS=true
```

### Features
```
ENABLE_RATE_LIMITING=true
ENABLE_CACHING=true
ENABLE_MONITORING=true
ENABLE_SECURITY_HARDENING=true
```

### AI Keys
```
GEMINI_API_KEY=your-gemini-api-key
EMERGENT_LLM_KEY=your-emergent-key
```

### Monitoring (optional)
```
SENTRY_DSN=your-sentry-dsn
```

---

## Step 5: Configure Domain

1. Go to Project → Settings → Domains
2. Click "Custom Domain"
3. Add: `api.eka-ai.in`
4. Follow DNS instructions:
   - Add CNAME record in your DNS provider
   - Point `api.eka-ai.in` to Railway provided URL

---

## Step 6: Deploy

1. Railway auto-deploys on every push to `main`
2. Or click "Deploy" in dashboard
3. Check logs in "Deployments" tab

---

## Step 7: Verify Deployment

Test these endpoints:
```bash
curl https://api.eka-ai.in/api/health
curl https://api.eka-ai.in/
```

Expected response:
```json
{
  "status": "EKA-AI Backend is running",
  "version": "3.0.0"
}
```

---

## Scaling for 200K Users

Railway auto-scales, but configure:

1. Go to Project → Settings
2. Set:
   - **Min replicas**: 2 (always running)
   - **Max replicas**: 20 (handles 200K users)
   - **Memory**: 2GB per instance
   - **CPU**: 2 vCPU per instance

3. Enable:
   - ✅ Auto-scaling
   - ✅ Health checks
   - ✅ Rolling deployments

---

## Monitoring

Railway provides:
- ✅ Deployment logs
- ✅ Metrics dashboard
- ✅ Alert notifications
- ✅ Usage analytics

---

## Cost Estimate (200K Users)

| Component | Cost/Month |
|-----------|-----------|
| Compute (10 instances) | ~$150 |
| PostgreSQL | Included |
| Redis | Included |
| Bandwidth | Included (1TB) |
| **Total** | **~$150/month** |

---

## Support

Railway support:
- Discord: https://discord.gg/railway
- Email: support@railway.app
- Docs: https://docs.railway.app

---

**Ready to deploy!** 🚀
