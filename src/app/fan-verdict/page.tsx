import type { Metadata } from "next";
import Link from "next/link";
import {
  fanVerdict,
  fanVerdictRoster,
  playerMeta,
  buildCardDesign,
} from "@/content/world-cup";
import Track from "@/components/Track";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * A2 — the free `/fan-verdict` front-door tool. Pick a footballer → a quotable
 * LAW about what being THEIR fan reveals about YOU, then a CTA into the paid
 * music funnel. Stateless + deterministic ($0): each `?player=` is a static,
 * shareable, cache-forever URL. No photos/badges — typography only (§3/§13.D).
 */
const accentFor = (id?: string) =>
  buildCardDesign({ nation: id ? playerMeta[id]?.nation : undefined }).palette.accent;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const id = typeof sp.player === "string" ? sp.player : undefined;
  const v = id ? fanVerdict(id) : undefined;
  const label = fanVerdictRoster.find((p) => p.id === id)?.label;
  if (!v || !label) {
    return { title: "What does your favourite footballer say about you? — Vibe Check" };
  }
  return {
    title: `${label} fans, exposed — Vibe Check`,
    description: v.law,
  };
}

export default async function FanVerdictPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const id = typeof sp.player === "string" ? sp.player : undefined;
  const verdict = id ? fanVerdict(id) : undefined;
  const label = fanVerdictRoster.find((p) => p.id === id)?.label;
  const accent = accentFor(verdict ? id : undefined);

  // --- Picker (no valid player) ------------------------------------------
  if (!verdict || !label) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10">
        <Track event="fan_verdict_picker" />
        <p className="text-xs font-bold tracking-[0.4em] text-accent">VIBE CHECK</p>
        <h1 className="mt-8 font-display text-4xl font-black leading-[0.95]">
          Tell me who you stan.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Pick a footballer. I&apos;ll tell you what being their fan says about{" "}
          <span className="text-accent">you</span>. You won&apos;t like it.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {fanVerdictRoster.map((p) => (
            <Link
              key={p.id}
              href={`/fan-verdict?player=${p.id}`}
              className="rounded-2xl border border-white/10 px-4 py-5 text-center font-display text-lg font-semibold transition hover:border-accent/60 hover:opacity-95"
            >
              {p.label}
            </Link>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-muted">More players dropping soon.</p>
      </main>
    );
  }

  // --- Verdict (a chosen player) -----------------------------------------
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10">
      <Track event="fan_verdict_view" props={{ player: id ?? "" }} />
      <p className="text-xs font-bold tracking-[0.4em]" style={{ color: accent }}>
        VIBE CHECK
      </p>

      <p className="mt-8 text-xs font-bold tracking-[0.35em] text-muted">IF YOU STAN</p>
      <p className="mt-1 font-display text-4xl font-semibold" style={{ color: accent }}>
        {label}
      </p>

      <p className="mt-7 text-xl leading-relaxed">{verdict.verdict}</p>

      {/* The LAW — the screenshottable focal point */}
      <div className="mt-8 rounded-2xl p-6" style={{ background: `${accent}14`, border: `1px solid ${accent}40` }}>
        <p className="text-xs font-bold tracking-[0.35em] text-muted">YOUR LAW</p>
        <p className="mt-2 font-display text-3xl font-black leading-[1.05]">
          {verdict.law}
        </p>
      </div>

      {/* Funnel into the paid music read (§16.A) */}
      <Link
        href="/music/quiz"
        className="mt-10 block rounded-2xl p-6 text-center transition hover:opacity-95"
        style={{ background: `${accent}14`, border: `1px solid ${accent}40` }}
      >
        <p className="text-lg font-bold">That&apos;s your team. Now what does your taste say?</p>
        <span
          className="mt-4 inline-block rounded-full px-8 py-3.5 text-sm font-bold text-white"
          style={{ background: accent }}
        >
          Read my music taste →
        </span>
      </Link>

      <div className="mt-8 mb-2 text-center">
        <Link href="/fan-verdict" className="text-sm text-muted underline">
          Expose another fan
        </Link>
      </div>
    </main>
  );
}
