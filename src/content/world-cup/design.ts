/**
 * Card design system — IP-safe + premium-minimalist.
 *
 * The hero is the archetype NAME set in the branded display serif (the card is
 * typographic). This module supplies the supporting design tokens: the single
 * accent comes from nationality COLOURS (never the flag) over a neutral chrome
 * base, plus a factual "position · nation" caption (text only). Nothing
 * borrowed: no badges, crests, flag images, club identity, or likeness. (§3, §5)
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

/** National COLOUR cues only (no flags). `deep` is a reserved dark-tint slot. */
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
  // 2026 host nations + breakout-player nations. Single national COLOUR cue
  // only (never a flag); each accent clears WCAG AA (≥4.5:1) on the #0c0d12 base.
  USA: { name: "United States", accent: "#5a7dff", deep: "#0c1330" },
  CAN: { name: "Canada", accent: "#ff4d52", deep: "#1f0b0c" },
  MEX: { name: "Mexico", accent: "#2bbf63", deep: "#0a1f12" },
  CIV: { name: "Ivory Coast", accent: "#ff8a3d", deep: "#1a0f06" },
  COD: { name: "DR Congo", accent: "#3aa0ed", deep: "#08182a" },
  ALG: { name: "Algeria", accent: "#16a06b", deep: "#08201a" },
  CPV: { name: "Cape Verde", accent: "#5a86e0", deep: "#0a1228" },
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
      // Neutral chrome base everywhere — the nationality colour is the only
      // accent, so a red player can't clash with a green background.
      from: "#0c0d12",
      to: "#070709",
      accent: nation.accent,
      text: "#f4f5f8",
      sub: "#8b91a3",
    },
    positionLabel: label,
    nationName: nation.name,
    caption: nation.name ? `${label} · ${nation.name}` : label,
  };
}
