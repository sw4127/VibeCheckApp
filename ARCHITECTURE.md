# Architecture — The Taste Gym

A web instrument that **measures taste** against David Hume's *Of the Standard of Taste* (1757),
starting with the Prestige-Bias Test: rate eight clips blind, rate them again with names attached,
and the gap — computed deterministically from your own taps — is your number.

Product decisions of record: `restructuring_decision_memo_2026-07-11.md` (D1–D6, N1–N3) →
`docs/rt-answers-2026-07-11.md` → `docs/launch-checklist.md`.

## Design principles (load-bearing)

1. **The engine measures; nothing narrates it into existence.** Every displayed number is arithmetic
   over the user's raw ratings, computed in pure TypeScript (`src/engine/`). Zero LLM calls anywhere
   in the instrument. (Memo D2/D6; the codebase's original §6 rule, re-scoped.)
2. **You are your own control.** Blind-vs-labeled re-rating needs no external ground truth; 2–3 of
   the labels are deliberately false (swaps), so movement toward a *lie* is causally clean bias.
   A **mandatory debrief** discloses every swap with true attribution before anything is shared.
3. **Honesty as architecture (N3).** Share URLs carry *raw ratings*, never conclusions — the result
   page and OG card **recompute** on every request, so a forged URL can only show what the engine
   would actually conclude. No percentiles exist until a cohort does; every surfaced stat carries a
   provisional frame. License proofs are enforced by the test suite, not by promises.
4. **Stateless until it can't be.** No database in v1: results live in URLs, the dataset streams to
   an analytics sink, sessions are self-contained. A persistent store arrives only with the
   progression tier (memo §8.1).

## System map

```
src/engine/            Pure deterministic instruments (no content, no I/O)
  bias.ts              Prestige-Bias math: signed sway toward labels, swapped-only
                       sub-stats, swayShare over movable items, edge disclosure,
                       strict share codec, provisional verdict thresholds
  hash.ts, score.ts…   Cache keying + the legacy quiz engine (shared primitives)

src/content/bias/      The pool of record
  items.ts             8 clips + labels; POOL_VERSION (bump on ANY pool change)
  manifest.json        Sources, SHA-256s, license snapshots, PM rulings, windows
  licenses/            Captured license-proof pages (CI fails if one is missing)
  bias.test.ts         The pool CONTRACT: ≥8 items, 2–3 swaps both directions,
                       direction balance, files exist, license gates

src/app/bias/          The 5-beat flow: Hume frame → blind → bridge → labeled →
                       reveal → MANDATORY debrief (swap disclosure + attributions)
  ClipPlayer.tsx       One stimulus seam: real PD/CC audio (5s min-listen arming
                       ring, media-clock heard-time) or badged placeholder synth
src/app/bias/result/   Stateless share permalink (?pv=&b=&l=) — recomputes
src/app/api/bias-card/ Satori/@vercel/og share card — recomputes, CDN-cacheable

scripts/clip-pipeline/ Content ops: download (SHA-256) → license snapshot →
                       window suggestion (RMS/variance/onset scoring) →
                       two-pass EBU R128 loudnorm render to −16 LUFS + TASL
scripts/analysis/      Psychometrics tooling (bias-gap distribution, cohort-ready)

packages/hume-taste-engine/  The extraction: engine + item schema as a standalone
                             MIT package (publish pending owner approval)
```

## The measurement, precisely

For each item with label direction *d* (up = acclaimed, down = dismissed), blind rating *b* and
labeled rating *l* (0–10 integers, scale gated by ≥5s of actually-heard audio):

- **towardLabel** = (l − b) if d = up, (b − l) if d = down — movement *in the label's direction*.
- **Headline pct** = mean(towardLabel) / 10, as a signed % — how far ratings moved toward labels.
- **swappedPct** = the same mean over swapped items only — movement toward *false* labels cannot be
  legitimate updating; this is the causally clean statistic, surfaced at the debrief.
- **swayShare** = fraction of *movable* items (blind rating not already at the scale edge in the
  label's direction) that moved toward the label — the consistency receipt, immune to edge artifacts.
- **edgeCount** is disclosed, not hidden: re-rating the same clips anchors people, so the measured
  sway *understates* the true effect — the copy says so.

Known, disclosed limitations queued for the instrument-refinement pass (once calibration-cohort
data lands): edge-item handling in the headline mean, verdict thresholds (±15%, provisional),
order effects of the fixed presentation sequence.

## Dataset (memo D6)

Every completion emits the full raw response vector — both rating passes, per-item listen
durations, pool id + POOL_VERSION, result hash — to the analytics sink (PostHog free tier as the
interim store; export reminder + §8.1 store trigger in `docs/launch-checklist.md`). Raw-first means
every future statistic (IRT item calibration, reliability, norms) is retroactively computable.

## Content pipeline & licensing

Audio is public-domain / Creative Commons only (CLAUDE.md §Stack as amended by memo §8.2), with a
paper trail per item: source URL + SHA-256, a captured license-proof page, and a TASL attribution
line rendered on the debrief. The test suite refuses any non-placeholder item lacking its proofs.
PM gatekeeping (recognizability, blurb credibility, window ear-checks) is recorded in the manifest;
`POOL_VERSION` rides every share URL and dataset event so old links die gracefully (redirect, never
a wrong number) and stored responses stay interpretable forever.

## Testing

465 tests: engine math (including boundary/malformed-input), the share codec, pool contracts,
license gates, plus the app's legacy suites. Verification discipline: every slice ships with a
real browser walk-through of the affected flow (documented in commit messages).

## Roadmap

1. **Delicacy Trials** (memo D3, visible-locked in v1): controlled degradations of PD/CC recordings,
   objective correct answers, confidence taps (95/70/50) → calibration curves / Brier scores.
2. **Psychometrics pass**: IRT item calibration, reliability, provisional → real norms.
3. **Progression tier** (memo D4): accounts + the §8.1 store, retests over time, improvement curves.
