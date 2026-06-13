import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Privacy — Vibe Check",
  description: "The plain-language legal page: terms of use and privacy.",
};

/**
 * §23.A (G3) — the legal floor: ToS, privacy, all-sales-final, contact. Plain
 * language, honest, and consistent with the §8/§9 entertainment framing. Static.
 */
export default function LegalPage() {
  const support = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10">
      <p className="text-xs font-bold tracking-[0.4em] text-accent">VIBE CHECK</p>
      <h1 className="mt-6 font-display text-4xl font-black leading-tight">
        Terms & privacy
      </h1>
      <p className="mt-3 text-sm text-muted">Plain language, no tricks. Last updated June 2026.</p>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">What this is</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Vibe Check is an <strong>entertainment</strong> product. It reads your quiz answers with a
          deterministic scoring engine and writes a playful, personality-style reading. It is not a
          psychological assessment, not medical or mental-health advice, and not a diagnosis of
          anything. Trait language (like &ldquo;Big Five&rdquo; or attachment styles) is used as a
          playful lens, grounded in published research on music preference — a mirror, never a
          verdict.
        </p>
      </section>

      <section className="mt-7">
        <h2 className="font-display text-xl font-semibold">Terms of use</h2>
        <ul className="mt-2 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-slate-300">
          <li>The paid &ldquo;full read&rdquo; is a one-time digital purchase for personal use.</li>
          <li>
            Don&apos;t use readings to make decisions about employment, credit, insurance, housing,
            or anything else that matters that much. It&apos;s entertainment.
          </li>
          <li>
            Footballer names appear only to describe public playing styles. Vibe Check is not
            affiliated with, endorsed by, or connected to FIFA, any club, league, or player.
          </li>
          <li>Don&apos;t abuse, reverse-engineer, or resell the service. Be normal.</li>
          <li>Not directed at children under 13.</li>
        </ul>
      </section>

      <section className="mt-7">
        <h2 className="font-display text-xl font-semibold">All sales are final</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          The full read is a digital product delivered <strong>instantly</strong> — the moment you
          pay, it&apos;s unlocked and yours to keep. For that reason, all sales are final and we
          don&apos;t offer refunds. If something technically went wrong — you paid but couldn&apos;t
          see your read —{" "}
          {support ? (
            <>
              email <a className="text-accent underline" href={`mailto:${support}`}>{support}</a>
            </>
          ) : (
            "reply to your Stripe receipt"
          )}{" "}
          and we&apos;ll make sure you get what you paid for.
        </p>
      </section>

      <section className="mt-7">
        <h2 className="font-display text-xl font-semibold">Privacy</h2>
        <ul className="mt-2 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-slate-300">
          <li>
            <strong>No accounts, no user database.</strong> Your quiz answers live in the page URL
            on your device — we don&apos;t store them on a server.
          </li>
          <li>
            Artist names you type are sent to our AI provider (Anthropic) solely to generate your
            reading, and ride along inside your purchase record (Stripe) so your paid report can be
            rebuilt from your receipt link.
          </li>
          <li>Payments are processed by Stripe; we never see your card number.</li>
          <li>
            We collect anonymized usage events (page views, quiz completion, shares) via Vercel Web
            Analytics to see whether the product works. No advertising trackers, no selling data.
          </li>
          <li>
            Want a purchase record gone? Contact us ({support ? support : "reply to your receipt"})
            and we&apos;ll handle it.
          </li>
        </ul>
      </section>

      <section className="mt-7">
        <h2 className="font-display text-xl font-semibold">Contact</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {support ? (
            <>
              <a className="text-accent underline" href={`mailto:${support}`}>{support}</a> — or
              reply to your Stripe receipt.
            </>
          ) : (
            "Reply to your Stripe purchase receipt and it reaches us."
          )}
        </p>
      </section>

      <div className="mt-10 mb-2">
        <Link href="/" className="text-sm text-muted underline">
          ← Back to Vibe Check
        </Link>
      </div>
    </main>
  );
}
