# Domains & Hosting — Step-by-Step Guide

## Overview

| Role        | Domain       | Use |
|------------|---------------|-----|
| **Main**   | **narvo.news** | Homepage, product, signup, marketing. |
| **Dedicated** | **narvo.live** | Live/broadcast hub (currently **redirects to narvo.news**). |

- **Registrar:** Unstoppable Domains  
- **Host:** Vercel  
- **Redirect:** narvo.live → narvo.news (configured in `frontend/vercel.json`; remove when you want narvo.live to serve its own content).

---

## Step 1 — Deploy the frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub/GitLab/Bitbucket).
2. Click **Add New… → Project** and import your Narvo repo.
3. Set **Root Directory** to `frontend` (click **Edit**, then set and save).
4. Under **Build and Output Settings** (or **Framework Preset**), confirm:
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`
5. Add **Environment Variables** (Step 4 below); you can add them now or after the first deploy.
6. Click **Deploy**. Wait for the build to finish. You’ll get a URL like `narvo-xxxx.vercel.app`.

---

## Step 2 — Add and verify domains in Vercel

1. In the Vercel project, open **Settings → Domains**.
2. Add the main domain:
   - Enter `narvo.news` and click **Add**.
   - If prompted, choose **narvo.news** as the primary domain (not www).
3. Add the redirect domain:
   - Enter `narvo.live` and click **Add**.
   - In the domain row for **narvo.live**, set **Redirect to Another Domain** to **`narvo.news`** (not www.narvo.live). Save.
   - If you have **www.narvo.live**, set its **Redirect to Another Domain** to **`narvo.news`** as well. Otherwise traffic will stop at www.narvo.live and never reach narvo.news.
4. (Optional) Add `www.narvo.news` and set it to **Redirect to narvo.news** in the domain’s dropdown.
5. Vercel will show **DNS records** to add (e.g. A record or CNAME). Keep this tab open for Step 3.

---

## Step 3 — Point DNS at Unstoppable Domains

1. Log in at [Unstoppable Domains](https://unstoppabledomains.com) and open your domain(s).
2. For **narvo.news** (and **narvo.live** if they’re separate):
   - Open the **DNS** or **Manage** section.
   - Add the records Vercel showed:
     - **A** record: name `@` (or leave blank), value `76.76.21.21` (Vercel’s standard A target; confirm in Vercel).
     - **CNAME** (if Vercel gives one): name `www`, value `cname.vercel-dns.com` (or the exact value from Vercel).
   - If Unstoppable uses “Nameservers” instead of A/CNAME, switch the domain to **Custom nameservers** and use the ones Vercel provides (e.g. `ns1.vercel-dns.com`, `ns2.vercel-dns.com` — check Vercel’s Domains page for the exact list).
3. Save and wait for DNS to propagate (minutes to 48 hours). In Vercel **Settings → Domains**, the domain will show **Valid** when it’s correct.

---

## Step 4 — Set production environment variables

1. In Vercel: **Settings → Environment Variables**.
2. Add (for **Production**, and optionally Preview):

   | Name | Value | Notes |
   |------|--------|--------|
   | `REACT_APP_PUBLIC_URL` | `https://narvo.news` | OAuth, sharing, canonical URL. |
   | `REACT_APP_BACKEND_URL` | Your backend API URL (no trailing slash) | e.g. `https://api.narvo.news` or your FastAPI host. |
   | `REACT_APP_SUPABASE_URL` | Your Supabase project URL | From Supabase dashboard. |
   | `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anon key | From Supabase dashboard. |

3. Redeploy once after saving (Deployments → … → Redeploy) so the new variables are applied.

---

## Step 5 — Confirm narvo.live → narvo.news redirect

**In Vercel (recommended):** Use the domain-level redirect so it works regardless of deployment:

- For **narvo.live**: set **Redirect to Another Domain** to **`narvo.news`** (Settings → Domains → narvo.live → Save).
- For **www.narvo.live**: set **Redirect to Another Domain** to **`narvo.news`**. If narvo.live redirects to www.narvo.live, traffic would otherwise stop at www.narvo.live; both must point to narvo.news.

**Fallback:** `frontend/vercel.json` also has a redirect rule for host `narvo.live` → `narvo.news`. It only applies when a domain has no redirect set in the dashboard; dashboard redirects take precedence.

After configuring, open https://narvo.live and https://www.narvo.live and confirm both redirect to https://narvo.news.

To **stop** the redirect later (when narvo.live should serve its own live experience), remove the redirect in Vercel Domains and, if desired, the `redirects` entry from `frontend/vercel.json`.

---

## Step 6 — Backend and admin (optional)

- **Backend (FastAPI):** Deploy to your chosen host (e.g. Railway, Render, or a VPS). Set its URL in `REACT_APP_BACKEND_URL` in Vercel. No change to domain/hosting steps above.
- **Admin app:** To run the admin UI on e.g. `admin.narvo.news`, create a second Vercel project from the same repo with **Root Directory** `frontend`, **Build Command** `npm run build:admin`, and add the domain `admin.narvo.news`. See [Admin_Standalone_Deploy.md](../technical/Admin_Standalone_Deploy.md).

---

## Checklist

- [ ] Repo connected to Vercel, root directory = `frontend`
- [ ] Domain `narvo.news` added in Vercel and set as primary
- [ ] Domain `narvo.live` added in Vercel (redirects via vercel.json)
- [ ] DNS for narvo.news (and narvo.live) set at Unstoppable Domains to Vercel’s targets
- [ ] Vercel shows both domains as **Valid**
- [ ] `REACT_APP_PUBLIC_URL`, `REACT_APP_BACKEND_URL`, and Supabase vars set in Vercel
- [ ] Visit https://narvo.news and https://narvo.live and confirm narvo.live redirects to narvo.news
