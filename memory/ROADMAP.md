# Narvo - Roadmap

Prioritized backlog of remaining features and improvements.

---

## P0 — Critical

### Persistent Settings Logic
- Ensure all settings on `/account`, `/voices`, `/system`, and `/accessibility` pages are fully functional and persistent per-user in MongoDB + localStorage
- Currently partial: system settings and accessibility settings save to MongoDB, but not all pages have complete save/load cycles

---

## P1 — High Priority

### Optimize Audio Broadcast Loading
- Investigate pre-fetching, caching, or streaming audio data
- Reduce perceived loading time for news broadcasts
- Consider audio chunking and progressive playback

### Full Podcast Functionality (Discover Page)
- Expand podcast section to include browsing, searching, and playing episodes
- Mirror the depth of the existing radio feature
- Episode detail view with playback controls

### Clickable Hashtags
- Parse and render hashtags as clickable links throughout the app
- Filtered news view when hashtag is clicked
- Consistent across dashboard, news detail, sidebar

### Backend Testing
- Add unit/integration tests for TTS service (`tts_service.py`)
- Add unit/integration tests for podcast service (`podcast_service.py`)
- Add tests for briefing generation pipeline
- Improve test coverage for translation service edge cases

---

## P2 — Medium Priority

### Native Mobile Application
- Implement native mobile app based on existing performance guidelines
- Leverage PWA foundations (Service Worker, IndexedDB, Media Session API)
- Platform targets: iOS (Swift/SwiftUI) and Android (Kotlin/Jetpack Compose)

### User-Provided API Keys
- Allow users to bring their own API keys for:
  - Mediastack (news aggregation)
  - NewsData.io (news aggregation)
  - OpenAI (TTS voices)
- Store encrypted keys per user in MongoDB

---

## P3 — Future Enhancements

### Content & Engagement
- Daily Digest email/push (scheduled summary at user-chosen time)
- "Listen Later" queue with auto-download on Wi-Fi
- Personalized news recommendations based on reading/listening history
- Collaborative playlists / shared briefings

### Audio
- Additional broadcast sound themes (CNN-style, BBC-style, Afrobeats-infused)
- User-selectable SFX packs on settings page
- Live radio recording / time-shift playback
- Audio speed control (0.5x-2x) with pitch correction

### Platform
- Analytics dashboard (listening time, popular sources, engagement metrics)
- Content creator tools (submit articles, podcast hosting)
- API rate limiting per user tier
- Multi-tenant support for news organizations

---

## Completed
All features through P17 are implemented and tested. See `CHANGELOG.md` for details.
