/**
 * Stateless challenge codec — encodes one person's result into a short URL token
 * so a head-to-head ("/vs") needs NO server storage (the link IS the database).
 *
 * Token shape: `<archetypeId>.<playerId>.<s0-s1-s2-s3-s4>` where s* are the five
 * axis percentiles as 0–100 ints, in worldCup.quiz.dimensions order.
 * Example: `poacher.haaland.25-3-98-91-12`
 */
import { worldCup, playerMeta, buildCardDesign, type Position } from "@/content/world-cup";

export interface Challenger {
  archetypeId: string;
  archetypeLabel: string;
  playerId: string;
  playerLabel: string;
  caption: string;
  nation?: string;
  position?: Position;
  /** Five axis percentiles in [0,1], dimension order. */
  signature: number[];
}

export function encodeChallenger(input: {
  archetypeId: string;
  playerId: string;
  signature: number[];
}): string {
  const sig = input.signature.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 100)).join("-");
  return `${input.archetypeId}.${input.playerId}.${sig}`;
}

/** Decode + validate against real content; returns null on anything malformed. */
export function decodeChallenger(token: string | undefined | null): Challenger | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [archetypeId, playerId, sigStr] = parts;

  const archetype = worldCup.archetypes.centroids.find((c) => c.id === archetypeId);
  const player = worldCup.roster.centroids.find((c) => c.id === playerId);
  if (!archetype || !player) return null;

  const signature = sigStr.split("-").map((n) => Number(n) / 100);
  if (signature.length !== worldCup.quiz.dimensions.length || signature.some((v) => !Number.isFinite(v))) {
    return null;
  }

  const meta = playerMeta[playerId];
  const design = buildCardDesign({ position: meta?.position, nation: meta?.nation });
  return {
    archetypeId,
    archetypeLabel: archetype.label,
    playerId,
    playerLabel: player.label,
    caption: design.caption,
    nation: meta?.nation,
    position: meta?.position,
    signature: signature.map((v) => Math.max(0, Math.min(1, v))),
  };
}

const AXIS_LABELS: Record<string, string> = {
  intensity: "intense",
  flair: "flashy",
  workrate: "relentless",
  composure: "ice-cold",
  teamplay: "selfless",
};

/** One-line head-to-head verdict from two signatures (biggest gap each way). */
export function compareVerdict(me: number[], them: number[]): string {
  const dims = worldCup.quiz.dimensions;
  let myEdge = { dim: dims[0], gap: -Infinity };
  let theirEdge = { dim: dims[0], gap: -Infinity };
  dims.forEach((dim, i) => {
    const d = (me[i] ?? 0.5) - (them[i] ?? 0.5);
    if (d > myEdge.gap) myEdge = { dim, gap: d };
    if (-d > theirEdge.gap) theirEdge = { dim, gap: -d };
  });
  return `You're more ${AXIS_LABELS[myEdge.dim] ?? myEdge.dim}; they're more ${AXIS_LABELS[theirEdge.dim] ?? theirEdge.dim}.`;
}
