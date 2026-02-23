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

## Design System (Updated Feb 23, 2026)
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
- Morning Briefing auto-generation

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
9. **Morning Briefing** - Auto-generated audio digest with AI script ✅ NEW

### Morning Briefing Feature (NEW)
- `/briefing` page with personalized greeting
- Voice selection for briefing narration
- AI-generated broadcast script (Gemini 2.0 Flash)
- TTS audio generation (OpenAI)
- List of 5 top stories included
- Full script view
- Generate New / Play Briefing controls
- 1-hour caching for performance

### Backend APIs
- `/api/health` - System status
- `/api/news` - RSS aggregation from 7 sources
- `/api/news/{id}` - News detail with AI narrative
- `/api/paraphrase` - AI narrative generation
- `/api/tts/generate` - OpenAI TTS audio generation
- `/api/voices` - Voice profile list
- `/api/metrics` - Platform statistics
- `/api/regions`, `/api/categories`, `/api/trending` - Supporting data
- `/api/briefing/generate` - Generate morning briefing with audio ✅ NEW
- `/api/briefing/latest` - Get cached briefing ✅ NEW
- `/api/briefing/audio` - Generate audio for custom script ✅ NEW

### News Sources
1. Vanguard Nigeria
2. Punch Nigeria
3. Daily Trust
4. Premium Times
5. The Guardian Nigeria
6. BBC Africa
7. Al Jazeera

## Prioritized Backlog

### P0 (Critical) - COMPLETE
- [x] TTS audio generation
- [x] AI narrative synthesis
- [x] News feed display
- [x] Basic authentication
- [x] Morning Briefing feature

### P1 (High Priority)
- [ ] User account persistence with Supabase Auth
- [ ] Save/bookmark stories
- [ ] Offline audio caching
- [ ] Push notifications for breaking news
- [ ] Scheduled 5 AM briefing generation

### P2 (Medium Priority)
- [ ] Dubawa fact-checking integration
- [ ] User preference sync
- [ ] Playlist/queue functionality
- [ ] Share stories feature

### P3 (Future)
- [ ] React Native mobile app
- [ ] Admin dashboard for content curation
- [ ] Voice cloning for regional accents
- [ ] WebSocket real-time updates

## Next Tasks
1. Implement scheduled briefing generation at 5 AM local time
2. Add Supabase Auth for persistent user accounts
3. Implement story bookmarking functionality
4. Build offline storage for audio
5. Add social sharing features

## Testing Status
- Backend: 100% (15/15 endpoints working)
- Frontend: 100% (all UI functional including Morning Briefing)
- TTS: Working with OpenAI via Emergent LLM Key

## Design System
- Primary: #EBD5AB (Sand)
- Background: #1B211A (Deep Matte)
- Surface: #242B23 (Muted Green)
- Border: #628141 (Forest Green)
- Text: #F2F2F2 (90% White)
- Fonts: Space Grotesk (headers), Inter (body), JetBrains Mono (code)
