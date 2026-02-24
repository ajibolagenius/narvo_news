# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered news broadcast platform that transforms fragmented information into high-fidelity, audio-enhanced narrative stories. Built for global audiences with a primary focus on African markets.

## Technical Stack
- **Frontend**: React 18, TailwindCSS, React Router, Lucide Icons, react-i18next
- **Backend**: FastAPI (Python)
- **Auth**: Supabase (email/password)
- **Database**: MongoDB (bookmarks, preferences, settings)
- **AI**: Gemini 2.0 Flash (via Emergent LLM Key)
- **TTS**: OpenAI TTS (via Emergent LLM Key)
- **News Sources**: RSS feeds from 7 African sources
- **i18n**: react-i18next with 7 languages (EN, FR, YO, HA, IG, PCM, SW)

## Architecture
```
/app/frontend/src/
├── App.js
├── i18n/
│   ├── index.js                   # i18n config with 7 languages
│   └── locales/
│       ├── en.json, fr.json, yo.json, ha.json, ig.json, pcm.json, sw.json
├── lib/
│   ├── supabase.js
│   ├── audioCache.js
│   └── categoryImages.js          # NEW: Category-to-image mapping
├── contexts/
│   ├── AuthContext.js
│   └── AudioContext.js
├── hooks/
│   └── useBookmarks.js
├── components/
│   ├── DashboardLayout.js         # BreakingNewsBanner integrated
│   ├── DashboardHeader.js         # i18n
│   ├── DashboardSidebar.js        # i18n
│   ├── AudioPlayerBar.js
│   ├── AdminLayout.js
│   ├── AdminSidebar.js            # i18n
│   ├── BreakingNews.js            # NEW: Provider, Banner, NotificationToggle
│   ├── EmptyState.js
│   ├── HapticAlerts.js
│   ├── TruthTag.js
│   └── Skeleton.js, LoadingScreen.js, Clock.js, ProtectedRoute.js
└── pages/
    ├── LandingPage.js             # i18n
    ├── AuthPage.js
    ├── OnboardingPage.js          # i18n
    ├── DashboardPage.js           # i18n + category images
    ├── NewsDetailPage.js          # i18n + TruthTag + Share + Autoplay
    ├── SearchPage.js              # EmptyState
    ├── DiscoverPage.js            # i18n + EmptyState
    ├── OfflinePage.js             # EmptyState
    ├── SavedPage.js               # EmptyState
    ├── SettingsPage.js            # i18n + language selector + NotificationToggle
    ├── SystemSettingsPage.js      # i18n + backend persistence
    ├── AccessibilityPage.js       # i18n + backend persistence
    ├── AccountPage.js             # i18n
    ├── VoiceStudioPage.js         # backend persistence
    ├── MorningBriefingPage.js
    ├── NotFoundPage.js, ServerErrorPage.js
    └── admin/ (4 pages, all i18n)
```

## Completed Features

### Phase 1: Core Pages (Feb 23, 2026)
- Landing, Auth, Onboarding, Dashboard, News Detail, Voice Studio, Morning Briefing, Settings
- Search, Discover, Offline, Saved pages
- Loading skeletons, responsive design, collapsible sidebar

### Phase 2: User Profile & Settings (Feb 23-24)
- Account, Voice Studio, System Settings, Accessibility pages
- Backend persistence for Voice Studio, System Settings, Accessibility

### Phase 3: Admin Dashboard (Feb 24)
- Operation Hub, Curation Console, Voice Management, Moderation Zone
- Backend API integration for admin metrics

### Phase 4: System States & Events (Feb 24)
- 404/500 error pages, EmptyState component, HapticAlerts system
- TruthTag (fact-check badges), Share feature

### Phase 5: Multi-Language & Category Media (Feb 24)
- 7 languages: English, Français, Yorùbá, Hausa, Igbo, Pidgin, Kiswahili
- i18n applied to ALL pages (landing, onboarding, account, dashboard, news detail, discover, settings, admin)
- Language selector on Settings Hub with region tags
- Category-specific images for news cards (politics, tech, sports, finance, culture, health, environment)
- Breaking news banner (in-app red alert bar with dismiss/READ_NOW)
- Browser push notification support via Notification API
- NotificationToggle in Settings page

