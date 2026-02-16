# 🚀 EKA-AI Railway Deployment - Complete Resolution Guide

> **Last Updated:** 2025-02-16  
> **Issue:** Old frontend showing instead of new changes  
> **Root Cause:** Build tool conflicts + Missing Railway config + Cache issues

---

## 📋 TABLE OF CONTENTS

1. [Quick Fix (5 Minutes)](#quick-fix-5-minutes)
2. [Root Cause Analysis](#root-cause-analysis)
3. [Complete Solution](#complete-solution)
4. [File-by-File Changes](#file-by-file-changes)
5. [Railway Dashboard Setup](#railway-dashboard-setup)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)

---

## ⚡ QUICK FIX (5 MINUTES)

If you need to deploy **RIGHT NOW**, run these commands:

```bash
# 1. Clean everything
rm -rf node_modules dist package-lock.json pnpm-lock.yaml craco.config.js

# 2. Install dependencies
npm install

# 3. Build locally to verify
npm run build

# 4. Verify build
node verify-build.js

# 5. Deploy to Railway
railway up
```

**Then in Railway Dashboard:**
1. Go to your project → Settings
2. Click **"Purge Cache"**
3. Click **"Redeploy"** (select "Clear Build Cache")

---

## 🔍 ROOT CAUSE ANALYSIS

### Problem 1: Build Tool Conflict ⚠️ CRITICAL
Your project had **both** Create React App (CRA) and Vite configurations:

| File | Purpose | Issue |
|------|---------|-------|
| `craco.config.js` | CRA customization | ❌ Conflicts with Vite |
| `vite.config.ts` | Vite configuration | ✅ Should be primary |
| `react-scripts` in package.json | CRA build tool | ❌ Overrides Vite |

**Solution:** Remove all CRA artifacts, keep only Vite.

### Problem 2: Missing Railway Configuration ⚠️ CRITICAL
Railway didn't know how to build your project properly.

**Solution:** Add `railway.json` with explicit build instructions.

### Problem 3: Build Cache Issues ⚠️ CRITICAL
- Old `dist/` folder not being cleaned
- Browser caching old content
- CDN caching (if using Cloudflare)

**Solution:** 
- Add `emptyOutDir: true` to vite.config.ts
- Add cache-busting headers to index.html
- Configure proper cache headers in firebase.json

---

## ✅ COMPLETE SOLUTION

### Step 1: Remove Conflicting Files

Delete these files from your project:
```bash
rm -f craco.config.js
rm -f pnpm-lock.yaml
```

### Step 2: Update package.json

**REMOVE these dependencies:**
- `"cra-template": "1.2.0"`
- `"react-scripts": "5.0.1"`

**REMOVE these devDependencies:**
- `"@babel/plugin-proposal-private-property-in-object": "^7.21.11"`
- `"@craco/craco": "^7.1.0"`

**ADD to devDependencies:**
- `"serve": "^14.2.3"`

**UPDATE scripts:**
```json
"scripts": {
  "start": "vite --host 0.0.0.0 --port 3000",
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "serve": "npx serve -s dist",
  "verify-build": "node verify-build.js"
}
```

### Step 3: Update vite.config.ts

Add `emptyOutDir: true` to the build configuration:

```typescript
build: {
  outDir: 'dist',
  emptyOutDir: true, // CRITICAL: Clear old builds
  sourcemap: true,
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', 'lucide-react'],
      },
    },
  },
}
```

### Step 4: Create railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npx serve -s dist -l $PORT",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Step 5: Update index.html with Cache Control

Add these meta tags in the `<head>` section:

```html
<!-- Cache Control - CRITICAL for preventing stale content -->
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">

<!-- Version marker for debugging -->
<meta name="build-version" content="2.0.0">
<meta name="build-date" content="2025-02-16">
```

### Step 6: Update firebase.json

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      },
      {
        "source": "**/@(js|css|jpg|jpeg|gif|png|svg|webp|woff|woff2|eot|ttf|otf)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

---

## 📁 FILE-BY-FILE CHANGES

### Files to MODIFY:

| File | Changes |
|------|---------|
| `package.json` | Remove CRA deps, add serve, update scripts |
| `vite.config.ts` | Add `emptyOutDir: true` |
| `index.html` | Add cache-control meta tags |
| `firebase.json` | Add cache headers |

### Files to CREATE:

| File | Purpose |
|------|---------|
| `railway.json` | Railway deployment configuration |
| `nixpacks.toml` | Alternative build configuration |
| `.railwayignore` | Exclude files from Railway build |
| `verify-build.js` | Verify build output locally |
| `railway-deploy.sh` | Deployment automation script |
| `check-deployment.sh` | Post-deployment verification |
| `.env.example` | Environment variable template |

### Files to DELETE:

| File | Reason |
|------|--------|
| `craco.config.js` | CRA conflict |
| `pnpm-lock.yaml` | Using npm/yarn only |

---

## 🚂 RAILWAY DASHBOARD SETUP

### 1. Environment Variables

Go to your Railway project → Variables, add these:

```
NODE_ENV=production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=https://your-backend.railway.app
```

### 2. Build Settings

Go to Settings → Build:

- **Builder:** Nixpacks (auto-detected from railway.json)
- **Build Command:** `npm run build`
- **Start Command:** `npx serve -s dist -l $PORT`

### 3. Deploy Settings

- **Healthcheck Path:** `/`
- **Healthcheck Timeout:** 100 seconds
- **Restart Policy:** On Failure
- **Max Retries:** 10

### 4. Clear Cache & Redeploy

1. Go to Deployments
2. Click the three dots (⋯) on latest deployment
3. Select **"Redeploy"**
4. ✅ Check "Clear Build Cache"
5. Click **"Redeploy"**

---

## ✅ POST-DEPLOYMENT VERIFICATION

### 1. Check Build Logs

```bash
railway logs --build
```

Look for:
- ✅ `vite build` completing successfully
- ✅ `dist/` folder created
- ✅ No errors during build

### 2. Verify Deployment

```bash
# Check if dist exists
railway run ls -la dist/

# Check index.html content
railway run cat dist/index.html | head -30
```

### 3. Browser Verification

1. **Open your deployed URL**
2. **Hard refresh:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. **Open DevTools → Network tab**
4. **Check Response Headers:**
   - Look for `Cache-Control: no-cache, no-store, must-revalidate`
5. **Check Console:** No 404 errors for assets

### 4. Verify Version

In browser console, run:
```javascript
// Check build version from meta tag
document.querySelector('meta[name="build-version"]')?.content
// Should return: "2.0.0"
```

---

## 🔧 TROUBLESHOOTING

### Issue: Still seeing old frontend

**Solution 1: Clear Browser Cache**
```
Ctrl+Shift+R (hard refresh)
```

**Solution 2: Clear Site Data**
```
DevTools → Application → Storage → Clear Site Data
```

**Solution 3: Purge CDN Cache (if using Cloudflare)**
1. Go to Cloudflare Dashboard
2. Caching → Configuration → Purge Everything

**Solution 4: Force Railway Rebuild**
```bash
# Make a small change to any file
echo "// build $(date)" >> src/index.tsx

# Commit and push
git add .
git commit -m "Force rebuild"
git push

# Or manually trigger redeploy with cache clear
railway up
```

### Issue: Build fails on Railway

**Check logs:**
```bash
railway logs --build
```

**Common fixes:**
1. Ensure `src/` folder exists in repository
2. Check that all dependencies are in package.json
3. Verify Node.js version (should be 18+)

### Issue: 404 errors for assets

**Solution:**
1. Check `vite.config.ts` has correct `outDir: 'dist'`
2. Verify `railway.json` start command: `npx serve -s dist`
3. Ensure `emptyOutDir: true` is set

### Issue: Environment variables not working

**Solution:**
1. Variables must start with `VITE_` for frontend access
2. Restart deployment after adding variables
3. Check variables in Railway dashboard

---

## 📊 DEPLOYMENT CHECKLIST

- [ ] Removed `craco.config.js`
- [ ] Removed `pnpm-lock.yaml`
- [ ] Updated `package.json` (removed CRA deps)
- [ ] Updated `vite.config.ts` (added `emptyOutDir`)
- [ ] Updated `index.html` (added cache headers)
- [ ] Updated `firebase.json` (added cache headers)
- [ ] Created `railway.json`
- [ ] Created `.railwayignore`
- [ ] Created `verify-build.js`
- [ ] Set environment variables in Railway
- [ ] Cleared Railway build cache
- [ ] Redeployed with cache clear
- [ ] Verified in browser (hard refresh)
- [ ] Checked build version in meta tag

---

## 🆘 EMERGENCY CONTACTS

If issues persist:

1. **Railway Support:** https://railway.app/help
2. **Railway Discord:** https://discord.gg/railway
3. **Vite Docs:** https://vitejs.dev/guide/

---

## 📝 SUMMARY

**The fix involves 3 key changes:**

1. **Remove CRA conflicts** → Delete craco.config.js, remove react-scripts
2. **Add Railway config** → Create railway.json with proper build commands
3. **Fix caching** → Add cache-control headers, emptyOutDir in Vite

**Estimated time to fix:** 10-15 minutes

**Success indicator:** New frontend loads with `build-version: 2.0.0` in meta tags

---

*Generated for EKA-AI Platform Deployment Fix*  
*Date: 2025-02-16*
