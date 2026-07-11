# RT Answers + Content-Ops Automation Handoff (2026-07-11)

PM decisions on the == DECISIONS NEEDED == block, cross-checked against the earlier sign-off list.
Paste the whole file reference to Claude Code: "Execute docs/rt-answers-2026-07-11.md."

## Answers by ID

- **RT-1: (a-modified).** Do NOT draft a new pool. A reviewed candidate pool already exists at
  `docs/bias-pool-candidates.md` (license research done; Tier 1 = items 1–8). Wire `items.ts` from it
  after the PM's C/D pass. The gatekeeping rules live in `docs/bias-pool-gatekeeping.md`.
- **RT-2: (b) — overriding the default.** Minimum 5s heard before the scale unlocks, with the rating
  control visibly "arming" (progress ring), and log per-item listen duration as data regardless.
  Rationale: measurement validity (N3) — a 0.5s rating is not a judgment of the stimulus.
- **RT-3: (c) — overriding the default.** §9.7 is hereby resolved: /bias becomes the homepage flagship;
  the music quiz demotes to a secondary door; WC path moves to legacy (Track 5). Renovation rules:
  no existing route or previously shared URL may 404; redirects only. "Preserve current traffic" at
  n≈1/day is sunk-cost caution (N2) — overruled.
- **RT-4: (a), scoped.** Voice pass BEFORE cohort recruiting, but only on the surfaces the cohort sees
  (verdict + debrief + result page). Process: PM + Cowork-Claude produce a 3-line voice spec
  (Hume's wry examiner · tease the judgment, never the person · intensity scales challenge > debrief
  > onboarding), then one rewrite of `copy.ts`, then lock. Share-block copy may iterate post-cohort.
- **RT-5: (a) now, (c) recorded as the trigger.** Keep simple mean + edgeCount disclosure; the deep fix
  runs in the instrument-refinement pass once cohort data exists. Condition attached: raw per-item
  responses must be stored in full so recalibration is retroactive.
- **RT-6: (a) for v1, (b) scheduled.** Accept craftable URLs now; implement HMAC-signed links
  (server secret, stateless) as a fast-follow with a named trigger: first evidence of real share traffic.
- **RT-7: (b) — overriding the default.** Add the pool-version param to result/card URLs NOW. It is
  cheap, it is coming anyway with IRT calibration (D6), and it makes RT-7's acceptance permanently
  safe instead of temporarily tolerable.
- **RT-8: (a).** Keep the "Round two" bridge screen — the two passes must feel like separate events or
  the labeled pass contaminates. (Note: this item was NEW vs. the earlier sign-off list — protocol working.)

## Items missing from the RT block — reconfirmed so they are not lost

1. **Pause-restarts-clip (old Item 2.2):** ACCEPTED for v1 (full re-exposure standardizes the stimulus).
   Was in the earlier sign-off list but absent from the RT block; recorded here so it has a paper trail.
2. **Portfolio Definition-of-Done (Goal 1 anti-drift):** launch DoD includes (a) public-repo decision
   (recommended: extract the scoring/psychometrics engine + item schema as a standalone MIT package,
   app = hosted demo), (b) architecture README, (c) draft of the "Quantifying Hume's Standard of Taste"
   write-up (charts inserted when cohort data lands), (d) one demo asset per instrument. These are
   launch blockers, not post-launch wishes.

## Content-ops automation (Claude Code executes; PM only ear-confirms)

The PM delegates download/verify/trim mechanics. Build `scripts/clip-pipeline` (Node or Python) that,
from a manifest (`docs/bias-pool-candidates.md` → `content/bias/manifest.json`):
1. **Download** each source file from the recorded URL (prefer archive.org direct links — no login;
   FMA is login-walled). Store source URL + SHA-256 of the file in the manifest.
2. **License snapshot:** save the license-proof page (PDF/HTML) into `content/bias/licenses/` per item
   (archive.org items include a Rights line and often a LICENSE file — capture it).
3. **Window suggestion:** analyze each file (ffmpeg astats / librosa): skip intro silence, compute
   short-window energy + spectral-flux variance, propose the top-2 candidate 20s windows per piece
   (must contain a phrase onset, not a fade). Emit start/end timestamps for PM ear-confirmation.
4. **Render:** trim the PM-approved window, loudness-normalize the whole pool to one LUFS target
   (EBU R128, e.g. -16 LUFS), export mp3 + fallback, write `attribution` strings (TASL + "excerpt")
   into `items.ts`, and fail CI if any item lacks a license snapshot or proof URL.

PM's remaining manual duties (cannot be automated honestly): first-listen recognizability veto (C.3),
window ear-confirmation from the script's suggestions, blurb believability pass (C.1).
