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
- **i18n**: react-i18next with 6 languages (EN, FR, YO, HA, PCM, SW)

## Architecture
```
/app/frontend/src/
├── App.js
├── i18n/                          # NEW: Internationalization
│   ├── index.js                   # i18n config with 6 languages
│   └── locales/
│       ├── en.json                # English (default)
│       ├── fr.json                # Français
│       ├── yo.json                # Yorùbá
│       ├── ha.json                # Hausa
│       ├── pcm.json               # Pidgin English
│       └── sw.json                # Kiswahili
├── lib/
│   ├── supabase.js
│   └── audioCache.js
├── contexts/
│   ├── AuthContext.js
│   └── AudioContext.js
├── hooks/
│   └── useBookmarks.js
├── components/
│   ├── DashboardLayout.js
│   ├── DashboardHeader.js         # i18n integrated
│   ├── DashboardSidebar.js        # i18n integrated
│   ├── AudioPlayerBar.js
│   ├── AdminLayout.js
│   ├── AdminSidebar.js
│   ├── EmptyState.js
│   ├── HapticAlerts.js
│   ├── TruthTag.js
│   ├── Skeleton.js
│   └── LoadingScreen.js, Clock.js, ProtectedRoute.js
└── pages/
    ├── LandingPage.js
    ├── AuthPage.js
    ├── OnboardingPage.js
    ├── DashboardPage.js
    ├── NewsDetailPage.js           # TruthTag, Share, Autoplay, i18n
    ├── SearchPage.js               # EmptyState integrated
    ├── DiscoverPage.js             # i18n, EmptyState for radio
    ├── OfflinePage.js              # EmptyState integrated
    ├── SavedPage.js                # EmptyState integrated
    ├── SettingsPage.js             # Language selector, i18n
    ├── SystemSettingsPage.js       # Backend persistence, i18n
    ├── AccessibilityPage.js        # Backend persistence, i18n
    ├── AccountPage.js
    ├── VoiceStudioPage.js          # Backend persistence
    ├── MorningBriefingPage.js
    ├── NotFoundPage.js
    ├── ServerErrorPage.js
    └── admin/
        ├── OperationHubPage.js
        ├── CurationConsolePage.js
        ├── VoiceManagementPage.js
        └── ModerationHubPage.js
```

## Completed Features

### Core Pages (Feb 23, 2026)
1. Landing Page, Auth, Onboarding, Dashboard Console, News Deep Dive
2. Voice Studio, Morning Briefing, Settings
3. Search, Discover, Offline, Saved pages
4. Loading skeletons, responsive design, collapsible sidebar

### User Profile & Settings (Feb 23-24, 2026)
5. Account, Voice Studio, System Settings, Accessibility pages
6. Voice Studio backend persistence
7. System Settings backend persistence (Feb 24)
8. Accessibility backend persistence (Feb 24)

### Admin Dashboard (Feb 24, 2026)
9. Operation Hub, Curation Console, Voice Management, Moderation Zone
10. Backend API integration for admin metrics

### System States & Events (Feb 24, 2026)
11. 404/500 error pages
12. EmptyState component (integrated: Search, Saved, Offline, Discover)
13. HapticAlerts global notification system

### Core Feature Enhancements (Feb 24, 2026)
14. TruthTag (fact-check badges) on Dashboard and News Detail
15. Share feature (Web Share API + clipboard fallback)
16. News Detail: TruthTag, Share, Autoplay, metadata sidebar

### Multi-Language UI (i18n) (Feb 24, 2026)
17. 6 languages: English, Français, Yorùbá, Hausa, Pidgin, Kiswahili
18. Language selector on Settings Hub page
19. Translated: sidebar nav, header, settings pages, news detail, discover page
20. Language persisted in localStorage

### Backend APIs (30+ endpoints)
- Core: `/api/health`, `/api/news`, `/api/news/{id}`, `/api/voices`, `/api/metrics`
- AI/TTS: `/api/paraphrase`, `/api/tts/generate`
- Briefing: `/api/briefing/generate`, `/api/briefing/latest`, `/api/briefing/audio`
- Bookmarks: `POST/GET/DELETE /api/bookmarks`
- Preferences: `POST/GET /api/preferences`
- Radio: `/api/radio/stations`
- Admin: `/api/admin/metrics`, `/api/admin/alerts`, `/api/admin/streams`, `/api/admin/voices`, `/api/admin/moderation`, `/api/admin/stats`
- Fact-check (MOCK): `/api/factcheck/{story_id}`, `/api/factcheck/analyze`
- Settings: `GET/POST /api/settings/{user_id}`, `GET/POST /api/settings/{user_id}/voice`

### Design System
- Semantic Label Palette (12 category colors)
- Swiss Grid design with mono UI elements
- Dark theme with forest/primary accent

## Testing
- Backend: 100% pass rate across 16 iterations
- Frontend: 100% pass rate
- Test reports: /app/test_reports/iteration_1.json through iteration_16.json

## Prioritized Backlog

### P1 (High Priority)
- [ ] Category-specific images (vary by news category)
- [ ] Push notifications for breaking news
- [ ] Playlist/queue functionality
- [ ] Dynamic Open Graph Images
- [ ] Real Dubawa API integration (replace mock)

### P2 (Medium Priority)
- [ ] Multi-language UI: extend translations to remaining pages (admin, account, onboarding)
- [ ] Historical Morning Briefings browser
- [ ] Full backend functionality for Search, Discover, Offline, Saved pages

### P3 (Future)
- [ ] React Native mobile app
- [ ] Voice cloning for regional accents
- [ ] WebSocket real-time updates
- [ ] Scheduled 5 AM briefing generation

### Refactoring
- [ ] Break monolithic server.py into structured routes/models/services
