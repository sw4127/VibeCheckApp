/**
 * Music variant — the tap quiz (spec §10, rewritten per §18.A; reverb per §17.A).
 *
 * Content only; plugs into the generic engine (§16.F). Six axes in two LANES
 * (§17.B — routing is data here, enforced by tests, consumed by lane-split code):
 *   STATE (recent/mood → Red Flags):  energy · regulation · rumination
 *   TRAIT (durable → Diagnosis):      openness · reflective · extraversion
 * Each question's weights touch ONLY its lane's axes (lane purity = GIGO guard).
 * Every option is written to be equally ownable (§18.D symmetric desirability).
 */

import type { DimensionId, QuizConfig, QuizQuestion } from "@/engine";

export const STATE_AXES = ["energy", "regulation", "rumination"] as const;
export const TRAIT_AXES = ["openness", "reflective", "extraversion"] as const;

export const MUSIC_DIMENSIONS = [
  ...STATE_AXES,
  ...TRAIT_AXES,
] as const satisfies readonly DimensionId[];

export type Lane = "state" | "trait";

/** Which lane each question feeds (§17.B input routing, decided in code). */
export const QUESTION_LANES: Record<string, Lane> = {
  rotation: "state",
  job: "state",
  sadsong: "state",
  hooks: "trait",
  lately: "trait",
  sits: "trait",
  where: "trait",
};

/** §17.A cognitive-reverb line per option id — questions about the self, never verdicts. */
export const REVERB: Record<string, Record<string, string>> = {
  rotation: {
    calm: "Mellow on purpose. Peace — or avoidance? We'll see.",
    warm: "Comfort listening. Noted. Gently judged.",
    bright: "Soundtrack behavior. The world is your montage.",
    heavy: "Loud right now. That's a state, not a personality.",
  },
  job: {
    match: "You let the mood drive. Honest. Risky.",
    change: "You use music to fix your mood, not match it. That's a tell.",
    drown: "Noise-cancelling as a boundary. We've all been there.",
    scene: "Curating the room's feelings. Who's that really for?",
  },
  hooks: {
    lyrics: "You listen like a close reader. Everything's a text.",
    beat: "Body first, meaning later. Or never. Valid.",
    texture: "You chase atmospheres. Hard to pin down — on purpose?",
  },
  lately: {
    discover: "New tabs everywhere. Your library has commitment issues.",
    comfort: "Back to the classics. The classics being your own past.",
  },
  sits: {
    center: "Chart confident. At least you own it.",
    popular: "One foot in the charts, one in the deep end.",
    offpath: "You think your taste is yours. It's also a fingerprint.",
    nobody: "If they've heard of it, you're already done with it.",
  },
  sadsong: {
    sit: "You marinate. Most people skip. Noted.",
    gut: "Controlled demolition. Therapy with a chorus.",
    skip: "Mood-repair reflex. Quick on the eject button.",
  },
  where: {
    alone: "Headphones as architecture. A door, closed politely.",
    curate: "The aux is a responsibility and you know it.",
    people: "Music as a group sport.",
  },
};

/** §18.A neutral axis-cue per question — names the ends, never picks a side. */
export const CUES: Record<string, string> = {
  rotation: "your last week of plays — not your taste résumé",
  job: "first instinct, not the answer that sounds healthy",
  hooks: "the words · the beat · the feeling — whichever's truest, not coolest",
  lately: "the last month, not your best self",
  sits: "no points for obscurity — and none for the charts",
  sadsong: "what you actually do, not what you'd advise a friend",
  where: "where the hours actually go",
};

const questions: QuizQuestion[] = [
  {
    id: "rotation",
    prompt: "What's actually in your ears lately?",
    options: [
      { id: "calm", label: "Calm stuff — the slow-Sunday kind", weights: { energy: 0 } },
      { id: "warm", label: "Warm + easy — the background of my day", weights: { energy: 1 } },
      { id: "bright", label: "Bright + loud — main-character energy", weights: { energy: 2 } },
      { id: "heavy", label: "Heavy + intense — feel-everything volume", weights: { energy: 3 } },
    ],
  },
  {
    id: "job",
    prompt: "When you press play, what's the actual job?",
    options: [
      { id: "match", label: "Matching the mood I'm already in", weights: { regulation: 0 } },
      { id: "scene", label: "Setting a scene for whoever's around", weights: { regulation: 1 } },
      { id: "drown", label: "Drowning the world out for a while", weights: { regulation: 2 } },
      { id: "change", label: "Changing the mood — music as the fix", weights: { regulation: 3 } },
    ],
  },
  {
    id: "hooks",
    prompt: "A song grabs you. What grabbed you?",
    options: [
      { id: "beat", label: "The beat — body first", weights: { reflective: 0 } },
      { id: "texture", label: "The texture — the feeling of it", weights: { reflective: 1 } },
      { id: "lyrics", label: "The words — somebody said it right", weights: { reflective: 2 } },
    ],
  },
  {
    id: "lately",
    prompt: "Lately you're more…",
    options: [
      { id: "comfort", label: "Replaying old comforts", weights: { openness: 0 } },
      { id: "discover", label: "Chasing new finds", weights: { openness: 2 } },
    ],
  },
  {
    id: "sits",
    prompt: "Where does your taste actually sit?",
    options: [
      { id: "center", label: "Dead-center mainstream — confidently", weights: { openness: 0 } },
      { id: "popular", label: "Mostly popular, with some deep cuts", weights: { openness: 1 } },
      { id: "offpath", label: "Off the beaten path", weights: { openness: 2 } },
      { id: "nobody", label: "Proudly nobody's-heard-of-it", weights: { openness: 3 } },
    ],
  },
  {
    id: "sadsong",
    prompt: "A sad song ambushes you. You…",
    options: [
      { id: "skip", label: "Swap it for something brighter", weights: { rumination: 0 } },
      { id: "gut", label: "Let it gut you, then feel lighter", weights: { rumination: 1 } },
      { id: "sit", label: "Turn it up and sit in it", weights: { rumination: 2 } },
    ],
  },
  {
    id: "where",
    prompt: "Your listening mostly happens…",
    options: [
      { id: "alone", label: "Alone, in your own world", weights: { extraversion: 0 } },
      { id: "curate", label: "Curating for other people", weights: { extraversion: 1 } },
      { id: "people", label: "With people, out loud", weights: { extraversion: 2 } },
    ],
  },
];

export const musicQuiz: QuizConfig = {
  id: "music-v1",
  title: "What does your taste say about you?",
  dimensions: [...MUSIC_DIMENSIONS],
  questions,
};
