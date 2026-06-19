/**
 * "Grounded in research" (spec §9). Optional, lowest-friction: a native
 * <details> (collapsed by default, zero JS). Lays out our actual argument —
 * Hume's aesthetics, the P1–P4 thesis, and the published science — so the
 * curious get the rigor without taxing the reveal. Music-result only (the
 * P1–P4 thesis is about taste→self).
 */
import type { ReactNode } from "react";

export default function ResearchPanel({ accent }: { accent: string }) {
  const Head = (text: string) => (
    <p className="text-[10px] font-bold tracking-[0.25em]" style={{ color: accent }}>
      {text}
    </p>
  );
  const Claim = (sym: string, text: ReactNode) => (
    <p className="mt-2 flex gap-2.5">
      <span className="font-display text-sm font-bold leading-relaxed" style={{ color: accent }}>
        {sym}
      </span>
      <span>{text}</span>
    </p>
  );
  return (
    <details className="mt-8 rounded-2xl border border-white/10 p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold [&::-webkit-details-marker]:hidden">
        <span>Grounded in research</span>
        <span className="text-xs font-normal text-muted">why this isn&apos;t a horoscope ↓</span>
      </summary>
      <div className="mt-4 flex flex-col gap-5 text-sm leading-relaxed text-slate-300">
        <div>
          {Head("THE PHILOSOPHY")}
          <p className="mt-1">
            In <em>Of the Standard of Taste</em> (1757), David Hume argued taste is a feeling — but
            not an arbitrary one. Flawed judgment comes from fixable <em>defects</em> (prejudice,
            inexperience, no practice); a cultivated ear perceives truer. So your taste is yours{" "}
            <em>and</em>{" "}trained by everything you&apos;ve heard — which is exactly why
            it&apos;s readable.
          </p>
        </div>
        <div>
          {Head("THE ARGUMENT")}
          {Claim(
            "P1",
            "Your music carries real, probabilistic cues about your emotional state (recent) and your personality (stable).",
          )}
          {Claim(
            "P2",
            <>
              The richer and more honest the taste data, the stronger the read — it&apos;s the data{" "}
              <em>quality</em>, not how &ldquo;good&rdquo; your taste is.
            </>,
          )}
          {Claim(
            "P3",
            "Almost nobody has an articulated picture of their own taste. The gap between what it reveals and what you consciously know is where the insight lives.",
          )}
          {Claim(
            "P4",
            "Timescale split — recent taste reads your current mood; durable taste reads the stable you.",
          )}
          {Claim(
            "∴",
            <>
              Read the taste, read the person.{" "}
              <strong>Understanding your music is a back door into understanding yourself</strong>{" "}
              — which is the whole product.
            </>,
          )}
        </div>
        <div>
          {Head("THE EVIDENCE")}
          <p className="mt-1">
            Not vibes: music preference maps onto personality in published work — Rentfrow &amp;
            Gosling (2003, <em>JPSP</em>) and the five-factor MUSIC model (Rentfrow, Goldberg &amp;
            Levitin, 2011). The correlations are real, if modest. Your score is computed in code the
            same way every time; the words only narrate it.
          </p>
        </div>
      </div>
    </details>
  );
}
