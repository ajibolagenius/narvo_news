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
├── App.js                          # Clean routing with 10+ routes
├── lib/
│   ├── supabase.js                 # Supabase client
│   └── audioCache.js               # IndexedDB audio caching
├── contexts/
│   ├── AuthContext.js              # Supabase auth provider
│   └── AudioContext.js             # Audio playback + auto-cache
├── hooks/
│   └── useBookmarks.js             # Bookmark hook (localStorage + MongoDB)
├── components/
│   ├── DashboardLayout.js          # Shared wrapper (header + sidebar + player)
│   ├── DashboardHeader.js          # Top nav with search, sidebar toggle
│   ├── DashboardSidebar.js         # Collapsible sidebar (6 nav items) + mobile bottom nav
│   ├── AudioPlayerBar.js           # News ticker + playback controls
│   ├── Skeleton.js                 # Loading skeleton components
│   ├── LoadingScreen.js, Clock.js, ProtectedRoute.js
└── pages/
    ├── LandingPage.js              # Public landing with hero + news scroller
    ├── AuthPage.js                 # Supabase email/password auth
    ├── OnboardingPage.js           # 3-panel setup (region, voice, interests)
    ├── DashboardPage.js            # Featured card + streams + telemetry sidebar
    ├── NewsDetailPage.js           # Deep dive article with metadata sidebar
    ├── SearchPage.js               # Global Archive Search with semantic labels ✅ NEW
    ├── DiscoverPage.js             # Podcasts + Radio Garden ✅ NEW
    ├── OfflinePage.js              # Cached files management ✅ NEW
    ├── SavedPage.js                # Saved stories archive ✅ NEW
    ├── VoiceStudioPage.js, MorningBriefingPage.js, SettingsPage.js
