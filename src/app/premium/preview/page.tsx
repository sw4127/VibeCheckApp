import { localPremiumReport } from "@/llm";
import { DEFAULT_SAMPLE, type PremiumProfile } from "@/content/sample-profile";
import { decodePremiumToken } from "@/lib/premiumToken";
import Track from "@/components/Track";
import UnlockButton from "../UnlockButton";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * The paywall (firewall: free = identity, paid = analysis, §12/§17.D).
 * Identity + one un-blurred self-verification hook are clear; the analysis is
 * blurred behind the unlock. A `t` token (from the music result) personalizes
 * the page with the user's REAL profile; without it (direct visits / Slice-0
 * testing) it falls back to the sample.
 */
function hook(p: PremiumProfile): string {
  const extremes = p.bigFive.filter((b) => b.level !== "Medium").slice(0, 2);
  const artist = p.artistsRecent[0] ?? p.artistsDurable[0];
  if (extremes.length === 0) {
    return `Reading you as ${p.attachmentStyle} and ${p.stateLine} — and that's just the un-blurred part.`;
  }
  const traits = extremes.map((b) => `${b.level} ${b.trait}`).join(" / ");
  return artist
    ? `You scored ${traits} — which is why ${artist} is in your rotation, and you already know what that means.`
    : `You scored ${traits} — and your listening already told us why.`;
}

export default async function PreviewPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const token = typeof sp.t === "string" ? sp.t : undefined;
  const decoded = decodePremiumToken(token);
  const profile = decoded ?? DEFAULT_SAMPLE;
  const checkoutProfile = decoded && token ? token : profile.id;

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

      {/* Un-blurred self-verification hook */}
      <p className="mt-6 text-lg leading-relaxed">{hook(profile)}</p>

      {/* The blurred analysis (curiosity gap) */}
      <div className="relative mt-8">
        <div className="flex flex-col gap-5">
          <section>
            <p className="text-xs font-bold tracking-[0.3em] text-accent">THE DIAGNOSIS</p>
            <Blur>
              <p className="mt-2 leading-relaxed">{report.diagnosis.summary}</p>
            </Blur>
          </section>
          <section>
            <p className="text-xs font-bold tracking-[0.3em] text-accent">RED FLAGS</p>
            <Blur>
              <ul className="mt-2 flex flex-col gap-1">
                {report.red_flags.map((f) => (
                  <li key={f}>• {f}</li>
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
          ChatGPT will flatter you. This one <span className="text-accent">scored</span> you — from your
          answers, the same way every time — and it doesn&apos;t care about your feelings.
        </p>
      </div>

      <p className="mt-8 text-center text-xs text-muted">Your card is the cover. The read is inside.</p>
    </main>
  );
}
