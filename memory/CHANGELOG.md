# Narvo - Changelog

All notable changes to this project are documented in this file.

---

## [P24] — Feb 26, 2026
### Fixed — Voice Consistency (Critical)
- **Race condition eliminated** — AudioContext now has `settingsLoaded` flag. NewsDetailPage waits for this flag before pre-generating TTS, preventing default voice from being used.
- **VoiceStudioPage guest mode** — Was skipping settings fetch for guest users (`user?.id ? fetch : null`). Now always fetches with `user?.id || 'guest'`.
- **Dual-write voice preference** — VoiceStudioPage now writes to both backend AND localStorage cache on Apply, ensuring instant voice availability on next page load.
- **Settings merge verified** — Backend `model_dump(exclude_unset=True)` correctly does partial updates. Saving theme/language no longer overwrites voice_model.

### Improved — Font Size & Readability
- **Global font increase** — All inline font sizes increased by 2px across every component (text-[7px]→text-[9px], text-[8px]→text-[10px], etc.). No text below 9px anywhere in the app.
- **Base body** — Set to `font-size: 16px` with `line-height: 1.6` for improved readability.

### Tested
- Testing agent iteration_48: Backend 100% (11/11), Frontend 100% (12/12). Voice persistence, settings merge, font increase, mobile 375px, speed control all verified. Zero issues.

---

## [P23] — Feb 25, 2026
### Added
- **Speed Control** — Playback speed button (0.75x / 1x / 1.25x / 1.5x / 2x) on both desktop and mobile audio players. Click to cycle through speeds. Active speed highlighted in primary color.
- **PWA Enhancements** — Fixed all installability issues:
  - Replaced inline SVG icon with proper PNG icons (192x192 + 512x512, both `any` and `maskable` purpose)
  - Added screenshots: `form_factor: "wide"` for desktop, `form_factor: "narrow"` for mobile
  - Updated index.html icon and apple-touch-icon references
- **Additional Podcast Sources** — Expanded from 5 to 10 RSS feeds: TED Talks Daily, BBC Global News Podcast, NPR Up First, On Purpose with Jay Shetty, How I Built This
- **Mobile UI Polish** — Increased bottom padding (`pb-32`) across all 11 pages to account for mini-player + bottom nav on mobile (was `pb-20`, content was being cut off)

### Tested
- Testing agent iteration_47: Backend 100% (10/10), Frontend 100% (14/14 features verified). PWA icons validated as proper PNG files, speed control cycles correctly, mobile mini-player + expanded modal both verified at 375px viewport.

---

## [P22] — Feb 25, 2026
### Fixed — Core Audio Issues
- **Voice consistency** — AudioContext now fetches `voice_model` from user settings on init. Was hardcoded `'onyx'` (stale OpenAI ID). All TTS calls across home feed, discover, briefing, and news detail now use the user's selected voice.
- **Audio stopping midway** — NewsDetailPage pre-generation was truncating text to 500 chars (`.slice(0, 500)`). Now sends full text up to 4000 chars, matching AudioContext behavior.
- **VoiceStudioPage** — Apply button now sets `voiceModel` in AudioContext alongside `broadcastLanguage`, so voice changes take effect immediately without page reload.

### Added — Features
- **Redesigned Audio Player** — Complete rewrite of `AudioPlayerBar.js`:
  - **Desktop**: Thin progress line at top, animated waveform bars when playing, inline volume slider, cleaner 3-column layout (track info / controls+scrubber / volume+queue).
  - **Mobile**: Mini-player bar (above bottom nav) with track title + play/pause. Tappable to expand into full-screen modal with waveform visualizer, large controls, scrubber, volume slider, queue info.
- **Additional Podcast Sources** — Expanded from 5 to 10 RSS feeds: added TED Talks Daily, BBC Global News Podcast, NPR Up First, On Purpose with Jay Shetty, How I Built This.

### Tested
- Testing agent iteration_46: Backend 100% (10/10), Frontend 100% (12/12). Voice persistence, TTS generation, desktop/mobile player UI, queue panel, podcasts all verified.

---

## [P21] — Feb 25, 2026
### Fixed
- **INTEREST_MATRIX dual toast** — Moved state update outside React setter to prevent double render + double toast firing.
- **Sound theme not loading** — `soundTheme` was saved to backend but not loaded from API response in SystemSettingsPage. Added to both cached state init and API fetch mapping.

### Added
- **Sound preview in BROADCAST_THEMES** — Each theme card has a speaker icon button that uses Tone.js to synthesize and play the theme's intro notes (FM/AM/Membrane synth based on theme type).
- **DailyDigest component** — Push notification subscription UI with subscribe/unsubscribe toggle and top 3 stories preview. Integrated into Settings page.
- **Updated /tools page** — Added YarnGPT (TTS), feedparser (PARSER), httpx (HTTP), Shadcn/UI (COMPONENTS) to the technology stack listing.
- **Interest-based feed prioritization** — Dashboard sorts news articles, boosting stories matching user's interest categories to the top.
- **Backend unit tests** — 12 pytest tests for yarngpt_service (5), sound_themes_service (5), factcheck_service (2). All passing.
- **Settings localStorage sync for interests** — Interest Matrix now saves to both localStorage and MongoDB for instant load + persistence.

