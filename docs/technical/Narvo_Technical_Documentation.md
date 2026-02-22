# Narvo Technical Documentation

## Overview

Narvo is a mobile-first, voice-first platform that delivers AI-summarised news in localised voices. This document covers the technical architecture, stack, and implementation details.

**Key Innovation:** The combination of AI summarisation + localised voice synthesis addresses information overload while breaking down literacy and language barriers in emerging markets.

---

## Core Features

### MVP Features
- Topic Selector: Customisable interest categories
- AI Summarisation: Content condensation using GPT/Cohere
- Natural TTS Playback: ElevenLabs/Google/Coqui voice synthesis
- Offline Support: MP3/audio downloads and cached content
- Bento Grid Feed: Organised layout grouped by interest categories
- Smart Notifications: Daily digests and breaking news alerts
Narvo is an audio-first news broadcast platform. Its technical identity is defined by a **Monorepo** architecture and a "Technical Instrument" design language (Swiss Grid).

**Key Innovation**: Contextual RAG Synthesis and Broadcast Paraphrasing.

---

## 🛠️ Technical Architecture

### Infrastructure Strategy: The Monorepo
We utilize a single repository for both Mobile (React Native) and Web (Next.js), sharing a unified AI/Logic layer and a singular design system (Swiss Grid).

### Core Stack
| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Core** | React Native + Next.js | Unified Monorepo. Consistency. |
| **Backend** | Supabase (PostgreSQL + Auth) | Robust relational base. |
| **AI Layer** | Google Gemini + Contextual RAG | Advanced narrative synthesis. |
| **Vector DB** | pgvector / Pinecone | Long-term context for news history. |
| **Audio** | ElevenLabs / MiniMax | High-fidelity broadcast voice synthesis. |
| **STT** | Whisper | Professional transcription for live assets. |

---

## Content Ingestion & Paraphrasing

### 1. Multi-Stream Ingestion
- **RSS & Web**: Automated scraping via Playwright.
- **Broadcast Audio**: Live stream capture to STT (Whisper).
- **Video Feed**: YouTube API to Audio-to-Summary pipeline.

### 2. Contextual RAG Pipeline
1. **Extraction**: Pulling raw data.
2. **Retrieval**: AI fetches historical news from Vector DB.
3. **Synthesis**: Gemini recasts into a narrative "Broadcast Story."
4. **Attribution**: Transparent linking to original sources (Dubawa Fact-check).

---

## Design System: Swiss Grid Implementation

### Visual Rules
- **The 1px Rule**: All elements sit within visible 1px borders (`#628141`).
- **10% Color Rule**: Primary Sand (`#EBD5AB`) restricted to active states and signal CTAs.
- **Anti-light Base**: Dark matte background (`#1B211A`).
- **Typography**: Space Grotesk (Headers) + Inter (Body).

### Interaction Spec
- **Grid Breathing**: Visible opacity pulsing for active audio playback.
- **Haptic Precision**: Custom vibration patterns for breaking news.
- **High-Sunlight Mode**: Optimized contrast and voice-gestural UI.

---

## Performance & Optimization

### Predictive Pre-caching
AI predicts user routine and pre-generates full audio broadcasts at 5:00 AM, ensuring instantaneous, offline-ready news for morning commutes.

### Monorepo Benchmarks
- **LCP**: <1.5s on edge (Vercel).
- **Audio Latency**: Near-zero via edge-cached buffers.
- **Shared Logic**: 70%+ code reuse between mobile and web.

---

## Content Ingestion Pipeline

### 1. RSS Feed Integration
Sources: BBC Hausa, Channels TV, Daily Trust, Vanguard, Guardian Nigeria

```
RSS Feeds → XML Parser → Content Extraction → AI Summarisation → Voice Generation
```

### 2. Web Scraping System
Tools: Playwright + BeautifulSoup

```
Target Sites → Automated Scraping → Content Cleaning → Duplicate Detection → Processing Queue
```

### 3. Radio & TV Transcription
Process: Live Stream → Audio Capture → Speech-to-Text → Summarisation

```
Radio Streams → ffmpeg Recording → Whisper STT → GPT Summary → TTS Audio
```

Target Stations: Radio Nigeria, Cool FM, Wazobia FM, TVC, Arise News

### 4. YouTube Channel Monitoring
Sources: News channels, government announcements, industry updates

```
YouTube API → Video Download → Audio Extraction → Transcription → Summary → Voice
```

### Content Quality Assurance
- Duplicate Detection: Content fingerprinting and similarity scoring
- Source Verification: Credibility scoring and fact-checking integration
- Language Detection: Automatic language identification and routing
- Content Classification: Topic categorisation and relevance scoring

---

## Database Design

