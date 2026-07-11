"use client";

/**
 * Prestige-Bias Test flow (memo D2 Instrument 1 · D3 flagship · D5 narration).
 *
 * Five beats: Hume frame → blind pass → bridge → labeled pass → reveal →
 * MANDATORY debrief (memo §3 — the swapped labels are disclosed before the
 * user leaves; there is no path around it). All numbers come from
 * src/engine/bias (deterministic; §6 principle) — nothing here classifies.
 *
 * Placeholder audio: while the pool is placeholder (PM authors real PD/CC
 * clips per §8.2), clips synthesize a WebAudio triad per index — clearly
 * badged, zero asset files. Real clips will render an <audio> element on the
 * same seam (ClipPlayer).
 */

import { useEffect, useRef, useState } from "react";
import FluidField from "@/components/FluidField";
import { track } from "@/lib/analytics";
import {
  computeBiasResult,
  encodeBiasRatings,
  BIAS_SCALE_MAX,
  type BiasRatings,
  type BiasResult,
} from "@/engine/bias";
import { BIAS_CLIPS, BIAS_INSTRUMENT_ID, BIAS_POOL_VERSION, type BiasClip } from "@/content/bias/items";
import { VERDICT_COPY, shareText } from "@/content/bias/copy";
import ShareButton from "@/app/result/ShareButton";
import DownloadButton from "@/app/result/DownloadButton";
import ClipPlayer, { isPlaceholderSrc } from "./ClipPlayer";

/* One accent in play (design bar): prestige gold. */
const GOLD = "hsl(42 80% 62%)";
const GOLD_DIM = "hsl(42 45% 50%)";
const GOLD_TINT = "hsl(42 70% 55% / 0.14)";
const GOLD_GLOW = "hsl(42 80% 60% / 0.45)";
const FLUID = ["hsl(42 55% 48%)", "hsl(28 50% 44%)", "hsl(52 45% 46%)", "hsl(20 40% 40%)"];
const BASE = "#0B0A08"; // warm near-black — the gym after hours

const RATE_BEAT_MS = 420;

type Phase = "frame" | "blind" | "bridge" | "labeled" | "reveal" | "debrief";

