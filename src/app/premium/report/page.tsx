import { redirect } from "next/navigation";
import Link from "next/link";
import Stripe from "stripe";
import { narratePremium } from "@/llm";
import { SAMPLE_PROFILES, DEFAULT_SAMPLE } from "@/content/sample-profile";
import { decodePremiumToken } from "@/lib/premiumToken";
import { applyPaidTaps, neededTaps } from "@/lib/paidTaps";
import { themeForArchetypeLabel } from "@/content/music";
import { cardPath } from "@/lib/site";
import DownloadButton from "@/app/result/DownloadButton";
import Calibration from "./Calibration";
import PurchaseTrack from "./PurchaseTrack";

export const runtime = "nodejs";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const param = (sp: Record<string, string | string[] | undefined>, k: string) =>
  (typeof sp[k] === "string" ? (sp[k] as string) : undefined);

/**
 * Stateless unlock: the report renders only if Stripe says the session is paid
 * (verified live, no DB) — or via dev-unlock in non-production for testing
 * without keys. Otherwise → back to the paywall.
 */
export default async function ReportPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const sessionId = param(sp, "session_id");
  const devUnlock = param(sp, "dev") === "1" && process.env.NODE_ENV !== "production";

  let paid = false;
  let profileRef = "velvet_cynic";

  if (sessionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const s = await stripe.checkout.sessions.retrieve(sessionId);
      paid = s.payment_status === "paid";
      if (typeof s.metadata?.profile === "string") profileRef = s.metadata.profile;
    } catch {
      paid = false;
    }
  } else if (devUnlock) {
    paid = true;
    const t = param(sp, "t");
    if (t) profileRef = t;
  }

  if (!paid) redirect("/premium/preview");

  // profileRef is either a stateless premium token (real user, from the music
  // result) or a Slice-0 sample id; malformed anything falls back to the sample.
  const base =
    decodePremiumToken(profileRef) ?? SAMPLE_PROFILES[profileRef] ?? DEFAULT_SAMPLE;
  // §18.E — paid calibration taps ride the URL and upgrade C/A/N in the engine
  // (new premiumHash → the report regenerates with full-signal Diagnosis).
  const profile = applyPaidTaps(base, {
    c: param(sp, "c"),
    a: param(sp, "a"),
    n: param(sp, "n"),
  });
  const { report, source } = await narratePremium(profile);

  // §20.B5 — the collector card (the paid vanity artifact).
  const collectorPath = cardPath({
    format: "square",
    mode: "music",
    tier: "paid",
    theme: themeForArchetypeLabel(profile.archetype),
    archetype: profile.archetype,
    verdict: report.split.verdict,
  });

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10">
      <PurchaseTrack
        unlockKey={sessionId ?? "dev"}
        props={{ profile: profile.id, source, dev: devUnlock }}
      />

      <p className="text-xs font-bold tracking-[0.4em] text-accent">VIBE CHECK · THE FULL READ</p>
      <h1 className="mt-6 font-display text-5xl font-black leading-[0.95]">{report.archetype}</h1>

      {/* §20.B5 — the collector card, delivered at the top of the report */}
      <div className="mt-7 overflow-hidden rounded-2xl border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={collectorPath} alt="Your collector card — the full read" className="w-full" />
      </div>
      <div className="mt-3 flex justify-center">
        <DownloadButton url={collectorPath} label="Save the collector card" filename="vibe-check-full-read.png" />
      </div>
      {/* §23.A (G6): stateless unlock — this URL IS the receipt's home. */}
      <p className="mt-3 text-center text-xs text-muted">
        🔖 Bookmark this page — it&apos;s your permanent link to this read.
      </p>

      {/* THE SPLIT — the centerpiece (§20.B1): LATELY vs ALWAYS, engine-routed */}
      <section className="mt-9">
        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs font-bold tracking-[0.3em] text-accent">LATELY · the last few weeks</p>
            <p className="mt-2 font-display text-xl font-semibold leading-snug">
              {report.split.lately.headline}
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {report.split.lately.lines.map((l) => (
                <p key={l} className="text-sm leading-relaxed text-slate-300">{l}</p>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs font-bold tracking-[0.3em] text-accent">ALWAYS · the baseline you</p>
            <p className="mt-2 font-display text-xl font-semibold leading-snug">
              {report.split.always.headline}
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {report.split.always.lines.map((l) => (
                <p key={l} className="text-sm leading-relaxed text-slate-300">{l}</p>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-4 font-display text-lg font-semibold leading-snug">{report.split.verdict}</p>
      </section>

      {/* Diagnosis — signal-only (§20.B2) */}
      <section className="mt-9">
        <p className="text-xs font-bold tracking-[0.3em] text-accent">THE DIAGNOSIS</p>
        <p className="mt-3 text-lg leading-relaxed">{report.diagnosis.summary}</p>
        <div className="mt-5 flex flex-col gap-3">
          {report.diagnosis.traits.map((b) => (
            <div key={b.trait} className="rounded-xl border border-white/10 p-3">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-lg font-semibold">{b.trait}</span>
                <span className="text-xs font-bold tracking-wider text-accent">{b.level.toUpperCase()}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">{b.line}</p>
            </div>
          ))}
        </div>
        {report.diagnosis.steady_line ? (
          <p className="mt-3 text-sm italic leading-relaxed text-muted">{report.diagnosis.steady_line}</p>
        ) : null}
        <p className="mt-4 text-sm leading-relaxed">
          <span className="font-semibold text-accent">{report.diagnosis.attachment_style.style}</span>{" "}
          — {report.diagnosis.attachment_style.line}
        </p>
      </section>

      {/* §18.E — upgrade the unmeasured traits, paid-side */}
      <Calibration taps={neededTaps(profile)} />

      {/* Red Flags — with receipts (§20.B3) */}
      <section className="mt-9">
        <p className="text-xs font-bold tracking-[0.3em] text-accent">RED FLAGS</p>
        <ul className="mt-3 flex flex-col gap-3">
          {report.red_flags.map((f) => (
            <li key={f.flag} className="leading-relaxed">
              🚩 {f.flag}
              <span className="mt-0.5 block text-xs text-muted">({f.receipt})</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Prescription */}
      <section className="mt-9">
        <p className="text-xs font-bold tracking-[0.3em] text-accent">THE PRESCRIPTION</p>
        <p className="mt-3 leading-relaxed">{report.prescription.intro}</p>
        <div className="mt-3 flex flex-col gap-2">
          {report.prescription.picks.map((pk) => (
            <p key={pk.pick} className="leading-relaxed">
              <span className="font-semibold text-accent">→ {pk.pick}</span> — {pk.why}
            </p>
          ))}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">🎧 {report.prescription.pairing}</p>

        {/* §20.B4 — the 7-Day Recalibration: Day 1 visible, the week expandable */}
        {report.prescription.protocol ? (
          <details className="mt-5 rounded-2xl border border-white/10 p-4">
            <summary className="cursor-pointer font-display text-lg font-semibold">
              {report.prescription.protocol.title}
              <span className="mt-1 block text-sm font-normal text-slate-300">
                Day 1 — {report.prescription.protocol.days[0]}
              </span>
              <span className="mt-1 block text-xs text-muted">tap for the full week ↓</span>
            </summary>
            <ol className="mt-3 flex flex-col gap-2">
              {report.prescription.protocol.days.map((d, i) => (
                <li key={d} className="text-sm leading-relaxed text-slate-300">
                  <span className="font-semibold text-accent">Day {i + 1}</span> — {d}
                </li>
              ))}
            </ol>
          </details>
        ) : null}
      </section>

      <p className="mt-9 font-display text-xl font-semibold leading-snug">{report.closer}</p>

      {/* §20.B6 — The Second Listen (stateless retention) */}
      <p className="mt-8 rounded-2xl border border-white/10 p-4 text-center text-sm text-muted">
        Retake in a month. <span className="text-accent">LATELY</span> should change.{" "}
        <span className="text-accent">ALWAYS</span> shouldn&apos;t. If it does — we should talk.
      </p>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-muted underline">
          Back to Vibe Check
        </Link>
        <p className="mt-3 text-[11px] text-muted/70">
          <Link href="/legal" className="underline">
            14-day refunds · terms & privacy
          </Link>
        </p>
      </div>
    </main>
  );
}
