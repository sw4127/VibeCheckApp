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
  const [selected, setSelected] = useState<string | null>(null);

  const question = quiz.questions[step];
  const total = quiz.questions.length;

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
        const qs = new URLSearchParams();
        for (const q of quiz.questions) qs.set(q.id, next[q.id]);
        router.push(`/result?${qs.toString()}`);
      }
    }, 240);
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
