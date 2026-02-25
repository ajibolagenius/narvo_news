# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered, audio-first news broadcast platform with full PWA support for offline functionality and multi-language translation. Built for global audiences with a primary focus on African markets.

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Phosphor Icons, Framer Motion, Tone.js, Howler.js
- **Backend**: FastAPI (modularized), Python 3.11
- **Database**: MongoDB (via MONGO_URL)
- **Auth**: Supabase (Email/Password + Google OAuth)
- **AI/TTS**: Google Gemini 2.0 Flash & OpenAI TTS (via Emergent LLM Key)
- **Translation**: Gemini AI for 5 African languages + English
- **Fact-Checking**: Google Fact Check API (with mock fallback)
- **News Sources**: 39 RSS feeds + Mediastack API + NewsData.io API
- **PWA**: Service Worker + IndexedDB + Push Notifications + Media Session API

## Architecture
```
/app/
├── backend/
│   ├── server.py                    # Main FastAPI app, routes, AI generation, sanitizer
│   ├── routes/
│   │   ├── discover.py              # Podcasts, trending, radio
│   │   ├── offline.py               # Offline article storage
│   │   ├── admin.py                 # Admin dashboard metrics & alerts
│   │   ├── user.py                  # User preferences, bookmarks, settings
│   │   ├── factcheck.py             # Google Fact Check API + mock fallback
│   │   └── translation.py           # Multi-language translation endpoints
│   ├── services/
│   │   ├── news_service.py          # RSS feed fetching (39 sources)
│   │   ├── podcast_service.py       # Podcast episodes + search
│   │   ├── radio_service.py         # Radio Browser API
│   │   ├── admin_service.py         # System metrics, alerts
│   │   ├── factcheck_service.py     # Google Fact Check integration
│   │   ├── translation_service.py   # Gemini AI translation (5 languages) + sanitizer
│   │   ├── narrative_service.py     # AI narrative generation
│   │   ├── offline_service.py       # Offline article management
│   │   ├── user_service.py          # User data management
│   │   ├── tts_service.py           # OpenAI text-to-speech
│   │   ├── briefing_service.py      # Morning briefing generation
│   │   └── aggregator_service.py    # Mediastack + NewsData.io + cache + dedup
│   ├── tests/                       # Backend test suite (pytest)
│   ├── requirements.txt
│   └── .env                         # MONGO_URL, DB_NAME, API keys
├── frontend/
│   ├── public/
│   │   ├── sw.js                    # Service Worker (background sync + push)
│   │   ├── manifest.json            # PWA manifest
│   │   └── index.html               # SW registration
│   └── src/
│       ├── contexts/
│       │   ├── AuthContext.js        # Supabase auth (email + Google OAuth)
│       │   ├── AudioContext.js       # Media Session API, playback controls
│       │   ├── DownloadQueueContext.js # Global download state
│       │   ├── ContentSourcesContext.js # Feed source management
│       │   ├── BreakingNewsContext.js   # Breaking news alerts
│       │   └── LenisProvider.js     # Smooth scroll (disabled, passthrough)
│       ├── components/
│       │   ├── TourGuideModal.js    # 5-step tour (event-driven, scoped to dashboard)
│       │   ├── DashboardSidebar.js  # Sidebar + mobile bottom nav
│       │   ├── DashboardLayout.js   # Main layout wrapper (h-screen)
│       │   ├── DownloadQueueIndicator.js # Floating download UI
│       │   ├── Clock.js             # Local time display (HH:MM:SS)
│       │   ├── Skeleton.js          # Loading skeleton components
│       │   ├── BreakingNews.js      # Breaking news banner
│       │   └── AdminLayout.js       # Admin area layout
│       ├── lib/
│       │   ├── supabase.js          # Supabase client init
│       │   ├── audioCache.js        # IndexedDB blob storage
│       │   ├── cinematicAudio.js    # Tone.js broadcast SFX (briefing only)
│       │   └── notificationService.js # Push notification service
│       ├── hooks/
│       │   └── useBookmarks.js      # Bookmark management hook
│       ├── pages/
│       │   ├── LandingPage.js       # Public landing page
│       │   ├── AuthPage.js          # Login/Register + Google OAuth
│       │   ├── OnboardingPage.js    # New user preferences
│       │   ├── DashboardPage.js     # Main feed (filter/sort, dedup, prefs)
│       │   ├── SearchPage.js        # Unified search (RSS + aggregators + podcasts)
│       │   ├── DiscoverPage.js      # Podcasts, radio, trending
│       │   ├── MorningBriefingPage.js # Briefing + transcript follow-along
│       │   ├── SavedPage.js / BookmarksPage.js # Bookmarked articles
│       │   ├── OfflinePage.js       # Cached content management
│       │   ├── SettingsPage.js      # Interface language, theme, tour replay
│       │   ├── SystemSettingsPage.js # Broadcast language, voice, aggregators
│       │   ├── NewsDetailPage.js    # Article detail + TTS + fact-check
│       │   ├── VoiceStudioPage.js   # TTS voice preview
│       │   ├── ToolsPage.js         # Technology credits page
│       │   ├── AccountPage.js       # User account info
│       │   ├── AccessibilityPage.js # Accessibility settings
│       │   ├── ForgotPasswordPage.js # Password recovery
│       │   ├── NotFoundPage.js      # 404 page
│       │   ├── ServerErrorPage.js   # 500 page
│       │   └── admin/               # Admin pages
│       ├── email-templates/
│       │   └── SETUP_GUIDE.md       # Narvo-branded Supabase email templates
│       ├── i18n.js                  # i18next configuration
│       ├── App.js                   # Route definitions + providers
│       └── index.css                # Global styles + CSS variables
├── memory/
│   ├── PRD.md                       # This file
│   ├── CHANGELOG.md                 # Implementation history
│   └── ROADMAP.md                   # Prioritized backlog
└── test_reports/                    # Testing agent reports (iteration_34-39)
```

