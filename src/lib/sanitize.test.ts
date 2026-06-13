import { describe, it, expect } from "vitest";
import { cleanName, cleanNames } from "./sanitize";
import { decodePremiumToken } from "./premiumToken";

const NL = String.fromCharCode(10);

describe("cleanName (§23.A G9)", () => {
  it("strips control chars, newlines and line separators", () => {
    expect(cleanName("Phoebe" + NL + "Bridgers")).toBe("Phoebe Bridgers");
    const ctl = ["a", String.fromCharCode(0), "b", String.fromCharCode(7), "c", String.fromCharCode(31), "d"].join("");
    expect(cleanName(ctl)).toBe("a b c d");
    const seps = ["x", String.fromCharCode(0x2028), "y", String.fromCharCode(0x2029), "z"].join("");
    expect(cleanName(seps)).toBe("x y z");
    expect(cleanName("del" + String.fromCharCode(127) + "ete")).toBe("del ete");
  });

  it("collapses whitespace, trims, caps length", () => {
    expect(cleanName("  Frank   Ocean  ")).toBe("Frank Ocean");
    expect(cleanName("A".repeat(50)).length).toBe(30);
    expect(cleanName(" ")).toBe("");
  });

  it("keeps normal unicode (accents, CJK)", () => {
    expect(cleanName("Beyoncé")).toBe("Beyoncé");
    expect(cleanName("周杰倫")).toBe("周杰倫");
  });

  it("cleanNames filters empties and caps items", () => {
    expect(cleanNames(["a", " ", " b ", "c", "d"], 3)).toEqual(["a", "b", "c"]);
  });
});

describe("token decode sanitizes forgeable fields (§23.A G9)", () => {
  it("strips injection attempts from a hand-forged token", () => {
    const forged = Buffer.from(
      JSON.stringify({
        v: "p2",
        a: "The" + NL + "Evil Archetype",
        b: "HHHHH",
        st: "HML",
        s: "line" + NL + "break attempt",
        t: "Style X",
        ar: ["Artist" + NL + "One", " "],
        ad: ["Two"],
      }),
    ).toString("base64url");
    const p = decodePremiumToken(forged)!;
    expect(p).not.toBeNull();
    expect(p.archetype).toBe("The Evil Archetype");
    expect(p.stateLine).toBe("line break attempt");
    expect(p.attachmentStyle).toBe("Style X");
    expect(p.artistsRecent).toEqual(["Artist One"]);
    expect(p.artistsDurable).toEqual(["Two"]);
  });
});
