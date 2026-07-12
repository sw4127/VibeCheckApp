/**
 * Prestige-Bias Test item pool — POOL OF RECORD v2 (wired 2026-07-12).
 *
 * Authority chain: docs/bias-pool-candidates.md (items + blurb drafts) →
 * docs/bias-pool-gatekeeping.md (per-item checks) → src/content/bias/
 * manifest.json (sources, SHA-256s, license snapshots, PM rulings, windows)
 * → this file. Audio rendered by scripts/clip-pipeline (20s excerpts,
 * EBU R128 two-pass to −16 LUFS, mp3 + m4a).
 *
 * PM ear pass of record: manifest.pmEarPass (no veto, 2026-07-12); pb4/pb8
 * joined after that pass and await the same check. pb6 is PROVISIONAL
 * (professional reviewer pending) — swapping it bumps BIAS_POOL_VERSION.
 *
 * Swap items (labelIsTrue: false) show a FICTIONAL artist + framing — the
 * sanctioned deception (memo §3), confessed with true attribution on the
 * mandatory debrief. Fictional names must never be real artists (checklist
 * §B); the current names are engineer drafts pending the PM C.1 pass.
 *
 * Array order = presentation order (genre-interleaved so no two adjacent
 * clips share a sound-world). DO NOT reorder, add, remove, or re-render
 * without bumping BIAS_POOL_VERSION — share URLs and the D6 dataset key on
 * the item order of the version that produced them.
 */

import type { BiasItemSpec } from "@/engine/bias";

export const BIAS_INSTRUMENT_ID = "prestige-bias-v1";

/**
 * Pool version (RT-7b). BUMP THIS ON ANY POOL CHANGE — items added, removed,
 * reordered, relabeled, re-windowed, or re-rendered. It rides in every share
 * URL and every bias_result event, so stored responses and old links are
 * permanently interpretable against the exact pool that produced them (D6).
 * Old-version URLs die gracefully (redirect to /bias), never lie.
 */
export const BIAS_POOL_VERSION = 2;

/** One playable, labelable clip. Extends the engine spec with presentation. */
export interface BiasClip extends BiasItemSpec {
  /** Static file under /public — PD/CC audio only (memo §8.2). */
  audioSrc: string;
  /** Truthful attribution (revealed at debrief). */
  trueArtist: string;
  /** What the labeled pass shows. Equals the truth when labelIsTrue. */
  shownArtist: string;
  /** One-line acclaim (direction "up") or dismissal (direction "down"). */
  shownBlurb: string;
  /** License of the recording, e.g. "Public Domain" | "CC-BY 4.0". */
  license: string;
  /** Required credit line for CC works; TASL + excerpt notice. */
  attribution: string;
}

