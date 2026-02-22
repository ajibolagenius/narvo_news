# Narvo Design System: Version 2

## Visual Philosophy
**The Pitch:** A radical modernization of the news aggregation experience, stripping away bloat for a hyper-functional, grid-based interface. It transforms dense information into a scannable, precision instrument.

Version 2 is grounded in **Strict Minimalism** and **Technical Precision**. The design should feel "engineered" rather than "decorated," drawing inspiration from Swiss design and high-end professional equipment. It is unapologetically digital, structural, and functional.

## 1. Color Palette (The 10% Rule)
To maintain extreme minimalism, the primary color acts as the sole signal for action, alerts, or active states, occupying no more than 10% of the screen.

- **Primary (Signal):** `#EBD5AB` (Sand/Beige) - Active states, cursors, critical alerts, "On" switches.
- **Background:** `#1B211A` (Deep Matte Charcoal/Green) - The "Anti-light" base.
- **Surface:** `#242B23` (Slightly lighter matte) - Alternating row backgrounds or container surfaces.
- **Border:** `#628141` (Forest Green) - 1px structural grid lines.
- **Text Primary:** `#F2F2F2` (90% White) - Values, headers, high-fidelity content.
- **Text Secondary:** `#8BAE66` (Sage Green) or `#808080` (50% Grey) - Labels, units, timestamps.
- **Error/Stop:** `#D9534F` - Reserved strictly for "Offline" or "Halt" states (rare).

## 2. Typography
A combination of precision-engineered sans-serifs and monospaced types.

- **Headers & Numerals:** *Space Grotesk*
    - **Display Numeral:** 500 weight, 32px (tabular nums, -2% tracking)
    - **Section Header:** 700 weight, 14px (all caps, +5% tracking)
    - **Data Value:** 400 weight, 16px (tabular nums)
- **UI Body:** *Inter*
    - **Body Label:** 500 weight, 12px (neutral)
- **System Identifiers:** *JetBrains Mono*
    - **Mono Code:** 400 weight, 11px (System IDs, tags)

## 3. The Swiss Grid & Structure
- **The Visible Grid:** Every element sits within a visible 1px `#628141` border.
- **Rigid Alignment:** Content is mapped to a strict structural grid.
- **No Shadows:** A flat, 2D aesthetic. Depth is achieved via layout and alternating surface colors, never elevation.
- **Square Corners:** 0px border-radius everywhere. Maximum precision and technical feel.

## 4. Interaction & Micro-animations
- **State Changes:** Smooth hover effects and subtle transitions for interactive elements.
- **Audio Feedback:** Pulsing indicators for active audio playback, integrated into the grid lines.
- **Premium Feel:** Every interaction feels deliberate. No unnecessary clutter.

## 5. Design Tokens
```css
:root {
  --color-primary: #EBD5AB;
  --color-bg: #1B211A;
  --color-surface: #242B23;
  --color-border: #628141;
  --color-text-primary: #F2F2F2;
  --color-text-secondary: #8BAE66;
  
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  --grid-line: 1px solid var(--color-border);
}
```

---

## Build Guide
**Build Order:**
1. **Design Tokens & Typography:** Set up `Space Grotesk` and the strict 1px border utility classes. This establishes the "Grid" feel immediately.
2. **Layout Shell:** Construct the structural grid using the `--color-border` and `--color-surface` tokens.
3. **Interactive Components:** Layer in the `--color-primary` signals for active states and CTAs.
