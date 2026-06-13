import type { MetadataRoute } from "next";

/**
 * §23.F (PWA-light) — installable app-feel (Add to Home Screen), zero store cut,
 * no review. Next auto-links this at /manifest.webmanifest. Icons are sigil-
 * generated PNGs (see app/icons/[size]). No service worker by decision — a
 * one-shot quiz→share→pay flow needs neither offline nor push.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vibe Check",
    short_name: "Vibe Check",
    description: "Your music taste has been taking notes on you. Get read.",
    start_url: "/",
    display: "standalone",
    background_color: "#08090d",
    theme_color: "#08090d",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
