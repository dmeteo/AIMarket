import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rewrites disabled — MSW handles all API routes
  // To enable backend proxy:
  // async rewrites() {
  //   return [
  //     { source: "/api/:path*", destination: "http://localhost:8000/api/:path*" },
  //   ];
  // },
};

export default nextConfig;
