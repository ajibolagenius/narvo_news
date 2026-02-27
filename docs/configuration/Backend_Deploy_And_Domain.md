# Backend Deploy & Domain — Step-by-Step Guide

## Overview

| Role     | Domain           | Use                    |
|----------|------------------|------------------------|
| **API**  | **api.narvo.news** | FastAPI backend (or host default URL until custom domain is set). |

- **Stack:** FastAPI (see `backend/server.py`), uvicorn, Supabase, Gemini, OpenAI/YarnGPT.
- **Host options:** Railway, Render, or a VPS. Set the backend URL in the frontend via `REACT_APP_BACKEND_URL` (Vercel env).

---

## Step 1 — Choose a host and create the service

Pick one:

- **Railway:** [railway.app](https://railway.app) — connect repo, set root to `backend`, add env vars, deploy.
- **Render:** [render.com](https://render.com) — New → Web Service, connect repo, **Root Directory** `backend`, add env vars, deploy.
- **VPS (e.g. Ubuntu):** SSH in, clone repo, install Python 3.11+, create a systemd service or use a process manager (e.g. gunicorn/uvicorn behind nginx).

---

## Step 2 — Build and start command

- **Build (if the host runs a build step):**  
  `pip install -r requirements.txt`  
  (or leave blank if the host only runs a start command and you use a Dockerfile/runtime that installs deps.)

- **Start command (required):**  
  Use **uvicorn** (not gunicorn). The app must listen on the platform’s `PORT`. With **Root Directory** = `backend`:

  ```bash
  uvicorn server:app --host 0.0.0.0 --port $PORT
  ```

  **Render:** Set **Start Command** to exactly:  
  `uvicorn server:app --host 0.0.0.0 --port $PORT`

  **Render — Health Check Path (Advanced):** Set to `/api/health` so Render can verify the service is up.

  **Railway:** Set the start command in the service settings; Railway provides `PORT` automatically.

  **VPS:** Run the same command (e.g. port `8000`) behind a reverse proxy (nginx/Caddy) for TLS.

---

## Step 3 — Set backend environment variables

In the host’s dashboard (Railway/Render **Environment** or VPS `.env`), set the same variables as in `backend/.env.example`:

| Name                      | Required | Notes |
|---------------------------|----------|--------|
| `SUPABASE_URL`            | Yes      | Supabase project URL. |
| `SUPABASE_ANON_KEY`       | Yes      | Supabase anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes    | Supabase service role key (backend only). |
| `GEMINI_API_KEY`          | Yes      | Gemini (narrative, translation, briefing, recommendations). |
| `OPENAI_API_KEY`          | Yes      | OpenAI TTS fallback. |
| `YARNGPT_API_KEY`         | No       | YarnGPT TTS (Nigerian voices). Omit to use OpenAI TTS only. |
| `GOOGLE_FACT_CHECK_API_KEY` | No     | Google Fact Check API. Omit for mock responses. |

Do not commit real values; use the host’s secret/env UI.

---

## Step 4 — Deploy and get the default URL

1. Deploy the service. Wait for the build/start to succeed.
2. Note the default URL (e.g. `https://narvo-backend-xxxx.railway.app` or `https://narvo-api.onrender.com`).
3. Open `https://<your-backend-url>/health` (or the root path if you have a simple health route). Confirm the backend responds.

---

## Step 5 — Add custom domain `api.narvo.news` (optional)

1. **At your host (Railway/Render):**  
   In the service settings, open **Domains** (or **Custom Domain**).  
   Add `api.narvo.news`. The host will show the DNS record to use (usually a **CNAME** to their target, or an **A** record).

2. **At Unstoppable Domains (or your DNS provider):**  
   Add the record the host gave you, e.g.:  
   - **CNAME:** name `api`, value the host’s target (e.g. `xxxx.railway.app` or `narvo-api.onrender.com`).  
   Or if the host gives an A record, add that for `api`.

3. Wait for DNS to propagate. In the host’s dashboard, the domain should show as **Valid** or **Active**.

4. **HTTPS:** Railway and Render provision TLS for custom domains automatically. On a VPS, use nginx/Caddy with Let’s Encrypt.

---

## Step 6 — Point the frontend at the backend

1. In **Vercel** → your frontend project → **Settings → Environment Variables**.
2. Set **`REACT_APP_BACKEND_URL`** to your backend base URL **with no trailing slash**:
   - With custom domain: `https://api.narvo.news`
   - Without: your host’s default URL (e.g. `https://narvo-backend-xxxx.railway.app`)
3. **Redeploy** the frontend (Deployments → … → Redeploy) so the new value is applied.

---

## Checklist

- [ ] Backend service created (Railway / Render / VPS), root = `backend`
- [ ] Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT` (or equivalent with platform PORT)
- [ ] All required env vars set (Supabase, GEMINI_API_KEY, OPENAI_API_KEY, optional YARNGPT / Fact Check)
- [ ] Deploy successful; `/health` or root responds
- [ ] (Optional) Custom domain `api.narvo.news` added at host and DNS; TLS working
- [ ] `REACT_APP_BACKEND_URL` set in Vercel and frontend redeployed

---

## Reference

- **Entrypoint:** `backend/server.py` (FastAPI app, CORS, GZip, routers under `backend/routes/`).
- **Config:** `backend/.env.example`; do not commit `.env`.
- **Frontend env:** See [Domains_And_Hosting.md](Domains_And_Hosting.md) Step 4 for `REACT_APP_BACKEND_URL` and other Vercel variables.
