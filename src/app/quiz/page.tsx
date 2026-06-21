"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { worldCup } from "@/content/world-cup";
import { buildProfile, percentileNormalize, scoreAnswers, type Answers } from "@/engine";
import { track } from "@/lib/analytics";
import { encodeChallenger } from "@/lib/vs";
import TournamentSkin from "./TournamentSkin";
import { MapleLeaf, Star, SunBurst } from "./motifs";
import { TOURNAMENT_SKIN, questionAccent, SEGMENT_COLORS, PITCH_BG, HOST } from "./tournament-theme";

const quiz = worldCup.quiz;
const BRAND = "#7c6cff"; // fallback accent when the seasonal skin is killed

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
  // Read the ?vs= challenge token once, at mount, via a lazy initializer —
  // no setState-in-effect (no cascading re-render), and SSR-safe (window guard).
  const [vsToken] = useState<string | null>(() =>
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("vs"),
  );

  const question = quiz.questions[step];
  const total = quiz.questions.length;

  // Per-question focal accent: multi-colour across the flow, ONE vivid accent
  // per screen. Falls back to the brand violet if the seasonal skin is killed.
  const accent = TOURNAMENT_SKIN ? questionAccent(step) : BRAND;

  // In-quiz "stat line forming" — abstract horizontal bars that grow as you
  // answer (a teaser of the FUT-style reveal). Normalized, so low-pole picks
  // still move them (parity with the music quiz forming). No labels, no numbers,
  // no axis order tells — the trajectory teases, never spoils the verdict.
  const forming = useMemo(() => {
    if (Object.keys(answers).length === 0) return quiz.dimensions.map(() => 0);
    const norm = percentileNormalize(quiz, scoreAnswers(quiz, answers));
    return quiz.dimensions.map((d) => norm[d] ?? 0);
  }, [answers]);

  // Funnel entry (the ?vs= token is read at mount via the initializer above).
  useEffect(() => {
    track("quiz_start");
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
    <main
      className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col overflow-hidden px-6 py-10"
      style={TOURNAMENT_SKIN ? { background: PITCH_BG } : undefined}
    >
      {TOURNAMENT_SKIN ? <TournamentSkin /> : null}

      <div className="relative z-10 flex flex-1 flex-col">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="inline-flex items-center gap-2 font-bold tracking-[0.18em]" style={{ color: accent }}>
              {/* Host-motif trio — maple leaf (CAN) · star (USA) · sunburst (MEX). */}
              <span className="inline-flex items-center gap-1">
                <MapleLeaf size={13} color={HOST.green} />
                <Star size={11} color={HOST.blue} />
                <SunBurst size={12} color={HOST.orange} />
              </span>
              MATCHDAY {step + 1}/{total}
            </span>
            <button
              type="button"
              onClick={() => step > 0 && !selected && (setStep(step - 1), setSelected(null))}
              disabled={step === 0}
              className="text-muted transition disabled:opacity-30"
            >
              ← Back
            </button>
          </div>
          {/* Scoreboard progress — 7 segments fill in the host gradient. */}
          <div className="mt-2 flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: i <= step ? "100%" : "0%",
                    background: TOURNAMENT_SKIN ? SEGMENT_COLORS[i] ?? accent : BRAND,
                  }}
                />
              </div>
            ))}
          </div>
          {/* §Fix3 — "stat line forming": abstract bars that grow as you answer
              (a teaser of the FUT-style reveal). No labels/numbers → no spoiler. */}
          <div className="mt-3 flex items-center gap-3">
            <Ball size={26} />
            <div className="flex flex-1 flex-col gap-1" aria-hidden>
              {forming.map((v, i) => (
                <div key={i} className="h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.max(6, v * 100)}%`,
                      background: accent,
                      opacity: 0.92 - i * 0.08,
                    }}
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
                className={`group flex items-center justify-between rounded-2xl border px-5 py-3.5 text-left text-lg backdrop-blur-sm transition active:scale-[0.99] ${
                  isSelected ? "" : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                }`}
                style={isSelected ? { borderColor: accent, background: `${accent}26` } : undefined}
              >
                <span>{opt.label}</span>
                {/* Selected → a geometric maple leaf in the host accent; the
                    leaf woven into the active card. Unselected → a quiet ring. */}
                <span className="ml-3 flex h-6 w-6 shrink-0 items-center justify-center">
                  {isSelected && TOURNAMENT_SKIN ? (
                    <MapleLeaf size={24} color={accent} />
                  ) : isSelected ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: accent }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6.2l2.3 2.3 4.7-4.8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : (
                    <span className="h-5 w-5 rounded-full border" style={{ borderColor: "rgba(255,255,255,0.22)" }} />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
