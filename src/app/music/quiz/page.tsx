"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { musicQuiz, CUES, REVERB, buildWeightedMusicProfile, musicArchetypes, ARCHETYPE_THEMES, seedFromWorldCup, wcAnswersFrom, SEEDED_QUESTIONS } from "@/content/music";
import {
  percentileNormalize,
  rankMatches,
  scoreWeightedAnswers,
  encodeAnswerChoice,
  SPLIT_PCTS,
  type WeightedAnswers,
  type AnswerChoice,
} from "@/engine";
import { Sigil, THEME_HUES, driftHue } from "@/lib/sigil";
import FluidField from "@/components/FluidField";
import { track } from "@/lib/analytics";
import {
  getOnboardingArm,
  getVoiceArm,
  setPriorBelief,
  type OnboardingArm,
  type PriorBelief,
} from "@/lib/experiment";

/** §10.A — the unscored prior-belief question (Q0). Never enters the vector. */
const BELIEF_OPTIONS: { id: PriorBelief; label: string }[] = [
  { id: "totally", label: "Totally" },
  { id: "kind_of", label: "Kind of" },
  { id: "not_really", label: "Not really" },
];

const quiz = musicQuiz;
const REVERB_MS = 900; // §17.A beat — tap anywhere to skip (§20.C3)
const CRYSTALLIZER_MS = 1800;

/** §22 — completion-pull notes: a pentatonic climb, one step per answer, and a
 *  resolve at the lock. Synthesized (no playback of any recording — §2 stays
 *  intact) and OFF by default: most traffic is muted in-app webviews, and
 *  sound-on-by-default is hostile. One-tap opt-in, remembered per session. */
const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33]; // C maj pentatonic ↑
const RESOLVE = [523.25, 659.25, 783.99]; // C5–E5–G5

/**
 * Free path = 7 taps → reveal, zero typing (§20.C1 — the artist field lives on
 * the result page as "sharpen the read"). The quiz talks back per tap (§17.A),
 * the beat is tap-through (§20.C3), and the run ends on the P3 crystallizer
 * (§17.A + §20.A1's Hume clause) before the reveal.
 */
