// EXTRACTED (trimmed) — fnv1a only; the host app's hash.ts carries quiz-specific helpers.

/** FNV-1a 32-bit, returned as zero-padded 8-char hex. Stable, dependency-free. */
export function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
