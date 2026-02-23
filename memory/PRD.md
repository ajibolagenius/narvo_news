# Narvo - Product Requirements Document

## Overview
Narvo is a precision-engineered news broadcast platform that transforms fragmented information into high-fidelity, audio-enhanced narrative stories. Built for global audiences with a primary focus on African markets.

## Original Problem Statement
Build a full-stack web application for Narvo - a broadcast-grade news platform with:
- Swiss Grid design system (strict minimalism, 1px borders, dark theme)
- Audio-first experience with TTS in regional African accents
- AI-powered narrative synthesis
- Live news aggregation from African sources
- Truth Tags for source verification

## User Personas
1. **African Professional** - Needs quick, reliable news updates during commute
2. **Diaspora Audience** - Wants to stay connected with home news in familiar accents
3. **News Consumer** - Values verified, trustworthy news with transparent sourcing

## Core Requirements (Static)
- Dark theme with Swiss Grid layout (1px borders, no shadows)
- Audio-first broadcast experience
- AI narrative paraphrasing
- Regional voice selection (Pidgin, Yoruba, Hausa, Igbo, Standard)
- Truth Tags with source attribution
- Live news from RSS feeds

## Technical Stack
- **Frontend**: React 18, TailwindCSS, React Router
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **AI**: Gemini 2.0 Flash (via Emergent LLM Key)
- **TTS**: OpenAI TTS (via Emergent LLM Key)
- **News Sources**: RSS feeds from 7 African sources

## What's Been Implemented (Feb 23, 2026)

### MVP Complete ✅
1. **Landing Page** - Swiss Grid hero with metrics, features, CTAs
2. **Authentication** - Login/signup flow with localStorage
3. **Dashboard** - Live news feed with filtering, category tags
4. **News Detail** - AI-generated narratives, key takeaways, TTS playback
5. **Voice Studio** - 5 regional voice profiles with preview
6. **Search Center** - Full-text search with category filtering
7. **Settings** - User preferences, display toggles
8. **Audio Player** - Persistent player with controls, waveform visualization

### Backend APIs
- `/api/health` - System status
- `/api/news` - RSS aggregation from 7 sources
- `/api/news/{id}` - News detail with AI narrative
- `/api/paraphrase` - AI narrative generation
- `/api/tts/generate` - OpenAI TTS audio generation
- `/api/voices` - Voice profile list
- `/api/metrics` - Platform statistics
- `/api/regions`, `/api/categories`, `/api/trending` - Supporting data

### News Sources
1. Vanguard Nigeria
2. Punch Nigeria
3. Daily Trust
4. Premium Times
5. The Guardian Nigeria
6. BBC Africa
7. Al Jazeera

## Prioritized Backlog

### P0 (Critical)
- [x] TTS audio generation
- [x] AI narrative synthesis
- [x] News feed display
- [x] Basic authentication

### P1 (High Priority)
- [ ] User account persistence with Supabase Auth
- [ ] Save/bookmark stories
- [ ] Offline audio caching
- [ ] Push notifications for breaking news

### P2 (Medium Priority)
- [ ] Dubawa fact-checking integration
- [ ] User preference sync
- [ ] Playlist/queue functionality
- [ ] Share stories feature

### P3 (Future)
- [ ] React Native mobile app
- [ ] Admin dashboard for content curation
- [ ] Voice cloning for regional accents
- [ ] Predictive pre-caching (5 AM sync)
- [ ] WebSocket real-time updates

## Next Tasks
1. Implement Supabase Auth for persistent user accounts
2. Add story bookmarking functionality
3. Implement offline storage for audio
4. Add social sharing features
5. Build admin curation console

## Testing Status
- Backend: 100% (12/12 endpoints working)
- Frontend: 100% (all UI functional)
- TTS: Working with OpenAI via Emergent LLM Key

## Design System
- Primary: #EBD5AB (Sand)
- Background: #1B211A (Deep Matte)
- Surface: #242B23 (Muted Green)
- Border: #628141 (Forest Green)
- Text: #F2F2F2 (90% White)
- Fonts: Space Grotesk (headers), Inter (body), JetBrains Mono (code)
