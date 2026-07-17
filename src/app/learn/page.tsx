import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { baseUrl } from "@/lib/site";
import { LEARN_PAGES } from "@/content/learn";

/**
 * Reading-room index (brief §3.C7). The gym's library: one card per
 * explainer, all server-rendered (§3.C8).
 */

export const metadata: Metadata = {
  title: "Reading Room — The Taste Gym",
  description:
    "How the Taste Gym measures taste: Hume's five criteria, the Prestige Test, the Delicacy Trials, and the methodology — stated plainly, including what we refuse to claim.",
  alternates: { canonical: "/learn" },
  openGraph: {
    title: "Reading Room — The Taste Gym",
    description:
      "Hume's five criteria of taste, and the instruments that turn them into measured numbers.",
  },
};

const GOLD = "hsl(42 80% 62%)";

export default function LearnIndex() {
  const base = baseUrl();
  return (
    <div>
      <p className="mt-10 text-[0.65rem] font-bold tracking-[0.3em] text-muted">READING ROOM</p>
      <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight">
        The gym has a library.
      </h1>
      <p className="mt-5 text-[15px] leading-relaxed text-neutral-300">
        In 1757 David Hume wrote <em>Of the Standard of Taste</em> and named the five things a true
        judge needs: delicacy, practice, comparison, freedom from prejudice, and good sense. He
        never got to measure any of them. We built the machines. These pages explain each
        criterion, the instrument that operationalizes it, and the methodology — including the
        claims we deliberately refuse to make.
      </p>

      <div className="mt-9 flex flex-col gap-3">
        {LEARN_PAGES.map((p) => (
          <Link
            key={p.slug}
            href={`/learn/${p.slug}`}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25"
          >
            <p className="font-display text-lg font-semibold transition-colors group-hover:text-[hsl(42_80%_62%)]">
              {p.title}
            </p>
            <p className="mt-0.5 text-sm text-muted">{p.teaser}</p>
          </Link>
        ))}
      </div>

      <Link
        href="/bias"
        className="mt-10 inline-block rounded-full px-7 py-3.5 font-bold text-black transition hover:opacity-95 active:scale-[0.98]"
        style={{ background: GOLD }}
      >
        Enough reading — take the Prestige Test
      </Link>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Reading Room — The Taste Gym",
          url: `${base}/learn`,
          hasPart: LEARN_PAGES.map((p) => ({
            "@type": "Article",
            headline: p.title,
            url: `${base}/learn/${p.slug}`,
          })),
        }}
      />
    </div>
  );
}
