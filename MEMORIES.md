# Development Memories & Best Practices

## Build Process

### After Implementing Changes

**Always run `pnpm run build` after implementing changes to ensure:**

- TypeScript compilation succeeds
- All imports are resolved correctly
- No build-time errors exist
- Production build is ready

**Command:**

```bash
pnpm run build
```

**Why this is important:**

- Catches TypeScript errors that might not show in dev mode
- Verifies all dependencies are properly imported
- Ensures the app can be deployed without issues
- Identifies any build configuration problems early

## Recent Feature Implementations

### Link Display Features (Current Session)

- **Components Created**: `LinkContent`, `ImageDisplay`, `EmbedDisplay`
- **Utilities**: `linkUtils.ts` for URL extraction and classification
- **Integration**: Added to `ReplyCard` components in both old and new designs
- **Features**: Automatic link detection, image display, YouTube embeds, music service embeds
- **Music Support**: Added Spotify, Apple Music, SoundCloud, Tidal, Bandcamp, Deezer support
- **Enhanced Spotify**: Rich metadata extraction with album art, track info, and professional music card design
- **Testing**: 41 tests passing across all new components
- **Mock Data**: Updated with YouTube link `https://youtu.be/avjI3_GIZBw`, Spotify link, and various link types

### Key Files Modified

- `components/ReplyCard.tsx` - Added LinkContent integration
- `utils/mockData.ts` - Enhanced with diverse link examples
- `pages/test-embed.tsx` - Updated demo page
- `LINK_FEATURES.md` - Complete feature documentation

## Development Workflow

1. **Implement changes** in development mode
2. **Test functionality** with `npm test`
3. **Run build check** with `pnpm run build`
4. **Fix any build errors** if they occur
5. **Test again** to ensure fixes work
6. **Commit changes** when everything passes

## Testing Commands

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --testPathPattern="(LinkContent|linkUtils|ReplyCard|mockData)"

# Run tests with verbose output
npm test -- --verbose

# Run tests in watch mode
npm test -- --watch
```

## Build Commands

```bash
# Development build
pnpm run dev

# Production build
pnpm run build

# Start production server
pnpm run start

# Lint code
pnpm run lint
```

## Common Issues & Solutions

### Build Errors

- **TypeScript errors**: Fix type issues before building
- **Import errors**: Verify all import paths are correct
- **Dependency issues**: Run `pnpm install` if needed

### Test Failures

- **Component tests**: Check for missing props or incorrect usage
- **Utility tests**: Verify function signatures and return types
- **Mock data tests**: Ensure data structure matches expected format

## Last Updated

- **Date**: Current session
- **Features**: Link display system with YouTube, image, music service, and embed support
- **Status**: ✅ All tests passing, ✅ Build successful, ✅ Enhanced Spotify support with rich metadata, ready for deployment