### Backend APIs (35+ endpoints)
- Core: /api/health, /api/news, /api/news/breaking, /api/news/{id}, /api/voices, /api/metrics
- AI/TTS: /api/paraphrase, /api/tts/generate
- Briefing: /api/briefing/generate, /api/briefing/latest, /api/briefing/audio
- Bookmarks: POST/GET/DELETE /api/bookmarks
- Preferences: POST/GET /api/preferences
- Radio: /api/radio/stations
- Admin: /api/admin/metrics, /api/admin/alerts, /api/admin/streams, /api/admin/voices, /api/admin/moderation, /api/admin/stats
- Fact-check (MOCK): /api/factcheck/{story_id}, /api/factcheck/analyze
- Settings: GET/POST /api/settings/{user_id}, GET/POST /api/settings/{user_id}/voice

### Phase 6: Enhanced UX & Social Features (Feb 24)
- Playlist/Queue functionality with full controls (add, remove, clear, play from queue)
- Dynamic Open Graph images for social sharing (/api/og/{news_id})
- "Load More" pagination for news streams
- Real breaking news banner (replaced static ticker on landing page)
- Backend metrics integration on landing page
- Reorganized dashboard sidebar navigation
- Audio player bar cleaned up (removed news scroll, added queue controls)

### Phase 7: Full Backend & Redesigns (Feb 24)
- Fixed audio player with TTS on-demand generation (stories without pre-existing audio now work)
- Completely redesigned Morning Briefing page with military broadcast aesthetic
- Historical briefings browser with date-based archive sidebar
- Full backend for Search page: search RSS content, category filtering, trending topics
- Full backend for Saved page: MongoDB bookmark persistence, filter/sort functionality
- Dynamic OG images on news detail page with proper share URL (uses window.location.origin)
- Removed footer from Discover page
- Created modular backend structure: /app/backend/routes/, /app/backend/models/, /app/backend/services/
- Refactored AudioContext.js for cleaner TTS integration

### Phase 8: Bug Fixes & Reversions (Feb 24)
- Reverted Search page to original "GLOBAL ARCHIVE SEARCH" design with VOICE_INPUT_PROTOCOL button
- Reverted Saved page to original "SAVED STORIES" design with SELECT_ALL/ARCHIVE_X/DELETE_SIG controls
- Restored Briefing page to broadcast theme with improved visual hierarchy + ARCHIVE_LOG historical sidebar
- Fixed OG images/share URLs: New /api/share/{news_id} endpoint serves proper meta tags for social media crawlers
- Fixed audio player volume icon: Now clickable with mute toggle and volume slider

## Testing
- 20 test iterations, all 100% pass rate
- Test reports: /app/test_reports/iteration_1.json through iteration_20.json

## Prioritized Backlog

### P0 - Remaining
- [ ] Complete Phosphor icon replacement on remaining pages (DashboardPage, LandingPage, NewsDetailPage, etc.)
- [ ] Apply CSS variable theming to remaining components for full light mode support
- [ ] Implement ResponsiveTabView on AccessibilityPage
- [ ] Fetch actual news images from RSS (image_url field)

### P1
- [ ] Real Dubawa API integration (replace mock fact-checking)

### P2
- [ ] PWA support with service worker for offline
- [ ] Full backend for Offline page (IndexedDB sync)

### P3
- [ ] React Native mobile app
- [ ] Voice cloning for regional accents
- [ ] WebSocket real-time updates

### Completed This Session (Phase 9 Continued)
- [x] Fixed mouse scrolling (disabled Lenis which was breaking nested scrolling)
- [x] Fixed audio behavior: new tracks auto-queue when something is playing (instead of interrupting)
- [x] Queue reordering function added (drag-and-drop ready, protects currently playing track)
- [x] Removed loading delay between pages (instant navigation)
- [x] Removed ⌘K shortcut indicator from search
- [x] Sidebar icons left-aligned with uniform styling
- [x] Simplified sidebar (removed expandable sub-nav)
- [x] Added forcePlayTrack function for explicit play requests
- [x] Auto-play queue with smooth fade transitions

### Earlier Completed (Phase 9)
- [x] Light mode CSS variables defined
- [x] ThemeContext with localStorage persistence
- [x] ThemeToggle component with animated icons
- [x] Theme toggle in sidebar and settings page
- [x] Phosphor icons for DashboardSidebar, DashboardHeader, AudioPlayerBar, SettingsPage
- [x] Centered full-width search in header
- [x] Framer-motion and GSAP installed
- [x] Lazy loading for all pages

### Completed Refactoring
- [x] Created modular backend structure (routes/, models/, services/) - ready for migration
- [x] Refactored AudioContext.js with TTS on-demand generation
- [x] Volume control with mute toggle in AudioContext
