# Narvo Content Strategy: Version 2

## Ingestion & Curation Strategy
Version 2 leverages a sophisticated multi-source ingestion pipeline to feed the "Broadcast" engine. Content is not just aggregated; it is transformed.

## 1. Source Diversity
| **Category** | **Specific Targets** | **Extraction Method** |
|--------------|----------------------|----------------------|
| **Traditional Media** | Vanguard, Guardian, Punch, ThisDay | RSS / Playwright Scraping |
| **Broadcast Transcription** | Channels TV, Arise News, Radio Nigeria | Audio Streams + Whisper STT |
| **Digital Platforms** | Techpoint, Nairametrics, Pulse | Custom API / Playwright |
| **Global Context** | BBC, Reuters, Al Jazeera | Official News APIs |

## 2. The Transformation Pipeline
1. **Gather**: Pull raw text from diverse sources.
2. **Summarize**: Condense into 3-5 core bullet points.
3. **Paraphrase**: Recast the summary into a broadcast-style narrative.
4. **Enrich**: Use Vector DBs to add historical context or related story links.
5. **Synthesize**: Generate high-fidelity audio (ElevenLabs/MiniMax).

## 3. Quality Assurance (The Truth Layer)
- **Fact-Check Integration**: Automated cross-referencing against verified sources.
- **Source Attribution**: Every story includes a clear "Read Full Article" link to the original source.
- **Relevance Scoring**: AI ranking based on user interests and global significance.

## 4. Localization (Cultural Resonance)
- **Local Dialects**: Continued support for Pidgin, Yoruba, Hausa, and Igbo audio outputs.
- **Contextual Adaptation**: Paraphrasing ensures that global news is explained within a local context where relevant.
