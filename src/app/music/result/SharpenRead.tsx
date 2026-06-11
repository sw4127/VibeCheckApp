"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { track } from "@/lib/analytics";

/** §18.B retrieval triggers — neutral contexts, never example artists. */
const TRIGGERS = ["most-played this month", "shower anthem", "your 2 a.m. artist", "defend-to-the-death"];

/**
 * §20.C1 — the artist field, relocated to the result page. Effort is asked only
 * of the already-hooked: naming artists re-renders the free read (URL update,
 * stateless) and sharpens the paywall hook. Renders nothing once sharpened.
 */
export default function SharpenRead({ accent }: { accent: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [recent, setRecent] = useState<string[]>([]);
  const [durable, setDurable] = useState<string[]>([]);
  const [recentInput, setRecentInput] = useState("");
  const [durableInput, setDurableInput] = useState("");
  const [placeholder, setPlaceholder] = useState("start typing — we'll find them");
  const recentRef = useRef<HTMLInputElement>(null);

  // Already sharpened → stay out of the way.
  if (params.get("ar") || params.get("ad")) return null;

  function addRecent() {
    const v = recentInput.trim();
    if (v && recent.length < 3 && !recent.includes(v)) setRecent([...recent, v]);
    setRecentInput("");
  }
  function addDurable() {
    const v = durableInput.trim();
    if (v && durable.length < 1) setDurable([v]);
    setDurableInput("");
  }

  function sharpen() {
    const r = [...recent];
    if (recentInput.trim()) r.push(recentInput.trim());
    const d = durable.length ? durable : durableInput.trim() ? [durableInput.trim()] : [];
    if (r.length === 0 && d.length === 0) return;
    track("sharpen_read", { artists: r.length + d.length });
    const qs = new URLSearchParams(params.toString());
    if (r.length) qs.set("ar", r.slice(0, 3).join(","));
    if (d.length) qs.set("ad", d[0]);
    router.push(`/music/result?${qs.toString()}`);
  }

  return (
    <div className="mt-8 rounded-2xl border border-white/10 p-5">
      <p className="font-display text-xl font-semibold">Name names. Sharpen the read.</p>
      <p className="mt-1 text-xs text-muted">
        The more you name, the more this reads like your diary. Optional, always.
      </p>

      <p className="mt-4 text-[10px] font-bold tracking-[0.25em] text-muted">ON REPEAT RIGHT NOW · up to 3</p>
      <div className="mt-1 flex flex-wrap gap-2">
        {recent.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setRecent(recent.filter((x) => x !== a))}
            className="rounded-full px-3 py-1 text-sm"
            style={{ border: `1px solid ${accent}99` }}
          >
            {a} ✕
          </button>
        ))}
      </div>
      <input
        ref={recentRef}
        value={recentInput}
        onChange={(e) => setRecentInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRecent())}
        onBlur={addRecent}
        placeholder={recent.length < 3 ? placeholder : "that's plenty"}
        disabled={recent.length >= 3}
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-accent/60"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {TRIGGERS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setPlaceholder(`${t}…`);
              recentRef.current?.focus();
            }}
            className="rounded-full border border-white/15 px-3 py-1 text-xs text-muted transition hover:border-accent/50"
          >
            {t}
          </button>
        ))}
      </div>

      <p className="mt-4 text-[10px] font-bold tracking-[0.25em] text-muted">RIDE-OR-DIE · just 1</p>
      {durable.length === 0 ? (
        <input
          value={durableInput}
          onChange={(e) => setDurableInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDurable())}
          onBlur={addDurable}
          placeholder="years of loyalty, one name"
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-accent/60"
        />
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDurable([])}
            className="rounded-full px-3 py-1 text-sm"
            style={{ border: `1px solid ${accent}99` }}
          >
            {durable[0]} ✕
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={sharpen}
        className="mt-5 w-full rounded-full px-6 py-3 text-sm font-bold text-white transition active:scale-[0.99]"
        style={{ background: accent }}
      >
        Sharpen the read →
      </button>
    </div>
  );
}
