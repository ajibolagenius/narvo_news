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

## 3. Rust for Performance: Feasibility and Where It Helps

**Feasibility:** Yes, but in **targeted** places. The stack is React (frontend) + FastAPI (backend). Rust can be used as (a) **WebAssembly (WASM)** in the browser, or (b) **native services/libraries** called from the backend or from a separate process.

**Where Rust would help:**

| Area | Current | Rust option | Benefit |
|------|--------|-------------|--------|
| **RSS / feed parsing** | Python (feedparser, httpx) in `news_service`, `server.py`. | Rust crate (e.g. `feed-rs`) in a small **native library** or **microservice**; FastAPI calls it via FFI or HTTP. | Faster, safer parsing under load; lower CPU for 39+ feeds. |
| **Audio transcoding / chunking** | Backend streams or returns base64; frontend uses blob in IndexedDB. | Optional Rust **CLI or library** for normalising format, trimming silence, or chunking for adaptive streaming. | Better mobile playback and storage use if you add streaming or format conversion. |
| **Search / filtering** | In-memory or MongoDB queries (e.g. search in `server.py`). | **Tantivy** (Rust) or **Rust + WASM** for client-side search over cached headlines. | Faster full-text search on large sets; offline search in PWA. |
| **Heavy JSON / schema validation** | Pydantic in FastAPI. | Rust **validator** for high-throughput endpoints (e.g. webhook ingestion); call from Python via subprocess or HTTP. | Higher throughput for future webhooks or bulk ingest. |
| **Cryptography / signing** | Likely Python (e.g. JWT, env secrets). | Rust for **signing webhook payloads** or **key derivation** if you add partner APIs. | Constant-time crypto, smaller attack surface. |
| **Frontend hot path** | React + JS (audio queue, list rendering). | **Rust → WASM** for very hot paths only: e.g. **audio buffer processing**, **large list sorting/filtering** (thousands of items). | Smoother scrolling and less main-thread work; only if profiling shows JS as the bottleneck. |

**Recommendation:**  
- **Short term:** Keep the current stack; optimise Python (async, connection pooling, caching).  
- **Medium term:** Introduce Rust for **feed parsing** or **search** as a sidecar or library called from FastAPI.  
- **Optional:** Use **WASM** only where profiling shows a clear frontend CPU bottleneck (e.g. client-side search over cached news).

**Risks:** Build and deployment complexity, team familiarity, and debugging across language boundaries. Prefer a single, well-scoped Rust component (e.g. “feed-ingest service”) rather than rewriting the whole backend.

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

## 5. Summary

| Question | Summary |
|----------|---------|
| **1. Web APIs for PWA** | Add **Network Information**, **Battery**, **Screen Wake Lock**, **Page Visibility**, **Background Sync**, **Storage Manager**, **Content Index**, and **Badging** to improve mobile data usage, battery, playback UX, offline reliability, and discoverability. |
| **2. Where to use them** | **Dashboard**, **Discover**, **Offline**, **News Detail**, **Briefing**, **useAudioPrefetch**, **Daily Digest**, and **SW**; **Storage** and **Content Index** on Offline; **Badging** in app shell or SW. |
| **3. Rust** | **Feasible** as a library or microservice for feed parsing, search, or crypto; optional **WASM** for frontend hot paths. Start with one scoped component (e.g. feed ingest) rather than full rewrite. |
| **4. AI / agents for NaaS** | **Training:** narrative/style, TTS/voice, claim detection, topic tagging, translation. **Agents:** ingestion, enrichment, delivery, support/chat, quality/guardrails; use existing NaaS APIs as tools and Python (or LangGraph) for orchestration. |

References: [Narvo_News_as_a_Service.md](../business/Narvo_News_as_a_Service.md), [memory/PRD.md](../../memory/PRD.md), [Web API docs](https://developer.mozilla.org/en-US/docs/Web/API).
