import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <meta name="fc:miniapp" content='{"version":"1","imageUrl":"https://replycast-be-widget.vercel.app/api/og-image","button":{"title":"📝 Reply","action":{"type":"launch_frame","name":"ReplyCast","url":"https://replycast-be-widget.vercel.app","splashImageUrl":"https://replycast-be-widget.vercel.app/api/og-image","splashBackgroundColor":"#6C2BD7"}}}' />
        <meta name="fc:frame" content='{"version":"1","imageUrl":"https://replycast-be-widget.vercel.app/api/og-image","button":{"title":"📝 Reply","action":{"type":"launch_frame","name":"ReplyCast","url":"https://replycast-be-widget.vercel.app","splashImageUrl":"https://replycast-be-widget.vercel.app/api/og-image","splashBackgroundColor":"#6C2BD7"}}}' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
