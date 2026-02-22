# Development Strategy

## Context

Narvo operates in a high-growth but infrastructure-challenged environment. The app must feel premium yet lightweight. The "Outline" aesthetic serves two purposes: it reduces visual clutter for low-end screens and pays homage to traditional African textile patterns (like Adire) through geometric lines.

## Development Strategy

### Mobile-First Approach
Prioritize the 1-column mobile layout before scaling to 12-column desktop. This ensures the core experience works perfectly on the primary target devices before adding desktop enhancements.

### Edge Functions Architecture
Use Supabase Edge Functions for summarization to keep the frontend light. This approach:
- Reduces client-side processing overhead
- Enables faster initial page loads
- Minimizes data transfer for mobile users

### Local-First Data Handling
UI should optimistic-update and cache frequently to handle Lagos-style connectivity drops. This includes:
- Immediate UI feedback before server confirmation
- Aggressive caching of frequently accessed content
- Graceful degradation when connectivity is poor
- Offline-first data synchronization patterns
