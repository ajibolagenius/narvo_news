# Narvo Design System

## Visual Philosophy
**The Pitch:** A radical modernization of the news aggregation experience for a **Broadcast-Grade News Platform**. It strips away visual bloat for a hyper-functional, grid-based interface, transforming dense information into a scannable, precision-engineered news instrument.

Narvo is grounded in **Strict Minimalism** and **Technical Precision**, optimized for journalistic authority and high-fidelity audio delivery. The design should feel "engineered" like a professional broadcast studio console rather than a generic engineering tool.

## 1. Color Palette (The 10% Rule)
To maintain extreme minimalism, the primary color acts as the sole signal for action, alerts, or active states, occupying no more than 10% of the screen.

- **Primary (Signal):** `#EBD5AB` (Sand/Beige) - Active states, cursors, critical alerts, "On" switches.
- **Background:** `#1B211A` (Deep Matte Charcoal/Green) - The "Anti-light" base.
- **Surface:** `#242B23` (Slightly lighter matte) - Alternating row backgrounds or container surfaces.
- **Border:** `#628141` (Forest Green) - 1px structural grid lines.
- **Text Primary:** `#F2F2F2` (90% White) - Values, headers, high-fidelity content.
- **Text Secondary:** `#8BAE66` (Sage Green) or `#808080` (50% Grey) - Labels, units, timestamps.

## 2. Typography
A combination of precision-engineered sans-serifs and monospaced types.

- **Headers & Numerals:** *Space Grotesk*
- **UI Body:** *Inter*
- **System Identifiers:** *JetBrains Mono*

## 3. The Swiss Grid & Structure
- **The Visible Grid**: Every element sits within a visible 1px `#628141` border.
- **Grid Breathing**: During audio playback, active grid lines subtly pulse in opacity to provide subtle, premium visual confirmation.
- **Rigid Alignment**: Content is mapped to a strict structural grid.
- **No Shadows**: A flat, 2D aesthetic.

## 4. Interaction & Micro-animations
- **Haptic Precision**: Defined vibration patterns (e.g., sharp double-beat for Breaking News).
- **Voice-Gestural UI**: Custom gestures trigger voice commands, optimized for high-sunlight environments.
- **Audio Feedback**: Pulsing indicators for active audio playback.

## Build Guide
1. **Design Tokens & Typography**: Set up `Space Grotesk` and the strict 1px border.
2. **Layout Shell**: Construct the structural grid using the `--color-border` token.
3. **Interactive Components**: Layer in the `--color-primary` signals for active states and CTAs.
