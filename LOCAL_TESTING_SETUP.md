# Local Testing Setup Guide

## ✅ Environment Configuration Complete

All `.env` files have been set up for local development:

- **Backend**: `backend/.env` → localhost:8000
  - `FRONTEND_ORIGIN=http://127.0.0.1:3000`
  - `SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/callback`
  - `MONGO_URI` → Connected to MongoDB Atlas

- **Frontend**: `frontend/.env` → localhost:3000
  - `REACT_APP_API_URL=http://localhost:8000`

---

## 🚀 Running Locally (2 Terminals)

### Terminal 1: Backend (FastAPI)

```bash
cd /home/karans/Desktop/Projects/quizzify/spotify-quiz-app/backend
pip install -r requirements.txt  # First time only
uvicorn main:app --port 8000 --reload
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

**Test it:** Open [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) in your browser → Should return `{"status": "ok"}`

---

### Terminal 2: Frontend (React)

```bash
cd /home/karans/Desktop/Projects/quizzify/spotify-quiz-app/frontend
npm install  # First time only
npm start
```

Expected output:
```
Compiled successfully!
You can now view quizzify in the browser.
Local:  http://localhost:3000
```

**Open in browser:** [http://localhost:3000](http://localhost:3000)

---

## 🔐 Testing Login Flow

1. **Click "Sign In with Spotify"** on the landing page
2. You'll be redirected to Spotify OAuth (using credentials in `.env`)
3. After approving, you're redirected to `/dashboard`
4. **You should see:** Your Spotify profile name, avatar, and curated quizzes

---

## ✅ What Was Changed for Local Testing

| File | Change |
|------|--------|
| `frontend/src/config.js` | `BASE_URL` set to `http://localhost:8000` |
| `frontend/.env` | Created with `REACT_APP_API_URL=http://localhost:8000` |
| `backend/.env` | Already configured for localhost (no changes needed) |

---

## 🐛 Troubleshooting

**Q: "Cannot find module"?**
- Backend: `pip install -r requirements.txt`
- Frontend: `npm install`

**Q: "Port 3000 already in use"?**
- `npm start` will ask to use 3001 instead → Type `Y`

**Q: "CORS error"?**
- Backend is configured to accept `http://127.0.0.1:3000`
- Make sure you're using `http://127.0.0.1` not `localhost` in the browser URL bar

**Q: Spotify login fails?**
- Check `.env`: `SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/callback`
- Must use `127.0.0.1`, not `localhost` (Spotify blocks localhost)

---

## 📝 Quick Reference Commands

```bash
# Backend
cd backend && uvicorn main:app --port 8000 --reload

# Frontend
cd frontend && npm start

# Health check
curl http://127.0.0.1:8000/health
```

---

## 🎯 Ready to Test!

1. **Terminal 1**: Start backend (`uvicorn ...`)
2. **Terminal 2**: Start frontend (`npm start`)
3. **Open**: `http://localhost:3000`
4. **Sign in** with Spotify and explore!
