/**
 * Stateless premium token — carries a PremiumProfile through the paywall URL,
 * Stripe Checkout `metadata`, and back to /premium/report. No DB: the token IS
 * the record (same pattern as /vs). base64url(JSON), validated on decode;
 * anything malformed → null (caller falls back to the sample profile).
 *
 * Kept compact for Stripe's 500-char metadata value limit: artists are capped
 * and trimmed.
 */
import type { PremiumProfile, StateLevels } from "@/content/sample-profile";
import type { Level } from "@/llm/premiumSchema";
import { fnv1a } from "@/engine";

const VERSION = "p2"; // p2 adds `st` (state-lane levels); p1 still decodes.
const LEVEL_CHARS: Record<string, Level> = { H: "High", M: "Medium", L: "Low" };
const CHAR_OF: Record<Level, string> = { High: "H", Medium: "M", Low: "L" };
const TRAITS = ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"];
const STATE_ORDER = ["energy", "regulation", "rumination"] as const;

interface TokenPayload {
  v: string;
  a: string; // archetype label
  b: string; // 5 level chars, OCEAN order
  st?: string; // 3 level chars, [energy, regulation, rumination] (p2+)
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
  if (p.stateLevels) {
    payload.st = STATE_ORDER.map((k) => CHAR_OF[p.stateLevels![k]] ?? "M").join("");
  }
  return b64urlEncode(JSON.stringify(payload));
}

export function decodePremiumToken(token: string | undefined | null): PremiumProfile | null {
  if (!token) return null;
  try {
    const raw = JSON.parse(b64urlDecode(token)) as TokenPayload;
    if ((raw.v !== "p1" && raw.v !== "p2") || typeof raw.a !== "string" || typeof raw.b !== "string") return null;
    if (raw.b.length !== 5 || [...raw.b].some((c) => !LEVEL_CHARS[c])) return null;
    let stateLevels: StateLevels | undefined;
    if (typeof raw.st === "string") {
      if (raw.st.length !== 3 || [...raw.st].some((c) => !LEVEL_CHARS[c])) return null;
      stateLevels = {
        energy: LEVEL_CHARS[raw.st[0]],
        regulation: LEVEL_CHARS[raw.st[1]],
        rumination: LEVEL_CHARS[raw.st[2]],
      };
    }
    return {
      stateLevels,
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
