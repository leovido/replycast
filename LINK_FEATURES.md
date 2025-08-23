# Link Display Features

ReplyCast now supports automatic detection and display of links found in cast text, including images and rich embeddings.

## Features

### 🖼️ Image Display

- **Automatic Detection**: Automatically identifies image URLs from common image hosting services
- **Responsive Design**: Images are displayed with proper aspect ratios and responsive sizing
- **Error Handling**: Graceful fallbacks for broken or unavailable images
- **Loading States**: Smooth loading animations and placeholder content

### 🔗 Rich Link Embeds

- **YouTube Support**: Special handling for YouTube videos with thumbnails and play buttons
- **Music Service Support**: Rich embeds for Spotify, Apple Music, SoundCloud, and other music platforms
- **Domain Recognition**: Smart detection of link types based on domain and file extensions
- **Interactive Elements**: Clickable embeds that open links in new tabs
- **Theme Support**: Adapts to both light and dark themes

### 🎯 Smart Link Classification

The system automatically categorizes links into:

- **Images**: `.jpg`, `.png`, `.gif`, `.webp`, etc. + image hosting domains
- **Videos**: `.mp4`, `.webm`, etc. + video platform domains
- **YouTube**: Special handling for YouTube links with thumbnails
- **Music**: Spotify, Apple Music, SoundCloud, Tidal, Bandcamp, Deezer
- **Other**: Generic link embeds for websites and other content

## How It Works

### 1. Link Extraction

```typescript
import { extractUrls } from "@/utils/linkUtils";

const text = "Check out this image: https://example.com/image.jpg";
const urls = extractUrls(text); // Returns: ['https://example.com/image.jpg']
```

### 2. Link Classification

```typescript
import { classifyUrl } from "@/utils/linkUtils";

const urlInfo = classifyUrl("https://youtu.be/avjI3_GIZBw");
// Returns: { type: 'youtube', domain: 'youtu.be', title: 'YouTube Video', thumbnail: '...' }
```

### 3. Automatic Display

The `LinkContent` component automatically:

- Extracts all URLs from text
- Separates images from other links
- Renders appropriate display components
- Handles loading and error states

### 4. Music Link Support

Music service links are automatically detected and rendered with rich embeds:

```typescript
// Spotify track
const spotifyUrl =
  "https://open.spotify.com/track/5VP1yXviUwA0KA0ewit5pe?si=4ad99b84f89a461a";
const urlInfo = classifyUrl(spotifyUrl);
// Returns: { type: 'music', domain: 'open.spotify.com', title: 'Spotify Track', metadata: {...} }

// Rich metadata extraction (future enhancement)
const richMetadata = await getSpotifyRichMetadata(spotifyUrl);
// Returns: { title: 'California and Me', artist: 'Laufey, Philharmonia Orchestra', album: 'Bewitched', year: '2023', coverArt: '...', description: '...' }
```

**Enhanced Spotify Support**:

- **Rich Track Information**: Song title, artist, album, year
- **Album Cover Art**: High-quality artwork from Spotify
- **Professional Layout**: Music card design with play button overlay
- **Fallback Handling**: Graceful degradation if metadata unavailable

## Components

### LinkContent

Main component that orchestrates link display:

```tsx
import { LinkContent } from "@/components/LinkContent";

<LinkContent
  text={castText}
  isDarkTheme={isDarkTheme}
  className="custom-class"
/>;
```

### ImageDisplay

Handles image rendering with loading states:

```tsx
import { ImageDisplay } from "@/components/ImageDisplay";

<ImageDisplay
  src="https://example.com/image.jpg"
  alt="Description"
  isDarkTheme={isDarkTheme}
  width={400}
  height={300}
/>;
```

### EmbedDisplay

Renders rich link embeds:

```tsx
import { EmbedDisplay } from "@/components/EmbedDisplay";

<EmbedDisplay url="https://youtu.be/avjI3_GIZBw" isDarkTheme={isDarkTheme} />;
```

## Integration

### ReplyCard Integration

Links are automatically displayed in ReplyCard components after the cast text:

```tsx
{
  /* Cast Text */
}
<p className="text-base leading-relaxed">{detail.text}</p>;

{
  /* Link Content (Images and Embeds) */
}
<LinkContent text={detail.text} isDarkTheme={isDarkTheme} className="z-10" />;
```

### Supported Image Domains

- `imgur.com`, `i.imgur.com`
- `images.unsplash.com`
- `picsum.photos`
- `via.placeholder.com`
- `placehold.co`
- `dummyimage.com`
- Any URL with image file extensions

### Supported Video Domains

- `youtube.com`, `youtu.be`
- `vimeo.com`
- `dailymotion.com`
- `twitch.tv`
- `tiktok.com`
- `instagram.com`
- `twitter.com`, `x.com`

## Testing

### Test Page

Visit `/test-embed` to see live examples of all link types.

### Test Coverage

Comprehensive test coverage for:

- Link extraction utilities
- URL classification
- Component rendering
- Error handling
- Theme switching

## Examples

### Image Link

```
Text: "Check out this photo: https://picsum.photos/400/300"
Result: Displays the image with loading states and error handling
```

### YouTube Link

```
Text: "Watch this: https://youtu.be/avjI3_GIZBw"
Result: Rich embed with thumbnail, play button, and video metadata
```

### Mixed Content

```
Text: "Here's an image: https://example.com/photo.jpg and a video: https://youtu.be/abc123"
Result: Both image and video embed displayed appropriately
```

## Future Enhancements

- **Open Graph Support**: Fetch and display metadata for website links
- **Video Thumbnails**: Generate thumbnails for video files
- **Link Previews**: Rich previews for article and product links
- **Custom Embeds**: Allow users to customize embed appearances
- **Link Analytics**: Track link engagement and performance

## Technical Details

### Performance

- Lazy loading for images
- Efficient URL regex matching
- Minimal re-renders with React.memo
- Optimized image sizing and compression

### Accessibility

- Proper alt text for images
- Keyboard navigation support
- Screen reader friendly descriptions
- Focus management for interactive elements

### Security

- Image proxy API for external images
- URL validation and sanitization
- Safe external link handling
- No XSS vulnerabilities
