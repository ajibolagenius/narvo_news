# Narvo - Changelog

All notable changes to this project are documented in this file.

---

## [P17] — Feb 25, 2026
### Fixed — Bug Fixes & UI Refactoring
- **Mobile Overflow** — Added `overflow-x-hidden` to Account and System Settings pages; reduced mobile padding on Account page subscription panel. No horizontal scroll at 375px.
- **NARVO Text on Mobile** — Removed `hidden sm:block` from header h1 so "NARVO" is always visible.
- **Push Notifications Removed** — Removed non-functional PUSH_NOTIFICATIONS toggle from System Settings page.

### Changed — Settings Refactoring
- **Broadcast Language Moved** — Migrated BROADCAST_LANGUAGE section (with voice preview) from System Settings to Voice Studio page.
- **Voice Selector Removed from Briefing** — Removed voice selection dropdown from Morning Briefing header for cleaner UI.

### Added — Accessibility (WCAG 2.1 AA)
- **CSS Variables** — Added `--color-text-dim-accessible`, `--touch-target-min`, `--line-height-body/heading`, `--focus-outline-width/style/color/offset` to `:root` and `[data-theme='light']`.
- **Focus Styles** — `:focus-visible` outline using design tokens (2px solid, 2px offset).
- **Skip Link** — "Skip to main content" link in App.js, styled with `.skip-link` class.
- **Reduced Motion** — `@media (prefers-reduced-motion: reduce)` disables all animations.
- **Mobile Article Metadata** — Collapsible `ARTICLE_METADATA` section on News Detail page for mobile (data-testid: `mobile-article-metadata`).

### Tested
- Testing agent iteration_41: 10/10 tests passed (100%).

---


## [P16] — Feb 25, 2026
### Fixed — Mobile Parity
- **Dashboard Telemetry Drawer** — Collapsible TELEMETRY section on mobile (xl:hidden) with trending tags, SOURCE_MATRIX health bar, LOCAL/CONTINENTAL/INTL source counts, and article/podcast metrics
- **Dashboard Filter Tabs** — Compact filter bar (ALL/RSS/AGG + NEW/OLD) fits 375px without overflow
- **Discover Radio Tabs** — PODCASTS/RADIO tab switcher on mobile (lg:hidden) so Radio Garden is accessible without scrolling past all podcasts
- **System Settings Toggles** — All 5 toggle rows stack vertically on mobile (flex-col sm:flex-row) with toggle aligned right
- **Sidebar Overlay** — Removed blocking overlay that was intercepting mobile touches
- **Featured Article** — Title line-clamp-3, reduced padding, overflow-hidden on mobile

---

## [P15c] — Feb 25, 2026
### Fixed
- **Google OAuth Redirect** — `redirectTo` now uses `REACT_APP_BACKEND_URL` instead of `window.location.origin` to ensure OAuth callback goes to production URL, not localhost.

---

## [P15b] — Feb 25, 2026
### Fixed
- **Nav Order** — Briefing route moved before Saved in both sidebar and mobile bottom nav.
- **Tools Page Scroll** — Changed from flex overflow to `min-h-screen` with document scroll. Fixed global CSS (`body { min-height: 100% }`) so standalone pages scroll while DashboardLayout self-contains.
- **Tour Guide Scope** — Tour modal only auto-shows on dashboard-area pages. Uses `useLocation()` check to exclude standalone pages (`/tools`, `/`, `/auth`).

---

## [P15] — Feb 25, 2026
### Added
- **Search Aggregator Integration** — SearchPage fully rewritten to use `/api/search` backend endpoint. Source type filter (ALL/RSS/AGGREGATOR/PODCAST) + sort (LATEST/RELEVANCE). Backend search endpoint enhanced with `source_type` param.
- **Dashboard Filter/Sort** — Working filter tabs (ALL/RSS/AGG) + sort toggle (NEW/OLD). Replaced non-functional placeholder buttons.
- **Briefing Transcript Column** — Desktop: right-side TRANSCRIPT panel with full briefing text + sentence-level follow-along highlighting. Mobile: collapsible archive toggle + transcript below stories.
- **Tools/Credits Page** — New `/tools` page listing 20+ technologies across 6 categories. Footer link on landing page.
- **Google OAuth** — `signInWithGoogle` via Supabase OAuth. Google button on `/auth` page.
- **Email Templates** — Narvo-branded Supabase email templates (confirmation, reset, magic link, invite) at `/app/frontend/src/email-templates/SETUP_GUIDE.md`.

### Fixed
- **UTC → Local Time** — Clock.js and all timestamp displays across 8+ pages now use `toLocaleTimeString()` for user's local timezone.
- **Mobile Responsive** — All dashboard-area screens verified at 375px viewport. Filter tabs, buttons, and layouts fit without overflow.

---

## [P14] — Feb 25, 2026
### Added
- **AI Output Sanitizer** — Regex-based post-processor strips stage directions, sound descriptions, and production cues from all AI-generated text (`[bracketed]`, `(music cues)`, `*asterisked cues*`, `Sound of...` lines).
- **Hardened System Prompts** — All 4 AI generation functions now include explicit CRITICAL RULES forbidding sound effects, stage directions, and non-verbal descriptions.

---

## [P13] — Feb 25, 2026
### Fixed
- **NewsData.io** — Fixed HTTP 422 by capping request limit to 10 (free plan constraint).
- **Global Search** — Rewrote `/api/search` to query RSS feeds, aggregators, and podcasts with deduplication by ID.

### Added
- **User Prefs → Dashboard** — Dashboard fetches user's aggregator preferences and filters feed accordingly.
- **Title Deduplication** — Client-side deduplication in DashboardPage by normalized title.
- **Tour Guide Modal** — 5-step modal for first-time users. Triggers on login/register/guest entry via custom events. Replay button on `/settings` page.
- **Cinematic Audio** — Broadcast-grade Tone.js effects scoped to briefing section. Intro (bass + chord + stab + noise sweep), section divider (bell + sweep), outro (descending chord + shimmer). SFX toggle on briefing page.

---

## [P1-P12] — Prior Sessions
### Summary
- Core platform: Dashboard, audio player, TTS, search, saved, morning briefing, discover, offline
- PWA: Service Worker, IndexedDB, push notifications, background sync, batch download
- Multi-language: Translation (5 African languages), interface i18n (7 languages)
- Feeds: 39 RSS sources + Mediastack + NewsData.io aggregators with caching
- Audio: Background playback, Media Session API, voice gender mapping, voice preview
- Admin: Feed health monitoring, system metrics, content moderation
- Fact-checking: Google Fact Check API integration
- SOURCE_MATRIX widget, AGGREGATOR_WIRE, real-time feed health
