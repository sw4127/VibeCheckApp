/**
 * Loop-measurement analytics — thin, SSR-safe wrapper over Vercel Web Analytics.
 *
 * Stays inside the no-DB/stateless rule: events fire client-side, and referral
 * attribution lives in the share-link URL + per-client sessionStorage (never a
 * server store). Drop in PostHog later by adding a second sink here.
 */
import { track as vercelTrack } from "@vercel/analytics";
import { experimentProps } from "./experiment";

export type TrackProps = Record<string, string | number | boolean | null>;

const ATTR_KEY = "vc_attr";

/**
 * Capture referral attribution ONCE per session from the entry URL's params
 * (?ref=, ?src=, ?from=, utm_*). Subsequent calls read the cached copy, so the
 * attribution survives client-side navigation (which rewrites the query string).
 */
export function captureAttribution(): TrackProps {
  if (typeof window === "undefined") return {};
  try {
    const cached = sessionStorage.getItem(ATTR_KEY);
    if (cached) return JSON.parse(cached) as TrackProps;
    const sp = new URLSearchParams(window.location.search);
    const attr: TrackProps = {
      ref: sp.get("ref") ?? "direct",
      src: sp.get("src") ?? "",
      from: sp.get("from") ?? "",
      utm_source: sp.get("utm_source") ?? "",
      utm_medium: sp.get("utm_medium") ?? "",
    };
    sessionStorage.setItem(ATTR_KEY, JSON.stringify(attr));
    return attr;
  } catch {
    return {};
  }
}

// --- PostHog second sink (SDK-free) -----------------------------------------
// Vercel WA custom events are Pro-only — on Hobby they're invisible, so funnels
// can't be measured. PostHog free cloud (1M events/mo) is the §13.C-sanctioned
// second sink. Direct capture API via fetch: no SDK, no autocapture, no cookies
// — distinct_id is a random per-session id (sessionStorage), zero PII. No-op
// until NEXT_PUBLIC_POSTHOG_KEY is set (PM action; see docs/OPERATIONS.md).
const PH_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const PH_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

function sessionId(): string {
  try {
    let id = sessionStorage.getItem("vc_sid");
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("vc_sid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

function posthogCapture(event: string, properties: TrackProps): void {
  if (!PH_KEY) return;
  try {
    // keepalive so events fired right before navigation still land.
    void fetch(`${PH_HOST}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        api_key: PH_KEY,
        event,
        distinct_id: sessionId(),
        properties: { ...properties, $current_url: window.location.pathname },
      }),
    });
  } catch {
    /* analytics must never break the app */
  }
}

/** Fire a loop-measurement event (no-op on the server; attribution auto-attached). */
export function track(event: string, props: TrackProps = {}): void {
  if (typeof window === "undefined") return;
  // §10.A: arm + prior_belief auto-attach to every event (segment the funnel).
  const payload = { ...captureAttribution(), ...experimentProps(), ...props };
  try {
    vercelTrack(event, payload);
  } catch {
    /* analytics must never break the app */
  }
  posthogCapture(event, payload);
  if (process.env.NODE_ENV !== "production") {
    // Visible in dev so we can confirm events fire without the dashboard.
    console.debug("[track]", event, payload);
  }
}
