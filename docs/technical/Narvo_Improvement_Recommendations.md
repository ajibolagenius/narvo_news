# Narvo: Changes, Refactoring & Enhancements for Best Improvement

This document outlines recommended changes, refactoring, and enhancements to achieve the best possible improvement of the Narvo codebase. It is based on a full codebase review (backend, frontend, tests, docs, PWA).

---

## 1. Backend Architecture & Duplication

**Issue:** `server.py` is ~1,650 lines and defines 45+ endpoints. Modular routers exist but are only partly used; some route modules are never mounted and `server.py` reimplements the same concerns.

- **`routes/news.py` and `routes/briefing.py` are not mounted** in `server.py`. All news/briefing traffic is served by inlined logic in `server.py`, so the router layer and `news_service`/`briefing_service` are underused or inconsistent.
- **Two RSS feed sources:** `server.py` uses a small `RSS_FEEDS` list (7 feeds); `news_service.py` uses a larger, different `RSS_FEEDS` (30+). `/api/sources` and `/api/sources/health` use `news_service`, while `/api/news`, `/api/news/breaking`, `/api/news/{id}`, `/api/search`, `/api/trending` use the inlined logic and the smaller list. That’s inconsistent data and dead/duplicate code.
- **Admin:** `routes/admin.py` is mounted and delegates to `admin_service`. `server.py` also defines `/api/admin/*` endpoints with different (mock) responses. Whichever is registered last wins; the other is redundant and confusing.

### Recommendations

1. **Single source of truth for news:**
   - Mount `routes/news.py` in `server.py`.
   - Remove from `server.py`: inlined RSS fetching, `fetch_rss_feed`, `generate_news_id`, `extract_category`, `extract_tags`, and all `/api/news`, `/api/news/breaking`, `/api/news/{id}`, `/api/search`, `/api/trending` handlers.
   - Use one RSS config: prefer `news_service.RSS_FEEDS` and delete the duplicate list in `server.py`.

2. **Single source for briefing:**
   - Mount `routes/briefing.py`.
   - Remove from `server.py` all briefing-related endpoints and any duplicate briefing logic.

3. **Admin:**
   - Keep only one set of admin routes. Prefer `routes/admin.py` + `admin_service`. Remove duplicate `/api/admin/*` definitions from `server.py`.

4. **Leave in `server.py` only:**
   - App creation, CORS, DB/client setup, router includes.
   - Endpoints that have no router yet (e.g. `/api/health`, `/api/tts/generate`, `/api/voices`, `/api/regions`, `/api/categories`, `/api/share`, `/api/og`, etc.) **or** move those into new routers (e.g. `routes/tts.py`, `routes/config.py`, `routes/share.py`) and keep `server.py` thin.

5. **Move shared models and helpers out of `server.py`:**
   - Put Pydantic models in e.g. `backend/models/schemas.py`.
   - Put helpers like `generate_news_id` / `extract_category` either in `news_service` or a small `utils` module so `server.py` doesn’t own business logic.

Result: one place per concern, no duplicate routes, one RSS source, and a much smaller `server.py`.

---

## 2. Missing API: Push Notifications

**Issue:** Frontend `notificationService.js` calls:

- `POST /api/notifications/subscribe`
- `POST /api/notifications/unsubscribe`

These endpoints **do not exist** in the backend, so push subscription will always fail.

### Recommendations

1. Add a `routes/notifications.py` router and implement:
   - `POST /api/notifications/subscribe` – accept subscription payload (e.g. from `PushManager.subscribe()`), validate and store (e.g. in MongoDB or Supabase) keyed by user/session.
   - `POST /api/notifications/unsubscribe` – remove stored subscription.
2. Implement backend push sending (e.g. web-push with VAPID) when you have “breaking news” or other events, and call it from your existing breaking-news or notification flow.
3. Document required env (e.g. `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`) and add a short section in PRD/docs.

---

