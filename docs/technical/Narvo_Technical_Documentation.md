# Narvo Technical Documentation Overview

Narvo is a **Broadcast-Grade News Platform** that delivers AI-produced narratives in localized high-fidelity voices. This document covers the technical architecture, stack, and broadcast-centric implementation details.

**Key Innovation:** The synthesis of **Broadcast Paraphrasing** + **Regional TTS** addresses information overload while providing cultural resonance and journalistic authority in emerging markets.

---

## Core Features

### V2 Broadcast Features
- **The Broadcast Loop**: A radio-like continuous stream of prioritized news stories.
- **Native Language Translation**: Real-time synthesis and translation into local dialects.
- **Broadcast Paraphrasing**: Narrative-driven content synthesis using Google Gemini.
- **The Truth Tag**: Transparency on AI synthesis, translation, and source verification.
- **Regional Voice Studio**: Selection of high-fidelity, culturally accurate voices.
- **Swiss Grid Feed**: A rigid, precision-engineered layout for high-density information.
- **Predictive Station Sync**: Automated morning pre-caching of localized audio broadcasts (roadmap).

---

## Technical Architecture

### Infrastructure: Single Repository
The project uses a single repository with a **Create React App (CRA)** web frontend and a **FastAPI** backend. The **Swiss Grid Design System** is applied across the web app.

### Core Stack (Current Implementation)
| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Create React App (React) | SPA with React Router; PWA (manifest + service worker). |
| **Backend** | FastAPI | REST API; OpenAPI docs; async-capable. |
| **Persistence** | Supabase (Postgres) | Bookmarks, user preferences, briefings, offline articles, listening history, TTS cache; schema in `backend/supabase_schema.sql`. |
| **Auth** | Supabase (Auth) | User authentication; same Supabase project as persistence. |
| **AI / Narrative** | Google Gemini | Narrative synthesis and multilingual translation. |
| **TTS** | YARNGPT / OpenAI | Broadcast voice synthesis. |
| **Fact-Check** | Google Fact Check API | Verification; mock responses when API key omitted. |
| **News / Feeds** | RSS, MediaStack, NewsData (optional) | Aggregation and ingestion. |
| **Icons** | Phosphoricons | Main functional icon library (1.5px stroke). |
| **Motion** | GSAP + Framer Motion | Precision technical and reactive animations. |
| **Smooth Scroll** | Lenis | Momentum-based scrolling experience. |

### Future / Roadmap (Not Yet Implemented)
| Layer | Technology | Note |
|-------|------------|------|
| **Vector DB / RAG** | pgvector or similar | Contextual RAG for historical narrative context. |
| **Audio** | ElevenLabs / MiniMax | Premium multi-language TTS (currently OpenAI). |
| **Fact-Check** | Dubawa API | Optional regional verification labels. |
| **Predictive Sync** | 5:00 AM pre-cache | Automated morning pre-caching of audio by user locale. |

---

## Current Architecture

### Backend (FastAPI)
- **Entrypoint:** [backend/server.py](backend/server.py). App creation, CORS, DB/client setup, and router includes.
- **Mounted routers:** discover, offline, admin, user, factcheck, translation, **news** (`/api/news`, `/api/news/breaking`, `/api/news/{id}`), **briefing** (`/api/briefing/*`). Routers live under `backend/routes/` and delegate to services in `backend/services/`. News uses a single RSS source (`news_service`); admin has no duplicate definitions in `server.py`.
- **Inline in server.py:** Remaining routes include `/api/health`, `/api/paraphrase`, `/api/tts/generate`, `/api/voices`, `/api/regions`, `/api/categories`, `/api/sources`, `/api/aggregators/*`, `/api/trending`, `/api/search`, `/api/settings/*`, `/api/notifications/*`, `/api/radio/*`, `/api/bookmarks`, `/api/preferences`, `/api/share/*`, `/api/og/*`, and others.
- **Configuration:** Required and optional environment variables are listed in [backend/.env.example](backend/.env.example); see also code for vars such as `YARNGPT_API_KEY`, `MEDIASTACK_API_KEY`, `NEWSDATA_API_KEY`.

### Frontend (CRA)
- **Stack:** Create React App, React Router, Supabase client for auth. A central API client at [frontend/src/lib/api.js](frontend/src/lib/api.js) exposes `api.get(path)`, `api.post(path, body)`, and `api.del(path)` with `REACT_APP_BACKEND_URL` in one place. All frontend pages, hooks, and contexts use it for backend calls; share/og URLs use `API_BASE`. AuthContext still reads `REACT_APP_BACKEND_URL` for OAuth redirect (consider using `REACT_APP_PUBLIC_URL` for redirectTo in production).
- **PWA:** [frontend/public/manifest.json](frontend/public/manifest.json) and [frontend/public/sw.js](frontend/public/sw.js); service worker registered from `index.html`. Offline and caching strategy in `sw.js`.

---

## Broadcast Production Pipeline

### 1. Multi-Stream Ingestion
- **Structured Feeds:** RSS parsing with content cleaning; optional aggregator services (MediaStack, NewsData) when API keys are set.
- **Live Broadcasts / Video:** Real-time audio capture and transcription (e.g. Whisper) and YouTube narrative extraction are referenced in design; implementation may vary.

### 2. Synthesis, Translation & Truth Tag Lifecycle
1. **Extraction:** Automated pulling of raw facts and quotes from ingested content.
2. **Synthesis & Translation:** Gemini recasts content into a **Broadcast Narrative** and translates into the target language.
3. **Verification:** Google Fact Check API is used when configured; mock or fallback when the key is omitted. Truth Score and source attribution support the **Truth Tag**.
4. **Truth Tag Generation:** Metadata explaining editorial and translation decisions.

*Contextual RAG (Vector DB retrieval) and Dubawa-based verification are on the roadmap and not part of the current pipeline.*

### 3. Predictive Pre-caching (5:00 AM Sync) — Roadmap
Planned for future: at **5:00 AM local time**, pre-cache top stories and generated audio for user interest categories. Not yet implemented.

---

## Design System: Swiss Grid Implementation

### Visual Architecture
- **Visible Grid**: 1px structural borders (`#628141`) define all layout boundaries.
- **The 10% Rule**: Primary Sand (`#EBD5AB`) is restricted to **active signals** only.
- **No Shadows**: A pure 2D aesthetic focusing on spatial hierarchy.
- **Tabular Numerals**: Monospaced fonts for all data (speed, time, storage).

### Dynamic Interaction
- **Grid Breathing**: Subtle visual pulsing confirms active audio playback.
- **Haptic Precision**: Sharp haptic signatures for breaking news and sync completion.

---

## Success Metrics (V2)
- **Audio Completion Rate**: Target 85% of broadcasts heard to finish.
- **Truth Transparency Index**: User trust ratings on "Truth Tag" accuracy.
- **Broadcast Latency**: <500ms for play start from edge.
- **Source Fidelity**: 100% verification rate for all primary narratives.

---
