import type { NextPage } from "next";
import Head from "next/head";

const TestEmbed: NextPage = () => {
  return (
    <>
      <Head>
        <title>ReplyCast - Test Embed</title>
        <meta
          name="description"
          content="Test page for ReplyCast embed preview"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">📝 ReplyCast</h1>
          <p className="text-xl mb-8">Test your embed preview</p>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4">How to test:</h2>
            <ol className="text-left space-y-2 text-sm">
              <li>
                1. Copy this URL:{" "}
                <code className="bg-black/20 px-2 py-1 rounded">
                  https://replycast-be-widget.vercel.app
                </code>
              </li>
              <li>2. Share it in a Farcaster cast</li>
              <li>3. You should see a rich embed with the OG image</li>
              <li>4. Click the button to launch the Mini App</li>
            </ol>
          </div>

          <div className="mt-8 text-sm opacity-75">
            <p>This page uses the same embed metadata as your main app</p>
            <p>Check the page source to see the fc:miniapp meta tags</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestEmbed;
