# Color Palette Reference

## Overview

This document provides a complete reference for the Narvo color palette, extracted from the official design system.

## Primary Colors

### Turbo Orange
- **Hex:** `#FF5100`
- **RGB:** R: 255, G: 80, B: 0
- **Usage:** Primary brand color, CTAs, highlights, interactive elements
- **Accessibility:** Use with Hyper Black or Lightning White text for contrast

### Hyper Black
- **Hex:** `#191A1A`
- **RGB:** R: 25, G: 25, B: 25
- **Usage:** Text, borders, outlines, grids, shadows
- **Accessibility:** Primary text color on light backgrounds

### Desert Dash
- **Hex:** `#DDC59C`
- **RGB:** R: 225, G: 200, B: 165
- **Usage:** Accent backgrounds, warm surfaces, secondary cards
- **Accessibility:** Use with Hyper Black text

### Lightning White
- **Hex:** `#F2F3F3`
- **RGB:** R: 240, G: 245, B: 245
- **Usage:** Main background, card surfaces, primary containers
- **Accessibility:** Use with Hyper Black text

## Secondary Colors

### Deep Orange
- **Hex:** `#E63200`
- **Usage:** Darker orange variant, hover states, pressed states
- **Context:** Alternative to Turbo Orange for depth

### Golden Yellow
- **Hex:** `#FDB532`
- **Usage:** Accents, highlights, notifications, success states
- **Context:** Warm, energetic accent color

### Olive Green
- **Hex:** `#676A4D`
- **Usage:** Muted accents, secondary elements, subtle backgrounds
- **Context:** Earthy, natural tone for variety

### Light Cream
- **Hex:** `#EEEAE2`
- **Usage:** Subtle backgrounds, card variations, soft surfaces
- **Context:** Softer alternative to Lightning White

### Sky Blue
- **Hex:** `#BECFD2`
- **Usage:** Secondary accents, info states, cool tones
- **Context:** Provides contrast to warm palette

### Pure White
- **Hex:** `#FFFFFF`
- **Usage:** Text on dark backgrounds, maximum contrast, overlays
- **Context:** Highest contrast option

## Color Usage Guidelines

### Primary Actions
- Use **Turbo Orange** (`#FF5100`) for primary CTAs and important interactive elements
- Use **Deep Orange** (`#E63200`) for hover/pressed states

### Text Hierarchy
- **Hyper Black** (`#191A1A`) for primary text
- **Olive Green** (`#676A4D`) for secondary/muted text
- **Pure White** (`#FFFFFF`) for text on dark backgrounds

### Backgrounds
- **Lightning White** (`#F2F3F3`) for main app background
- **Light Cream** (`#EEEAE2`) for card backgrounds and subtle variations
- **Desert Dash** (`#DDC59C`) for warm accent backgrounds

### Borders & Outlines
- **Hyper Black** (`#191A1A`) for all borders and outlines (2px solid)
- Maintains the "Outline" design aesthetic

## Accessibility Considerations

- Ensure minimum contrast ratio of 4.5:1 for text
- Turbo Orange on Lightning White: ✅ Meets WCAG AA
- Hyper Black on Lightning White: ✅ Meets WCAG AAA
- Test all color combinations for readability

## Implementation

### CSS Variables
```css
:root {
  --color-turbo-orange: #FF5100;
  --color-hyper-black: #191A1A;
  --color-desert-dash: #DDC59C;
  --color-lightning-white: #F2F3F3;
  --color-deep-orange: #E63200;
  --color-golden-yellow: #FDB532;
  --color-olive-green: #676A4D;
  --color-light-cream: #EEEAE2;
  --color-sky-blue: #BECFD2;
  --color-pure-white: #FFFFFF;
}
```

### Tailwind Config
```js
colors: {
  'turbo-orange': '#FF5100',
  'hyper-black': '#191A1A',
  'desert-dash': '#DDC59C',
  'lightning-white': '#F2F3F3',
  'deep-orange': '#E63200',
  'golden-yellow': '#FDB532',
  'olive-green': '#676A4D',
  'light-cream': '#EEEAE2',
  'sky-blue': '#BECFD2',
  'pure-white': '#FFFFFF',
}
```

---

*Source: Official Narvo Color Palette (SPRINTDEPT.COM)*
