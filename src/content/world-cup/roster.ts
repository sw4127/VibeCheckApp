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
import type { Position } from "./design";

/**
 * Design metadata per roster id: generic position + nationality KEY (into
 * NATIONS). Drives the IP-safe card design (see design.ts) — factual attributes
 * only, never club/likeness.
 */
export const playerMeta: Record<string, { position: Position; nation: string }> = {
  messi: { position: "playmaker", nation: "ARG" },
  mbappe: { position: "striker", nation: "FRA" },
  ronaldo: { position: "striker", nation: "POR" },
  yamal: { position: "winger", nation: "ESP" },
  haaland: { position: "striker", nation: "NOR" },
  bellingham: { position: "midfielder", nation: "ENG" },
  vinicius: { position: "winger", nation: "BRA" },
  rodri: { position: "midfielder", nation: "ESP" },
  modric: { position: "midfielder", nation: "CRO" },
  debruyne: { position: "playmaker", nation: "BEL" },
  pedri: { position: "midfielder", nation: "ESP" },
  kane: { position: "striker", nation: "ENG" },
  saka: { position: "winger", nation: "ENG" },
  griezmann: { position: "playmaker", nation: "FRA" },
  rodrygo: { position: "winger", nation: "BRA" },
  raphinha: { position: "winger", nation: "BRA" },
  vandijk: { position: "defender", nation: "NED" },
  valverde: { position: "midfielder", nation: "URU" },
  cherki: { position: "playmaker", nation: "FRA" },
  rice: { position: "midfielder", nation: "ENG" },
  lautaro: { position: "striker", nation: "ARG" },
  wirtz: { position: "playmaker", nation: "GER" },
  // 2026 breakout additions (playing-style only; swap freely as squads firm up).
  mora: { position: "playmaker", nation: "MEX" },
  balogun: { position: "striker", nation: "USA" },
  davies: { position: "defender", nation: "CAN" },
  nicopaz: { position: "playmaker", nation: "ARG" },
  diomande: { position: "winger", nation: "CIV" },
  nusa: { position: "winger", nation: "NOR" },
  sadiki: { position: "midfielder", nation: "COD" },
  maza: { position: "playmaker", nation: "ALG" },
  vozinha: { position: "keeper", nation: "CPV" },
};

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

    // --- 2026 breakout additions (playing-style reputation only) -------------
    { id: "mora", label: "Gilberto Mora",
      vector: { intensity: 0.5, flair: 0.8, workrate: 0.6, composure: 0.8, teamplay: 0.85 },
      tags: ["teenage orchestrator", "technician", "composed beyond his years", "makes it tick"] },
    { id: "balogun", label: "Folarin Balogun",
      vector: { intensity: 0.8, flair: 0.55, workrate: 0.6, composure: 0.75, teamplay: 0.5 },
      tags: ["pacey", "direct runner", "clinical", "stretches the line"] },
    { id: "davies", label: "Alphonso Davies",
      vector: { intensity: 0.95, flair: 0.82, workrate: 0.88, composure: 0.5, teamplay: 0.55 },
      tags: ["explosive", "marauding", "covers every blade", "turns defence into attack"] },
    { id: "nicopaz", label: "Nico Paz",
      vector: { intensity: 0.5, flair: 0.8, workrate: 0.55, composure: 0.85, teamplay: 0.8 },
      tags: ["modern No. 10", "press-resistant", "finds the pocket", "composed creator"] },
    { id: "diomande", label: "Yan Diomande",
      vector: { intensity: 0.85, flair: 0.8, workrate: 0.55, composure: 0.6, teamplay: 0.45 },
      tags: ["quick", "direct dribbler", "two-footed threat", "fearless"] },
    { id: "nusa", label: "Antonio Nusa",
      vector: { intensity: 0.7, flair: 0.9, workrate: 0.45, composure: 0.65, teamplay: 0.55 },
      tags: ["floats past defenders", "technical", "cuts inside", "silky"] },
    { id: "sadiki", label: "Noah Sadiki",
      vector: { intensity: 0.8, flair: 0.4, workrate: 0.95, composure: 0.8, teamplay: 0.85 },
      tags: ["relentless ball-winner", "tireless", "smart on the ball", "engine room"] },
    { id: "maza", label: "Ibrahim Maza",
      vector: { intensity: 0.62, flair: 0.92, workrate: 0.55, composure: 0.72, teamplay: 0.68 },
      tags: ["fleet-footed", "eye for a pass", "press-resistant", "creator"] },
    { id: "vozinha", label: "Josimar Dias",
      vector: { intensity: 0.5, flair: 0.3, workrate: 0.5, composure: 0.95, teamplay: 0.8 },
      tags: ["commands his box", "unflappable", "ageless shot-stopper", "organises the back"] },
  ],
};
