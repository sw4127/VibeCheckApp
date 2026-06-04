"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

/**
 * Link-first share — the ONLY path back to the app from a social post is a
 * tappable link, so we share the URL (which unfurls the OG card), not the image
 * file. `navigator.share` opens the native sheet (DMs/WhatsApp/iMessage); the
 * fallback copies the link. The raw PNG lives behind the separate Download
 * buttons (for Stories, where the on-card URL is the bridge).
 */
export default function ShareButton({
  url,
  text,
  label,
  event,
  primary = false,
  accent,
}: {
  url: string;
  text: string;
  label: string;
  event: string;
  primary?: boolean;
  accent?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    track(event);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Vibe Check", text, url });
        return;
      }
    } catch {
      /* user cancelled or share failed — fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — nothing else we can safely do */
    }
  }

  const base =
    "rounded-full px-6 py-3 text-sm font-bold transition active:scale-[0.98]";
  const style = primary
    ? { background: accent ?? "var(--accent)", color: "#fff" }
    : { border: "1px solid rgba(255,255,255,0.2)" };

  return (
    <button type="button" onClick={share} className={base} style={style}>
      {copied ? "Link copied ✓" : label}
    </button>
  );
}
