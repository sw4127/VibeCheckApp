/**
 * §23.A (G9) — sanitize user-typed names at the trust boundaries before they
 * reach LLM prompts, Stripe metadata, or card URLs. The writer-only
 * architecture + schema locks bound the blast radius; this strips the obvious
 * injection vectors (control chars, line separators) and caps length.
 *
 * Implemented as a codepoint filter (no control-character literals in source).
 */
function isStripped(code: number): boolean {
  return code < 32 || code === 127 || code === 0x2028 || code === 0x2029;
}

export function cleanName(raw: string, max = 30): string {
  let out = "";
  for (const ch of raw) {
    out += isStripped(ch.codePointAt(0) ?? 0) ? " " : ch;
  }
  return out.replace(/\s+/g, " ").trim().slice(0, max).trim();
}

export function cleanNames(raw: string[], maxItems: number, max = 30): string[] {
  return raw.map((x) => cleanName(x, max)).filter(Boolean).slice(0, maxItems);
}
