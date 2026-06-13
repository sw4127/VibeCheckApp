/**
 * GET /api/music-reading?<questionId>=<optionId>&...&ar=a,b,c&ad=x
 *
 * Deterministic by query string: scores the music answers (engine, two-lane
 * §17.B), then narrates (vibe_check mode, Haiku, §16.C). Artists are flavor
 * only (§6). Long CDN cache headers — same mechanism as /api/reading (§19.A).
 */
import { archetypeRarityPct, missingAnswers, type Answers } from "@/engine";
import {
  buildMusicProfile,
  musicQuiz,
  musicArchetypes,
  splitLanes,
  ARCHETYPE_THEMES,
} from "@/content/music";
import { narrateMusic } from "@/llm";
import { cleanNames } from "@/lib/sanitize";

export const runtime = "nodejs";

function csv(v: string | null): string[] {
  // §23.A (G9): user-typed names are sanitized before reaching the LLM prompt.
  return cleanNames((v ?? "").split(","), 3);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const answers: Answers = {};
  for (const q of musicQuiz.questions) {
    const v = searchParams.get(q.id);
    if (v !== null) answers[q.id] = v;
  }
  const missing = missingAnswers(musicQuiz, answers);
  if (missing.length > 0) {
    return Response.json({ error: "incomplete_answers", missing }, { status: 400 });
  }

  const artistsRecent = csv(searchParams.get("ar"));
  const artistsDurable = csv(searchParams.get("ad")).slice(0, 1);

  const profile = buildMusicProfile(answers);
  const lanes = splitLanes(profile);
  const { reading, source } = await narrateMusic(profile, lanes, artistsRecent, artistsDurable);

  return Response.json(
    {
      hash: profile.hash,
      archetype: profile.archetype,
      theme: ARCHETYPE_THEMES[profile.archetype.id] ?? "midnight",
      scores: profile.normalized,
      lanes,
      rarity: archetypeRarityPct(musicQuiz, musicArchetypes, profile.archetype.id),
      reading,
      source,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=31536000, stale-while-revalidate=86400",
      },
    },
  );
}