```

## Completed Features (All Tested — Feb 23, 2026)

### Core Pages
1. **Landing Page** — Swiss Grid hero, news marquee, transmissions, pillars, modules
2. **Auth** — Supabase email/password signup/login with guest demo mode
3. **Onboarding** — 3-panel: Region, Voice, Interests (syncs to MongoDB)
4. **Dashboard Console** — Featured transmission card, synthesized news streams, telemetry sidebar
5. **News Deep Dive** — Category pills, headline, lead, hero image, key takeaways, AI narrative, metadata sidebar, related stories
6. **Voice Studio, Morning Briefing, Settings**

### Library & Navigation Pages (✅ NEW — Feb 23, 2026)
7. **Search Page** — Global Archive Search with:
   - Hero search section (CMD+K hint, voice input protocol)
   - Popular tags (#CURRENCY_SHIFT, #LAGOS_TRANSIT, #RENEWABLE_GRID)
   - Results grid with Semantic Label Palette (12 category colors)
   - Sort by LATEST/RELEVANCE toggle
   - Bookmark functionality on results

8. **Discover Page** — Featured content hub with:
   - Hero section (LIVE_BROADCAST badge, featured news)
   - Deep Dive Podcasts grid (4 episodes with play buttons)
   - LATEST/POPULAR toggle
   - Radio Garden panel (global map, frequency display, live stations)
   - Newsletter subscription input
   - Signal analysis & system log footer

9. **Offline Page** — Cached files management with:
   - Storage capacity bar (X KB / 50.0 GB)
   - Usage percentage display
   - Filter toolbar (ALL, AUDIO, TEXT)
   - File table (SIG, FILE_IDENTIFIER, DURATION, SIZE, ACTION)
   - Play/Delete actions on cached items
   - Pagination controls

10. **Saved Page** — Story archive with:
    - SELECT_ALL, ARCHIVE_X, DELETE_SIG bulk actions
    - Story cards with hover checkboxes
    - Time-ago labels (SAVED_2H_AGO, etc.)
    - Empty state with GO_TO_FEED button

### User Profile & Preferences Pages (✅ NEW — Feb 23, 2026)
11. **Account Page** — Subscription and metrics hub with:
    - Premium Broadcast subscription panel
    - System alerts (NEW_FEATURE, MAINTENANCE_DOWNTIME)
    - Broadcast hours metric (142.5h with +12.4% growth)
    - Signals processed metric (342 with bar visualization)
    - Primary region status (Lagos, NG with lat/lon)
    - User info footer with session details

12. **Voice Studio Page** — Voice model selection with:
    - Broadcast preview panel with waveform visualization
    - Play/pause controls and time display
    - Voice Matrix with 5 models (NOVA, ONYX, ECHO, ALLOY, SHIMMER)
    - Region filter (AFRICA) and Dialect filter (ALL/PIDGIN)
    - Selected voice info panel with APPLY_MODEL button

13. **System Settings Page** — System configuration with:
    - Display Entity: High Contrast Mode toggle, Interface Scaling dropdown
    - Notification Syntax: Haptic Sync toggle, Alert Volume slider (0-100%)
    - Data Throughput: Data Limit slider (0-5TB), Bandwidth Priority (STREAMING/INGEST/VOICE)
    - RESET_DEFAULTS and SAVE_SYSTEM_CONFIG buttons

14. **Accessibility Page** — Accessibility preferences with:
    - Display Density (Compact/Standard/Expanded) with visual preview
    - Font Scaling slider (75%-150%) with live OUTPUT_PREVIEW
    - Gestural Control (Lateral Swipe, Pinch Zoom toggles)
    - Voice Commands section with LISTENING_V2 indicator
    - CALIBRATE_NEW_COMMAND button

### Live Radio Integration (✅ NEW — Feb 23, 2026)
- **Radio Garden** panel on Discover Page with:
  - African country filters (NG, GH, KE, ZA, EG, MA) with flag icons
  - Live radio station list (10 stations per country)
  - NOW_PLAYING indicator with station name and bitrate
  - Volume control and LIVE indicator
  - Backend: `/api/radio/stations?country={code}&limit={n}` using Radio Browser API

### Shared Components (DashboardLayout)
- **DashboardHeader**: NARVO // DASHBOARD, search bar (CMD+K), signal stats, user avatar, **sidebar toggle button**
- **DashboardSidebar**: **Collapsible** 6-item navigation (Feed, Briefing, Saved, Search, Discover, Offline) + **mobile bottom nav**
- **AudioPlayerBar**: News ticker marquee, play/pause/skip, progress bar, volume

### Design System
- **Semantic Label Palette** (12 category colors for metadata tags):
  - Finance (#EBD5AB), Environ (#93C5FD), Tech (#D8B4FE), Urgent (#FCA5A5)
  - Politics (#FDBA74), Science (#5EEAD4), Culture (#F472B6), Sports (#FB923C)
  - Health (#4ADE80), Security (#94A3B8), Opinion (#A8A29E), Legal (#818CF8)

### UI/UX Enhancements (Completed Feb 23, 2026)
- **Loading Skeletons**: FeaturedSkeleton, StreamCardSkeleton, ArticleSkeleton, ListSkeleton for API-loading states
- **Responsive Design**: Mobile-first layouts at 375px with proper font scaling (text-[10px] to text-xs)
- **Collapsible Sidebar**: Toggle between 208px (expanded with labels) and 64px (collapsed icons only), state persisted in localStorage
- **Mobile Bottom Navigation**: 6-item bottom nav bar (Feed, Briefing, Saved, Voices, Search, More)
- **Desktop Elements Hidden on Mobile**: Dashboard sidebar, telemetry sidebar, and detail sidebar properly hidden

### Backend APIs (20+ endpoints)
- Core: `/api/health`, `/api/news`, `/api/news/{id}`, `/api/voices`, `/api/metrics`
- AI/TTS: `/api/paraphrase`, `/api/tts/generate`
- Briefing: `/api/briefing/generate`, `/api/briefing/latest`, `/api/briefing/audio`
- Bookmarks (MongoDB): `POST/GET/DELETE /api/bookmarks`
- Preferences (MongoDB): `POST/GET /api/preferences`
- Support: `/api/regions`, `/api/categories`, `/api/trending`
- Radio (NEW): `/api/radio/stations?country={code}&limit={n}` (Radio Browser API)

## Testing
- Backend: 100% (9/9 new tests) — iteration_11.json
- Frontend: 100% (all flows verified) — iteration_9.json (UI/UX), iteration_10.json (Library pages), iteration_11.json (User Profile & Radio)

## Prioritized Backlog

### P1 (High Priority)
- [ ] Category-specific images (vary by news category instead of single stock photo)
- [x] Loading skeletons for API-dependent components ✅ (Feb 23, 2026)
- [ ] Push notifications for breaking news
- [ ] Playlist/queue functionality

### P2 (Medium Priority)
- [ ] Dubawa fact-checking / Truth Tags
- [ ] Share stories feature
- [ ] Multi-language UI support
- [x] Mobile responsive refinements ✅ (Feb 23, 2026)
- [x] Collapsible sidebar ✅ (Feb 23, 2026)

### P3 (Future)
- [ ] React Native mobile app
- [ ] Admin dashboard for content curation
- [ ] Voice cloning for regional accents
- [ ] WebSocket real-time updates
- [ ] Scheduled 5 AM briefing generation
