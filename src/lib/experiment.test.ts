import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getOnboardingArm,
  getVoiceArm,
  getPriorBelief,
  setPriorBelief,
  experimentProps,
} from "./experiment";

/** Minimal in-memory sessionStorage for the node test environment. */
function makeStore() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
  };
}

describe("experiment (§10.A) — with a browser-like environment", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("sessionStorage", makeStore());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("voice A/B is DORMANT until the flag is set (§26 staged rollout)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9); // would be online if enabled
    expect(getVoiceArm()).toBe("classic"); // flag unset → everyone classic
    expect(experimentProps().voice).toBeUndefined(); // nothing written, nothing tracked
  });

  it("assigns a STABLE voice arm and exposes it for analytics (§26)", () => {
    vi.stubEnv("NEXT_PUBLIC_VOICE_AB", "1");
    vi.spyOn(Math, "random").mockReturnValue(0.9); // → online
    expect(getVoiceArm()).toBe("online");
    vi.spyOn(Math, "random").mockReturnValue(0.1); // a fresh flip is ignored
    expect(getVoiceArm()).toBe("online");
    expect(experimentProps().voice).toBe("online");
  });

  it("voice arm can land classic too", () => {
    vi.stubEnv("NEXT_PUBLIC_VOICE_AB", "1");
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    expect(getVoiceArm()).toBe("classic");
  });

  it("assigns an arm and keeps it STABLE across reloads (no double-count)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1); // → persuasive
    expect(getOnboardingArm()).toBe("persuasive");
    // A later call must ignore a fresh coin flip — the session is locked in.
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    expect(getOnboardingArm()).toBe("persuasive");
  });

  it("can land on either arm", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9); // → control
    expect(getOnboardingArm()).toBe("control");
  });

  it("round-trips prior belief and rejects junk", () => {
    expect(getPriorBelief()).toBeNull();
    setPriorBelief("not_really");
    expect(getPriorBelief()).toBe("not_really");
    sessionStorage.setItem("vc_pb", "garbage");
    expect(getPriorBelief()).toBeNull();
  });

  it("experimentProps exposes arm + belief for analytics segmentation", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    getOnboardingArm();
    setPriorBelief("kind_of");
    expect(experimentProps()).toEqual({ onboarding_arm: "persuasive", prior_belief: "kind_of" });
  });

  it("experimentProps omits keys that aren't set yet", () => {
    expect(experimentProps()).toEqual({});
  });
});

describe("experiment — SSR-safe (no window)", () => {
  it("returns defaults and never throws on the server", () => {
    vi.stubGlobal("window", undefined);
    expect(getOnboardingArm()).toBe("persuasive");
    expect(getPriorBelief()).toBeNull();
    expect(experimentProps()).toEqual({});
    vi.unstubAllGlobals();
  });
});
