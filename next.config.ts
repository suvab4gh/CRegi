import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["viem", "@solana/web3.js"]
  }
};

export default nextConfig;
