import Link from "next/link";
import { cardPath } from "@/lib/site";
import { worldCup } from "@/content/world-cup";
import Track from "@/components/Track";

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

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  // Personalized referred landing: a shared link carries ?from=<archetypeId>,
  // so a friend's arrival greets them with the sharer's result (stateless).
  const sp = await searchParams;
  const fromId = typeof sp.from === "string" ? sp.from : undefined;
  const friendArchetype = fromId
    ? worldCup.archetypes.centroids.find((c) => c.id === fromId)?.label
    : undefined;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-6 py-10 text-center">
      <Track event="landing_view" />
      <p className="text-xs font-bold tracking-[0.4em] text-accent">VIBE CHECK</p>

      {friendArchetype ? (
        <p className="mt-6 rounded-full border border-white/10 px-4 py-1.5 text-sm text-muted">
          Your friend is <span className="font-semibold text-accent">{friendArchetype}</span>. What
          are you?
        </p>
      ) : null}

      <h1 className="mt-8 font-display text-5xl font-black leading-[0.95] tracking-tight">
        Which footballer matches your vibe?
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
      <p className="mt-6 text-xs text-muted">Free · ~30 seconds · no sign-up</p>
    </main>
  );
}
