# Narvo - Changelog

## 2026-02-26 (Session 3)

### Features
- **Content Recommendation Engine (P0)**: Hybrid collaborative filtering + Gemini AI topic expansion via `recommendation_service.py`. New `/api/recommendations/{user_id}` endpoint. FOR_YOU section on dashboard with compact 2-column card grid.
- **Recommended Playlist**: PLAY_ALL button on FOR_YOU section header queues top 5 recommendations.
- **Audio Queue Enhancements**: Auto-play on first queue add, auto-advance to next track on finish (via refs for stale closure fix), drag-to-reorder with HTML5 native drag-and-drop (DotsSixVertical handles).
- **Analytics Dashboard (P3)**: New `/analytics` page and `/api/analytics/{user_id}` endpoint with total listens, duration, category breakdown, source breakdown, daily activity chart, and listening streak.
- **PWA Web API Hooks**: Wake Lock (screen-on during playback), Network Info (adaptive quality indicator in header), Install Prompt (custom PWA install button), Background Sync (offline request queue), App Badging API, Visibility API.
- **Enhanced Tour Guide**: Rewritten with 8 detailed steps, tip sections, step dot navigation, proper skip/complete state management via localStorage, resetTourGuide() for Settings page replay.

### Bug Fixes
- **Mobile Horizontal Overflow (Root Cause)**: Added `min-w-0 overflow-hidden` to `DashboardLayout.js` motion.div — the missing constraint that allowed flex children to expand beyond viewport on mobile.
- **Mobile Overflow on All Pages**: Applied `overflow-x-hidden` to Dashboard, Discover, Search, History, Settings, Bookmarks, Saved, Offline, Briefing, NewsDetail, VoiceStudio, Accessibility pages. Added `overflow-x: hidden` to `#root` in CSS.
- **Voice Selection Consistency**: Changed ALL default voice IDs from 'nova'/'onyx' (OpenAI) to 'emma' (YarnGPT) across server.py models and endpoints. Fixed MorningBriefingPage to use `voiceModel` from AudioContext instead of hardcoded 'nova'. Fixed `/api/briefing/generate` and `/api/briefing/audio` to use `yarngpt_service.generate_tts` instead of OpenAI directly.
- **Mobile Search Icon Removed**: Separated `getNavItems` (mobile, 6 items) from `getDesktopNavItems` (desktop, 8 items with search + analytics).

### Performance
- **News Response Cache**: 120-second TTL cache for `/api/news` reduces redundant RSS fetches. Recommendations endpoint reuses the same cache.
- **MongoDB Connection Pooling**: Configured maxPoolSize=20, minPoolSize=5, maxIdleTimeMS=30000 for better concurrent request handling.
- **Warm cache benchmark**: 7.6x faster (1.14s → 0.15s) for news endpoint.

## 2026-02-25 (Session 2)
- Backend performance: GZip, lru_cache, MongoDB indexes, TTL on tts_cache
- PWA: Service worker fix, pull-to-refresh, Apple meta tags, loading skeletons
- Voice consistency: settingsLoaded flag in AudioContext
- Audio player: Speed control, redesigned bar + mobile modal
- Global font size increase
- Interest Matrix feature

## 2026-02-24 (Session 1)
- Initial full-stack build: React + FastAPI + MongoDB + Supabase
- News aggregation, TTS, podcast discovery, radio streaming
- Authentication, settings, bookmarks, offline mode
