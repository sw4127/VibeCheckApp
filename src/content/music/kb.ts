/**
 * §30 — Music Aesthetics KB (batch 1 of ~300; PM reviews in 25s).
 *
 * AUTHORED editorial opinion, versioned in-repo: what LIKING this artist tends
 * to signal on the six engine axes. No licensed data, no lyrics; names are
 * nominative. Deterministic runtime lookup only (no live LLM). Unknown artist
 * → the existing flavor-only path. Artists stay flavor-only in the TAP-quiz
 * verdict (§6); KB weights become engine input only in the artist-first entry
 * mode (§30 amendment).
 */
import type { ScoreVector } from "@/engine";

export interface ArtistEntry {
  id: string;
  names: string[]; // canonical first, then aliases/misspellings
  weights: ScoreVector; // energy · regulation · rumination · openness · reflective · extraversion
  confidence: "high" | "med" | "low";
  tags: string[];
  era: string;
  receipts: string[]; // §21-voiced specifics for narration slot-fill
  version: 1;
}

const w = (energy: number, regulation: number, rumination: number, openness: number, reflective: number, extraversion: number): ScoreVector =>
  ({ energy, regulation, rumination, openness, reflective, extraversion });

const e = (id: string, names: string[], weights: ScoreVector, confidence: ArtistEntry["confidence"], tags: string[], era: string, receipts: string[]): ArtistEntry =>
  ({ id, names, weights, confidence, tags, era, receipts, version: 1 });

