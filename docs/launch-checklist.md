# Launch Checklist — Taste Gym v1 (Prestige-Bias flagship)

Status: living doc, created 2026-07-12 (S1 of the approved RT-execution plan).
Authority chain: `restructuring_decision_memo_2026-07-11.md` → `docs/rt-answers-2026-07-11.md` → this checklist.
Items under "Launch blockers" gate launch. Fast-follows fire on their named triggers, not on vibes.

## Launch blockers

1. **Pool of record wired.** Items 1–8 from `docs/bias-pool-candidates.md` processed through
   `scripts/clip-pipeline`; every item passes `docs/bias-pool-gatekeeping.md` §A–D with PM sign-off
   recorded in the manifest. No placeholder items reachable in production.
2. **RT-4 voice lock.** PM + Cowork produce the 3-line voice spec (Hume's wry examiner · tease the
   judgment, never the person · intensity scales challenge > debrief > onboarding) → ONE rewrite of
   `src/content/bias/copy.ts` → locked BEFORE cohort recruiting. Cohort-visible surfaces only
   (verdict, debrief, result page); share-block copy may iterate post-cohort.
3. **§9.7 renovation verified (RT-3).** After the homepage flip: zero 404s across every existing
   route and previously shared URL shape — `/`, `/quiz`, `/result`, `/music/quiz`, `/music/result`,
   `/vs`, `/fan-verdict`, `/premium/preview`, `/premium/report`, `/legal`, `/bias`, `/bias/result`.
   Redirects only; verified by an automated route sweep before deploy.
4. **Portfolio Definition-of-Done (memo C4/N1 — Goal 1 anti-drift):**
   - (a) Public-repo decision executed. Recommended: extract the scoring/psychometrics engine +
     item schema as a standalone MIT package; the app remains the hosted demo.
   - (b) Architecture README.
   - (c) Draft of the "Quantifying Hume's *Standard of Taste*" write-up (charts inserted when
     cohort data lands).
   - (d) One demo asset per instrument (Prestige: bias-gap distribution; Delicacy: locked-tier design note).
5. **RT-2 min-listen + RT-7 pool-version live** (S2/S3 of the execution plan — check off at commit).
6. **N3 audit:** every surfaced number carries the provisional frame until cohort norms exist;
   no percentile language anywhere.

## Fast-follows with named triggers

- **HMAC-signed share links (RT-6 option b).** TRIGGER: first evidence of real share traffic
  (any `bias_result_view` with a non-direct referrer that isn't the PM or the dev).
- **§8.1 persistent store proposal.** TRIGGER: progression/retest feature work begins (D4).
  Lightest viable store proposed then; recurring costs flagged first.
- **Instrument-refinement pass, incl. the edge-artifact headline fix (RT-5 option c).**
  TRIGGER: calibration-cohort data lands (memo §7).

## Ops reminders

- **D6 dataset durability:** raw responses live in PostHog free tier (≈1-year event retention)
  until the §8.1 store exists. EXPORT raw events before **2027-06-01** or at store adoption,
  whichever comes first. Dataset began 2026-07-12.

## Decisions ledger (paper trail)

- **RT-1…8 answered 2026-07-11** — authority: `docs/rt-answers-2026-07-11.md`. PM overrides of
  session defaults: RT-2→(b) 5s min-listen; RT-3→(c) homepage flip; RT-7→(b) pool-version now.
- **Memo §9.7 RESOLVED via RT-3:** `/bias` = homepage flagship; music quiz = secondary door;
  WC path = legacy (Track 5); no route or previously shared URL may 404 — redirects only.
- **Pause-restarts-clip ACCEPTED for v1** (full re-exposure standardizes the stimulus) —
  ClipPlayer carries a comment citing this acceptance.
- **RT-5 condition CONFIRMED 2026-07-12:** raw per-item responses stored in full
  (`bias_result`: blind/labeled per-item CSVs + pool id + pool version + per-item listen
  durations once S3 lands) → recalibration is retroactive.
