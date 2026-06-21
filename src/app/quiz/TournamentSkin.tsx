/**
 * §Tournament-skin frame — the seasonal premium "tournament drop" framing for
 * the football quiz. Deliberately CLEAN and high-density (no confetti/mesh
 * noise): a structural border frame, host-colour corner ticks, one soft
 * under-the-lights glow, and a subtle geometric maple-leaf watermark woven into
 * the frame. Purely decorative: absolute, z-0, pointer-events-none, aria-hidden.
 * Deterministic markup → no hydration mismatch, no layout shift.
 */
import { HOST, FRAME } from "./tournament-theme";
import { MapleLeaf } from "./motifs";

/** Small L-shaped corner accent in a host colour. */
function CornerTick({ color, corner }: { color: string; corner: "tl" | "tr" | "bl" | "br" }) {
  const v: React.CSSProperties = { position: "absolute", background: color, borderRadius: 2 };
  const len = 22;
  const t = corner[0] === "t";
  const l = corner[1] === "l";
  const yEdge = t ? { top: -1 } : { bottom: -1 };
  const xEdge = l ? { left: -1 } : { right: -1 };
  return (
    <>
      <span style={{ ...v, ...yEdge, ...xEdge, width: len, height: 3 }} />
      <span style={{ ...v, ...yEdge, ...xEdge, width: 3, height: len }} />
    </>
  );
}

export default function TournamentSkin() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* One clean "under the lights" glow — pitch top. */}
      <div
        style={{
          position: "absolute", top: "-22%", left: "50%", transform: "translateX(-50%)",
          width: "130%", height: "42%",
          background: `radial-gradient(closest-side, ${HOST.green}24, transparent)`,
        }}
      />

      {/* Structural frame + host-colour corner ticks. */}
      <div className="absolute" style={{ inset: 12, border: `1.5px solid ${FRAME}`, borderRadius: 26 }}>
        <CornerTick color={HOST.green} corner="tl" />
        <CornerTick color={HOST.blue} corner="tr" />
        <CornerTick color={HOST.orange} corner="bl" />
        <CornerTick color={HOST.red} corner="br" />

        {/* Subtle geometric maple-leaf watermark woven into the frame. */}
        <MapleLeaf size={132} color={HOST.green} opacity={0.06} style={{ position: "absolute", right: 18, bottom: 26 }} />
      </div>
    </div>
  );
}
