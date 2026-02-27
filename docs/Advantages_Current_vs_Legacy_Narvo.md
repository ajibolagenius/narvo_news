# Advantages: Current (New) Narvo vs Legacy (v0) Documentation

This document compares the **legacy v0narvo** docs with the **current Narvo** docs and identifies advantages of the current/new version in each category.

---

## 1. Monetisation

| Legacy (v0) | Current (New) | Advantages for current |
|-------------|---------------|-------------------------|
| 10 broad strategies (ads, affiliate, merchandise, crowdfunding, events, API, data insights, ad-free, referral, exclusive content). No implementation path. | **Subscription-led**: Pro (recurring) + Enterprise (contracts); Free as growth tier. | **Single clear revenue model** instead of scattered options. |
| No pricing, no payment stack. | **Concrete pricing bands** (NGN ₦2k–₦5k / USD $4–$10); **payment stack** (Stripe, Paystack, Flutterwave); billing portal, webhooks, tax. | **Actionable pricing and payment infrastructure**; Africa-specific methods. |
| No unit economics. | **Unit economics**: COGS (TTS, translation, fact-check, hosting), LTV:CAC, conversion, churn, ARPU; limits tied to profitability. | **Monetisation is measurable and limit-driven.** |
| No phased plan. | **Phased roadmap**: Limits & tiers → Payment integration → Pro experience → Trials & pricing → Enterprise → Optimisation. | **Clear implementation sequence.** |
| — | **Legal/compliance**: ToS, privacy, tax, refunds. **Subscription Tiers** doc defines Free/Pro/Enterprise features and limits. | **Operational and legal readiness**; tier doc supports gating and upsell. |

---

## 2. Technical

| Legacy (v0) | Current (New) | Advantages for current |
|-------------|---------------|-------------------------|
| Next.js PWA + Node API + Supabase (full stack); many items “to build.” | **Implemented stack**: CRA + FastAPI single repo; MongoDB + Supabase Auth; Gemini, OpenAI TTS, YarnGPT; Google Fact Check. | **Documents what exists**, not only aspirations. |
| “AI summarisation” (GPT/Cohere). | **Broadcast paraphrasing**: Gemini recasts content into **narrative stories**; Truth Tag for transparency. | **Broadcast-grade narrative** and **trust transparency**. |
| Generic schema examples (users, interests, summaries, TTS, bookmarks, analytics). | **Concrete architecture**: backend routers, routes, services; frontend PWA (manifest, sw); env and config. | **Traceable to codebase.** |
| Sprint roadmap (0–6); future roadmap. | **V2 success metrics**: Audio completion rate, Truth Transparency Index, broadcast latency, source fidelity. | **Measurable KPIs** for the current product. |
| — | **Swiss Grid design system**: 1px borders, 10% colour rule, tabular numerals, grid breathing, haptic cues. | **Strict design constraint** that reduces bloat and supports “technical instrument” positioning. |
| — | **Pipeline clarity**: Ingest → Paraphrase & translate → Fact-check & Truth Tag → TTS; Predictive pre-cache (5:00 AM) on roadmap. | **Clear production pipeline** with trust and latency in mind. |

---

## 3. Project / Product

| Legacy (v0) | Current (New) | Advantages for current |
|-------------|---------------|-------------------------|
| “Smart news summarisation” and “voice-first.” | **Broadcast paradigm**: “Precision-engineered news”; “The News, Refined.” | **Stronger product identity** (broadcast entity, not just summariser). |
| Problem–solution table (generic). | **V2 problem–solution table**: Information distrust → Paraphrasing + fact-check; Visual fatigue → Swiss Grid; Cultural disconnect → Hi-fi TTS; Technical bloat → Minimalism + single repo. | **Problems mapped to actual features and constraints.** |
| Broad design language (Electric Blue, Coral, glass-morphism). | **Swiss Grid**: 10% rule, visible grid, Space Grotesk/Inter, haptic alerts. | **Design language aligned with technical, low-noise positioning.** |
| Content strategy as source types + curation. | **Pipeline + trust**: Ingest → Translate & paraphrase → Contextual RAG (roadmap) → Broadcast; fact-check and source attribution. | **Content strategy is part of the broadcast pipeline and trust layer.** |
| Same opportunities, competitors, risk, funding. | Same strategic opportunities + **Contextual RAG**, **single-repo**, **predictive caching**; grant targets and competitive matrix retained; link to Technical doc. | **Technical and roadmap details explicit**; one source of truth with cross-links. |

---

## 4. Pitch / Fund

