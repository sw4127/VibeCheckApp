import { localPremiumReport } from "@/llm";
import { DEFAULT_SAMPLE, type PremiumProfile } from "@/content/sample-profile";
import { lawForArchetypeLabel } from "@/content/music";
import { decodePremiumToken } from "@/lib/premiumToken";
import { baseUrl } from "@/lib/site";
import { buildPreviewHook } from "../previewHook";
import Track from "@/components/Track";
import UnlockButton from "../UnlockButton";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * A1b: the cached Haiku polish of the hook, with the deterministic A1a hook as
 * the fallback. Prod-only (a dev self-fetch can return an HTML error page) and
 * artist-gated (the route only spends a call when there's an artist to name);
 * only real model hooks are edge-cached, so cost ≈ one tiny call per unique
 * (archetype · signal · artist set).
 */
async function getHook(profile: PremiumProfile, deterministic: string): Promise<string> {
  const extreme = profile.bigFive.find((b) => b.level !== "Medium");
  const topSignal = extreme ? `${extreme.level} ${extreme.trait}` : "";
  const artists = [...profile.artistsRecent, ...profile.artistsDurable].filter(Boolean);
  if (process.env.NODE_ENV !== "production" || artists.length === 0 || !topSignal) {
    return deterministic;
  }
  try {
    const qs = new URLSearchParams({ a: profile.archetype, s: topSignal, ar: artists.join(",") });
    const res = await fetch(`${baseUrl()}/api/premium-hook?${qs.toString()}`, { cache: "force-cache" });
    if (res.ok && (res.headers.get("content-type") ?? "").includes("application/json")) {
      const json = (await res.json()) as { hook?: string | null };
      if (typeof json.hook === "string" && json.hook) return json.hook;
    }
  } catch {
    /* fall through to the deterministic A1a hook */
  }
  return deterministic;
}

/**
 * The paywall (firewall: free = identity, paid = analysis, §12/§17.D).
 * Identity + one un-blurred self-verification hook are clear; the analysis is
 * blurred behind the unlock. A `t` token (from the music result) personalizes
 * the page with the user's REAL profile; without it (direct visits / Slice-0
 * testing) it falls back to the sample.
 */
export default async function PreviewPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const token = typeof sp.t === "string" ? sp.t : undefined;
  const decoded = decodePremiumToken(token);
  const profile = decoded ?? DEFAULT_SAMPLE;
  const checkoutProfile = decoded && token ? token : profile.id;

  // A1a: the deterministic LAW dangled by the hook is the FIRST blurred line
  // below — so "it's the first line below" is honest, not a fabricated receipt.
  const law = lawForArchetypeLabel(profile.archetype);
  const hook = await getHook(profile, buildPreviewHook(profile, !!law));
  const report = localPremiumReport(profile);
  const devUnlockHref =
    process.env.NODE_ENV !== "production"
      ? `/premium/report?dev=1${token ? `&t=${token}` : ""}`
      : undefined;

  const Blur = ({ children }: { children: React.ReactNode }) => (
    <div aria-hidden className="select-none" style={{ filter: "blur(6px)", opacity: 0.7 }}>
      {children}
    </div>
  );

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10">
      <Track event="paywall_view" props={{ profile: decoded ? "token" : profile.id }} />
      <p className="text-xs font-bold tracking-[0.4em] text-accent">VIBE CHECK</p>

      {/* Free identity */}
      <p className="mt-8 text-xs font-bold tracking-[0.35em] text-muted">YOUR VIBE IS</p>
      <h1 className="mt-2 font-display text-5xl font-black leading-[0.95]">{profile.archetype}</h1>

      {/* Un-blurred self-verification hook (A1b polish, A1a fallback) */}
      <p className="mt-6 text-lg leading-relaxed">{hook}</p>

      {/* The blurred analysis (curiosity gap) — v2 blocks (§20.B) */}
      <div className="relative mt-8">
        <div className="flex flex-col gap-5">
          {law && (
            <section>
              <p className="text-xs font-bold tracking-[0.3em] text-accent">THE RULE YOU LIVE BY</p>
              <Blur>
                <p className="mt-2 font-display text-xl font-semibold leading-snug">{law}</p>
              </Blur>
            </section>
          )}
          <section>
            <p className="text-xs font-bold tracking-[0.3em] text-accent">LATELY vs ALWAYS · the split</p>
            <p className="mt-1 text-xs text-muted">what the last few weeks say · what never changes</p>
            <Blur>
              <p className="mt-2 leading-relaxed">
                {report.split.lately.headline} {report.split.lately.lines[0]}
              </p>
              <p className="mt-1 leading-relaxed">{report.split.verdict}</p>
            </Blur>
          </section>
          <section>
            <p className="text-xs font-bold tracking-[0.3em] text-accent">THE DIAGNOSIS</p>
            <Blur>
              <p className="mt-2 leading-relaxed">{report.diagnosis.summary}</p>
            </Blur>
          </section>
          <section>
            <p className="text-xs font-bold tracking-[0.3em] text-accent">RED FLAGS · with receipts</p>
            <Blur>
              <ul className="mt-2 flex flex-col gap-1">
                {report.red_flags.map((f) => (
                  <li key={f.flag}>
                    • {f.flag} <span className="text-xs">({f.receipt})</span>
                  </li>
                ))}
              </ul>
            </Blur>
          </section>
          <section>
            <p className="text-xs font-bold tracking-[0.3em] text-accent">THE PRESCRIPTION</p>
            <Blur>
              <p className="mt-2 leading-relaxed">
                {report.prescription.intro} {report.prescription.picks[0]?.pick}…
              </p>
            </Blur>
          </section>
        </div>
      </div>

      {/* Unlock */}
      <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-white/10 p-6 text-center">
        <p className="font-display text-2xl font-semibold leading-snug">
          You already built this. Don&apos;t read half of yourself.
        </p>
        <UnlockButton profile={checkoutProfile} price="$3.99" devUnlockHref={devUnlockHref} />
        <p className="text-xs leading-relaxed text-muted">
          ChatGPT will flatter you. This one <span className="text-accent">scored</span>{" "}
          you — from your answers, the same way every time — and it doesn&apos;t care about your feelings.
        </p>
      </div>

      <p className="mt-8 text-center text-xs text-muted">Your card is the cover. The read is inside.</p>
      <p className="mt-3 text-center text-[11px] text-muted/70">
        One-time purchase · all sales final ·{" "}
        <a href="/legal" className="underline">
          terms & privacy
        </a>
      </p>
    </main>
  );
}
