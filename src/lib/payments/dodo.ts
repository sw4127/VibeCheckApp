/**
 * Dodo Payments adapter (Merchant of Record). REST via fetch — no SDK, no
 * lock-in. Hosted redirect checkout (webview-survivable); verify-on-return,
 * no DB. Endpoints per docs.dodopayments.com:
 *   POST {base}/checkouts        → { checkout_url, payment_id, ... }
 *   return_url ?payment_id=&status=succeeded
 *   GET  {base}/payments/{id}    → { status, metadata, ... }
 *
 * Config (env, server-only): DODO_API_KEY, DODO_PRODUCT_ID, DODO_MODE=test|live.
 */
import type { CheckoutParams, CheckoutResult, PaymentProvider, VerifyResult } from "./types";

const PAID_STATUSES = new Set(["succeeded", "completed", "paid", "active"]);

/** Exported for tests — maps a Dodo status string to our paid? boolean. */
export function isPaidStatus(status: unknown): boolean {
  return typeof status === "string" && PAID_STATUSES.has(status.toLowerCase());
}

function base(): string {
  return process.env.DODO_MODE === "live"
    ? "https://live.dodopayments.com"
    : "https://test.dodopayments.com";
}

function headers(key: string): HeadersInit {
  return { Authorization: `Bearer ${key}`, "content-type": "application/json" };
}

export const dodo: PaymentProvider = {
  id: "dodo",
  orderRefParam: "payment_id",

  isConfigured() {
    return Boolean(process.env.DODO_API_KEY && process.env.DODO_PRODUCT_ID);
  },

  async createCheckout({ token, successUrl }: CheckoutParams): Promise<CheckoutResult> {
    const key = process.env.DODO_API_KEY;
    const productId = process.env.DODO_PRODUCT_ID;
    if (!key || !productId) return { url: null, reason: "not_configured" };
    try {
      const res = await fetch(`${base()}/checkouts`, {
        method: "POST",
        headers: headers(key),
        body: JSON.stringify({
          product_cart: [{ product_id: productId, quantity: 1 }],
          // Token rides BOTH the return URL (primary, size-proof) and metadata
          // (authoritative record read back on verify). §24 token-carry.
          metadata: { profile: token },
          return_url: successUrl,
          billing_currency: "USD",
          // confirm:true makes Dodo return a hosted checkout_url to redirect to
          // (vs. a client-secret for the JS overlay, which is unsafe in webviews).
          confirm: true,
        }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        console.error("[dodo] createCheckout failed:", res.status, detail.slice(0, 200));
        return { url: null, reason: `http_${res.status}` };
      }
      const data = (await res.json()) as { checkout_url?: string; payment_link?: string };
      const url = data.checkout_url ?? data.payment_link ?? null;
      return url ? { url } : { url: null, reason: "no_checkout_url" };
    } catch (err) {
      console.error("[dodo] createCheckout error:", (err as Error).message);
      return { url: null, reason: "network" };
    }
  },

  async verify(paymentId: string): Promise<VerifyResult> {
    const key = process.env.DODO_API_KEY;
    if (!key || !paymentId) return { paid: false, token: null };
    try {
      const res = await fetch(`${base()}/payments/${encodeURIComponent(paymentId)}`, {
        headers: headers(key),
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
