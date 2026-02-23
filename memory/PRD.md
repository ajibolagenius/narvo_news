# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered news broadcast platform that transforms fragmented information into high-fidelity, audio-enhanced narrative stories. Built for global audiences with a primary focus on African markets.

## Technical Stack
- **Frontend**: React 18, TailwindCSS, React Router, Lucide Icons
- **Backend**: FastAPI (Python)
- **Auth**: Supabase (email/password)
- **Database**: MongoDB (bookmarks, preferences)
- **AI**: Gemini 2.0 Flash (via Emergent LLM Key)
- **TTS**: OpenAI TTS (via Emergent LLM Key)
- **News Sources**: RSS feeds from 7 African sources

## Architecture
```
/app/frontend/src/
├── App.js                          # Clean routing (~47 lines)
├── lib/
│   ├── supabase.js                 # Supabase client
│   └── audioCache.js               # IndexedDB audio caching
├── contexts/
│   ├── AuthContext.js               # Supabase auth provider
│   └── AudioContext.js              # Audio playback + auto-cache
├── hooks/
│   └── useBookmarks.js             # Bookmark hook (localStorage + MongoDB)
├── components/
│   ├── DashboardLayout.js          # Shared wrapper (header + sidebar + player)
│   ├── DashboardHeader.js          # Top nav with search, stats, user avatar
│   ├── DashboardSidebar.js         # Icon sidebar (6 nav items)
│   ├── AudioPlayerBar.js           # News ticker + playback controls
│   ├── LoadingScreen.js, Clock.js, ProtectedRoute.js
└── pages/
    ├── LandingPage.js              # Public landing with hero + news scroller
    ├── AuthPage.js                 # Supabase email/password auth
    ├── OnboardingPage.js           # 3-panel setup (region, voice, interests)
    ├── DashboardPage.js            # Featured card + streams + telemetry sidebar
    ├── NewsDetailPage.js           # Deep dive article with metadata sidebar
    ├── BookmarksPage.js            # Saved stories with offline cache status
    ├── VoiceStudioPage.js, MorningBriefingPage.js
    ├── SearchPage.js, SettingsPage.js
```

## Completed Features (All Tested — Feb 23, 2026)

### Core Pages
1. **Landing Page** — Swiss Grid hero, news marquee, transmissions, pillars, modules
2. **Auth** — Supabase email/password signup/login with guest demo mode
3. **Onboarding** — 3-panel: Region, Voice, Interests (syncs to MongoDB)
4. **Dashboard Console** — Featured transmission card, synthesized news streams, telemetry sidebar
5. **News Deep Dive** — Category pills, headline, lead, hero image, key takeaways, AI narrative, metadata sidebar, related stories
6. **Bookmarks** — Offline cache status, play offline, remove
7. **Voice Studio, Morning Briefing, Search, Settings**

### Shared Components (DashboardLayout)
- **DashboardHeader**: NARVO // DASHBOARD, search bar (CMD+K), signal stats, user avatar
- **DashboardSidebar**: Icon navigation (Primary Stream, Briefing, Bookmarks, Voice, Search, Settings)
- **AudioPlayerBar**: News ticker marquee, play/pause/skip, progress bar, volume

### Backend APIs (18+ endpoints)
- Core: `/api/health`, `/api/news`, `/api/news/{id}`, `/api/voices`, `/api/metrics`
- AI/TTS: `/api/paraphrase`, `/api/tts/generate`
- Briefing: `/api/briefing/generate`, `/api/briefing/latest`, `/api/briefing/audio`
- Bookmarks (MongoDB): `POST/GET/DELETE /api/bookmarks`
- Preferences (MongoDB): `POST/GET /api/preferences`
- Support: `/api/regions`, `/api/categories`, `/api/trending`

## Testing
- Backend: 100% (18/18) — iteration_8.json
- Frontend: 100% (all flows verified)

## Prioritized Backlog

### P1 (High Priority)
- [ ] Category-specific images (vary by news category instead of single stock photo)
- [ ] Loading skeletons for API-dependent components
- [ ] Push notifications for breaking news
- [ ] Playlist/queue functionality

### P2 (Medium Priority)
- [ ] Dubawa fact-checking / Truth Tags
- [ ] Share stories feature
- [ ] Multi-language UI support
- [ ] Mobile responsive refinements

### P3 (Future)
- [ ] React Native mobile app
- [ ] Admin dashboard for content curation
- [ ] Voice cloning for regional accents
- [ ] WebSocket real-time updates
- [ ] Scheduled 5 AM briefing generation
