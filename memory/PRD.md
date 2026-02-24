# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered, audio-first news broadcast platform with full PWA support for offline functionality.

## Tech Stack
- **Frontend**: React, Tailwind CSS, @phosphor-icons/react, framer-motion
- **Backend**: FastAPI (modularized), Python
- **Database**: MongoDB
- **Auth**: Supabase
- **AI/TTS**: Google Gemini & OpenAI TTS (via Emergent LLM Key)
- **PWA**: Service Worker + IndexedDB + Push Notifications

## Architecture
```
/app/
├── backend/
│   ├── server.py           # Main FastAPI with modular routers
│   └── routes/
│       ├── discover.py     # Podcasts with audio proxy, trending, radio
│       ├── offline.py      # Offline article storage
│       ├── admin.py        # Admin dashboard
│       └── user.py         # User preferences
├── frontend/
│   ├── public/
│   │   ├── sw.js           # Service Worker with background sync + push
│   │   ├── manifest.json   # PWA manifest
│   │   └── index.html      # SW registration
│   └── src/
│       ├── lib/
│       │   ├── audioCache.js       # IndexedDB blob storage
│       │   └── notificationService.js  # Push notification service
│       └── pages/
│           ├── DiscoverPage.js     # "Download All" batch feature
│           ├── OfflinePage.js      # Cached content management
│           └── SystemSettingsPage.js # Push notification toggle
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
- ✅ **Backend modularization** - 4 route modules

### P3 Features (Complete)
- ✅ **Background sync** - IndexedDB queue + sync event
- ✅ **Push notifications** - Breaking news alerts toggle in Settings
- ✅ **Download all podcasts** - Batch download with progress

## Key Components

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
const handleDownloadAll = async () => {
  for (const podcast of podcastsToDownload) {
    await downloadAndCacheAudio(podcast.id, proxyUrl, metadata, onProgress);
    setDownloadAllProgress(overallProgress);
  }
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
