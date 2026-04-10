import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Allows the livekit-server-sdk (which uses Node.js crypto) to run in API routes */
  serverExternalPackages: ["livekit-server-sdk"],
};

export default nextConfig;
