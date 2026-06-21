/**
 * §Tournament-skin background — the seasonal football look. Now an AMBIENT FLUID
 * field (the official 2026 palette diffused as a soft drifting mesh on the bright
 * stage) instead of the old heavy concentric frame. Thin wrapper over the shared
 * FluidField primitive, keeping the football-specific palette scoped + deletable.
 */
import FluidField from "@/components/FluidField";
import { FLUID_COLORS, SHEET } from "./tournament-theme";

export default function TournamentSkin({ accent }: { accent: string }) {
  // Lead with the phase accent so the field leans crimson→royal→emerald across
  // the journey (the "spectrum over time" idea), over the full 2026 palette.
  return <FluidField colors={[accent, ...FLUID_COLORS]} baseColor={SHEET} intensity={0.46} />;
}
