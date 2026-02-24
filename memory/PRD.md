# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered, audio-first news broadcast platform designed for global audiences, with a primary focus on African markets. Mission: democratize access to high-quality, trustworthy news through an audio-first broadcast experience.

## Tech Stack
- **Frontend**: React, Tailwind CSS (v3.4), @phosphor-icons/react, framer-motion, gsap
- **Backend**: FastAPI, Python (modularized architecture)
- **Database**: MongoDB
- **Auth**: Supabase
- **AI/TTS**: Google Gemini & OpenAI TTS (via Emergent LLM Key)

## Architecture (Updated Feb 24, 2025)
```
/app/
├── backend/
│   ├── server.py           # Main FastAPI server (includes routers)
│   ├── routes/
│   │   ├── discover.py     # Podcasts, trending, radio
│   │   ├── offline.py      # Offline article storage
│   │   ├── admin.py        # Admin metrics, alerts, moderation
│   │   ├── user.py         # Preferences, bookmarks, voices
│   │   ├── news.py         # News endpoints (scaffold)
│   │   └── briefing.py     # Morning briefing (scaffold)
│   ├── services/
│   │   ├── news_service.py # RSS feed processing
│   │   ├── briefing_service.py
│   │   └── tts_service.py  # TTS generation
│   ├── models/
│   │   └── __init__.py     # Pydantic models
│   └── tests/              # Pytest test files
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── DashboardLayout.js  # Fixed: overflow-y-auto for scrolling
│       │   ├── BreakingNews.js     # Fixed: text-white for light mode
│       │   └── ... (Sidebar, Header, AudioPlayer, etc.)
│       ├── contexts/
│       ├── pages/
│       └── index.css       # Design system CSS variables
└── memory/
    └── PRD.md
```

## Design System Colors

### Dark Mode (Default)
```css
--color-primary: 235 213 171;       /* Sand/Beige */
--color-bg: 27 33 26;               /* Deep Matte Charcoal */
--color-surface: 36 43 35;          /* Muted Green/Grey */
--color-border: 98 129 65;          /* Forest Green */
--color-text-primary: 242 242 242;  /* 90% White */
--color-text-secondary: 139 174 102; /* Sage Green */
```

### Light Mode
```css
--color-primary: 98 129 65;         /* Forest Green #628141 */
--color-bg: 255 255 255;            /* Pure White #FFFFFF */
--color-surface: 239 243 237;       /* Soft Sage Tint #EFF3ED */
--color-border: 27 33 26;           /* Dark Charcoal #1B211A */
--color-text-primary: 27 33 26;     /* Dark Charcoal */
--color-text-secondary: 98 129 65;  /* Forest Green */
```

## Key API Endpoints (Modularized)

### Core (server.py)
- `GET /api/health` → Health check
- `GET /api/news` → News from RSS feeds with image extraction
- `GET /api/news/{id}` → News detail with narrative
- `GET /api/search` → Keyword search

### Discover (routes/discover.py)
- `GET /api/podcasts` → 6 curated podcast episodes
- `GET /api/podcasts/{id}` → Podcast detail
- `GET /api/discover/trending` → 6 trending topics
- `GET /api/radio/countries` → 12 African countries
- `GET /api/radio/stations?country=XX` → Radio stations

### Offline (routes/offline.py)
- `POST /api/offline/save` → Save article for offline
- `GET /api/offline/articles` → Get saved articles
- `DELETE /api/offline/articles/{story_id}` → Remove article
- `DELETE /api/offline/articles` → Clear all
- `GET /api/offline/stats` → Storage statistics

### Admin (routes/admin.py)
- `GET /api/admin/metrics` → System metrics
- `GET /api/admin/alerts` → System alerts
- `GET /api/admin/streams` → Stream status
- `GET /api/admin/voices` → Voice metrics
- `GET /api/admin/moderation` → Moderation queue

### User (routes/user.py)
- `GET /api/voices` → Available TTS voices
- `GET /api/articles/saved` → Bookmarks
- `GET /api/user/preferences` → User preferences
- `GET /api/user/settings` → User settings

## Completed Features (All Tested - Feb 24, 2025)

### Bug Fixes (Session 2)
- [x] **Dashboard scrolling** - Fixed by changing `overflow-hidden` to `overflow-y-auto` in DashboardLayout.js motion.div wrapper
- [x] **Breaking news banner text** - Changed to `text-white` for visibility in light mode

### Backend Modularization (Session 2)
- [x] Created `routes/discover.py` - Podcasts, trending, radio endpoints
- [x] Created `routes/offline.py` - Offline article storage
- [x] Created `routes/admin.py` - Admin dashboard endpoints
- [x] Created `routes/user.py` - User preferences, bookmarks, voices
- [x] Updated `server.py` to include all new routers

### Design System (Session 1)
- [x] Light mode colors updated per new design spec
- [x] Pure white background, forest green primary
- [x] Theme toggle working

### Features (Session 1)
- [x] Real RSS images from news feeds
- [x] Framer Motion entrance animations
- [x] Save for Offline button on dashboard cards
- [x] Discover page with API-fetched podcasts
- [x] Offline page with filter tabs (ALL/AUDIO/ARTICLES)

## Testing Status (Feb 24, 2025)
- **Iteration 25**: 100% pass rate (16/16 backend tests, all frontend features)
- Dashboard scrolling verified
- Breaking news banner text WHITE confirmed
- All modular routes working

## Mocked Integrations
- **Dubawa fact-checking**: Uses simulated responses (P2 to integrate)

## Remaining Tasks

### P1 (High Priority)
- [ ] Podcast audio caching with audio file downloads
- [ ] Offline audio playback from cached files

### P2 (Medium Priority)
- [ ] Real Dubawa fact-checking API integration
- [ ] Complete migration of remaining server.py endpoints to modular routes

### P3 (Future)
- [ ] Native mobile application
- [ ] Push notifications for breaking news
