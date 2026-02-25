# Narvo: News-as-a-Service (NaaS)

This document outlines **Narvo as a News-as-a-Service** offering: a programmable, audio-first news layer that ingests, enriches, and delivers broadcast-grade content to the Narvo app and to third-party consumers (publishers, apps, and enterprises). It complements [Narvo_Product_Concept.md](./Narvo_Product_Concept.md), [Narvo_Subscription_Tiers.md](./Narvo_Subscription_Tiers.md), and [Narvo_Monetisation.md](./Narvo_Monetisation.md).

---

## 1. Definition

**News-as-a-Service (NaaS)** here means:

> Narvo exposes a **service layer** that turns raw news sources into **curated, narrated, translated, and fact-checked** content—delivered as **data** (JSON, RSS) or **audio** (TTS, briefings)—consumable by the Narvo product and by external systems via APIs and defined contracts.

Narvo is not only an end-user app; it is a **broadcast-grade news pipeline** that can power:

- The **Narvo PWA** (primary consumer today).
- **Third-party apps and websites** (embedded player, headlines, audio clips).
- **Newsrooms and publishers** (ingest Narvo narratives, fact-check, or TTS into their CMS).
- **Enterprise and partners** (white-label feeds, API access, SLA).

---

## 2. Service Pillars

The NaaS layer is built on four pillars: **Ingestion**, **Enrichment**, **Delivery**, and **Trust**.

### 2.1 Ingestion

| Capability | Description | Status |
|------------|-------------|--------|
| **RSS aggregation** | Pull from 39+ configured feeds (local, continental, international). | **Current** |
| **Feed health monitoring** | Per-source status (green/amber/red), latency, last_checked. | **Current** |
| **Deduplication & normalisation** | Unique items by title/source; consistent fields (id, title, summary, source, published, region, category). | **Current** |
| **Custom / white-label feeds** | Org-specific or partner RSS lists. | **Proposed** (Enterprise) |

**Output:** Structured news items (JSON) ready for enrichment or direct delivery.

### 2.2 Enrichment

| Capability | Description | Status |
|------------|-------------|--------|
| **Broadcast narrative** | AI (Gemini) turns summary into a short broadcast-style narrative + key takeaways. | **Current** |
| **Translation** | Translate and/or narrate into 5 languages (EN, Pidgin, Yoruba, Hausa, Igbo) with locale-appropriate voices. | **Current** |
| **Text-to-speech (TTS)** | OpenAI TTS via Emergent; voice profiles per language; optional translation before speech. | **Current** |
| **Fact-check / Truth Tag** | Google Fact Check API (with mock fallback); verdict and confidence for claims or story keywords. | **Current** |
| **Morning briefing** | Curated top stories + single script + optional full briefing audio (TTS). | **Current** |

**Output:** Enriched story (narrative, translated text, audio URL, fact-check metadata) for consumption by the app or API.

### 2.3 Delivery

| Capability | Description | Status |
|------------|-------------|--------|
| **REST API** | News list/detail, search, trending, breaking, voices, regions, categories, sources, health. | **Current** (used by Narvo app) |
| **Translation API** | Languages list, quick translate, full translate, translate+narrate. | **Current** |
| **Fact-check API** | Search, verify claim, analyze. | **Current** |
| **TTS API** | POST text + voice + language → audio URL (base64 or stream). | **Current** |
| **Briefing API** | Generate, latest, history, by date, generate audio. | **Current** |
| **Podcast proxy** | Stream podcast audio via backend (CORS-safe). | **Current** |
| **Public / partner API** | Same capabilities with API keys, rate limits, and usage tracking. | **Proposed** |
| **Webhooks** | Notify on new breaking story, daily digest, or feed failure. | **Proposed** |
| **RSS / web feed** | Curated feed (e.g. top 10 in a given language) for external readers. | **Proposed** |

**Output:** Data (JSON) or audio (stream/URL) to the Narvo app or to authorised API consumers.

### 2.4 Trust

| Capability | Description | Status |
|------------|-------------|--------|
| **Truth Tag** | Per-story transparency: narrative source, translation, fact-check result. | **Current** |
| **Source attribution** | Every item has source name and URL. | **Current** |
| **Verification metadata** | Fact-check verdict, confidence, source (or MOCK_FACTCHECK). | **Current** |
| **Audit trail** | Who consumed what, when (for Enterprise). | **Proposed** |

