import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Farcaster Mini App Embed */}
        <meta
          name="fc:miniapp"
          content='{"version":"1","imageUrl":"https://replycast-be-widget.vercel.app/api/og-image","button":{"title":"📝 Check Replies","action":{"type":"launch_miniapp","name":"ReplyCast","url":"https://replycast-be-widget.vercel.app","splashImageUrl":"https://replycast-be-widget.vercel.app/api/og-image","splashBackgroundColor":"#6C2BD7"}}}'
        />
        <meta
          name="fc:frame"
          content='{"version":"1","imageUrl":"https://replycast-be-widget.vercel.app/api/og-image","button":{"title":"📝 Check Replies","action":{"type":"launch_frame","name":"ReplyCast","url":"https://replycast-be-widget.vercel.app","splashImageUrl":"https://replycast-be-widget.vercel.app/api/og-image","splashBackgroundColor":"#6C2BD7"}}}'
        />

        {/* Open Graph Metadata for better social sharing */}
        <meta property="og:title" content="ReplyCast - Never Miss a Reply" />
        <meta
          property="og:description"
          content="Track and reply to your unreplied Farcaster conversations. Stay engaged with your community!"
        />
        <meta
          property="og:image"
          content="https://replycast-be-widget.vercel.app/api/og-image"
        />
        <meta
          property="og:url"
          content="https://replycast-be-widget.vercel.app"
        />
        <meta property="og:type" content="website" />

        {/* Twitter Card Metadata */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ReplyCast - Never Miss a Reply" />
        <meta
          name="twitter:description"
          content="Track and reply to your unreplied Farcaster conversations. Stay engaged with your community!"
        />
        <meta
          name="twitter:image"
          content="https://replycast-be-widget.vercel.app/api/og-image"
        />

        {/* Additional Meta Tags */}
        <meta
          name="description"
          content="Track and reply to your unreplied Farcaster conversations. Stay engaged with your community!"
        />
        <meta
          name="keywords"
          content="farcaster, replies, social media, engagement, mini app"
        />
        <meta name="author" content="ReplyCast" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
