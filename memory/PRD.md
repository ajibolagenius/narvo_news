# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered, audio-first news broadcast platform with full PWA support for offline functionality and multi-language translation. Built for global audiences with a primary focus on African markets.

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Phosphor Icons, Framer Motion, Tone.js, Howler.js
- **Backend**: FastAPI (modularized), Python 3.11
- **Database**: MongoDB (connection pooling: maxPoolSize=20, minPoolSize=5)
- **Auth**: Supabase (Email/Password + Google OAuth)
- **AI/TTS**: YarnGPT (primary), OpenAI TTS fallback, Google Gemini 2.0 Flash
- **News Sources**: 39 RSS feeds + Mediastack API + NewsData.io API
- **PWA**: Service Worker + Wake Lock + Network Info + Background Sync + App Badging + Install Prompt
- **Recommendation Engine**: Hybrid collaborative filtering + Gemini AI topic expansion

## Core Features
- News dashboard with RSS + aggregator feeds, filtering, sorting, deduplication
- Content Recommendation Engine (hybrid collaborative filtering + Gemini AI) with PLAY_ALL
- Audio queue with auto-play, auto-advance, drag-to-reorder
- Advanced Analytics Dashboard (listens, duration, streak, weekly trends, period comparison, hourly distribution, categories, sources)
- AI narrative generation (Gemini), TTS with YarnGPT voices
- Morning briefing with YarnGPT voice
- Multi-language broadcast (5 African languages + English)
- Podcast discovery, Radio streaming
- Supabase auth (Email/Password + Google OAuth + Guest Mode)
- 8-step Tour Guide with proper state management
- PWA Web API hooks
- Playback speed control (0.75x–2x)
- WCAG 2.1 AA accessibility

## Key API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/news` | GET | News (120s cache) |
| `/api/recommendations/{user_id}` | GET | Personalized recommendations |
| `/api/analytics/{user_id}` | GET | Advanced analytics |
| `/api/tts/generate` | POST | TTS (YarnGPT) |
| `/api/briefing/generate` | GET | Briefing (YarnGPT) |
| `/api/settings/{user_id}` | GET/POST | Settings |
| `/api/listening-history` | POST/GET | History |

## Backlog
- **P3:** Daily digest email notifications
- **P3:** Deeper native mobile features
