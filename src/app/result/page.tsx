import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  archetypeRarityPct,
  buildProfile,
  missingAnswers,
  type Answers,
} from "@/engine";
import { worldCup, playerMeta, buildCardDesign } from "@/content/world-cup";
import { type WorldCupReading } from "@/llm";
import { baseUrl, cardPath } from "@/lib/site";
import { encodeChallenger } from "@/lib/vs";
import { buildSignatureRows, FOOTBALL_SIGNATURE_LABELS } from "@/lib/signature";
import DownloadButton from "./DownloadButton";
import ShareButton from "./ShareButton";
import SignatureChart from "@/components/SignatureChart";
import Track from "@/components/Track";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function answersFrom(sp: Record<string, string | string[] | undefined>): Answers {
  const answers: Answers = {};
  for (const q of worldCup.quiz.questions) {
    const v = sp[q.id];
    if (typeof v === "string") answers[q.id] = v;
  }
  return answers;
}

function orderedQuery(answers: Answers): string {
  const qs = new URLSearchParams();
  for (const q of worldCup.quiz.questions) qs.set(q.id, answers[q.id]);
  return qs.toString();
}

function signatureOf(scores: Record<string, number | undefined>): number[] {
  return worldCup.quiz.dimensions.map((d) => scores[d] ?? 0.5);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const answers = answersFrom(await searchParams);
  if (missingAnswers(worldCup.quiz, answers).length > 0) return { title: "Vibe Check" };

  const profile = buildProfile(worldCup.quiz, worldCup.archetypes, worldCup.roster, answers);
  const meta = playerMeta[profile.match.id];
  const og =
    baseUrl() +
    cardPath({
      format: "og",
      archetype: profile.archetype.label,
      player: profile.match.label,
      traits: profile.match.tags,
      position: meta?.position,
      nation: meta?.nation,
      signature: signatureOf(profile.normalized),
      rarity: archetypeRarityPct(worldCup.quiz, worldCup.archetypes, profile.archetype.id),
    });
  return {
    title: `You play like ${profile.match.label} — Vibe Check`,
    description: `Your vibe is ${profile.archetype.label}. Take the quiz and find your match.`,
    openGraph: { title: `You play like ${profile.match.label}`, images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [og] },
  };
}