export default function MusicQuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  // §29 progressive profiling — read the carried WC answers ONCE at mount. A
  // complete carry = bridged mode: skip the belief Q0, drop the two seeded
  // questions (hooks/where — filled deterministically from the authored prior),
  // and run a faster beat. Cold visitors get the unchanged full quiz.
  const [seeds] = useState<{ hooks: string; where: string } | null>(() =>
    typeof window === "undefined"
      ? null
      : seedFromWorldCup(wcAnswersFrom(new URLSearchParams(window.location.search))),
  );
  const bridged = seeds !== null;
  const [answers, setAnswers] = useState<WeightedAnswers>(() => (seeds ? { ...seeds } : {}));
  const [selected, setSelected] = useState<string | null>(null);
  // §slice-2b — opt-in blend: a per-question "torn? pick two" mode (default off,
  // so the single-tap rhythm is untouched). `secondary` is the 30% pick.
  const [secondary, setSecondary] = useState<string | null>(null);
  const [blendMode, setBlendMode] = useState(false);
  // The chosen split as the PRIMARY's percentage (95/70/50) — "how often each?".
  const [splitPct, setSplitPct] = useState(70);
  const [reverb, setReverb] = useState<string | null>(null);
  // §22 momentum: which bars moved on THIS tap → they pulse (honest feedback —
  // the bars reflect a real deterministic re-score, not invented telemetry).
  const [changedBars, setChangedBars] = useState<boolean[]>([]);
  // §10.A: the premise test begins on the unscored belief step — except for
  // bridged users (§29): they already converted once; Q0 is a cold-entry test.
  const [phase, setPhase] = useState<"belief" | "taps" | "crystallizer">(bridged ? "taps" : "belief");
  const [arm, setArm] = useState<OnboardingArm | null>(null);
  const persuasive = arm !== "control"; // default to persuasive copy pre-hydration
  const [soundOn, setSoundOn] = useState(false);
  // §slice-5 — football→music bridge: the carried football archetype (?from=),
  // read once at mount. Display-only — it NEVER enters the score or the verdict.
  const [fromVibe] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("from")?.slice(0, 40) ?? null,
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingAnswers = useRef<WeightedAnswers>({});
  const audioCtx = useRef<AudioContext | null>(null);

  /** Soft synth note (sine + quick decay). Never throws; silent when off. */
  function note(freq: number, delay = 0, dur = 0.22) {
    if (!soundOnRef.current) return;
    try {
      const ctx = (audioCtx.current ??= new AudioContext());
      const t = ctx.currentTime + delay;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.05);
    } catch {
      /* audio is garnish — never break the quiz */
    }
  }
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    try {
      sessionStorage.setItem("vc_sound", next ? "1" : "0");
    } catch {}
    if (next) {
      soundOnRef.current = true; // play the confirm note inside this gesture
      note(SCALE[Math.min(step, SCALE.length - 1)]);
    }
  }

  // §29: bridged users answer only the DELTA (state + openness); the seeded
  // questions are pre-filled from the prior and disclosed on the result.
  const questions = bridged
    ? quiz.questions.filter((q) => !(SEEDED_QUESTIONS as readonly string[]).includes(q.id))
    : quiz.questions;
  const beatMs = bridged ? 500 : REVERB_MS; // faster beat for the second quiz
  const total = questions.length;
  const question = questions[step];
  const answered = Object.keys(answers).length; // pulse-replay key for the forming bars

  useEffect(() => {
    // §10.A: assign the arm and record arrival at the premise. quiz_start fires
    // only once the belief Q0 is answered, so it carries prior_belief and the
    // premise_view→quiz_start gap measures skeptic drop-off at the premise.
    setArm(getOnboardingArm());
    getVoiceArm(); // §26 — lock the voice arm early so every event carries it
    // §29: bridged users skip the premise (Q0) entirely — fire quiz_start
    // directly so the funnel stays measurable; cold entrants keep premise_view
    // → quiz_start (the §10.A skeptic-gap instrument).
    if (bridged) track("quiz_start", { variant: "music", bridged: true });
    else track("premise_view", { variant: "music" });
    try {
      if (sessionStorage.getItem("vc_sound") === "1") setSoundOn(true);
    } catch {}
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function chooseBelief(pb: PriorBelief) {
    setPriorBelief(pb);
    track("quiz_start", { variant: "music" }); // prior_belief now auto-attaches
    setPhase("taps");
  }

  // §20.C2 revised (PM test feedback, §22): the FORMING BARS stay as the
  // in-quiz visual — heights move per answer (the motion the test liked) and
  // the BAR COLOR carries the sigil's hue-drift toward the (undisclosed)
  // leading archetype's theme. The ring itself lives at the crystallizer lock
  // and on the card. No labels, no verdict — the trajectory teases, never tells.
  const forming = useMemo(() => {
    // hsl helpers (alpha via "/ a" — NOT hex suffix, which is invalid on hsl()).
    const tones = (dh: number, sat: number) => ({
      hue: dh,
      color: `hsl(${dh} ${sat}% 62%)`,
      ring: `hsl(${dh} ${Math.min(85, sat + 28)}% 60%)`,
      glow: `hsl(${dh} ${Math.min(85, sat + 28)}% 60% / 0.5)`,
      tint: `hsl(${dh} ${sat}% 55% / 0.16)`,
    });
    const answered = Object.keys(answers).length;
    if (answered === 0) {
      return { bars: quiz.dimensions.map(() => 0), lockHue: 250, muted: false, ...tones(250, 35) };
    }
    // Bars use the NORMALIZED profile (same as the colour/leader), not raw
    // weights — so they move with every answer, including low-pole picks
    // (calm/mainstream) that add zero raw weight. (Bug fix.)
    const norm = percentileNormalize(quiz, scoreWeightedAnswers(quiz, answers));
    const bars = quiz.dimensions.map((d) => norm[d] ?? 0);
    const leader = rankMatches(norm, musicArchetypes.centroids)[0];
    const themeName = ARCHETYPE_THEMES[leader.id] ?? "midnight";
    const targetHue = THEME_HUES[themeName];
    const t = (answered / quiz.questions.length) * 0.85;
    // "static" is the neutral/mainstream archetype — it should read SILVER, not a
    // saturated blue (its hue ~220 collides with midnight). Desaturate it.
    const muted = themeName === "static";
    const sat = muted ? 12 : Math.round(35 + t * 45);
    return { bars, lockHue: targetHue, muted, ...tones(Math.round(driftHue(targetHue, t)), sat) };
  }, [answers]);

  // §Fluid: the ambient mesh drifts toward the leading archetype's hue as the
  // quiz reads you — dark/moody (the 2am mood), the music counterpart to
  // football's bright field. Same FluidField primitive, opposite mood.
  const fluidColors = useMemo(() => {
    // ANALOGOUS harmony around the LIVE drifted hue (same hue as the bars) — one
    // cohesive atmosphere that shifts wholesale, instead of a clashing
    // near-complementary blob. Bright enough to read in every zone on the dark
    // base. Distributed across the 4 anchors (2 top, 2 bottom).
    const h = forming.hue;
    const s = forming.muted ? 14 : 72; // silver for the "static" archetype
    const s2 = forming.muted ? 12 : 68;
    return [
      `hsl(${h} ${s}% 56%)`,
      `hsl(${(h + 30) % 360} ${s2}% 52%)`,
      `hsl(${(h + 330) % 360} ${s2}% 52%)`,
      `hsl(${(h + 18) % 360} ${s2}% 50%)`,
    ];
  }, [forming.hue, forming.muted]);

  function goToResult(finalAnswers: WeightedAnswers) {
    const profile = buildWeightedMusicProfile(finalAnswers);
    track("quiz_complete", { variant: "music", archetype: profile.archetype.id, bridged });
    const qs = new URLSearchParams();
    for (const q of quiz.questions) qs.set(q.id, encodeAnswerChoice(finalAnswers[q.id]));
    qs.set("voice", getVoiceArm()); // §26 — carry the voice arm into the read (stateless)
    if (fromVibe) qs.set("from", fromVibe); // §slice-5b — carry the football vibe for the reveal
    if (bridged) qs.set("seeded", SEEDED_QUESTIONS.join(",")); // §29 honesty rail
    router.push(`/music/result?${qs.toString()}`);
  }

  /** Advance immediately (used by the beat timer AND tap-through). */
  function advance() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (phase === "crystallizer") {
      goToResult(pendingAnswers.current);
      return;
    }
    if (!selected) return;
    setSelected(null);
    setReverb(null);
    setSecondary(null);
    setBlendMode(false);
    setSplitPct(70);
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      setPhase("crystallizer");
      // §22 — the resolve: the climb lands (audio mirror of the sigil lock).
      RESOLVE.forEach((f, i) => note(f, i * 0.14, 0.5));
      timer.current = setTimeout(() => goToResult(pendingAnswers.current), CRYSTALLIZER_MS);
    }
  }

  function choose(optionId: string) {
    if (!question || phase !== "taps") return;

    // §slice-2b blend mode: first tap = primary (70%), a second DIFFERENT tap =
    // secondary (30%); tapping the secondary again clears it. No auto-advance —
    // the user commits with the explicit "Next" (commitBlend).
    if (blendMode) {
      if (!selected) {
        note(SCALE[step] ?? SCALE[SCALE.length - 1]);
        setSelected(optionId);
        setReverb(REVERB[question.id]?.[optionId] ?? null);
      } else if (optionId !== selected) {
        setSecondary((cur) => (cur === optionId ? null : optionId));
      }
      return;
    }

    if (selected) return; // single-pick: ignore taps during the confirm beat
    note(SCALE[step] ?? SCALE[SCALE.length - 1]); // §22 — one step up per answer
    setSelected(optionId);
    setReverb(REVERB[question.id]?.[optionId] ?? null);
    const next: WeightedAnswers = { ...answers, [question.id]: optionId };
    // Pulse the bars that visibly move on this tap: diff the new normalized
    // vector against the CURRENTLY DISPLAYED bars (forming.bars) so the baseline
    // matches what the user sees (incl. the 0→value jump on the first tap).
    // Computed here, not in render → strict-mode safe, batched → no extra render.
    const nextNorm = percentileNormalize(quiz, scoreWeightedAnswers(quiz, next));
    const nextBars = quiz.dimensions.map((d) => nextNorm[d] ?? 0);
    setChangedBars(nextBars.map((v, i) => Math.abs(v - (forming.bars[i] ?? 0)) > 0.005));
    setAnswers(next);
    pendingAnswers.current = next;
    // Deref the ref AT FIRE TIME (a bare `advanceRef.current` here would freeze
    // the pre-click closure, where `selected` is still null → the auto-advance
    // would no-op and every question would need a second tap).
    timer.current = setTimeout(() => advanceRef.current(), beatMs);
  }

  // §slice-2b — commit a blend (or a single primary if no secondary) and advance.
  function commitBlend() {
    if (!selected) return;
    const choice: AnswerChoice = secondary
      ? { primary: selected, secondary, primaryWeight: splitPct / 100 }
      : selected;
    const next: WeightedAnswers = { ...answers, [question.id]: choice };
    const nextNorm = percentileNormalize(quiz, scoreWeightedAnswers(quiz, next));
    const nextBars = quiz.dimensions.map((d) => nextNorm[d] ?? 0);
    setChangedBars(nextBars.map((v, i) => Math.abs(v - (forming.bars[i] ?? 0)) > 0.005));
    setAnswers(next);
    pendingAnswers.current = next;
    advance(); // resets selected/secondary/blendMode + steps forward
  }

  // Keep the timer callback pointing at the latest advance() closure.
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  // §10.A — the unscored prior-belief Q0 (premise step). Arm decides the framing
  // around it (persuasive recognition vs. neutral utility); the question is
  // common to both so the contrast isolates the framing.
  if (phase === "belief") {
    return (
      <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center overflow-hidden px-6 py-10">
        <FluidField colors={fluidColors} baseColor="#0A0A11" intensity={0.7} scrim={false} vignette />
        <div className="relative z-10">
          <p className="text-xs font-bold tracking-[0.4em] text-accent">VIBE CHECK</p>
          {/* §slice-5 — the disagreement hook: football read it as <X>; will taste agree? */}
          {fromVibe ? (
            <p className="mt-4 inline-block rounded-full border border-white/10 px-4 py-1.5 text-sm text-muted">
              On the pitch you read as <span className="font-semibold text-accent">{fromVibe}</span>. Your taste might disagree.
            </p>
          ) : null}
          <h1 className="mt-6 font-display text-3xl font-semibold leading-tight">
            Be honest — does your music taste actually say something about who you are?
          </h1>
          <p className="mt-3 text-sm text-muted">
            {persuasive
              ? "Most people underestimate this. Your ears have been keeping notes."
              : "Quick gut check before we start."}
          </p>
          <div className="mt-7 flex flex-col gap-3">
            {BELIEF_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => chooseBelief(opt.id)}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-left text-lg transition hover:border-white/25 hover:bg-white/[0.06] active:scale-[0.99]"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (phase === "crystallizer") {
    return (
      <main
        className="relative mx-auto flex min-h-dvh w-full max-w-lg cursor-pointer flex-col items-center justify-center overflow-hidden px-6 text-center"
        onClick={advance}
      >
        <FluidField colors={fluidColors} baseColor="#0A0A11" intensity={0.78} scrim={false} vignette />
        <div className="relative z-10 flex flex-col items-center">
          {/* §20.C2 — the sigil locks in: the curiosity gap is literal */}
          <div className="mb-8 animate-pulse">
            <Sigil
              size={96}
              filled={7}
              colors={`hsl(${Math.round(forming.lockHue)} 80% 62%)`}
            />
          </div>
          {/* §17.A P3 crystallizer + §20.A1 Hume clause — persuasive arm only (§10.A) */}
          {persuasive ? (
            <>
              <p className="font-display text-3xl font-semibold leading-snug">
                You answered in seconds — that&apos;s sentiment.
              </p>
              <p className="mt-4 font-display text-3xl font-semibold leading-snug text-accent">
                The pattern in those answers is the training.
              </p>
            </>
          ) : null}
          <p className="mt-8 text-sm tracking-[0.3em] text-muted">READING YOU NOW…</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col overflow-hidden px-6 py-10"
      onClick={() => {
        // §20.C3 tap-through: any tap during the beat advances immediately.
        // (Disabled in blend mode — the user commits with the explicit Next.)
        if (selected && !blendMode) advance();
      }}
    >
      <FluidField colors={fluidColors} baseColor="#0A0A11" intensity={0.7} scrim={false} vignette />
      <div className="relative z-10 flex flex-1 flex-col">
      {/* Progress + §18.A permission line */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-medium text-muted">
          <span className="shrink-0">
            {step + 1} / {total}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSound();
            }}
            aria-label={soundOn ? "Sound on" : "Sound off"}
            title={soundOn ? "Sound on" : "Sound off"}
            className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 transition hover:border-accent/50"
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-muted">No wrong answers. First instinct is the real data.</p>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / total) * 100}%`, background: forming.color, boxShadow: `0 0 8px ${forming.color}` }}
          />
        </div>
        <div className="relative mt-3 flex h-6 items-end gap-1.5" aria-hidden>
          {forming.bars.map((v, i) => {
            const h = `${Math.max(8, v * 100)}%`;
            return (
              <div key={i} className="relative flex w-2 items-end" style={{ height: "100%" }}>
                <div
                  className="w-full rounded-sm"
                  style={{
                    height: h,
                    background: forming.color,
                    // Snappy ease-out for the height (no vertical overshoot →
                    // no layout pop); colour drift stays smooth.
                    transition: "height 520ms cubic-bezier(.2,.85,.25,1), background 700ms ease",
                  }}
                />
                {/* Momentum pulse — only on bars that moved this tap. GPU only
                    (transform + opacity + glow), staggered L→R, replays via key.
                    Absolute overlay → never shifts layout. */}
                {changedBars[i] ? (
                  <span
                    key={answered}
                    className="vc-bar-pulse pointer-events-none absolute inset-x-0 bottom-0 rounded-sm"
                    style={{
                      height: h,
                      background: forming.color,
                      transformOrigin: "bottom",
                      animationDelay: `${i * 45}ms`,
                      boxShadow: `0 0 9px 1px ${forming.color}`,
                    }}
                  />
                ) : null}
              </div>
            );
          })}
          <style>{`@keyframes vcBarPulse{0%{opacity:.6;transform:scaleY(1.28)}55%{opacity:.32}100%{opacity:0;transform:scaleY(1)}}.vc-bar-pulse{animation:vcBarPulse .62s cubic-bezier(.2,.8,.2,1) both}`}</style>
        </div>
      </div>

      {/* §20.A1 pre-Q1 framing — §10.A A/B: persuasive recognition vs. bare utility */}
      {step === 0 ? (
        <p className="mb-4 text-sm text-muted">
          {persuasive
            ? "This isn't a test of what you like. It's a read of what your ears learned."
            : "7 quick questions about your music. Then your read."}
        </p>
      ) : null}
      {step === 3 ? (
        <p className="mb-4 text-sm text-muted">Halfway. It&apos;s already taking shape.</p>
      ) : null}

      <h1 className="font-display text-3xl font-semibold leading-tight">{question.prompt}</h1>
      {CUES[question.id] ? <p className="mt-2 text-sm text-muted">{CUES[question.id]}</p> : null}

      <div className="mt-7 flex flex-col gap-3">
        {question.options.map((opt) => {
          const isPrimary = selected === opt.id;
          const isSecondary = secondary === opt.id;
          const isSel = isPrimary || isSecondary;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={(e) => {
                if (blendMode) {
                  e.stopPropagation();
                  choose(opt.id); // set primary, then toggle a secondary
                  return;
                }
                if (selected) {
                  e.stopPropagation();
                  advance(); // tap-through even when tapping an option mid-beat
                  return;
                }
                choose(opt.id);
              }}
              className={`flex items-center justify-between rounded-2xl border px-5 py-3.5 text-left text-lg transition active:scale-[0.99] ${
                isSel ? "border-transparent" : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
              }`}
              style={
                isPrimary
                  ? { background: forming.tint, boxShadow: `0 0 0 1.5px ${forming.ring}, 0 10px 30px ${forming.glow}` }
                  : isSecondary
                    ? { background: forming.tint, boxShadow: `0 0 0 1.5px ${forming.ring}88` }
                    : undefined
              }
            >
              <span>{opt.label}</span>
              {/* §slice-2b — show the split weight in blend mode */}
              {blendMode && isSel ? (
                <span className="ml-3 shrink-0 text-xs font-bold tracking-wide" style={{ color: forming.ring }}>
                  {isPrimary ? `${splitPct}%` : `${100 - splitPct}%`}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* §slice-2b — opt-in blend control. Default-off → the single-tap rhythm
          is completely untouched for everyone who ignores it. */}
      {phase === "taps" && !blendMode && !selected ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setBlendMode(true);
          }}
          className="mt-5 self-start text-sm text-muted underline underline-offset-4 transition hover:text-accent"
        >
          Torn between two? Blend them →
        </button>
      ) : null}
      {blendMode ? (
        <div className="mt-5 flex flex-col gap-3">
          {!selected ? (
            <span className="text-sm text-muted">Pick your main one first.</span>
          ) : !secondary ? (
            <span className="text-sm text-muted">Now tap a second — or just continue with one.</span>
          ) : (
            <div>
              {/* The split = "statistically, how often would you pick each?" */}
              <p className="text-sm text-muted">Be honest — how often would you actually pick each?</p>
              <div className="mt-2 flex gap-2">
                {SPLIT_PCTS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSplitPct(pct);
                    }}
                    className="flex-1 rounded-xl border px-3 py-2 text-sm font-bold transition"
                    style={
                      splitPct === pct
                        ? { borderColor: forming.ring, background: forming.tint, color: forming.ring }
                        : { borderColor: "rgba(255,255,255,0.14)" }
                    }
                  >
                    {pct}/{100 - pct}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              commitBlend();
            }}
            disabled={!selected}
            className="self-end shrink-0 rounded-full px-6 py-2.5 text-sm font-bold text-white transition disabled:opacity-40"
            style={{ background: forming.ring }}
          >
            Next →
          </button>
        </div>
      ) : null}

      {/* §17.A reverb — the quiz talks back during the beat */}
      <p
        className={`mt-6 min-h-12 font-display text-lg leading-snug text-accent transition-opacity duration-300 ${
          reverb ? "opacity-100" : "opacity-0"
        }`}
      >
        {reverb ?? "…"}
      </p>
      </div>
    </main>
  );
}
