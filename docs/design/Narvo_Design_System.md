# Narvo Design System (Revised)

## Source
This document was uploaded by the user on Feb 25, 2026. Saved from: Narvo_Design_System.md

## Key Changes Applied (Feb 2026)
1. **Accessibility CSS Variables** added to index.css:
   - `--color-text-dim-accessible` (dark: #A3A3A3, light: #525252)
   - `--touch-target-min: 48px`
   - `--line-height-body: 1.5`
   - `--focus-outline-width/style/color/offset`
2. **Focus Styles**: `:focus-visible` outline using design tokens
3. **Skip Link**: "Skip to main content" link in App.js
4. **Reduced Motion**: `@media (prefers-reduced-motion: reduce)` disables animations
5. **Light Mode**: Theme-scoped token overrides for focus and dim-accessible colors

## Design Tokens (CSS Variables)
See `/app/frontend/src/index.css` for the full implementation.

## Typography
- Headers: Space Grotesk
- Body: Inter  
- System/Mono: JetBrains Mono

## Color System
- Primary: #EBD5AB (dark) / #628141 (light)
- Background: #1B211A (dark) / #FFFFFF (light)
- Surface: #242B23 (dark) / #EFF3ED (light)
- Border: #628141 (dark) / #1B211A (light)

## Semantic Category Colors
Finance (#EBD5AB), Environ (#93C5FD), Tech (#D8B4FE), Urgent (#FCA5A5),
Politics (#FDBA74), Science (#5EEAD4), Culture (#F472B6), Sports (#FB923C),
Health (#4ADE80), Security (#94A3B8), Opinion (#A8A29E), Legal (#818CF8)
# Narvo Design System

## 1. Design Philosophy: The Technical Instrument
Narvo is not a traditional news aggregator; it is a **Broadcast-Grade News Platform**. The design philosophy is centered on transforming fragmented data into a professional, high-fidelity narrative experience. We treat information as a signal to be engineered, processed, and delivered with precision.

- **Instrument, Not App:** The UI should feel like a precision-engineered broadcast studio console or a technical workstation.
- **Signal Over Noise:** Every pixel must serve a functional purpose. We prioritize clarity, scannability, and journalistic authority.
- **Broadcast Authority:** The aesthetic reflects the gravity and reliability of a premium news broadcast entity.

## 2. Design Principles
- **Strict Minimalism:** Stripping away visual bloat to focus on high-fidelity content. If an element doesn't aid navigation or comprehension, it's removed.
- **Technical Precision:** Use of rigid grids, 1px borders, and monospaced typography to create an "engineered" feel.
- **African Cultural Resonance:** Blending Swiss layout precision with localized African elements (e.g., Nigerian Pidgin copy, regional voice accents) to create a "Global-Local" synthesis.
- **Audio-First Intent:** Design elements provide visual confirmation for audio states, ensuring the UI supports a hands-free, broadcast-centric experience.

## 3. Color System (The 10% Rule)
To maintain extreme minimalism, colors are used sparingly as technical indicators rather than decorative elements.

- **Dark Mode (The Anti-light):** `#1B211A` (Deep Matte Charcoal/Green) - The base surface for all views.
- **Light Mode (Clean Lab):** `#FFFFFF` (Pure White) - The base surface for a precision-focused light mode.
- **Primary (Signal):** `#EBD5AB` (Sand/Beige) in dark mode; switched to `#628141` (Forest Green) in light mode to drive action and hierarchy. Strictly limited to **10%** of screen real estate.
- **Surface (Secondary):** `#242B23` (Muted Green/Grey) in dark mode. (Light mode equivalent: `#EFF3ED` Soft Sage Tint).
- **Structural (Border):** `#628141` (Forest Green) in dark mode. (Light mode equivalent: `#1B211A` for technical focus).
- **Text Primary:** `#F2F2F2` (90% White) in dark mode. (Light mode equivalent: `#1B211A`).
- **Text Secondarys/Labels:** `#8BAE66` (Sage Green) or `#808080` (50% Grey) - Metadata, units, and utility labels.

### Semantic Label Palette
Used for metadata categorization and tag-based filtering. These colors are paired with a 10% opacity background of the same hue for subtle classification.

| Category | Text Color | Border/Active Color | Context |
| :--- | :--- | :--- | :--- |
| **Finance** | `#EBD5AB` | `#EBD5AB` | Market data, economic shifts |
| **Environ** | `#93C5FD` | `#1E3A8A` | Climate, ecology, geography |
| **Tech** | `#D8B4FE` | `#581C87` | AI, hardware, infrastructure |
| **Urgent** | `#FCA5A5` | `#7F1D1D` | Critical breaking news, alerts |
| **Politics** | `#FDBA74` | `#7C2D12` | Policy, governance, regional law |
| **Science** | `#5EEAD4` | `#134E4A` | Research, health, space |
| **Culture** | `#F472B6` | `#831843` | Art, music, social trends |
| **Sports** | `#FB923C` | `#7C2D12` | Athletics, competitions |
| **Health** | `#4ADE80` | `#064E3B` | Wellness, medicine, outbreaks |
| **Security** | `#94A3B8` | `#1E293B` | Defense, cyber, law enforcement |
| **Opinion** | `#A8A29E` | `#44403C` | Editorials, commentary |
| **Legal** | `#818CF8` | `#312E81` | Jurisprudence, court rulings |

## 4. Design Tokens (The Unified Grid)
Uniformity across Web and Mobile is maintained via these strict spacing and shape tokens.

### Spacing & Layout
Narvo follows an **8pt Step Grid** for all internal spacing.
- **Unit Scale:** 4px, 8px, 16px, 24px, 32px, 48px, 64px.
- **Grid Gutters:** 1px (Signal Green `#628141`).
- **Container Padding:** 16px (Mobile), 32px (Desktop).

### Shapes & Radii
Precision is reinforced through **Absolute Sharpness**.
- **Standard Radius:** `0px` (Strict Swiss Grid).
- **Interactive Radius:** `0px` (Consistent sharpness for all buttons, inputs, and toggles).
- **Borders:** `1px` Hairline (Sharp, technical definition).

```css
:root {
  --color-primary: #EBD5AB;
  --color-bg: #1B211A;
  --color-surface: #242B23;
  --color-border: #628141;
  --color-text-primary: #F2F2F2;
  --color-text-secondary: #8BAE66;
  --color-text-dim: #808080;
  --color-text-dim-accessible: #A3A3A3; /* WCAG AA on dark bg – use for body/small dim text */
  
  --border-width: 1px;
  --grid-gap: 16px;
  --radius-none: 0px; /* Absolute sharp corners */
  --radius-interactive: 0px; /* No exceptions for interactive components */
  --spacing-unit-1: 4px;
  --spacing-unit-2: 8px;
  --spacing-unit-3: 16px;
  --spacing-unit-4: 24px;
  --spacing-unit-5: 32px;
  --spacing-unit-6: 48px;
  --spacing-unit-7: 64px;
  --container-padding-mobile: 16px;
  --container-padding-desktop: 32px;
  
  /* Accessibility (WCAG 2.1 AA) */
  --touch-target-min: 48px;
  --touch-target-icon: 48px;
  --line-height-body: 1.5;
  --line-height-heading: 1.25;
  --focus-outline-width: 2px;
  --focus-outline-style: solid;
  --focus-outline-color: #EBD5AB;
  --focus-outline-offset: 2px;
  
  --font-header: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

[data-theme='light'] {
  --color-primary: #628141;
  --color-bg: #FFFFFF;
  --color-surface: #EFF3ED;
  --color-border: #1B211A;
  --color-text-primary: #1B211A;
  --color-text-secondary: #628141;
  --color-text-dim: #808080;
  --color-text-dim-accessible: #525252; /* WCAG AA on white – use for body/small dim text */
  --focus-outline-color: #628141;
}
```

## 5. Typography
- **Headers & Numerals:** *Space Grotesk* - Used for impact, data points, and section titles.
- **UI Body Content:** *Inter* - Optimized for readability in news summaries and article body text.
- **System Identifiers:** *JetBrains Mono* - Used for labels, timestamps, bracketed commands `[LIKE THIS]`, and technical metadata.

## 6. Iconography (Phosphoricons)
All functional icons must be sourced from **[Phosphoricons](https://phosphoricons.com/)**.
- **Style:** `Regular` (1.5px stroke) for consistency with hairline borders.
- **Weight:** Use `Fill` weight ONLY for active/toggle states in the primary color `#EBD5AB`.
- **Sizing:** Fixed at 20px or 24px within technical cells.

## 7. Motion & Interaction (Broadcast Fidelity)
Motion in Narvo is not decorative; it is a **Signal of Process**.

### Tools
- **[Motion (framer-motion)](https://motion.dev/)**: For lightweight, reactive layout transitions and gestural animations.
- **[GSAP](https://gsap.com/)**: For frame-accurate, high-performance technical animations (e.g., waveform scrubbing, dashboard data tickers).
- **[Lenis](https://lenis.darkroom.engineering/)**: For smooth, momentum-based scrolling that mimics the fluidity of a high-end broadcast reel.

### Principles
- **Mechanical Precision**: No "bouncy" springs. Use linear or sharp exponential easing.
- **Momentum**: Scrolling should feel like a physical dial being turned (Lenis Integration).
- **State Feedback**: Transitions must reinforce the "Instrument" feel—cells should pulse or "lock-in" when interacted with.

## 8. Components
- **The Broadcast Loop:** A real-time, radio-like stream interface with pulsing audio indicators.
- **Technical Cards:** Grid-mapped containers with 1px borders, no shadows, and strict internal alignment.
- **[Command] Buttons:** Action buttons formatted in brackets to look like terminal or console commands.
- **The Signal Meter:** Visualizers for audio levels and data synchronization status.
- **Regional Zoom Toggle:** A technical switch for toggling between City, National, and Continental news feeds.

## 9. Visual Style: The Swiss Grid
- **Visible Architecture:** Every layout element sits within a visible `1px` border using `--color-border`.
- **Flat Aesthetic:** No shadows, no gradients, no rounded corners. The design is purely 2D, relying on typography and spatial hierarchy for depth.
- **Haptic Precision:** UI interactions are paired with subtle, sharp haptic taps to reinforce the "instrument" feel.
- **Dynamic Grid Breathing:** Grid lines subtly pulse in opacity during audio playback to confirm the system is "live."

## 10. Accessibility (WCAG 2.1 Level AA)

Narvo meets **WCAG 2.1 Level AA** for contrast, spacing, and focus. Use the tokens and rules below in addition to semantic HTML, keyboard operability, and reduced-motion support.

### 10.1 Color & Contrast

**Requirement:** Normal text ≥ **4.5:1**; large text (≥18px or 14px bold) and UI components ≥ **3:1**. Do not convey information by color alone.

| Context | Foreground | Background | Ratio (approx.) | Pass AA? | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dark – Body text** | `#F2F2F2` | `#1B211A` | ~14:1 | ✓ | Use for primary copy. |
| **Dark – Secondary text** | `#8BAE66` | `#1B211A` | ~5.2:1 | ✓ | OK for labels, metadata. |
| **Dark – Dim / placeholder** | `#808080` | `#1B211A` | ~3.2:1 | ✗ | **Fails** normal text. Use only for non-essential placeholder or large text. |
| **Dark – Primary (signal)** | `#EBD5AB` | `#1B211A` | ~12:1 | ✓ | Buttons, active states. |
| **Light – Body text** | `#1B211A` | `#FFFFFF` | ~14:1 | ✓ | Primary copy. |
| **Light – Secondary text** | `#628141` | `#FFFFFF` | ~4.6:1 | ✓ | Labels, metadata. |
| **Light – Dim / placeholder** | `#808080` | `#FFFFFF` | ~4.5:1 | ✓ (borderline) | Prefer darker grey for body (see adjusted token below). |
| **Light – Primary (signal)** | `#628141` | `#FFFFFF` | ~4.6:1 | ✓ | Buttons, links. |
| **Surface cards (dark)** | `#F2F2F2` | `#242B23` | ~12:1 | ✓ | Text on cards. |
| **Surface cards (light)** | `#1B211A` | `#EFF3ED` | ~13:1 | ✓ | Text on cards. |

**Adjusted tokens for accessibility (use where contrast fails):**

- **Text dim (dark mode):** Use `#A3A3A3` on `#1B211A` for placeholder/secondary dim text (meets 4.5:1). Keep `#808080` only for large text or decorative elements.
- **Text dim (light mode):** Use `#525252` on `#FFFFFF` for body-equivalent dim text (≥4.5:1); `#808080` is acceptable for large labels only.

Use the token **`--color-text-dim-accessible`** (defined in §4 Design Tokens). It resolves to the correct value per theme: dark in `:root`, light in `[data-theme='light']`. No separate `-dark` / `-light` variables exist.

**Semantic category colors (e.g. Finance, Urgent, Tech):** When used as **text** on `#1B211A` or `#FFFFFF`, verify each pair in [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/). Use for tags/labels with sufficient contrast or pair with a contrasting background; do not use low-contrast category color as the only differentiator.

### 10.2 Spacing & Touch Targets

**Requirement:** Interactive targets ≥ **44×44 px** (WCAG 2.2); support **text spacing** override (line height, paragraph/letter/word spacing) without loss of content or functionality.

| Token | Value | Use |
| :--- | :--- | :--- |
| **Touch target (minimum)** | **48px** | Min width/height for buttons, links, icon buttons, toggles (aligns to 8pt grid and exceeds 44px). |
| **Touch target (recommended)** | **48px × 48px** | Default for icon-only controls and mobile primary actions. |
| **Clickable padding** | **12px** (1.5 units) | Min padding inside a touch target so hit area stays ≥ 48px when combined with font size. |

**Spacing scale (unchanged):** 4, 8, 16, 24, 32, 48, 64 px. Use **48px** or **64px** for interactive control dimensions (e.g. play button, region toggle).

**Text spacing (WCAG 1.4.12):** Ensure content does not break when user applies:
- Line height ≥ **1.5×** font size (body: use `line-height: 1.5` or `--line-height-body: 1.5`).
- Paragraph spacing ≥ **2×** font size (e.g. `margin-bottom: 2em` for paragraphs).
- Letter spacing ≥ **0.12×** font size (avoid negative letter-spacing on body).
- Word spacing ≥ **0.16×** font size.

**Concrete tokens to add:**

```css
--touch-target-min: 48px;
--touch-target-icon: 48px;
--line-height-body: 1.5;
--line-height-heading: 1.25;
```

### 10.3 Focus (Keyboard & Screen Reader)

**Requirement:** All interactive elements must be **keyboard focusable** with a **visible focus indicator** (≥ **3:1** against adjacent colors; minimum **2px** outline/offset).

The design system uses **0px radius** and **1px borders**; focus should remain sharp and technical.

**Default focus ring (recommended):**

| Property | Value | Rationale |
| :--- | :--- | :--- |
| **Outline** | `2px solid` | Meets 2px minimum; visible at zoom. |
| **Outline color (dark)** | `#EBD5AB` (primary) on `#1B211A` | High contrast, on-brand. |
| **Outline color (light)** | `#628141` (primary) on `#FFFFFF` | Meets 3:1. |
| **Outline offset** | `2px` | Prevents overlap with 1px border; clear separation. |

**Do not:** Use `outline: none` or `outline: 0` without replacing with a visible focus style. Use `:focus-visible` so mouse users don’t get a ring unless appropriate (e.g. buttons can show focus on click for confirmation).

**Tokens** (defined in §4): `--focus-outline-width`, `--focus-outline-style`, `--focus-outline-color`, `--focus-outline-offset`. The variable **`--focus-outline-color`** is theme-scoped: it is set in `:root` (dark) and overridden in `[data-theme='light']`, so use this single token in your styles.

**Example:**

```css
/* Example: focus-visible only for keyboard */
:focus { outline: none; }
:focus-visible {
  outline: var(--focus-outline-width) var(--focus-outline-style) var(--focus-outline-color);
  outline-offset: var(--focus-outline-offset);
}
```

**Skip link:** Provide a “Skip to main content” link that becomes visible on focus (e.g. positioned off-screen, transitions into view on `:focus`). Style with same focus ring and primary/surface colors.

### 10.4 Motion (prefers-reduced-motion)

Respect user preference for reduced motion (WCAG 2.3.3):

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Keep “Grid Breathing” and other non-essential motion disabled or minimal when `prefers-reduced-motion: reduce` is set.

---

## 11. Brand Philosophy & Narrative
**"The Local Pulse, Refined."**
Narvo is the bridge between the raw energy of African news and the precision of global engineering. We modernize the narrative by providing a tool that treats local stories with the technical respect they deserve. We don't just "show" news; we **broadcast** it with authority, clarity, and structural beauty.
