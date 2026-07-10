# Restructuring Decision Memo — "The Taste Gym" Pivot

**Date:** 2026-07-11 · **Status:** APPROVED by PM/owner 2026-07-11 (session zero; was DRAFT) — authoritative per CLAUDE.md "Pivot of record" · **Authors:** Siqi (Bob) Wang (PM) + Claude (Lead Engineer)
**Supersedes:** the revenue-first recalibration and WC-front-door strategy in `CLAUDE.md` / spec §29, where noted below.
**Preserves (per ground rules):** Hume's *Of the Standard of Taste* as the intellectual core; all reusable engineering assets; the two long-term goals (portfolio + monetization).

---

## 0. Conclusions of record (what the data settled)

- **C1.** Viral consumer distribution for a $3.99 impulse product is **dead** (n=29 over Jun 7–Jul 7; WC front door: 0 spread; X Premium promotion: no traffic). This conclusion is final; no further attempts to revive that channel.
- **C2.** This is **not** generalized to "no distribution exists." The new goals face a different audience (recruiters, admissions committees, developers) through different channels (GitHub, HN/Reddit launches, technical write-ups) where the artifact itself is the marketing.
- **C3.** The paid product itself was never tested (4 paywall views). Irrelevant now — the model pivots regardless.
- **C4.** Project identity changes: from "beer-money side project" to **resume-competitive product artifact**. Monetization remains a goal but as *proof of commercial viability*, not income. Revenue expectations reset accordingly.

## 1. North star & guardrails

