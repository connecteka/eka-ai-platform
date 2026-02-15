# Cloud Run Deployment Guide

## Quick Deploy

```bash
cd backend

# Option 1: Using gcloud directly (replace with your real Supabase key)
gcloud run deploy eka-ai-backend \
  --source . \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars="SUPABASE_URL=https://gymkrbjujghwvphessns.supabase.co,SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5bWtyYmp1amdod3ZwaGVzc25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjk0MzAsImV4cCI6MjA4NTcwNTQzMH0.11m6K6CZqARiCIyTUgLx-AL0xEtEsT-3-ljp4NJ1Jz4,PAYU_MERCHANT_KEY=test_key,PAYU_MERCHANT_SALT=test_salt"

# Option 2: Using the deployment script
chmod +x deploy.sh
export SUPABASE_KEY="your-anon-key"
./deploy.sh
```

## Prerequisites

1. **Install Google Cloud SDK**
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Windows
   choco install gcloudsdk
   ```

2. **Authenticate with Google Cloud**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Enable Required APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `SUPABASE_KEY` | ✅ Yes | Supabase anon key |
| `PAYU_MERCHANT_KEY` | ❌ No | PayU merchant key (use 'test_key' for dev) |
| `PAYU_MERCHANT_SALT` | ❌ No | PayU salt (use 'test_salt' for dev) |
| `PORT` | Auto | Set by Cloud Run (default 8080) |

## Post-Deployment

### Verify Deployment
```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe eka-ai-backend --region asia-south1 --format 'value(status.url)')

# Test endpoints
curl $SERVICE_URL/
curl $SERVICE_URL/api/health
curl $SERVICE_URL/api/job-cards
```

### Update Frontend API URL

After deployment, update your frontend `.env`:
```bash
VITE_API_URL=https://eka-ai-backend-xxx.a.run.app
```

Then rebuild and deploy frontend:
```bash
npm run build
firebase deploy --only hosting
```

## Troubleshooting

### Build Failures
```bash
# Test build locally
cd backend
docker build -t eka-ai-backend .
docker run -p 8080:8080 -e PORT=8080 eka-ai-backend
```

### Check Logs
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=eka-ai-backend" --limit 50
```

### Update Environment Variables
```bash
gcloud run services update eka-ai-backend \
  --region asia-south1 \
  --set-env-vars="SUPABASE_KEY=new-key"
```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Firebase      │────▶│   Cloud Run     │────▶│   Supabase      │
│   Hosting       │     │   FastAPI       │     │   PostgreSQL    │
│   (Frontend)    │     │   (Backend)     │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        │                                               │
        └───────────────────────────────────────────────┘
                      Auth via Supabase
```

## Cost Optimization

- **Min instances**: 0 (scales to zero when not in use)
- **Max instances**: 10 (limits concurrent cost)
- **Memory**: 512Mi (sufficient for this workload)
- **CPU**: 1 (default)

## Security Notes

1. Never commit real `SUPABASE_KEY` to git
2. Use Google Secret Manager for production secrets:
   ```bash
   gcloud secrets create supabase-key --data-file=-
   gcloud run deploy eka-ai-backend --update-secrets=SUPABASE_KEY=supabase-key:latest
   ```
3. Restrict CORS origins in production (change `"*"` to your Firebase URL)

---

**Service will be available at:** `https://eka-ai-backend-[hash].a.run.app`
