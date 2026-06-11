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

  if (taps.length === 0) return null;

  function choose(tapId: string, optionId: string) {
    const next = { ...answers, [tapId]: optionId };
    setAnswers(next);
    if (Object.keys(next).length === taps.length) {
      track("paid_calibration", { taps: taps.length });
      const qs = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(next)) qs.set(k, v);
      router.push(`/premium/report?${qs.toString()}`);
    }
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
    </section>
  );
}
