import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      // The gallery became a section on the home page. Anything already
      // shared or indexed still lands somewhere sensible.
      { source: "/gallery", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
