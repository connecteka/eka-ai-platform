# EKA-AI Testing Checklist

## 🎯 Pre-Deployment Testing

### 1. Local Build Verification
```bash
npm ci
npm run build
```

**Check:**
- [ ] No TypeScript errors
- [ ] No build warnings (or minimal)
- [ ] `dist/` folder created with:
  - [ ] `index.html`
  - [ ] `assets/` folder with JS/CSS files

### 2. Local Preview
```bash
npm run dev
```

**Check in browser:**
- [ ] App loads at `http://localhost:5173`
- [ ] No console errors
- [ ] Dark theme applied correctly
- [ ] Navigation works (all routes)

---

## 🌐 Post-Deployment Testing

### 3. Homepage Load Test
**URL:** https://eka-ai-c9d24.web.app

**Check:**
- [ ] Page loads (200 status)
- [ ] Title is correct
- [ ] Favicon loads
- [ ] No 404 errors in console

### 4. Static Assets Test
```bash
curl -I https://eka-ai-c9d24.web.app/assets/index-*.js
curl -I https://eka-ai-c9d24.web.app/assets/index-*.css
```

**Check:**
- [ ] JS files return 200
- [ ] CSS files return 200
- [ ] Files are not empty

### 5. Route Testing
Test these URLs directly:

| Route | Expected |
|-------|----------|
| `/` | Homepage loads |
| `/login` | Login page |
| `/chat` | Chat interface |
| `/job-cards` | Job cards list |
| `/invoices` | Invoices page |
| `/mg-fleet` | MG Fleet page |

**Check:**
- [ ] All routes return 200
- [ ] No "Site Not Found" errors
- [ ] SPA routing works (refresh page)

### 6. API Connection Test
```bash
curl https://your-backend-url/api/health
```

**Check:**
- [ ] API responds
- [ ] CORS headers present
- [ ] Response is valid JSON

---

## 🎨 UI/UX Testing

### 7. Visual Regression
**Check:**
- [ ] Dark theme (#0D0D0D background)
- [ ] Brand orange (#F45D3D) accents
- [ ] Cards have proper borders
- [ ] Typography is correct (Inter/Outfit)
- [ ] No layout breaks on resize

### 8. Component Testing
**Test these components:**
- [ ] Button variants (primary, secondary, danger)
- [ ] Modal opens/closes
- [ ] Badge displays correctly
- [ ] Table renders data
- [ ] Form inputs work

### 9. Responsive Design
**Test on:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## 🔐 Integration Testing

### 10. Supabase Connection
**Check:**
- [ ] Can connect to Supabase
- [ ] Authentication works (if implemented)
- [ ] Database queries return data
- [ ] RLS policies working

### 11. External Services
**Check:**
- [ ] Google OAuth (if configured)
- [ ] PayU integration (if configured)
- [ ] Gemini AI (if configured)

---

## 📊 Performance Testing

### 12. Load Time
**Check:**
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 5s
- [ ] Bundle size < 1MB (gzipped)

### 13. Lighthouse Score
**Run in Chrome DevTools:**
- [ ] Performance > 80
- [ ] Accessibility > 80
- [ ] Best Practices > 80
- [ ] SEO > 80

---

## 🔧 Automated Testing

### Run the Testing Agent
```bash
node scripts/testing-agent.js
```

This will check:
- Homepage load
- Static assets
- Routes
- API connectivity
- Environment variables

---

## 🐛 Common Issues & Fixes

### Issue: "Site Not Found"
**Cause:** Firebase hosting not initialized
**Fix:** 
```bash
firebase init hosting
firebase deploy
```

### Issue: Blank Page
**Cause:** Static assets not loading
**Fix:**
```bash
# Check dist/ folder
ls -la dist/

# Rebuild
npm run build

# Redeploy
firebase deploy --only hosting
```

### Issue: API Errors
**Cause:** Backend not deployed
**Fix:**
```bash
gcloud run deploy eka-ai-backend --source ./backend
```

### Issue: CORS Errors
**Cause:** Backend CORS not configured
**Fix:** Update `backend/main.py`:
```python
allow_origins=["https://eka-ai-c9d24.web.app"]
```

---

## ✅ Sign-off Checklist

Before declaring deployment complete:

- [ ] All manual tests passed
- [ ] Automated tests passed
- [ ] No console errors
- [ ] API responding
- [ ] Responsive on all devices
- [ ] Lighthouse scores acceptable

**Tester:** _______________  
**Date:** _______________  
**Status:** ⬜ PASS / ⬜ FAIL
