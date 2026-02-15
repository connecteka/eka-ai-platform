# Edge Scripts

This directory contains edge computing scripts for CDN deployment.

## bunny-edge.ts

**Purpose:** Bunny.net Edge Script for EKA-AI Platform

**Features:**
- Health check endpoint at `/edge/health`
- Request pass-through to origin (Railway backend)
- Edge-level caching and routing

**Usage:**
1. Deploy to Bunny.net Edge Scripting
2. Configure origin to point to Railway backend
3. Health checks will be served at edge

**When to use:**
- When adding Bunny.net CDN in front of Railway
- For edge-level health monitoring
- To reduce latency for static assets

**Note:** This is OPTIONAL. Railway deployment works without it.
