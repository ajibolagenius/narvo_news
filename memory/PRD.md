# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered, audio-first news broadcast platform with full PWA support for offline functionality and multi-language translation. Built for global audiences with a primary focus on African markets.

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Phosphor Icons, Framer Motion, Tone.js, Howler.js
- **Backend**: FastAPI (modularized), Python 3.11
- **Database**: MongoDB (via MONGO_URL)
- **Auth**: Supabase (Email/Password + Google OAuth)
- **AI/TTS**: Google Gemini 2.0 Flash & OpenAI TTS (via Emergent LLM Key)
- **Translation**: Gemini AI for 5 African languages + English
- **Fact-Checking**: Google Fact Check API (with mock fallback)
- **News Sources**: 39 RSS feeds + Mediastack API + NewsData.io API
- **PWA**: Service Worker + IndexedDB + Push Notifications + Media Session API

## Core Features Implemented
- News dashboard with RSS + aggregator feeds, filtering, sorting, deduplication
- AI narrative generation (Google Gemini), TTS narration (OpenAI)
- Morning briefing with transcript follow-along
- Multi-language broadcast (5 African languages + English)
- Podcast discovery with search, category filters, and episode detail expansion
- Radio streaming with African station browser
- Supabase authentication (Email/Password + Google OAuth + Guest Mode)
- User settings persistence (localStorage + MongoDB dual sync)
- Server-side TTS caching for faster audio playback
- Audio pre-fetching for dashboard articles (idle-time background loading)
- Clickable hashtag system (TagPill component) throughout dashboard and detail pages
- Offline content management with IndexedDB audio caching
- PWA with service worker, media session API
- WCAG 2.1 AA accessibility (skip link, focus-visible, reduced motion)
- Responsive mobile-first design across all pages

## Architecture
```
/app/
├── backend/
│   ├── server.py                    # Main FastAPI app, routes, AI generation
│   ├── routes/
│   │   ├── discover.py              # Podcasts (categories, search, detail), trending, radio
│   │   ├── offline.py               # Offline article storage
│   │   ├── admin.py                 # Admin dashboard metrics & alerts
│   │   ├── user.py                  # User preferences, bookmarks, settings
│   │   ├── factcheck.py             # Google Fact Check API + mock fallback
│   │   └── translation.py           # Multi-language translation endpoints
│   ├── services/
│   │   ├── news_service.py          # RSS feed fetching (39 sources)
│   │   ├── podcast_service.py       # Podcast episodes + search + categories
│   │   ├── radio_service.py         # Radio Browser API
│   │   ├── admin_service.py         # System metrics, alerts
│   │   ├── factcheck_service.py     # Google Fact Check integration
│   │   ├── translation_service.py   # Gemini AI translation (5 languages)
│   │   ├── narrative_service.py     # AI narrative generation
│   │   ├── offline_service.py       # Offline article management
│   │   ├── user_service.py          # User data management
│   │   ├── tts_service.py           # OpenAI text-to-speech
│   │   ├── briefing_service.py      # Morning briefing generation
│   │   └── aggregator_service.py    # Mediastack + NewsData.io
│   ├── tests/                       # Backend test suite (pytest)
│   ├── requirements.txt
│   └── .env
├── frontend/
│   └── src/
│       ├── contexts/                # AuthContext, AudioContext, DownloadQueue, etc.
│       ├── components/
│       │   ├── HashtagText.js       # TagPill + HashtagText for clickable tags
│       │   ├── DashboardLayout.js   # Main layout with skip-link target
│       │   ├── DashboardHeader.js   # Header (NARVO always visible)
│       │   ├── DashboardSidebar.js  # Sidebar + mobile bottom nav
│       │   └── ui/                  # Shadcn components
│       ├── hooks/
│       │   ├── useSettings.js       # localStorage + MongoDB sync hook
│       │   ├── useAudioPrefetch.js  # Audio pre-fetching in idle time
│       │   └── useBookmarks.js      # Bookmark management
│       ├── pages/
│       │   ├── AccountPage.js       # Redesigned with metric cards grid
│       │   ├── VoiceStudioPage.js   # Unified VOICE_MATRIX + broadcast language
│       │   ├── NewsDetailPage.js    # Mobile metadata open by default
│       │   ├── DiscoverPage.js      # Full podcast search/categories/detail
│       │   ├── DashboardPage.js     # TagPill hashtags + audio prefetch
│       │   ├── SystemSettingsPage.js # localStorage cached settings
│       │   ├── AccessibilityPage.js # localStorage cached settings
│       │   ├── SettingsPage.js      # useSettings hook for persistence
│       │   └── ...                  # Other pages
│       ├── App.js                   # Routes + skip-link
│       └── index.css                # Global styles + accessibility CSS
└── docs/design/Narvo_Design_System.md
```

## Key API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/news` | GET | RSS + aggregator news |
| `/api/search` | GET | Unified search with source_type filter |
| `/api/podcasts` | GET | List podcast episodes |
| `/api/podcasts/categories` | GET | 8 podcast categories |
| `/api/podcasts/search` | GET | Search episodes by title/description |
| `/api/podcasts/{id}` | GET | Episode detail by ID |
| `/api/settings/{user_id}` | GET/POST | User settings (merge save) |
| `/api/tts/generate` | POST | TTS generation with MongoDB caching |
| `/api/briefing/latest` | GET | Latest morning briefing |
| `/api/voices` | GET | Available TTS voices |

## Backlog
- **P1:** Backend unit tests for TTS, podcast, briefing services
- **P2:** Native mobile application
- **P3:** User-provided API keys for external services
- **P3:** Daily digest email/push notifications
