# Narvo Subscription Tiers

This document defines **Free**, **Pro**, and **Enterprise** subscription tiers and differentiates **current** (implemented) features from **proposed** or **recommended** (planned) ones. It aligns with the product’s current capabilities and roadmap (see `memory/PRD.md` and `docs/business/Narvo_Product_Concept.md`).

---

## Legend

| Label | Meaning |
|-------|--------|
| **Current** | Feature exists in the codebase and is available today. |
| **Proposed** | Not yet built; suggested for the tier with clear scope. |
| **Recommended** | Suggested enhancement or limit that product/engineering recommends. |

---

## Tier Overview

| Dimension | Free | Pro | Enterprise |
|-----------|------|-----|------------|
| **Target** | Individual listeners, trial, growth | Power users, professionals, small teams | Newsrooms, publishers, API consumers |
| **Monetization** | No charge | Monthly/annual subscription | Custom contract, SLA, volume |

---

## 1. Free Tier

### 1.1 Content & News

| Feature | Status | Notes |
|---------|--------|--------|
| Dashboard news feed (aggregated RSS) | **Current** | 39 sources, local / continental / international. |
| News detail with narrative & key takeaways | **Current** | AI narrative via Gemini. |
| Search (title/summary, category/source filters) | **Current** | Pagination with limit/skip. |
| Breaking news strip | **Current** | Keyword-based from feed. |
| Trending tags & topics | **Current** | From recent news analysis. |
| Bookmarks / Saved stories | **Current** | Per user, stored in MongoDB. |
| Content source matrix & feed health (dashboard) | **Current** | SOURCE_MATRIX, health bar, per-source status. |
| News limit per request | **Current** | e.g. cap at 20–50 items; **Recommended**: document and enforce a single Free limit (e.g. 20). |

### 1.2 Audio & TTS

| Feature | Status | Notes |
|---------|--------|--------|
| On-demand TTS (single story) | **Current** | OpenAI TTS; optional translation. |
| Audio player with queue & Media Session API | **Current** | Lock screen controls, background playback. |
| 5 broadcast languages (EN, Pidgin, Yoruba, Hausa, Igbo) | **Current** | Voice profiles with native names. |
| Daily TTS / translation usage | **Current** | No enforced limit. **Recommended**: add a daily cap (e.g. N stories or M minutes) for Free. |

### 1.3 Discover & Offline

| Feature | Status | Notes |
|---------|--------|--------|
| Discover: podcasts list & stream (proxy) | **Current** | Curated episodes, audio proxy. |
| Discover: radio stations (Radio Browser API) | **Current** | By country, search. |
| Podcast “Download all” & download queue indicator | **Current** | Batch download, progress UI. |
| Offline: save articles & cached playback | **Current** | IndexedDB; offline page. |
| Offline storage limit | **Current** | No hard limit in app. **Recommended**: Free cap (e.g. 50 articles or 500 MB). |

### 1.4 PWA & Notifications

| Feature | Status | Notes |
|---------|--------|--------|
| PWA (Service Worker, manifest, install) | **Current** | Network-first caching. |
| Background sync (offline queue) | **Current** | Sync when back online. |
| Push notifications (breaking news toggle) | **Current** | UI exists; backend subscribe/unsubscribe **Proposed** (see Improvement Recommendations). |

### 1.5 Language & Settings

| Feature | Status | Notes |
|---------|--------|--------|
| Interface language (7 i18n: EN, FR, YO, HA, IG, PCM, SW) | **Current** | /settings. |
| Broadcast language (5 TTS languages) | **Current** | /system, auto-save. |
| User preferences & settings (region, voice, interests) | **Current** | Stored per user. |
| Data limit / storage preference (UI) | **Current** | Slider in System Settings (display only; no enforcement). |

### 1.6 Trust & Verification

