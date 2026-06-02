/**
 * Logic-driven, IP-safe card design system.
 *
 * The card's look is DERIVED from three safe attributes — never random, never
 * borrowed IP:
 *   1. Position (a generic football concept) -> layout motif + a factual caption
 *   2. Nationality COLOURS (colours aren't trademarked; we never draw the flag) -> palette
 *   3. Our own style-axes (intensity/flair) -> how loud the motif reads
 *
 * Explicitly NOT used: club crests/colours-as-brand, flag images, EA "FC/FUT"
 * card art, player likeness. (spec §3, §5.)
 */

export type Position =
  | "striker"
  | "winger"
  | "playmaker"
  | "midfielder"
  | "defender"
  | "keeper";

export type Motif = "target" | "lines" | "radiate" | "weave" | "shield" | "frame";

export const POSITION_INFO: Record<Position, { label: string; motif: Motif }> = {
  striker: { label: "Central Striker", motif: "target" },
  winger: { label: "Winger", motif: "lines" },
  playmaker: { label: "Playmaker", motif: "radiate" },
  midfielder: { label: "Midfielder", motif: "weave" },
  defender: { label: "Defender", motif: "shield" },
  keeper: { label: "Keeper", motif: "frame" },
};

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
  motif: Motif;
  motifOpacity: number;
  positionLabel: string;
  nationName: string;
  /** Factual caption, e.g. "Central Striker · Norway". */
  caption: string;
}

export interface DesignInput {
  position?: Position;
  /** Nationality key into NATIONS (e.g. "NOR"). */
  nation?: string;
  /** Style-axis percentiles in [0,1]; tune how loud the motif reads. */
  intensity?: number;
  flair?: number;
}

/** Deterministic: same attributes -> same design, every time. */
export function buildCardDesign(input: DesignInput): CardDesign {
  const nation = (input.nation && NATIONS[input.nation]) || FALLBACK;
  const pos: Position = input.position ?? "midfielder";
  const info = POSITION_INFO[pos];

  // Louder motif for higher-intensity / higher-flair players.
  const energy = ((input.intensity ?? 0.5) + (input.flair ?? 0.5)) / 2;
  const motifOpacity = Math.round((0.1 + energy * 0.16) * 1000) / 1000;

  const caption = nation.name
    ? `${info.label} · ${nation.name}`
    : info.label;

  return {
    palette: {
      from: "#0a0d16",
      to: nation.deep,
      accent: nation.accent,
      text: "#f6f7fb",
      sub: "#9aa3bd",
    },
    motif: info.motif,
    motifOpacity,
    positionLabel: info.label,
    nationName: nation.name,
    caption,
  };
}
