import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1 MB; cover uploads allow up to 5 MB plus form fields.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
