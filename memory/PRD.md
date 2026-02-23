# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered news broadcast platform that transforms fragmented information into high-fidelity, audio-enhanced narrative stories. Built for global audiences with a primary focus on African markets.

## Original Problem Statement
Build a full-stack web application for Narvo - a broadcast-grade news platform with:
- Swiss Grid design system (strict minimalism, 1px borders, dark theme)
- Audio-first experience with TTS in regional African accents
- AI-powered narrative synthesis
- Live news aggregation from African sources
- Truth Tags for source verification
- Morning Briefing feature with auto-generated 5-minute audio digest

## Technical Stack
- **Frontend**: React 18, TailwindCSS, React Router
- **Backend**: FastAPI (Python)
- **Database/Auth**: Supabase (PostgreSQL + Auth)
- **AI**: Gemini 2.0 Flash (via Emergent LLM Key)
- **TTS**: OpenAI TTS (via Emergent LLM Key)
- **News Sources**: RSS feeds from 7 African sources

## Architecture (Updated Feb 23, 2026)
```
/app/frontend/src/
├── App.js                    # Clean routing (~53 lines)
├── App.css
├── index.js
├── index.css                 # Global styles, CSS variables, animations
├── lib/
│   └── supabase.js          # Supabase client instance
├── contexts/
│   ├── AuthContext.js        # Supabase auth provider
│   └── AudioContext.js       # Audio playback provider
├── hooks/
│   └── useBookmarks.js      # Bookmark hook (localStorage + API sync)
├── components/
│   ├── LoadingScreen.js      # Boot animation
│   ├── Clock.js              # UTC clock
│   ├── AudioPlayer.js        # Persistent audio player bar
│   └── ProtectedRoute.js     # Auth guard component
└── pages/
    ├── LandingPage.js        # Public landing page
    ├── AuthPage.js           # Login/Signup with Supabase
    ├── OnboardingPage.js     # 3-panel setup (region, voice, interests)
    ├── DashboardPage.js      # Live news feed + sidebar
    ├── NewsDetailPage.js     # Story detail + narrative + TTS
    ├── BookmarksPage.js      # Saved stories (offline capable)
    ├── VoiceStudioPage.js    # Voice profile selection
    ├── MorningBriefingPage.js # Daily audio digest
    ├── SearchPage.js         # News search
    └── SettingsPage.js       # Profile + logout

/app/backend/
├── server.py                 # FastAPI with all endpoints
└── tests/
    ├── test_narvo_api.py
    └── test_narvo_api_v2.py
```

## What's Been Implemented

### Completed Features
1. **Landing Page** - Swiss Grid hero, news marquee, transmissions, pillars, modules
2. **Supabase Auth** - Real email/password signup & login (replaces localStorage)
3. **Protected Routes** - Dashboard, bookmarks, settings require auth
4. **Onboarding** - 3-panel setup: Region, Voice, Interests
5. **Dashboard** - Live news feed with bookmark buttons
6. **Bookmarks/Saved Stories** - CRUD with offline cache (localStorage + backend)
7. **News Detail** - AI narratives, key takeaways, TTS playback, bookmark
8. **Voice Studio** - 5 regional voice profiles
9. **Search Center** - Client-side search with results
10. **Settings** - User profile, display toggles, logout
11. **Audio Player** - Persistent bottom bar with controls
12. **Morning Briefing** - AI-generated daily audio digest

### Backend APIs (15 endpoints)
- `/api/health` - System status
- `/api/news` - RSS aggregation (7 sources)
- `/api/news/{id}` - News detail with AI narrative
- `/api/paraphrase` - AI narrative generation (Gemini)
- `/api/tts/generate` - OpenAI TTS audio
- `/api/voices` - Voice profiles
- `/api/metrics` - Platform stats
- `/api/regions`, `/api/categories`, `/api/trending`
- `/api/briefing/generate` - Morning briefing + audio
- `/api/briefing/latest` - Cached briefing
- `/api/briefing/audio` - Custom script audio
- `/api/bookmarks` (POST) - Add bookmark
- `/api/bookmarks` (GET) - List user bookmarks
- `/api/bookmarks/{id}` (DELETE) - Remove bookmark

## Testing Status (Feb 23, 2026)
- Backend: 100% (15/15)
- Frontend: 100% (all flows)
- Test reports: iteration_5.json, iteration_6.json

## Prioritized Backlog

### P0 - COMPLETE
- [x] Landing, Auth, Onboarding UI
- [x] Refactor App.js into components
- [x] Supabase Auth (email/password)
- [x] Bookmarks with offline cache

### P1 (High Priority)
- [ ] Persist bookmarks to Supabase/MongoDB (currently in-memory)
- [ ] Offline audio caching for bookmarked stories
- [ ] Push notifications for breaking news

### P2 (Medium Priority)
- [ ] Dubawa fact-checking / Truth Tags
- [ ] User preference sync to Supabase
- [ ] Playlist/queue functionality
- [ ] Share stories feature

### P3 (Future)
- [ ] React Native mobile app
- [ ] Admin dashboard for content curation
- [ ] Voice cloning for regional accents
- [ ] WebSocket real-time updates
- [ ] Scheduled 5 AM briefing generation
- [ ] Historical Morning Briefings browser
