# Feature Flag Documentation

## Overview

The Farcaster widget now supports two different designs through a feature flag system:

1. **Old Design** (default): The original design that users liked
2. **New Design**: The updated design with light/dark theme toggle

## How to Switch Between Designs

### Option 1: Environment Variable (Recommended)

Create a `.env.local` file in the root directory:

```bash
# For OLD design (default - what users liked)
NEXT_PUBLIC_USE_NEW_DESIGN=false

# For NEW design with theme toggle
NEXT_PUBLIC_USE_NEW_DESIGN=true
```

### Option 2: Direct Code Change

In `components/FarcasterApp.tsx`, modify line 8:

```typescript
// For OLD design (default)
const USE_NEW_DESIGN = false;

// For NEW design with theme toggle
const USE_NEW_DESIGN = true;
```

## Design Differences

### Old Design (Default)

- Purple/blue gradient background
- Centered header with logo and stats
- Glass morphism effects
- Dark theme only
- Original layout and styling

### New Design

- Clean header with user info
- Theme toggle (sun/moon icon)
- Light and dark theme support
- Updated card layouts
- Modern styling with better accessibility

## Deployment

- **Production**: Set `NEXT_PUBLIC_USE_NEW_DESIGN=false` to keep the design users liked
- **Development**: Set `NEXT_PUBLIC_USE_NEW_DESIGN=true` to test the new design
- **A/B Testing**: You can deploy both versions and switch between them

## Switching at Runtime

To allow users to switch between designs at runtime, you could:

1. Add a toggle in the UI
2. Store the preference in localStorage
3. Reload the page to apply the change

Example implementation:

```typescript
const toggleDesign = () => {
  const currentDesign = localStorage.getItem("useNewDesign") === "true";
  localStorage.setItem("useNewDesign", (!currentDesign).toString());
  window.location.reload();
};
```

## Current Status

- **Default**: Old design (what users liked)
- **Available**: New design with theme toggle
- **Feature Flag**: `NEXT_PUBLIC_USE_NEW_DESIGN`
