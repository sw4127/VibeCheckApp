/**
 * GET /product-image — the product image for the Dodo checkout page + invoices
 * (spec §24). Square, branded via Satori (same engine as the card/icon): the
 * Fraunces wordmark + the locked sigil on a premium dark field. Download it and
 * upload it in the Dodo dashboard.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { Sigil } from "@/lib/sigil";

export const runtime = "nodejs";

const FONT_DIR = join(process.cwd(), "src", "fonts");
const fontBlack = readFileSync(join(FONT_DIR, "fraunces-900.woff"));
const fontSemi = readFileSync(join(FONT_DIR, "fraunces-600.woff"));

const SIZE = 1024;
const ACCENT = "#7c6cff"; // brand violet
const CREAM = "#f4f2f7";
const SUB = "#9a93b4";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          padding: 96,
          // Premium violet→black diagonal falloff from a single clean gradient
          // (Satori renders a hard square seam + dark center on a radial overlay).
          backgroundImage:
            "linear-gradient(145deg, #4a3a86 0%, #271b4d 30%, #140e28 58%, #08070d 100%)",
          fontFamily: "Fraunces",
        }}
      >
        {/* Wordmark + hero */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              letterSpacing: 12,
              fontWeight: 600,
              color: ACCENT,
            }}
          >
            VIBE CHECK
          </div>
          <div
            style={{ display: "flex", fontSize: 72, fontWeight: 600, color: SUB, marginTop: 40 }}
          >
            THE
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 168,
              fontWeight: 900,
              color: CREAM,
              lineHeight: 0.92,
              marginTop: -8,
            }}
          >
            FULL READ
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              fontWeight: 600,
              color: SUB,
              marginTop: 36,
              maxWidth: 720,
            }}
          >
            What your taste says when you&apos;re not listening.
          </div>
        </div>

        {/* The locked sigil — the brand mark */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Sigil size={104} filled={7} colors={ACCENT} strokeWidth={11} />
        </div>
      </div>
    ),
    {
      width: SIZE,
      height: SIZE,
      fonts: [
        { name: "Fraunces", data: fontBlack, weight: 900, style: "normal" },
        { name: "Fraunces", data: fontSemi, weight: 600, style: "normal" },
      ],
    },
  );
}
