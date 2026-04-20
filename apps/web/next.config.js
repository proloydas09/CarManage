/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@antigravity/types", "@antigravity/utils"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "pub-*.r2.dev" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
};

module.exports = nextConfig;
