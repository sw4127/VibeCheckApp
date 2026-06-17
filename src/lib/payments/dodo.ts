/**
 * Dodo Payments adapter (Merchant of Record). REST via fetch — no SDK, no
 * lock-in. Uses the **No-Code static Payment Link** (spec §24 decision):
 *   - checkout = redirect to the product's hosted Dodo link with our params
 *     appended (full-page redirect → webview-survivable; NOT an iframe/overlay).
 *     `metadata_profile=<token>` → payment.metadata.profile; `redirect_url` →
 *     our return URL. No create-API call = fewest failure modes.
 *   - Dodo returns to `redirect_url?payment_id=…&status=succeeded`.
 *   - verify = GET {base}/payments/{id} → { status, metadata } (server-side;
 *     the client `status` param is never trusted).
 *
 * Config (env, server-only): DODO_PAYMENT_LINK (hosted link from the dashboard),
 * DODO_API_KEY (verify), DODO_MODE=test|live (verify API base).
 * (Checkout Sessions POST /checkouts is the documented alternative if ever
 * needed; the static link is simpler for our single fixed-price product.)
 */
import type { CheckoutParams, CheckoutResult, PaymentProvider, VerifyResult } from "./types";

const PAID_STATUSES = new Set(["succeeded", "completed", "paid", "active"]);

/** Exported for tests — maps a Dodo status string to our paid? boolean. */
export function isPaidStatus(status: unknown): boolean {
  return typeof status === "string" && PAID_STATUSES.has(status.toLowerCase());
}

function apiBase(): string {
  return process.env.DODO_MODE === "live"
    ? "https://live.dodopayments.com"
    : "https://test.dodopayments.com";
}

export const dodo: PaymentProvider = {
  id: "dodo",
  orderRefParam: "payment_id",

  isConfigured() {
    // Link to start checkout; API key to verify it server-side. Both required.
    return Boolean(process.env.DODO_PAYMENT_LINK && process.env.DODO_API_KEY);
  },

  async createCheckout({ token, successUrl }: CheckoutParams): Promise<CheckoutResult> {
    const link = process.env.DODO_PAYMENT_LINK;
    if (!link) return { url: null, reason: "not_configured" };
    try {
      const u = new URL(link);
      // redirect_url carries our return (with ?t=<token> as the size-proof
      // content fallback); metadata_profile is read back authoritatively on verify.
      u.searchParams.set("redirect_url", successUrl);
      u.searchParams.set("metadata_profile", token);
      return { url: u.toString() };
    } catch {
      return { url: null, reason: "bad_payment_link" };
    }
  },

  async verify(paymentId: string): Promise<VerifyResult> {
    const key = process.env.DODO_API_KEY;
    if (!key || !paymentId) return { paid: false, token: null };
    try {
      const res = await fetch(`${apiBase()}/payments/${encodeURIComponent(paymentId)}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!res.ok) return { paid: false, token: null };
      const p = (await res.json()) as { status?: string; metadata?: Record<string, unknown> };
      const token = typeof p.metadata?.profile === "string" ? p.metadata.profile : null;
      return { paid: isPaidStatus(p.status), token };
    } catch {
      return { paid: false, token: null };
    }
  },
};
