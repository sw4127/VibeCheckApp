"use client";

/**
 * The stimulus player for bias instruments — ONE seam for both audio paths:
 *  - real clips (PD/CC files under /public/audio/bias, memo §8.2): an
 *    HTMLAudioElement behind the same round button — no native controls, so
 *    no scrubbing (you rate what you heard, not what you skipped to);
 *  - placeholder items (pool not yet authored): a synthesized WebAudio triad
 *    seeded by clip index, badged as placeholder in the caption.
 *
 * MIN-LISTEN (RT-2b, PM decision 2026-07-11): the rating scale arms only
 * after min(5s, clip length) of ACTUAL playback has been heard, shown as a
 * progress ring filling around the button. Heard-time is accumulated from
 * real playback progress, never from wall-clock. Per-item listen duration is
 * reported upward regardless of the threshold (D6/N3 raw data).
 *
 * PAUSE RESTARTS THE CLIP — ACCEPTED POLICY (rt-answers 2026-07-11,
 * reconfirmed item 1): full re-exposure standardizes the stimulus. Stopping
 * resets to 0:00 by design; heard-time already banked is not forfeited.
 */

import { useEffect, useRef, useState } from "react";

export const MIN_LISTEN_MS = 5000;
const PLACEHOLDER_TONE_MS = 1500;

const GOLD = "hsl(42 80% 62%)";
const GOLD_TINT = "hsl(42 70% 55% / 0.14)";
const GOLD_GLOW = "hsl(42 80% 60% / 0.45)";

export function isPlaceholderSrc(src: string): boolean {
  return src.includes("PLACEHOLDER");
}

export default function ClipPlayer({
  src,
  index,
  caption,
  onArmed,
  onProgress,
}: {
  src: string;
  /** Position in the pool — seeds the placeholder triad + the label. */
  index: number;
  /** Sub-caption under the clip name (gating hint etc.). */
  caption: string;
  /** Fired once, when heard-time crosses min(MIN_LISTEN_MS, clip length). */
  onArmed: () => void;
  /** Reports accumulated heard milliseconds (rate-time dataset capture). */
  onProgress: (heardMs: number) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [heardMs, setHeardMs] = useState(0);
  const [thresholdMs, setThresholdMs] = useState(
    isPlaceholderSrc(src) ? PLACEHOLDER_TONE_MS : MIN_LISTEN_MS,
  );
  const armedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const toneTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const toneStop = useRef<ReturnType<typeof setTimeout> | null>(null);
  const placeholder = isPlaceholderSrc(src);

  function bank(ms: number) {
    setHeardMs((prev) => {
      const next = Math.max(prev, Math.round(ms));
      if (next !== prev) onProgress(next);
      if (!armedRef.current && next >= thresholdMs) {
        armedRef.current = true;
        onArmed();
      }
      return next;
    });
  }

  // The parent remounts this component per clip/pass (key=...), so state
  // resets for free — this effect only stops sound on the way out.
  useEffect(() => {
    return () => {
      if (toneTimer.current) clearInterval(toneTimer.current);
      if (toneStop.current) clearTimeout(toneStop.current);
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [src]);

  useEffect(
    () => () => {
      void audioCtx.current?.close().catch(() => {});
    },
    [],
  );

  function playTone() {
    if (playing) return; // triad is fixed-length; no stop control needed
    try {
      const ctx = (audioCtx.current ??= new AudioContext());
      const base = 196 * Math.pow(2, index / 6);
      const t0 = ctx.currentTime;
      [0, 4, 7].forEach((semi, k) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = k === 1 ? "triangle" : "sine";
        o.frequency.value = base * Math.pow(2, semi / 12);
        g.gain.setValueAtTime(0.0001, t0 + k * 0.06);
        g.gain.exponentialRampToValueAtTime(0.09, t0 + k * 0.06 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t0 + k * 0.06);
        o.stop(t0 + 1.5);
      });
    } catch {
      /* a synth failure must not strand the flow */
    }
    setPlaying(true);
    const startedAt = Date.now();
    // The tone has no media clock — tick heard-time while it sounds.
    toneTimer.current = setInterval(() => bank(Date.now() - startedAt), 100);
    toneStop.current = setTimeout(() => {
      if (toneTimer.current) clearInterval(toneTimer.current);
      bank(PLACEHOLDER_TONE_MS);
      setPlaying(false);
    }, PLACEHOLDER_TONE_MS);
  }

  async function toggleAudio() {
    let el = audioRef.current;
    if (!el) {
      el = new Audio(src);
      el.preload = "auto";
      el.onloadedmetadata = () => {
        if (el && Number.isFinite(el.duration) && el.duration > 0) {
          setThresholdMs(Math.min(MIN_LISTEN_MS, Math.round(el.duration * 1000)));
        }
      };
      // Heard-time = real media-clock progress, banked monotonically.
      el.ontimeupdate = () => {
        if (el) bank(el.currentTime * 1000);
      };
      el.onended = () => {
        if (el && Number.isFinite(el.duration)) bank(el.duration * 1000);
        setPlaying(false);
      };
      el.onerror = () => {
        setPlaying(false);
        setFailed(true);
      };
      audioRef.current = el;
    }
    if (playing) {
      // Accepted policy: stopping restarts the clip (full re-exposure).
      el.pause();
      el.currentTime = 0;
      setPlaying(false);
      return;
    }
    try {
      setFailed(false);
      await el.play(); // resolves only when playback actually starts
      setPlaying(true);
    } catch {
      setPlaying(false);
      setFailed(true);
    }
  }

  // Arming ring geometry (r=34 fits the 64px button with a 2px inset ring).
  const R = 34;
  const CIRC = 2 * Math.PI * R;
  const progress = Math.min(1, heardMs / thresholdMs);
  const armed = progress >= 1;

  return (
    <div className="mt-8 flex items-center gap-4">
      <div className="relative h-[72px] w-[72px] shrink-0">
        <svg viewBox="0 0 72 72" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="36" cy="36" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" />
          <circle
            cx="36"
            cy="36"
            r={R}
            fill="none"
            stroke={GOLD}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
            style={{ transition: "stroke-dashoffset 150ms linear", filter: armed ? `drop-shadow(0 0 6px ${GOLD_GLOW})` : undefined }}
          />
        </svg>
        <button
          type="button"
          onClick={() => (placeholder ? playTone() : void toggleAudio())}
          aria-label={playing ? `Stop clip ${index + 1}` : `Play clip ${index + 1}`}
          className="absolute inset-1 flex items-center justify-center rounded-full border text-2xl transition active:scale-95"
          style={
            playing
              ? { borderColor: GOLD, background: GOLD_TINT, boxShadow: `0 10px 30px ${GOLD_GLOW}` }
              : { borderColor: "rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.03)" }
          }
        >
          {playing ? "◼" : "▶"}
        </button>
      </div>
      <div>
        <p className="font-display text-lg font-semibold">Clip {index + 1}</p>
        <p className="text-xs text-muted">
          {failed ? "clip failed to load — tap to retry" : caption}
        </p>
      </div>
    </div>
  );
}
