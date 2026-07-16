# KPI Framework — of record (2026-07-16 brief §2; PM-confirmed 2026-07-17, RT-1a)

North star: **"an interviewer or admissions committee finds this project credible, rigorous, and
alive."** (Serves memo C4 — resume-competitive identity; honesty caps per N3.)

**Hard internal deadline: artifact + data story interview-ready by 2026-09-15** (fall 2026
recruiting + grad-app cycle). Confirmed by PM 2026-07-17.

**Standing rule:** no feature ships unless it moves a Tier 1 or Tier 2 KPI. If it only moves
Tier 3, it queues behind everything that does.

## Tier 1 — Controllable gates (binary, due 2026-09-15)

- [ ] Engine/psychometrics package public on GitHub (MIT, README w/ architecture diagram, docs) — RT-13a
      *(extraction done 2026-07-12: `packages/hume-taste-engine`, still `private: true`; flip
      needs explicit owner approval — outward-facing)*
- [ ] Methodology write-up published ("Quantifying Hume's Standard of Taste") with real-data charts
- [ ] Psychometrics pipeline executed on real responses (IRT item stats + calibration/Brier computed)
- [ ] **Delicacy battery live as the second instrument — IN SCOPE for 09-15 per PM ruling
      2026-07-17 (RT-2a; upgraded from stretch)**
- [ ] Three rehearsed interview narratives documented (measurement design · honest-stats decisions ·
      pipeline engineering), mock-tested once against a rubric

## Tier 2 — Evidence thresholds (data, honest scale)

- ≥ 300 completed sessions → provisional norms defensible; ≥ 100 → charts render meaningfully
- ≥ 1 computed artifact per instrument in the write-up (bias-gap distribution; calibration curve)
- Response dataset exportable + documented (the N1 proprietary asset, provable in an interview)

## Tier 3 — External signals (influenced, NOT controlled — capped, anti-vanity)

- Launch post: ≥ 1 front-section hour on HN or ≥ 50 upvotes on a relevant subreddit = success;
  anything more is weather
- GitHub: ≥ 50 stars by Nov = good for a niche instrument; README traffic > star count matters more
- Organic/AI-referral sessions: any nonzero steady weekly trickle by Nov = the GEO pipe works

## Instrumentation (brief §3.D9 — serves C4/D6/N3)

Two scripts, both read `POSTHOG_PERSONAL_API_KEY` + `POSTHOG_PROJECT_ID` from env or `.env.local`
(a **personal** API key with read scope — NOT the public `phc_` project key; create under
PostHog → Settings → Personal API keys):

- **`node scripts/analysis/kpi-status.mjs`** — the 30-second status table: completed sessions
  (total / last 7 days), funnel step counts, Tier-2 threshold progress. Run weekly; paste nothing,
  fabricate nothing — it prints only what PostHog returns.
- **`node scripts/analysis/posthog-export.mjs`** — exports raw `bias_result` events (the D6
  dataset) to `data/exports/bias-results-<date>.csv`. `data/` is git-ignored: the dataset is the
  proprietary asset (N1) and never ships in a public repo. Ops deadline: export before
  **2027-06-01** or at §8.1 store adoption (launch-checklist).

QA/dev sessions enter with `?ref=dev` and are excluded by both scripts (N3 — the PM and the
engineer are not the cohort).

Tier-3 signals (HN/stars/referrals) are read manually — deliberately not automated; they're
capped, not chased.
