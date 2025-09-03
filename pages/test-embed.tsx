import type { NextPage } from "next";
import Head from "next/head";
import { LinkContent } from "../components/LinkContent";

const TestEmbed: NextPage = () => {
  return (
    <>
      <Head>
        <title>ReplyCast - Test Embed & Links</title>
        <meta
          name="description"
          content="Test page for ReplyCast embed preview and link display features"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl font-bold mb-4">📝 ReplyCast</h1>
            <p className="text-xl mb-8">
              Test your embed preview and link display features
            </p>
          </div>

          {/* Test Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-white">
              How to test:
            </h2>
            <ol className="text-left space-y-2 text-sm text-white/90">
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

          {/* Link Display Demo */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-6 text-white">
              Link Display Features Demo
            </h2>

            {/* Image Links */}
            <div className="mb-8">
              <h3 className="text-md font-medium mb-4 text-white/90">
                Image Links:
              </h3>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/80 mb-3">
                  Check out this image: https://picsum.photos/400/300
                </p>
                <LinkContent
                  text="Check out this image: https://picsum.photos/400/300"
                  isDarkTheme={true}
                />
              </div>
            </div>

            {/* YouTube Links */}
            <div className="mb-8">
              <h3 className="text-md font-medium mb-4 text-white/90">
                YouTube Links:
              </h3>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/80 mb-3">
                  Watch this video: https://youtu.be/avjI3_GIZBw
                </p>
                <LinkContent
                  text="Watch this video: https://youtu.be/avjI3_GIZBw"
                  isDarkTheme={true}
                />
              </div>
            </div>

            {/* Mixed Content */}
            <div className="mb-8">
              <h3 className="text-md font-medium mb-4 text-white/90">
                Mixed Content:
              </h3>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/80 mb-3">
                  Here&apos;s an image: https://picsum.photos/400/200 and a
                  video: https://youtu.be/dQw4w9WgXcQ
                </p>
                <LinkContent
                  text="Here's an image: https://picsum.photos/400/200 and a video: https://youtu.be/dQw4w9WgXcQ"
                  isDarkTheme={true}
                />
              </div>
            </div>

            {/* Regular Links */}
            <div>
              <h3 className="text-md font-medium mb-4 text-white/90">
                Regular Links:
              </h3>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/80 mb-3">
                  Visit this website: https://example.com
                </p>
                <LinkContent
                  text="Visit this website: https://example.com"
                  isDarkTheme={true}
                />
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-white/75">
            <p>This page uses the same embed metadata as your main app</p>
            <p>Check the page source to see the fc:miniapp meta tags</p>
            <p className="mt-2">
              New: Link display features are now available in ReplyCard
              components!
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestEmbed;
