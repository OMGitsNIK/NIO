import { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/v1/bucket/**",
      },
      {
        protocol: "http",
        hostname: "172.26.28.197",
        port: "8000",
        pathname: "/v1/bucket/**",
      },
      {
        protocol: "http",
        hostname: "46.202.188.170",
        port: "8000",
        pathname: "/v1/bucket/**",
      },
      {
        protocol: "https",
        hostname: "nio-service.rhysjosm.in",
        port: "",
        pathname: "/v1/bucket/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
