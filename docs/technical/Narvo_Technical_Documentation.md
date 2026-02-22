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
- Language Controls: Voice and interface language switching
- Content Management: Bookmarking and saved digest library

### Advanced Features
- Voice Preference Memory: Personalised TTS settings
- Automated Scheduling: Daily digest generation and delivery
- Multi-channel Distribution: WhatsApp/email/push notifications
- AI Prioritisation: Intelligent story ranking and suggestion
- Export Options: Save as audio, text, or shareable cards
- Accessibility Mode: Voice navigation and screen reader support
- Source Attribution: Citation links and "read full article" options

---

## 🛠️ Technical Architecture

### Frontend Stack
| **Technology** | **Purpose** | **Rationale** |
|----------------|-------------|---------------|
| **Next.js (PWA)** | Core framework | Fast, SEO-friendly, offline-capable |
| **Tailwind CSS** | Styling | Rapid, responsive design system |
| **shadcn/ui** | Component library | Accessible, customisable components |
| **Service Workers** | Offline functionality | Content caching and background sync |
| **IndexedDB** | Local storage | Large offline data storage |

### Backend Infrastructure
| **Technology** | **Purpose** | **Rationale** |
|----------------|-------------|---------------|
| **Supabase** | Primary backend | Auth, database, real-time, storage |
| **Node.js API** | Custom services | Scraping, AI integration, TTS processing |
| **PostgreSQL** | Database | Robust relational data management |
| **Vercel** | Deployment | Seamless Next.js hosting and scaling |

### AI & Voice Services
| **Service** | **Purpose** | **Integration** |
|-------------|-------------|-----------------|
| **GPT-4/Cohere** | Content summarisation | API-based content processing |
| **ElevenLabs** | Premium voice synthesis | Custom voice cloning and natural TTS |
| **Google TTS** | Fallback voice service | Reliable, multi-language support |
| **Coqui TTS** | Local language voices | Open-source Nigerian dialect models |
| **Whisper** | Audio transcription | Radio/YouTube content processing |

### Content Processing Pipeline
| **Tool** | **Purpose** | **Implementation** |
|----------|-------------|-------------------|
| **RSS-parser** | Feed aggregation | Lightweight XML parsing |
| **Playwright** | Web scraping | JavaScript-enabled content extraction |
| **newspaper3k** | Article extraction | Structured content parsing |
| **yt-dlp** | YouTube processing | Video/audio download and extraction |
| **ffmpeg** | Audio processing | Stream recording and format conversion |

---

## Voice Localisation Strategy

### Supported Languages & Dialects
- Nigerian Pidgin English: Primary local communication
- Yoruba: Southwestern Nigeria
- Hausa: Northern Nigeria
- Igbo: Southeastern Nigeria
- English: International standard

### Voice Technology Implementation
| Provider | Use Case | Advantages |
|----------|----------|------------|
| ElevenLabs | Premium voices, voice cloning | Highly natural, custom voice creation |
| Coqui TTS | Open-source local models | Free, customisable, privacy-focused |
| Azure Neural Voices | Enterprise reliability | Stable, scalable, multi-region |
| Google TTS | Fallback service | Broad language support, reliable |

### Cultural Adaptation Features
- Accent Recognition: Regional Nigerian pronunciation patterns
- Contextual Delivery: Culturally appropriate tone and pacing
- Voice Personality: Multiple voice options per language
- Speed Control: Adjustable playback for comprehension preferences

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
