import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  // Explicitly disable file-based route for app favicon (we use public/favicon.ico)
  images: {
    // no image domains needed yet
  },
};

export default nextConfig;
