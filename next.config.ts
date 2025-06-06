import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
        port: "",
      },
      {
        protocol: "https",
        hostname: "*flagcdn.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "*s3.amazonaws.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "*cdn.reloadly.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: '*lh3.googleusercontent.com',
        port: "",
      },
    ],
  },
};

export default nextConfig;
