"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PaidTap } from "@/lib/paidTaps";
import { track } from "@/lib/analytics";

/**
 * §18.E — the paid-flow durable taps. Shown only for traits still reading as
 * Medium placeholders; answers ride the URL (stateless) and regenerate the
 * report with full-signal Diagnosis. Friction is paid-side by design.
 */
export default function Calibration({ taps }: { taps: PaidTap[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  if (taps.length === 0) return null;

  function go(merged: Record<string, string>, via: "taps" | "text") {
    track("paid_calibration", { taps: taps.length, via });
    const qs = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(merged)) qs.set(k, v);
    router.push(`/premium/report?${qs.toString()}`);
  }

  function choose(tapId: string, optionId: string) {
    const next = { ...answers, [tapId]: optionId };
    setAnswers(next);
    if (Object.keys(next).length === taps.length) go(next, "taps");
  }

  // §slice-3 — addition: free text fills ONLY the gaps you didn't tap (manual
  // taps win). The text → existing option ids (engine scores; §6), then the
  // report regenerates exactly as the manual path does.
  async function submitText() {
    const clean = text.trim().replace(/\s+/g, " ").slice(0, 240);
    if (!clean || busy) return;
    setBusy(true);
    const remaining = taps.filter((t) => !answers[t.id]).map((t) => t.id);
    let ids: Record<string, string> = {};
    try {
      const res = await fetch(`/api/calibrate?text=${encodeURIComponent(clean)}&taps=${remaining.join(",")}`);
      if (res.ok) ids = ((await res.json())?.ids as Record<string, string>) ?? {};
    } catch {
      /* no map → fall back to whatever was tapped (untapped stay Medium) */
    }
    go({ ...ids, ...answers }, "text"); // manual taps override the text
  }

  return (
    <section className="mt-9 rounded-2xl border border-accent/40 bg-accent/5 p-5">
      <p className="font-display text-xl font-semibold">Three taps sharper.</p>
      <p className="mt-1 text-xs text-muted">
        The traits marked steady aren&apos;t hiding — they&apos;re unmeasured. Fix that.
      </p>
      {taps.map((tap) => (
        <div key={tap.id} className="mt-4">
          <p className="text-sm font-semibold">{tap.prompt}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tap.options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => choose(tap.id, o.id)}
                className={`rounded-full border px-4 py-1.5 text-sm transition active:scale-[0.98] ${
                  answers[tap.id] === o.id
                    ? "border-accent bg-accent/20"
                    : "border-white/15 hover:border-accent/50"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* …or just say it. Coherent with the taps — fills whatever you skipped. */}
      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="text-sm font-semibold">…or just say it.</p>
        <p className="mt-1 text-xs text-muted">
          A line about how you actually are — we&apos;ll fill in anything you skipped above.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 240))}
          maxLength={240}
          rows={2}
          placeholder="e.g. my playlists are chaos but I'll never hand back the aux"
          className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 text-sm outline-none transition focus:border-accent/50"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-muted">{text.length}/240</span>
          <button
            type="button"
            onClick={submitText}
            disabled={busy || !text.trim()}
            className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
          >
            {busy ? "Reading…" : "Read me from this →"}
          </button>
        </div>
      </div>
    </section>
  );
}
