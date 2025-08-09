import dynamic from "next/dynamic";
import Head from "next/head";

// Dynamically import the SDK to avoid SSR issues
const FarcasterApp = dynamic(() => import("../components/FarcasterApp"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  ),
});

export default function Home() {
  return (
    <>
      <Head>
        <title>ReplyCast - Never Miss a Reply</title>
        <meta
          name="description"
          content="Track and reply to your unreplied Farcaster conversations. Stay engaged with your community!"
        />
      </Head>
      <FarcasterApp />
    </>
  );
}
