import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Farcaster Mini App Embed */}
        <meta
          name="fc:miniapp"
          content='{"version":"1","imageUrl":"https://replycast.leovido.xyz/logo.png","button":{"title":"📝 Check Replies","action":{"type":"launch_miniapp","name":"ReplyCast","url":"https://replycast.leovido.xyz","splashImageUrl":"https://replycast.leovido.xyz/logo.png","splashBackgroundColor":"#6C2BD7"}}}'
        />
        <meta
          name="fc:frame"
          content='{"version":"1","imageUrl":"https://replycast.leovido.xyz/logo.png","button":{"title":"📝 Check Replies","action":{"type":"launch_frame","name":"ReplyCast","url":"https://replycast.leovido.xyz","splashImageUrl":"https://replycast.leovido.xyz/logo.png","splashBackgroundColor":"#6C2BD7"}}}'
        />

        {/* Open Graph Metadata for better social sharing */}
        <meta property="og:title" content="ReplyCast - Never Miss a Reply" />
        <meta
          property="og:description"
          content="Track and reply to your unreplied Farcaster conversations. Stay engaged with your community!"
        />
        <meta
          property="og:image"
          content="https://replycast.leovido.xyz/logo.png"
        />
        <meta property="og:url" content="https://replycast.leovido.xyz" />
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
          content="https://replycast.leovido.xyz/logo.png"
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
        <meta name="author" content="leovido.eth" />

        {/* Viewport for responsive design */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no"
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Touch Event Meta Tags for iframe/WebView environments */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Theme Color for status bar and browser UI */}
        <meta name="theme-color" content="#6C2BD7" />
        <meta name="msapplication-navbutton-color" content="#6C2BD7" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
