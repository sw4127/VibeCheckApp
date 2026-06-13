import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure the bundled display-font files are traced into the card route's
  // serverless function (it reads them with fs at runtime for Satori).
  outputFileTracingIncludes: {
    "/api/card": ["./src/fonts/*.woff"],
    // §23.F app icons render the Fraunces wordmark via Satori too.
    "/icon": ["./src/fonts/*.woff"],
    "/apple-icon": ["./src/fonts/*.woff"],
    "/icons/[size]": ["./src/fonts/*.woff"],
  },
};

export default nextConfig;
