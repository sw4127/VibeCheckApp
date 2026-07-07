"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

/**
 * §23.C/D demand gates (fake-doors) for P1 Compatibility + P2 Date Decoder.
 * Honest pattern: a real-looking CTA → tracked click → "not live yet" note
 * inline (no fake checkout, no email capture). Build is earned only if a door
 * OUT-CLICKS the paid-read CTA over a week (§23.D verbatim).
 */
const DOORS = [
  {
    id: "compat",
    event: "fakedoor_compat_click",
    title: "Read us together",
    line: "Two reads, one verdict: the friction map, the aux war, the shared blind spot.",
  },
  {
    id: "date",
    event: "fakedoor_date_click",
    title: "Decode a date",
    line: "Their 3 artists → what the taste signals, 3 openers, 2 friction points.",
  },
] as const;

export default function FakeDoors({ accent }: { accent: string }) {
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      {DOORS.map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => {
            track(d.event);
            setOpened(d.id);
          }}
          className="rounded-2xl border p-4 text-left transition hover:opacity-95 active:scale-[0.99]"
          style={{ borderColor: `${accent}40` }}
        >
          <p className="font-display text-lg font-semibold leading-snug">{d.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {opened === d.id ? "Not live yet — it's next on the bench. Your tap just voted for it." : `${d.line} · $3.99`}
          </p>
        </button>
      ))}
    </div>
  );
}
