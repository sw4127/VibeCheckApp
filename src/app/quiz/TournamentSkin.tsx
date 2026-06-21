/**
 * §Tournament-skin background — the official 2026 "concentric bands" look as a
 * vivid rounded-rectangle FRAME around the content (legible centre, bold colour
 * at the edges). Nested filled rounded rects in the official palette; the
 * innermost rect is the content sheet, so the bands read as a multi-colour
 * frame. Decorative: absolute, z-0, pointer-events-none, aria-hidden.
 * Deterministic → no hydration mismatch, no layout shift.
 */
import { BAND_COLORS, SHEET } from "./tournament-theme";

const STEP = 6; // band thickness in px (5 bands → ~30px frame)
const FRAME = BAND_COLORS.slice(0, 5);

export default function TournamentSkin() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Outer band is square (bleeds into the screen corners → poster-like, not
          a rounded sticker); inner bands round progressively into the sheet. */}
      {FRAME.map((c, i) => (
        <div
          key={i}
          style={{ position: "absolute", inset: i * STEP, background: c, borderRadius: i * 5 }}
        />
      ))}
      <div
        style={{ position: "absolute", inset: FRAME.length * STEP, background: SHEET, borderRadius: FRAME.length * 5 }}
      />
    </div>
  );
}
