/**
 * World Cup archetypes — the named "vibe type" the engine assigns by nearest
 * centroid. The LLM uses this title verbatim (spec §7: it never invents one).
 * Vectors are positions in [0,1] on the 5 axes [intensity, flair, workrate,
 * composure, teamplay].
 */

import type { CentroidSet } from "@/engine";

export const worldCupArchetypes: CentroidSet = {
  id: "world-cup-archetypes",
  centroids: [
    {
      id: "maestro",
      label: "The Maestro",
      vector: { intensity: 0.45, flair: 0.7, workrate: 0.7, composure: 0.92, teamplay: 0.92 },
      tags: ["controls the tempo", "sees it early", "unflappable"],
    },
    {
      id: "maverick",
      label: "The Maverick",
      vector: { intensity: 0.65, flair: 0.95, workrate: 0.4, composure: 0.6, teamplay: 0.45 },
      tags: ["does the unthinkable", "high-risk", "lives for the highlight"],
    },
    {
      id: "engine",
      label: "The Engine",
      vector: { intensity: 0.9, flair: 0.5, workrate: 0.95, composure: 0.7, teamplay: 0.8 },
      tags: ["never stops running", "box-to-box", "all-action"],
    },
    {
      id: "iceman",
      label: "The Iceman",
      vector: { intensity: 0.45, flair: 0.4, workrate: 0.45, composure: 0.95, teamplay: 0.55 },
      tags: ["picks the moment", "clinical", "zero panic"],
    },
    {
      id: "predator",
      label: "The Predator",
      vector: { intensity: 0.85, flair: 0.6, workrate: 0.55, composure: 0.8, teamplay: 0.4 },
      tags: ["ruthless", "self-driven", "lives for the kill"],
    },
    {
      id: "firestarter",
      label: "The Firestarter",
      vector: { intensity: 0.9, flair: 0.85, workrate: 0.6, composure: 0.4, teamplay: 0.45 },
      tags: ["plays on the edge", "electric", "all emotion"],
    },
    {
      id: "glue",
      label: "The Glue",
      vector: { intensity: 0.6, flair: 0.55, workrate: 0.9, composure: 0.82, teamplay: 0.95 },
      tags: ["selfless", "does the dirty work", "holds it together"],
    },
    {
      id: "rock",
      label: "The Rock",
      vector: { intensity: 0.55, flair: 0.3, workrate: 0.65, composure: 0.95, teamplay: 0.85 },
      tags: ["commands the back", "reads everything", "immovable"],
    },
  ],
};