| Legacy (v0) | Current (New) | Advantages for current |
|-------------|---------------|-------------------------|
| “Smart News Summaries, Powered by Voice”; feature list (bento grid, pill picker, etc.). | **“The News Broadcast, Reimagined”**; **pivot narrative**: summariser → **Broadcast Entity**. | **Clear pivot story** for investors. |
| Product demo = summaries, interest picker, voice, offline, bento. | **Demo = Swiss Grid, Paraphrased stories, Broadcast Loop, Voice preference (local accents).** | **Differentiation** (narrative + design + broadcast loop). |
| Competitive table: Narvo vs Traditional News vs TTS Apps. | **V2 vs Generic Aggregators vs Radio/TV**: AI paraphrasing, Swiss Grid UI, local TTS, Contextual RAG (roadmap). | **Competitive frame** matches actual product. |
| £80k ask; 60-second script; one-pager; grant list (GNI, UNESCO, Microsoft, GSMA, Google, MDIF). | Same **£80k ask**; one-pager with **“The Pivot”** and **single-repo strategy**; technical implementation stated (CRA, FastAPI, Gemini, TTS). | **Technical credibility** and consistent ask; grant details live in Project doc. |

---

## 5. News Delivery Pipeline

| Legacy (v0) | Current (New) | Advantages for current |
|-------------|---------------|-------------------------|
| High-level pipeline: Ingestion → AI → Voice → Delivery; UX flow; example TypeScript classes; metrics. | **News-as-a-Service (NaaS)**: Service layer with **Ingestion, Enrichment, Delivery, Trust** pillars. | **Pipeline is a product** (NaaS), not only an internal flow. |
| Sources and steps described in prose. | **Capabilities with status**: Current vs Proposed per pillar (feeds, health, narrative, translation, TTS, fact-check, briefing, REST, audio, Truth Tag, etc.). | **Implementable checklist** and clear current state. |
| — | **API surface documented**: routes (news, TTS, paraphrase, translation, fact-check, briefing, discover, user, admin, share/OG); auth note (app vs future API keys). | **Concrete technical surface** for integration and NaaS roadmap. |
| — | **Consumption models**: App (current); Public/partner API, white-label, embedded player, bulk export (proposed). **Tier alignment**: Free/Pro/Enterprise and API access. | **Path to external API and Enterprise**; aligned with monetisation. |
| — | **Roadmap**: Document API → API keys → Rate limits → Usage metering → Public docs → Webhooks → RSS/feed → SLA/support. | **Clear path from app backend to full NaaS.** |

---

## 6. Landing Page

| Legacy (v0) | Current (New) | Advantages for current |
|-------------|---------------|-------------------------|
| Multiple copy variants (generic hero, Afro-NeoMono, Modern Flat, Rakenta); several “How it works” and African-identity sections. | **Single on-brand doc**: Swiss Grid; “THE LOCAL PULSE, REFINED”; modules: Station (dashboard), Voice Studio, Truth Protocol. | **One coherent voice** and **alignment with product** (broadcast + Swiss Grid). |
| CTAs: “Start Listening,” “Open in Browser,” “How It Works.” | **CTAs**: “Join the Broadcast,” “Oya, Play,” “Start Your Broadcast Now”; status line: `SYSTEM_READY: 100% // ALL_STATIONS_ACTIVE`. | **Technical credibility** and **local flavour** without generic SaaS tone. |
| Benefit blocks (empowerment, effortless, inclusive). | **Structured modules** with headers (e.g. `01. THE STATION // CENTRAL_OPS`), metrics (`AUDIO_OUTPUT: OPTIMIZED // LATENCY: <50ms`), Truth Protocol and verification. | **Differentiation** via broadcast/instrument framing and trust. |
| Newsletter, footer links, “Proudly Made in Nigeria.” | **Footer**: version (`v2.0.0_SILVER_PULSE`), locations (Lagos, Abuja, Zurich). | **Consistent system branding** and scale signal. |

---

## Summary Table

| Category | Main advantage of current vs legacy |
|----------|-------------------------------------|
| **Monetisation** | Subscription-led model with pricing, payments, unit economics, phases, and tier doc. |
| **Technical** | Implemented stack, broadcast paraphrasing, Truth Tag, Swiss Grid, and measurable V2 metrics. |
| **Project** | Broadcast paradigm, V2 problem–solution map, Swiss Grid, and pipeline/trust integration. |
| **Pitch / Fund** | Pivot narrative, technical credibility, and differentiated feature set (paraphrasing, grid, RAG roadmap). |
| **News pipeline** | NaaS definition with pillars, status, API surface, consumption models, and roadmap to full API. |
| **Landing page** | Single coherent, on-brand copy with broadcast/instrument framing and trust (Truth Protocol). |

---

*Legacy references: `v0narvo/data/docs/` (Narvo_monetization_strategies, Technical_Documentation, Project_Documentation, Pitch_Fund, News_Delivery_Pipeline, Landing_Page_Strategy). Current docs: `narvo/docs/` (business/, technical/, design/).*