| Feature | Status | Notes |
|---------|--------|--------|
| Truth Tag (fact-check per story) | **Current** | Google Fact Check API with mock fallback. |
| Fact-check search / verify / analyze APIs | **Current** | Available to all users. **Recommended**: rate-limit Free (e.g. 10/day). |

### 1.7 Morning Briefing

| Feature | Status | Notes |
|---------|--------|--------|
| Generate morning briefing (top stories + script) | **Current** | Voice selection, TTS for full briefing. |
| Briefing history & replay by date | **Current** | Latest + history endpoint. |
| Briefings per day | **Current** | No limit. **Recommended**: Free = 1 generation per day. |

### 1.8 Account & Access

| Feature | Status | Notes |
|---------|--------|--------|
| Sign up / Sign in (Supabase Auth) | **Current** | Email/password. |
| Forgot password | **Current** | Reset flow. |
| Onboarding (language, region, interests) | **Current** | Post-auth. |
| Account page & accessibility settings | **Current** | Profile, accessibility options. |
| Admin / moderation / curation | **Current** | Not applicable to Free; reserved for internal or Enterprise. |

---

## 2. Pro Tier

Pro builds on Free with higher limits, premium content/features, and a better experience. Items below are **Proposed** unless marked **Current** or **Recommended**.

### 2.1 Content & News

| Feature | Status | Notes |
|---------|--------|--------|
| Higher news fetch limit (e.g. 50–100 per request) | **Proposed** | Enforce via subscription flag or API key. |
| Priority or extended sources | **Proposed** | Optional extra feeds or early access. |
| Saved/search export (e.g. CSV/PDF) | **Proposed** | Export bookmarks or search results. |
| No ads (if ads introduced on Free) | **Recommended** | Ad-free experience for Pro. |

### 2.2 Audio & TTS

| Feature | Status | Notes |
|---------|--------|--------|
| Higher daily TTS / translation quota | **Proposed** | e.g. 5× Free or “unlimited” within fair use. |
| Premium voice options | **Proposed** | Additional or higher-quality TTS voices if added. |
| Faster TTS (priority queue) | **Proposed** | Lower latency for Pro users. |
| Download briefing audio for offline | **Proposed** | Full briefing MP3 in Offline library. |

### 2.3 Discover & Offline

| Feature | Status | Notes |
|---------|--------|--------|
| Higher offline storage cap (e.g. 200 articles / 2 GB) | **Proposed** | Enforce in backend + frontend. |
| More podcast episodes in “Download all” | **Proposed** | e.g. 20 vs 8 for Free. |
| Offline sync scheduling | **Proposed** | e.g. “Sync top 20 at 6 AM”. |

### 2.4 Notifications & PWA

| Feature | Status | Notes |
|---------|--------|--------|
| Push notifications (full implementation) | **Proposed** | Backend subscribe/unsubscribe + delivery (see technical recommendations). |
| Custom notification topics (e.g. by category/region) | **Proposed** | Pro-only preference. |
| Breaking news + daily digest push | **Proposed** | Digest at user-chosen time. |

### 2.5 Trust & Verification

| Feature | Status | Notes |
|---------|--------|--------|
| Higher fact-check rate limit (e.g. 50/day) | **Proposed** | Or unlimited with fair use. |
| Truth Tag history / export | **Proposed** | List of fact-checks for saved stories. |

### 2.6 Morning Briefing

| Feature | Status | Notes |
|---------|--------|--------|
| Multiple briefings per day (e.g. 3) | **Proposed** | Or “regenerate” without counting against daily cap. |
| Custom briefing length (e.g. 5 / 10 / 15 stories) | **Proposed** | Pro-only option. |
| Scheduled briefing delivery (push at set time) | **Proposed** | With push implemented. |

### 2.7 Account & Experience

| Feature | Status | Notes |
|---------|--------|--------|
| Pro badge / status in UI | **Proposed** | e.g. Settings or Account (placeholder exists: “PREMIUM_ACTIVE”). |
| Subscription management (upgrade, cancel, invoice) | **Proposed** | Requires payment provider (Stripe, etc.). |
| Priority support (email) | **Recommended** | Dedicated channel for Pro. |

