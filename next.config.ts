import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'pump.mypinata.cloud',
      "image-cdn.solana.fm",
      'ipfs.io',
      'arweave.net'
    ], // ✅ Add this line
  },
};

export default nextConfig;
