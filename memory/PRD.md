# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered, audio-first news broadcast platform with full PWA support for offline functionality and multi-language translation.

## Tech Stack
- **Frontend**: React, Tailwind CSS, @phosphor-icons/react, framer-motion
- **Backend**: FastAPI (modularized), Python
- **Database**: MongoDB
- **Auth**: Supabase
- **AI/TTS**: Google Gemini & OpenAI TTS (via Emergent LLM Key)
- **Translation**: Gemini AI for 5 African languages
- **Fact-Checking**: Google Fact Check API (with mock fallback)
- **PWA**: Service Worker + IndexedDB + Push Notifications + Media Session API

## Architecture
```
/app/
├── backend/
│   ├── server.py           # Main FastAPI with modular routers
│   ├── routes/
│   │   ├── discover.py     # Podcasts with audio proxy, trending, radio
│   │   ├── offline.py      # Offline article storage
│   │   ├── admin.py        # Admin dashboard metrics & alerts
│   │   ├── user.py         # User preferences, bookmarks, settings
│   │   ├── factcheck.py    # Google Fact Check API + mock fallback
│   │   └── translation.py  # Multi-language translation endpoints
│   └── services/           # Business logic layer
│       ├── news_service.py      # RSS feed fetching, news aggregation
│       ├── podcast_service.py   # Podcast episode management
│       ├── radio_service.py     # Radio Browser API integration
│       ├── admin_service.py     # System metrics, alerts, moderation
│       ├── factcheck_service.py # Google Fact Check API integration
│       ├── translation_service.py # Gemini AI translation (5 languages)
│       ├── narrative_service.py # AI narrative generation
│       ├── offline_service.py   # Offline article management
│       ├── user_service.py      # User data management
│       ├── tts_service.py       # Text-to-speech generation
│       └── briefing_service.py  # Morning briefing generation
├── frontend/
│   ├── public/
│   │   ├── sw.js           # Service Worker with background sync + push
│   │   ├── manifest.json   # PWA manifest
│   │   └── index.html      # SW registration
│   └── src/
│       ├── contexts/
│       │   ├── AudioContext.js       # Media Session API for background audio
│       │   └── DownloadQueueContext.js  # Global download state
│       ├── components/
│       │   └── DownloadQueueIndicator.js # Floating download UI
│       ├── lib/
│       │   ├── audioCache.js       # IndexedDB blob storage
│       │   └── notificationService.js  # Push notification service
│       └── pages/
│           ├── DiscoverPage.js     # "Download All" batch feature
│           ├── OfflinePage.js      # Cached content management
│           └── SystemSettingsPage.js # Language selection + notifications
└── memory/
    └── PRD.md
```

## All Features Complete (Feb 24, 2025)

### Core Features
- ✅ Dashboard with news feed, images, animations
- ✅ Audio player with queue management
- ✅ On-demand TTS generation
- ✅ Search, Saved, Morning Briefing pages
- ✅ Discover page with podcasts & radio
- ✅ Offline page with cached content

### P1 Features (Complete)
- ✅ **Podcast audio download** - Backend proxy + blob storage
- ✅ **Offline playback** - From IndexedDB cache
- ✅ **Dashboard scrolling** - Fixed flex container layout

### P2 Features (Complete)
- ✅ **Service Worker PWA** - Network-first caching
- ✅ **Backend modularization** - 6 route modules, 11 services

### P3 Features (Complete)
- ✅ **Background sync** - IndexedDB queue + sync event
- ✅ **Push notifications** - Breaking news alerts toggle in Settings
- ✅ **Download all podcasts** - Batch download with progress
- ✅ **Global Download Queue Indicator** - Floating UI showing download progress across pages

### P4 Features - NEW (Feb 24, 2025)
- ✅ **Background Audio Playback** - Media Session API for lock screen controls
- ✅ **Multi-Language Translation** - 5 languages (English, Pidgin, Yoruba, Hausa, Igbo)
- ✅ **Google Fact Check API** - Real API with mock fallback
- ✅ **Language Settings UI** - System Settings page with language selection

## Supported Languages
| Code | Name | Native Name | Voice |
|------|------|-------------|-------|
| en | English | English | nova |
| pcm | Nigerian Pidgin | Naija | onyx |
| yo | Yoruba | Èdè Yorùbá | echo |
| ha | Hausa | Harshen Hausa | alloy |
| ig | Igbo | Asụsụ Igbo | shimmer |

## Key Components

### Download Queue Context & Indicator (Feb 24, 2025)
```javascript
// DownloadQueueContext.js - Manages global download state
const { addToQueue, addSingleToQueue, queue, isProcessing, clearAll } = useDownloadQueue();

// DownloadQueueIndicator.js - Floating UI at bottom-right
// Shows: DOWNLOADING... / DOWNLOADS_COMPLETE / {n} FAILED
// Progress: completed/total count, percentage ring, pending count
// Expandable: Shows individual items with progress bars
// Actions: CLEAR_COMPLETED, CLEAR_ALL
```

### Service Worker (sw.js)
```javascript
// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(processOfflineQueue());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
```

### Notification Service
```javascript
export async function subscribeToPush() {
  const subscription = await registration.pushManager.subscribe({...});
  return subscription;
}

export function queueOfflineAction(actionType, payload) {
  navigator.serviceWorker.controller.postMessage({
    type: 'QUEUE_OFFLINE_ACTION',
    action: { actionType, payload }
  });
}
```

### Download All Podcasts
```javascript
// Now uses DownloadQueueContext for global state management
const handleDownloadAll = async () => {
  const items = podcastsToDownload.map(podcast => ({
    id: podcast.id,
    audioUrl: `${API_URL}/api/podcasts/${podcast.id}/audio`,
    title: podcast.title,
    source: podcast.episode,
    duration: podcast.duration,
    type: 'podcast'
  }));
  addToQueue(items); // Queue handles sequential processing
};
```

## API Endpoints

### Podcast Audio Proxy
- `GET /api/podcasts/{id}/audio` → Streams audio (CORS-safe)

### Offline Storage
- `POST /api/offline/save` → Save article
- `GET /api/offline/articles` → List saved
- `DELETE /api/offline/articles/{id}` → Remove

## Test Results

### Podcast Download ✓
```
IndexedDB: [{id: 'ep089', hasBlob: true, size: 10222911}]
Playing cached audio: "Tech Horizons: Quantum Synthesis" 00:01 / 07:05
```

### Service Worker ✓
```
Service Worker: {active: 'activated'}
```

### Push Notifications ✓
- Toggle visible in System Settings
- Shows "PERMISSION_BLOCKED_IN_BROWSER" when denied
- BellRinging/BellSlash icons based on state

## Bug Fixes Applied
1. Dashboard scrolling - Fragment → flex container
2. Breaking news text - white for light mode
3. CORS audio - Backend proxy
4. pauseTrack error - Changed to togglePlay

## Test Reports
- `/app/test_reports/iteration_26.json` - Global Download Queue Indicator (7/7 tests passed)
