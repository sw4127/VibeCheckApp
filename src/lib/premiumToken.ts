/**
 * Stateless premium token — carries a PremiumProfile through the paywall URL,
 * Stripe Checkout `metadata`, and back to /premium/report. No DB: the token IS
 * the record (same pattern as /vs). base64url(JSON), validated on decode;
 * anything malformed → null (caller falls back to the sample profile).
 *
 * Kept compact for Stripe's 500-char metadata value limit: artists are capped
 * and trimmed.
 */
import type { PremiumProfile } from "@/content/sample-profile";
import type { Level } from "@/llm/premiumSchema";
import { fnv1a } from "@/engine";

const VERSION = "p1";
const LEVEL_CHARS: Record<string, Level> = { H: "High", M: "Medium", L: "Low" };
const CHAR_OF: Record<Level, string> = { High: "H", Medium: "M", Low: "L" };
const TRAITS = ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"];

interface TokenPayload {
  v: string;
  a: string; // archetype label
  b: string; // 5 level chars, OCEAN order
  s: string; // stateLine
  t: string; // attachment style
  ar: string[]; // recent artists
  ad: string[]; // durable artists
}

function b64urlEncode(s: string): string {
  return Buffer.from(s, "utf8").toString("base64url");
}
function b64urlDecode(s: string): string {
  return Buffer.from(s, "base64url").toString("utf8");
}

export function encodePremiumToken(p: PremiumProfile): string {
  const payload: TokenPayload = {
    v: VERSION,
    a: p.archetype.slice(0, 40),
    b: p.bigFive.map((x) => CHAR_OF[x.level] ?? "M").join(""),
    s: p.stateLine.slice(0, 80),
    t: p.attachmentStyle.slice(0, 30),
    ar: p.artistsRecent.slice(0, 3).map((x) => x.slice(0, 30)),
    ad: p.artistsDurable.slice(0, 1).map((x) => x.slice(0, 30)),
  };
  return b64urlEncode(JSON.stringify(payload));
}

export function decodePremiumToken(token: string | undefined | null): PremiumProfile | null {
  if (!token) return null;
  try {
    const raw = JSON.parse(b64urlDecode(token)) as TokenPayload;
    if (raw.v !== VERSION || typeof raw.a !== "string" || typeof raw.b !== "string") return null;
    if (raw.b.length !== 5 || [...raw.b].some((c) => !LEVEL_CHARS[c])) return null;
    return {
      id: fnv1a(`token|${token}`),
      archetype: raw.a,
      bigFive: TRAITS.map((trait, i) => ({ trait, level: LEVEL_CHARS[raw.b[i]] })),
      attachmentStyle: typeof raw.t === "string" && raw.t ? raw.t : "Secure",
      stateLine: typeof raw.s === "string" && raw.s ? raw.s : "somewhere between fine and 'don't ask'",
      artistsRecent: Array.isArray(raw.ar) ? raw.ar.filter((x) => typeof x === "string").slice(0, 3) : [],
      artistsDurable: Array.isArray(raw.ad) ? raw.ad.filter((x) => typeof x === "string").slice(0, 1) : [],
    };
  } catch {
    return null;
  }
}
