"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { worldCup } from "@/content/world-cup";
import { buildProfile, percentileNormalize, scoreAnswers, type Answers } from "@/engine";
import { track } from "@/lib/analytics";
import { encodeChallenger } from "@/lib/vs";

const quiz = worldCup.quiz;

/** Small black/white ball emblem (the §Fix3 forming teaser's football flourish). */
function Ball({ size }: { size: number }) {
  const c = size / 2;
  const r = c - 1.2;
  const pr = r * 0.42;
  const pt = (a: number, rad: number) => {
    const t = ((a - 90) * Math.PI) / 180;
    return [c + rad * Math.cos(t), c + rad * Math.sin(t)] as const;
  };
  const angles = [0, 72, 144, 216, 288];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="shrink-0">
      <circle cx={c} cy={c} r={r} fill="#f5f5f6" stroke="#0c0d12" strokeWidth={1.3} />
      <polygon points={angles.map((a) => pt(a, pr).join(",")).join(" ")} fill="#14171d" />
      {angles.map((a, i) => {
        const [x1, y1] = pt(a, pr);
        const [x2, y2] = pt(a, r);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#14171d" strokeWidth={1.1} />;
      })}
    </svg>
  );
}

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [vsToken, setVsToken] = useState<string | null>(null);

  const question = quiz.questions[step];
  const total = quiz.questions.length;

  // In-quiz "stat line forming" — abstract horizontal bars that grow as you
  // answer (a teaser of the FUT-style reveal). Normalized, so low-pole picks
  // still move them (parity with the music quiz forming). No labels, no numbers,
  // no axis order tells — the trajectory teases, never spoils the verdict.
  const forming = useMemo(() => {
    if (Object.keys(answers).length === 0) return quiz.dimensions.map(() => 0);
    const norm = percentileNormalize(quiz, scoreAnswers(quiz, answers));
    return quiz.dimensions.map((d) => norm[d] ?? 0);
  }, [answers]);

  // Funnel entry + capture a challenge token (?vs=) if we arrived from a /vs link.
  useEffect(() => {
    track("quiz_start");
    const vs = new URLSearchParams(window.location.search).get("vs");
    if (vs) setVsToken(vs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function choose(optionId: string) {
    if (selected) return; // ignore taps during the confirm beat
    setSelected(optionId);
    const next: Answers = { ...answers, [question.id]: optionId };
    setAnswers(next);

    // Brief beat so the selected state is felt before advancing.
    setTimeout(() => {
      if (step < total - 1) {
        setStep(step + 1);
        setSelected(null);
      } else {
        // Tag completion with the computed archetype (same deterministic engine
        // the result page uses) so we can see which results spread.
        const profile = buildProfile(quiz, worldCup.archetypes, worldCup.roster, next);
        track("quiz_complete", { archetype: profile.archetype.id, player: profile.match.id });

        // In challenge mode, route to the head-to-head; otherwise the solo result.
        if (vsToken) {
          const me = encodeChallenger({
            archetypeId: profile.archetype.id,
            playerId: profile.match.id,
            signature: quiz.dimensions.map((d) => profile.normalized[d] ?? 0.5),
          });
          router.push(`/vs?them=${encodeURIComponent(vsToken)}&me=${me}&ref=vs`);
        } else {
          const qs = new URLSearchParams();
          for (const q of quiz.questions) qs.set(q.id, next[q.id]);
          router.push(`/result?${qs.toString()}`);
        }
      }
    }, 300);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-6 py-10">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex justify-between text-xs font-medium text-muted">
          <span>
            Question {step + 1} of {total}
          </span>
          <button
            type="button"
            onClick={() => step > 0 && !selected && (setStep(step - 1), setSelected(null))}
            disabled={step === 0}
            className="transition disabled:opacity-30"
          >
            ← Back
          </button>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
        {/* §Fix3 — "stat line forming": abstract bars that grow as you answer
            (a teaser of the FUT-style reveal). No labels/numbers → no spoiler. */}
        <div className="mt-3 flex items-center gap-3">
          <Ball size={26} />
          <div className="flex flex-1 flex-col gap-1" aria-hidden>
            {forming.map((v, i) => (
              <div key={i} className="h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
                  style={{ width: `${Math.max(6, v * 100)}%`, opacity: 0.9 - i * 0.07 }}
                />
              </div>
            ))}
          </div>
        </div>
        {/* §18.A permission line (parity with the music quiz) */}
        <p className="mt-2 text-xs text-muted">No wrong answers. First instinct is the real data.</p>
      </div>

      <h1 className="font-display text-3xl font-semibold leading-tight">{question.prompt}</h1>

      <div className="mt-8 flex flex-col gap-3">
        {question.options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => choose(opt.id)}
              className={`group flex items-center justify-between rounded-2xl border px-5 py-3.5 text-left text-lg transition active:scale-[0.99] ${
                isSelected
                  ? "border-accent bg-accent/15"
                  : "border-white/10 bg-white/[0.03] hover:border-accent/50 hover:bg-white/[0.06]"
              }`}
            >
              <span>{opt.label}</span>
              <span
                className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                  isSelected ? "border-accent bg-accent" : "border-white/25"
                }`}
              >
                {isSelected ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6.2l2.3 2.3 4.7-4.8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
