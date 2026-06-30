/**
 * Composed identity (matrix): {CORE} × {MODIFIER} × {STATE-TILT}.
 *
 * §6: ALL three parts are plain arithmetic over the engine's already-computed
 * normalized vector — the LLM never picks them. Identical answers → identical
 * composite, always. Content-agnostic (§16.F): a variant supplies the lane axes,
 * the modifier/tilt tables, and the core handle; this code never changes.
 *
 *  - CORE     = the nearest-centroid archetype (computed upstream; passed in).
 *               This alone is the SHAREABLE HANDLE — as stable (or not) as today.
 *  - MODIFIER = the TRAIT-lane axis of largest deviation from the core centroid
 *               (durable texture). It drives the cache key + the prose — NOT the
 *               handle (decision B): a single coarse tap can legitimately flip a
 *               1-question axis, so the modifier is too volatile for a shared
 *               NAME but perfect for varying the READ (variance = resolution).
 *  - TILT     = the STATE-lane axis most pronounced vs neutral 0.5 (current
 *               weather, §9 recent lane). Deadband-gated → null = "steady".
 *
 * Net: one stable handle (core) × many distinct READS (core·modifier·tilt cache
 * key) — expansive + cheap, without putting a volatile word in the shared name.
 */
import type { ScoreVector } from "./types";

export interface ModifierDef {
  id: string;
  label: string; // one word for the handle, e.g. "Restless"
  line: string; // authored §21 line — what this texture does to the read
}
export interface TiltDef {
  id: string;
  label: string; // a phrase for the state-line, e.g. "running hot"
  line: string;
}
export interface AxisPair<T> {
  high: T;
  low: T;
}

export interface ComposeTables {
  traitAxes: readonly string[];
  stateAxes: readonly string[];
  modifiers: Record<string, AxisPair<ModifierDef>>;
  tilts: Record<string, AxisPair<TiltDef>>;
  /** Min |user − coreCentroid| for a modifier to count at all. */
  deadband: number;
  /** Min lead of the top trait-deviation over the runner-up (anti-tie-flip). */
  margin: number;
  /** Min |state − 0.5| for a tilt to count (else "steady"). */
  tiltDeadband: number;
}

export interface CoreRef {
  id: string;
  fullLabel: string; // "The Velvet Cynic" — this IS the shareable handle (B)
  centroid: ScoreVector;
}

export interface Composite {
  coreId: string;
  modifier: ModifierDef | null;
  tilt: TiltDef | null;
  /** The shareable name = the core label (B). Modifier/tilt are NOT in it. */
  handle: string;
  /** Current-weather sub-line: the tilt phrase or "steady". */
  stateLine: string;
  /** Narration/cache signature: core·modifier·tilt — varied reads, still cheap. */
  cacheKey: string;
}

function rankDeviations(
  axes: readonly string[],
  table: Record<string, unknown>,
  value: (axis: string) => number,
): { axis: string; dev: number }[] {
  return axes
    .filter((a) => table[a])
    .map((a) => ({ axis: a, dev: value(a) }))
    // desc by deviation; ties break by axis name → fully deterministic.
    .sort((x, y) => y.dev - x.dev || (x.axis < y.axis ? -1 : 1));
}

export function composeIdentity(
  normalized: ScoreVector,
  core: CoreRef,
  t: ComposeTables,
): Composite {
  const at = (a: string) => normalized[a] ?? 0.5;

  // MODIFIER — trait-lane max deviation from the CORE centroid, margin-gated.
  const traitDevs = rankDeviations(t.traitAxes, t.modifiers, (a) =>
    Math.abs(at(a) - (core.centroid[a] ?? 0.5)),
  );
  let modifier: ModifierDef | null = null;
  if (traitDevs.length) {
    const top = traitDevs[0];
    const runnerUp = traitDevs[1]?.dev ?? 0;
    if (top.dev >= t.deadband && top.dev - runnerUp >= t.margin) {
      const dir = at(top.axis) >= (core.centroid[top.axis] ?? 0.5) ? "high" : "low";
      modifier = t.modifiers[top.axis][dir];
    }
  }

  // TILT — state-lane max deviation from neutral, deadband-gated.
  const stateDevs = rankDeviations(t.stateAxes, t.tilts, (a) => Math.abs(at(a) - 0.5));
  let tilt: TiltDef | null = null;
  if (stateDevs.length && stateDevs[0].dev >= t.tiltDeadband) {
    const top = stateDevs[0];
    tilt = t.tilts[top.axis][at(top.axis) >= 0.5 ? "high" : "low"];
  }

  return {
    coreId: core.id,
    modifier,
    tilt,
    handle: core.fullLabel, // (B) — stable core name; modifier lives in the read
    stateLine: tilt ? tilt.label : "steady",
    cacheKey: `${core.id}.${modifier?.id ?? "_"}.${tilt?.id ?? "_"}`,
  };
}
