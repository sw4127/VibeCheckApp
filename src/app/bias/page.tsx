import type { Metadata } from "next";
import BiasFlow from "./BiasFlow";
import JsonLd from "@/components/JsonLd";
import { baseUrl } from "@/lib/site";

/**
 * The Prestige-Bias Test (memo D2 Instrument 1, D3 v1 flagship).
 * Naming is provisional — "gym" product naming is open per memo §9.5.
 */
export const metadata: Metadata = {
  title: "The Prestige Test — do you hear the music, or the name?",
  description:
    "Rate eight clips with just your ears. Rate them again with the names attached. The gap is your number.",
  alternates: { canonical: "/bias" },
  openGraph: {
    title: "The Prestige Test — do you hear the music, or the name?",
    description:
      "Rate eight clips with just your ears. Rate them again with the names attached. The gap is your number.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function BiasPage() {
  return (
    <>
      <BiasFlow />
      {/* §3.B5 — WebApplication schema on the instrument itself (GEO only). */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "The Prestige Test",
          url: `${baseUrl()}/bias`,
          applicationCategory: "EntertainmentApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description:
            "A four-minute within-subject test of prestige bias in music taste: eight clips rated blind, then labeled — some labels deliberately swapped and disclosed in a mandatory debrief. The blind-vs-labeled gap is the measured result.",
          isPartOf: { "@type": "WebSite", name: "The Taste Gym", url: baseUrl() },
        }}
      />
    </>
  );
}
