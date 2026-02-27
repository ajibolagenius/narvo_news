# API and PWA Versioning — How to Go Forward

This doc describes where versions live, when to bump them, and how to keep API and PWA releases in sync so clients get predictable behavior after deploys.

---

## 1. API versioning (backend)

### 1.1 Where the version is defined

| Location | Purpose |
|----------|---------|
| `backend/server.py` | `FastAPI(title="Narvo API", version="2.0")` — drives OpenAPI `/docs` and `/openapi.json`. |
| `backend/server.py` | Root `GET /` and `GET /api/health` responses include `"version": "2.0"` so clients and monitors can read the running API version. |

Keep these in sync: use a single source of truth so you don’t have to remember multiple places.

**Recommended:** Define once, reuse everywhere:

```python
# At top of backend/server.py (after imports)
API_VERSION = "2.0"
app = FastAPI(title="Narvo API", version=API_VERSION)
# Then in root() and health_check() use API_VERSION in the returned dict.
```

### 1.2 When to bump the API version

| Change type | Bump | Example |
|-------------|------|--------|
| **Breaking** (response shape, removed/renamed fields, required new params) | **Major** (e.g. 2.0 → 3.0) | Remove a field from `/api/news`; change pagination format. |
| **Additive** (new endpoints, new optional fields, new query params) | **Minor** (e.g. 2.0 → 2.1) | New `/api/briefing/summary`; add optional `?lang=` to existing endpoint. |
| **Fixes only** (bug fixes, no contract change) | **Patch** (e.g. 2.0 → 2.0.1) or leave as 2.0 | Fix incorrect calculation; no client change needed. |

For an MVP, many teams use **major.minor** (e.g. 2.0, 2.1) and omit patch unless they need three numbers.

### 1.3 Checklist for an API release

- [ ] Bump version in one place (e.g. `API_VERSION`) and use it in FastAPI app, `GET /`, and `GET /api/health`.
- [ ] If breaking: document in changelog/release notes; consider maintaining backward compatibility for one release cycle or document migration.
- [ ] Deploy backend; confirm `GET /` and `GET /api/health` return the new version.

---

## 2. PWA versioning (frontend)

The PWA has several version-like concepts. Bump the right one for the kind of change you make.

### 2.1 Service worker cache name (critical for fresh deploys)

| File | What to change | When |
|------|----------------|------|
| `frontend/public/sw.js` | `CACHE_NAME = 'narvo-v3'` → e.g. `'narvo-v4'` | **Every frontend deploy** where you want existing clients to drop old caches and fetch new JS/CSS/assets. |

If you don’t bump `CACHE_NAME`, clients may keep using an old cached app shell until they clear site data or the browser evicts the cache. Bumping it on deploy ensures the `activate` handler deletes old caches and new requests use the new name.

**Recommendation:** Tie the name to a version or build, e.g. `narvo-v4` or `narvo-${REACT_APP_BUILD_ID}` if you inject a build id at build time (see [Narvo_Non_Functional_Improvements.md](Narvo_Non_Functional_Improvements.md) §6.1).

### 2.2 Web app manifest (optional but useful)

| File | What to add/change | When |
|------|--------------------|------|
| `frontend/public/manifest.json` | Optional `"version"` or `"version_name"` (e.g. `"2.6"`) for display and stores. | When you want to show a human-readable version in “About” or in store listings. |

Current `manifest.json` does not include a version. If you add one, bump it when you ship a meaningful user-facing release (e.g. match to a release tag or minor version).

### 2.3 IndexedDB schema (audio / offline cache)

| File | What to change | When |
|------|----------------|------|
| `frontend/src/lib/audioCache.js` | `DB_VERSION = 2` → `3`, and in `onupgradeneeded` apply any schema changes. | **Only when the IndexedDB schema changes** (new indexes, new object stores, or breaking changes to stored shape). |

Do not bump `DB_VERSION` on every deploy — only when the structure of stored data changes. Bumping it triggers `onupgradeneeded` and your current logic recreates the store; document any migration if you need to preserve data.

### 2.4 Display version (Settings / About)

| Location | What to change | When |
|----------|----------------|------|
| i18n keys (e.g. `frontend/src/i18n/locales/en.json`: `settings.version`) | String like `"NARVO_SYS // V2.6"` | When you want the in-app “version” label to match a release (e.g. once per sprint or minor release). |

This is for humans only; no automatic behavior depends on it.

### 2.5 Checklist for a PWA release

- [ ] **Every deploy:** Bump `CACHE_NAME` in `frontend/public/sw.js` (e.g. `narvo-v3` → `narvo-v4`) so clients get a new cache and don’t stick on old assets.
- [ ] **Optional:** Bump `version` / `version_name` in `manifest.json` and the i18n “version” string when you tag a release.
- [ ] **Only on schema change:** Bump `DB_VERSION` in `frontend/src/lib/audioCache.js` and implement any migration in `onupgradeneeded`.
- [ ] Build and deploy frontend; test in a clean profile or incognito that the new cache is used and, if applicable, that IndexedDB upgrades correctly.

---

## 3. Coordinating API and PWA

- **Backend and frontend versions can be independent.** The API version (e.g. 2.0) and the PWA “version” (e.g. v4 cache, V2.6 in UI) do not have to match; keep them consistent in your own release process (e.g. “Release 2.6 = API 2.0 + PWA cache v4”).
- **Frontend should tolerate older API.** Avoid hard-coding “I need API 3.0”; where possible, support the current and previous API contract so rolling deploys and slow client updates don’t break users.
- **Health check:** The frontend can call `GET /api/health` and log or display the API `version` for support and debugging.

---

## 4. Quick reference

| What | Where | Bump when |
|------|--------|------------|
| API version | `backend/server.py` (FastAPI `version`, `GET /`, `GET /api/health`) | Breaking → major; new features → minor; fixes → patch or same. |
| SW cache | `frontend/public/sw.js` → `CACHE_NAME` | Every frontend deploy (so clients get new assets). |
| Manifest version | `frontend/public/manifest.json` → `version` / `version_name` | Optional; when you tag a release. |
| IndexedDB | `frontend/src/lib/audioCache.js` → `DB_VERSION` | Only when DB schema changes. |
| Display version | i18n `settings.version` | When you want the in-app label to reflect a release. |

---

## 5. See also

- [Narvo_Non_Functional_Improvements.md](Narvo_Non_Functional_Improvements.md) §6.1 — Cache versioning and build-time cache key.
- [Backend_Deploy_And_Domain.md](../configuration/Backend_Deploy_And_Domain.md) — Deploy and health check.
- [Domains_And_Hosting.md](../configuration/Domains_And_Hosting.md) — Frontend deploy and env.
