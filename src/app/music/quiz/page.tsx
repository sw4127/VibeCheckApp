"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { musicQuiz, CUES, REVERB, buildMusicProfile } from "@/content/music";
import { scoreAnswers, type Answers } from "@/engine";
import { track } from "@/lib/analytics";

const quiz = musicQuiz;
const REVERB_MS = 900; // §17.A beat — tap anywhere to skip (§20.C3)
const CRYSTALLIZER_MS = 1800;

/**
 * Free path = 7 taps → reveal, zero typing (§20.C1 — the artist field lives on
 * the result page as "sharpen the read"). The quiz talks back per tap (§17.A),
 * the beat is tap-through (§20.C3), and the run ends on the P3 crystallizer
 * (§17.A + §20.A1's Hume clause) before the reveal.
 */
export default function MusicQuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [reverb, setReverb] = useState<string | null>(null);
  const [phase, setPhase] = useState<"taps" | "crystallizer">("taps");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingAnswers = useRef<Answers>({});

  const total = quiz.questions.length;
  const question = quiz.questions[step];

  useEffect(() => {
    track("quiz_start", { variant: "music" });
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // §18.C forming signature: abstract bars from the partial raw vector — no
  // labels, no verdict, until the reveal. (Upgraded to the §20.C2 sigil in Slice 3.)
  const bars = useMemo(() => {
    const raw = scoreAnswers(quiz, answers);
    const values = quiz.dimensions.map((d) => raw[d] ?? 0);
    const max = Math.max(1, ...values);
    return values.map((v) => v / max);
  }, [answers]);

  function goToResult(finalAnswers: Answers) {
    const profile = buildMusicProfile(finalAnswers);
    track("quiz_complete", { variant: "music", archetype: profile.archetype.id });
    const qs = new URLSearchParams();
    for (const q of quiz.questions) qs.set(q.id, finalAnswers[q.id]);
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
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      setPhase("crystallizer");
      timer.current = setTimeout(() => goToResult(pendingAnswers.current), CRYSTALLIZER_MS);
    }
  }

  function choose(optionId: string) {
    if (!question || selected || phase !== "taps") return;
    setSelected(optionId);
    setReverb(REVERB[question.id]?.[optionId] ?? null);
    const next: Answers = { ...answers, [question.id]: optionId };
    setAnswers(next);
    pendingAnswers.current = next;
    timer.current = setTimeout(advanceRef.current, REVERB_MS);
  }

  // Keep the timer callback pointing at the latest advance() closure.
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  if (phase === "crystallizer") {
    return (
      <main
        className="mx-auto flex min-h-dvh w-full max-w-lg cursor-pointer flex-col items-center justify-center px-6 text-center"
        onClick={advance}
      >
        {/* §17.A P3 crystallizer + §20.A1 Hume clause */}
        <p className="font-display text-3xl font-semibold leading-snug">
          You answered in seconds — that&apos;s sentiment.
        </p>
        <p className="mt-4 font-display text-3xl font-semibold leading-snug text-accent">
          The pattern in those answers is the training.
        </p>
        <p className="mt-8 text-sm tracking-[0.3em] text-muted">READING YOU NOW…</p>
      </main>
    );
  }

  return (
    <main
      className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-6 py-10"
      onClick={() => {
        // §20.C3 tap-through: any tap during the beat advances immediately.
        if (selected) advance();
      }}
    >
      {/* Progress + §18.A permission line */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-medium text-muted">
          <span>
            {step + 1} of {total}
          </span>
          <span>No wrong answers. First instinct is the real data.</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
        <div className="mt-3 flex h-6 items-end gap-1.5" aria-hidden>
          {bars.map((v, i) => (
            <div key={i} className="flex w-2 items-end" style={{ height: "100%" }}>
              <div
                className="w-full rounded-sm bg-accent/50 transition-all duration-500"
                style={{ height: `${Math.max(8, v * 100)}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* §20.A1 pre-Q1 framing — the zero-tap Hume hook */}
      {step === 0 ? (
        <p className="mb-4 text-sm text-muted">
          This isn&apos;t a test of what you like. It&apos;s a read of what your ears learned.
        </p>
      ) : null}
      {step === 3 ? (
        <p className="mb-4 text-sm text-muted">Halfway. It&apos;s already taking shape.</p>
      ) : null}

      <h1 className="font-display text-3xl font-semibold leading-tight">{question.prompt}</h1>
      {CUES[question.id] ? <p className="mt-2 text-sm text-muted">{CUES[question.id]}</p> : null}

      <div className="mt-7 flex flex-col gap-3">
        {question.options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={(e) => {
                if (selected) {
                  e.stopPropagation();
                  advance(); // tap-through even when tapping an option mid-beat
                  return;
                }
                choose(opt.id);
              }}
              className={`flex items-center justify-between rounded-2xl border px-5 py-3.5 text-left text-lg transition active:scale-[0.99] ${
                isSelected
                  ? "border-accent bg-accent/15"
                  : "border-white/10 bg-white/[0.03] hover:border-accent/50 hover:bg-white/[0.06]"
              }`}
            >
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* §17.A reverb — the quiz talks back during the beat */}
      <p
        className={`mt-6 min-h-12 font-display text-lg leading-snug text-accent transition-opacity duration-300 ${
          reverb ? "opacity-100" : "opacity-0"
        }`}
      >
        {reverb ?? "…"}
      </p>
    </main>
  );
}