export default async function ResultPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const answers = answersFrom(sp);
  if (missingAnswers(worldCup.quiz, answers).length > 0) redirect("/quiz");
  const referred = typeof sp.ref === "string" ? sp.ref : undefined;

  const res = await fetch(`${baseUrl()}/api/reading?${orderedQuery(answers)}`, { cache: "force-cache" });
  const data: {
    archetype: { id: string; label: string };
    match: { id: string; label: string; tags?: string[] };
    scores: Record<string, number>;
    rarity: number;
    source: string;
    reading: WorldCupReading;
  } = await res.json();
  const r = data.reading;

  const meta = playerMeta[data.match.id];
  const accent = buildCardDesign({ position: meta?.position, nation: meta?.nation }).palette.accent;
  const caption = buildCardDesign({ position: meta?.position, nation: meta?.nation }).caption;
  const signature = signatureOf(data.scores);
  const sigRows = buildSignatureRows(worldCup.quiz, answers, data.scores, FOOTBALL_SIGNATURE_LABELS);
  const topRows = [...sigRows].sort((a, b) => b.value - a.value).slice(0, 3)
    .map((r) => ({ label: r.label, value: r.value }));

  const cardArgs = {
    archetype: r.archetype,
    player: r.player,
    verdict: r.verdict,
    traits: r.shared_traits,
    position: meta?.position,
    nation: meta?.nation,
    signature,
    sigRows: topRows,
    rarity: data.rarity,
  };
  const storyUrl = cardPath({ format: "story", ...cardArgs });
  const squareUrl = cardPath({ format: "square", ...cardArgs });

  // Share = a tappable LINK (unfurls the OG card); challenge = the /vs loop.
  const origin = baseUrl();
  const meToken = encodeChallenger({
    archetypeId: data.archetype.id,
    playerId: data.match.id,
    signature,
  });
  const shareUrl = `${origin}/result?${orderedQuery(answers)}&ref=card&from=${data.archetype.id}`;
  const challengeUrl = `${origin}/vs?them=${meToken}&ref=vs`;
  const shareText = `I'm ${r.archetype} — I play like ${r.player}. Which footballer are you?`;
  const challengeText = `I'm ${r.archetype}. Bet you can't out-vibe me 😤`;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-8">
      <Track
        event="result_view"
        props={{ archetype: data.archetype.id, player: data.match.id, rarity: data.rarity, source: data.source }}
      />
      <p className="text-xs font-bold tracking-[0.4em]" style={{ color: accent }}>
        VIBE CHECK
      </p>

      {/* Referred visitor (arrived from a shared card/challenge) — push to their own */}
      {referred ? (
        <Link
          href="/quiz"
          className="mt-5 block rounded-2xl border border-white/10 p-4 text-center text-sm font-semibold"
          style={{ background: `${accent}14` }}
        >
          👀 This is your friend&apos;s vibe — <span style={{ color: accent }}>find yours →</span>
        </Link>
      ) : null}

      {/* The reveal */}
      <div className="mt-8">
        <p className="text-xs font-bold tracking-[0.35em] text-muted">YOUR VIBE IS</p>
        <h1 className="mt-2 font-display text-6xl font-black leading-[0.92] tracking-tight">
          {r.archetype}
        </h1>
        <p className="mt-6 text-xs font-bold tracking-[0.35em] text-muted">YOU PLAY LIKE</p>
        <p className="mt-1 font-display text-4xl font-semibold" style={{ color: accent }}>
          {r.player}
        </p>
        <p className="mt-2 text-sm text-muted tracking-wide">{caption}</p>
      </div>

      <p className="mt-7 text-xl leading-relaxed">{r.verdict}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {r.shared_traits.map((t) => (
          <span
            key={t}
            className="rounded-full px-4 py-1.5 text-sm font-semibold"
            style={{ border: `1px solid ${accent}66` }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Vibe signature — ranked, labelled, receipted (the proof of real analysis) */}
      <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${accent}33` }}>
        <div className="text-[10px] font-bold tracking-[0.25em] text-muted">YOUR VIBE SIGNATURE</div>
        <div className="mt-4">
          <SignatureChart rows={sigRows} accent={accent} />
        </div>
      </div>

      {/* Shareable card preview — long-press to save in app browsers */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={storyUrl} alt="Your shareable Vibe Check card" className="w-full" />
      </div>

      {/* Actions — link-first share + the challenge loop, image downloads below */}
      <div className="mt-5 flex flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center gap-3">
          <ShareButton
            url={shareUrl}
            text={shareText}
            label="Share my card"
            event="share_native"
            accent={accent}
            primary
          />
          <ShareButton
            url={challengeUrl}
            text={challengeText}
            label="Challenge a friend"
            event="share_challenge"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <DownloadButton url={storyUrl} label="Download (Story)" filename="vibe-check-story.png" />
          <DownloadButton url={squareUrl} label="Download (Square)" filename="vibe-check-square.png" />
        </div>
      </div>

      {/* The funnel (§16.A): WC card is the front-door; this CTA feeds the paid music read */}
      <Link
        href="/music/quiz"
        className="mt-10 block rounded-2xl p-6 text-center transition hover:opacity-95"
        style={{ background: `${accent}14`, border: `1px solid ${accent}40` }}
      >
        <p className="text-lg font-bold">{r.teaser}</p>
        <span
          className="mt-4 inline-block rounded-full px-8 py-3.5 text-sm font-bold text-white"
          style={{ background: accent }}
        >
          Read my music taste →
        </span>
      </Link>

      <div className="mt-8 mb-2 text-center">
        <Link href="/quiz" className="text-sm text-muted underline">
          Take the quiz again
        </Link>
      </div>
    </main>
  );
}
