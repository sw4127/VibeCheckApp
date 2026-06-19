/**
 * Slice 3 — "Grounded in research" (spec §9). Optional, lowest-friction:
 * a native <details> (collapsed by default, zero JS), so it adds credibility
 * for the curious without taxing the reveal. Honest — cites the real work and
 * keeps the "real but modest" caveat; never claims a diagnosis.
 */
export default function ResearchPanel({ accent }: { accent: string }) {
  const Head = (text: string) => (
    <p className="text-[10px] font-bold tracking-[0.25em]" style={{ color: accent }}>
      {text}
    </p>
  );
  return (
    <details className="mt-8 rounded-2xl border border-white/10 p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold [&::-webkit-details-marker]:hidden">
        <span>Grounded in research</span>
        <span className="text-xs font-normal text-muted">why this isn&apos;t a horoscope ↓</span>
      </summary>
      <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed text-slate-300">
        <div>
          {Head("THE PHILOSOPHY")}
          <p className="mt-1">
            In <em>Of the Standard of Taste</em> (1757), David Hume argued taste is a feeling — but
            not an arbitrary one. Flawed judgment comes from fixable <em>defects</em> (prejudice,
            inexperience, no practice); a cultivated ear perceives truer. So your taste is yours{" "}
            <em>and</em> trained by everything you&apos;ve heard — which is exactly why it&apos;s
            readable.
          </p>
        </div>
        <div>
          {Head("THE SCIENCE")}
          <p className="mt-1">
            Music preference maps onto personality in published work — Rentfrow &amp; Gosling (2003,{" "}
            <em>JPSP</em>) and the five-factor MUSIC model (Rentfrow, Goldberg &amp; Levitin, 2011).
            Real, documented correlations exist between preference dimensions and the Big Five.
          </p>
        </div>
        <div>
          {Head("THE HONEST PART")}
          <p className="mt-1">
            These effects are real but <em>modest</em>, and samples skew Western. This is a mirror
            with evidence — not a diagnosis. Your score is computed in code the same way every time;
            the words only narrate it.
          </p>
        </div>
      </div>
    </details>
  );
}
