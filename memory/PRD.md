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

### Admin & Curation Dashboard (✅ NEW — Feb 24, 2026)
Desktop-only admin panel with distinct sidebar (red accent, CONTROL_CENTER header)

15. **Operation Hub** (`/admin/operations`) — Real-time monitoring with:
    - Telemetry bar (NODE_LOAD, API_LATENCY, UPTIME, ACTIVE_TRAFFIC)
    - Metrics grid (ACTIVE_STREAMS, AVG_BITRATE, ERROR_RATE, VOL_STORAGE)
    - INGEST_VOLUME 24H chart with 1H/24H/7D toggle
    - SYSTEM_ALERTS panel (3 alert types: warning, success, error)
    - ACTIVE_SIGNAL_MATRIX table (streams with status, region, bitrate, uptime)

16. **Curation Console** (`/admin/curation`) — AI summary review with:
    - Breadcrumb navigation (DASHBOARD > WIRE_FEEDS > source)
    - Side-by-side comparison: RAW_SOURCE (locked) vs NARVO_SYNTHESIS
    - Adjustment panel with TONE_FORMALITY and OUTPUT_LENGTH sliders
    - Keyword retention tags (auto-extracted key terms)
    - BIAS_SCAN_RESULT percentage with safety indicator
    - REGENERATE, REJECT, APPROVE action buttons
    - Signal legend (OMITTED, SYNTHESIZED, REPHRASED)

17. **Voice Management** (`/admin/voices`) — TTS monitoring with:
    - KPI board (ACTIVE_VOICES, GLOBAL_LATENCY, TOTAL_REQS_24H, HEALTH_RANK)
    - Active_Voice_Matrix table (5 voice models with language, latency, clarity score)
    - LIVE/TRAINING status indicators
    - Filter and New_Model action buttons
    - Signal Analyzer Dock with waveform visualization (48KHZ, 24BIT, BUF:128)

18. **Moderation Zone** (`/admin/moderation`) — Fact-checking hub with:
    - Incoming_Matrix grid with LIVE_WATCH badge
    - Grid/List view toggle
    - Moderation cards: DISPUTED (red), VERIFIED (green), UNVERIFIED (gray)
    - Card details: source, timestamp, title, description, tags, AI_CONF%
    - Action buttons: FLAG, IGNORE, PUBLISH_CONFIRMATION, ASSIGN
    - Stats bar (QUEUE_TOTAL, DISPUTED, VERIFIED, PENDING counts)
    - DUBAWA_API connection status

**Note:** Admin pages currently use MOCK DATA. Backend integration pending.

### System States & Events (✅ NEW — Feb 24, 2026)
Global pages for error states, empty content, and notifications.

19. **404 Not Found Page** (`/404` or any invalid route) — Error display with:
    - **[SIGNAL LOST]** large heading with primary color brackets
    - ERROR_CODE: 404_NOT_FOUND with alert icon
    - Grid overlay background with scanline effect
    - Technical metrics (PACKET_LOSS: 100%, LAST_NODE, LATENCY: ∞ MS, live TIMESTAMP_UTC)
    - **[RE-INITIALIZE CONNECTION]** button (navigates to home)
    - Corner crosshair decorations
    - Footer: CONNECTION_STATUS: INTERRUPTED

20. **500 Server Error Page** (`/500`) — Critical error display with:
    - **[SYSTEM HALT]** heading with red brackets
    - ERROR_CODE: 500_INTERNAL_FAILURE with warning icon
    - Red warning pulse background effect
    - Critical metrics (SERVER_STATUS: CRITICAL, CPU_LOAD: 99.9%, MEMORY: OVERFLOW)
    - **[RETRY CONNECTION]** and **[RETURN TO BASE]** buttons
    - Footer: SYSTEM_STATUS: CRITICAL (animated)

21. **EmptyState Component** — Reusable empty content placeholder with:
    - Matrix grid background with 4 slot wireframes
    - Central overlay card with satellite icon
    - Configurable variants: default, search, saved, offline
    - **INITIATE REFRESH** and **SYSTEM DIAGNOSTICS** buttons
    - ERR_CODE display and NARVO_SYS version

22. **HapticAlerts System** — Global notification system with:
    - 6 alert types: success, warning, error, breaking, sync, notification
    - Presets: SYNC_SUCCESS, SYNC_FAILED, BREAKING_NEWS, OFFLINE_SAVED, BOOKMARK_ADDED/REMOVED, VOICE_CHANGED, NETWORK_ERROR, SETTINGS_SAVED
    - Auto-dismiss with progress bar animation (5s default)
    - Haptic vibration patterns for mobile devices
    - Top-right corner positioning with slide-in animation
    - **Notification Test Panel** in Settings page for testing

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
- [x] User Profile Pages (Account, Voice Studio, System Settings, Accessibility) ✅ (Feb 23, 2026)
- [x] Live Radio Integration on Discover Page ✅ (Feb 23, 2026)
- [x] Admin & Curation Dashboard (4 pages) ✅ (Feb 24, 2026)

### P2 (Medium Priority)
- [ ] Dubawa fact-checking / Truth Tags
- [ ] Share stories feature
- [ ] Multi-language UI support
- [x] Mobile responsive refinements ✅ (Feb 23, 2026)
- [x] Collapsible sidebar ✅ (Feb 23, 2026)
- [ ] Connect User Profile pages to backend for saving preferences
- [ ] Historical Morning Briefings browser
- [ ] Backend integration for Admin pages (real-time metrics, curation workflow)

### P3 (Future)
- [ ] React Native mobile app
- [ ] Admin dashboard for content curation
- [ ] Voice cloning for regional accents
- [ ] WebSocket real-time updates
- [ ] Scheduled 5 AM briefing generation
