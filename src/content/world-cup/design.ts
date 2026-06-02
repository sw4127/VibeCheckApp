/**
 * Card design system — IP-safe + premium-minimalist.
 *
 * The hero graphic is a single, continuous, ultra-thin line-art glyph keyed to
 * the ARCHETYPE's vibe (flame = Livewire, mountain = Colossus, infinity = Engine…),
 * floating on a clean open background. No pitch, no boxes, no heavy shapes.
 * Accent colour comes from nationality COLOURS (never the flag), and the factual
 * "position · nation" caption is text only. Nothing borrowed: no badges, crests,
 * flag images, club identity, or likeness. (spec §3, §5.)
 */

export type Position =
  | "striker"
  | "winger"
  | "playmaker"
  | "midfielder"
  | "defender"
  | "keeper";

export const POSITION_INFO: Record<Position, { label: string }> = {
  striker: { label: "Central Striker" },
  winger: { label: "Winger" },
  playmaker: { label: "Playmaker" },
  midfielder: { label: "Midfielder" },
  defender: { label: "Defender" },
  keeper: { label: "Keeper" },
};

/**
 * Single-stroke SVG path per archetype id, authored in a 0–100 viewBox.
 * Smooth bezier curves only — each is one continuous, flowing line that evokes
 * the archetype rather than depicting anything literal.
 */
export const ARCHETYPE_GLYPHS: Record<string, string> = {
  // Metronome — a calm, even rhythm wave.
  maestro: "M 10 50 C 25 20, 37 20, 50 50 C 63 80, 75 80, 90 50",
  // Showman — a flourish that loops back on itself.
  maverick: "M 12 72 C 28 40, 48 28, 58 48 C 66 62, 49 71, 45 56 C 41 41, 67 33, 90 30",
  // Engine — perpetual motion, a continuous figure-eight.
  engine: "M 50 50 C 38 33, 17 35, 17 50 C 17 65, 38 67, 50 50 C 62 33, 83 35, 83 50 C 83 65, 62 67, 50 50",
  // Poacher — a patient line that snaps into a hook.
  iceman: "M 10 44 C 38 44, 58 44, 73 50 C 88 56, 88 71, 75 73 C 66 74, 62 64, 71 60",
  // Predator — a rising stroke curling into a talon.
  predator: "M 12 82 C 40 76, 63 57, 78 27 C 81 21, 75 18, 70 24 C 65 30, 71 35, 79 31",
  // Livewire — a flame, drawn in one continuous line.
  firestarter: "M 50 88 C 33 75, 35 53, 48 43 C 56 37, 52 25, 46 15 C 68 27, 75 52, 63 68 C 57 76, 49 75, 50 88 Z",
  // Anchor — a wide, grounding cradle.
  glue: "M 12 32 C 30 82, 70 82, 88 32",
  // Colossus — an immovable, symmetric peak.
  rock: "M 10 80 C 30 80, 36 26, 50 26 C 64 26, 70 80, 90 80",
};

const DEFAULT_GLYPH = ARCHETYPE_GLYPHS.maestro;

export function archetypeGlyph(id: string | undefined): string {
  return (id && ARCHETYPE_GLYPHS[id]) || DEFAULT_GLYPH;
}

/** National COLOUR cues only (no flags). `deep` tints the dark gradient base. */
export interface Nation {
  name: string;
  accent: string;
  deep: string;
}

export const NATIONS: Record<string, Nation> = {
  ARG: { name: "Argentina", accent: "#7cb9e8", deep: "#0d1a26" },
  FRA: { name: "France", accent: "#5b8cff", deep: "#0c1230" },
  POR: { name: "Portugal", accent: "#e63946", deep: "#0e2118" },
  ESP: { name: "Spain", accent: "#f1bf00", deep: "#2a0d0d" },
  NOR: { name: "Norway", accent: "#ef4d6a", deep: "#0a1330" },
  ENG: { name: "England", accent: "#e8344e", deep: "#14161c" },
  BRA: { name: "Brazil", accent: "#ffd200", deep: "#0a2417" },
  CRO: { name: "Croatia", accent: "#ff5252", deep: "#1a0c14" },
  BEL: { name: "Belgium", accent: "#ffd23f", deep: "#1a1407" },
  NED: { name: "Netherlands", accent: "#ff7a1a", deep: "#1a0f06" },
  URU: { name: "Uruguay", accent: "#6db3e8", deep: "#0d1726" },
  GER: { name: "Germany", accent: "#f5c542", deep: "#16100a" },
};

const FALLBACK: Nation = { name: "", accent: "#6ea8ff", deep: "#16203c" };

export interface CardDesign {
  palette: { from: string; to: string; accent: string; text: string; sub: string };
  positionLabel: string;
  nationName: string;
  /** Factual caption, e.g. "Central Striker · Norway". */
  caption: string;
}

export interface DesignInput {
  position?: Position;
  /** Nationality key into NATIONS (e.g. "NOR"). */
  nation?: string;
}

/** Deterministic: same attributes -> same design, every time. */
export function buildCardDesign(input: DesignInput): CardDesign {
  const nation = (input.nation && NATIONS[input.nation]) || FALLBACK;
  const pos: Position = input.position ?? "midfielder";
  const label = POSITION_INFO[pos].label;

  return {
    palette: {
      from: "#0a0d16",
      to: nation.deep,
      accent: nation.accent,
      text: "#f6f7fb",
      sub: "#9aa3bd",
    },
    positionLabel: label,
    nationName: nation.name,
    caption: nation.name ? `${label} · ${nation.name}` : label,
  };
}
