import { describe, it, expect, afterEach, vi } from "vitest";
import { baseUrl, cardPath } from "./site";

const ENV_KEYS = ["NEXT_PUBLIC_BASE_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"] as const;

afterEach(() => {
  vi.unstubAllEnvs();
  for (const k of ENV_KEYS) vi.stubEnv(k, "");
});

describe("baseUrl scheme normalization (§16 share loop)", () => {
  it("forces https:// on a scheme-less NEXT_PUBLIC_BASE_URL (the doubling bug)", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "vibe-check-app-sepia.vercel.app");
    expect(baseUrl()).toBe("https://vibe-check-app-sepia.vercel.app");
    // og = baseUrl()+cardPath() must be absolute so Next never resolves it
    // relative to an inferred metadataBase (→ https://host/host/api/card).
    expect(baseUrl() + cardPath({ format: "og", archetype: "X" })).toMatch(
      /^https:\/\/vibe-check-app-sepia\.vercel\.app\/api\/card\?/,
    );
  });

  it("keeps an explicit scheme and strips trailing slashes", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://vibecheck.app//");
    expect(baseUrl()).toBe("https://vibecheck.app");
  });

  it("uses the STABLE production alias before the per-deploy URL", () => {
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "vibe-check-app-sepia.vercel.app");
    vi.stubEnv("VERCEL_URL", "vibe-check-5cib4bg4j-proj.vercel.app");
    expect(baseUrl()).toBe("https://vibe-check-app-sepia.vercel.app");
  });

  it("falls back to the per-deploy URL, then localhost", () => {
    vi.stubEnv("VERCEL_URL", "ephemeral.vercel.app");
    expect(baseUrl()).toBe("https://ephemeral.vercel.app");
    vi.stubEnv("VERCEL_URL", "");
    expect(baseUrl()).toBe("http://localhost:3000");
  });
});
