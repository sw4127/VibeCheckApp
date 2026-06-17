import { describe, it, expect, afterEach, vi } from "vitest";
import { paymentProvider } from "./index";
import { dodo, isPaidStatus } from "./dodo";

afterEach(() => vi.unstubAllEnvs());

describe("payments provider selection (§24)", () => {
  it("defaults to Dodo and falls back to Dodo for unknown providers", () => {
    expect(paymentProvider().id).toBe("dodo");
    vi.stubEnv("PAYMENTS_PROVIDER", "nope");
    expect(paymentProvider().id).toBe("dodo");
  });
});

describe("dodo adapter", () => {
  it("reports configured only when the payment link AND verify key are set", () => {
    vi.stubEnv("DODO_API_KEY", "");
    vi.stubEnv("DODO_PAYMENT_LINK", "");
    expect(dodo.isConfigured()).toBe(false);
    vi.stubEnv("DODO_PAYMENT_LINK", "https://test.dodopayments.com/buy/pdt_123");
    expect(dodo.isConfigured()).toBe(false); // verify key still missing
    vi.stubEnv("DODO_API_KEY", "test_key");
    expect(dodo.isConfigured()).toBe(true);
  });

  it("reads the order ref from the return-URL param Dodo appends", () => {
    expect(dodo.orderRefParam).toBe("payment_id");
  });

  it("builds a static-link checkout URL with redirect_url + metadata, no network", async () => {
    vi.stubEnv("DODO_PAYMENT_LINK", "https://test.dodopayments.com/buy/pdt_123");
    const r = await dodo.createCheckout({
      token: "TOKEN490",
      successUrl: "https://app.example/premium/report?t=TOKEN490",
      cancelUrl: "https://app.example/premium/preview?canceled=1",
    });
    expect(r.url).toBeTruthy();
    const u = new URL(r.url!);
    expect(u.origin + u.pathname).toBe("https://test.dodopayments.com/buy/pdt_123");
    expect(u.searchParams.get("metadata_profile")).toBe("TOKEN490");
    expect(u.searchParams.get("redirect_url")).toBe("https://app.example/premium/report?t=TOKEN490");
  });

  it("createCheckout is unconfigured-safe and rejects a malformed link", async () => {
    vi.stubEnv("DODO_PAYMENT_LINK", "");
    expect((await dodo.createCheckout({ token: "x", successUrl: "u", cancelUrl: "c" })).url).toBeNull();
    vi.stubEnv("DODO_PAYMENT_LINK", "not a url");
    expect((await dodo.createCheckout({ token: "x", successUrl: "u", cancelUrl: "c" })).reason).toBe(
      "bad_payment_link",
    );
  });

  it("maps Dodo statuses to paid? correctly (case-insensitive)", () => {
    for (const ok of ["succeeded", "Completed", "PAID", "active"]) expect(isPaidStatus(ok)).toBe(true);
    for (const bad of ["failed", "cancelled", "processing", "", null, undefined, 42]) {
      expect(isPaidStatus(bad)).toBe(false);
    }
  });

  it("verify is safe when unconfigured (no throw, not paid)", async () => {
    vi.stubEnv("DODO_API_KEY", "");
    await expect(dodo.verify("pay_x")).resolves.toEqual({ paid: false, token: null });
  });
});
