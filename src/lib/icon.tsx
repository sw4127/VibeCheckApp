/**
 * §23.F — app icon. Typographic + sultry, not geometric (Design-Bar: the icon
 * carries the ONE branded display font, Fraunces, like every other screen).
 * A high-contrast serif "V" on a plum→wine field with a warm candlelight glow:
 * artistic, a tasteful hint of allure (via colour + light, never anatomy),
 * store-safe. Rendered through Satori (next/og) — same engine as the card.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

const FONT_DIR = join(process.cwd(), "src", "fonts");
const fontBlack = readFileSync(join(FONT_DIR, "fraunces-900.woff"));

/** Square app icon at the given pixel size. */
export function appIcon(size: number): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          // Sultry chiaroscuro from a single clean gradient: warm rose-wine light
          // top-left, falling to near-black bottom-right. No glow div (Satori
          // renders a hard square seam on a high-alpha radial overlay).
          backgroundImage: "linear-gradient(135deg, #8a2350 0%, #4a1334 34%, #1a0a1c 68%, #08060c 100%)",
        }}
      >
        {/* the wordmark initial — Fraunces 900, warm cream */}
        <div
          style={{
            display: "flex",
            fontFamily: "Fraunces",
            fontWeight: 900,
            fontSize: size * 0.6,
            lineHeight: 1,
            color: "#f8ece5",
            marginTop: -size * 0.02,
          }}
        >
          V
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [{ name: "Fraunces", data: fontBlack, weight: 900, style: "normal" }],
    },
  );
}
