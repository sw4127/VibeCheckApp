/**
 * Music composition content (§16.F): the modifier/tilt tables + per-core handles
 * the generic engine composer reads. Words/lines are first-draft, §21-voice,
 * PM-tunable (like the spines). Thresholds are tuned against the flip-rate test.
 */
import {
  composeIdentity,
  type ComposeTables,
  type Composite,
  type ModifierDef,
  type Profile,
} from "@/engine";
import { musicArchetypes } from "./archetypes";
import { STATE_AXES, TRAIT_AXES } from "./quiz";

const def = (id: string, label: string, line: string): ModifierDef => ({ id, label, line });

export const MUSIC_TABLES: ComposeTables = {
  traitAxes: TRAIT_AXES, // [openness, reflective, extraversion]
  stateAxes: STATE_AXES, // [energy, regulation, rumination]
  modifiers: {
    openness: {
      high: def("openness_hi", "Restless", "You can't leave the dial alone — even your comfort needs a fresh coat of paint."),
      low: def("openness_lo", "Loyalist", "You found your people years ago and you're not auditioning replacements."),
    },
    reflective: {
      high: def("reflective_hi", "Lyric-bound", "You hear the words first; a song lives or dies on whether it said the thing."),
      low: def("reflective_lo", "Visceral", "You feel it in your body before your brain files a report."),
    },
    extraversion: {
      high: def("extraversion_hi", "Out-loud", "Your taste isn't private property — it's a broadcast, and you're the station."),
      low: def("extraversion_lo", "Guarded", "What you love, you love quietly — the good stuff never leaves the headphones."),
    },
  },
  tilts: {
    energy: {
      high: def("energy_hi", "running hot", "The volume's been up lately — you're outrunning something or chasing it."),
      low: def("energy_lo", "on low power", "You've kept it low this stretch — conserving, or just tired of the noise."),
    },
    regulation: {
      high: def("regulation_hi", "white-knuckling the mood", "You've been managing your own weather, one playlist at a time."),
      low: def("regulation_lo", "letting it ride", "Lately you let the mood be whatever it is — no thermostat."),
    },
    rumination: {
      high: def("rumination_hi", "on a 2am loop", "Some song's been on repeat past the point of healthy. You know the one."),
      low: def("rumination_lo", "skating past it", "When it gets heavy you change the song — keep moving, don't look down."),
    },
  },
  // Tuned against the flip-rate test: a modifier needs a CLEAR lead (margin) so
  // it doesn't reshuffle on noise — fewer but more meaningful modifiers.
  deadband: 0.14,
  margin: 0.12,
  tiltDeadband: 0.15,
};

/** Compose the music identity from a built profile (§6: pure arithmetic). The
 *  handle is the core label (B); modifier/tilt vary the read + cache key. */
export function composeMusicIdentity(profile: Profile): Composite {
  const centroid = musicArchetypes.centroids.find((c) => c.id === profile.archetype.id)?.vector ?? {};
  return composeIdentity(profile.normalized, {
    id: profile.archetype.id,
    fullLabel: profile.archetype.label,
    centroid,
  }, MUSIC_TABLES);
}

/**
 * Rebuild a VALIDATED composite from ids (the narration route's enum lock):
 * core must be a real archetype; mod/tilt must be real table entries or "_".
 * Anything else → null (the route 400s). This is what makes the composite-in
 * endpoint's input space finite: |cores| × |mods+1| × |tilts+1|, nothing free-form.
 */
export function lookupMusicComposite(
  coreId: string,
  modId: string,
  tiltId: string,
): { composite: Composite; coreTags: string[] } | null {
  const core = musicArchetypes.centroids.find((c) => c.id === coreId);
  if (!core) return null;

  const mods = Object.values(MUSIC_TABLES.modifiers).flatMap((p) => [p.high, p.low]);
  const tilts = Object.values(MUSIC_TABLES.tilts).flatMap((p) => [p.high, p.low]);
  const modifier = modId === "_" ? null : mods.find((m) => m.id === modId) ?? undefined;
  const tilt = tiltId === "_" ? null : tilts.find((t) => t.id === tiltId) ?? undefined;
  if (modifier === undefined || tilt === undefined) return null;

  return {
    composite: {
      coreId: core.id,
      modifier,
      tilt,
      handle: core.label,
      stateLine: tilt ? tilt.label : "steady",
      cacheKey: `${core.id}.${modifier?.id ?? "_"}.${tilt?.id ?? "_"}`,
    },
    coreTags: core.tags ?? [],
  };
}
