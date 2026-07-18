/**
 * Default OG image (2026-07-16 brief §3.B4 OG audit — serves C2: the launch
 * post links the HOMEPAGE, which had no unfurl image). File-convention OG for
 * every route that doesn't bring its own; the share surfaces (/bias/result,
 * /result, /vs, /fan-verdict, /music/result) override it with their dynamic
 * cards via generateMetadata, verified in the §3.C8 raw-HTML audit.
 *
 * Typography-driven per the design bar: Fraunces, gym gold, no imagery.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt =
  "The Taste Gym — your taste has a number. The Prestige Test measures how far a famous name can move your ratings.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONT_DIR = join(process.cwd(), "src", "fonts");

const GOLD = "hsl(42, 80%, 62%)";
const CREAM = "#f5f1e8";
const SUB = "#a89f8d";

export default function OgImage() {
  const fontBlack = readFileSync(join(FONT_DIR, "fraunces-900.woff"));
  const fontSemi = readFileSync(join(FONT_DIR, "fraunces-600.woff"));
  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundImage:
            "linear-gradient(145deg, #2a2213 0%, #17120a 45%, #0b0a08 100%)",
          fontFamily: "Fraunces",
        }}
      >
        <div
          style={{ display: "flex", fontSize: 30, letterSpacing: 14, fontWeight: 600, color: GOLD }}
        >
          THE TASTE GYM
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 108,
              fontWeight: 900,
              color: CREAM,
              lineHeight: 1.02,
            }}
          >
            Your taste has a number.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              fontWeight: 600,
              color: SUB,
              marginTop: 28,
              maxWidth: 900,
            }}
          >
            Ten clips, rated twice — the gap is how far a famous name can move you.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: SUB }}>
            Free · five minutes · no sign-up
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: GOLD }}>
            The Prestige Test →
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: fontBlack, weight: 900, style: "normal" },
        { name: "Fraunces", data: fontSemi, weight: 600, style: "normal" },
      ],
    },
  );
}