---

## 3. Service Offerings (What Can Be Consumed)

### 3.1 News API

| Offering | Description | Consumers |
|----------|-------------|-----------|
| **List news** | Paginated, filterable by region, category, limit. | App, API (Proposed) |
| **News detail** | Single item by ID; narrative generated on demand if missing. | App, API (Proposed) |
| **Search** | Full-text (title/summary), filters, pagination. | App, API (Proposed) |
| **Breaking news** | Keyword-based subset of recent items. | App, API (Proposed) |
| **Trending** | Tags and topics derived from recent feed. | App, API (Proposed) |
| **Content sources & health** | Metadata for all feeds; live health status. | App, API (Proposed) |

### 3.2 Translation API

| Offering | Description | Consumers |
|----------|-------------|-----------|
| **List languages** | Supported languages and voice mapping. | App, API (Proposed) |
| **Quick translate** | Short text + target lang → translated text. | App, API (Proposed) |
| **Full translate** | Text + options → translated text + metadata. | App, API (Proposed) |
| **Translate + narrate** | Text → translated broadcast narrative. | App, API (Proposed) |

### 3.3 TTS API

| Offering | Description | Consumers |
|----------|-------------|-----------|
| **Generate speech** | Text + voice_id + language → audio URL (or stream). | App, API (Proposed) |
| **Voice profiles** | List of voices (id, name, language, gender). | App, API (Proposed) |

### 3.4 Fact-Check API

| Offering | Description | Consumers |
|----------|-------------|-----------|
| **Search** | Query → fact-check results from Google Fact Check (or mock). | App, API (Proposed) |
| **Verify claim** | Claim text → verdict + confidence. | App, API (Proposed) |
| **Analyze** | Keyword-based quick analysis for a story. | App, API (Proposed) |

### 3.5 Briefing API

| Offering | Description | Consumers |
|----------|-------------|-----------|
| **Generate** | Top stories → script + optional full TTS. | App, API (Proposed) |
| **Latest / history / by date** | Retrieve existing briefings. | App, API (Proposed) |
| **Generate briefing audio** | Script + voice → audio URL. | App, API (Proposed) |

### 3.6 Delivery Formats

| Format | Use case | Status |
|--------|----------|--------|
| **JSON (REST)** | App and API consumers. | **Current** |
| **Audio stream / URL** | TTS, podcast proxy, briefing. | **Current** |
| **RSS / Atom** | Curated feed for external readers or CMS. | **Proposed** |
| **Webhooks** | Push events (breaking, digest, alerts). | **Proposed** |

---

## 4. Consumption Models

| Model | Description | Status |
|-------|-------------|--------|
| **Narvo app (PWA)** | Primary consumer; uses REST API with user auth where needed. | **Current** |
| **Direct API (same origin / internal)** | Backend serves the app; no public API key today. | **Current** |
| **Public / partner API** | External clients with API key; rate limits and usage by key. | **Proposed** |
| **White-label** | Partner or Enterprise gets branded feed/player; may use custom sources. | **Proposed** |
| **Embedded player** | Third-party site embeds Narvo audio player or headline widget. | **Proposed** |
| **Bulk / export** | Scheduled or on-demand export (e.g. CSV, JSON) for analytics or CMS. | **Proposed** (Enterprise) |

---

## 5. Technical Surface (Current)

The service is implemented as a **FastAPI** backend with modular routers. Main surface:

