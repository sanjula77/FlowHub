import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for containerised deployments (Choreo / Docker).
  // Produces a self-contained server bundle under .next/standalone/
  output: "standalone",
};

export default nextConfig;
