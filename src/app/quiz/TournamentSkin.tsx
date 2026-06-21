/**
 * §Tournament-skin background — the seasonal football look: an AMBIENT FLUID
 * field on the bright stage. The WHOLE field is derived from the active host
 * hue (3 analogous + 1 complementary pop) so it rotates crimson→royal→emerald
 * across the phases — every zone shifts, not just one blob (the same "field from
 * the active hue" logic the music quiz uses → one unified system). Thin wrapper
 * over the shared FluidField primitive; football palette stays scoped/deletable.
 */
import FluidField from "@/components/FluidField";
import { SHEET } from "./tournament-theme";

export default function TournamentSkin({ hue }: { hue: number }) {
  const colors = [
    `hsl(${hue} 85% 60%)`,
    `hsl(${(hue + 34) % 360} 80% 58%)`,
    `hsl(${(hue + 326) % 360} 80% 58%)`,
    `hsl(${(hue + 180) % 360} 72% 60%)`,
  ];
  return <FluidField colors={colors} baseColor={SHEET} intensity={0.5} />;
}
