import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("http://localhost:5000/v1/bucket/**")],
    domains: ["localhost"], // Add 'localhost' here
  },
};

export default nextConfig;
