# EKA-AI Production Dockerfile (Fixed for WeasyPrint)
# CACHE_BUST: 2026-02-16T12:00:00 - Force fresh build v4 - Simplified, added build-time dist check
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# 1. Optimize caching by copying only package files first
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 2. Copy frontend source code and config files
COPY src/ ./src/
COPY index.html ./
COPY tailwind.config.js postcss.config.js vite.config.ts tsconfig.json ./
COPY components.json ./
COPY public/ ./public/

# 3. Build the frontend
RUN yarn build

# --- Python Build Stage ---
# This stage installs build-time and runtime system dependencies, then Python packages.
FROM python:3.11-slim AS python-builder
# Install build-time and runtime system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    curl \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libpangoft2-1.0-0 \
    shared-mime-info \
    # Clean up apt-get lists to reduce image size
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# --- Final Production Stage ---
# This stage is lean and contains only what's needed to run the app.
FROM python:3.11-slim
WORKDIR /app

# 3. Create a non-root user for security
RUN addgroup --system appuser && adduser --system --ingroup appuser appuser

# Install only RUNTIME system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libpangoft2-1.0-0 \
    shared-mime-info \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 4. Copy installed Python packages from the builder stage
COPY --from=python-builder /usr/local/lib/python3.11/site-packages/ /usr/local/lib/python3.11/site-packages/

# Copy backend code
COPY backend/ ./backend/
COPY --from=frontend-builder /app/dist ./dist

# Verify dist exists (will fail build if missing)
RUN ls -la /app/dist/ && test -f /app/dist/index.html

# Switch to the non-root user
USER appuser
WORKDIR /app/backend

# Use PORT from environment (Railway sets this)
ENV PORT=8001
EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Use Uvicorn worker for FastAPI
CMD gunicorn wsgi:application -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT} --timeout 120 --keep-alive 5 --max-requests 1000 --max-requests-jitter 50
