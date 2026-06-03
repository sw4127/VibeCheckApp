import Link from "next/link";
import { cardPath } from "@/lib/site";

// A representative card to show the artifact you get (style-only, no IP).
const SAMPLE_CARD = cardPath({
  format: "square",
  archetype: "The Showman",
  player: "Lamine Yamal",
  verdict: "All flair, no fear — you'd rather lose with style than win boring.",
  traits: ["fearless", "creative", "magnetic"],
  position: "winger",
  nation: "ESP",
  signature: [0.72, 0.96, 0.4, 0.62, 0.55],
  rarity: 9,
});

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-6 py-10 text-center">
      <p className="text-xs font-bold tracking-[0.4em] text-accent">VIBE CHECK</p>

      <h1 className="mt-8 font-display text-5xl font-black leading-[0.95] tracking-tight">
        Which World Cup player matches your vibe?
      </h1>

      <p className="mt-5 text-base leading-relaxed text-muted">
        Seven taps. No football knowledge required. We read how you actually move
        through life and match you to a player&apos;s style — then hand you a card
        built to be screenshotted.
      </p>

      {/* Sample artifact — so the landing shows, not tells */}
      <div className="mt-9 w-64 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SAMPLE_CARD} alt="Example Vibe Check card" className="w-full" />
      </div>

      <Link
        href="/quiz"
        className="mt-9 inline-block rounded-full bg-accent px-10 py-4 text-lg font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
      >
        Find my match
      </Link>
      <p className="mt-5 text-xs text-muted">Free · ~30 seconds · no sign-up</p>
    </main>
  );
}
