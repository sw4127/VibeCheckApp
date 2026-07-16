import type { NextConfig } from "next";

// Build-time env self-check (2026-07-16 brief §3.A2 — D6/N1): a missing
// analytics key must fail LOUD at build, not silently no-op in production.
// Warning, not error — the site must still deploy without analytics (degraded,
// visibly), and preview builds may legitimately lack env.
const REQUIRED_PUBLIC = ["NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_BASE_URL"];
const missingEnv = REQUIRED_PUBLIC.filter((k) => !process.env[k]);
if (missingEnv.length > 0) {
  console.warn(
    [
      "",
      "┌─────────────────────────────────────────────────────────────┐",
      "│ ⚠️  ANALYTICS DARK — missing env:                            │",
      ...missingEnv.map((k) => `│    · ${k.padEnd(55)}│`),
      "│ Events will NOT be recorded; the D6 dataset accumulates     │",
      "│ NOTHING. Setup: docs/OPERATIONS.md · check: /api/health     │",
      "└─────────────────────────────────────────────────────────────┘",
      "",
    ].join("\n"),
  );
}

const nextConfig: NextConfig = {
  // Ensure the bundled display-font files are traced into the card route's
  // serverless function (it reads them with fs at runtime for Satori).
  outputFileTracingIncludes: {
    "/api/card": ["./src/fonts/*.woff"],
    // §23.F app icons render the Fraunces wordmark via Satori too.
    "/icon": ["./src/fonts/*.woff"],
    "/apple-icon": ["./src/fonts/*.woff"],
    "/icons/[size]": ["./src/fonts/*.woff"],
    "/product-image": ["./src/fonts/*.woff"],
  },
};

export default nextConfig;