## Supported Languages

### Interface Languages (i18n — /settings page)
| Code | Label | Region |
|------|-------|--------|
| en | English | GLOBAL |
| fr | Francais | WEST_AFRICA |
| yo | Yoruba | NIGERIA |
| ha | Hausa | NIGERIA |
| ig | Igbo | NIGERIA |
| pcm | Pidgin | WEST_AFRICA |
| sw | Kiswahili | EAST_AFRICA |

### Broadcast Languages (TTS — /system page)
| Code | Name | Native Name | Voice |
|------|------|-------------|-------|
| en | English | English | nova |
| pcm | Naija | Naija Tok | onyx |
| yo | Yoruba | Ede Yoruba | echo |
| ha | Hausa | Harshen Hausa | alloy |
| ig | Igbo | Asusu Igbo | shimmer |

## Key API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/news` | GET | RSS + optional aggregator news (params: include_aggregators, aggregator_sources) |
| `/api/search` | GET | Unified search (RSS + aggregators + podcasts) with source_type filter & dedup |
| `/api/aggregators/status` | GET | Cache status with TTL |
| `/api/aggregators/fetch` | GET | Combined Mediastack + NewsData.io fetch |
| `/api/briefing/latest` | GET | Latest morning briefing |
| `/api/briefing/generate` | GET | Generate new briefing (params: voice_id, force_regenerate) |
| `/api/briefing/history` | GET | Historical briefings |
| `/api/translate/text` | POST | Translate text to target language |
| `/api/paraphrase` | POST | Generate broadcast narrative from text |
| `/api/tts/generate` | POST | Text-to-speech generation |
| `/api/voices` | GET | Available TTS voices |
| `/api/settings/{user_id}` | GET/POST | User settings (aggregator prefs, language, etc.) |
| `/api/health` | GET | Backend health check |

## Authentication
- **Email/Password**: Supabase native auth (signUp, signIn)
- **Google OAuth**: Supabase OAuth provider (signInWithGoogle) — redirects to production URL
- **Guest Mode**: localStorage-based (`narvo_guest`) for instant access without account
- **Email Templates**: Narvo-branded (confirmation, password reset, magic link, invite) — see `/app/frontend/src/email-templates/SETUP_GUIDE.md`

## Mocked / Fallback APIs
- **Google Fact Check API** — Uses mock data when `GOOGLE_FACT_CHECK_API_KEY` not set in `.env`

## Backlog
- **P1:** Backend unit/integration tests for TTS and podcast services
- **P2:** Native mobile application based on performance guidelines
- **P2:** Allow users to provide their own API keys for external services
