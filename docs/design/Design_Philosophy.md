# Design Philosophy

## Design Principles

* **Radical Clarity:** High contrast borders, no soft shadows.
* **Tactile Feedback:** Buttons should feel like physical toggles (pill shapes).
* **Cultural Rhythm:** Use grid layouts inspired by weaving patterns.

## Color System

### Primary Colors

| Token | Hex | RGB | Usage |
| --- | --- | --- | --- |
| **Turbo Orange** | `#FF5100` | R: 255, G: 80, B: 0 | Primary brand color, CTAs, highlights |
| **Hyper Black** | `#191A1A` | R: 25, G: 25, B: 25 | Text, borders, outlines, grids |
| **Desert Dash** | `#DDC59C` | R: 225, G: 200, B: 165 | Accent backgrounds, warm surfaces |
| **Lightning White** | `#F2F3F3` | R: 240, G: 245, B: 245 | Main background, card surfaces |

### Secondary Colors

| Token | Hex | Usage |
| --- | --- | --- |
| **Deep Orange** | `#E63200` | Darker orange variant, hover states |
| **Golden Yellow** | `#FDB532` | Accents, highlights, notifications |
| **Olive Green** | `#676A4D` | Muted accents, secondary elements |
| **Light Cream** | `#EEEAE2` | Subtle backgrounds, card variations |
| **Sky Blue** | `#BECFD2` | Secondary accents, info states |
| **Pure White** | `#FFFFFF` | Text on dark backgrounds, contrast |

### Legacy Colors (Deprecated)

The following colors are maintained for backward compatibility but should be replaced with the new palette:
- ~~Primary (Narvo Yellow) `#FFD700`~~ → Use **Golden Yellow** `#FDB532`
- ~~Surface `#F8F4F0`~~ → Use **Lightning White** `#F2F3F3`
- ~~Border/Ink `#000000`~~ → Use **Hyper Black** `#191A1A`
- ~~Accent (Vibe) `#FF5733`~~ → Use **Turbo Orange** `#FF5100` or **Deep Orange** `#E63200`

## Design Tokens

* **Borders:** `2px solid #191A1A` (Hyper Black)
* **Radius:** `0px` (Sharp) or `999px` (Pill-only)
* **Shadow:** `4px 4px 0px #191A1A` (Hard Neo-brutalist shadow using Hyper Black)
* **Primary CTA Color:** `#FF5100` (Turbo Orange)
* **Background:** `#F2F3F3` (Lightning White)
* **Text Primary:** `#191A1A` (Hyper Black)
* **Text Secondary:** `#676A4D` (Olive Green for muted text)

## Visual Style (The "Outline" Concept)

Following the Litverse and html.to.design inspiration:

* Use a **Bento Grid** where every box is explicitly outlined.
* **Navigation:** A fixed header and footer separated by a single 2px black line.
* **Audio UI:** Mimic the Litverse player with large, outlined buttons and a progress bar that looks like a technical blueprint.
