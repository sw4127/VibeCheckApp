/**
 * JSON-LD structured-data emitter (2026-07-16 brief §3.B5 — serves C2/N1).
 *
 * SERP expectation is ZERO (Google dropped FAQ/HowTo rich results); the
 * payload is for AI crawlers (GPTBot/ClaudeBot/PerplexityBot/Bingbot) and
 * classic indexing. Server component — renders into raw HTML (§3.C8).
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output of our own literal objects; no user input flows here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
