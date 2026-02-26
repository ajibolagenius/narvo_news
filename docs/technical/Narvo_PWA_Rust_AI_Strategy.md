# Narvo: Web APIs for PWA, Rust Feasibility, and AI/NaaS Strategy

This document answers four questions based on a review of the Narvo codebase and `/docs`: (1) Web APIs to enhance the PWA mobile experience, (2) where to integrate them, (3) feasibility of Rust for performance, and (4) strategies for AI model training and agent creation in the News-as-a-Service (NaaS) context.

---

## 1. Web APIs to Integrate for PWA Mobile Experience

Narvo already uses several [Web APIs](https://developer.mozilla.org/en-US/docs/Web/API): **Service Worker**, **Cache**, **IndexedDB**, **Media Session**, **Notifications**, **Push** (via `PushManager`), **localStorage**, **navigator.vibrate**, **navigator.share**, **Clipboard**, **requestIdleCallback**, and **matchMedia**. The following additions would meaningfully improve the **mobile** PWA experience.

| Web API | Purpose | Enhancement |
|--------|---------|-------------|
| **Network Information API** (`navigator.connection`) | Expose effective type (e.g. `4g`, `3g`, `slow-2g`), downlink, saveData. | Prefetch fewer items on slow/save-data; show “Data saver” hint; adjust quality or disable auto-download. |
| **Battery Status API** (`navigator.getBattery()`) | Read charging state and level. | On low battery, reduce prefetch, prompt to “Download for offline later”; optional “Low power mode” that defers non-critical requests. |
| **Screen Wake Lock** (`navigator.wakeLock`) | Prevent screen from dimming during playback. | Keep screen on while listening on News Detail / Briefing / Discover so controls stay visible without touch. |
| **Page Visibility API** (`document.visibilityState`) | Detect when tab/app is in background. | Pause prefetch when tab is hidden; resume when visible; optionally pause or resume audio when app is backgrounded (in addition to Media Session). |
| **Background Sync** (`ServiceWorkerRegistration.sync`) | Register a sync task that runs when connectivity returns. | After offline actions (e.g. save for offline, queue digest), register `sync` so the SW can retry when back online; improves reliability of “save for later” and digest delivery. |
| **Periodic Background Sync** (if available) | Run periodic tasks in the SW. | Optional: refresh top stories or digest content in the background (subject to browser limits and permission). |
| **Storage Manager** (`navigator.storage` / `navigator.storage.estimate()`) | Estimate quota and usage. | Show “Storage used / available” on Offline page; warn before bulk download if space is low; support `persistent` storage where supported. |
| **Content Index API** (`index.add()`) | Index offline articles for OS-level search. | Let users find cached articles from the browser’s offline content list (e.g. Chrome’s “Downloaded” section). |
| **Badging** (`navigator.setAppBadge()`) | Set app icon badge count. | Show unread breaking/digest count on the PWA icon when appropriate. |
| **Contact Picker** (optional) | Let user pick a contact to share with. | Optional “Share with contact” from Dashboard/News Detail when `navigator.share` is used with a contact. |
| **Geolocation** (optional, with consent) | Get approximate location. | Optional “Local news near you” or region prefill; must be opt-in and privacy-respecting. |

---

## 2. Features and Pages for These APIs

| API | Primary feature / page | Secondary use |
|-----|------------------------|----------------|
| **Network Information** | **Dashboard** (prefetch limit, “Data saver” banner); **Discover** (limit “Download all” or show warning on slow); **Offline** (suggest saving when on Wi‑Fi). | **AudioContext / useAudioPrefetch**: reduce prefetch count when `effectiveType === '2g'` or `saveData === true`. |
| **Battery** | **News Detail**, **Morning Briefing**, **Discover** (when playing long audio). Optionally **Offline** (“Download when charged” or “Low battery – reduced prefetch”). | Global: disable or throttle prefetch when battery low and not charging. |
| **Screen Wake Lock** | **News Detail**, **Morning Briefing**, **Discover** (while audio is playing). | Request wake lock on play; release on pause/stop. |
| **Page Visibility** | **Dashboard**, **useAudioPrefetch**. | Pause prefetch when `document.hidden`; optionally adjust playback (e.g. pause when hidden if policy desired). |
| **Background Sync** | **Offline** (save-for-offline), **Daily Digest** (subscribe/refresh). | SW: on `sync` event, retry failed POSTs (e.g. `/api/offline/save`, notification subscribe) from IndexedDB queue. |
| **Periodic Background Sync** | **Dashboard** or dedicated “Digest” flow. | SW: periodic task to fetch `/api/news?limit=10` or digest payload and update caches. |
| **Storage Manager** | **Offline** page. | Show “X MB used / Y MB available”; call `navigator.storage.persist()` if you want to request persistent storage. |
| **Content Index** | **Offline** (when saving articles). | When an article is cached for offline, call `index.add()` with title, URL, description; remove on delete. |
| **Badging** | **App shell** (e.g. **DashboardLayout** or SW). | When breaking/digest count is known, call `navigator.setAppBadge(count)`; clear when user opens app or reads. |
| **Geolocation** | **Onboarding** or **Settings**. | Optional “Use my location for local news”; pass region to `/api/news` or search. |

---

## 3. Rust and Go: Feasibility, Where Each Helps, and Integration

**Feasibility:** Yes, in **targeted** places. The stack is React (frontend) + FastAPI (backend). **Rust** can be used as (a) **WebAssembly (WASM)** in the browser, or (b) **native services/libraries** called via HTTP or FFI. **Go** can run as **HTTP/gRPC microservices** alongside FastAPI. **Rust and Go can be integrated** in the same architecture: each language runs in its own process and communicates over HTTP or gRPC.

### 3.1 Where Rust helps

| Area | Current | Rust option | Benefit |
|------|--------|-------------|--------|
| **RSS / feed parsing** | Python (feedparser, httpx) in `news_service`, `server.py`. | Rust crate (e.g. `feed-rs`) in a small **service** or **library**; FastAPI or Go calls it via HTTP or FFI. | Faster, safer parsing under load; lower CPU for 39+ feeds. |
| **Audio transcoding / chunking** | Backend streams or base64; frontend uses blob in IndexedDB. | Optional Rust **CLI or library** for normalising format, trimming silence, or chunking for adaptive streaming. | Better mobile playback and storage if you add streaming or format conversion. |
| **Search / filtering** | In-memory or MongoDB queries. | **Tantivy** (Rust) or **Rust + WASM** for client-side search over cached headlines. | Faster full-text search; offline search in PWA. |
| **Heavy JSON / schema validation** | Pydantic in FastAPI. | Rust **validator** for high-throughput webhook ingest; call via HTTP. | Higher throughput for future webhooks. |
| **Cryptography / signing** | Python (e.g. JWT, env secrets). | Rust for **signing webhook payloads** or **key derivation** (partner APIs). | Constant-time crypto, smaller attack surface. |
| **Frontend hot path** | React + JS. | **Rust → WASM** for hot paths only: audio buffer work, large list sort/filter. | Less main-thread work if profiling shows JS bottleneck. |

### 3.2 Where Go helps

| Area | Current | Go option | Benefit |
|------|--------|-----------|--------|
| **Feed ingestion / orchestration** | Python fetches and parses in `news_service`. | **Go service**: HTTP client pool, fetch 39+ feeds concurrently, call Rust parser (or own parser), return normalised items. | Simple concurrency, single binary, fast rollout. |
| **Webhooks / delivery** | Not yet implemented. | **Go service**: receive webhook events, validate signature (or call Rust signer), fan-out to subscribers. | Good fit for I/O-bound, many connections. |
| **Health / readiness probes** | FastAPI `/api/health`. | Optional **Go sidecar** for aggressive health checks (e.g. feed ping, DB ping) and metrics. | Offload from main API. |

### 3.3 Integrating Rust and Go (and Python)

Yes, **Rust and Go can be integrated** in the same system. Typical patterns:

| Pattern | Description | Example in Narvo |
|---------|-------------|------------------|
| **Side-by-side services** | Rust and Go each run as separate processes; both are called by FastAPI (or by each other) over **HTTP** or **gRPC**. | FastAPI → Go feed-ingest service (HTTP); Go → Rust parse service (HTTP) for raw XML → JSON. |
| **Go calls Rust** | Go microservice calls a **Rust HTTP/gRPC service** for CPU-heavy work (parsing, search, crypto). | Go “ingest” service fetches feeds, sends body to Rust “parser” service, gets structured items back. |
| **Rust calls Go** | Less common; use when Rust is the entrypoint and needs Go’s strengths (e.g. Go service that manages long-lived connections). | Rust search service might call a Go “webhook delivery” service to notify subscribers. |
| **Python (FastAPI) orchestrates** | FastAPI remains the main API; it calls **Go** for ingestion/webhooks and **Rust** for parsing/search/crypto as internal or internal-plus-external services. | `GET /api/news` → FastAPI → Go ingest (returns raw or parsed) or FastAPI → Rust parser (raw XML → JSON). |

**Suggested integration layout:**

```
[PWA / clients]
       │
       ▼
[FastAPI]  ──HTTP──► [Go: feed ingest / webhooks]  ──HTTP──► [Rust: feed-rs parser]
       │                                                              │
       └──HTTP──► [Rust: search / crypto / sign]                     (optional)
       │
       ▼
[MongoDB / Supabase / external APIs]
```

- **Go:** Feed fetch + orchestration, webhook receiver, optional health sidecar.  
- **Rust:** Parsing (feed-rs), full-text search (Tantivy), crypto/signing, or WASM in the frontend.  
- **FastAPI:** Main app and NaaS API; delegates to Go or Rust where it pays off.

**Integration mechanics:**

- **HTTP:** Simple REST or JSON over HTTP; every language has clients. Use for Go ↔ Rust, FastAPI ↔ Go, FastAPI ↔ Rust.  
- **gRPC:** More efficient if you have many internal calls; need `.proto` and codegen for each language. Optional once you have more than a couple of services.  
- **Deployment:** Run each service in its own container (e.g. Docker); same cluster or same host. FastAPI config (e.g. env) holds URLs for Go and Rust services.

### 3.4 Recommendation

- **Short term:** Keep the current stack; optimise Python (async, connection pooling, caching).  
- **Medium term:** Introduce **Go** first for a **feed-ingest** or **webhook** service (quick to ship, one binary). Add **Rust** where you need maximum CPU efficiency: **parsing** (called by Go or FastAPI), **search** (Tantivy), or **WASM** in the PWA.  
- **Integration:** Use **HTTP** between FastAPI, Go, and Rust; prefer a single Go service and a single Rust service to start, then expand by responsibility.

**Risks:** Build/deploy complexity, cross-language debugging, and operability (logging, tracing, env). Mitigate with clear service boundaries, structured logs, and one deployment unit per language (e.g. one Go binary, one Rust binary).

---

## 4. AI Model Training and Agent Creation for NaaS

Per [Narvo_News_as_a_Service.md](../business/Narvo_News_as_a_Service.md), NaaS is the service layer that **ingests** (RSS, health), **enriches** (narrative, translation, TTS, fact-check, briefing), and **delivers** (REST, audio, future webhooks/RSS) to the PWA and to API consumers. Strategies for **AI model training** and **agent creation** in this context:

### 4.1 Model training strategies

| Goal | Strategy | How it supports NaaS |
|------|----------|------------------------|
| **Better broadcast narrative** | Fine-tune or prompt-optimise a **language model** (e.g. Gemini) on Narvo-style summaries: short, neutral, “broadcast” tone, key takeaways. | Improves quality of the **Enrichment** pillar; consistent style across stories and API. |
| **Native-sounding TTS** | Use **YarnGPT** (or similar) for Nigerian languages; optional **voice cloning / fine-tuning** on approved clips for a branded “Narvo” voice. | Improves **Delivery** (audio) and differentiates NaaS from generic TTS. |
| **Fact-check / claim detection** | Train or fine-tune a **claim-detection** or **NLI** model on (claim, source, verdict) so you can score or route stories before calling Google Fact Check. | Improves **Trust** pillar and reduces dependency on a single external API. |
| **Topic / category tagging** | Train a small **classifier** (or few-shot Gemini) on Narvo’s categories (Politics, Economy, Tech, etc.) using existing headlines/summaries. | Improves **Ingestion** (auto-tagging, filtering) and **Delivery** (better search and filters for API consumers). |
| **Low-resource translation** | Continue with **Gemini** for Pidgin/Yoruba/Hausa/Igbo; optionally **adapt** a generic model on Narvo’s own parallel data (EN ↔ local) from corrections or post-edits. | Better **Enrichment** and **Delivery** for African-language API outputs. |

**Data sources:**  
- Internal: logs of narrative/TTS/translation inputs and outputs, user feedback (e.g. “Report” or “Wrong language”).  
- Curated: human-edited “gold” narratives and translations for fine-tuning or evaluation.  
- External: public fact-check datasets, news category corpora (with licence checks).

### 4.2 Agent creation strategies

| Agent type | Role | Implementation idea | NaaS relevance |
|------------|------|----------------------|----------------|
| **Ingestion agent** | Monitor feeds, dedupe, prioritise, tag. | Orchestrator (e.g. Python or LangGraph) that calls RSS parser, topic model, and health checks; emits normalised items. | Feeds the **Ingestion** pillar; can expose “pipeline status” to Enterprise. |
| **Enrichment agent** | Chained narrative → translation → TTS (or fact-check). | Multi-step agent: fetch story → generate narrative (Gemini) → translate if needed → call TTS; optionally fact-check in parallel. | Implements the **Enrichment** pipeline; same flow for PWA and API. |
| **Delivery agent** | Route content to the right consumer (app, webhook, RSS). | After enrichment, agent decides destination (e.g. “push to PWA”, “send webhook”, “update RSS feed”); uses rules or a small classifier. | Implements **Delivery** and future webhooks/RSS. |
| **Support / chat agent** | Answer user or partner questions about stories, sources, or API. | RAG over docs + recent headlines; Gemini (or similar) with citations; optional “Ask about this story” in PWA. | Improves UX and partner onboarding; can be an **add-on** for NaaS (e.g. Enterprise). |
| **Quality / guardrail agent** | Check narrative for bias, toxicity, or off-brand tone. | Lightweight model or rules that score output before delivery; block or flag for human review. | Supports **Trust** and compliance for NaaS. |

**Tool use:**  
Agents can call **existing NaaS APIs** as tools: e.g. “get_news”, “translate”, “generate_tts”, “fact_check”. That keeps a single implementation and lets agents compose services for higher-level tasks (e.g. “briefing generation” = get_news → narrative → TTS).

**Orchestration:**  
Use **LangGraph**, **AutoGen**, or a simple **state machine** in Python to chain ingestion → enrichment → delivery, with retries and logging. This fits the current FastAPI backend and can be extended for Enterprise (e.g. custom pipelines per tenant).

---

## 5. Implementation phasing: Now vs future

| Phase | What to implement | Rationale |
|-------|-------------------|-----------|
| **Now (current / near term)** | **Web APIs (frontend only):** **Screen Wake Lock** (playback), **Page Visibility** (pause prefetch when tab hidden), **Storage Manager** (show “X MB used” on Offline page). Optional: **Network Information** for “Data saver” hint and prefetch limits. **Backend:** Keep FastAPI + Python; optimise async, connection pooling, caching. **AI:** No new training or agents; keep existing Gemini/narrative/TTS. | Low effort, no new services; improves mobile playback and offline UX immediately. Rust/Go and new AI agents add operational and build complexity—defer until needed. |
| **Future (backlog / roadmap)** | **Web APIs:** **Battery**, **Background Sync**, **Content Index**, **Badging**, **Periodic Background Sync**; optionally **Contact Picker**, **Geolocation** when product decides. **Rust/Go:** Introduce **Go** for feed-ingest or webhook service when scaling or partner APIs justify it; add **Rust** for parsing/search/crypto when CPU or security becomes a bottleneck. **AI:** Model training (narrative style, TTS/voice, fact-check, topic tagging, translation); agents (ingestion, enrichment, delivery, support/chat, quality/guardrails) as NaaS and Enterprise features mature. | These depend on product priorities, scale, or new capabilities (webhooks, Enterprise); implement when the payoff is clear. |

**Summary:** Implement **now** the PWA Web API wins (Wake Lock, Page Visibility, Storage Manager, optionally Network Information) and Python optimisations; treat **Rust/Go integration**, **extra Web APIs** (Battery, Background Sync, Content Index, Badging, etc.), and **AI training/agents** as **future** work.

---

## 6. Summary

| Question | Summary |
|----------|---------|
| **1. Web APIs for PWA** | Add **Network Information**, **Battery**, **Screen Wake Lock**, **Page Visibility**, **Background Sync**, **Storage Manager**, **Content Index**, and **Badging** to improve mobile data usage, battery, playback UX, offline reliability, and discoverability. |
| **2. Where to use them** | **Dashboard**, **Discover**, **Offline**, **News Detail**, **Briefing**, **useAudioPrefetch**, **Daily Digest**, and **SW**; **Storage** and **Content Index** on Offline; **Badging** in app shell or SW. |
| **3. Rust and Go** | **Both feasible and integrable.** Run as separate services over HTTP (or gRPC). **Go:** feed ingest, webhooks, health. **Rust:** parsing (feed-rs), search (Tantivy), crypto, or WASM. FastAPI orchestrates; start with one Go and one Rust service, then expand. |
| **4. AI / agents for NaaS** | **Training:** narrative/style, TTS/voice, claim detection, topic tagging, translation. **Agents:** ingestion, enrichment, delivery, support/chat, quality/guardrails; use existing NaaS APIs as tools and Python (or LangGraph) for orchestration. |
| **5. Phasing** | **Now:** Wake Lock, Page Visibility, Storage Manager, optional Network Information; Python optimisations. **Future:** Battery, Background Sync, Content Index, Badging, Rust/Go services, AI training and agents. See **§5 Implementation phasing**. |

References: [Narvo_News_as_a_Service.md](../business/Narvo_News_as_a_Service.md), [memory/PRD.md](../../memory/PRD.md), [Web API docs](https://developer.mozilla.org/en-US/docs/Web/API).
