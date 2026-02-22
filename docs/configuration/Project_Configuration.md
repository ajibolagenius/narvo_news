# Project Configuration

## Agent Instructions

### The Architect (System Rule)

> You are the Narvo Lead Engineer. You write clean, modular Next.js code. You prioritize accessibility (ARIA labels) and performance. Every component must adhere to the **Brutalist Outline** design system.

### Design Rules

* **Grid:** Use `gap-0` with `border-1` or `border-2` to create "connected" grid cells.
* **Lines:** Every card must have a visible `#191A1A` (Hyper Black) or high-contrast border.
* **Typography:** Strict use of DM Mono (or similar) for that "Litverse" technical feel.

---

## System Constraints

### Bandwidth Constraints
* Audio files must be compressed MP3s; fallback to text-only if 3G is failing.
* Implement progressive loading for audio content.
* Prioritize text summaries over audio when bandwidth is limited.

### Battery Optimization
* Minimize heavy animations to save power on older devices.
* Use CSS transforms instead of JavaScript animations where possible.
* Implement lazy loading for non-critical content.

### Storage Limitations
* Limit offline cache to 500MB via IndexedDB.
* Implement cache eviction policies for old content.
* Provide user controls for cache management.

---

## Strict Output Requirements

### Code Standards
1. **Styling:** Must use Tailwind CSS for all styling.
2. **Architecture:** Must be PWA-compliant (Manifest, Service Workers).
3. **Content:** All news must include source attribution.

### Technical Requirements
* All components must be accessible (WCAG 2.1 AA minimum).
* Performance targets: LCP < 2.5s on 3G connections.
* All API calls must include error handling and retry logic.

---

## Project Rules

### Language & Communication
* **No Jargon:** Use "Speak my language" instead of "Localization" in the UI.
* Use clear, simple language that resonates with the target audience.
* Avoid technical terms in user-facing content.

### Content Authenticity
* **Authenticity:** Always credit local sources (e.g., "Summarized from Vanguard").
* Maintain transparency about content sources.
* Ensure cultural sensitivity in all content curation.

### Design Consistency
* **Design:** If a component doesn't have an outline, it doesn't belong in Narvo.
* All UI elements must follow the Brutalist Outline design system.
* Maintain visual consistency across all screens and components.
