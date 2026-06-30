import { describe, it, expect } from "vitest";
import { narratePaywallHook, buildHookUserMessage } from "@/llm";

describe("A1b — paywall hook narrator", () => {
  it("builds the D2 user message from the pre-computed inputs", () => {
    const msg = buildHookUserMessage({
      archetype: "The Velvet Cynic",
      topSignal: "High Openness",
      artists: ["Phoebe Bridgers", "Radiohead"],
    });
    expect(msg).toContain("ARCHETYPE: The Velvet Cynic");
    expect(msg).toContain("TOP_SIGNAL: High Openness");
    expect(msg).toContain("ARTISTS_TYPED: Phoebe Bridgers, Radiohead");
  });

  // These exercise only the non-model paths (no artist / no signal) so no real
  // API call is made — the live model path is smoke-tested via the route.
  it("is artist-gated: no artist → null hook, fall back to A1a", async () => {
    const r = await narratePaywallHook({ archetype: "The Velvet Cynic", topSignal: "High Openness", artists: [] });
    expect(r.hook).toBeNull();
    expect(r.source).toBe("local");
  });

  it("requires a top signal too (null hook without one)", async () => {
    const r = await narratePaywallHook({ archetype: "The Velvet Cynic", topSignal: "", artists: ["Radiohead"] });
    expect(r.hook).toBeNull();
  });
});
