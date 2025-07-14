import dynamic from 'next/dynamic'

// Dynamically import the SDK to avoid SSR issues
const FarcasterApp = dynamic(() => import('../components/FarcasterApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )
})

export default function Home() {
  return <FarcasterApp />
}