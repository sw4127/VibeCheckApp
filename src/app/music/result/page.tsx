import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { archetypeRarityPct, missingAnswers, type Answers } from "@/engine";
import {
  buildMusicProfile,
  musicQuiz,
  musicArchetypes,
  musicPremiumProfile,
  splitLanes,
  describeState,
  ARCHETYPE_THEMES,
} from "@/content/music";
import SharpenRead from "./SharpenRead";
import { narrateMusic, type MusicReading } from "@/llm";
import { baseUrl, cardPath } from "@/lib/site";
import { cleanNames } from "@/lib/sanitize";
import { encodePremiumToken } from "@/lib/premiumToken";
import { buildSignatureRows, MUSIC_SIGNATURE_LABELS } from "@/lib/signature";
import ShareButton from "@/app/result/ShareButton";
import DownloadButton from "@/app/result/DownloadButton";
import SignatureChart from "@/components/SignatureChart";
import ResearchPanel from "@/components/ResearchPanel";
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

type MusicData = {
  archetype: { id: string; label: string; tags?: string[] };
  theme: string;
  scores: Record<string, number | undefined>;
  rarity: number;
  reading: MusicReading;
  source: string;
};

/**
 * Reading for the music result. In PROD the happy path hits the CDN-cached
 * /api/music-reading; the self-fetch is skipped in dev (no cache to gain, and a
 * server component fetching its own dev server mid-compile can return an HTML
 * error page → "Unexpected token '<'"). On dev, or any non-OK-JSON response,
 * compute the identical result in-process so the page never crashes. Names are
 * cleanNames-sanitized here too (parity with the route, §23.A).
 */
async function getMusicReading(answers: Answers, ar: string[], ad: string[], voice: "online" | "classic"): Promise<MusicData> {
  if (process.env.NODE_ENV === "production") {
    try {
      const res = await fetch(`${baseUrl()}/api/music-reading?${orderedQuery(answers, ar, ad)}&voice=${voice}`, {
        cache: "force-cache",
      });
      if (res.ok && (res.headers.get("content-type") ?? "").includes("application/json")) {
        return (await res.json()) as MusicData;
      }
    } catch {
      /* fall through to the in-process path */
    }
  }
  const profile = buildMusicProfile(answers);
  const lanes = splitLanes(profile);
  const { reading, source } = await narrateMusic(profile, lanes, cleanNames(ar, 3), cleanNames(ad, 1), voice);
  return {
    archetype: profile.archetype,
    theme: ARCHETYPE_THEMES[profile.archetype.id] ?? "midnight",
    scores: profile.normalized,
    rarity: archetypeRarityPct(musicQuiz, musicArchetypes, profile.archetype.id),
    reading,
    source,
  };
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
  // §26 — the voice arm rides the URL (stateless); separate cache key per voice.
  const voice = sp.voice === "online" ? "online" : "classic";

  const data = await getMusicReading(answers, ar, ad, voice);
  const r = data.reading;
  const accent = THEME_ACCENTS[data.theme] ?? THEME_ACCENTS.midnight;
  const signature = musicQuiz.dimensions.map((d) => data.scores[d] ?? 0.5);
  const sigRows = buildSignatureRows(musicQuiz, answers, data.scores, MUSIC_SIGNATURE_LABELS);
  const topRows = [...sigRows].sort((a, b) => b.value - a.value).slice(0, 3)
    .map((row) => ({ label: row.label, value: row.value }));

  // Thread the REAL profile to the paywall, statelessly (§17.B routing applied).
  const profile = buildMusicProfile(answers);
  const token = encodePremiumToken(musicPremiumProfile(profile, ar, ad));
  // §20.C4 — the un-blurred LATELY tease: emotional proof BEFORE the ask.
  const stateLine = describeState(splitLanes(profile).state);

  const cardArgs = {
    mode: "music" as const,
    theme: data.theme,
    archetype: r.archetype,
    verdict: r.vibe_check,
    traits: r.tags,
    signature,
    sigRows: topRows,
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
        props={{ variant: "music", archetype: data.archetype.id, rarity: data.rarity, source: data.source, voice }}
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

      {/* §20.C1 — relocated artist field: effort asked only of the hooked */}
      <Suspense fallback={null}>
        <SharpenRead accent={accent} />
      </Suspense>

      {/* Vibe signature — ranked, labelled, receipted (the proof of real analysis) */}
      <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${accent}33` }}>
        <div className="text-[10px] font-bold tracking-[0.25em] text-muted">YOUR VIBE SIGNATURE</div>
        <div className="mt-4">
          <SignatureChart rows={sigRows} accent={accent} />
        </div>
      </div>

      {/* THE conversion moment (§17.D): peak curiosity → the paywall, real profile attached */}
      <Link
        href={`/premium/preview?t=${token}`}
        className="mt-8 block rounded-2xl p-6 text-center"
        style={{ background: `${accent}14`, border: `1px solid ${accent}40` }}
      >
        {/* §20.C4 — the un-blurred LATELY line: this isn't just taste */}
        <p className="text-sm text-muted">
          Lately reads: <span className="font-semibold" style={{ color: accent }}>&ldquo;{stateLine}.&rdquo;</span>
        </p>
        <p className="mt-3 font-display text-2xl font-semibold leading-snug">{r.teaser}</p>
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

      <ResearchPanel accent={accent} />

      <div className="mt-8 mb-2 text-center">
        <Link href="/music/quiz" className="text-sm text-muted underline">
          Take it again
        </Link>
      </div>
    </main>
  );
}
