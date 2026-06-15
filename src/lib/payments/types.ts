/**
 * Provider-agnostic payments layer (spec §24). Payment is only ever asked to do
 * two things this app depends on: start a hosted checkout that carries our
 * premium token, and later prove "this was paid" + hand the token back. Any
 * Merchant-of-Record can do both, so the provider lives behind this contract and
 * is selected by the PAYMENTS_PROVIDER env var. No DB, stateless throughout.
 */
export interface CheckoutParams {
  /** Our self-contained premium token (the profile). Carried through checkout. */
  token: string;
  /** Absolute return URL (already carries ?t=<token> as the content fallback). */
  successUrl: string;
  /** Absolute URL for a cancelled/failed checkout. */
  cancelUrl: string;
}

export interface CheckoutResult {
  /** Hosted checkout URL to redirect to, or null on failure. */
  url: string | null;
  reason?: string;
}

export interface VerifyResult {
  paid: boolean;
  /** The token read back from the provider's record, if present. */
  token: string | null;
}

export interface PaymentProvider {
  readonly id: string;
  /** True once the provider's keys/product are configured (else /api/checkout 501s). */
  isConfigured(): boolean;
  /** Create a hosted, webview-survivable checkout (full-page redirect). */
  createCheckout(p: CheckoutParams): Promise<CheckoutResult>;
  /** The return-URL query param that carries the provider's order/payment id. */
  readonly orderRefParam: string;
  /** Server-side verification (never trust the client's status param). */
  verify(orderRef: string): Promise<VerifyResult>;
}
