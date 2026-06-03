/**
 * GET /api/reading?<questionId>=<optionId>&...
 *
 * Deterministic by query string: scores the answers (engine), then narrates
 * (LLM writer-only). Sets long CDN cache headers so identical answers serve
 * from Vercel's edge instead of re-calling the model — the approved "HTTP cache
 * headers, no DB" approach (survives cold starts, costs nothing).
 */
import type { Answers } from "@/engine";
import { archetypeRarityPct, buildProfile, missingAnswers } from "@/engine";
import { worldCup } from "@/content/world-cup";
import { narrateWorldCup } from "@/llm";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const answers: Answers = {};
  for (const q of worldCup.quiz.questions) {
    const v = searchParams.get(q.id);
    if (v !== null) answers[q.id] = v;
  }

  const missing = missingAnswers(worldCup.quiz, answers);
  if (missing.length > 0) {
    return Response.json(
      { error: "incomplete_answers", missing },
      { status: 400 },
    );
  }

  const profile = buildProfile(
    worldCup.quiz,
    worldCup.archetypes,
    worldCup.roster,
    answers,
  );
  const { reading, source } = await narrateWorldCup(
    profile,
    worldCup.quiz.dimensions,
  );

  return Response.json(
    {
      hash: profile.hash,
      archetype: profile.archetype,
      match: profile.match,
      scores: profile.normalized,
      rarity: archetypeRarityPct(worldCup.quiz, worldCup.archetypes, profile.archetype.id),
      reading,
      source,
    },
    {
      headers: {
        // Deterministic input → safe to cache hard at the edge.
        "Cache-Control":
          "public, s-maxage=31536000, stale-while-revalidate=86400",
      },
    },
  );
}
