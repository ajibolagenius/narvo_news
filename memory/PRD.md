# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered, audio-first news broadcast platform designed for global audiences, with a primary focus on African markets. Mission: democratize access to high-quality, trustworthy news through an audio-first broadcast experience.

## Tech Stack
- **Frontend**: React, Tailwind CSS (v3.4), @phosphor-icons/react, framer-motion, gsap
- **Backend**: FastAPI, Python
- **Database**: MongoDB
- **Auth**: Supabase
- **AI/TTS**: Google Gemini & OpenAI TTS (via Emergent LLM Key)

## Architecture
```
/app/
├── backend/
│   ├── server.py         # Main FastAPI server with all endpoints
│   ├── models/           # Pydantic models (scaffolding)
│   ├── routes/           # FastAPI routers (scaffolding)
│   └── services/         # Business logic (scaffolding)
├── frontend/
│   └── src/
│       ├── components/   # Sidebar, Header, AudioPlayer, ResponsiveTabView, ThemeToggle, etc.
│       ├── contexts/     # AuthContext, AudioContext, ThemeContext
│       ├── pages/        # All page components including admin/ subfolder
│       ├── App.js        # Routing with lazy-loaded pages
│       └── index.css     # Design system with CSS variables (RGB format)
└── memory/
    └── PRD.md
```

## Design System Colors

### Dark Mode (Default)
```css
--color-primary: 235 213 171;       /* Sand/Beige - Signal color */
--color-bg: 27 33 26;               /* Deep Matte Charcoal */
--color-surface: 36 43 35;          /* Muted Green/Grey */
--color-border: 98 129 65;          /* Forest Green */
--color-text-primary: 242 242 242;  /* 90% White */
--color-text-secondary: 139 174 102; /* Sage Green */
```

### Light Mode (New - Feb 2025)
```css
--color-primary: 98 129 65;         /* Forest Green #628141 */
--color-bg: 255 255 255;            /* Pure White #FFFFFF */
--color-surface: 239 243 237;       /* Soft Sage Tint #EFF3ED */
--color-border: 27 33 26;           /* Dark Charcoal #1B211A */
--color-text-primary: 27 33 26;     /* Dark Charcoal */
--color-text-secondary: 98 129 65;  /* Forest Green */
```

## Key API Endpoints

### News
- `GET /api/news` → NewsItem list with image_url from RSS feeds
- `GET /api/news/{id}` → Detailed news with narrative
- `GET /api/news/breaking` → Breaking news
- `GET /api/search` → Keyword search

### Discover
- `GET /api/podcasts` → Curated podcast episodes (6 episodes)
- `GET /api/discover/trending` → Trending topics from RSS analysis
- `GET /api/radio/countries` → African countries (12 total)
- `GET /api/radio/stations?country=XX` → Live radio stations from Radio Browser API

### Offline
- `POST /api/offline/save` → Save article for offline reading
- `GET /api/offline/articles` → Retrieve saved offline articles
- `DELETE /api/offline/articles/{story_id}` → Remove specific article
- `DELETE /api/offline/articles` → Clear all offline articles
- `GET /api/offline/stats` → Storage statistics

### Other
- `GET /api/share/{news_id}` → Server-side OG tags for social sharing
- `GET /api/briefings/history` → Historical morning briefings
- `GET /api/articles/saved` → Bookmarks
- `POST /api/tts/generate` → On-demand TTS

## Completed Features (All Tested - Feb 24, 2025)

### Core Features
- [x] Dashboard with news feed, telemetry panel, featured story
- [x] **Framer Motion entrance animations** on news cards
- [x] **Real news images from RSS feeds**
- [x] Audio player bar with play/pause, volume, queue
- [x] On-demand TTS generation
- [x] Sidebar navigation with Phosphor icons
- [x] Breaking news banner
- [x] Search, Saved, Morning Briefing pages

### Discover Page (Feb 24, 2025)
- [x] **Podcasts section** fetching from `/api/podcasts`
- [x] **Radio Garden** with African stations from Radio Browser API
- [x] **Trending topics** from `/api/discover/trending`
- [x] Featured broadcast hero
- [x] LATEST/POPULAR sort toggle for podcasts

### Offline Page (Feb 24, 2025)
- [x] **Filter tabs: ALL, AUDIO, ARTICLES** with counts
- [x] Integration with backend `/api/offline/*` endpoints
- [x] Combined IndexedDB audio cache + MongoDB articles
- [x] Storage usage bar
- [x] Empty state with navigation options

### Dashboard Offline Integration (Feb 24, 2025)
- [x] **Save for Offline button** (CloudArrowDown icon)
- [x] Toast notifications for save/delete actions
- [x] Featured card + stream cards have offline buttons

### Design System (Feb 24, 2025)
- [x] **Light mode colors updated** per new design specification
- [x] Pure white background (`#FFFFFF`)
- [x] Forest green primary (`#628141`)
- [x] Soft sage surface (`#EFF3ED`)
- [x] Theme toggle working correctly

### Other Completed
- [x] Forgot Password page
- [x] Settings, Account, Accessibility pages
- [x] Admin pages (Operations, Curation, Voice Management, Moderation)
- [x] ResponsiveTabView on Account page
- [x] Mobile nav spacing fix
- [x] Dynamic OG tags for social sharing
- [x] i18n support
- [x] Auth with Supabase (guest mode available)

## Testing Status (Feb 24, 2025)
- **Iteration 24**: 100% pass rate
  - Backend: 12/12 tests passed
  - Frontend: All features working
  - Light/Dark mode: Working
  - Discover page: Working
  - Offline page: Working

## Mocked Integrations
- **Dubawa fact-checking**: Uses simulated responses based on story_id hash (P2 to integrate real API)

## Upcoming Tasks

### P1 (High Priority)
- None currently

### P2 (Medium Priority)
- [ ] Real Dubawa fact-checking API integration (currently MOCKED)
- [ ] Backend monolith migration (server.py → modular routes/services/models)

### P3 (Future)
- [ ] Native mobile application
- [ ] Podcast audio caching with audio file downloads
- [ ] Offline audio playback from cached files
