"use client";

/**
 * The stimulus player for bias instruments — ONE seam for both audio paths:
 *  - real clips (PD/CC files under /public/audio/bias, memo §8.2): an
 *    HTMLAudioElement behind the same round button — no native controls, so
 *    no scrubbing (you rate what you heard, not what you skipped to);
 *  - placeholder items (pool not yet authored): a synthesized WebAudio triad
 *    seeded by clip index, badged as placeholder in the caption.
 *
 * RING SEMANTICS (PM ruling 2026-07-19, two facts / two signals):
 *  - The ring tracks FULL clip playback (0 → clip length). A full ring means
 *    "the clip is over" — and only that.
 *  - The min-listen threshold is a NOTCH on the ring at its true position.
 *    Crossing it is a distinct state change: the notch lights up and the
 *    rating scale unlocks with a visible transition. "You may rate now" is
 *    never conflated with "the clip is finished" (the old ring filled at 5s
 *    and falsely signalled completion).
 *
 * MIN-LISTEN (RT-2b, PM decision 2026-07-11): the rating scale arms only
 * after min(5s, clip length) of ACTUAL playback has been heard. Heard-time
 * is accumulated from real playback progress, never from wall-clock. Per-item
 * listen duration is reported upward regardless of the threshold (D6/N3).
 *
 * PAUSE RESTARTS THE CLIP — ACCEPTED POLICY (rt-answers 2026-07-11,
 * reconfirmed item 1): full re-exposure standardizes the stimulus. Stopping
 * resets to 0:00 by design (the ring resets with it — it shows playback
 * position); heard-time already banked is not forfeited, and the armed
 * state, once earned, persists.
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
  const placeholder = isPlaceholderSrc(src);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [heardMs, setHeardMs] = useState(0);
  /** Current playback position — what the ring renders. */
  const [positionMs, setPositionMs] = useState(0);
  /** Clip length; null until metadata arrives (ring stays empty till then). */
  const [durationMs, setDurationMs] = useState<number | null>(
    placeholder ? PLACEHOLDER_TONE_MS : null,
  );
  const [thresholdMs, setThresholdMs] = useState(
    placeholder ? PLACEHOLDER_TONE_MS : MIN_LISTEN_MS,
  );
  // Refs mirror state for the media-event/rAF callbacks (created once per
  // element) so they never read a stale closure — and so banking heard-time
  // performs its side effects HERE, in the event path, never inside a React
  // state updater (the old setState-in-updater pattern tripped React's
  // update-during-render warning).
  const heardRef = useRef(0);
  const thresholdRef = useRef(thresholdMs);
  const armedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const toneTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const toneStop = useRef<ReturnType<typeof setTimeout> | null>(null);

  function bank(ms: number) {
    const next = Math.max(heardRef.current, Math.round(ms));
    if (next === heardRef.current) return;
    heardRef.current = next;
    setHeardMs(next);
    onProgress(next);
    if (!armedRef.current && next >= thresholdRef.current) {
      armedRef.current = true;
      onArmed();
    }
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

  // Smooth ring: while real audio plays, track the media clock per frame
  // (ontimeupdate alone fires ~4×/s and makes the ring stutter).
  useEffect(() => {
    if (!playing || placeholder) return;
    let raf = 0;
    const tick = () => {
      const el = audioRef.current;
      if (el) {
        const ms = el.currentTime * 1000;
        setPositionMs(ms);
        bank(ms);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, placeholder]);

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
    // The tone has no media clock — tick position/heard-time while it sounds.
    toneTimer.current = setInterval(() => {
      const ms = Date.now() - startedAt;
      setPositionMs(Math.min(ms, PLACEHOLDER_TONE_MS));
      bank(ms);
    }, 100);
    toneStop.current = setTimeout(() => {
      if (toneTimer.current) clearInterval(toneTimer.current);
      setPositionMs(PLACEHOLDER_TONE_MS);
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
          const dur = Math.round(el.duration * 1000);
          setDurationMs(dur);
          const th = Math.min(MIN_LISTEN_MS, dur);
          thresholdRef.current = th;
          setThresholdMs(th);
        }
      };
      // Backup for the rAF loop: rAF does not fire at all in throttled or
      // backgrounded tabs, but media events keep coming — so the ring must
      // also advance from here (~4×/s; the 120ms CSS transition smooths it).
      el.ontimeupdate = () => {
        if (el) {
          setPositionMs(el.currentTime * 1000);
          bank(el.currentTime * 1000);
        }
      };
      el.onended = () => {
        if (el && Number.isFinite(el.duration)) {
          setPositionMs(el.duration * 1000);
          bank(el.duration * 1000);
        }
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
      setPositionMs(0);
      setPlaying(false);
      return;
    }
    try {
      setFailed(false);
      // A finished clip replays from the top (don't rely on the browser's
      // rewind-on-ended behavior — observed inconsistent), and the ring
      // resets with it: it shows playback position, nothing else.
      if (el.ended || (Number.isFinite(el.duration) && el.currentTime >= el.duration)) {
        el.currentTime = 0;
        setPositionMs(0);
      }
      await el.play(); // resolves only when playback actually starts
      setPlaying(true);
    } catch {
      setPlaying(false);
      setFailed(true);
    }
  }

  // Ring geometry (r=34 fits the 64px button with a 2px inset ring).
  // Ring = full clip progress; notch = the arming threshold's true position.
  const R = 34;
  const CIRC = 2 * Math.PI * R;
  const progress = durationMs ? Math.min(1, positionMs / durationMs) : 0;
  const armed = heardMs >= thresholdMs;
  const ended = durationMs !== null && positionMs >= durationMs;
  // Notch angle on the unrotated circle (the svg group is -rotate-90, so 0
  // rad = 12 o'clock visually). Hidden when arming coincides with clip end.
  const notchFrac = durationMs ? thresholdMs / durationMs : null;
  const showNotch = notchFrac !== null && notchFrac < 0.999;
  const notchAngle = (notchFrac ?? 0) * 2 * Math.PI;
  const notch = (rIn: number, rOut: number) => ({
    x1: 36 + Math.cos(notchAngle) * rIn,
    y1: 36 + Math.sin(notchAngle) * rIn,
    x2: 36 + Math.cos(notchAngle) * rOut,
    y2: 36 + Math.sin(notchAngle) * rOut,
  });

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
            style={{
              transition: "stroke-dashoffset 120ms linear",
              filter: ended ? `drop-shadow(0 0 6px ${GOLD_GLOW})` : undefined,
            }}
          />
          {showNotch ? (
            <line
              {...notch(R - 5, R + 5)}
              stroke={armed ? GOLD : "rgba(255,255,255,0.35)"}
              strokeWidth={armed ? 3 : 2}
              strokeLinecap="round"
              style={{
                transition: "stroke 300ms ease, stroke-width 300ms ease",
                filter: armed ? `drop-shadow(0 0 5px ${GOLD_GLOW})` : undefined,
              }}
            />
          ) : null}
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
