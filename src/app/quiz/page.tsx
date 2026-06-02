"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { worldCup } from "@/content/world-cup";
import type { Answers } from "@/engine";

const quiz = worldCup.quiz;

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const question = quiz.questions[step];
  const total = quiz.questions.length;

  function choose(optionId: string) {
    const next: Answers = { ...answers, [question.id]: optionId };
    setAnswers(next);

    if (step < total - 1) {
      setStep(step + 1);
      return;
    }
    // Last answer — build a stable query in question order and go to result.
    const qs = new URLSearchParams();
    for (const q of quiz.questions) qs.set(q.id, next[q.id]);
    router.push(`/result?${qs.toString()}`);
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-10">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-400">
            <span>
              Question {step + 1} of {total}
            </span>
            <button
              type="button"
              onClick={() => step > 0 && setStep(step - 1)}
              disabled={step === 0}
              className="disabled:opacity-30"
            >
              ← Back
            </button>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${((step + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold leading-snug">{question.prompt}</h1>

        <div className="mt-6 flex flex-col gap-3">
          {question.options.map((opt) => {
            const selected = answers[question.id] === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => choose(opt.id)}
                className={`rounded-2xl border px-5 py-4 text-left text-lg transition ${
                  selected
                    ? "border-indigo-400 bg-indigo-500/20"
                    : "border-white/10 bg-white/5 hover:border-indigo-400/60 hover:bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
