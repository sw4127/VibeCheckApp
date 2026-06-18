/**
 * §10.A — the premise test (selection vs. treatment). Stateless, no DB: the
 * onboarding arm and the captured prior-belief live in per-tab sessionStorage,
 * so they survive client navigation AND the same-tab Stripe round-trip, and get
 * auto-attached to every analytics event (see analytics.ts). Client-only.
 */
export type OnboardingArm = "persuasive" | "control";
export type PriorBelief = "totally" | "kind_of" | "not_really";
/** §26 — free-read voice A/B (transparent, equal, no segmentation). */
export type VoiceArm = "classic" | "online";

const ARM_KEY = "vc_arm";
const PB_KEY = "vc_pb";
const VOICE_KEY = "vc_voice";

/**
 * Stable 50/50 arm for this session. Coin-flipped once on first read and cached,
 * so a reload never re-randomizes (which would double-count the funnel).
 */
export function getOnboardingArm(): OnboardingArm {
  if (typeof window === "undefined") return "persuasive";
  try {
    const cached = sessionStorage.getItem(ARM_KEY);
    if (cached === "persuasive" || cached === "control") return cached;
    const arm: OnboardingArm = Math.random() < 0.5 ? "persuasive" : "control";
    sessionStorage.setItem(ARM_KEY, arm);
    return arm;
  } catch {
    return "persuasive";
  }
}

/**
 * Stable 50/50 voice arm for this session (same anti-double-count rule as the arm).
 * §26 staged rollout: dormant (everyone "classic") until NEXT_PUBLIC_VOICE_AB=1,
 * so deploying the code never exposes the unverified online voice to real users —
 * smoke-test first, then flip the flag, and flip it off in seconds if it bombs.
 */
export function getVoiceArm(): VoiceArm {
  if (typeof window === "undefined") return "classic";
  if (process.env.NEXT_PUBLIC_VOICE_AB !== "1") return "classic";
  try {
    const cached = sessionStorage.getItem(VOICE_KEY);
    if (cached === "classic" || cached === "online") return cached;
    const v: VoiceArm = Math.random() < 0.5 ? "classic" : "online";
    sessionStorage.setItem(VOICE_KEY, v);
    return v;
  } catch {
    return "classic";
  }
}

export function setPriorBelief(value: PriorBelief): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PB_KEY, value);
  } catch {
    /* ignore */
  }
}

export function getPriorBelief(): PriorBelief | null {
  if (typeof window === "undefined") return null;
  try {
    const v = sessionStorage.getItem(PB_KEY);
    return v === "totally" || v === "kind_of" || v === "not_really" ? v : null;
  } catch {
    return null;
  }
}

/** Experiment props for analytics. Reads (not writes) — never coin-flips here. */
export function experimentProps(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const props: Record<string, string> = {};
  try {
    const arm = sessionStorage.getItem(ARM_KEY);
    if (arm) props.onboarding_arm = arm;
    const pb = sessionStorage.getItem(PB_KEY);
    if (pb) props.prior_belief = pb;
    const voice = sessionStorage.getItem(VOICE_KEY);
    if (voice) props.voice = voice;
  } catch {
    /* ignore */
  }
  return props;
}
