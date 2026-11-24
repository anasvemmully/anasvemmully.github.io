import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keystatic's GitHub sign-in sends you to 127.0.0.1 instead of localhost, and
  // Next blocks its dev scripts from other origins unless they're listed here.
  // Development only: this has no effect on the production site.
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
