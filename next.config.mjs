/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Cloudflare Pages (@cloudflare/next-on-pages) does not support the Node.js
  // image optimizer at the edge. Static assets in /public are served directly
  // by Cloudflare's CDN, so we disable the optimizer rather than pay for a
  // third-party loader. All raster assets must be pre-sized and compressed.
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
  },

  eslint: {
    // Run linting in CI via `pnpm lint`; keep production builds fast.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
