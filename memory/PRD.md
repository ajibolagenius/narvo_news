# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered, audio-first news broadcast platform with full PWA support for offline functionality and multi-language translation.

## Tech Stack
- **Frontend**: React, Tailwind CSS, @phosphor-icons/react, framer-motion, Tone.js, Howler.js
- **Backend**: FastAPI (modularized), Python
- **Database**: MongoDB
- **Auth**: Supabase
- **AI/TTS**: Google Gemini & OpenAI TTS (via Emergent LLM Key)
- **Translation**: Gemini AI for 5 African languages
- **Fact-Checking**: Google Fact Check API (with mock fallback)
- **News Aggregators**: Mediastack API, NewsData.io API
- **PWA**: Service Worker + IndexedDB + Push Notifications + Media Session API

## Architecture
```
/app/
├── backend/
│   ├── server.py           # Main FastAPI with modular routers
│   ├── routes/
│   │   ├── discover.py     # Podcasts with audio proxy, trending, radio
│   │   ├── offline.py      # Offline article storage
│   │   ├── admin.py        # Admin dashboard metrics & alerts
│   │   ├── user.py         # User preferences, bookmarks, settings
│   │   ├── factcheck.py    # Google Fact Check API + mock fallback
│   │   └── translation.py  # Multi-language translation endpoints
│   └── services/           # Business logic layer
│       ├── news_service.py      # RSS feed fetching, news aggregation
│       ├── podcast_service.py   # Podcast episode management + search
│       ├── radio_service.py     # Radio Browser API integration
│       ├── admin_service.py     # System metrics, alerts, moderation
│       ├── factcheck_service.py # Google Fact Check API integration
│       ├── translation_service.py # Gemini AI translation (5 languages)
│       ├── narrative_service.py # AI narrative generation
│       ├── offline_service.py   # Offline article management
│       ├── user_service.py      # User data management
│       ├── tts_service.py       # Text-to-speech generation
│       ├── briefing_service.py  # Morning briefing generation
│       └── aggregator_service.py # Mediastack + NewsData.io + cache + dedup
├── frontend/
│   ├── public/
│   │   ├── sw.js           # Service Worker with background sync + push
│   │   ├── manifest.json   # PWA manifest
│   │   └── index.html      # SW registration
│   └── src/
│       ├── contexts/
│       │   ├── AudioContext.js       # Media Session API + cinematic audio
│       │   └── DownloadQueueContext.js  # Global download state
│       ├── components/
│       │   ├── TourGuideModal.js  # First-time user tour (5 steps)
│       │   └── DownloadQueueIndicator.js # Floating download UI
│       ├── lib/
│       │   ├── audioCache.js       # IndexedDB blob storage
│       │   ├── cinematicAudio.js   # Tone.js broadcast audio effects
│       │   └── notificationService.js  # Push notification service
│       └── pages/
│           ├── DashboardPage.js    # User prefs + dedup + source filter
│           ├── SettingsPage.js     # Interface language (i18n) selector
│           ├── SystemSettingsPage.js # Broadcast/TTS/aggregator settings
│           ├── DiscoverPage.js     # "Download All" batch feature
│           └── OfflinePage.js      # Cached content management
└── memory/
    └── PRD.md
```

## All Features Complete

### Core Features
- Dashboard with news feed, images, animations
- Audio player with queue management
- On-demand TTS generation
- Search, Saved, Morning Briefing pages
- Discover page with podcasts & radio
- Offline page with cached content

### P1-P12 Features (All Complete)
- Podcast audio download, offline playback, dashboard scrolling fix
- Service Worker PWA, backend modularization
- Background sync, push notifications, batch download, download queue
- Background audio, multi-language translation, Google Fact Check, language settings
- Interface/Broadcast language selector differentiation
- AudioContext broadcast_language fetch fix, broadcast language toast
- Expanded RSS feeds (39 total), continental region, backend test suite
- SOURCE_MATRIX widget with proportion bar and expandable regions
- Real-time feed health monitoring with auto-refresh
- TTS voice gender mapping with Nigerian names
- Voice preview on /system, Mediastack + NewsData.io integration
- Aggregator feed integration, SOURCE_MATRIX counts, AGGREGATOR_WIRE
- Aggregator caching (10min TTL), search across aggregators, user prefs

