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
  it("reports configured only when key AND product are set", () => {
    vi.stubEnv("DODO_API_KEY", "");
    vi.stubEnv("DODO_PRODUCT_ID", "");
    expect(dodo.isConfigured()).toBe(false);
    vi.stubEnv("DODO_API_KEY", "test_key");
    expect(dodo.isConfigured()).toBe(false); // product still missing
    vi.stubEnv("DODO_PRODUCT_ID", "pdt_123");
    expect(dodo.isConfigured()).toBe(true);
  });

  it("reads the order ref from the return-URL param Dodo appends", () => {
    expect(dodo.orderRefParam).toBe("payment_id");
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
