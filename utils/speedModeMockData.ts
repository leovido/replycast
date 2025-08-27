import type { UnrepliedDetail } from "@/types/types";

// Mock data for SpeedModeAlt view testing
export const mockSpeedModeConversations: UnrepliedDetail[] = [
  {
    castHash:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    authorFid: 1234,
    username: "alice_web3",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice_web3",
    timeAgo: "2 hours ago",
    replyCount: 3,
    text: "Just deployed my first smart contract on Base! https://www.youtube.com/watch?v=j_7GUdulhOE&list=RDj_7GUdulhOE&start_radio=1&pp=oAcB 🚀 The gas fees are so much better than Ethereum mainnet. Anyone else building on Base?",
    timestamp: 1716666666,
    castUrl:
      "https://farcaster.xyz/cast/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    originalCastText:
      "Just deployed my first smart contract on Base! https://www.youtube.com/watch?v=j_7GUdulhOE&list=RDj_7GUdulhOE&start_radio=1&pp=oAcB 🚀 The gas fees are so much better than Ethereum mainnet. Anyone else building on Base?",
    originalCastHash:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    originalAuthorUsername: "alice_web3",
  },
  {
    castHash: "0x2345678901bcdef2345678901bcdef2345678901bcdef2345678901bcdef",
    authorFid: 5678,
    username: "crypto_artist",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto_artist",
    timeAgo: "4 hours ago",
    replyCount: 7,
    text: "Check out this amazing NFT collection I just discovered! https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQblAWCGm0WyB6hhLf9qNovVwGHle8q7pqO9tmm3u8dpIb7TVu_JJYclke_vI5ACofY64SvMKcm9WyON27B3PIu28SvRJ83n5aEverM9xHNiA The artwork is incredible and the community is so supportive. What do you think?",
    timestamp: 1716666666,
    castUrl:
      "https://farcaster.xyz/cast/0x2345678901bcdef2345678901bcdef2345678901bcdef2345678901bcdef",
    originalCastText:
      "Check out this amazing NFT collection I just discovered! https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQblAWCGm0WyB6hhLf9qNovVwGHle8q7pqO9tmm3u8dpIb7TVu_JJYclke_vI5ACofY64SvMKcm9WyON27B3PIu28SvRJ83n5aEverM9xHNiA The artwork is incredible and the community is so supportive. What do you think?",
    originalCastHash:
      "0x2345678901bcdef2345678901bcdef2345678901bcdef2345678901bcdef",
    originalAuthorUsername: "crypto_artist",
  },
  {
    castHash: "0x3456789012cdef3456789012cdef3456789012cdef3456789012cdef",
    authorFid: 9012,
    username: "defi_explorer",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=defi_explorer",
    timeAgo: "6 hours ago",
    replyCount: 12,
    text: "https://www.perplexity.ai/ New yield farming opportunity just launched! APY looks promising but DYOR. Here's the contract address: 0x1234...",
    timestamp: 1716666666,
    castUrl:
      "https://farcaster.xyz/cast/0x3456789012cdef3456789012cdef3456789012cdef3456789012cdef",
    originalCastText:
      "https://www.perplexity.ai/ New yield farming opportunity just launched! APY looks promising but DYOR. Here's the contract address: 0x1234...",
    originalCastHash:
      "0x3456789012cdef3456789012cdef3456789012cdef3456789012cdef",
    originalAuthorUsername: "defi_explorer",
  },
  {
    castHash: "0x4567890123def4567890123def4567890123def4567890123def",
    authorFid: 3456,
    username: "web3_news",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=web3_news",
    timeAgo: "8 hours ago",
    replyCount: 5,
    text: "Breaking: Major protocol upgrade announced! This could change everything for DeFi users. Stay tuned for more details.",
    timestamp: 1716666666,
    castUrl:
      "https://farcaster.xyz/cast/0x4567890123def4567890123def4567890123def4567890123def",
    originalCastText:
      "Breaking: Major protocol upgrade announced! This could change everything for DeFi users. Stay tuned for more details.",
    originalCastHash: "0x4567890123def4567890123def4567890123def4567890123def",
    originalAuthorUsername: "web3_news",
  },
  {
    castHash: "0x5678901234ef5678901234ef5678901234ef5678901234ef",
    authorFid: 7890,
    username: "nft_collector",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=nft_collector",
    timeAgo: "10 hours ago",
    replyCount: 8,
    text: "Just minted this rare piece! The gas war was intense but totally worth it. This collection is going to the moon! 🌙",
    timestamp: 1716666666,
    castUrl:
      "https://farcaster.xyz/cast/0x5678901234ef5678901234ef5678901234ef5678901234ef",
    originalCastText:
      "Just minted this rare piece! The gas war was intense but totally worth it. This collection is going to the moon! 🌙",
    originalCastHash: "0x5678901234ef5678901234ef5678901234ef5678901234ef",
    originalAuthorUsername: "nft_collector",
  },
];

