import { describe, it, expect } from "vitest";
import { narrateCalibration, buildCalibrateSystem, buildCalibrateMessage, CALIBRATE_MAX_CHARS } from "@/llm";
import { PAID_TAPS } from "@/lib/paidTaps";

describe("Slice 3 — calibration translator", () => {
  it("system prompt lists ONLY the requested taps and their exact option ids", () => {
    const sys = buildCalibrateSystem(PAID_TAPS.filter((t) => t.id === "c"));
    expect(sys).toContain("meticulous");
    expect(sys).toContain("gotos");
    expect(sys).not.toContain("betrayed"); // the n-tap option, not requested
    expect(sys).toContain("translator, not a judge");
  });

  it("caps the message length", () => {
    const long = "x".repeat(1000);
    expect(buildCalibrateMessage(long).length).toBe(CALIBRATE_MAX_CHARS);
  });

  // Non-model paths only (no real API call): empty text / no taps → no map.
  it("returns no ids (fall back) on empty text", async () => {
    const r = await narrateCalibration("   ", PAID_TAPS);
    expect(r.ids).toEqual({});
    expect(r.source).toBe("local");
  });

  it("returns no ids when no taps are requested", async () => {
    const r = await narrateCalibration("meticulous chaos person", []);
    expect(r.ids).toEqual({});
    expect(r.source).toBe("local");
  });
});
