/**
 * §10.A — the premise test (selection vs. treatment). Stateless, no DB: the
 * onboarding arm and the captured prior-belief live in per-tab sessionStorage,
 * so they survive client navigation AND the same-tab Stripe round-trip, and get
 * auto-attached to every analytics event (see analytics.ts). Client-only.
 */
export type OnboardingArm = "persuasive" | "control";
export type PriorBelief = "totally" | "kind_of" | "not_really";

const ARM_KEY = "vc_arm";
const PB_KEY = "vc_pb";

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
  } catch {
    /* ignore */
  }
  return props;
}
