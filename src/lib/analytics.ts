/**
 * Loop-measurement analytics — thin, SSR-safe wrapper over Vercel Web Analytics.
 *
 * Stays inside the no-DB/stateless rule: events fire client-side, and referral
 * attribution lives in the share-link URL + per-client sessionStorage (never a
 * server store). Drop in PostHog later by adding a second sink here.
 */
import { track as vercelTrack } from "@vercel/analytics";

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

/** Fire a loop-measurement event (no-op on the server; attribution auto-attached). */
export function track(event: string, props: TrackProps = {}): void {
  if (typeof window === "undefined") return;
  const payload = { ...captureAttribution(), ...props };
  try {
    vercelTrack(event, payload);
  } catch {
    /* analytics must never break the app */
  }
  if (process.env.NODE_ENV !== "production") {
    // Visible in dev so we can confirm events fire without the dashboard.
    console.debug("[track]", event, payload);
  }
}
