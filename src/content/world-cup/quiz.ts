/**
 * World Cup variant — the tap quiz (Stage 1 content).
 *
 * This is *content*, not engine. It plugs into the generic engine via QuizConfig.
 * The quiz reads the user's vibe; the engine maps that vibe onto the 5 football
 * style-axes and then onto a player. No football knowledge required to answer.
 *
 * Axes (all normalized to [0,1] downstream):
 *   intensity  — calm/patient ............ relentless/high-energy
 *   flair      — simple/efficient ........ flashy/improvisational
 *   workrate   — conserves energy ........ tireless/covers every blade
 *   composure  — volatile/on-the-edge .... ice-cold/unflappable
 *   teamplay   — individualist ........... selfless/makes others better
 */

import type { DimensionId, QuizConfig } from "@/engine";

export const WC_DIMENSIONS = [
  "intensity",
  "flair",
  "workrate",
  "composure",
  "teamplay",
] as const satisfies readonly DimensionId[];

export const worldCupQuiz: QuizConfig = {
  id: "world-cup-2026",
  title: "Which footballer matches your vibe?",
  dimensions: [...WC_DIMENSIONS],
  questions: [
    {
      id: "weekend",
      prompt: "It's the weekend. Your ideal energy is…",
      options: [
        { id: "slow", label: "Slow morning, nothing planned", weights: { composure: 1 } },
        { id: "plan", label: "One good plan, no rush", weights: { intensity: 1, composure: 1 } },
        { id: "packed", label: "Packed day, always moving", weights: { intensity: 2, workrate: 1 } },
        { id: "chaos", label: "Spontaneous chaos, see where it goes", weights: { intensity: 2, flair: 1 } },
      ],
    },
    {
      id: "group",
      prompt: "In a group project, you're the one who…",
      options: [
        { id: "quiet", label: "Quietly does the work, properly", weights: { workrate: 2 } },
        { id: "idea", label: "Has the wild idea nobody saw coming", weights: { flair: 2 } },
        { id: "glue", label: "Keeps everyone together and on track", weights: { teamplay: 2, composure: 1 } },
        { id: "carry", label: "Takes over and carries it", weights: { intensity: 1, flair: 1 } },
      ],
    },
    {
      id: "pressure",
      prompt: "Under pressure, you…",
      options: [
        { id: "cold", label: "Go ice-cold and focus", weights: { composure: 2 } },
        { id: "loud", label: "Feed off it, get louder", weights: { intensity: 2 } },
        { id: "think", label: "Overthink it, but deliver", weights: { workrate: 2, composure: 1 } },
        { id: "improv", label: "Do something nobody expected", weights: { flair: 2 } },
      ],
    },
    {
      id: "friends",
      prompt: "Your friends would call you…",
      options: [
        { id: "reliable", label: "Reliable", weights: { workrate: 2, composure: 1 } },
        { id: "unpredictable", label: "Unpredictable", weights: { flair: 2 } },
        { id: "intense", label: "Intense", weights: { intensity: 2 } },
        { id: "theglue", label: "The glue", weights: { teamplay: 2 } },
      ],
    },
    {
      id: "win",
      prompt: "When you win, you…",
      options: [
        { id: "next", label: "Stay humble, already onto the next", weights: { composure: 2 } },
        { id: "announce", label: "Let everyone know", weights: { flair: 2 } },
        { id: "thank", label: "Thank the people who carried you", weights: { teamplay: 2 } },
        { id: "earned", label: "Celebrate hard — you earned it", weights: { intensity: 2 } },
      ],
    },
    {
      id: "problems",
      prompt: "Your approach to problems…",
      options: [
        { id: "grind", label: "Grind it out, no shortcuts", weights: { workrate: 2 } },
        { id: "angle", label: "Find the clever angle", weights: { flair: 2 } },
        { id: "calm", label: "Stay calm, solve it step by step", weights: { composure: 2 } },
        { id: "rally", label: "Rally people to help", weights: { teamplay: 2 } },
      ],
    },
    {
      id: "oneword",
      prompt: "Your vibe in one word:",
      options: [
        { id: "relentless", label: "Relentless", weights: { intensity: 2, workrate: 1 } },
        { id: "effortless", label: "Effortless", weights: { flair: 2 } },
        { id: "steady", label: "Steady", weights: { composure: 2 } },
        { id: "magnetic", label: "Magnetic", weights: { teamplay: 2, flair: 1 } },
      ],
    },
  ],
};
