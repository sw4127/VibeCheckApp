"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { musicQuiz, CUES, REVERB, buildMusicProfile } from "@/content/music";
import { scoreAnswers, type Answers } from "@/engine";
import { track } from "@/lib/analytics";

const quiz = musicQuiz;
const REVERB_MS = 900; // §17.A/§18.C: the confirm beat where the quiz "talks back"

/** §18.B retrieval triggers — neutral contexts, never example artists. */
const TRIGGERS = ["most-played this month", "shower anthem", "your 2 a.m. artist", "defend-to-the-death"];

export default function MusicQuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0..6 taps, 7 = artist bonus round
  const [answers, setAnswers] = useState<Answers>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [reverb, setReverb] = useState<string | null>(null);

  // Artist step state (§18.B): two zones, chips, optional.
  const [recent, setRecent] = useState<string[]>([]);
  const [durable, setDurable] = useState<string[]>([]);
  const [recentInput, setRecentInput] = useState("");
  const [durableInput, setDurableInput] = useState("");
  const [placeholder, setPlaceholder] = useState("start typing — we'll find them");
  const recentRef = useRef<HTMLInputElement>(null);

  const total = quiz.questions.length;
  const onTaps = step < total;
  const question = onTaps ? quiz.questions[step] : null;

  useEffect(() => {
    track("quiz_start", { variant: "music" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // §18.C forming signature: abstract bars from the partial raw vector — no
  // labels, no archetype, no verdict until the reveal.
  const bars = useMemo(() => {
    const raw = scoreAnswers(quiz, answers);
    const values = quiz.dimensions.map((d) => raw[d] ?? 0);
    const max = Math.max(1, ...values);
    return values.map((v) => v / max);
  }, [answers]);

  function choose(optionId: string) {
    if (!question || selected) return;
    setSelected(optionId);
    setReverb(REVERB[question.id]?.[optionId] ?? null);
    const next: Answers = { ...answers, [question.id]: optionId };
    setAnswers(next);

    setTimeout(() => {
      setSelected(null);
      setReverb(null);
      setStep(step + 1);
    }, REVERB_MS);
  }

  function addChip(zone: "recent" | "durable") {
    if (zone === "recent") {
      const v = recentInput.trim();
      if (v && recent.length < 3 && !recent.includes(v)) setRecent([...recent, v]);
      setRecentInput("");
    } else {
      const v = durableInput.trim();
      if (v && durable.length < 1) setDurable([v]);
      setDurableInput("");
    }
  }

  function finish(skipArtists: boolean) {
    const profile = buildMusicProfile(answers);
    track("quiz_complete", {
      variant: "music",
      archetype: profile.archetype.id,
      artists: skipArtists ? 0 : recent.length + durable.length,
    });
    const qs = new URLSearchParams();
    for (const q of quiz.questions) qs.set(q.id, answers[q.id]);
    if (!skipArtists) {
      if (recent.length) qs.set("ar", recent.join(","));
      if (durable.length) qs.set("ad", durable.join(","));
    }
    router.push(`/music/result?${qs.toString()}`);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-6 py-10">
      {/* Progress + §18.A permission line */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-medium text-muted">
          <span>{onTaps ? `${step + 1} of ${total}` : "Bonus round"}</span>
          <span>No wrong answers. First instinct is the real data.</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${(Math.min(step + 1, total) / total) * 100}%` }}
          />
        </div>
        {/* §18.C forming signature — abstract, unlabeled */}
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

      {onTaps && question ? (
        <>
          <h1 className="font-display text-3xl font-semibold leading-tight">{question.prompt}</h1>
          {CUES[question.id] ? (
            <p className="mt-2 text-sm text-muted">{CUES[question.id]}</p>
          ) : null}

          <div className="mt-7 flex flex-col gap-3">
            {question.options.map((opt) => {
              const isSelected = selected === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => choose(opt.id)}
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
        </>
      ) : (
        <>
          {/* §18.B — optional artist bonus round; never blocks completion */}
          <h1 className="font-display text-3xl font-semibold leading-tight">
            Bonus round: name names.
          </h1>
          <p className="mt-2 text-sm text-muted">
            The more you name, the more this reads like your diary. Or skip — you&apos;ll still get read.
          </p>

          <div className="mt-6">
            <p className="text-xs font-bold tracking-[0.25em] text-muted">ON REPEAT RIGHT NOW · up to 3</p>
            <p className="mt-1 text-xs text-muted">your last week of plays</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {recent.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setRecent(recent.filter((x) => x !== a))}
                  className="rounded-full border border-accent/60 px-3 py-1 text-sm"
                >
                  {a} ✕
                </button>
              ))}
            </div>
            <input
              ref={recentRef}
              value={recentInput}
              onChange={(e) => setRecentInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addChip("recent"))}
              onBlur={() => addChip("recent")}
              placeholder={recent.length < 3 ? placeholder : "that's plenty"}
              disabled={recent.length >= 3}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none focus:border-accent/60"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {TRIGGERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setPlaceholder(`${t}…`);
                    recentRef.current?.focus();
                  }}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-muted transition hover:border-accent/50"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <p className="text-xs font-bold tracking-[0.25em] text-muted">RIDE-OR-DIE · just 1</p>
            <p className="mt-1 text-xs text-muted">the one you&apos;d defend in an argument</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {durable.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setDurable([])}
                  className="rounded-full border border-accent/60 px-3 py-1 text-sm"
                >
                  {a} ✕
                </button>
              ))}
            </div>
            {durable.length === 0 ? (
              <input
                value={durableInput}
                onChange={(e) => setDurableInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addChip("durable"))}
                onBlur={() => addChip("durable")}
                placeholder="years of loyalty, one name"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none focus:border-accent/60"
              />
            ) : null}
          </div>

          <div className="mt-9 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => finish(false)}
              className="rounded-full bg-accent px-10 py-4 text-lg font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
            >
              Read me →
            </button>
            <button type="button" onClick={() => finish(true)} className="text-sm text-muted underline">
              Skip — I&apos;ll still get read
            </button>
          </div>
        </>
      )}
    </main>
  );
}
