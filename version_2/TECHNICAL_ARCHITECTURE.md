# Narvo Technical Architecture: Version 2

## Ecosystem Strategy: The Monorepo
Version 2 adopts a **Monorepo** architecture to share business logic, types, and AI utilities across the native mobile app and web application. This ensures consistent news delivery and simpler deployment cycles.

## 1. AI Integrations (Multi-Provider)
We leverage a versatile AI layer for understanding and transformation:
- **Text Analysis/Summarization**: Google Gemini (primary), ChatGPT (fallback), Google AI Studio for R&D.
- **Goal**: Transform raw news content into concise, well-formatted, broadcast-style "stories" using advanced paraphrasing.

## 2. Audio/Speech Pipeline
Audio is the primary consumption mode:
- **TTS Providers**: ElevenLabs (High-fidelity), MiniMax (Performance), and Google TTS (Stability).
- **Processing**: Pre-generation of audio summaries to ensure near-zero latency for end-users.

## 3. Storage & Data Retrieval
- **Relational DB (SQL)**: For user data, subscription management, and core metadata (PostgreSQL via Supabase).
- **Vector Database**: To enable semantic search, context-aware summarization, and improved retrieval-augmented generation (RAG).
- **NoSQL / Caching**: Redis for high-frequency real-time updates.

## 4. Technology Stack Overview
| **Layer** | **Technology** |
|-----------|----------------|
| **Core Framework** | React Native (Mobile) + Next.js (Web) |
| **Backend** | Node.js (Edge Functions) |
| **Database** | PostgreSQL + Supabase + Pinecone/pgvector |
| **AI Layer** | Google Gemini API, OpenAI API, LangChain |
| **Audio** | ElevenLabs API, MiniMax Speech API |

## 5. Security & Availability
- **JWT-based Auth**: Secure handled by Supabase Auth.
- **Edge Deployment**: AI processing and delivery via edge functions to minimize global latency.
