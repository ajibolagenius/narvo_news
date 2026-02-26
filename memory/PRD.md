# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered, audio-first news broadcast platform with full PWA support for offline functionality and multi-language translation. Built for global audiences with a primary focus on African markets.

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Phosphor Icons, Framer Motion, Tone.js, Howler.js
- **Backend**: FastAPI (modularized), Python 3.11
- **Database**: MongoDB (with connection pooling: maxPoolSize=20, minPoolSize=5)
- **Auth**: Supabase (Email/Password + Google OAuth)
- **AI/TTS**: YarnGPT (primary), OpenAI TTS fallback, Google Gemini 2.0 Flash
- **Translation**: Gemini AI for 5 African languages + English
- **News Sources**: 39 RSS feeds + Mediastack API + NewsData.io API
- **PWA**: Service Worker (Stale-While-Revalidate) + Wake Lock + Network Info + Background Sync + App Badging + Install Prompt
- **Recommendation Engine**: Hybrid collaborative filtering + Gemini AI topic expansion

## Core Features
- News dashboard with RSS + aggregator feeds, filtering, sorting, deduplication
- Content Recommendation Engine (hybrid collaborative filtering + Gemini AI)
- Recommended Playlist (PLAY_ALL one-tap queue)
- Audio queue with auto-play, auto-advance, and drag-to-reorder
- AI narrative generation (Google Gemini), TTS with YarnGPT voices
- Morning briefing with transcript follow-along (YarnGPT voice)
- Multi-language broadcast (5 African languages + English)
- Podcast discovery with real RSS feeds
- Radio streaming with African stations
- Analytics dashboard (listens, duration, categories, sources, streak, daily activity)
- Supabase authentication (Email/Password + Google OAuth + Guest Mode)
- User settings persistence (localStorage + MongoDB dual sync)
- 8-step Tour Guide with proper state management (skip/complete tracked)
- PWA Web API hooks (Wake Lock, Network Info, Install Prompt, Background Sync)
- Listening History timeline with date grouping
- Real-time fact-checking
- Interest Matrix (8 categories)
- Broadcast Sound Themes (5 themes)
- Playback speed control (0.75x–2x)
- WCAG 2.1 AA accessibility

## Key API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/news` | GET | News (120s response cache) |
| `/api/recommendations/{user_id}` | GET | Personalized recommendations |
| `/api/analytics/{user_id}` | GET | Listening analytics |
| `/api/tts/generate` | POST | TTS (YarnGPT primary) |
| `/api/briefing/generate` | GET | Morning briefing (YarnGPT) |
| `/api/settings/{user_id}` | GET/POST | User settings |
| `/api/listening-history` | POST | Record listen |
| `/api/listening-history/{user_id}` | GET | User history |
| `/api/voices` | GET | YarnGPT voices |
| `/api/search` | GET | Unified search |
| `/api/podcasts` | GET | Podcast episodes |

## Backlog
- **P3:** Daily digest email notifications
- **P3:** Deeper native mobile features (Rust backend exploration)
- **P3:** User-provided API keys management
