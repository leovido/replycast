/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Or, for all images from the domain:
    domains: [
      'localhost',
      'commentcast.xyz'
    ],
    formats: ['image/avif', 'image/webp']
  },
};

module.exports = nextConfig;
