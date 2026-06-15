/**
 * Provider selector (spec §24). PAYMENTS_PROVIDER picks the adapter; defaults to
 * Dodo (the confirmed MoR). Add a Gumroad/Paddle adapter here later and the rest
 * of the app — /api/checkout, /premium/report — never changes.
 */
import type { PaymentProvider } from "./types";
import { dodo } from "./dodo";

const PROVIDERS: Record<string, PaymentProvider> = {
  dodo,
};

export function paymentProvider(): PaymentProvider {
  const id = process.env.PAYMENTS_PROVIDER ?? "dodo";
  return PROVIDERS[id] ?? dodo;
}

export type { PaymentProvider, CheckoutParams, CheckoutResult, VerifyResult } from "./types";
