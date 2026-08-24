import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Server Actions default to a 1MB request body limit, well under the
      // 5MB per-image cap enforced in src/lib/storage.ts — any avatar or
      // race photo submission over ~1MB was rejected before our own upload
      // code ever ran. Race entries also allow multiple photos in one
      // submission, so this needs headroom for more than one image.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
