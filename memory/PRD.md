# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered, audio-first news broadcast platform designed for global audiences, with a primary focus on African markets.

## Tech Stack
- **Frontend**: React, Tailwind CSS, @phosphor-icons/react, framer-motion
- **Backend**: FastAPI (modularized), Python
- **Database**: MongoDB
- **Auth**: Supabase
- **AI/TTS**: Google Gemini & OpenAI TTS (via Emergent LLM Key)

## Architecture
```
/app/
├── backend/
│   ├── server.py           # Main FastAPI server with routers
│   ├── routes/
│   │   ├── discover.py     # Podcasts, trending, radio
│   │   ├── offline.py      # Offline article storage
│   │   ├── admin.py        # Admin metrics, alerts, moderation
│   │   └── user.py         # Preferences, bookmarks, voices
│   └── services/           # TTS, news processing
├── frontend/
│   └── src/
│       ├── components/
│       │   └── DashboardLayout.js  # Page wrapper with scroll handling
│       ├── pages/
│       │   ├── DashboardPage.js    # Main news feed (flex container fixed)
│       │   ├── DiscoverPage.js     # Podcasts with download feature
│       │   ├── OfflinePage.js      # Cached content management
│       │   └── NewsDetailPage.js   # Article detail (flex container fixed)
│       └── lib/
│           └── audioCache.js       # IndexedDB audio caching with blob storage
└── memory/
    └── PRD.md
```

## Design System

### Light Mode Colors (Updated Feb 24, 2025)
```css
--color-primary: 98 129 65;         /* Forest Green #628141 */
--color-bg: 255 255 255;            /* Pure White #FFFFFF */
--color-surface: 239 243 237;       /* Soft Sage Tint #EFF3ED */
--color-text-primary: 27 33 26;     /* Dark Charcoal */
```

## Key API Endpoints

### Modular Routes
- `GET /api/podcasts` → Curated podcast episodes
- `GET /api/discover/trending` → Trending topics
- `GET /api/radio/countries` → African countries
- `GET /api/radio/stations` → Live radio stations
- `POST /api/offline/save` → Save article offline
- `GET /api/offline/articles` → Get saved articles
- `GET /api/admin/metrics` → System metrics

## Completed (Feb 24, 2025 - Session 2)

### Critical Bug Fixes
- ✅ **Dashboard scrolling fixed** - Changed Fragment `<>` to flex container with `min-h-0`
- ✅ **Discover page scrolling fixed** - Added `min-h-0` to main container
- ✅ **All pages scrolling fixed** - Updated 15+ pages with proper flex/scroll CSS
- ✅ **Breaking news banner text** - Changed to `text-white` for light mode visibility

### Backend Modularization
- ✅ Created `/routes/discover.py` - Podcasts, trending, radio
- ✅ Created `/routes/offline.py` - Offline storage endpoints
- ✅ Created `/routes/admin.py` - Admin dashboard endpoints
- ✅ Created `/routes/user.py` - User preferences, bookmarks

### Podcast Audio Caching
- ✅ Updated `/lib/audioCache.js` with blob storage support
- ✅ `downloadAndCacheAudio()` - Downloads audio files to IndexedDB
- ✅ `isAudioCached()` - Checks if podcast is cached
- ✅ `getCacheStats()` - Returns cache statistics
- ✅ Added download button to podcast cards on Discover page
- ✅ Progress indicator during download

### Offline Page Enhancements
- ✅ Displays cache statistics (total size, offline-ready items)
- ✅ Filter tabs show counts: ALL (2), AUDIO (0), ARTICLES (2)
- ✅ "items ready for offline" indicator

## Testing Status
- **Scrolling**: Verified working on Dashboard, Discover, Offline pages
- **Backend routes**: All 16+ endpoints responding correctly
- **Audio cache**: IndexedDB schema updated, blob storage ready

## Remaining Tasks

### P1 (Needs Testing)
- [ ] Test podcast audio download end-to-end (requires podcast with audio_url)
- [ ] Test offline playback from cached blob

### P2 (Future)
- [ ] Real Dubawa fact-checking API integration (currently MOCKED)
- [ ] Complete server.py modularization
- [ ] Service worker for true offline support

## Key Technical Notes

### Scroll Fix Pattern
Pages inside DashboardLayout must:
1. NOT use Fragment (`<>`) as root if they have sidebar
2. Use a flex container with `min-h-0` as root
3. Inner scrollable area needs `flex-1 overflow-y-auto`

```jsx
// CORRECT
return (
  <div className="flex-1 flex min-h-0">
    <main className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto">...</div>
    </main>
    <aside>...</aside>
  </div>
);

// WRONG - Fragment breaks flex layout
return (
  <>
    <main>...</main>
    <aside>...</aside>
  </>
);
```

### Audio Cache Schema (v2)
```js
{
  story_id: string,
  audioBlob: Blob | null,
  title: string,
  source: string,
  duration: string,
  type: 'audio' | 'podcast',
  size: number,
  cached_at: ISO string
}
```
