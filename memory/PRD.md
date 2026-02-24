# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered, audio-first news broadcast platform designed for global audiences, with a primary focus on African markets. The mission is to democratize access to high-quality, trustworthy news through an audio-first broadcast experience.

## Core Pillars
- **Minimalism**: Clean, Swiss-grid inspired UI with maximum information density
- **Broadcast-Grade Audio**: On-demand TTS with multiple voice profiles
- **Trusted Authority**: Fact-checking integration (Dubawa), source verification
- **Engineering Excellence**: Fast load times, responsive design, accessibility

## Tech Stack
- **Frontend**: React, Tailwind CSS, @phosphor-icons/react, framer-motion, gsap
- **Backend**: FastAPI, Python
- **Database**: MongoDB
- **Auth**: Supabase
- **AI/TTS**: Google Gemini & OpenAI TTS (via Emergent LLM Key)
- **Styling**: CSS variables for theming, Tailwind with CSS variable-based colors

## Architecture
```
/app/
├── backend/
│   ├── models/       # Pydantic models
│   ├── routes/       # FastAPI routers
│   ├── services/     # Business logic
│   └── server.py     # Main FastAPI server
├── frontend/
│   └── src/
│       ├── components/    # Reusable components (Sidebar, Header, AudioPlayer, etc.)
│       ├── contexts/      # React contexts (Auth, Audio, Theme, Lenis)
│       ├── pages/         # Page components
│       │   └── admin/     # Admin pages
│       ├── App.js         # Main app with routing
│       └── index.css      # Design system CSS variables
└── memory/
    └── PRD.md
```

## Theming System
- **CSS Variables**: RGB space-separated format for Tailwind opacity support
  - Dark mode (default): `--color-bg: 27 33 26`, `--color-primary: 235 213 171`
  - Light mode: `--color-bg: 235 213 171`, `--color-primary: 27 33 26`
- **Tailwind Config**: Colors use `rgb(var(--color-*) / <alpha-value>)` format
- **Theme Toggle**: In sidebar and settings, persisted via localStorage
- **Color Classes**: `text-content` (primary text), `text-forest` (border/accent), `bg-background-dark` (bg), `bg-surface` (secondary bg), `text-primary` (accent)

## Icon System
- **Library**: @phosphor-icons/react (replaces lucide-react)
- **Complete migration**: All ~25+ files updated
- **Key mappings**: Activity→Pulse, AlertTriangle→Warning, RotateCcw→ArrowCounterClockwise, RefreshCw→ArrowClockwise, Settings→GearSix, Filter→Funnel, Search→MagnifyingGlass, Mic→Microphone, RadioTower→Broadcast, Satellite→Planet, Zap→Lightning, ChevronLeft→CaretLeft

## Key API Endpoints
- `GET /api/share/{news_id}`: Dynamic OG meta tags for social sharing
- `GET /api/briefings/history`: Historical morning briefings
- `GET /api/search`: Keyword search across articles
- `GET /api/articles/saved`: User bookmarks
- `POST /api/articles/saved`: Save article
- `GET /api/news`: News feed with pagination/sorting
- `POST /api/tts/generate`: On-demand TTS generation

## Completed Features
- [x] Dashboard with news feed, telemetry panel, featured story
- [x] Audio player bar with play/pause, volume, queue management
- [x] On-demand TTS generation via AudioContext
- [x] Sidebar navigation with Phosphor icons
- [x] Breaking news banner with real-time alerts
- [x] Search page with keyword search
- [x] Saved/Bookmarked articles
- [x] Morning Briefing page with historical archive
- [x] Settings page with theme, language, voice preferences
- [x] Account page with profile info
- [x] Accessibility page with contrast, font size, motion settings
- [x] System settings page
- [x] Voice Studio page
- [x] Admin pages (Operations, Curation, Voice Management, Moderation)
- [x] Authentication with Supabase (guest mode available)
- [x] i18n support (multiple languages)
- [x] Dynamic OG tags for social media sharing
- [x] **Complete icon migration: lucide-react → @phosphor-icons/react**
- [x] **CSS variable theming system with light/dark mode**
- [x] **Tailwind config using CSS variables for theme-aware colors**
- [x] **text-white → text-content replacement for theme compatibility**
- [x] CSS smooth scrolling for all scroll containers

## In Progress / Upcoming Tasks
### P0 (Immediate)
- [ ] ResponsiveTabView on AccessibilityPage (columns → tabs on mobile)

### P1 (High Priority)
- [ ] Fetch real news images from RSS feed `image_url` field
- [ ] Implement framer-motion/gsap animations for page transitions
- [ ] Remove artificial loading delays for instant navigation

### P2 (Medium Priority)
- [ ] Real Dubawa fact-checking API integration (currently MOCKED)
- [ ] Full backend for Discover and Offline pages
- [ ] Properly implement Lenis smooth scrolling (requires layout refactor for single scroll container)

### P3 (Future)
- [ ] Native mobile application
- [ ] Backend monolith migration (server.py → modular routes/services/models)

## Mocked Integrations
- **Dubawa fact-checking**: Uses simulated responses based on story_id hash

## Testing Status
- iteration_21.json: 100% pass rate (12/12 features) - UI/UX overhaul verification
- All Phosphor icons verified across all pages
- Theme toggle verified (light/dark modes)
- Scrolling verified as working