- **N1. Acquirability rubric** (from the Jul 7 tiebreaker, minus the component we can't control): **proprietary data · documented metrics · transferable ops · niche brand** (+ traction if it arrives). Every scope decision is judged against these four.
- **N2. Anti-theater guardrail (on the record):** complexity is a cost, not a value. No design justified by "we already built the machinery" (sunk cost) or "it showcases the pipeline" (resume theater). Value claims come only from **measurement rigor**. Either party may object by citing N2.
- **N3. Honesty rule:** no score, percentile, or claim the data can't support. Provisional norms are labeled as provisional. This is the anti-GIGO constitution.

## 2. Core decision — D1: Gym, not Mirror

The product **evaluates and cultivates taste** against Hume's five criteria (delicacy, practice, comparison, freedom from prejudice, good sense). It does **not** predict personality, mood, or psychological states.

- Rationale: Hume's essay is an *evaluation* theory, not a prediction theory. The gym reading is more Humean, requires no ground-truth datasets that don't exist (myPersonality closed; LFM-2b withdrawn; Big Five↔music correlations cap at r≈0.2–0.3), and dissolves the GIGO critique instead of relocating it.
- Consequence for the original memo's Core 1 (workplace stress/anxiety prediction): **dropped as a prediction claim** — no ground truth exists and it creates pseudo-clinical/ethical exposure. Stress/mood may appear only as user-entered reflection, never as model output.
- Core 2 (Hume Taste Maturity Quantification): **promoted from feature to the entire product.**
- Core 3 (emotional self-regulation solutions): **deferred**; if revived, framed as taste-cultivation recommendations tied to the training arc, never as therapy.

## 3. Measurement architecture — D2: performance tasks, not self-report

A 5–10 minute **testing session where the user can be wrong**. Perceived-friction management is the primary design challenge (precedent: 16Personalities ~10 min, 1B+ completions; effort legitimizes the score).

**Instrument 1 — Prestige-Bias Test (freedom from prejudice).** Rate works blind → rate labeled (artist/acclaim). The blind-vs-labeled gap is a measured number; the user is their own control — no external ground truth needed. Nominative use of artist names (same legal footing as §30 KB). **Mandatory debrief screen** after any mislabeling (deception disclosure — also a strong product moment).

**Instrument 2 — Delicacy Trials ("the key in the wine").** Public-domain/CC recordings (Musopen, IMSLP, FMA) with controlled degradations (pitch drift, compression, timing smear, buried wrong note): "which is the original, and what's wrong with the other?" Objectively correct answers; tunable difficulty; items calibratable via item-response theory. *Amends the "no music playback" rule (see §8).*

**Instrument 3 (later) — Comparison/Practice breadth** via optional streaming-history import (Spotify OAuth): measures exposure, not judgment; data-only, no audio.

**Confidence input (95/70/50, kept from §28):** attaches to **performance items only**. Confidence-vs-accuracy yields a **calibration curve** → operationalizes **good sense** as a computed number. Confidence never weights self-report in scoring again.

## 4. Sequencing — D3: one flagship, one visible locked tier

- **V1 flagship:** Prestige-Bias Test — cheapest to build, self-controlled ground truth, most shareable statistic ("my taste is __% label-driven").
- **Delicacy battery:** built second; present in v1 as a **visible, locked tier** (a gym has equipment you can see before you're ready). Full five-criteria battery is roadmap, not v1.
- Rationale: solo developer + semester constraints; the commitment spectrum itself dictates cheap/shareable = front door, effortful = depth.

## 5. Business model — D4: sell the progression, not the reading

- **Free:** the assessment + headline scores (bias gap, provisional percentile). This is also the new top-of-funnel.
- **Paid:** the **training arc** — the delicacy battery, retests over time, calibration-improvement charts, percentile movement, cohort norms.
- Consequences accepted: retention mechanics required; pricing model TBD (one-time unlock of the arc vs. light subscription — open question §9); friction discipline still applies at the free front door (progression is not a license for unbounded onboarding weight).

## 6. Narrative layer — D5: Hume as narrator, depth unlocked never buried

Each instrument opens with Hume's own example, then drops the user into it:
- Delicacy → Sancho's kinsmen and the key in the wine → *now you taste*.
- Prejudice → Hume on reputation corrupting judgment → *we catch your ratings doing it*.
- Comparison → Ogilby vs. Milton → *we map what you've actually compared*.

Lesson from the buried P1–P4 augmentation feature: deep features fail when hidden in unexplained clickables. **Depth is unlocked and narrated** — the philosophy is the game's narrator, not a landing-page citation.

## 7. Data & open-source strategy (rewrites memo Tracks 1, 2, 6)

- **Primary dataset is self-generated:** user response patterns, item calibrations, bias gaps, calibration curves. This is the proprietary-data asset (N1) — it compounds with every session and no competitor has it.
- **External data:** CC/public-domain audio corpora + our authored degradations; the §30 authored artist→axis KB continues for metadata. Big Five listening datasets: **deprioritized** (unavailable/withdrawn/weak).
- **ML/stats pipeline (replaces the multi-head model of Track 2):** psychometrics — item-response theory, signal detection, calibration/Brier analysis, reliability, norming. More defensible than a multi-head net trained on data that doesn't exist, and stronger portfolio material for BA/data roles.
- **Cold start:** recruit a calibration cohort (classmates, targeted subreddit pilot) = first norms + first dataset. Until then, provisional-norms labeling per N3.
- **Open source (Tracks 4/6 retained):** modular repo, English README, MIT; free core = instrument engine + psychometrics pipeline; paid = hosted progression service. Demo assets = calibration curves, IRT plots, bias-gap distributions. Launch write-up ("Quantifying Hume's *Standard of Taste*") targeted at HN/r/datasets/r/musictheory — this **replaces the WC front door as acquisition** (Track 5: WC quiz → legacy/archive, kept as a build-log chapter).

## 8. Standing rules that require owner approval to amend

Per the CLAUDE.md integrity rule, these are flagged, not silently changed:
1. **"No database / stateless"** — progression requires accounts + persistent results. Proposal: sunset the rule; choose the lightest persistent store at implementation time.
2. **"No music playback / no licensed music database"** — delicacy trials require audio playback of **public-domain/CC recordings only** (with our own manipulations). The *no licensed/copyrighted* audio rule stays; the *no playback* rule is amended.
3. `vibe_check_mvp_spec.md` sections superseded by this memo to be marked, not deleted (append-only discipline).

## 9. Open questions (next session)

1. Pricing structure for the progression tier (one-time arc unlock vs. subscription) + price point.
2. Auth/store choice (lightest viable: e.g., magic-link + managed Postgres/KV) — needs cost guardrail review.
3. Calibration-cohort recruitment plan and target N.
4. Audio degradation toolchain (offline pipeline; which manipulations, how validated).
5. Naming/positioning: does "Vibe Check" survive, or does the gym get a new name?
6. Timeline vs. Columbia semester; definition of "v1 done."
7. What of the live site stays up during the transition.

## 10. Decision log (this seminar, 2026-07-11)

| # | Decision | Basis |
|---|---|---|
| D1 | Gym, not mirror | Hume = evaluation theory; no ground-truth datasets exist for prediction |
| D2 | Task-based measurement, friction managed not avoided | Old EV≈0; effort legitimizes scores; precedents |
| D3 | Prestige-bias first; delicacy visible-but-locked | Solo capacity; commitment spectrum implies the sequence |
| D4 | Paid = progression, not one-shot deep report | Gym logic; layering room; cohesive arc; revenue = viability proof |
| D5 | Hume as narrator; depth unlocked, never buried | P1–P4 burial lesson; fixes theory-data disconnect (Track 3) |
| D6 | Psychometrics pipeline; self-generated proprietary dataset | N1 acquirability; Track 2 rewrite; N3 honesty |
