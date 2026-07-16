import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/site";
import { LEARN_PAGES } from "@/content/learn";

/**
 * sitemap.xml (2026-07-16 brief §3.B4 — serves C2/N1). Stable, canonical
 * content pages only: result/share pages are parameterized permutations and
 * stay out; crawlers reach them through real shared links.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = baseUrl();
  const page = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly",
  ) => ({ url: `${base}${path}`, priority, changeFrequency });

  return [
    page("/", 1, "weekly"),
    page("/bias", 0.9, "weekly"),
    page("/learn", 0.8),
    ...LEARN_PAGES.map((p) => page(`/learn/${p.slug}`, 0.7)),
    page("/music/quiz", 0.4),
    page("/quiz", 0.3, "yearly"),
    page("/fan-verdict", 0.3, "yearly"),
    page("/legal", 0.1, "yearly"),
  ];
}
