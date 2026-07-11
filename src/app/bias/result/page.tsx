/**
 * /bias/result?b=&l= — the stateless Prestige-Bias permalink (share target).
 *
 * Recomputes the verdict from the raw rating passes on every request (§6
 * principle, N3: the page can only ever show what the engine concludes).
 * Doubles as the OG unfurl target: the social preview IS the bias card.
 * Viewer-facing by design — the mandatory debrief (swap disclosure) belongs
 * to the test-taker's own run in /bias, not to a shared link; here the CTA
 * sends the viewer to take the test themselves.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { computeBiasResult, decodeBiasRatings, type BiasResult } from "@/engine/bias";
import { BIAS_CLIPS, BIAS_INSTRUMENT_ID, BIAS_POOL_VERSION } from "@/content/bias/items";
import { VERDICT_COPY, shareText } from "@/content/bias/copy";
import { baseUrl } from "@/lib/site";
import FluidField from "@/components/FluidField";
import Track from "@/components/Track";
import ShareButton from "@/app/result/ShareButton";
import DownloadButton from "@/app/result/DownloadButton";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const GOLD = "hsl(42 80% 62%)";
const GOLD_GLOW = "hsl(42 80% 60% / 0.45)";
const FLUID = ["hsl(42 55% 48%)", "hsl(28 50% 44%)", "hsl(52 45% 46%)", "hsl(20 40% 40%)"];

function resultFrom(sp: Record<string, string | string[] | undefined>): {
  result: BiasResult;
  b: string;
  l: string;
} | null {
  // RT-7b: links minted against an older pool die gracefully (redirect to
  // /bias) rather than rendering ratings against items they never measured.
  if (sp.pv !== String(BIAS_POOL_VERSION)) return null;
  const b = typeof sp.b === "string" ? sp.b : undefined;
  const l = typeof sp.l === "string" ? sp.l : undefined;
  const blind = decodeBiasRatings(BIAS_CLIPS, b);
  const labeled = decodeBiasRatings(BIAS_CLIPS, l);
  if (!blind || !labeled || !b || !l) return null;
  return { result: computeBiasResult(BIAS_INSTRUMENT_ID, BIAS_CLIPS, blind, labeled), b, l };
}

function cardUrl(format: "story" | "square" | "og", b: string, l: string): string {
  return `/api/bias-card?format=${format}&pv=${BIAS_POOL_VERSION}&b=${encodeURIComponent(b)}&l=${encodeURIComponent(l)}`;
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const data = resultFrom(await searchParams);
  if (!data) return { title: "The Prestige Test" };
  const title = `${data.result.pct > 0 ? "+" : ""}${data.result.pct}% label-driven — The Prestige Test`;
  const description = "Rate eight clips blind, then with the names attached. The gap is your number.";
  const og = `${baseUrl()}${cardUrl("og", data.b, data.l)}`;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default async function BiasResultPage({ searchParams }: { searchParams: SearchParams }) {
  const data = resultFrom(await searchParams);
  if (!data) redirect("/bias");
  const { result, b, l } = data;
  const v = VERDICT_COPY[result.verdict];
  const permalink = `${baseUrl()}/bias/result?pv=${BIAS_POOL_VERSION}&b=${encodeURIComponent(b)}&l=${encodeURIComponent(l)}`;

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center overflow-hidden px-6 py-12 text-center">
      <FluidField colors={FLUID} baseColor="#0B0A08" intensity={0.7} scrim={false} vignette />
      <Track event="bias_result_view" props={{ pct: result.pct, verdict: result.verdict }} />
      <div className="relative z-10 flex flex-col items-center">
        <p className="text-xs font-bold tracking-[0.4em]" style={{ color: GOLD }}>
          THE PRESTIGE TEST
        </p>
        <p
          className="mt-6 font-display text-7xl font-semibold leading-none"
          style={{ color: GOLD, textShadow: `0 0 60px ${GOLD_GLOW}` }}
        >
          {result.pct > 0 ? "+" : ""}
          {result.pct}%
        </p>
        <p className="mt-3 text-sm text-muted">how far these ratings moved toward the labels</p>
        <h1 className="mt-6 font-display text-3xl font-semibold">{v.title}</h1>
        <p className="mt-2 max-w-sm text-base leading-relaxed text-muted">{v.sub}</p>

        {/* The card itself — real server-rendered image, long-press-saveable
            in webviews where programmatic download is blocked. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cardUrl("square", b, l)}
          alt={`Prestige Test card: ${result.pct}% label-driven`}
          className="mt-8 w-full max-w-xs rounded-2xl border border-white/10"
        />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <ShareButton
            url={permalink}
            text={shareText(result.pct)}
            label="Share your number"
            event="bias_share"
            primary
            accent={GOLD}
          />
          <DownloadButton url={cardUrl("story", b, l)} label="Story card" filename="prestige-test-story.png" />
        </div>

        <p className="mt-8 text-sm text-muted">Someone sent you their number?</p>
        <Link
          href="/bias"
          className="mt-3 rounded-full px-7 py-3.5 text-base font-bold text-black transition active:scale-[0.98]"
          style={{ background: GOLD, boxShadow: `0 10px 30px ${GOLD_GLOW}` }}
        >
          Get yours — take the test
        </Link>
        <p className="mt-6 text-xs text-muted">
          Provisional read — percentiles arrive when the cohort does, not before.
        </p>
      </div>
    </main>
  );
}
