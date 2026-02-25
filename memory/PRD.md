# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered, audio-first news broadcast platform with full PWA support for offline functionality and multi-language translation.

## Tech Stack
- **Frontend**: React, Tailwind CSS, @phosphor-icons/react, framer-motion
- **Backend**: FastAPI (modularized), Python
- **Database**: MongoDB
- **Auth**: Supabase
- **AI/TTS**: Google Gemini & OpenAI TTS (via Emergent LLM Key)
- **Translation**: Gemini AI for 5 African languages
- **Fact-Checking**: Google Fact Check API (with mock fallback)
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
│       ├── podcast_service.py   # Podcast episode management
│       ├── radio_service.py     # Radio Browser API integration
│       ├── admin_service.py     # System metrics, alerts, moderation
│       ├── factcheck_service.py # Google Fact Check API integration
│       ├── translation_service.py # Gemini AI translation (5 languages)
│       ├── narrative_service.py # AI narrative generation
│       ├── offline_service.py   # Offline article management
│       ├── user_service.py      # User data management
│       ├── tts_service.py       # Text-to-speech generation
│       └── briefing_service.py  # Morning briefing generation
├── frontend/
│   ├── public/
│   │   ├── sw.js           # Service Worker with background sync + push
│   │   ├── manifest.json   # PWA manifest
│   │   └── index.html      # SW registration
│   └── src/
│       ├── contexts/
│       │   ├── AudioContext.js       # Media Session API for background audio
│       │   └── DownloadQueueContext.js  # Global download state
│       ├── components/
│       │   └── DownloadQueueIndicator.js # Floating download UI
│       ├── lib/
│       │   ├── audioCache.js       # IndexedDB blob storage
│       │   └── notificationService.js  # Push notification service
│       └── pages/
│           ├── SettingsPage.js       # Interface language (i18n) selector
│           ├── SystemSettingsPage.js  # Broadcast/TTS language selector
│           ├── DiscoverPage.js       # "Download All" batch feature
│           └── OfflinePage.js        # Cached content management
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

### P1 Features (Complete)
- **Podcast audio download** - Backend proxy + blob storage
- **Offline playback** - From IndexedDB cache
- **Dashboard scrolling** - Fixed flex container layout

### P2 Features (Complete)
- **Service Worker PWA** - Network-first caching
- **Backend modularization** - 6 route modules, 11 services

### P3 Features (Complete)
- **Background sync** - IndexedDB queue + sync event
- **Push notifications** - Breaking news alerts toggle in Settings
- **Download all podcasts** - Batch download with progress
- **Global Download Queue Indicator** - Floating UI showing download progress across pages

### P4 Features (Complete)
- **Background Audio Playback** - Media Session API for lock screen controls
- **Multi-Language Translation** - 5 languages (English, Pidgin, Yoruba, Hausa, Igbo)
- **Google Fact Check API** - Real API with mock fallback
- **Language Settings UI** - System Settings page with language selection

### P5 Features - Language Selector Differentiation (Complete - Feb 25, 2025)
- **Interface Language Selector (/settings)** - Compact pill-style buttons for 7 i18n languages (English, Francais, Yoruba, Hausa, Igbo, Pidgin, Kiswahili). Controls UI text/menus only. Section labeled "INTERFACE_LANGUAGE".
- **Broadcast Language Selector (/system)** - Rich card grid for 5 TTS languages with native names and ON_AIR badge. Controls audio narration language. Section labeled "BROADCAST_LANGUAGE" with subtitle "AUDIO_TRANSLATION_ENGINE".
- Cross-references between pages guide users to the correct selector.

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

## API Endpoints

### Translation
- `GET /api/translate/languages` - List 5 supported languages
- `GET /api/translate/quick?text=...&lang=pcm` - Quick translation
- `POST /api/translate/text` - Full translation with metadata
- `POST /api/translate/narrate` - Translate + broadcast narrative

### Fact-Check
- `GET /api/factcheck/search?query=...` - Search Google Fact Check API
- `GET /api/factcheck/verify?claim=...` - Get verdict & confidence
- `POST /api/factcheck/analyze` - Keyword-based quick analysis

### Podcast Audio Proxy
- `GET /api/podcasts/{id}/audio` - Streams audio (CORS-safe)

### Offline Storage
- `POST /api/offline/save` - Save article
- `GET /api/offline/articles` - List saved
- `DELETE /api/offline/articles/{id}` - Remove

### Content Sources
- `GET /api/content-sources` - Returns metadata for all news sources
- `GET /api/metrics` - System metrics including total_sources count

### User Settings
- `GET /api/settings/{user_id}` - Get user settings
- `POST /api/settings/{user_id}` - Save user settings (includes broadcast_language)

## Test Reports
- `/app/test_reports/iteration_26.json` - Global Download Queue Indicator (7/7 passed)
- `/app/test_reports/iteration_27.json` - Translation, Fact-Check, Language Settings (17/17 passed)
- `/app/test_reports/iteration_28.json` - Language Selector UI Differentiation (11/11 passed)

## MOCKED APIs
- **Google Fact Check API** - Uses mock when `GOOGLE_FACT_CHECK_API_KEY` not set in .env
- Response includes `source: "MOCK_FACTCHECK"` to indicate mock usage

## Backlog
- **P2:** Implement the native mobile application based on performance guidelines
- **Removed:** Dubawa fact-checking API (removed from backlog per user request)
