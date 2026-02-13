# ⚡ Quick Start Guide - Claude-like Frontend

## 🚀 Get Started in 3 Steps

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Set Environment Variables

Create `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://api.go4garage.com
```

### 3️⃣ Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:5173/claude-chat`

---

## 📦 Build for Production

```bash
npm run build
```

Output in `dist/` folder.

---

## 🌐 Deploy

### Firebase
```bash
npm run build
firebase deploy --only hosting
```

### Vercel
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod --dir=dist
```

---

## 🎯 Routes

- `/claude-chat` - Full-screen Claude-like interface
- `/chat` - Original chat with header/footer
- `/dashboard` - Dashboard view
- `/` - Homepage

---

## 🔧 Key Features

✅ Claude-inspired dark UI
✅ Multi-session chat
✅ Markdown rendering
✅ Code highlighting
✅ Streaming responses
✅ Mobile responsive
✅ Job card integration

---

## 📖 Documentation

- **Full Guide**: [CLAUDE_FRONTEND_README.md](./CLAUDE_FRONTEND_README.md)
- **Deployment**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Main README**: [README.md](./README.md)

---

**Need Help?** support@go4garage.in
