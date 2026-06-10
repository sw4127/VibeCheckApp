import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { archetypeRarityPct, missingAnswers, type Answers } from "@/engine";
import {
  buildMusicProfile,
  musicQuiz,
  musicArchetypes,
  musicPremiumProfile,
  ARCHETYPE_THEMES,
} from "@/content/music";
import type { MusicReading } from "@/llm";
import { baseUrl, cardPath } from "@/lib/site";
import { encodePremiumToken } from "@/lib/premiumToken";
import ShareButton from "@/app/result/ShareButton";
import DownloadButton from "@/app/result/DownloadButton";
import Track from "@/components/Track";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Web accent per theme — mirrors the card route's THEME_ACCENTS (§16.E). */
const THEME_ACCENTS: Record<string, string> = {
  ember: "#ff7a45",
  midnight: "#6ea8ff",
  neon: "#c04dff",
  bloom: "#ff5fa2",
  static: "#e8e8ea",
};

function answersFrom(sp: Record<string, string | string[] | undefined>): Answers {
  const answers: Answers = {};
  for (const q of musicQuiz.questions) {
    const v = sp[q.id];
    if (typeof v === "string") answers[q.id] = v;
  }
  return answers;
}

function csv(v: string | string[] | undefined): string[] {
  return (typeof v === "string" ? v : "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function orderedQuery(answers: Answers, ar: string[], ad: string[]): string {
  const qs = new URLSearchParams();
  for (const q of musicQuiz.questions) qs.set(q.id, answers[q.id]);
  if (ar.length) qs.set("ar", ar.join(","));
  if (ad.length) qs.set("ad", ad.join(","));
  return qs.toString();
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const answers = answersFrom(sp);
  if (missingAnswers(musicQuiz, answers).length > 0) return { title: "Vibe Check" };
  const profile = buildMusicProfile(answers);
  const theme = ARCHETYPE_THEMES[profile.archetype.id] ?? "midnight";
  const og =
    baseUrl() +
    cardPath({
      format: "og",
      mode: "music",
      theme,
      archetype: profile.archetype.label,
      traits: profile.archetype.tags,
      signature: musicQuiz.dimensions.map((d) => profile.normalized[d] ?? 0.5),
      rarity: archetypeRarityPct(musicQuiz, musicArchetypes, profile.archetype.id),
    });
  return {
    title: `My vibe is ${profile.archetype.label} — Vibe Check`,
    description: "Your taste has been taking notes on you. Get read.",
    openGraph: { title: `My vibe is ${profile.archetype.label}`, images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [og] },
  };
}

export default async function MusicResultPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const answers = answersFrom(sp);
  if (missingAnswers(musicQuiz, answers).length > 0) redirect("/music/quiz");
  const ar = csv(sp.ar);
  const ad = csv(sp.ad).slice(0, 1);

  const res = await fetch(`${baseUrl()}/api/music-reading?${orderedQuery(answers, ar, ad)}`, {
    cache: "force-cache",
  });
  const data: {
    archetype: { id: string; label: string; tags?: string[] };
    theme: string;
    scores: Record<string, number | undefined>;
    rarity: number;
    reading: MusicReading;
    source: string;
  } = await res.json();
  const r = data.reading;
  const accent = THEME_ACCENTS[data.theme] ?? THEME_ACCENTS.midnight;
  const signature = musicQuiz.dimensions.map((d) => data.scores[d] ?? 0.5);

  // Thread the REAL profile to the paywall, statelessly (§17.B routing applied).
  const profile = buildMusicProfile(answers);
  const token = encodePremiumToken(musicPremiumProfile(profile, ar, ad));

  const cardArgs = {
    mode: "music" as const,
    theme: data.theme,
    archetype: r.archetype,
    verdict: r.vibe_check,
    traits: r.tags,
    signature,
    rarity: data.rarity,
  };
  const storyUrl = cardPath({ format: "story", ...cardArgs });
  const squareUrl = cardPath({ format: "square", ...cardArgs });
  const shareUrl = `${baseUrl()}/music/result?${orderedQuery(answers, [], [])}&ref=card`;
  const shareText = `My vibe is ${r.archetype}. Apparently my taste has been taking notes. What's yours?`;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-8">
      <Track
        event="result_view"
        props={{ variant: "music", archetype: data.archetype.id, rarity: data.rarity, source: data.source }}
      />
      <p className="text-xs font-bold tracking-[0.4em]" style={{ color: accent }}>
        VIBE CHECK
      </p>

      <div className="mt-8">
        <p className="text-xs font-bold tracking-[0.35em] text-muted">YOUR VIBE IS</p>
        <h1 className="mt-2 font-display text-6xl font-black leading-[0.92] tracking-tight">
          {r.archetype}
        </h1>
      </div>

      <p className="mt-7 text-xl leading-relaxed">{r.vibe_check}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {r.tags.map((t) => (
          <span
            key={t}
            className="rounded-full px-4 py-1.5 text-sm font-semibold"
            style={{ border: `1px solid ${accent}66` }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Vibe signature + rarity */}
      <div className="mt-8 flex items-end justify-between pt-6" style={{ borderTop: `1px solid ${accent}33` }}>
        <div className="flex h-16 items-end gap-2" aria-label="Your vibe signature">
          {signature.map((v, i) => (
            <div key={i} className="flex w-3.5 items-end" style={{ height: "100%" }}>
              <div className="w-full rounded" style={{ height: `${Math.max(8, v * 100)}%`, background: accent }} />
            </div>
          ))}
        </div>
        <div className="text-right">
          <div className="font-display text-4xl font-black leading-none" style={{ color: accent }}>
            {data.rarity}%
          </div>
          <div className="mt-1 text-[10px] font-bold tracking-[0.25em] text-muted">SHARE YOUR VIBE</div>
        </div>
      </div>

      {/* THE conversion moment (§17.D): peak curiosity → the paywall, real profile attached */}
      <Link
        href={`/premium/preview?t=${token}`}
        className="mt-8 block rounded-2xl p-6 text-center"
        style={{ background: `${accent}14`, border: `1px solid ${accent}40` }}
      >
        <p className="font-display text-2xl font-semibold leading-snug">{r.teaser}</p>
        <span
          className="mt-4 inline-block rounded-full px-8 py-3.5 text-base font-bold text-white"
          style={{ background: accent }}
        >
          Get the full read →
        </span>
      </Link>

      {/* Share */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={storyUrl} alt="Your shareable Vibe Check card" className="w-full" />
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <ShareButton url={shareUrl} text={shareText} label="Share my card" event="share_native" accent={accent} primary />
        <DownloadButton url={storyUrl} label="Download (Story)" filename="vibe-check-story.png" />
        <DownloadButton url={squareUrl} label="Download (Square)" filename="vibe-check-square.png" />
      </div>

      <div className="mt-8 mb-2 text-center">
        <Link href="/music/quiz" className="text-sm text-muted underline">
          Take it again
        </Link>
      </div>
    </main>
  );
}
