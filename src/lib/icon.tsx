/**
 * §23.F (PWA-light) — app icons generated from the sigil via Satori
 * (next/og), the same engine the share card uses. No image assets to maintain;
 * the brand mark IS the deterministic ring. Shared by app/icon, app/apple-icon,
 * and the manifest icon routes.
 */
import { ImageResponse } from "next/og";
import { Sigil } from "./sigil";

const BG = "#08090d"; // brand near-black
const ACCENT = "#7c6cff"; // brand violet

/** Square icon: the locked sigil centred on the brand background. */
export function sigilIcon(size: number): ImageResponse {
  const pad = Math.round(size * 0.16); // safe zone for maskable cropping
  const ring = size - pad * 2;
  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
        }}
      >
        <Sigil
          size={ring}
          filled={7}
          colors={ACCENT}
          strokeWidth={Math.max(2, Math.round(ring * 0.11))}
        />
      </div>
    ),
    { width: size, height: size },
  );
}
