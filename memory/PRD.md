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

## Testing
- 17 test iterations, all 100% pass rate
- Test reports: /app/test_reports/iteration_1.json through iteration_17.json

## Prioritized Backlog

### P1
- [ ] Real Dubawa API integration (replace mock fact-checking)
- [ ] Playlist/queue functionality for news stories
- [ ] Dynamic Open Graph Images for sharing

### P2
- [ ] Historical Morning Briefings browser
- [ ] Full backend functionality for Search, Discover, Offline, Saved pages
- [ ] PWA support with service worker for offline

### P3
- [ ] React Native mobile app
- [ ] Voice cloning for regional accents
- [ ] WebSocket real-time updates
- [ ] Scheduled 5 AM briefing generation

### Refactoring
- [ ] Break monolithic server.py into structured routes/models/services
