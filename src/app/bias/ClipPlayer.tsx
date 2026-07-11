"use client";

/**
 * The stimulus player for bias instruments — ONE seam for both audio paths:
 *  - real clips (PD/CC files under /public/audio/bias, memo §8.2): an
 *    HTMLAudioElement behind the same round button — no native controls, so
 *    no scrubbing (you rate what you heard, not what you skipped to);
 *  - placeholder items (pool not yet authored): a synthesized WebAudio triad
 *    seeded by clip index, badged as placeholder in the caption.
 *
 * "Listened" currently means playback STARTED (parity with the shipped tone
 * behavior). A minimum-listen rule is a PM decision — see session notes.
 */

import { useEffect, useRef, useState } from "react";

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
  onListened,
}: {
  src: string;
  /** Position in the pool — seeds the placeholder triad + the label. */
  index: number;
  /** Sub-caption under the clip name (gating hint etc.). */
  caption: string;
  /** Fired the first time this clip audibly starts in this pass. */
  onListened: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const toneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const placeholder = isPlaceholderSrc(src);

  // The parent remounts this component per clip/pass (key=...), so state
  // resets for free — this effect only stops sound on the way out.
  useEffect(() => {
    return () => {
      if (toneTimer.current) clearTimeout(toneTimer.current);
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
    toneTimer.current = setTimeout(() => setPlaying(false), 1500);
    onListened();
  }

  async function toggleAudio() {
    let el = audioRef.current;
    if (!el) {
      el = new Audio(src);
      el.preload = "auto";
      el.onended = () => setPlaying(false);
      el.onerror = () => {
        setPlaying(false);
        setFailed(true);
      };
      audioRef.current = el;
    }
    if (playing) {
      el.pause();
      setPlaying(false);
      return;
    }
    try {
      setFailed(false);
      await el.play(); // resolves only when playback actually starts
      setPlaying(true);
      onListened();
    } catch {
      setPlaying(false);
      setFailed(true);
    }
  }

  return (
    <div className="mt-8 flex items-center gap-4">
      <button
        type="button"
        onClick={() => (placeholder ? playTone() : void toggleAudio())}
        aria-label={playing ? `Stop clip ${index + 1}` : `Play clip ${index + 1}`}
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border text-2xl transition active:scale-95"
        style={
          playing
            ? { borderColor: GOLD, background: GOLD_TINT, boxShadow: `0 0 0 1.5px ${GOLD}, 0 10px 30px ${GOLD_GLOW}` }
            : { borderColor: "rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.03)" }
        }
      >
        {playing ? "◼" : "▶"}
      </button>
      <div>
        <p className="font-display text-lg font-semibold">Clip {index + 1}</p>
        <p className="text-xs text-muted">
          {failed ? "clip failed to load — tap to retry" : caption}
        </p>
      </div>
    </div>
  );
}
