/**
 * World Cup variant content bundle — everything the engine needs for Stage 1,
 * in one import. Stage 2 will add a parallel `content/music` bundle of the same
 * shape and the rest of the app won't change.
 */

import type { CentroidSet, QuizConfig } from "@/engine";
import { worldCupArchetypes } from "./archetypes";
import { worldCupQuiz, WC_DIMENSIONS } from "./quiz";
import { worldCupRoster } from "./roster";

export interface VariantBundle {
  quiz: QuizConfig;
  archetypes: CentroidSet;
  roster: CentroidSet;
}

export const worldCup: VariantBundle = {
  quiz: worldCupQuiz,
  archetypes: worldCupArchetypes,
  roster: worldCupRoster,
};

export { worldCupQuiz, worldCupArchetypes, worldCupRoster, WC_DIMENSIONS };
