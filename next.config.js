const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Redirects for Farcaster hosted manifest
  async redirects() {
    return [
      {
        source: "/.well-known/farcaster.json",
        destination:
          "https://api.farcaster.xyz/miniapps/hosted-manifest/01987c29-0368-9ff0-6260-e4a6b91cb1ff",
        permanent: false,
      },
    ];
  },

  // Bundle optimization
  experimental: {
    optimizePackageImports: ["react-icons", "@farcaster/miniapp-sdk"],
  },

  // Image optimization
  images: {
    domains: [
      "localhost",
      "commentcast.xyz",
      "randomuser.me",
      "imagedelivery.net",
      "i.imgur.com",
      "tba-mobile.mypinata.cloud",
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24 hours
    dangerouslyAllowSVG: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache control for external images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/7.x/avataaars/svg",
        port: "",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
        port: "",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
        port: "",
      },
      {
        protocol: "https",
        hostname: "yt3.ggpht.com",
        pathname: "/**",
        port: "",
      },
    ],
  },

  // Security headers for performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "x-neynar-experimental",
            value: "true",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      // Prometheus scrapes should never be cached.
      {
        source: "/api/metrics",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },
      {
        source: "/api/farcaster-notification-replies",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=120",
          },
        ],
      },
    ];
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: "deterministic",
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              priority: 10,
              reuseExistingChunk: true,
            },
            farcaster: {
              test: /[\\/]node_modules[\\/](@farcaster)[\\/]/,
              name: "farcaster",
              priority: 20,
              reuseExistingChunk: true,
            },
            common: {
              name: "common",
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Ensure touch events work properly in production
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        "touch-action": false,
      },
    };

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
