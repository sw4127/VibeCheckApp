import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buildProfile, missingAnswers, type Answers } from "@/engine";
import { worldCup, playerMeta } from "@/content/world-cup";
import { type WorldCupReading } from "@/llm";
import { baseUrl, cardPath } from "@/lib/site";
import DownloadButton from "./DownloadButton";

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

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const answers = answersFrom(await searchParams);
  if (missingAnswers(worldCup.quiz, answers).length > 0) {
    return { title: "Vibe Check" };
  }
  // OG image is computed from the deterministic profile only — no model call.
  const profile = buildProfile(
    worldCup.quiz,
    worldCup.archetypes,
    worldCup.roster,
    answers,
  );
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
      intensity: profile.normalized.intensity,
      flair: profile.normalized.flair,
    });
  return {
    title: `You play like ${profile.match.label} — Vibe Check`,
    description: `Your vibe is ${profile.archetype.label}. Take the quiz and find your World Cup match.`,
    openGraph: {
      title: `You play like ${profile.match.label}`,
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", images: [og] },
  };
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const answers = answersFrom(await searchParams);
  if (missingAnswers(worldCup.quiz, answers).length > 0) redirect("/quiz");

  // Go through the cached reading endpoint so identical answers dedupe at the
  // edge instead of re-calling the model on every view.
  const res = await fetch(`${baseUrl()}/api/reading?${orderedQuery(answers)}`, {
    cache: "force-cache",
  });
  const data: {
    match: { id: string; label: string; tags?: string[] };
    scores: Record<string, number>;
    reading: WorldCupReading;
  } = await res.json();
  const r = data.reading;

  const meta = playerMeta[data.match.id];
  const cardArgs = {
    archetype: r.archetype,
    player: r.player,
    verdict: r.verdict,
    traits: r.shared_traits,
    position: meta?.position,
    nation: meta?.nation,
    intensity: data.scores.intensity,
    flair: data.scores.flair,
  };
  const storyUrl = cardPath({ format: "story", ...cardArgs });
  const squareUrl = cardPath({ format: "square", ...cardArgs });

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-10">
      <div className="w-full max-w-md">
        <p className="text-center text-xs font-bold tracking-[0.3em] text-indigo-300">
          YOUR RESULT
        </p>

        <div className="mt-4 text-center">
          <p className="text-sm text-slate-400">YOUR VIBE IS</p>
          <h1 className="text-4xl font-extrabold">{r.archetype}</h1>
          <p className="mt-4 text-sm text-slate-400">YOU PLAY LIKE</p>
          <p className="text-3xl font-extrabold text-indigo-300">{r.player}</p>
        </div>

        <p className="mt-6 text-center text-lg leading-relaxed text-slate-200">
          {r.verdict}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {r.shared_traits.map((t) => (
            <span
              key={t}
              className="rounded-full border border-indigo-400/60 px-4 py-1.5 text-sm font-semibold"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Shareable card preview — long-press to save in app browsers */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={storyUrl} alt="Your shareable Vibe Check card" className="w-full" />
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <DownloadButton url={storyUrl} label="Download (Story)" filename="vibe-check-story.png" />
          <DownloadButton url={squareUrl} label="Download (Square)" filename="vibe-check-square.png" />
        </div>

        {/* CTA toward the Stage 2 music product */}
        <div className="mt-10 rounded-2xl bg-indigo-500/10 p-6 text-center">
          <p className="text-lg font-bold">{r.teaser}</p>
          <button
            type="button"
            disabled
            className="mt-4 cursor-not-allowed rounded-full bg-indigo-500/40 px-6 py-3 text-sm font-bold text-white/70"
          >
            Read my music taste — coming soon
          </button>
        </div>

        <div className="mt-8 text-center">
          <Link href="/quiz" className="text-sm text-slate-400 underline">
            Take the quiz again
          </Link>
        </div>
      </div>
    </main>
  );
}
