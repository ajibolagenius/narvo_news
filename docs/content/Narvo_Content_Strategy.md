# Narvo Content Strategy

*Implementation note: Current integration uses Google Fact Check and TTS via Emergent/OpenAI path; Dubawa and ElevenLabs are referenced as partners or future.*

## 1. Ingestion Pipeline
Narvo utilizes a multi-provider ingestion logic:
1. **Extract**: Pulling from RSS, Web (Playwright), and Video (YouTube).
2. **Transcribe**: Real-time transcription of TV and Radio feeds via OpenAI Whisper.
3. **Analyze**: Categorization and duplicate detection using semantic similarity.
4. **Paraphrase**: Recasting into narrative "Broadcast Stories" via Google Gemini.
5. **Synthesize**: Generate high-fidelity audio (e.g. Emergent/OpenAI; ElevenLabs/MiniMax on roadmap).

## 2. Source Hierarchy
- **Primary**: Verified local media (Newspapers, Broadcast Stations).
- **Secondary**: Niche tech and regional digital platforms.
- **Hyper-local**: Regional radio station highlights and community reports.

## 3. Quality Assurance (The Truth Layer)
- **Automated Fact-Checking**: Direct API integration with verification services (e.g., Google Fact Check; Dubawa referenced for regional verification) to auto-flag suspicious claims in real-time.
- **Source Attribution**: Every story includes a clear "Read Full Article" link to the original source.
- **Relevance Scoring**: AI ranking based on user interests and global significance.

## 4. Localization & Feedback
- **Local Dialects**: Continued support for Pidgin, Yoruba, Hausa, and Igbo audio outputs.
- **Dialect Feedback Loops**: In-app "Report Pronunciation" tools allow users to help the AI fine-tune regional accents.
- **Contextual Adaptation**: Paraphrasing ensures that global news is explained within a local context.
