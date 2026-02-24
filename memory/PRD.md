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
│   ├── server.py         # Main FastAPI server (monolithic, migration pending)
│   ├── models/           # Pydantic models (scaffolding)
│   ├── routes/           # FastAPI routers (scaffolding)
│   └── services/         # Business logic (scaffolding)
├── frontend/
│   └── src/
│       ├── components/   # Sidebar, Header, AudioPlayer, ResponsiveTabView, ThemeToggle, etc.
│       ├── contexts/     # AuthContext, AudioContext, ThemeContext, LenisProvider
│       ├── pages/        # All page components including admin/ subfolder
│       ├── App.js        # Routing with lazy-loaded pages
│       └── index.css     # Design system with CSS variables (RGB format)
└── memory/
    └── PRD.md
```

## Theming System
- **CSS Variables**: RGB space-separated format (`--color-bg: 27 33 26`) for Tailwind opacity support
- **Tailwind Config**: Colors use `rgb(var(--color-*) / <alpha-value>)` format
- **Theme Toggle**: Sidebar + Settings, persisted in localStorage
- **Key classes**: `text-content` (primary text), `bg-background-dark` (bg), `bg-surface` (secondary), `text-forest` (accent), `text-primary` (signal)

## Icon System
- **Library**: @phosphor-icons/react (fully migrated from lucide-react)
- All ~25+ files updated with correct Phosphor icon names

## Key API Endpoints
- `GET /api/news` → NewsItem list with image_url from RSS feeds
- `GET /api/news/{id}` → Detailed news with narrative
- `GET /api/share/{news_id}` → Server-side OG tags for social sharing
- `GET /api/briefings/history` → Historical morning briefings
- `GET /api/search` → Keyword search
- `GET /api/articles/saved` → Bookmarks
- `POST /api/articles/saved` → Save bookmark
- `POST /api/tts/generate` → On-demand TTS
- `GET /api/news/breaking` → Breaking news

## Completed Features (All Tested)
- [x] Dashboard with news feed, telemetry panel, featured story
- [x] **Framer Motion entrance animations** on news cards (staggered fade-in)
- [x] **Real news images from RSS feeds** (media:content, media:thumbnail, enclosures, HTML img)
- [x] Audio player bar with play/pause, volume, queue management
- [x] On-demand TTS generation via AudioContext
- [x] Sidebar navigation with Phosphor icons
- [x] Breaking news banner
- [x] Search, Saved, Morning Briefing, Discover, Offline pages
- [x] **Forgot Password page** (/forgot-password) with Supabase integration
- [x] Settings, Account, Accessibility, System Settings, Voice Studio pages
- [x] Admin pages (Operations, Curation, Voice Management, Moderation)
- [x] **ResponsiveTabView** on AccessibilityPage and AccountPage
- [x] CSS variable theming (light/dark mode) with full opacity support
- [x] Complete icon migration: lucide-react → @phosphor-icons/react
- [x] **Mobile nav bar spacing** (mb-14 prevents content overlap)
- [x] CSS smooth scrolling
- [x] Dynamic OG tags for social sharing
- [x] i18n support
- [x] Auth with Supabase (guest mode available)

## Upcoming Tasks
### P1 (High Priority)
- [ ] Add framer-motion/gsap animations for page transitions (between routes)
- [ ] Remove artificial loading delays for instant navigation

### P2 (Medium Priority)
- [ ] Real Dubawa fact-checking API integration (currently MOCKED)
- [ ] Full backend for Discover and Offline pages
- [ ] Properly implement Lenis smooth scrolling (requires layout refactor)

### P3 (Future)
- [ ] Native mobile application
- [ ] Backend monolith migration (server.py → modular routes/services/models)

## Testing Status
- iteration_21: 100% (12/12) — Icon migration + theming
- iteration_22: 95% — Animations, mobile spacing, forgot password (AccountPage fix applied)
- iteration_23: 100% (all features) — Full re-test after RSS image fix

## Mocked Integrations
- **Dubawa fact-checking**: Uses simulated responses based on story_id hash
