import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { baseUrl } from "@/lib/site";
import type { LearnPage } from "@/content/learn";

/**
 * Shared explainer scaffold (brief §3.C7): renders the registry entry's
 * title + visible FAQ and emits Article / BreadcrumbList / FAQPage JSON-LD
 * (§3.B5 — GEO only; SERP expectation zero). Body prose comes in as children
 * so each page stays hand-written (D5: Hume narrates, no template mush).
 */

const GOLD = "hsl(42 80% 62%)";

/** Per-page <head> metadata derived from the same registry entry. */
export function explainerMetadata(page: LearnPage): Metadata {
  return {
    title: page.metaTitle,
    description: page.description,
    alternates: { canonical: `/learn/${page.slug}` },
    openGraph: { title: page.metaTitle, description: page.description, type: "article" },
  };
}

export default function Explainer({
  page,
  kicker,
  children,
}: {
  page: LearnPage;
  /** Small label above the H1, e.g. "HUME'S CRITERIA · 04". */
  kicker: string;
  children: React.ReactNode;
}) {
  const base = baseUrl();
  const url = `${base}/learn/${page.slug}`;

  return (
    <article>
      <p className="mt-10 text-[0.65rem] font-bold tracking-[0.3em] text-muted">{kicker}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight">
        {page.title}
      </h1>

      {/* Prose links carry the accent colour instead of a bare underline
          (PM 2026-07-17); the underline appears only as hover feedback. */}
      <div className="mt-7 space-y-5 text-[15px] leading-relaxed text-neutral-300 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-neutral-200 [&_strong]:font-semibold [&_strong]:text-white [&_a]:font-medium [&_a]:text-[hsl(42_60%_58%)] [&_a]:transition-colors [&_a:hover]:text-[hsl(42_80%_66%)] [&_a:hover]:underline [&_a:hover]:underline-offset-4">
        {children}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold" style={{ color: GOLD }}>
          Questions, answered straight
        </h2>
        <dl className="mt-5 space-y-6">
          {page.faq.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-white">{f.q}</dt>
              <dd className="mt-1.5 text-[15px] leading-relaxed text-neutral-300">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: page.title,
          description: page.description,
          url,
          author: { "@type": "Organization", name: "The Taste Gym" },
          isPartOf: { "@type": "WebSite", name: "The Taste Gym", url: base },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "The Taste Gym", item: base },
            { "@type": "ListItem", position: 2, name: "Reading room", item: `${base}/learn` },
            { "@type": "ListItem", position: 3, name: page.title, item: url },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: page.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
    </article>
  );
}
