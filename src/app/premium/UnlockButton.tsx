"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

/**
 * Starts the hosted MoR checkout (spec §24) and redirects to it. If payments
 * aren't configured yet (501) and a dev-unlock href was provided (non-prod
 * only), it surfaces that so the gated report view is testable without keys.
 */
export default function UnlockButton({
  profile,
  price,
  devUnlockHref,
}: {
  profile: string;
  price: string;
  devUnlockHref?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function unlock() {
    setBusy(true);
    setNote(null);
    track("checkout_start", { profile });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      if (res.ok) {
        const { url } = await res.json();
        if (url) {
          window.location.href = url;
          return;
        }
      } else if (res.status === 501) {
        setNote(devUnlockHref ? "Payments not configured — use dev unlock below." : "Checkout isn't available yet.");
      } else {
        setNote("Something went wrong. Try again.");
      }
    } catch {
      setNote("Network error. Try again.");
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={unlock}
        disabled={busy}
        className="rounded-full bg-accent px-10 py-4 text-lg font-bold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? "Opening checkout…" : `Unlock the full read · ${price}`}
      </button>
      <p className="text-xs text-muted">Less than your coffee · one-time · instant</p>
      {note ? <p className="mt-1 text-xs text-amber-400">{note}</p> : null}
      {devUnlockHref ? (
        <a href={devUnlockHref} className="mt-1 text-xs text-muted underline">
          Dev unlock (test the gated view)
        </a>
      ) : null}
    </div>
  );
}
