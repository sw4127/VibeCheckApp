/**
 * World Cup player roster (Stage 1 content) — PLAYING STYLE ONLY.
 *
 * Per the real-people guardrail (spec §3): each profile describes the player's
 * public on-pitch style only — never psychological, medical, or private claims.
 * No photos, no club/FIFA badges; name + typography only. The roast is always
 * aimed at the USER, never the player.
 *
 * Vectors are positions in [0,1] on [intensity, flair, workrate, composure,
 * teamplay], hand-assigned from widely-documented playing-style reputation.
 * `tags` are flavor descriptors handed to the LLM.
 *
 * NOTE (PM action): this is a draft. Before launch, sanity-check inclusion
 * against final 2026 squads — flagged players may be age/qualification risks
 * (e.g. Norway/Croatia qualification). Trivial to edit: it's just data.
 */

import type { CentroidSet } from "@/engine";

export const worldCupRoster: CentroidSet = {
  id: "world-cup-2026-roster",
  centroids: [
    { id: "messi", label: "Lionel Messi",
      vector: { intensity: 0.35, flair: 0.9, workrate: 0.3, composure: 0.95, teamplay: 0.8 },
      tags: ["visionary", "ice-cold", "effortless genius", "lets the game come to him"] },
    { id: "mbappe", label: "Kylian Mbappé",
      vector: { intensity: 0.9, flair: 0.8, workrate: 0.5, composure: 0.75, teamplay: 0.4 },
      tags: ["explosive", "direct", "ruthless", "takes it on himself"] },
    { id: "ronaldo", label: "Cristiano Ronaldo",
      vector: { intensity: 0.85, flair: 0.6, workrate: 0.7, composure: 0.7, teamplay: 0.35 },
      tags: ["relentless", "self-driven", "supreme self-belief", "lives for goals"] },
    { id: "yamal", label: "Lamine Yamal",
      vector: { intensity: 0.7, flair: 0.95, workrate: 0.45, composure: 0.7, teamplay: 0.6 },
      tags: ["fearless", "dribbler", "creative", "magnetic"] },
    { id: "haaland", label: "Erling Haaland",
      vector: { intensity: 0.7, flair: 0.3, workrate: 0.4, composure: 0.85, teamplay: 0.45 },
      tags: ["clinical", "predator", "physical", "waits for the kill"] },
    { id: "bellingham", label: "Jude Bellingham",
      vector: { intensity: 0.85, flair: 0.65, workrate: 0.85, composure: 0.8, teamplay: 0.7 },
      tags: ["box-to-box", "big-moment", "driving", "leads from the front"] },
    { id: "vinicius", label: "Vinícius Júnior",
      vector: { intensity: 0.85, flair: 0.9, workrate: 0.5, composure: 0.45, teamplay: 0.45 },
      tags: ["electric", "flashy", "fiery", "plays on the edge"] },
    { id: "rodri", label: "Rodri",
      vector: { intensity: 0.4, flair: 0.3, workrate: 0.7, composure: 0.95, teamplay: 0.9 },
      tags: ["controller", "metronome", "composed", "selfless"] },
    { id: "modric", label: "Luka Modrić",
      vector: { intensity: 0.5, flair: 0.7, workrate: 0.75, composure: 0.9, teamplay: 0.85 },
      tags: ["elegant", "tempo-setter", "tireless", "visionary"] },
    { id: "debruyne", label: "Kevin De Bruyne",
      vector: { intensity: 0.7, flair: 0.85, workrate: 0.7, composure: 0.75, teamplay: 0.85 },
      tags: ["visionary passer", "high-risk creator", "relentless", "makes others better"] },
    { id: "pedri", label: "Pedri",
      vector: { intensity: 0.45, flair: 0.6, workrate: 0.7, composure: 0.9, teamplay: 0.9 },
      tags: ["press-resistant", "calm", "link-up", "technician"] },
    { id: "kane", label: "Harry Kane",
      vector: { intensity: 0.5, flair: 0.5, workrate: 0.55, composure: 0.9, teamplay: 0.75 },
      tags: ["complete forward", "composed finisher", "drops to create", "reliable"] },
    { id: "saka", label: "Bukayo Saka",
      vector: { intensity: 0.7, flair: 0.7, workrate: 0.8, composure: 0.75, teamplay: 0.7 },
      tags: ["two-way winger", "reliable", "hard-working", "dribbler"] },
    { id: "griezmann", label: "Antoine Griezmann",
      vector: { intensity: 0.6, flair: 0.6, workrate: 0.9, composure: 0.8, teamplay: 0.95 },
      tags: ["selfless", "tireless", "intelligent", "does the dirty work"] },
    { id: "rodrygo", label: "Rodrygo",
      vector: { intensity: 0.65, flair: 0.75, workrate: 0.6, composure: 0.85, teamplay: 0.65 },
      tags: ["clutch", "smooth", "big-game", "understated"] },
    { id: "raphinha", label: "Raphinha",
      vector: { intensity: 0.85, flair: 0.75, workrate: 0.8, composure: 0.6, teamplay: 0.65 },
      tags: ["relentless", "fiery", "driving", "end-product"] },
    { id: "vandijk", label: "Virgil van Dijk",
      vector: { intensity: 0.55, flair: 0.3, workrate: 0.6, composure: 0.95, teamplay: 0.85 },
      tags: ["commanding", "composed", "reads the game", "leader"] },
    { id: "valverde", label: "Federico Valverde",
      vector: { intensity: 0.9, flair: 0.55, workrate: 0.95, composure: 0.7, teamplay: 0.8 },
      tags: ["engine", "tireless", "all-action", "driving"] },
    { id: "cherki", label: "Rayan Cherki",
      vector: { intensity: 0.6, flair: 0.95, workrate: 0.4, composure: 0.6, teamplay: 0.5 },
      tags: ["maverick", "flashy", "creative", "risk-taker"] },
    { id: "rice", label: "Declan Rice",
      vector: { intensity: 0.65, flair: 0.4, workrate: 0.85, composure: 0.85, teamplay: 0.85 },
      tags: ["disciplined", "dependable", "graft", "calm"] },
    { id: "lautaro", label: "Lautaro Martínez",
      vector: { intensity: 0.85, flair: 0.55, workrate: 0.8, composure: 0.75, teamplay: 0.65 },
      tags: ["relentless presser", "predator", "fighter", "clinical"] },
    { id: "wirtz", label: "Florian Wirtz",
      vector: { intensity: 0.6, flair: 0.85, workrate: 0.65, composure: 0.8, teamplay: 0.8 },
      tags: ["creative", "press-resistant", "smooth", "creator"] },
  ],
};
