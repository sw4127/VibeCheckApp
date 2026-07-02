import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  archetypeRarityPct,
  missingWeighted,
  primaryAnswers,
  parseAnswerChoice,
  encodeAnswerChoice,
  type Answers,
  type WeightedAnswers,
} from "@/engine";
import {
  buildWeightedMusicProfile,
  composeMusicIdentity,
  musicQuiz,
  musicArchetypes,
  musicSpines,
  musicPremiumProfile,
  splitLanes,
  describeState,
  ARCHETYPE_THEMES,
} from "@/content/music";
import SharpenRead from "./SharpenRead";
import { narrateMusic, type MusicReading } from "@/llm";
import type { Composite, Profile } from "@/engine";
import { baseUrl, cardPath } from "@/lib/site";
import { cleanNames } from "@/lib/sanitize";
import { encodePremiumToken } from "@/lib/premiumToken";
import { buildSignatureRows, MUSIC_SIGNATURE_LABELS, MUSIC_SIGNATURE_POLES } from "@/lib/signature";
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

function weightedFrom(sp: Record<string, string | string[] | undefined>): WeightedAnswers {
  const answers: WeightedAnswers = {};
  for (const q of musicQuiz.questions) {
    const v = sp[q.id];
    if (typeof v === "string") answers[q.id] = parseAnswerChoice(v); // "a~b" → 70/30 blend
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

function orderedQuery(answers: WeightedAnswers, ar: string[], ad: string[]): string {
  const qs = new URLSearchParams();
  for (const q of musicQuiz.questions) qs.set(q.id, encodeAnswerChoice(answers[q.id])); // preserves blends
  if (ar.length) qs.set("ar", ar.join(","));
  if (ad.length) qs.set("ad", ad.join(","));
  return qs.toString();
}

/**
 * Narration for the pre-computed composite (matrix edition, §19.A). The engine
 * composed the identity HERE (in-process, §6); the route is a pure writer. In
 * PROD the fetch is CDN-keyed by the composite — 3,456 answer-combos collapse
 * onto ~250 cached reads. Dev, or any non-OK-JSON response, computes the
 * identical result in-process so the page never crashes. Artists no longer
 * touch narration (decision (i)) — see the deterministic receipt below.
 */
async function getMusicReading(
  composite: Composite,
  coreTags: string[],
  voice: "online" | "classic",
): Promise<{ reading: MusicReading; source: string }> {
  if (process.env.NODE_ENV === "production") {
    try {
      const qs = new URLSearchParams({
        core: composite.coreId,
        mod: composite.modifier?.id ?? "_",
        tilt: composite.tilt?.id ?? "_",
        voice,
      });
      const res = await fetch(`${baseUrl()}/api/music-reading?${qs.toString()}`, {
        cache: "force-cache",
      });
      if (res.ok && (res.headers.get("content-type") ?? "").includes("application/json")) {
        return (await res.json()) as { reading: MusicReading; source: string };
      }
    } catch {
      /* fall through to the in-process path */
    }
  }
  return narrateMusic(composite, coreTags, voice);
}

/** Deterministic artist receipt (decision (i)): names their typed artists at $0
 *  without fragmenting the narration cache. Flavor only — never scores (§6). */
function artistReceipt(ar: string[], ad: string[]): string | null {
  const r = ar[0];
  const d = ad[0];
  if (r && d) return `${r} on rotation while ${d} never leaves — your mood changes, your tells don't.`;
  if (r) return `${r} on heavy rotation is doing more confessing than you think.`;
  if (d) return `${d} for years — loyalty like that is a tell, not a coincidence.`;
  return null;
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const answers = weightedFrom(sp);
  if (missingWeighted(musicQuiz, answers).length > 0) return { title: "Vibe Check" };
  const profile = buildWeightedMusicProfile(answers);
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
  const answers = weightedFrom(sp);
  if (missingWeighted(musicQuiz, answers).length > 0) redirect("/music/quiz");
  const primary = primaryAnswers(answers); // single-pick projection for proofs
  const ar = csv(sp.ar);
  const ad = csv(sp.ad).slice(0, 1);
  // §slice-5b — the carried football archetype (display-only; never scores §6).
  const fromVibe = typeof sp.from === "string" ? sp.from.slice(0, 40) : undefined;
  // §26 — the voice arm rides the URL (stateless); separate cache key per voice.
  const voice = sp.voice === "online" ? "online" : "classic";

  // Engine first (§6): profile → composite, all in-process and deterministic.
  const profile: Profile = buildWeightedMusicProfile(answers);
  const composite = composeMusicIdentity(profile);
  const { reading: r, source } = await getMusicReading(
    composite,
    profile.archetype.tags ?? [],
    voice,
  );
  const data = {
    archetype: profile.archetype,
    theme: ARCHETYPE_THEMES[profile.archetype.id] ?? "midnight",
    scores: profile.normalized as Record<string, number | undefined>,
    rarity: archetypeRarityPct(musicQuiz, musicArchetypes, profile.archetype.id),
    source,
  };
  const accent = THEME_ACCENTS[data.theme] ?? THEME_ACCENTS.midnight;
  // §1b spine surfaced (free side): TELLS + CLOSER. The deeper REFRAME/SPLIT
  // stay behind the paywall (firewall §12/§17.D); $0, no LLM.
  const spine = musicSpines[data.archetype.id];
  const signature = musicQuiz.dimensions.map((d) => data.scores[d] ?? 0.5);
  const sigRows = buildSignatureRows(musicQuiz, primary, data.scores, MUSIC_SIGNATURE_LABELS, MUSIC_SIGNATURE_POLES);
  // Card rows: the 3 strongest LEANS, named by pole ("Loyalist 88") — the low
  // pole is a stance on the shared artifact too (§18.D).
  const topRows = [...sigRows].sort((a, b) => b.lean - a.lean).slice(0, 3)
    .map((row) => ({ label: row.direction === "mid" ? row.label : row.pole, value: row.lean }));

  // Deterministic artist receipt (decision (i)) — sanitized before display (§23.A).
  const receipt = artistReceipt(cleanNames(ar, 3), cleanNames(ad, 1));

  // Thread the REAL profile to the paywall, statelessly (§17.B routing applied).
  // §23.A: sanitize typed names BEFORE they enter the token → the Sonnet prompt
  // (the free path was sanitized; this closes the paid-path gap).
  const token = encodePremiumToken(musicPremiumProfile(profile, cleanNames(ar, 3), cleanNames(ad, 1)));
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

      {/* THE READOUT — one grouped block (Design-Bar restraint): current weather,
          durable twist, the deterministic artist receipt, and the §slice-5b
          pitch-vs-taste reveal. All engine-computed/display-only, $0 (§6). One
          accent rule instead of three stacked boxes. */}
      {(composite.tilt || composite.modifier || receipt || fromVibe) ? (
        <div
          className="mt-5 flex flex-col gap-1.5 pl-4 text-sm leading-relaxed text-muted"
          style={{ borderLeft: `2px solid ${accent}66` }}
        >
          {composite.tilt ? (
            <p>
              Lately: <span className="font-semibold" style={{ color: accent }}>{composite.stateLine}</span>
            </p>
          ) : null}
          {composite.modifier ? (
            <p>
              Your twist: <span className="font-semibold" style={{ color: accent }}>{composite.modifier.label}</span>
              {/* Don't print the authored line twice: the $0 fallback read
                  already embeds it as its second sentence. */}
              {r.vibe_check.includes(composite.modifier.line) ? null : <>{" — "}{composite.modifier.line}</>}
            </p>
          ) : null}
          {receipt ? <p>{receipt}</p> : null}
          {fromVibe ? (
            <p>
              On the pitch you read as <span className="font-semibold" style={{ color: accent }}>{fromVibe}</span>. Your taste says{" "}
              <span className="font-semibold" style={{ color: accent }}>{r.archetype}</span>. Same person — two tells.
            </p>
          ) : null}
        </div>
      ) : null}

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

      {/* The TELLS + CLOSER — deterministic "caught you" read (§1b spine, $0).
          REFRAME/SPLIT stay paid (the firewall). */}
      {spine ? (
        <div className="mt-8">
          <p className="text-[10px] font-bold tracking-[0.25em] text-muted">YOUR TELLS</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {spine.tells.map((t) => (
              <li key={t} className="flex gap-2.5 leading-relaxed">
                <span aria-hidden className="select-none font-bold" style={{ color: accent }}>—</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 font-display text-xl font-semibold leading-snug" style={{ color: accent }}>
            {spine.closer}
          </p>
        </div>
      ) : null}

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
