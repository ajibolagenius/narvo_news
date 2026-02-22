# Narvo Onboarding & UI Documentation

## Overview

This document covers user onboarding flows, UI components, and interface specifications for Narvo.

---

## User Onboarding Flow

### Purpose
Frictionless introduction and profile personalisation to enhance content relevance and retention.

### Screens & Flow
1. **Splash Screen**
   - Logo + tagline: "News That Speaks To You."
   - Microcopy: "Smart summaries. Local voices."

2. **Welcome Screen**
   - Greeting (localised): "Welcome to Narvo" / "Wá sí Narvo" / "Barka da zuwa Narvo"
   - CTA: "Get Started"

3. **Language & Voice Selection**
   - UI: Select preferred language and voice (with audio previews)
   - Options: Pidgin, Yoruba, Hausa, Igbo, English (multiple voice personalities)

4. **Interest Picker**
   - Pill-style topic grid with emojis
   - Topics: Politics, Sports, Entertainment, Business, Radio Clips, etc.

5. **Data & Offline Preferences**
   - Toggle: "Enable offline mode?" (with explanation)
   - Checkbox: "Auto-download daily summaries on Wi-Fi"

6. **Final CTA / Summary**
   - Recap: "You’ll hear updates in [Voice] on [Topics]"
   - CTA: "Start Listening"

---

## Core App Screens

### Home Feed (Bento Grid)
- Grouped summaries by selected interest
- Summary Card:
  - Title + emoji tag
  - Voice toggle (play/pause)
  - Bookmark icon
  - Share/Save

### Summary Detail
- Title + Source + Timestamp
- Playback controls: speed, skip, language
- Microcopy: "Powered by trusted local voices."

### Bookmarks
- List of saved summaries with filter/sort

### Preferences
- Edit Interests
- Change language or voice
- Storage controls
- Accessibility settings

### Offline Library
- Downloaded audio/text content
- Storage usage indicator

---

## Admin & Dashboard Interfaces

### Admin Dashboard
- Accessible via secure login
- User metrics: sign-ups, active listeners, retention rate
- Content performance: summary plays, skips, completions
- System health: failed TTS generations, source fetch errors

### Content Curation Panel
- View scraped headlines + summaries
- Approve/edit before publishing
- Tag with category, language, region
- Auto-run voice generation

### User Feedback Console
- In-app reports, user suggestions, bug flags
- Sentiment dashboard (positive, neutral, negative)
- Tag and assign to moderation team

---

## Microcopy Standards

### Voice
- Friendly, direct, empowering
- Inclusive and accessible (avoid jargon)
- Local-flavoured but respectful

### Examples
| Context | Copy |
|--------|------|
| Onboarding welcome | "Let’s set up Narvo to speak your language." |
| Loading state | "Fetching stories that matter…" |
| Empty state | "No news right now. Check back soon or explore another topic." |
| Error fallback | "Couldn’t load that. Want to try again?" |
| Playback | "Now playing: [Summary Title]" |
| Bookmark success | "Saved for later listening." |

---

## Visual Design Guidance


### Components
- Buttons: Pill shape, high contrast
- Cards: Audio-first layout, responsive
- Icons: Flat, stroke-consistent, African-inspired sets
- Layout Grid:
  - 12-column desktop, 6-column tablet, 1-column mobile
  - Min. 24px padding

---

## Accessibility Considerations

- Full voice navigation support
- Large tappable elements
- Simple sentence structures
- Alt text for all images and icons
- Audio speed control and mute toggle

---

## Next Steps for Implementation

1. Finalise microcopy translations in Yoruba, Hausa, Igbo, Pidgin
2. Build voice preview modules in onboarding
3. Create admin content tagging UI
4. Establish feedback loops from onboarding → dashboard
5. User test accessibility flows with visually impaired users

---

## Create Account / Sign In

- Headline: "Join Narvo"
- Subtext: "Create an account to save your preferences and access news across devices."
- Options: Email, Password, Social Login (Google/Apple)
- Extra: Forgot Password link, microcopy for terms acceptance

---

## Audio Player (Full & Compact)

- Controls: Play/Pause, ±15s, Speed Toggle
- Modes: Full (modal) and Compact (sticky bar)
- Extras: Background playback, swipe to minimise

---

## Notifications & Alerts Panel

- Toggle Options: Daily Digest, Topic Alerts, Breaking News
- Microcopy: "We’ll only notify you when it matters."

---

## Account / Profile Management

- Fields: Email, Password Reset, Linked Accounts
- Actions: Sign Out, Manage Data

---

## Dedicated Accessibility Options

- Settings: Font size, high contrast mode, voice navigation toggle
- Microcopy: "You're in control of how you experience Narvo."

---

## Admin Moderation Console

- Tools: Content moderation queue, report triage
- Logging: Action history for transparency

---

## Admin Voice Testing Tool

- Tools: Upload new TTS samples, voice QA, model selection
- Testing: Playback and rating interface for team

---

## Error / Fallback Screens

- 404 Page: "Hmm, nothing here… Want to go home?"
- Visuals: Confused icon, return to feed CTA
- Tone: Light, empathetic, human
