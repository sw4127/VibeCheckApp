import { describe, it, expect, vi, afterEach } from "vitest";
import { rateLimit, clientKey } from "./rateLimit";

afterEach(() => vi.useRealTimers());

describe("rateLimit", () => {
  it("allows up to the limit, then blocks within the window", () => {
    const k = `k-${Math.random()}`;
    expect(rateLimit(k, 3, 60_000)).toBe(true);
    expect(rateLimit(k, 3, 60_000)).toBe(true);
    expect(rateLimit(k, 3, 60_000)).toBe(true);
    expect(rateLimit(k, 3, 60_000)).toBe(false); // 4th over limit
  });

  it("isolates keys", () => {
    const a = `a-${Math.random()}`, b = `b-${Math.random()}`;
    expect(rateLimit(a, 1, 60_000)).toBe(true);
    expect(rateLimit(a, 1, 60_000)).toBe(false);
    expect(rateLimit(b, 1, 60_000)).toBe(true); // b unaffected by a
  });

  it("resets after the window elapses", () => {
    vi.useFakeTimers();
    const k = `w-${Math.random()}`;
    expect(rateLimit(k, 1, 1000)).toBe(true);
    expect(rateLimit(k, 1, 1000)).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit(k, 1, 1000)).toBe(true); // window cleared
  });

  it("clientKey takes the first x-forwarded-for IP, else 'anon'", () => {
    const req = (h: Record<string, string>) => new Request("http://x", { headers: h });
    expect(clientKey(req({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe("1.2.3.4");
    expect(clientKey(req({}))).toBe("anon");
  });
});