---

## 3. Enterprise Tier

Enterprise targets organizations: newsrooms, publishers, partners. Features are **Proposed** unless noted.

### 3.1 Content & News

| Feature | Status | Notes |
|---------|--------|--------|
| Full news access (no or very high limits) | **Proposed** | Per-seat or per-org quota. |
| Custom / white-label RSS or source list | **Proposed** | Org-specific feeds. |
| Bulk export (API or scheduled jobs) | **Proposed** | For analytics or CMS. |
| Dedicated content pipeline (e.g. region/category) | **Proposed** | Custom aggregation. |

### 3.2 Audio & TTS

| Feature | Status | Notes |
|---------|--------|--------|
| High or unlimited TTS / translation volume | **Proposed** | With SLA. |
| Custom voice training / branded voice | **Proposed** | If product supports it. |
| TTS API for external systems | **Proposed** | API key, rate limits, usage reporting. |

### 3.3 Trust & Verification

| Feature | Status | Notes |
|---------|--------|--------|
| Unlimited fact-check API usage | **Proposed** | With rate limits per key. |
| Fact-check API for external integration | **Proposed** | Verify claims from CMS or apps. |
| Truth Tag branding (e.g. “Verified by [Org]”) | **Proposed** | White-label option. |

### 3.4 Admin & Operations

| Feature | Status | Notes |
|---------|--------|--------|
| Admin dashboard (metrics, alerts, streams, moderation) | **Current** | Exists for internal use; **Proposed**: org-scoped admin for Enterprise. |
| Curation console & moderation hub | **Current** | **Proposed**: delegate to Enterprise admins. |
| Voice management (TTS models status) | **Current** | **Proposed**: visibility or config for Enterprise. |
| Usage dashboard (seats, API calls, TTS minutes) | **Proposed** | Per-org analytics. |
| SSO / SAML | **Proposed** | Enterprise identity. |
| Audit logs | **Proposed** | Who did what, when. |

### 3.5 SLA & Support

| Feature | Status | Notes |
|---------|--------|--------|
| SLA (uptime, response time) | **Proposed** | e.g. 99.9% uptime. |
| Dedicated support (chat, phone) | **Proposed** | Per contract. |
| Onboarding & training | **Recommended** | For newsroom rollout. |

---

## 4. Implementation Notes

- **Current** features require no tier checks today; **Proposed** and **Recommended** items need:
  - Subscription state (e.g. `tier: 'free' | 'pro' | 'enterprise'`) in auth or user profile.
  - Backend enforcement for limits (TTS, fact-check, briefing count, offline storage).
  - Frontend gating or upsell for Pro/Enterprise-only features.
- Payment and subscription lifecycle (Stripe, etc.) are out of scope of this doc but required for Pro and Enterprise.
- Push notification backend (subscribe/unsubscribe) is a prerequisite for Pro notification features (see `docs/technical/Narvo_Improvement_Recommendations.md`).

---

## 5. Summary Table (Proposed Differentiators)

| Area | Free | Pro | Enterprise |
|------|------|-----|------------|
| **News limit** | 20/request (recommended) | 50–100 | High / unlimited |
| **TTS / translation** | Daily cap (recommended) | 5× or more | High / unlimited + API |
| **Offline storage** | Cap (e.g. 50 articles) (recommended) | 200+ / 2 GB | Per-org |
| **Briefings** | 1/day (recommended) | 3/day, custom length | Custom + API |
| **Fact-check** | Rate limit (recommended) | Higher limit | Unlimited + API |
| **Push** | Breaking only (when implemented) | Full + digest + topics | Full + custom |
| **Admin** | — | — | Org-scoped admin, usage, SSO, SLA |

This document should be updated as features are shipped or as tier policies change. Keep `memory/PRD.md` and this file in sync for “current” vs “proposed” labels.
