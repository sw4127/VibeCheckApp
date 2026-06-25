/**
 * World Cup archetypes — the named "vibe type" the engine assigns by nearest
 * centroid. The LLM uses this title verbatim (spec §7: it never invents one).
 *
 * Names are drawn from real football scouting/community vocabulary that
 * describes HOW a player plays (metronome, poacher, colossus, livewire…) — not
 * invented nicknames. Vectors are positions in [0,1] on the 5 axes [intensity,
 * flair, workrate, composure, teamplay].
 */

import type { CentroidSet } from "@/engine";

export const worldCupArchetypes: CentroidSet = {
  id: "world-cup-archetypes",
  centroids: [
    {
      id: "maestro",
      label: "The Metronome",
      vector: { intensity: 0.48, flair: 0.76, workrate: 0.56, composure: 0.64, teamplay: 0.6 },
      tags: ["controls the tempo", "sees it early", "unflappable"],
    },
    {
      id: "maverick",
      label: "The Showman",
      vector: { intensity: 0.56, flair: 0.9, workrate: 0.38, composure: 0.48, teamplay: 0.44 },
      tags: ["does the unthinkable", "high-risk", "lives for the highlight"],
    },
    {
      id: "engine",
      label: "The Engine",
      vector: { intensity: 0.74, flair: 0.46, workrate: 0.74, composure: 0.58, teamplay: 0.66 },
      tags: ["never stops running", "box-to-box", "all-action"],
    },
    {
      // The Poacher: a clinical lurker, NOT a centrist. Defined by what it does
      // NOT do — low workrate, low intensity, hangs off the game — and the one
      // thing it does perfectly: ice-cold in the box. Pushed off-center so the
      // balanced answerer no longer dogpiles here (was 24.7%; the §16.F fix).
      id: "iceman",
      label: "The Poacher",
      vector: { intensity: 0.35, flair: 0.4, workrate: 0.3, composure: 0.78, teamplay: 0.42 },
      tags: ["picks the moment", "clinical", "zero panic"],
    },
    {
      id: "predator",
      label: "The Predator",
      vector: { intensity: 0.76, flair: 0.56, workrate: 0.5, composure: 0.72, teamplay: 0.35 },
      tags: ["ruthless", "self-driven", "lives for the kill"],
    },
    {
      id: "firestarter",
      label: "The Livewire",
      vector: { intensity: 0.84, flair: 0.68, workrate: 0.55, composure: 0.38, teamplay: 0.45 },
      tags: ["plays on the edge", "electric", "all emotion"],
    },
    {
      // Differentiated from rock/maestro by the highest workrate + max teamplay
      // and a mid flair — the selfless engine-room (was starved at 2.2%).
      id: "glue",
      label: "The Anchor",
      vector: { intensity: 0.56, flair: 0.46, workrate: 0.76, composure: 0.62, teamplay: 0.82 },
      tags: ["selfless", "does the dirty work", "holds it together"],
    },
    {
      id: "rock",
      label: "The Colossus",
      vector: { intensity: 0.52, flair: 0.32, workrate: 0.56, composure: 0.8, teamplay: 0.74 },
      tags: ["commands the back", "reads everything", "immovable"],
    },
    {
      // The named moderate type (§16.F / Slice 1): the complete two-way player
      // who does a bit of everything. Sits at the centre on purpose so the most
      // BALANCED answerers get a first-class, share-worthy verdict instead of
      // defaulting into the Poacher. (Label is provisional — finalised in 1b.)
      id: "equilibrist",
      label: "The Equilibrist",
      vector: { intensity: 0.5, flair: 0.53, workrate: 0.5, composure: 0.51, teamplay: 0.52 },
      tags: ["no weak phase", "does a bit of everything", "the manager's dream"],
    },
  ],
};