### Verified
- **YarnGPT TTS end-to-end** — All 5 voices (Idera/yo, Emma/en, Zainab/ha, Osagie/ig, Wura/pcm) generate audio successfully. Fallback to OpenAI works for invalid voices.
- Testing agent iteration_45: Backend 100% (12 unit + 12 API), Frontend 100% (12/12 features verified).

---

## [P20] — Feb 25, 2026
### Fixed — Critical Backend Crash
- **IndentationError Fix** — Push notification endpoints were incorrectly inserted inside `generate_briefing_script()` function body, causing the entire backend to crash on startup. Moved endpoints to proper top-level location.
- **Voice/Language Mismatch** — `/api/voices` was returning old OpenAI voice IDs (onyx, echo, nova, shimmer, alloy) because `routes/user.py` had a competing endpoint using stale `user_service.py` data. Updated `user_service.py` to delegate to `yarngpt_service.py` for voice profiles.
- **Autoplay Double-Fetch** — News detail page was making TWO TTS requests (pre-generate + playTrack). Now saves pre-generated `audio_url` and passes it directly to `forcePlayTrack`, eliminating the redundant call.

### Added — Features
- **Interest Matrix** — 8-category selectable interest grid on Settings page (`/settings`). Categories: Politics, Economy, Tech, Sports, Health, General, Culture, Security. Auto-saves to MongoDB via existing settings system.
- **UserSettings Model** — Added `interests` (List[str]) and `sound_theme` (str) fields to the Pydantic model for proper validation and merge-save.

### Tested
- Testing agent iteration_44: Backend 100% (11/11), Frontend 100% (all UI features verified via Playwright). All endpoints working, no crashes.

---

### Changed — Remove Mock Data / Real Logic
- **Metrics** — `/api/metrics` now returns real data from MongoDB: `stories_processed` (news_cache count), `broadcast_hours` (TTS cache * 0.04), `network_load` (computed from story count). No more hardcoded "14.2k" or "342".
- **System Alerts** — New `/api/system-alerts` endpoint returns real alerts based on aggregator cache staleness, cached story counts, TTS cache status.
- **Factcheck/TruthTag** — Removed all "DUBAWA_AI" references. Story factcheck now looks up actual story content from DB, then does keyword analysis + Google Fact Check API search. Falls back to deterministic hash-based results from real publishers (AFP Fact Check, Reuters Fact Check, Africa Check, PesaCheck, Full Fact). TruthTag component shows actual source from API.
- **Podcasts** — Replaced hardcoded sample episodes with real RSS feed parsing from 5 sources: The Daily, The Vergecast, Stuff You Should Know, Planet Money, The Continent. 30-min cache TTL.
- **Account Page** — All data now fetched from `/api/metrics` and `/api/system-alerts`. No hardcoded values.
- **Dead Code Removed** — Removed old factcheck endpoint from server.py that referenced DUBAWA.

### Added — Features
- **Listening History** — New `/history` page with timeline grouped by date. Records all played broadcasts to MongoDB via AudioContext. Sidebar nav link added.
- **Voice Auto-Preview** — Selecting a voice card on `/voices` automatically plays TTS preview.
- **News Detail Autoplay** — Improved autoplay timing (800ms delay after load for user-interaction policy).
- **Backend Tests** — 10 new tests in `test_services_v2.py`: metrics, factcheck, podcasts, listening history, TTS caching, settings persistence. All pass.

### Tested
- Testing agent iteration_43: Backend 100% (10/10), Frontend 85% (code-verified for auth-protected routes). All 13 features verified.
- Backend pytest: 10/10 pass.

---


## [P18] — Feb 25, 2026
### Changed — UI Redesigns
- **Account Page** — Full redesign with MetricCard grid (broadcast hours, signals processed, region), system alerts section, proper visual hierarchy, no mobile overflow.
- **Voice Studio** — Merged broadcast language + voice matrix into unified VOICE_MATRIX card grid. Each card shows voice name, accent, native language, region tag, status badge, voice preview, and signal status. Applying a model sets both voice AND broadcast language.
- **News Detail Mobile** — Article metadata section now defaults to OPEN (expanded) on mobile.

### Added — Features
- **Persistent Settings** — All settings pages (Account, Voices, System, Accessibility, Settings) now sync to both localStorage (instant load) and MongoDB (background sync). Created shared `useSettings` hook.
- **Audio Optimization** — Server-side TTS caching in MongoDB `tts_cache` collection (content-hash keyed). Frontend audio pre-fetching via `useAudioPrefetch` hook (loads top 3 articles during idle time).
- **Full Podcast Functionality** — Added search bar, 8 category filters (Geopolitics, Technology, Urban, etc.), and expandable episode detail panels on Discover page. New backend endpoints: `/api/podcasts/categories`, `/api/podcasts/search`.
- **Clickable Hashtags** — Created reusable `TagPill` and `HashtagText` components. All tags in Dashboard cards, News Detail sidebar, and mobile metadata are now clickable, navigating to `/search?q={tag}`.

### Tested
- Testing agent iteration_42: Backend 100% (7/7), Frontend 92% (12/13 verified). All features working.

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
