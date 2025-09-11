# ReplyCast - Farcaster Mini App

A Farcaster Mini App that helps you track and reply to unreplied conversations. Never miss a reply again!

## Features

### 🎯 Core Functionality
- **Unreplied Conversation Tracking**: Automatically detects conversations where you haven't replied
- **Smart Reply Detection**: Identifies when others have replied to your casts but you haven't responded
- **One-Click Reply**: Quick reply interface with character count and keyboard shortcuts
- **Real-time Updates**: Refresh to get the latest conversation status

### 💬 Reply Interface
- **Modal Reply Window**: Clean, focused interface for composing replies
- **Character Counter**: Real-time character count with Farcaster's 320 character limit
- **Keyboard Shortcuts**: 
  - `⌘+Enter` (Mac) or `Ctrl+Enter` (Windows/Linux) to send
  - `Esc` to cancel
- **Auto-focus**: Textarea automatically focuses when opening reply modal
- **Context Display**: Shows original cast content for better context

### 🎨 User Experience
- **Beautiful UI**: Gradient backgrounds with glassmorphism effects
- **Responsive Design**: Works perfectly on mobile and desktop
- **Loading States**: Smooth loading animations and error handling
- **Hover Effects**: Interactive elements with smooth transitions
- **Accessibility**: Proper focus management and keyboard navigation

### 🔧 Technical Features
- **Farcaster SDK Integration**: Uses official Mini App SDK for casting
- **Neynar API**: Fetches conversation data from Farcaster network
- **Dynamic OG Images**: Server-generated OpenGraph images for sharing
- **Error Handling**: Comprehensive error states and user feedback
- **TypeScript**: Fully typed for better development experience

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Farcaster Integration**: @farcaster/miniapp-sdk
- **API**: Neynar API for Farcaster data
- **Image Generation**: Satori for dynamic OG images
- **Fonts**: Instrument Sans (custom font)

## Development

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Neynar API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd replycast-be-widget
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Variables**
   Create a `.env.local` file:
   ```env
   NEYNAR_API_KEY=your_neynar_api_key_here
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

5. **Test the API**
   ```bash
   pnpm test:api
   ```

### Building for Production

```bash
pnpm build
pnpm start
```

## API Endpoints

### `/api/farcaster-replies`
Fetches unreplied conversations for a given FID.

**Query Parameters:**
- `fid` (required): Farcaster ID to check

**Response:**
```json
{
  "unrepliedCount": 5,
  "unrepliedDetails": [
    {
      "username": "alice",
      "timeAgo": "2h ago",
      "castUrl": "https://farcaster.xyz/...",
      "text": "Great point!",
      "avatarUrl": "https://...",
      "castHash": "0x...",
      "authorFid": 123,
      "originalCastText": "My original cast",
      "originalCastHash": "0x...",
      "originalAuthorUsername": "me",
      "replyCount": 3
    }
  ],
  "message": "You have 5 unreplied comments today."
}
```

### `/api/og-image`
Generates dynamic OpenGraph images for sharing.

## Mini App Configuration

The app is configured as a Farcaster Mini App with:

- **Manifest**: `/.well-known/farcaster.json`
- **Capabilities**: `actions.composeCast` for replying
- **Embed Metadata**: Dynamic OG images and proper frame configuration
- **Splash Screen**: Custom branding with gradient background

## Usage

1. **Open the Mini App**: Launch from any Farcaster client
2. **View Unreplied Conversations**: See all conversations that need your attention
3. **Click Reply**: Open the reply interface for any conversation
4. **Compose Your Reply**: Write your response with character count
5. **Send**: Use the button or keyboard shortcut to send
6. **Refresh**: Click refresh to update the conversation list

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Create an issue on GitHub
- Reach out on Farcaster @username

---

Built with ❤️ for the Farcaster community
# Lefthook Setup Complete
# Test commit for Lefthook
