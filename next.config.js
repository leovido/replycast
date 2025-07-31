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
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24 hours
    dangerouslyAllowSVG: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
          // Removed X-Frame-Options to allow iframe embedding for Mini Apps
          // {
          //   key: "X-Frame-Options",
          //   value: "SAMEORIGIN",
          // },
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
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
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

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
