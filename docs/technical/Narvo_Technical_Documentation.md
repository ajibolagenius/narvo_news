# Narvo Technical Documentation Overview

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