### P13 Features - Bug Fixes & New Features (Feb 25, 2026)
- **Bug Fix: NewsData.io** — Fixed HTTP 422 by capping request limit to 10 (free plan). Verified working.
- **Bug Fix: Global Search** — Rewrote /api/search to query RSS feeds, aggregators, and podcasts with deduplication by ID.
- **Feature: User Prefs → Dashboard** — Dashboard fetches user's aggregator preferences and passes them to /api/news endpoint.
- **Feature: Title Deduplication** — Client-side deduplication in DashboardPage by normalized title prevents duplicate stories.
- **Feature: Tour Guide Modal** — 5-step modal for first-time users (localStorage 'narvo_tour_completed'). Covers LIVE_FEED, SOURCE_FILTER, DISCOVER, SEARCH, SYSTEM_SETTINGS. Triggers on login, register, and guest entry via custom event. Replay button on /settings page.
- **Feature: Cinematic Audio** — Broadcast-grade Tone.js audio effects scoped to briefing section only. Master chain: compressor + reverb. Intro (bass + rising chord + bright stab + noise sweep), section divider (bell + sweep), outro (descending chord + bass + shimmer). SFX toggle on briefing page.

### P14 - AI Text Sanitization (Feb 25, 2026)
- **AI Output Sanitizer** — Regex-based post-processor strips stage directions, sound descriptions, and production cues from all AI-generated text. Patterns: `[bracketed]`, `(music/sound cues)`, `*asterisked cues*`, `Sound of...` lines. Applied to: narrative generation, briefing scripts, translations, and narrated translations.
- **Hardened System Prompts** — All 4 AI generation functions (generate_narrative, generate_briefing_script, translate_text, translate_and_narrate) now include explicit CRITICAL RULES forbidding sound effects, stage directions, and non-verbal descriptions.

### P15 - UX Fixes & New Features (Feb 25, 2026)
- **UTC → Local Time** — Clock.js uses `toLocaleTimeString()`. All pages (Landing, Auth, ForgotPassword, NotFound, ServerError, AdminLayout, OperationHub, Account) now display local time instead of UTC.
- **Search Aggregator Integration** — SearchPage fully rewritten to use `/api/search` backend endpoint (not client-side). Source type filter (ALL/RSS/AGGREGATOR/PODCAST) + sort (LATEST/RELEVANCE). Backend search endpoint enhanced with `source_type` param and `source_type` field in response.
- **Dashboard Filter/Sort** — Replaced non-functional FILTERS/SORT buttons with working filter tabs (ALL/RSS/AGG) + sort toggle (NEW/OLD). Removed duplicate source filter.
- **Briefing Transcript Column** — Desktop: right-side TRANSCRIPT panel with full briefing text + follow-along highlighting (sentence-level tracking based on audio progress). Mobile: collapsible archive toggle + transcript below stories.
- **Tools/Credits Page** — New `/tools` page listing all 20+ technologies across 6 categories (Core Stack, AI Services, News Aggregation, Audio Engine, Auth & Storage, Infrastructure). Footer link on landing page.
- **Google OAuth** — Added `signInWithGoogle` to AuthContext via Supabase OAuth. Google button on `/auth` page. Narvo-branded email templates (confirmation, reset, magic link, invite) at `/app/frontend/src/email-templates/SETUP_GUIDE.md`.
- **Mobile Responsive** — Filter tabs fit 375px viewport. Briefing has mobile archive drawer. Search fully responsive.

## Supported Languages

### Interface Languages (i18n - /settings page)
| Code | Label | Region |
|------|-------|--------|
| en | English | GLOBAL |
| fr | Francais | WEST_AFRICA |
| yo | Yoruba | NIGERIA |
| ha | Hausa | NIGERIA |
| ig | Igbo | NIGERIA |
| pcm | Pidgin | WEST_AFRICA |
| sw | Kiswahili | EAST_AFRICA |

### Broadcast Languages (TTS - /system page)
| Code | Name | Native Name | Voice |
|------|------|-------------|-------|
| en | English | English | nova |
| pcm | Naija | Naija Tok | onyx |
| yo | Yoruba | Ede Yoruba | echo |
| ha | Hausa | Harshen Hausa | alloy |
| ig | Igbo | Asusu Igbo | shimmer |

## Key API Endpoints
- `GET /api/news` — RSS + optional aggregator news (params: include_aggregators, aggregator_sources)
- `GET /api/search` — Unified search across RSS, aggregators, podcasts with dedup
- `GET /api/aggregators/status` — Cache status with TTL
- `GET /api/aggregators/fetch` — Combined Mediastack + NewsData.io
- `GET /api/settings/{user_id}` — User settings including aggregator prefs
- `POST /api/settings/{user_id}` — Save user settings

## MOCKED APIs
- **Google Fact Check API** — Uses mock when `GOOGLE_FACT_CHECK_API_KEY` not set in .env

## Test Reports
- `/app/test_reports/iteration_35.json` — P13 features: All 6 bug fixes + features PASSED (16/16 backend, all frontend verified)
- `/app/test_reports/iteration_34.json` — P12 aggregator features (22/22 passed)

## Backlog
- **P1:** Add backend unit/integration tests for TTS and podcast services
- **P2:** Implement native mobile application based on performance guidelines
- **P2:** Allow users to provide their own API keys for services
