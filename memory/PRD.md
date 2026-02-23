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
- Morning Briefing feature with auto-generated 5-minute audio digest

## Design System
### Colors - The 10% Rule
- **Primary (Signal):** `#EBD5AB` - Sand/Beige, 10% max
- **Background:** `#1B211A` - Deep Matte Charcoal
- **Surface:** `#242B23` - Muted Green/Grey
- **Border:** `#628141` - Forest Green
- **Text Primary:** `#F2F2F2` - 90% White
- **Text Secondary:** `#8BAE66` - Sage Green

### Typography
- **Display:** Space Grotesk
- **Body:** Inter
- **Mono/System:** JetBrains Mono

### Design Principles
- Strict Minimalism (no shadows, no gradients, 0px radii)
- Swiss Grid visible architecture (1px borders)
- Broadcast-grade technical aesthetic
- Audio-first UI feedback

## Technical Stack
- **Frontend**: React 18, TailwindCSS, React Router
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **AI**: Gemini 2.0 Flash (via Emergent LLM Key)
- **TTS**: OpenAI TTS (via Emergent LLM Key)
- **News Sources**: RSS feeds from 7 African sources

## What's Been Implemented

### MVP Features - All Complete
1. **Loading Screen** - Animated boot sequence with status messages
2. **Landing Page** - Swiss Grid hero, news marquee scroller, incoming transmissions panel, core pillars, technical modules, CTA section, footer
3. **Authentication** - Login form with localStorage-based session
4. **Onboarding** - 3-panel setup: Regional Node, Vocal Matrix, Interest Matrix
5. **Dashboard** - Live news feed with sidebar navigation
6. **News Detail** - AI-generated narratives, TTS playback
7. **Voice Studio** - 5 regional voice profiles
8. **Search Center** - Text search placeholder
9. **Settings** - Display toggles, logout
10. **Audio Player** - Persistent player with controls
11. **Morning Briefing** - Auto-generated audio digest with AI script

### Backend APIs - All Working
- `/api/health` - System status
- `/api/news` - RSS aggregation from 7 sources
- `/api/news/{id}` - News detail with AI narrative
- `/api/paraphrase` - AI narrative generation (Gemini)
- `/api/tts/generate` - OpenAI TTS audio generation
- `/api/voices` - Voice profile list
- `/api/metrics` - Platform statistics
- `/api/regions`, `/api/categories`, `/api/trending` - Supporting data
- `/api/briefing/generate` - Generate morning briefing with audio
- `/api/briefing/latest` - Get cached briefing
- `/api/briefing/audio` - Generate audio for custom script

### News Sources
1. Vanguard Nigeria
2. Punch Nigeria
3. Daily Trust
4. Premium Times
5. The Guardian Nigeria
6. BBC Africa
7. Al Jazeera

## Testing Status (Feb 23, 2026)
- Backend: 100% (12/12 endpoints working)
- Frontend: 100% (all pages + flows working)
- Test report: `/app/test_reports/iteration_5.json`

## Prioritized Backlog

### P0 (Critical) - ALL COMPLETE
- [x] Landing Page with Swiss Grid design
- [x] Auth Page
- [x] Onboarding Page (3-panel)
- [x] Dashboard with live news feed
- [x] TTS audio generation
- [x] AI narrative synthesis
- [x] Morning Briefing feature

### P1 (High Priority) - NEXT
- [ ] Refactor monolithic App.js into component files
- [ ] Set up react-router-dom properly with lazy loading
- [ ] User account persistence with Supabase Auth
- [ ] Save/bookmark stories
- [ ] Offline audio caching

### P2 (Medium Priority)
- [ ] Dubawa fact-checking / Truth Tags integration
- [ ] User preference sync
- [ ] Playlist/queue functionality
- [ ] Share stories feature
- [ ] Push notifications for breaking news

### P3 (Future)
- [ ] React Native mobile app
- [ ] Admin dashboard for content curation
- [ ] Voice cloning for regional accents
- [ ] WebSocket real-time updates
- [ ] Scheduled 5 AM briefing generation
- [ ] Historical Morning Briefings browser

## Architecture Note
Currently all frontend code lives in a single `/app/frontend/src/App.js` file (1250+ lines). This is the highest priority refactoring task - needs to be split into separate component files with proper routing.