## 3. Frontend API Layer and Env

**Issue:**

- Every page/context that talks to the backend defines `const API_URL = process.env.REACT_APP_BACKEND_URL` (or `|| ''`).
- No central API client: no shared base URL, headers, error handling, or retries.
- Inconsistent fallback: e.g. `BreakingNews.js`, `AccessibilityPage.js`, `SystemSettingsPage.js` use `API_URL` without `|| ''`, so a missing env can cause runtime errors.

### Recommendations

1. **Single API module** (e.g. `frontend/src/lib/api.js`):
   - `const API_URL = process.env.REACT_APP_BACKEND_URL || ''` in one place.
   - Export a small client, e.g. `api.get(path)`, `api.post(path, body)` that:
     - Use `fetch` with `API_URL + path`.
     - Set `Content-Type: application/json` where needed.
     - Optionally attach Supabase session (e.g. `Authorization: Bearer token`) for protected routes.
     - Parse JSON and throw on non-2xx or return a typed result.
   - Use this client everywhere instead of raw `fetch(\`${API_URL}/api/...\`)`.
2. **Env contract:**
   - Document that `REACT_APP_BACKEND_URL` is required in dev and production.
   - In the one place you read it, you can log a warning in dev if it’s missing and you might still use `''` for localhost.

---

## 4. Error Handling and Resilience

**Issue:**

- Backend: many endpoints use broad `except Exception` and return empty lists or generic 500s; some errors only `print()`.
- Frontend: many `fetch(...).then(r => r.json()).catch(() => [])` or similar; failures often become silent empty data.

### Recommendations

1. **Backend:**
   - Use structured logging (e.g. `logging.getLogger(__name__)`) instead of `print`.
   - Where you want to hide internals, catch specific exceptions and return a consistent error shape (e.g. `{ "detail": "Search failed" }`) and appropriate status code; avoid swallowing all exceptions.
   - For critical paths (e.g. TTS, briefing generation), log full exception and consider retries or circuit breakers if you call external APIs.
2. **Frontend:**
   - In the central API client, handle non-2xx (and network errors) in one place: e.g. show a toast or set an error state, and optionally rethrow or return `{ error: message }` so callers can show “Failed to load” instead of empty content.
   - Prefer a single pattern (e.g. “all API calls go through `api.*`, which handles errors”) instead of ad-hoc `.catch(() => [])` everywhere.

---

## 5. Documentation vs Implementation

*The technical documentation has been updated to match the current stack and architecture. The following notes and recommendations remain relevant for keeping docs in sync and for future improvements (e.g. central API client, mounted news/briefing routers).*

**Issue:** Previously, `docs/technical/Narvo_Technical_Documentation.md` described a different stack and architecture than the codebase (e.g. Next.js, React Native, Supabase Postgres, pgvector, ElevenLabs, Dubawa API, 5:00 AM sync).

**Reality:** CRA (React), FastAPI, MongoDB, Supabase Auth only, OpenAI TTS, Google Fact Check (with mock), no pgvector or RAG, no described sync. The main technical doc now reflects this.

### Recommendations

1. Update the technical doc to match the current stack: CRA, FastAPI, MongoDB, Supabase Auth, Gemini + OpenAI TTS, Fact Check API, PWA/service worker, IndexedDB.
2. Either remove or clearly mark as “future” the bits about Next.js, React Native, RAG, 5:00 AM sync, ElevenLabs, Dubawa.
3. Add a short “Current architecture” section (services, routes, main flows) and point to `memory/PRD.md` and `backend/server.py` / routers for “single source of truth.”

---

## 6. Testing and Quality

**Issue:**

- Tests live under `backend/tests/` and hit the real API (e.g. `REACT_APP_BACKEND_URL`); no `conftest.py` with a test app fixture.
- Test file names suggest iteration/version coupling (e.g. `test_iteration_*.py`, `test_narvo_v8.py`).
- No frontend unit/integration tests visible; no API contract or E2E tests referenced.

