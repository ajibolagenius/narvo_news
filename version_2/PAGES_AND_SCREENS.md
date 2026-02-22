# Narvo Pages & Screens: Version 2 (Swiss Grid Layout)

## Design Paradigm: The Technical Instrument
Following the Swiss Grid principle, every page is treated as a high-fidelity instrument panel. Layouts are strictly segmented by 1px borders, and interaction is optimized for both desktop (cursor precision) and mobile (thumb-reach/gestures).

---

## 1. Public & Entry Pages
| **Mobile Zone** | **Desktop Zone** | **Core Components** |
|-----------------|------------------|----------------------|
| **Splash** | **Loading State** | Minimalist logo, "Grid Breathing" indicator. |
| **Landing** | **Hero Dashboard** | The Pitch, Primary Broadcast CTA, Global Stats (Grid cells). |
| **Onboarding** | **Multi-panel Setup** | Regional Select, Voice Preference, Interest Matrix. |
| **Auth** | **Center Console** | 2FA Setup, Secure Login/Signup, biometric prompts. |

---

## 2. Core News Experience (Broadcast Center)
### Home Dashboard
- **Vertical Orientation (Mobile)**: Top-down feed of prioritized grid cards.
- **Horizontal Landscape (Desktop)**: Left Sidebar (Navigation), Center Panel (Primary Stream), Right Sidebar (Contextual Metadata).
- **Grid Categories**: [Latest], [Technology], [Politics], [Culture] as persistent top headers.
- **The Broadcast Loop**: Persistent mini-player with waveform visualization.

### News Detail (The Deep Dive)
- **Metadata Bar**: High-contrast labels for Category, Source, and Paraphrase Transparency Tag.
- **Story Body**: Paraphrased narrative with "Key Takeaways" summary.
- **Playback Console**: Tabular numerals for duration, speed control, and regional voice toggle.
- **Contextual RAG Zone**: Related historical stories or "Deep Context" explainers.

---

## 3. Library & Navigation
- **Search Center**: Semantic search with "Voice Input" primary CTA. Filter grid by Date/Relevance/Source.
- **Discover Matrix**: A modular grid of trending voices, podcasts, and "Radio Garden" live stations.
- **Offline Library**: Precision list of cached audio files with storage usage meter.
- **Saved / Bookmarks**: Grid cells for archived stories with bulk management tools.

---

## 4. User Profile & Preferences
- **Account Panel**: Identity management, subscription status, and activity metrics.
- **Voice Studio**: Selection matrix for localized accents (Pidgin, Yoruba, Hausa, Igbo).
- **System Settings**: High-contrast / Dark-mode toggle, Data-usage limits, Notification haptics.
- **Accessibility Console**: Display density controls, font scaling (Space Grotesk tuning), voice-gestural UI setup.

---

## 5. Admin & Curation Dashboard (Desktop Only)
- **Operation Hub**: Real-time user metrics, content ingest volume, and system health.
- **Curation Console**: AI summary review panel, paraphrasing adjustment tools, manual override.
- **Voice Management**: TTS performance monitoring, regional voice training status.
- **Moderation Zone**: Fact-checking status (Dubawa API monitoring), community report resolution.

---

## 6. System States & Events (Global)
- **404 / 500 States**: Strictly minimal "System Offline" or "Path Not Found" grid displays.
- **Empty Placeholders**: Grid wireframes indicating "No Content Available."
- **Haptic Alerts**: Specific patterns for content sync success or high-priority breaking news.
- **Maintenance Page**: Technical countdown or "Halt" state display.