// Mock data with embedded content for testing
export const mockSpeedModeWithEmbeds: UnrepliedDetail[] = [
  {
    castHash:
      "0x1111111111111111111111111111111111111111111111111111111111111111",
    authorFid: 1001,
    username: "crypto_photographer",
    avatarUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto_photographer",
    timeAgo: "1 hour ago",
    replyCount: 4,
    text: "Captured this amazing sunset during my crypto meetup! The energy was incredible. Check out the photos from the event: https://picsum.photos/800/600 and https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    timestamp: 1716666666,
    castUrl:
      "https://farcaster.xyz/cast/0x1111111111111111111111111111111111111111111111111111111111111111",
    originalCastText:
      "Captured this amazing sunset during my crypto meetup! The energy was incredible. Check out the photos from the event: https://picsum.photos/800/600 and https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    originalCastHash:
      "0x1111111111111111111111111111111111111111111111111111111111111111",
    originalAuthorUsername: "crypto_photographer",
  },
  {
    castHash:
      "0x2222222222222222222222222222222222222222222222222222222222222222",
    authorFid: 1002,
    username: "defi_tutorial",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=defi_tutorial",
    timeAgo: "3 hours ago",
    replyCount: 9,
    text: "New tutorial video is live! Learn how to set up your first yield farming strategy. Perfect for beginners! Watch here: https://youtu.be/dQw4w9WgXcQ",
    timestamp: 1716666666,
    castUrl:
      "https://farcaster.xyz/cast/0x2222222222222222222222222222222222222222222222222222222222222222",
    originalCastText:
      "New tutorial video is live! Learn how to set up your first yield farming strategy. Perfect for beginners! Watch here: https://youtu.be/dQw4w9WgXcQ",
    originalCastHash:
      "0x2222222222222222222222222222222222222222222222222222222222222222",
    originalAuthorUsername: "defi_tutorial",
  },
  {
    castHash:
      "0x3333333333333333333333333333333333333333333333333333333333333333",
    authorFid: 1003,
    username: "nft_showcase",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=nft_showcase",
    timeAgo: "5 hours ago",
    replyCount: 12,
    text: "Just dropped my latest collection! Each piece tells a unique story about the future of digital art. View the collection: https://opensea.io/collection/example",
    timestamp: 1716666666,
    castUrl:
      "https://farcaster.xyz/cast/0x3333333333333333333333333333333333333333333333333333333333333333",
    originalCastText:
      "Just dropped my latest collection! Each piece tells a unique story about the future of digital art. View the collection: https://opensea.io/collection/example",
    originalCastHash:
      "0x3333333333333333333333333333333333333333333333333333333333333333",
    originalAuthorUsername: "nft_showcase",
  },
  {
    castHash:
      "0x4444444444444444444444444444444444444444444444444444444444444444",
    authorFid: 1004,
    username: "web3_podcast",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=web3_podcast",
    timeAgo: "7 hours ago",
    replyCount: 6,
    text: "Latest episode is out! We discuss the future of decentralized social media and its impact on content creation. Listen on Spotify: https://open.spotify.com/track/5VP1yXviUwA0KA0ewit5pe?si=4ad99b84f89a461a",
    timestamp: 1716666666,
    castUrl:
      "https://farcaster.xyz/cast/0x4444444444444444444444444444444444444444444444444444444444444444",
    originalCastText:
      "Latest episode is out! We discuss the future of decentralized social media and its impact on content creation. Listen on Spotify: https://open.spotify.com/track/5VP1yXviUwA0KA0ewit5pe?si=4ad99b84f89a461a",
    originalCastHash:
      "0x4444444444444444444444444444444444444444444444444444444444444444",
    originalAuthorUsername: "web3_podcast",
  },
  {
    castHash:
      "0x5555555555555555555555555555555555555555555555555555555555555555",
    authorFid: 1005,
    username: "dao_meeting",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=dao_meeting",
    timeAgo: "9 hours ago",
    replyCount: 15,
    text: "Community call recording is now available! We covered important updates about our governance structure and upcoming proposals. Check out the highlights: https://farcaster.xyz",
    timestamp: 1716666666,
    castUrl:
      "https://farcaster.xyz/cast/0x5555555555555555555555555555555555555555555555555555555555555555",
    originalCastText:
      "Community call recording is now available! We covered important updates about our governance structure and upcoming proposals. Check out the highlights: https://farcaster.xyz",
    originalCastHash:
      "0x5555555555555555555555555555555555555555555555555555555555555555",
    originalAuthorUsername: "dao_meeting",
  },
  {
    castHash:
      "0x6666666666666666666666666666666666666666666666666666666666666666",
    authorFid: 1006,
    username: "metaverse_tour",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=metaverse_tour",
    timeAgo: "11 hours ago",
    replyCount: 8,
    text: "Virtual tour of our new metaverse space! Come explore the digital world we're building together. Experience it here: https://example.com/metaverse",
    timestamp: 1716666666,
    castUrl:
      "https://farcaster.xyz/cast/0x6666666666666666666666666666666666666666666666666666666666666666",
    originalCastText:
      "Virtual tour of our new metaverse space! Come explore the digital world we're building together. Experience it here: https://example.com/metaverse",
    originalCastHash:
      "0x6666666666666666666666666666666666666666666666666666666666666666",
    originalAuthorUsername: "metaverse_tour",
  },
  {
    castHash:
      "0x7777777777777777777777777777777777777777777777777777777777777777",
    authorFid: 1007,
    username: "crypto_news",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto_news",
    timeAgo: "13 hours ago",
    replyCount: 11,
    text: "Breaking news coverage! Major developments in the crypto space that could affect all of us. Read the full story: https://cointelegraph.com",
    timestamp: 1716666666,
    castUrl:
      "https://farcaster.xyz/cast/0x7777777777777777777777777777777777777777777777777777777777777777",
    originalCastText:
      "Breaking news coverage! Major developments in the crypto space that could affect all of us. Read the full story: https://cointelegraph.com",
    originalCastHash:
      "0x7777777777777777777777777777777777777777777777777777777777777777",
    originalAuthorUsername: "crypto_news",
  },
  {
    castHash:
      "0x8888888888888888888888888888888888888888888888888888888888888888",
    authorFid: 1008,
    username: "defi_review",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=defi_review",
    timeAgo: "15 hours ago",
    replyCount: 7,
    text: "Comprehensive review of the latest DeFi protocols! Safety scores, APY comparisons, and risk assessments included. Full analysis: https://defipulse.com",
    timestamp: 1716666666,
    castUrl:
      "https://farcaster.xyz/cast/0x8888888888888888888888888888888888888888888888888888888888888888",
    originalCastText:
      "Comprehensive review of the latest DeFi protocols! Safety scores, APY comparisons, and risk assessments included. Full analysis: https://defipulse.com",
    originalCastHash:
      "0x8888888888888888888888888888888888888888888888888888888888888888",
    originalAuthorUsername: "defi_review",
  },
  {
    castHash:
      "0x9999999999999999999999999999999999999999999999999999999999999999",
    authorFid: 1009,
    username: "nft_artist",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=nft_artist",
    timeAgo: "17 hours ago",
    replyCount: 13,
    text: "Behind the scenes of my latest artwork! See the creative process from concept to final NFT. Watch the timelapse: https://youtu.be/avjI3_GIZBw",
    timestamp: 1716666666,
    castUrl:
      "https://farcaster.xyz/cast/0x9999999999999999999999999999999999999999999999999999999999999999",
    originalCastText:
      "Behind the scenes of my latest artwork! See the creative process from concept to final NFT. Watch the timelapse: https://youtu.be/avjI3_GIZBw",
    originalCastHash:
      "0x9999999999999999999999999999999999999999999999999999999999999999",
    originalAuthorUsername: "nft_artist",
  },
  {
    castHash:
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    authorFid: 1010,
    username: "web3_conference",
    avatarUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=web3_conference",
    timeAgo: "19 hours ago",
    replyCount: 9,
    text: "Conference highlights and key takeaways! The future of Web3 is brighter than ever. View the presentation slides: https://slideshare.net/example",
    timestamp: 1716666666,
    castUrl:
      "https://farcaster.xyz/cast/0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    originalCastText:
      "Conference highlights and key takeaways! The future of Web3 is brighter than ever. View the presentation slides: https://slideshare.net/example",
    originalCastHash:
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    originalAuthorUsername: "web3_conference",
  },
];

// Mock OpenRank data for testing
export const mockSpeedModeOpenRanks: Record<number, number | null> = {
  1001: 1250,
  1002: 890,
  1003: 2100,
  1004: 567,
  1005: 1780,
  1006: 945,
  1007: 3200,
  1008: 1120,
  1009: 1560,
  1010: 780,
  1234: 1500,
  5678: 2200,
  9012: 890,
  3456: 3100,
  7890: 1250,
};
