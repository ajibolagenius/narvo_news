# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered, audio-first news broadcast platform with full PWA support for offline functionality and multi-language translation. Built for global audiences with a primary focus on African markets.

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Phosphor Icons, Framer Motion, Tone.js, Howler.js
- **Backend**: FastAPI (modularized), Python 3.11
- **Database**: MongoDB (via MONGO_URL)
- **Auth**: Supabase (Email/Password + Google OAuth)
- **AI/TTS**: YarnGPT (primary), OpenAI TTS fallback, Google Gemini 2.0 Flash
- **Translation**: Gemini AI for 5 African languages + English
- **Fact-Checking**: Google Fact Check API (with keyword analysis fallback)
- **News Sources**: 39 RSS feeds + Mediastack API + NewsData.io API
- **Podcast Sources**: 5 real RSS feeds
- **PWA**: Service Worker + IndexedDB + Media Session API + Wake Lock + Network Info + Background Sync + App Badging + Install Prompt
- **Recommendation Engine**: Hybrid collaborative filtering + Gemini AI topic expansion

## Core Features Implemented
- News dashboard with RSS + aggregator feeds, filtering, sorting, deduplication
- AI narrative generation (Google Gemini), TTS narration with server-side caching
- YarnGPT as primary TTS engine with 5 Nigerian-accented voices
- Morning briefing with transcript follow-along
- Multi-language broadcast (5 African languages + English)
- Podcast discovery with real RSS feeds, search, category filters
- Radio streaming with African station browser
- Supabase authentication (Email/Password + Google OAuth + Guest Mode)
- User settings persistence (localStorage + MongoDB dual sync)
- Audio pre-fetching for dashboard articles
- Clickable hashtag system (TagPill component)
- Listening History timeline with date grouping and replay
- Real-time fact-checking with actual publishers
- Real platform metrics from database
- Real system alerts from live service status monitoring
- Interest Matrix — 8 selectable news categories
- Broadcast Sound Themes — 5 selectable audio branding themes
- Push Notification endpoints (subscribe, unsubscribe, daily digest)
- WCAG 2.1 AA accessibility (skip link, focus-visible, reduced motion)
- Responsive mobile-first design (overflow-x-hidden on ALL pages)
- News detail autoplay with TTS pre-generation
- Playback speed control (0.75x, 1x, 1.25x, 1.5x, 2x)
- Voice preference consistency: settingsLoaded flag
- Enhanced readability: global font-size increase
- **Content Recommendation Engine**: Hybrid collaborative filtering + Gemini AI topic expansion, FOR_YOU section with compact 2-col cards + PLAY_ALL button
- **Recommended Playlist**: PLAY_ALL button queues top 5 recommendations for hands-free listening
- **Enhanced Tour Guide**: 8-step guided tour with tips, proper skip/complete state management
- **Mobile Nav Cleanup**: Search icon removed from mobile bottom nav
- **PWA Web API Hooks**: Wake Lock (screen-on during playback), Network Info (adaptive quality indicator), Install Prompt (custom install button), Background Sync (offline queue), App Badging API

## Key API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/news` | GET | RSS + aggregator news |
| `/api/search` | GET | Unified search |
| `/api/podcasts` | GET | List podcast episodes |
| `/api/settings/{user_id}` | GET/POST | User settings |
| `/api/tts/generate` | POST | TTS with caching |
| `/api/factcheck/story/{id}` | GET | Fact-check |
| `/api/metrics` | GET | Platform metrics |
| `/api/system-alerts` | GET | System alerts |
| `/api/listening-history` | POST | Record listened |
| `/api/listening-history/{user_id}` | GET | User history |
| `/api/recommendations/{user_id}` | GET | Personalized recommendations |
| `/api/briefing/latest` | GET | Morning briefing |
| `/api/voices` | GET | TTS voices |
| `/api/sound-themes` | GET | Sound themes |
| `/api/notifications/subscribe` | POST | Push subscribe |

## Backlog
- **P2:** Further backend performance optimization
- **P3:** User-provided API keys for external services
- **P3:** Analytics dashboard
- **P3:** Daily digest email notifications
- **P3:** Deeper native mobile features (Rust backend exploration)
