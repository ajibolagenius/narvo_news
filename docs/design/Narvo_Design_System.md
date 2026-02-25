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
