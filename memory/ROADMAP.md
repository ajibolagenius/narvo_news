# Narvo - Roadmap

Prioritized backlog of remaining features and improvements.

---

## P1 — High Priority

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
- Offline-first architecture with background sync

### User-Provided API Keys
- Allow users to bring their own API keys for:
  - Mediastack (news aggregation)
  - NewsData.io (news aggregation)
  - OpenAI (TTS voices)
- Store encrypted keys per user in MongoDB
- Fallback to platform keys when user keys not provided

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
- Audio speed control (0.5x–2x) with pitch correction

### Platform
- Analytics dashboard (listening time, popular sources, engagement metrics)
- Content creator tools (submit articles, podcast hosting)
- API rate limiting per user tier
- Multi-tenant support for news organizations

---

## Completed
All features through P15c are implemented and tested. See `CHANGELOG.md` for details.
