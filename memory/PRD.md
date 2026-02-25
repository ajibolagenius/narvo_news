# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered, audio-first news broadcast platform with full PWA support for offline functionality and multi-language translation. Built for global audiences with a primary focus on African markets.

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Phosphor Icons, Framer Motion, Tone.js, Howler.js
- **Backend**: FastAPI (modularized), Python 3.11
- **Database**: MongoDB (via MONGO_URL)
- **Auth**: Supabase (Email/Password + Google OAuth)
- **AI/TTS**: YarnGPT (primary), OpenAI TTS fallback (via Emergent LLM Key), Google Gemini 2.0 Flash
- **Translation**: Gemini AI for 5 African languages + English
- **Fact-Checking**: Google Fact Check API (with keyword analysis fallback)
- **News Sources**: 39 RSS feeds + Mediastack API + NewsData.io API
- **Podcast Sources**: 5 real RSS feeds (The Daily, The Vergecast, SYSK, Planet Money, The Continent)
- **PWA**: Service Worker + IndexedDB + Media Session API

## Core Features Implemented
- News dashboard with RSS + aggregator feeds, filtering, sorting, deduplication
- AI narrative generation (Google Gemini), TTS narration with server-side caching
- YarnGPT as primary TTS engine with 5 Nigerian-accented voices
- Morning briefing with transcript follow-along
- Multi-language broadcast (5 African languages + English)
- Podcast discovery with real RSS feeds, search, category filters, episode detail expansion
- Radio streaming with African station browser
- Supabase authentication (Email/Password + Google OAuth + Guest Mode)
- User settings persistence (localStorage + MongoDB dual sync)
- Audio pre-fetching for dashboard articles (idle-time background loading)
- Clickable hashtag system (TagPill component) throughout dashboard and detail pages
- Listening History timeline with date grouping and replay
- Real-time fact-checking with actual publishers (AFP, Reuters, Africa Check, PesaCheck, Full Fact)
- Real platform metrics from database (stories processed, broadcast hours, network load)
- Real system alerts from live service status monitoring
- Interest Matrix — 8 selectable news categories for personalized feed delivery
- Broadcast Sound Themes — 5 selectable audio branding themes (Narvo Classic, Afrobeats, BBC World, Breaking Alert, Midnight Jazz)
- Push Notification endpoints (subscribe, unsubscribe, daily digest)
- WCAG 2.1 AA accessibility (skip link, focus-visible, reduced motion)
- Responsive mobile-first design across all pages
- News detail autoplay with TTS pre-generation and direct audio URL pass-through
- Playback speed control (0.75x, 1x, 1.25x, 1.5x, 2x) on desktop and mobile players
- PWA installability: proper PNG icons, desktop + mobile screenshots

## Key API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/news` | GET | RSS + aggregator news |
| `/api/search` | GET | Unified search with source_type filter |
| `/api/podcasts` | GET | List real podcast episodes from RSS |
| `/api/podcasts/categories` | GET | 8 podcast categories |
| `/api/podcasts/search` | GET | Search episodes by title/description |
| `/api/podcasts/{id}` | GET | Episode detail by ID |
| `/api/settings/{user_id}` | GET/POST | User settings (merge save, includes interests & sound_theme) |
| `/api/tts/generate` | POST | TTS with MongoDB caching (YarnGPT primary, OpenAI fallback) |
| `/api/factcheck/story/{id}` | GET | Real fact-check with story lookup + keyword analysis |
| `/api/metrics` | GET | Real platform metrics from DB |
| `/api/system-alerts` | GET | Real system alerts from live services |
| `/api/listening-history` | POST | Record a played broadcast |
| `/api/listening-history/{user_id}` | GET | User's listening history |
| `/api/briefing/latest` | GET | Latest morning briefing |
| `/api/voices` | GET | Available TTS voices (YarnGPT) |
| `/api/sound-themes` | GET | Available broadcast sound themes |
| `/api/notifications/subscribe` | POST | Subscribe to push notifications |
| `/api/notifications/unsubscribe` | POST | Unsubscribe from push notifications |
| `/api/notifications/digest` | GET | Get daily digest content |
| `/api/categories` | GET | Available news categories |

## Backend Tests
- `/app/backend/tests/test_services_v2.py` — 10 tests covering metrics, factcheck, podcasts, listening history, TTS caching, settings persistence
- `/app/backend/tests/test_iteration44.py` — 11 tests covering YarnGPT voices, sound themes, notifications, interests, briefing stability

## Backlog
- **P2:** Native mobile application
- **P3:** User-provided API keys for external services
- **P3:** Analytics dashboard
