# EKA-AI Production Dockerfile (Fixed for WeasyPrint)
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

# Install system dependencies (CRITICAL: Added Pango/Cairo for PDF generation)
RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    curl \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libpangoft2-1.0-0 \
    shared-mime-info \
    # Clean up apt-get lists to reduce image size
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/
COPY --from=frontend-builder /app/dist ./dist

WORKDIR /app/backend

# Use PORT from environment (Railway sets this)
ENV PORT=8001
EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Use Uvicorn worker for FastAPI - Use PORT env var
CMD gunicorn wsgi:application -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT} --timeout 120 --keep-alive 5 --max-requests 1000 --max-requests-jitter 50
