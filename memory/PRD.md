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
- **Auth**: Supabase (email/password)
- **Database**: MongoDB (bookmarks, preferences), Supabase (auth)
- **AI**: Gemini 2.0 Flash (via Emergent LLM Key)
- **TTS**: OpenAI TTS (via Emergent LLM Key)
- **News Sources**: RSS feeds from 7 African sources

## Architecture
```
/app/frontend/src/
├── App.js                    # Clean routing (~53 lines)
├── lib/
│   ├── supabase.js          # Supabase client
│   └── audioCache.js        # IndexedDB audio caching
├── contexts/
│   ├── AuthContext.js        # Supabase auth provider
│   └── AudioContext.js       # Audio playback + auto-cache
├── hooks/
│   └── useBookmarks.js      # Bookmark hook (localStorage + MongoDB sync)
├── components/
│   ├── LoadingScreen.js, Clock.js, AudioPlayer.js, ProtectedRoute.js
└── pages/
    ├── LandingPage.js, AuthPage.js, OnboardingPage.js
    ├── DashboardPage.js, NewsDetailPage.js, BookmarksPage.js
    ├── VoiceStudioPage.js, MorningBriefingPage.js
    ├── SearchPage.js, SettingsPage.js

/app/backend/
├── server.py                 # FastAPI with MongoDB + Supabase
└── tests/
```

## Completed Features (All Tested)
1. Landing Page (Swiss Grid design)
2. Supabase Auth (email/password signup/login)
3. Protected Routes (redirect to /auth)
4. Onboarding (3-panel: Region, Voice, Interests)
5. Dashboard (live news feed + bookmark buttons)
6. **Bookmarks with MongoDB persistence** (survives restarts)
7. **Offline audio cache via IndexedDB** (auto-caches on play)
8. **User preference sync** (onboarding saves to MongoDB, login restores)
9. News Detail (AI narratives, TTS playback, bookmark)
10. Voice Studio, Search, Settings, Audio Player, Morning Briefing

## Backend APIs (18+ endpoints)
- Core: `/api/health`, `/api/news`, `/api/news/{id}`, `/api/voices`, `/api/metrics`
- AI/TTS: `/api/paraphrase`, `/api/tts/generate`
- Briefing: `/api/briefing/generate`, `/api/briefing/latest`, `/api/briefing/audio`
- Bookmarks (MongoDB): `POST /api/bookmarks`, `GET /api/bookmarks`, `DELETE /api/bookmarks/{id}`
- Preferences (MongoDB): `POST /api/preferences`, `GET /api/preferences`
- Support: `/api/regions`, `/api/categories`, `/api/trending`

## Testing Status (Feb 23, 2026)
- Backend: 100% (18/18) - iteration_7.json
- Frontend: 100% (all flows)
- MongoDB persistence verified
- IndexedDB audio caching verified

## Prioritized Backlog

### P1 (High Priority)
- [ ] Push notifications for breaking news
- [ ] Email confirmation flow UX improvement
- [ ] Playlist/queue functionality

### P2 (Medium Priority)
- [ ] Dubawa fact-checking / Truth Tags
- [ ] Share stories feature
- [ ] Multi-language UI support

### P3 (Future)
- [ ] React Native mobile app
- [ ] Admin dashboard for content curation
- [ ] Voice cloning for regional accents
- [ ] WebSocket real-time updates
- [ ] Scheduled 5 AM briefing generation
- [ ] Historical Morning Briefings browser
