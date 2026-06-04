import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { archetypeRarityPct } from "@/engine";
import { worldCup, buildCardDesign } from "@/content/world-cup";
import { baseUrl, cardPath } from "@/lib/site";
import { decodeChallenger, compareVerdict, type Challenger } from "@/lib/vs";
import ShareButton from "@/app/result/ShareButton";
import Track from "@/components/Track";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function param(sp: Record<string, string | string[] | undefined>, k: string): string | undefined {
  const v = sp[k];
  return typeof v === "string" ? v : undefined;
}

function themCard(them: Challenger, format: "og" | "square") {
  const tags = worldCup.roster.centroids.find((c) => c.id === them.playerId)?.tags;
  return cardPath({
    format,
    archetype: them.archetypeLabel,
    player: them.playerLabel,
    traits: tags,
    position: them.position,
    nation: them.nation,
    signature: them.signature,
    rarity: archetypeRarityPct(worldCup.quiz, worldCup.archetypes, them.archetypeId),
  });
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const them = decodeChallenger(param(await searchParams, "them"));
  if (!them) return { title: "Vibe Check" };
  const og = baseUrl() + themCard(them, "og");
  return {
    title: `Can you out-vibe ${them.playerLabel}? — Vibe Check`,
    description: `Your friend is ${them.archetypeLabel}. Take the quiz and see who wins.`,
    openGraph: { title: `Can you out-vibe ${them.playerLabel}?`, images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [og] },
  };
}

function Bars({ sig, accent }: { sig: number[]; accent: string }) {
  return (
    <div className="flex h-12 items-end gap-1.5">
      {sig.map((v, i) => (
        <div key={i} className="flex w-2.5 items-end" style={{ height: "100%" }}>
          <div className="w-full rounded" style={{ height: `${Math.max(8, v * 100)}%`, background: accent }} />
        </div>
      ))}
    </div>
  );
}

function Side({ label, c }: { label: string; c: Challenger }) {
  const accent = buildCardDesign({ position: c.position, nation: c.nation }).palette.accent;
  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <p className="text-[10px] font-bold tracking-[0.3em] text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-black leading-tight">{c.archetypeLabel}</p>
      <p className="mt-1 font-display text-lg font-semibold" style={{ color: accent }}>
        {c.playerLabel}
      </p>
      <div className="mt-3">
        <Bars sig={c.signature} accent={accent} />
      </div>
    </div>
  );
}

export default async function VsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const them = decodeChallenger(param(sp, "them"));
  if (!them) redirect("/quiz");
  const me = decodeChallenger(param(sp, "me"));
  const themToken = param(sp, "them")!;
  const origin = baseUrl();
  const themAccent = buildCardDesign({ position: them.position, nation: them.nation }).palette.accent;

  // No "me" yet → challenge-accepted screen.
  if (!me) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-6 py-10 text-center">
        <Track event="vs_view" props={{ stage: "challenge", them: them.archetypeId }} />
        <p className="text-xs font-bold tracking-[0.4em]" style={{ color: themAccent }}>
          VIBE CHECK · CHALLENGE
        </p>
        <h1 className="mt-8 font-display text-4xl font-black leading-tight">
          Your friend is{" "}
          <span style={{ color: themAccent }}>{them.archetypeLabel}</span>.
        </h1>
        <p className="mt-3 text-lg text-muted">
          They play like {them.playerLabel}. Think you&apos;re different?
        </p>
        <div className="mt-8 w-56 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={themCard(them, "square")} alt={`${them.playerLabel} card`} className="w-full" />
        </div>
        <Link
          href={`/quiz?vs=${encodeURIComponent(themToken)}`}
          className="mt-9 inline-block rounded-full bg-accent px-10 py-4 text-lg font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
        >
          Take the quiz — settle it
        </Link>
        <p className="mt-5 text-xs text-muted">Free · ~30 seconds · no sign-up</p>
      </main>
    );
  }

  // Both present → head-to-head.
  const meAccent = buildCardDesign({ position: me.position, nation: me.nation }).palette.accent;
  const verdict = compareVerdict(me.signature, them.signature);
  const shareUrl = `${origin}/vs?them=${encodeURIComponent(themToken)}&me=${encodeURIComponent(param(sp, "me")!)}&ref=vs`;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10">
      <Track event="vs_view" props={{ stage: "result", me: me.archetypeId, them: them.archetypeId }} />
      <p className="text-center text-xs font-bold tracking-[0.4em] text-accent">VIBE CHECK · HEAD-TO-HEAD</p>

      <div className="mt-10 flex items-start gap-3">
        <Side label="YOU" c={me} />
        <div className="flex items-center pt-8 font-display text-2xl font-black text-muted">vs</div>
        <Side label="FRIEND" c={them} />
      </div>

      <p className="mt-10 text-center font-display text-2xl font-semibold leading-snug">{verdict}</p>

      <div className="mt-10 flex flex-col items-center gap-3">
        <ShareButton url={shareUrl} text={`${verdict} Who are you?`} label="Share the matchup" event="share_vs" accent={meAccent} primary />
        <Link href="/quiz" className="text-sm text-muted underline">
          Take the quiz again
        </Link>
      </div>
    </main>
  );
}
