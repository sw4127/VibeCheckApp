"use client";

/**
 * FluidField — a palette-agnostic ambient mesh-gradient background (the shared
 * "fluid" design primitive). Layered radial gradients with a slow GPU drift.
 *
 * Cross-fade: `background-image` can't be CSS-transitioned, so when `colors`
 * change (football phase flip, music hue drift) we ping-pong two stacked layers
 * and transition OPACITY (compositor-cheap) → no hard colour cut.
 *
 * Transparent base: the field paints only the blobs (+ scrim/vignette); the page
 * surface comes from the body (`--app-bg`), which eases on route change — so the
 * mesh sits on a luminance that never flash-bangs. `baseColor` is still used for
 * the light-stage scrim. Deterministic anchors → no hydration mismatch.
 */
import { useEffect, useRef, useState } from "react";

type Props = {
  colors: string[];
  baseColor: string;
  /** 0–1 blob opacity. Lower = subtler field. */
  intensity?: number;
  animated?: boolean;
  /** Top fade to baseColor — helps dark-ink legibility on a LIGHT stage
   *  (football). Turn OFF on dark stages (music) so the top zone keeps colour. */
  scrim?: boolean;
  /** Radial edge-darkening for painterly depth/chiaroscuro (oil-painting feel). */
  vignette?: boolean;
};

// Fixed blob anchors (% positions) — stable across SSR/CSR.
const ANCHORS = ["14% 16%", "84% 20%", "22% 82%", "80% 74%", "48% 46%", "6% 56%"];

export default function FluidField({ colors, baseColor, intensity = 0.5, animated = true, scrim = true, vignette = false }: Props) {
  const op = Math.max(0, Math.min(1, intensity));
  const target = colors
    .map((c, i) => `radial-gradient(circle at ${ANCHORS[i % ANCHORS.length]}, ${c} 0%, transparent 46%)`)
    .join(", ");

  // Two layers; the front one shows `op`, the back one 0. On a colour change we
  // load the new stack onto the back layer and flip — it fades in over the old.
  const [a, setA] = useState(target);
  const [b, setB] = useState(target);
  const [front, setFront] = useState<"a" | "b">("a");
  const last = useRef(target);
  useEffect(() => {
    if (target === last.current) return;
    last.current = target;
    if (front === "a") {
      setB(target);
      setFront("b");
    } else {
      setA(target);
      setFront("a");
    }
  }, [target, front]);

  const layer = (bg: string, show: boolean): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    backgroundImage: bg,
    opacity: show ? op : 0,
    transition: "opacity 650ms ease",
  });

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className={animated ? "vc-fluid" : undefined} style={{ position: "absolute", inset: "-25%" }}>
        <div style={layer(a, front === "a")} />
        <div style={layer(b, front === "b")} />
      </div>
      {/* Top scrim — calms the header/title zone so dark ink stays legible
          regardless of which palette blob drifts up there (light stages only). */}
      {scrim ? (
        <div
          style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(180deg, ${baseColor}E6, ${baseColor}00 30%)` }}
        />
      ) : null}
      {/* Painterly vignette — darker edges focus the centre (chiaroscuro). */}
      {vignette ? (
        <div
          style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 50% 42%, transparent 46%, rgba(0,0,0,0.36) 100%)" }}
        />
      ) : null}
      <style>{`@keyframes vcFluidDrift{0%{transform:translate3d(0,0,0) scale(1.04)}50%{transform:translate3d(2%,-1.5%,0) scale(1.1)}100%{transform:translate3d(0,0,0) scale(1.04)}}.vc-fluid{animation:vcFluidDrift 22s ease-in-out infinite;will-change:transform}@media (prefers-reduced-motion:reduce){.vc-fluid{animation:none}}`}</style>
    </div>
  );
}
