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

- **Primary (Signal):** `#EBD5AB` (Sand/Beige) - Used for active states, cursors, critical alerts, and "On" switches. Strictly limited to **10%** of screen real estate.
- **Background (The Anti-light):** `#1B211A` (Deep Matte Charcoal/Green) - The base surface for all views.
- **Surface (Secondary):** `#242B23` (Muted Green/Grey) - Used for alternating row backgrounds, container surfaces, or depthless cards.
- **Structural (Border):** `#628141` (Forest Green) - 1px structural grid lines that define the layout.
- **Text Primary:** `#F2F2F2` (90% White) - High-fidelity content, headers, and primary values.
- **Text Secondarys/Labels:** `#8BAE66` (Sage Green) or `#808080` (50% Grey) - Metadata, units, timestamps, and utility labels.

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
  
  --font-header: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
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

## 10. Brand Philosophy & Narrative
**"The Local Pulse, Refined."**
Narvo is the bridge between the raw energy of African news and the precision of global engineering. We modernize the narrative by providing a tool that treats local stories with the technical respect they deserve. We don't just "show" news; we **broadcast** it with authority, clarity, and structural beauty.