export const BIAS_CLIPS: BiasClip[] = [
  {
    id: "pb1",
    audioSrc: "/audio/bias/pb1.mp3",
    trueArtist: "J.S. Bach — Kimiko Ishizaka, piano (Open Goldberg Variations)",
    shownArtist: "M. Novak — home piano sessions",
    shownBlurb: "A crowd-funded amateur recording; often cited as an example of why great works need great labels.",
    license: "CC0",
    attribution:
      "“Goldberg Variations — Variatio 13 a 2 Clav.” — J.S. Bach, perf. Kimiko Ishizaka · archive.org/details/The_Open_Goldberg_Variations-11823 · CC0 · excerpt (trimmed + loudness-normalized)",
    labelDirection: "down",
    labelIsTrue: false, // down-swap: dismissive fiction on a strong work
  },
  {
    id: "pb7",
    audioSrc: "/audio/bias/pb7.mp3",
    trueArtist: "Komiku",
    shownArtist: "Noé Calvet",
    shownBlurb: "A minimalist study praised on year-end experimental lists for doing more with less.",
    license: "CC0",
    attribution:
      "“The road we use to travel when we were kids” (Tale on the Late) — Komiku · archive.org/details/Komiku-TaleOnTheLate · CC0 · excerpt (trimmed + loudness-normalized)",
    labelDirection: "up",
    labelIsTrue: false, // up-swap (RT-9b): acclaim fiction on a modest work
  },
  {
    id: "pb3",
    audioSrc: "/audio/bias/pb3.mp3",
    trueArtist: "F. Chopin — Musopen Complete Chopin project",
    shownArtist: "F. Chopin — Musopen Complete Chopin project",
    shownBlurb: "The nocturne recital programmers skip; even devoted Chopin listeners rarely defend it.",
    license: "CC0",
    attribution:
      "“Nocturne Op. 15 No. 3 in G minor” — F. Chopin, perf. Musopen Complete Chopin project · archive.org/details/musopen-chopin-complete-works-flac · CC0 · excerpt (trimmed + loudness-normalized)",
    labelDirection: "down",
    labelIsTrue: true,
  },
  {
    id: "pb6",
    audioSrc: "/audio/bias/pb6.mp3",
    trueArtist: "Chris Zabriskie",
    shownArtist: "Alexander Vane",
    shownBlurb: "Festival-commissioned; the closing piece of an award-winning installation about memory.",
    license: "CC-BY 4.0",
    attribution:
      "“That Hopeful Future Is All I've Ever Known” (Music from Neptune Flux) — Chris Zabriskie · CC-BY 4.0 (teamopen.cc/chris) · excerpt (trimmed + loudness-normalized)",
    labelDirection: "up",
    labelIsTrue: false, // up-swap: acclaim fiction on a lesser-known work
  },
  {
    id: "pb2",
    audioSrc: "/audio/bias/pb2.mp3",
    trueArtist: "J.S. Bach — Kimiko Ishizaka, piano",
    shownArtist: "J.S. Bach — Kimiko Ishizaka, piano",
    shownBlurb: "From a recording project so admired it was placed in the public domain as a cultural gift.",
    license: "CC0",
    attribution:
      "“Well-Tempered Clavier Bk 1 — Prelude No. 12 in F minor, BWV 857” — J.S. Bach, perf. Kimiko Ishizaka · archive.org/details/bach-well-tempered-clavier-book-1 · CC0 · excerpt (trimmed + loudness-normalized)",
    labelDirection: "up",
    labelIsTrue: true,
  },
  {
    id: "pb8",
    audioSrc: "/audio/bias/pb8.mp3",
    trueArtist: "Jason Shaw (Audionautix)",
    shownArtist: "Jason Shaw (Audionautix)",
    shownBlurb: "Stock production music, written to be inoffensive; the audio equivalent of a waiting room.",
    license: "CC-BY 4.0",
    attribution:
      "“Folk Bed” — music by audionautix.com (Jason Shaw) · audionautix.com/creative-commons-music · CC-BY 4.0 · excerpt (trimmed + loudness-normalized)",
    labelDirection: "down",
    labelIsTrue: true,
  },
  {
    id: "pb5",
    audioSrc: "/audio/bias/pb5.mp3",
    trueArtist: "F. Chopin — Musopen Complete Chopin project",
    shownArtist: "F. Chopin — Musopen Complete Chopin project",
    shownBlurb: "Late-period Chopin at its most refined — the mazurka connoisseurs reach for when they want the form taken seriously.",
    license: "CC0",
    attribution:
      "“Mazurka in A minor, Op. 59 No. 1” — F. Chopin, perf. Musopen Complete Chopin project · archive.org/details/musopen-chopin-complete-works-flac · CC0 · excerpt (trimmed + loudness-normalized)",
    labelDirection: "up",
    labelIsTrue: true,
  },
  {
    id: "pb4",
    audioSrc: "/audio/bias/pb4.mp3",
    trueArtist: "L. van Beethoven — Musopen Kickstarter ensemble",
    shownArtist: "L. van Beethoven — Musopen Kickstarter ensemble",
    shownBlurb: "The movement scholars point to when they argue early Beethoven was already looking decades ahead.",
    license: "Public Domain (Musopen Kickstarter release)",
    attribution:
      "“String Quartet Op. 18 No. 6 — IV. La Malinconia (Adagio)” — L. van Beethoven, perf. Musopen Kickstarter ensemble · archive.org/details/MusopenCollectionAsFlac · Public Domain · excerpt (trimmed + loudness-normalized)",
    labelDirection: "up",
    labelIsTrue: true,
  },
];