| Area | Prefix / routes | Auth (current) |
|------|------------------|----------------|
| Health | `GET /api/health` | None |
| News | `GET /api/news`, `/api/news/breaking`, `/api/news/{id}`, `/api/search`, `/api/trending` | None |
| Voices / config | `GET /api/voices`, `/api/regions`, `/api/categories` | None |
| Sources | `GET /api/sources`, `/api/sources/health`, `POST /api/sources/health/refresh` | None |
| TTS | `POST /api/tts/generate` | None (per-request) |
| Paraphrase | `POST /api/paraphrase` | None |
| Translation | `GET /api/translate/languages`, `/api/translate/quick`, `POST /api/translate/text`, `/api/translate/narrate` | None |
| Fact-check | `GET /api/factcheck/search`, `/api/factcheck/verify`, `POST /api/factcheck/analyze`, `GET /api/factcheck/{story_id}` | None |
| Briefing | `GET /api/briefing/generate`, `/api/briefing/latest`, `/api/briefing/history`, `/api/briefing/{date}`, `POST /api/briefing/audio` | None |
| Discover | `GET /api/podcasts`, `/api/podcasts/{id}`, `/api/podcasts/{id}/audio`, `/api/radio/*`, `/api/discover/trending` | None |
| User / offline | `GET|POST /api/offline/*`, `/api/bookmarks/*`, `/api/preferences`, `/api/settings/*` | User ID (app) |
| Admin | `GET /api/admin/*` | Internal |
| Share / OG | `GET /api/share/{id}`, `/api/og/{id}` | None |

Today, **auth** is effectively app-origin + user ID for user-specific endpoints; there is **no API-key auth** or public rate limiting. Making this a full NaaS requires **API keys**, **rate limits**, and **usage metering** (see §7).

---

## 6. Commercial and Tier Alignment

| Consumer type | Tier | Service access |
|---------------|------|----------------|
| **Narvo app user (Free)** | Free | Full UI; backend enforces proposed Free limits (TTS, offline, briefing, fact-check). |
| **Narvo app user (Pro)** | Pro | Higher limits; same API surface. |
| **Enterprise (in-app)** | Enterprise | Org-scoped usage; same or extended API. |
| **External API consumer** | Enterprise (or dedicated API plan) | API key; rate limits; optional SLA; usage dashboard. |
| **White-label / partner** | Enterprise | Custom feeds, branding, and support per contract. |

Monetisation of NaaS is covered in [Narvo_Monetisation.md](./Narvo_Monetisation.md) (Pro subscription, Enterprise contracts, optional API licensing). Subscription feature differentiators are in [Narvo_Subscription_Tiers.md](./Narvo_Subscription_Tiers.md).

---

## 7. Roadmap: From App Backend to Full NaaS

| Step | Description | Outcome |
|------|-------------|---------|
| **1. Document public surface** | OpenAPI/Swagger with clear descriptions; mark which routes are stable for external use. | Single source of truth for “NaaS API”. |
| **2. API keys** | Issue keys per tenant (app, partner, Enterprise); validate on requests; log usage per key. | Authenticated, multi-tenant API access. |
| **3. Rate limits** | Apply limits per key (and per user where relevant); return 429 and headers when exceeded. | Fair use and cost control. |
| **4. Usage metering** | Record TTS calls, translation calls, fact-check calls, news requests per key (and per user). | Billing and quotas (Pro/Enterprise). |
| **5. Public API docs** | Developer portal with auth, examples, and tier/limit summary. | Onboarding for API consumers. |
| **6. Webhooks** | Optional delivery of events (e.g. breaking story, digest) to partner URLs. | Push-based integration. |
| **7. RSS / feed export** | Curated RSS or Atom feed (e.g. top N stories, per language) for embedding or CMS. | Low-friction consumption. |
| **8. SLA and support** | Defined uptime and response-time targets for Enterprise; support process. | Enterprise-ready NaaS. |

---

## 8. Summary

| Aspect | Summary |
|--------|---------|
| **What NaaS is** | Narvo’s service layer: ingest → enrich (narrative, translation, TTS, fact-check) → deliver (JSON, audio) to the app and to external consumers. |
| **Pillars** | Ingestion (feeds, health), Enrichment (narrative, translation, TTS, fact-check, briefing), Delivery (REST, audio, future RSS/webhooks), Trust (Truth Tag, attribution). |
| **Current state** | REST API and audio delivery power the Narvo PWA; no public API keys or rate limits; all capabilities exist for app use. |
| **Proposed** | Public/partner API with keys, rate limits, metering, docs, webhooks, RSS, and SLA for Enterprise. |
| **Consumption** | App (current); API consumers and white-label (proposed); aligns with Free/Pro/Enterprise tiers and monetisation. |

For feature limits and tier differentiation, see **[Narvo_Subscription_Tiers.md](./Narvo_Subscription_Tiers.md)**. For revenue and pricing, see **[Narvo_Monetisation.md](./Narvo_Monetisation.md)**.
