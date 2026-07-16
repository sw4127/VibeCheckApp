import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/site";

/**
 * robots.txt (2026-07-16 brief §3.B4 — serves C2/N1): everything is public,
 * and the AI crawlers are EXPLICITLY welcomed (GEO — the launch write-up's
 * audience includes the bots that answer questions about the product).
 *
 * Deliberately NO disallows: several social/unfurl bots (Twitterbot et al.)
 * respect robots.txt for og:image fetches, and our share-card images live
 * under /api/ — blocking /api/ would silently kill share previews.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
    ],
    sitemap: `${baseUrl()}/sitemap.xml`,
  };
}
