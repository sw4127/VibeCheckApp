import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure the bundled display-font files are traced into the card route's
  // serverless function (it reads them with fs at runtime for Satori).
  outputFileTracingIncludes: {
    "/api/card": ["./src/fonts/*.woff"],
  },
};

export default nextConfig;