/** BATCH 1 (24) — ubiquity + a first ring of subculture anchors. */
export const MUSIC_KB: ArtistEntry[] = [
  e("taylor-swift", ["Taylor Swift", "taylor"], w(0.6, 0.5, 0.6, 0.35, 0.7, 0.6), "high", ["pop-confessional", "era-loyal"], "2010s", ["knows which Taylor era is 'theirs' and defends it"]),
  e("drake", ["Drake"], w(0.55, 0.6, 0.5, 0.3, 0.45, 0.6), "high", ["mainstream-rap", "mood-scroll"], "2010s", ["texts they shouldn't send have a soundtrack"]),
  e("the-weeknd", ["The Weeknd", "weeknd"], w(0.65, 0.55, 0.6, 0.4, 0.4, 0.5), "high", ["dark-pop", "night-drive"], "2010s", ["the 1am drive home is a whole cinematic universe"]),
  e("billie-eilish", ["Billie Eilish", "billie"], w(0.4, 0.45, 0.7, 0.55, 0.65, 0.3), "high", ["whisper-pop", "bedroom-dark"], "2020s", ["volume low, feelings loud"]),
  e("bad-bunny", ["Bad Bunny"], w(0.85, 0.55, 0.25, 0.5, 0.25, 0.8), "high", ["reggaeton", "party-first"], "2020s", ["the pregame starts when they get the aux"]),
  e("beyonce", ["Beyoncé", "Beyonce"], w(0.75, 0.65, 0.3, 0.5, 0.45, 0.7), "high", ["excellence", "performance"], "2000s", ["treats the bathroom mirror like a stadium"]),
  e("ed-sheeran", ["Ed Sheeran"], w(0.45, 0.4, 0.4, 0.2, 0.5, 0.55), "high", ["wedding-core", "safe-hands"], "2010s", ["has cried at a wedding and pretended not to"]),
  e("ariana-grande", ["Ariana Grande", "ariana"], w(0.7, 0.6, 0.4, 0.35, 0.4, 0.65), "high", ["vocal-pop", "glitter-armor"], "2010s", ["the high note is emotional cardio"]),
  e("kendrick-lamar", ["Kendrick Lamar", "kendrick"], w(0.6, 0.45, 0.65, 0.75, 0.9, 0.4), "high", ["lyric-first", "canon"], "2010s", ["pauses the track to make you hear a bar"]),
  e("sza", ["SZA"], w(0.5, 0.45, 0.75, 0.55, 0.7, 0.4), "high", ["r&b-confessional", "overthinker"], "2020s", ["reads the lyric like it was written about them specifically"]),
  e("radiohead", ["Radiohead"], w(0.4, 0.35, 0.8, 0.85, 0.85, 0.2), "high", ["art-rock", "dread-canon"], "90s", ["has a ranked album order and will die on it"]),
  e("phoebe-bridgers", ["Phoebe Bridgers", "phoebe"], w(0.3, 0.35, 0.9, 0.65, 0.9, 0.2), "high", ["sadcore", "lyric-scalpel"], "2020s", ["the skeleton suit makes complete sense to them"]),
  e("frank-ocean", ["Frank Ocean", "frank"], w(0.4, 0.4, 0.8, 0.75, 0.85, 0.25), "high", ["r&b-auteur", "vanishing-act"], "2010s", ["still waiting for the album like it's a personality"]),
  e("lana-del-rey", ["Lana Del Rey", "lana"], w(0.35, 0.4, 0.8, 0.6, 0.75, 0.3), "high", ["americana-melancholy", "cinematic-sad"], "2010s", ["romanticizes gas stations unironically"]),
  e("the-beatles", ["The Beatles", "beatles"], w(0.5, 0.4, 0.45, 0.5, 0.6, 0.5), "med", ["canon", "inherited-taste"], "60s", ["taste inherited from a parent and never audited"]),
  e("fleetwood-mac", ["Fleetwood Mac"], w(0.5, 0.4, 0.55, 0.5, 0.6, 0.45), "med", ["soft-rock", "drama-canon"], "70s", ["knows the band's breakups better than their own"]),
  e("oasis", ["Oasis"], w(0.7, 0.4, 0.45, 0.3, 0.4, 0.7), "med", ["britpop", "terrace-anthem"], "90s", ["has a definitive Gallagher take, unprompted"]),
  e("metallica", ["Metallica"], w(0.9, 0.5, 0.4, 0.4, 0.35, 0.55), "high", ["metal", "volume-as-therapy"], "80s", ["air-drums at red lights"]),
  e("daft-punk", ["Daft Punk"], w(0.75, 0.6, 0.3, 0.65, 0.4, 0.55), "high", ["french-house", "robot-nostalgia"], "2000s", ["believes the helmet era was peak humanity"]),
  e("aphex-twin", ["Aphex Twin", "aphex"], w(0.6, 0.5, 0.5, 0.95, 0.7, 0.15), "high", ["idm", "deep-diver-bait"], "90s", ["sends songs that 'need three listens' — a warning, not a review"]),
  e("charli-xcx", ["Charli XCX", "charli"], w(0.85, 0.6, 0.35, 0.7, 0.35, 0.75), "high", ["hyperpop-adjacent", "it-girl"], "2020s", ["the party is a lifestyle with a color scheme"]),
  e("mitski", ["Mitski"], w(0.45, 0.4, 0.9, 0.7, 0.9, 0.15), "high", ["indie-catharsis", "feelings-at-volume"], "2010s", ["'Your Best American Girl' is load-bearing"]),
  e("bon-iver", ["Bon Iver"], w(0.3, 0.4, 0.75, 0.7, 0.8, 0.15), "high", ["cabin-core", "falsetto-feelings"], "2000s", ["winter is a genre to them"]),
  e("travis-scott", ["Travis Scott", "travis"], w(0.9, 0.55, 0.3, 0.45, 0.2, 0.7), "high", ["rage", "crowd-energy"], "2010s", ["measures a song by how it'd feel in a crowd"]),
];

/** Normalize a typed name for matching: lowercase, strip diacritics, collapse space. */
export function normalizeArtist(raw: string): string {
  return raw.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

const INDEX = new Map<string, ArtistEntry>();
for (const entry of MUSIC_KB) for (const n of entry.names) INDEX.set(normalizeArtist(n), entry);

/** Deterministic lookup; unknown → null (caller keeps the flavor-only path). */
export function lookupArtist(raw: string): ArtistEntry | null {
  return INDEX.get(normalizeArtist(raw)) ?? null;
}
