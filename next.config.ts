import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // The dev-mode indicator badge sits bottom-left and overlaps the
  // sidebar's collapsed log-out button at that same screen position,
  // silently swallowing real clicks there in `next dev`. Doesn't affect
  // production builds either way.
  devIndicators: false,
};

export default nextConfig;