### Recommendations

1. **Backend:**
   - Use FastAPI’s `TestClient` against `app` in tests so the suite doesn’t depend on a running server.
   - Add a `conftest.py` that loads env (or test env), creates `app`, and exposes a `client` fixture.
   - Gradually rename or regroup tests by feature (e.g. `test_news.py`, `test_briefing.py`, `test_admin.py`) instead of iteration numbers.
2. **Coverage:**
   - Add tests for the new notification endpoints and for critical paths (news aggregation, TTS, briefing generation, fact-check) so refactors don’t regress.
3. **Frontend:**
   - Introduce a minimal test setup (e.g. Jest + React Testing Library) and test the API client and one or two critical flows (e.g. login, load dashboard).
   - Optionally add a single E2E (e.g. Playwright) for “open app → load news → play audio” to protect the main user journey.

---

## 7. Security and Configuration

**Issue:**

- CORS is `allow_origins=["*"]` (acceptable for public API but not ideal if you have a known frontend origin).
- No `.env.example`; required env vars are only implied by code.

### Recommendations

1. Restrict CORS in production: e.g. `allow_origins=[os.environ.get("FRONTEND_ORIGIN", "https://your-app.com")]` and keep `["*"]` only for dev.
2. Add `.env.example` (backend and frontend) listing all required variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `MONGO_URL`, `DB_NAME`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `REACT_APP_BACKEND_URL`, etc., with short comments. Do not commit real secrets.
3. Ensure any key used for push (VAPID) or TTS is only in env and never logged or exposed in API responses.

---

## 8. PWA and Offline

**Issue:**

- Service worker caches static assets and uses network-first for navigation; API calls are explicitly not cached (`url.pathname.startsWith('/api/')`), which is correct.
- No evidence of cache invalidation/versioning strategy when you deploy new JS/CSS (beyond `CACHE_NAME = 'narvo-cache-v2'`).

### Recommendations

1. Tie `CACHE_NAME` (or SW version) to build output (e.g. `narvo-cache-${process.env.REACT_APP_BUILD_ID || 'v2'}`) so each deploy gets a new cache and clients don’t stick on old bundles.
2. In the SW, on `activate`, delete caches that are not the current version (you already delete old `narvo-*` caches; keep that pattern).
3. If you add offline article or audio caching, document the strategy (e.g. “cache first for /offline/*” or “cache TTS by URL”) in PRD or technical docs.

---

## 9. Prioritized Order of Work

| Priority | Action | Impact |
|----------|--------|--------|
| **P0** | Implement `/api/notifications/subscribe` and `/api/notifications/unsubscribe` | Push notifications work; no silent failures. |
| **P0** | Add central API client and use it everywhere; fix `API_URL` fallback | Fewer runtime errors; consistent errors and one place to add auth/retries. |
| **P1** | Mount `news` and `briefing` routers; remove duplicate endpoints and RSS from `server.py`; single RSS source | Single source of truth, richer feeds, easier to maintain. |
| **P1** | Remove duplicate admin (and any other) route definitions from `server.py` | No confusion; one implementation per route. |
| **P2** | Move models and helpers out of `server.py`; split remaining endpoints into routers | Cleaner architecture; `server.py` as a thin wiring layer. |
| **P2** | Backend: structured logging and consistent error responses; frontend: central error handling in API client | Debuggability and better UX on failures. |
| **P3** | Update technical documentation to match implementation; add `.env.example` and CORS note | Accurate onboarding and safer config. |
| **P3** | Tests with `TestClient`, `conftest.py`, and basic frontend + E2E tests | Safer refactors and deployments. |
| **P4** | PWA cache versioning and CORS tightening for production | Reliable updates and slightly better security. |

---

## Summary

Implementing these will give you: a single, consistent backend structure, working push subscriptions, a maintainable frontend API layer, better error handling and docs, and a test base to support further improvements.
