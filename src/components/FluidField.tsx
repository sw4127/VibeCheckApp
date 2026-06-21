/**
 * FluidField — a palette-agnostic ambient mesh-gradient background (the shared
 * "fluid" design primitive). Layered radial gradients over a base colour, with a
 * slow GPU drift. Deterministic positions → no hydration mismatch, no layout
 * shift. Pure CSS (no canvas/libs) → cheap in in-app webviews, and the same
 * gradient stack is reproducible server-side in Satori for the share card.
 *
 * Football feeds it the vibrant 2026 palette on a light base; the music quiz can
 * feed its moody theme palette on a dark base — one system, two moods.
 */
type Props = {
  colors: string[];
  baseColor: string;
  /** 0–1 blob opacity. Lower = subtler field. */
  intensity?: number;
  animated?: boolean;
};

// Fixed blob anchors (% positions) — stable across SSR/CSR.
const ANCHORS = ["14% 16%", "84% 20%", "22% 82%", "80% 74%", "48% 46%", "6% 56%"];

export default function FluidField({ colors, baseColor, intensity = 0.5, animated = true }: Props) {
  // Opacity (not per-colour alpha) carries intensity → colours can be any CSS
  // format: hex (football) or hsl() (music's live hue-drift).
  const op = Math.max(0, Math.min(1, intensity));
  const layers = colors
    .map((c, i) => `radial-gradient(circle at ${ANCHORS[i % ANCHORS.length]}, ${c} 0%, transparent 46%)`)
    .join(", ");

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden" style={{ background: baseColor }}>
      <div
        className={animated ? "vc-fluid" : undefined}
        style={{ position: "absolute", inset: "-25%", backgroundImage: layers, opacity: op }}
      />
      {/* Top scrim — calms the header/title zone so dark ink stays legible
          regardless of which palette blob drifts up there. */}
      <div
        style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(180deg, ${baseColor}E6, ${baseColor}00 30%)` }}
      />
      <style>{`@keyframes vcFluidDrift{0%{transform:translate3d(0,0,0) scale(1.04)}50%{transform:translate3d(2%,-1.5%,0) scale(1.1)}100%{transform:translate3d(0,0,0) scale(1.04)}}.vc-fluid{animation:vcFluidDrift 22s ease-in-out infinite;will-change:transform}@media (prefers-reduced-motion:reduce){.vc-fluid{animation:none}}`}</style>
    </div>
  );
}
