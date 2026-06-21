"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { worldCup } from "@/content/world-cup";
import { buildProfile, percentileNormalize, scoreAnswers, type Answers } from "@/engine";
import { track } from "@/lib/analytics";
import { encodeChallenger } from "@/lib/vs";
import TournamentSkin from "./TournamentSkin";
import { Motif } from "./motifs";
import { TOURNAMENT_SKIN, phaseFor, FORMING_COLORS, SHEET, INK, INK_MUTED, CARD_BG, TRACK } from "./tournament-theme";

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

  // The quiz path is segmented across the three hosts; the active phase owns the
  // accent + motif (Canada → USA → Mexico). Falls back to brand if skin killed.
  const phase = phaseFor(step);
  const accent = TOURNAMENT_SKIN ? phase.accent : BRAND;

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
      style={TOURNAMENT_SKIN ? { background: SHEET, color: INK } : undefined}
    >
      {TOURNAMENT_SKIN ? <TournamentSkin accent={accent} /> : null}

      <div className="relative z-10 flex flex-1 flex-col">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs font-medium">
            {/* Phase motif (rotates with progress) + position. No country name. */}
            <span className="inline-flex items-center gap-2 font-bold tracking-[0.18em]">
              <Motif kind={phase.motif} size={18} color={accent} />
              <span style={{ color: INK_MUTED }}>
                {step + 1} / {total}
              </span>
            </span>
            <button
              type="button"
              onClick={() => step > 0 && !selected && (setStep(step - 1), setSelected(null))}
              disabled={step === 0}
              className="transition disabled:opacity-30"
              style={{ color: TOURNAMENT_SKIN ? INK_MUTED : undefined }}
            >
              ← Back
            </button>
          </div>
          {/* Linear progress → clean, solid, single-toned (the phase accent). */}
          <div
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: TOURNAMENT_SKIN ? TRACK : "rgba(255,255,255,0.1)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${((step + 1) / total) * 100}%`,
                background: accent,
                boxShadow: TOURNAMENT_SKIN ? `0 0 8px ${accent}99` : undefined,
              }}
            />
          </div>
          {/* §Fix3 — "stat line forming": multi-DIMENSIONAL signature. Each bar
              is a distinct, simultaneous data axis → its own official colour, for
              a dense algorithmic read-out. No labels/numbers → no spoiler. */}
          <div className="mt-3 flex items-center gap-3">
            <Ball size={26} />
            <div className="flex flex-1 flex-col gap-1" aria-hidden>
              {forming.map((v, i) => (
                <div
                  key={i}
                  className="h-1 w-full overflow-hidden rounded-full"
                  style={{ background: TOURNAMENT_SKIN ? TRACK : "rgba(255,255,255,0.07)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.max(6, v * 100)}%`,
                      background: TOURNAMENT_SKIN ? FORMING_COLORS[i % FORMING_COLORS.length] : BRAND,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* §18.A permission line (parity with the music quiz) */}
          <p className="mt-2 text-xs" style={{ color: TOURNAMENT_SKIN ? INK_MUTED : undefined }}>
            No wrong answers. First instinct is the real data.
          </p>
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
                className={`group flex items-center justify-between rounded-2xl px-5 py-3.5 text-left text-lg transition active:scale-[0.99] ${
                  isSelected
                    ? ""
                    : TOURNAMENT_SKIN
                      ? "hover:-translate-y-0.5"
                      : "border border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                }`}
                style={
                  isSelected
                    ? TOURNAMENT_SKIN
                      ? { background: CARD_BG, boxShadow: `0 0 0 1.5px ${accent}, 0 10px 30px ${accent}55` }
                      : { borderColor: accent, background: `${accent}26`, borderWidth: 1, borderStyle: "solid" }
                    : TOURNAMENT_SKIN
                      ? { background: CARD_BG, boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.06)" }
                      : undefined
                }
              >
                <span>{opt.label}</span>
                {/* Selected → the active host-phase motif in the phase accent,
                    woven into the active card. Unselected → a quiet ring. */}
                <span className="ml-3 flex h-6 w-6 shrink-0 items-center justify-center">
                  {isSelected && TOURNAMENT_SKIN ? (
                    <Motif kind={phase.motif} size={24} color={accent} />
                  ) : isSelected ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: accent }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6.2l2.3 2.3 4.7-4.8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : (
                    <span
                      className="h-5 w-5 rounded-full border"
                      style={{ borderColor: TOURNAMENT_SKIN ? "rgba(0,0,0,0.20)" : "rgba(255,255,255,0.22)" }}
                    />
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
