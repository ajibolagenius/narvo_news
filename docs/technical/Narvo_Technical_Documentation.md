# Narvo Technical Documentation Overview

Narvo is a **Broadcast-Grade News Platform** that delivers AI-produced narratives in localized high-fidelity voices. This document covers the technical architecture, stack, and broadcast-centric implementation details.

**Key Innovation:** The synthesis of **Broadcast Paraphrasing** + **Regional TTS** addresses information overload while providing cultural resonance and journalistic authority in emerging markets.

---

## Core Features

### V2 Broadcast Features
- **The Broadcast Loop**: A radio-like continuous stream of prioritized news stories.
- **Native Language Translation**: Real-time synthesis and translation into local dialects.
- **Broadcast Paraphrasing**: Narrative-driven content synthesis using Google Gemini.
- **The Truth Tag**: Transparency on AI synthesis, translation, and source verification.
- **Regional Voice Studio**: Selection of high-fidelity, culturally accurate voices.
- **Swiss Grid Feed**: A rigid, precision-engineered layout for high-density information.
- **Predictive Station Sync**: Automated morning pre-caching of localized audio broadcasts.

---

## 🛠️ Technical Architecture

### Infrastructure Strategy: The Monorepo
We utilize a single repository for both Mobile (React Native) and Web (Next.js), sharing a unified AI/Logic layer and the **Swiss Grid Design System**.

### Core Stack
| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Core** | React Native + Next.js | Unified Monorepo. Maximum code reuse. |
| **Backend** | Supabase (Postgres + Auth) | Robust relational base with real-time capabilities. |
| **AI Layer** | Google Gemini 1.5 Pro | Advanced narrative synthesis and **multilingual translation**. |
| **Vector DB** | pgvector (Supabase) | Historical context for RAG and news continuity. |
| **Audio** | ElevenLabs / MiniMax | Professional-grade broadcast voice synthesis in multiple languages. |
| **STT** | Whisper (OpenAI) | Transcription of live broadcast inputs. |
| **Fact-Check** | Dubawa API | Real-time verification and source mapping. |
| **Icons** | Phosphoricons | Main functional icon library (1.5px stroke). |
| **Motion** | GSAP + Motion (Framer) | Precision technical and reactive animations. |
| **Smooth Scroll** | Lenis | Momentum-based scrolling experience. |

---

## Broadcast Production Pipeline

### 1. Multi-Stream Ingestion Logic
- **Structured Feeds**: RSS parsing with automated content cleaning.
- **Live Broadcasts**: Real-time audio capture and transcription via Whisper.
- **Video Intelligence**: YouTube API integration for extracting narratives.

### 2. The Contextual RAG, Translation & Truth Tag Lifecycle
1. **Extraction**: Automated pulling of raw facts and quotes.
2. **Retrieval**: System fetches historical context from the Vector DB.
3. **Synthesis & Translation**: Gemini recasts content into a **Broadcast Narrative** and simultaneously **translates** it into the target native language.
4. **Verification**: Cross-referencing with Dubawa data to assign a **Truth Score**.
5. **Truth Tag Generation**: Producing metadata explaining editorial and translation decisions.

### 3. Predictive Pre-caching Engine (The 5:00 AM Sync)
To ensure near-zero latency and offline reliability, the platform predicts user routines. At **5:00 AM local time**, the system:
- Fetches top stories across user interest categories.
- Runs the RAG synthesis and audio generation.
- Pushes binary audio assets to edge caches and initiates background sync for mobile clients.

---

## Design System: Swiss Grid Implementation

### Visual Architecture
- **Visible Grid**: 1px structural borders (`#628141`) define all layout boundaries.
- **The 10% Rule**: Primary Sand (`#EBD5AB`) is restricted to **active signals** only.
- **No Shadows**: A pure 2D aesthetic focusing on spatial hierarchy.
- **Tabular Numerals**: Monospaced fonts for all data (speed, time, storage).

### Dynamic Interaction
- **Grid Breathing**: Subtle visual pulsing confirms active audio playback.
- **Haptic Precision**: Sharp haptic signatures for breaking news and sync completion.

---

## Success Metrics (V2)
- **Audio Completion Rate**: Target 85% of broadcasts heard to finish.
- **Truth Transparency Index**: User trust ratings on "Truth Tag" accuracy.
- **Broadcast Latency**: <500ms for play start from edge.
- **Source Fidelity**: 100% verification rate for all primary narratives.

---