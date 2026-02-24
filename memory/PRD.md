# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered, audio-first news broadcast platform with PWA support for offline functionality.

## Tech Stack
- **Frontend**: React, Tailwind CSS, @phosphor-icons/react, framer-motion
- **Backend**: FastAPI (modularized), Python
- **Database**: MongoDB
- **Auth**: Supabase
- **AI/TTS**: Google Gemini & OpenAI TTS (via Emergent LLM Key)
- **PWA**: Service Worker + IndexedDB for offline support

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
│   │   ├── sw.js           # Service Worker for PWA
│   │   ├── manifest.json   # PWA manifest
│   │   └── index.html      # SW registration
│   └── src/
│       ├── lib/
│       │   └── audioCache.js  # IndexedDB blob storage for offline audio
│       └── pages/
│           ├── DiscoverPage.js  # Podcast download with progress
│           └── OfflinePage.js   # Cached content management
└── memory/
    └── PRD.md
```

## Key Features Implemented

### Podcast Audio Caching (P1 - COMPLETE ✓)
- **Backend proxy**: `/api/podcasts/{id}/audio` streams audio to bypass CORS
- **IndexedDB storage**: Audio blobs stored with metadata
- **Download UI**: Progress indicator, OFFLINE badge on cached podcasts
- **Offline playback**: Cached audio plays from blob URL

### Service Worker PWA (P2 - COMPLETE ✓)
- **sw.js**: Network-first caching strategy for static assets
- **manifest.json**: PWA metadata with theme colors
- **Registration**: Auto-registers on page load
- **Offline support**: Falls back to cached content when offline

### Audio Cache Schema (v2)
```javascript
{
  story_id: string,
  audioBlob: Blob,        // Actual audio file
  title: string,
  source: string,
  duration: string,
  type: 'podcast' | 'audio',
  size: number,           // File size in bytes
  cached_at: ISO string
}
```

### Key API Endpoints
- `GET /api/podcasts` → List with audio_url
- `GET /api/podcasts/{id}/audio` → **Proxy stream** for audio files
- `POST /api/offline/save` → Save article
- `GET /api/offline/stats` → Cache statistics

## Test Results (Feb 24, 2025)

### Podcast Download E2E ✓
```
✓ Download complete - OFFLINE badge visible
✓ Audio filter shows: AUDIO (1)
✓ IndexedDB: [{id: 'ep089', title: 'Tech Horizons...', hasBlob: true, size: 10222911}]
✓ Playing cached audio!
```

### PWA Service Worker ✓
```
✓ Service Worker status: {supported: true, registrations: [{active: 'activated'}]}
✓ Manifest link: .../manifest.json
```

## Remaining Tasks

### P3 (Future Enhancements)
- [ ] Background sync for offline actions
- [ ] Push notifications for breaking news
- [ ] Download all podcasts in batch
- [ ] Real Dubawa fact-checking API integration

## Bug Fixes Applied This Session
1. **Dashboard scrolling** - Fixed Fragment wrapper → flex container
2. **Breaking news text** - White color for light mode
3. **CORS audio download** - Backend proxy for external audio URLs
