# Delicacy Trials — design note (the locked Machine 02)

Portfolio DoD item (d) for the delicacy instrument, which ships second (memo D3: visible-and-locked
in v1). This note is the demo asset until the instrument exists: what it measures, how, and why the
design is already fixed enough to promise on the homepage.

## What it measures

Hume's *delicacy of taste* — the Sancho's-kinsmen story: two tasters called the wine good "but for"
a faint leather / iron note; everyone laughed until the emptied cask revealed a key on a leather
thong. Delicacy = perceiving real properties of the stimulus that others miss. Unlike prestige
bias, this has **objectively correct answers** — which unlocks everything downstream.

## The task (2-alternative forced choice)

Each trial presents two versions of the same PD/CC excerpt: the original, and one with a single
controlled degradation. The user answers **which is the original** and **what was wrong** with the
other (multi-choice), plus a confidence tap (95 / 70 / 50 — the mechanic retained from the legacy
engine, now attached to items with truth values, per memo §3).

Degradation classes (all producible offline by the existing clip-pipeline + ffmpeg):
- **Buried wrong note** — a pitch-shifted copy of one melodic note mixed under the original (the
  literal key-in-the-wine).
- **Pitch drift** — slow ±15–40 cent LFO on the whole program.
- **Timing smear** — micro-offsets on transients (rubato-destroying, texture-preserving).
- **Lossy artifacts** — aggressive codec round-trip (the modern "leather thong").

Each class is parameterized (depth, duration, placement) → a difficulty ladder per class.

## Why this instrument carries the psychometrics (memo D6)

- **Accuracy exists** → per-item difficulty and per-user ability are IRT-estimable; the pool becomes
  a calibrated instrument rather than a quiz.
- **Confidence × accuracy** → calibration curves and Brier scores: Hume's *good sense* as a
  computed number, not a vibe.
- **Progression is measurable** (memo D4): ability estimates over retests are the paid tier's
  honest product — "your delicacy moved from θ = -0.4 to +0.3" beats any narrated flattery.

## Constraints already in force

Same honesty architecture as Prestige: deterministic scoring, raw responses stored in full,
provisional labeling until norms exist, PD/CC audio only with license proofs gated by CI, pool
versioning on every share surface. The locked homepage tile makes no capability claims — it names
the question ("can your ears actually tell?") and its demand signal is already instrumented
(`bias_locked_tier_tap`).
