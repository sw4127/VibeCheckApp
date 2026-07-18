import type { Metadata } from "next";
import Link from "next/link";
import FluidField from "@/components/FluidField";
import Track from "@/components/Track";
import { worldCup } from "@/content/world-cup";

/**
 * The taste-gym landing (RT-3c, memo §9.7 RESOLVED 2026-07-11): /bias is the
 * flagship, the music quiz demotes to a secondary door, the WC path is legacy
 * (route stays alive; only referred arrivals see a pointer to it). No
 * existing route or shared URL 404s — this page only changed its content.
 */

export const metadata: Metadata = {
  title: "The Taste Gym — do you hear the music, or the name?",
  description:
    "Your taste has a number. The Prestige Test measures how far a famous name can move your ratings. Ten clips, rated twice — the gap is your number.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "The Taste Gym — do you hear the music, or the name?",
    description:
      "Your taste has a number. The Prestige Test measures how far a famous name can move your ratings.",
    siteName: "The Taste Gym",
    type: "website",
  },
};

const GOLD = "hsl(42 80% 62%)";
const GOLD_GLOW = "hsl(42 80% 60% / 0.45)";
const FLUID = ["hsl(42 55% 48%)", "hsl(28 50% 44%)", "hsl(52 45% 46%)", "hsl(20 40% 40%)"];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  // Legacy WC share links land here with ?from=<archetypeId> — greet them and
  // point at the game they were actually sent (Track 5: legacy, not featured).
  const sp = await searchParams;
  const fromId = typeof sp.from === "string" ? sp.from : undefined;
  const friendArchetype = fromId
    ? worldCup.archetypes.centroids.find((c) => c.id === fromId)?.label
    : undefined;

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center overflow-hidden px-6 py-12">
      <FluidField colors={FLUID} baseColor="#0B0A08" intensity={0.6} scrim={false} vignette />
      <Track event="landing_view" props={{ variant: "gym" }} />
      <div className="relative z-10">
        <p className="text-xs font-bold tracking-[0.4em]" style={{ color: GOLD }}>
          THE TASTE GYM
        </p>

        {friendArchetype ? (
          <p className="mt-5 inline-block rounded-full border border-white/10 px-4 py-1.5 text-sm text-muted">
            Your friend is <span className="font-semibold" style={{ color: GOLD }}>{friendArchetype}</span> on
            the pitch — that game lives{" "}
            <Link href="/quiz" className="underline underline-offset-4" style={{ color: GOLD }}>
              here
            </Link>
            . The gym is what&apos;s new.
          </p>
        ) : null}

        <h1 className="mt-7 font-display text-5xl font-semibold leading-[1.02] tracking-tight">
          Your taste has a number.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted">
          Not a personality. Not a vibe. A measured number — how far a famous name can push your
          ratings before your ears object. Hume called it prejudice in 1757.{" "}
          <span className="text-foreground">We measure yours in five minutes.</span>
        </p>

        <Link
          href="/bias"
          className="mt-8 inline-block rounded-full px-8 py-4 text-lg font-bold text-black transition hover:opacity-95 active:scale-[0.98]"
          style={{ background: GOLD, boxShadow: `0 10px 30px ${GOLD_GLOW}` }}
        >
          Take the Prestige Test
        </Link>
        <p className="mt-4 text-xs text-muted">Free · ~5 minutes · no sign-up · headphones help</p>

        {/* The gym floor — every machine visible, locked ones included (D3). */}
        <div className="mt-10 flex flex-col gap-3">
          <div className="rounded-2xl border p-4" style={{ borderColor: "hsl(42 60% 55% / 0.35)", background: "rgba(255,255,255,0.03)" }}>
            <p className="text-[0.65rem] font-bold tracking-[0.3em]" style={{ color: GOLD }}>
              MACHINE 01 · OPEN
            </p>
            <p className="mt-1 font-display text-lg font-semibold">The Prestige Test</p>
            <p className="mt-0.5 text-sm text-muted">Freedom from prejudice — can a label move your score?</p>
          </div>
          <div className="rounded-2xl border border-dashed border-white/20 p-4">
            <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">MACHINE 02 · LOCKED</p>
            <p className="mt-1 font-display text-lg font-semibold">Delicacy Trials</p>
            <p className="mt-0.5 text-sm text-muted">One clip hides a wrong note. Can your ears actually tell?</p>
          </div>
        </div>

        {/* Secondary doors — quiet rows, no bare underline/arrow links
            (PM 2026-07-17): the lead-in word carries the accent, hover lifts
            the whole line. */}
        <div className="mt-8 flex flex-col gap-2.5 text-sm">
          <Link href="/music/quiz" className="group text-muted transition-colors hover:text-white">
            <span className="font-semibold text-[hsl(42_45%_52%)] transition-colors group-hover:text-[hsl(42_80%_62%)]">
              Warm-up.
            </span>{" "}
            The original music-taste read.
          </Link>
          {/* The library (§3.C7) — crawlable path into the explainers (D5). */}
          <Link href="/learn" className="group text-muted transition-colors hover:text-white">
            <span className="font-semibold text-[hsl(42_45%_52%)] transition-colors group-hover:text-[hsl(42_80%_62%)]">
              Reading room.
            </span>{" "}
            Hume&apos;s five criteria, and how we measure them.
          </Link>
        </div>

        <p className="mt-8 text-[11px] text-muted/70">
          <Link href="/legal" className="transition hover:text-white">
            Terms · Privacy
          </Link>
        </p>
      </div>
    </main>
  );
}
