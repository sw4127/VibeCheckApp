/**
 * The un-blurred paywall HOOK (A1a) — the §6 receipt that proves we read THEM,
 * then dangles the LAW as the thing they have to unlock (D2 spec).
 *
 * DETERMINISTIC, $0: it only re-states engine-computed facts (trait levels,
 * their typed artist) and points at the LAW that already sits — blurred — as
 * the first line below. It NEVER states the rule itself (that's the bait).
 * A1b will optionally polish this line via cached Haiku, with THIS as the
 * graceful fallback.
 */
import type { PremiumProfile } from "@/content/sample-profile";

/** The dangle clause — implies a single RULE below the blur without stating it. */
const LAW_DANGLE =
  "But your whole taste runs on one rule you've never said out loud — it's the first line below.";

export function buildPreviewHook(p: PremiumProfile, hasLaw: boolean): string {
  const extremes = p.bigFive.filter((b) => b.level !== "Medium").slice(0, 2);
  const artist = p.artistsRecent[0] ?? p.artistsDurable[0];

  if (extremes.length === 0) {
    const tail = hasLaw ? LAW_DANGLE : "And that's just the un-blurred part.";
    return `Reading you as ${p.attachmentStyle} and ${p.stateLine}. ${tail}`;
  }
  const traits = extremes.map((b) => `${b.level} ${b.trait}`).join(" / ");

  // With a LAW to dangle, keep the receipt tight so the bait lands within the
  // D2 ≤35-word budget; the dangle IS the closer. Without one, fall back to the
  // original self-verification tail.
  if (hasLaw) {
    const base = artist
      ? `You scored ${traits} — which is why ${artist} is in your rotation.`
      : `You scored ${traits}, and your listening already told us why.`;
    return `${base} ${LAW_DANGLE}`;
  }
  const base = artist
    ? `You scored ${traits} — which is why ${artist} is in your rotation, and you already know what that means.`
    : `You scored ${traits}, and your listening already told us why.`;
  return `${base} And that's just the un-blurred part.`;
}