### Supabase Schema

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  preferences JSONB,
  subscription_tier VARCHAR DEFAULT 'free'
);
```

#### Interests Table
```sql
CREATE TABLE interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  category_name VARCHAR NOT NULL,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Summaries Table
```sql
CREATE TABLE summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  source_url VARCHAR,
  source_name VARCHAR,
  original_content TEXT,
  summary_text TEXT NOT NULL,
  category VARCHAR NOT NULL,
  language VARCHAR DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  keywords TEXT[],
  readability_score INTEGER
);
```

#### TTS Files Table
```sql
CREATE TABLE tts_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_id UUID REFERENCES summaries(id),
  voice_type VARCHAR NOT NULL,
  language VARCHAR NOT NULL,
  audio_url VARCHAR NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Bookmarks Table
```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  summary_id UUID REFERENCES summaries(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, summary_id)
);
```

#### Analytics Table
```sql
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action_type VARCHAR NOT NULL,
  content_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Development Roadmap

### Sprint 0: Foundation Setup (Week 1-2)
- GitHub repository initialisation
- Vercel deployment pipeline
- Supabase project configuration
- Next.js PWA scaffold with offline capabilities
- Basic authentication system

### Sprint 1: Core Pipeline (Week 3-4)
- User interest selection interface
- RSS feed integration and parsing
- Web scraping framework (Playwright)
- GPT integration for summarisation
- Basic job scheduler for content processing

### Sprint 2: Voice Integration (Week 5-6)
- ElevenLabs/Google TTS integration
- Audio player component with controls
- Language and voice selection UI
- TTS file generation and storage system

### Sprint 3: Offline & Persistence (Week 7-8)
- Bookmark and save functionality
- Local storage implementation (IndexedDB)
- Audio file caching system
- Offline reading mode

### Sprint 4: Polish & Testing (Week 9-10)
- Cross-device testing and optimisation
- Error handling and fallback systems
- Performance optimisation
- User experience refinements

### Sprint 5: Advanced Features (Week 11-12)
- Multi-channel notifications (WhatsApp, email)
- Advanced analytics and user insights
- Content recommendation engine
- Social sharing capabilities

---

## Platform Strategy

### PWA vs Native App Decision Matrix

| Consideration | PWA (Next.js) | Native App | Decision |
|---------------|---------------|------------|----------|
| Development Speed | Fast, single codebase | Slower, multiple codebases | ✅ Start PWA |
| App Store Presence | Limited iOS support | Full store integration | ⬜ Phase 2 Native |
| Offline Capabilities | Good with Service Workers | Excellent | ✅ PWA Sufficient |
| Push Notifications | Limited iOS, good Android | Full support | ⬜ Evaluate later |
| Device Integration | Limited | Full access | ⬜ Not critical for MVP |
| Maintenance Cost | Lower | Higher | ✅ PWA Better |
| Update Distribution | Instant | Store approval required | ✅ PWA Better |

### Implementation Strategy
1. **Phase 1**: Launch as PWA using Next.js for rapid iteration and testing
2. **Phase 2**: Evaluate user adoption and platform-specific needs
3. **Phase 3**: Optional native app wrapper using Capacitor for store distribution
4. **Phase 4**: Consider full native development based on growth metrics

### Platform-Specific Optimisations
- Android: Full PWA support, install prompts, background sync
- iOS: App-like experience, offline caching, Safari optimisation
- Desktop: Responsive design, keyboard shortcuts, larger screen layouts

---

## Success Metrics & KPIs

### User Engagement
- Daily Active Users (DAU): Target 10K+ within 6 months
- Session Duration: Average 5+ minutes per session
- Content Consumption: 3+ summaries per user per day
- Voice Usage: 70%+ of content consumed via audio

### Technical Performance
- App Load Time: <2 seconds on 3G connection
- Offline Availability: 95%+ uptime for cached content
- Voice Generation Speed: <30 seconds for average summary
- Summary Accuracy: 85%+ user satisfaction rating

### Market Penetration
- Geographic Coverage: 5+ Nigerian states in first year
- Language Adoption: 40%+ usage of local language voices
- Source Diversity: 50+ active content sources
- User Retention: 60%+ monthly retention rate

---

## Future Roadmap

### Short-term (6-12 months)
- Multi-platform Launch: PWA deployment across Android, iOS, desktop
- Voice Model Training: Custom Nigerian dialect TTS models
- Content Partnerships: Direct feeds from major Nigerian media houses
- Community Features: User feedback, content rating, discussion threads

### Medium-term (1-2 years)
- Regional Expansion: Ghana, Kenya, South Africa market entry
- Premium Features: Advanced personalisation, exclusive content, faster processing
- API Platform: Third-party integration for educational institutions, businesses
- Live Audio: Real-time radio/TV summarisation and broadcast

### Long-term (2-5 years)
- Continental Presence: Pan-African news summarisation platform
- AI Advancement: Custom-trained models for African news context
- Educational Integration: Partnerships with universities and literacy programs
- Government Collaboration: Official information dissemination channel

---