export default function BiasFlow() {
  const [phase, setPhase] = useState<Phase>("frame");
  const [idx, setIdx] = useState(0);
  const [blind, setBlind] = useState<BiasRatings>({});
  const [labeled, setLabeled] = useState<BiasRatings>({});
  const [played, setPlayed] = useState(false); // current clip+pass is ARMED (min-listen met, RT-2b)
  const [picked, setPicked] = useState<number | null>(null); // beat-lock visual
  const [result, setResult] = useState<BiasResult | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // D6/RT-5: per-item heard milliseconds, both passes, captured at rate time.
  const listenMs = useRef<{ blind: Record<string, number>; labeled: Record<string, number> }>({
    blind: {},
    labeled: {},
  });

  const clip: BiasClip | undefined = BIAS_CLIPS[idx];
  const total = BIAS_CLIPS.length;
  const pass = phase === "blind" ? "blind" : "labeled";

  useEffect(() => {
    track("bias_frame_view", {});
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function rate(value: number) {
    if (!clip || !played || picked !== null) return;
    setPicked(value);
    const nextRatings = pass === "blind" ? { ...blind, [clip.id]: value } : { ...labeled, [clip.id]: value };
    if (pass === "blind") setBlind(nextRatings);
    else setLabeled(nextRatings);

    timer.current = setTimeout(() => {
      setPicked(null);
      setPlayed(false);
      if (idx < total - 1) {
        setIdx(idx + 1);
        return;
      }
      if (pass === "blind") {
        track("bias_blind_complete", {});
        setIdx(0);
        setPhase("bridge");
        return;
      }
      // Labeled pass done → compute the verdict (deterministic, in code).
      const r = computeBiasResult(BIAS_INSTRUMENT_ID, BIAS_CLIPS, blind, nextRatings);
      setResult(r);
      track("bias_labeled_complete", { pct: r.pct, verdict: r.verdict });
      // D6 interim dataset (PM-approved): the anonymized response vector goes
      // to the analytics sink until the §8.1 store exists. No PII — ratings,
      // hash, pool version only.
      track("bias_result", {
        pool: BIAS_INSTRUMENT_ID,
        poolVersion: BIAS_POOL_VERSION,
        hash: r.hash,
        blind: BIAS_CLIPS.map((c) => blind[c.id]).join(","),
        labeled: BIAS_CLIPS.map((c) => nextRatings[c.id]).join(","),
        listen_b: BIAS_CLIPS.map((c) => listenMs.current.blind[c.id] ?? 0).join(","),
        listen_l: BIAS_CLIPS.map((c) => listenMs.current.labeled[c.id] ?? 0).join(","),
        pct: r.pct,
        swappedPct: r.swappedPct,
        swayShare: r.swayShare,
        edges: r.edgeCount,
        verdict: r.verdict,
      });
      setPhase("reveal");
    }, RATE_BEAT_MS);
  }

  const shell = "relative mx-auto flex min-h-dvh w-full max-w-lg flex-col overflow-hidden px-6 py-10";
  const kicker = (
    <p className="text-xs font-bold tracking-[0.4em]" style={{ color: GOLD }}>
      THE TASTE GYM
    </p>
  );

  /* ---------------------------------------------------------------- frame */
  if (phase === "frame") {
    return (
      <main className={`${shell} justify-center`}>
        <FluidField colors={FLUID} baseColor={BASE} intensity={0.6} scrim={false} vignette />
        <div className="relative z-10">
          {kicker}
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight">
            Do you hear the music — or the name on it?
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">
            In 1757, David Hume pointed out that reputation gets to a judgment before the ears do —
            a famous name can make a mediocre thing sound profound. He called it prejudice.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Eight clips. You rate them twice: once with nothing but your ears, once with the names and
            the acclaim attached. <span className="text-foreground">The gap is your number.</span>
          </p>
          <button
            type="button"
            onClick={() => {
              track("bias_start", {});
              setPhase("blind");
            }}
            className="mt-8 self-start rounded-full px-7 py-3.5 text-base font-bold text-black transition active:scale-[0.98]"
            style={{ background: GOLD, boxShadow: `0 10px 30px ${GOLD_GLOW}` }}
          >
            Start the blind pass
          </button>
          <p className="mt-4 text-xs text-muted">~4 minutes. No sign-up. Headphones help.</p>
        </div>
      </main>
    );
  }

  /* --------------------------------------------------------------- bridge */
  if (phase === "bridge") {
    return (
      <main className={`${shell} justify-center`}>
        <FluidField colors={FLUID} baseColor={BASE} intensity={0.68} scrim={false} vignette />
        <div className="relative z-10">
          {kicker}
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight">Round two.</h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Same eight clips — this time the names and the reputations come attached.
            Rate what you hear.
          </p>
          <button
            type="button"
            onClick={() => setPhase("labeled")}
            className="mt-8 rounded-full px-7 py-3.5 text-base font-bold text-black transition active:scale-[0.98]"
            style={{ background: GOLD, boxShadow: `0 10px 30px ${GOLD_GLOW}` }}
          >
            Start the labeled pass
          </button>
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------- rating passes */
  if (phase === "blind" || phase === "labeled") {
    if (!clip) return null;
    const caption =
      (isPlaceholderSrc(clip.audioSrc) ? "placeholder tone — real clips pending" : "tap to listen") +
      (played ? "" : " · rating unlocks as you listen");
    return (
      <main className={shell}>
        <FluidField colors={FLUID} baseColor={BASE} intensity={0.6} scrim={false} vignette />
        <div className="relative z-10 flex flex-1 flex-col">
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-medium text-muted">
              <span className="tracking-[0.3em]">{pass === "blind" ? "BLIND PASS" : "LABELED PASS"}</span>
              <span>
                {idx + 1} / {total}
              </span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(((pass === "labeled" ? total : 0) + idx + 1) / (total * 2)) * 100}%`,
                  background: GOLD,
                  boxShadow: `0 0 8px ${GOLD}`,
                }}
              />
            </div>
          </div>

          {pass === "blind" ? (
            <p className="text-sm text-muted">No names. No context. Just — how good is this?</p>
          ) : (
            <div className="rounded-2xl border p-4" style={{ borderColor: "hsl(42 60% 55% / 0.35)", background: "rgba(255,255,255,0.03)" }}>
              <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">THE LABEL SAYS</p>
              <p className="mt-1.5 font-display text-xl font-semibold" style={{ color: GOLD }}>
                {clip.shownArtist}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{clip.shownBlurb}</p>
            </div>
          )}

          {/* Player — key resets internal state per clip AND per pass. */}
          <ClipPlayer
            key={`${pass}-${clip.id}`}
            src={clip.audioSrc}
            index={idx}
            caption={caption}
            onArmed={() => setPlayed(true)}
            onProgress={(ms) => {
              listenMs.current[pass][clip.id] = ms;
            }}
          />

          {/* 0–10 scale */}
          <div className={`mt-8 transition-opacity ${played ? "opacity-100" : "pointer-events-none opacity-35"}`}>
            <div className="grid grid-cols-6 gap-1.5">
              {Array.from({ length: BIAS_SCALE_MAX + 1 }, (_, v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => rate(v)}
                  aria-label={`Rate ${v}`}
                  className="h-12 rounded-xl border text-sm font-bold transition active:scale-95"
                  style={
                    picked === v
                      ? { borderColor: "transparent", background: GOLD_TINT, color: GOLD, boxShadow: `0 0 0 1.5px ${GOLD}, 0 8px 24px ${GOLD_GLOW}` }
                      : { borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }
                  }
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[0.65rem] text-muted">
              <span>0 — never again</span>
              <span>10 — all-timer</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* --------------------------------------------------------------- reveal */
  if (phase === "reveal" && result) {
    const v = VERDICT_COPY[result.verdict];
    return (
      <main className={`${shell} justify-center text-center`}>
        <FluidField colors={FLUID} baseColor={BASE} intensity={0.78} scrim={false} vignette />
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-xs font-bold tracking-[0.4em] text-muted">YOUR NUMBER</p>
          <p className="mt-4 font-display text-8xl font-semibold leading-none" style={{ color: GOLD, textShadow: `0 0 60px ${GOLD_GLOW}` }}>
            {result.pct > 0 ? "+" : ""}
            {result.pct}%
          </p>
          <p className="mt-3 text-sm text-muted">how far your ratings moved toward the labels</p>
          <h1 className="mt-8 font-display text-4xl font-semibold">{v.title}</h1>
          <p className="mt-2 max-w-sm text-base leading-relaxed text-muted">{v.sub}</p>
          {result.swayShare !== null ? (
            <p className="mt-5 rounded-full border border-white/10 px-4 py-1.5 text-sm text-muted">
              You moved with the label on{" "}
              <span className="font-semibold" style={{ color: GOLD }}>
                {Math.round(result.swayShare * result.movableCount)} of {result.movableCount}
              </span>{" "}
              clips that could move.
            </p>
          ) : null}
          {result.edgeCount > 0 ? (
            <p className="mt-3 text-xs text-muted">
              {result.edgeCount} clip{result.edgeCount > 1 ? "s were" : " was"} already at the edge of the scale blind — your real sway may run higher.
            </p>
          ) : null}
          <p className="mt-6 text-xs text-muted">
            Provisional read — you&apos;re early. Percentiles arrive when the cohort does, not before.
          </p>
          <button
            type="button"
            onClick={() => {
              track("bias_debrief_view", {});
              setPhase("debrief");
            }}
            className="mt-8 rounded-full px-7 py-3.5 text-base font-bold text-black transition active:scale-[0.98]"
            style={{ background: GOLD, boxShadow: `0 10px 30px ${GOLD_GLOW}` }}
          >
            One more thing — about those names
          </button>
        </div>
      </main>
    );
  }

  /* -------------------------------------------------------------- debrief */
  if (phase === "debrief" && result) {
    const swapped = BIAS_CLIPS.filter((c) => !c.labelIsTrue);
    const receiptFor = (id: string) => result.receipts.find((r) => r.id === id);
    // Stateless permalink: raw passes in the URL; /bias/result recomputes.
    const b = encodeURIComponent(encodeBiasRatings(BIAS_CLIPS, blind));
    const l = encodeURIComponent(encodeBiasRatings(BIAS_CLIPS, labeled));
    const resultPath = `/bias/result?pv=${BIAS_POOL_VERSION}&b=${b}&l=${l}`;
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return (
      <main className={shell}>
        <FluidField colors={FLUID} baseColor={BASE} intensity={0.55} scrim={false} vignette />
        <div className="relative z-10">
          {kicker}
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight">
            Some of those names were lies.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            {`${swapped.length} of the ${total} labels were deliberately swapped — it's the only clean way to measure prestige, and you deserve to know which ones. Here's what your ratings did when the name in the room was false:`}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {swapped.map((c) => {
              const r = receiptFor(c.id);
              const clipNo = BIAS_CLIPS.findIndex((x) => x.id === c.id) + 1;
              return (
                <div key={c.id} className="rounded-2xl border p-4" style={{ borderColor: "hsl(42 60% 55% / 0.3)", background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">CLIP {clipNo} — SWAPPED</p>
                  <p className="mt-1.5 text-sm leading-relaxed">
                    We said <span className="font-semibold" style={{ color: GOLD }}>{c.shownArtist}</span>.
                    {" "}It&apos;s actually <span className="font-semibold">{c.trueArtist}</span>.
                  </p>
                  {r ? (
                    <p className="mt-1 text-sm text-muted">
                      You went {r.blind} → {r.labeled}
                      {r.towardLabel > 0 ? " — toward the lie." : r.towardLabel < 0 ? " — against it." : " — unmoved."}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          {result.swappedPct !== null ? (
            <p className="mt-5 text-base leading-relaxed">
              On just those clips, your ratings moved{" "}
              <span className="font-display text-xl font-semibold" style={{ color: GOLD }}>
                {result.swappedPct > 0 ? "+" : ""}
                {result.swappedPct}%
              </span>{" "}
              toward a label that wasn&apos;t true.
              {result.swappedPct <= 0 ? " You didn't take the bait." : " That movement can't be explained by better information — there wasn't any."}
            </p>
          ) : null}

          {/* Full receipts */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">FULL RECEIPTS</p>
            <div className="mt-2 flex flex-col gap-1 text-sm text-muted">
              {result.receipts.map((r, i) => (
                <p key={r.id}>
                  Clip {i + 1}: {r.blind} → {r.labeled}
                  {r.labelIsTrue ? "" : " (swapped)"}
                </p>
              ))}
            </div>
          </div>

          {/* Share — the debrief is behind you; now the number travels. */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">YOUR NUMBER, PORTABLE</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              The link carries only your ratings — anyone who opens it sees your number recomputed, then
              gets dared to beat it.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <ShareButton
                url={`${origin}${resultPath}`}
                text={shareText(result.pct)}
                label="Share your number"
                event="bias_share"
                primary
                accent={GOLD}
              />
              <DownloadButton
                url={`/api/bias-card?format=story&pv=${BIAS_POOL_VERSION}&b=${b}&l=${l}`}
                label="Story card"
                filename="prestige-test-story.png"
              />
              <a
                href={resultPath}
                className="text-sm text-muted underline underline-offset-4 transition hover:text-white"
              >
                View your result page →
              </a>
            </div>
          </div>

          {/* D3 — the visible, locked tier. Honest: it does not exist yet. */}
          <div className="mt-8 rounded-2xl border border-dashed border-white/20 p-5">
            <p className="text-[0.65rem] font-bold tracking-[0.3em] text-muted">NEXT MACHINE · LOCKED</p>
            <p className="mt-2 font-display text-xl font-semibold">Delicacy Trials</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              One of two clips has a wrong note buried in the mix. Prestige tested your prejudice —
              this one tests whether your ears can actually tell. In the gym soon.
            </p>
            <LockedTierButton />
          </div>

          {/* Attribution — CC credit is a legal requirement, PD listed anyway. */}
          <div className="mt-8 text-[0.65rem] leading-relaxed text-muted">
            <p className="font-bold tracking-[0.3em]">RECORDINGS</p>
            {BIAS_CLIPS.map((c) => (
              <p key={c.id}>
                {c.trueArtist} — {c.license}
                {c.attribution ? ` · ${c.attribution}` : ""}
              </p>
            ))}
          </div>

          <a href="/bias" className="mt-8 inline-block text-sm text-muted underline underline-offset-4 transition hover:text-white">
            Run it again →
          </a>
        </div>
      </main>
    );
  }

  return null;
}

/** Demand signal for the locked tier — no fake signup, no email, no DB. */
function LockedTierButton() {
  const [noted, setNoted] = useState(false);
  return (
    <button
      type="button"
      disabled={noted}
      onClick={() => {
        track("bias_locked_tier_tap", {});
        setNoted(true);
      }}
      className="mt-3 rounded-full border px-5 py-2 text-sm font-bold transition active:scale-[0.98] disabled:opacity-70"
      style={{ borderColor: GOLD_DIM, color: GOLD }}
    >
      {noted ? "Noted. You're on the record." : "I want this →"}
    </button>
  );
}
