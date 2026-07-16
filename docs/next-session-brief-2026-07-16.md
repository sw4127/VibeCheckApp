# Next-Session Brief — KPIs + Passive Discovery (2026-07-16)

Prepared by the product seminar (PM + Cowork-Claude). Hand to Claude Code:

> "Before planning: confirm you have read (1) CLAUDE.md's Pivot of record, (2)
> restructuring_decision_memo_2026-07-11.md in full, (3) this brief. Then execute
> docs/next-session-brief-2026-07-16.md: propose the plan first, cite the memo decision (D#/N#)
> each work item serves per the standing rules, wait for my approval, RT block at the end."

**Memo conformance note:** nothing in this brief amends the memo. v1 = bias flagship + visible-locked
delicacy tier is exactly D3's definition; the delicacy battery remains "built second" (PM-2 below
schedules it, not re-decides it). Conformance map: §3.A serves D6/N1 (the dataset must actually
accumulate) · §3.B–C serve C2/N1 (discovery for the launch channel; anti-theater cap per N2 in PM-3)
· §3.D serves N3 (honest, visible numbers) · §3.E serves C2/D6 (launch assets + write-up) · §2 KPIs
serve C4 (resume-first identity) with N3 honesty caps · §4 serves N1 (acquirability signals).

## 0. Judgment on the closed session
v1 deploy VERIFIED and the session is properly closed (empty RT block was legitimate). One ops item
survives it and is now **first in the queue**: the PostHog env check. Without `NEXT_PUBLIC_POSTHOG_KEY`,
D6 accumulates nothing — every downstream KPI, norm, and write-up chart is vapor. PM does the 1-minute
Vercel check; engineering makes the failure LOUD (see A2).

## 1. Premise corrections (of record, N3)
- **"No rigid external deadlines" is FALSE.** The resume goal has a season: fall 2026 recruiting +
  grad-app cycle. **Hard internal deadline: artifact + data story interview-ready by 2026-09-15.**
  All KPIs below inherit it.
- **"Feedback vacuum → pivot to passive SEO" is half-wrong.** The launch event (write-up + HN/Reddit
  posting, per memo C2) has NOT happened yet — the vacuum is evidence the launch hasn't occurred, not
  that distribution failed. SEO/GEO is cheap and worth building, but it *supports* the launch; it never
  replaces it. A fresh domain with no backlinks earns ~nothing from SEO for months. Watch for
  launch-avoidance dressed as infrastructure work (N2).
- **Schema reality check (verified 2026-07):** Google removed FAQ rich results in May 2026; HowTo died
  in 2023. FAQ/HowTo markup no longer produces SERP features. The markup itself remains valid and IS
  read by AI crawlers (Bing/Perplexity/RAG bots), so we implement it for GEO, with SERP expectations
  set to zero.

## 2. KPI framework (the anti-bubble instrument the PM asked for)
North star: **"an interviewer or admissions committee finds this project credible, rigorous, and alive."**

**Tier 1 — Controllable gates (binary, due 2026-09-15):**
- [ ] Engine/psychometrics package public on GitHub (MIT, README w/ architecture diagram, docs) — RT-13a
- [ ] Methodology write-up published ("Quantifying Hume's Standard of Taste") with real-data charts
- [ ] Psychometrics pipeline executed on real responses (IRT item stats + calibration/Brier computed)
- [ ] Delicacy battery: visible-locked tier upgraded to live second instrument (stretch: decide at §4)
- [ ] Three rehearsed interview narratives documented (measurement design · honest-stats decisions ·
      pipeline engineering), mock-tested once against a rubric

**Tier 2 — Evidence thresholds (data, honest scale):**
- ≥ 300 completed sessions → provisional norms defensible; ≥ 100 = charts render meaningfully
- ≥ 1 computed artifact per instrument in the write-up (bias-gap distribution; calibration curve)
- Response dataset exportable + documented (the N1 proprietary asset, provable in an interview)

**Tier 3 — External signals (influenced, NOT controlled — capped so we don't chase vanity):**
- Launch post: ≥ 1 front-section hour on HN or ≥ 50 upvotes on a relevant subreddit = success; anything
  more is weather
- GitHub: ≥ 50 stars by Nov = good for a niche instrument; README traffic > star count matters more
- Organic/AI-referral sessions: any nonzero steady weekly trickle by Nov = the GEO pipe works

**Standing rule:** no feature ships unless it moves a Tier 1 or Tier 2 KPI. If it only moves Tier 3,
it queues behind everything that does.

## 3. Build list for the next CC session
**A. Ops hardening (first)**
1. PM verifies `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_BASE_URL` in Vercel; redeploy if missing.
2. Kill the silent-no-op class: build-time warning + a visible dev/console banner when analytics keys
   are absent; add a `/api/health`-style self-check that reports env completeness.
3. End-to-end event QA: one scripted session → confirm every funnel event lands in PostHog.

**B. Technical SEO foundation**
4. `sitemap.xml`, `robots.txt` (explicitly ALLOW GPTBot, ClaudeBot, PerplexityBot, Bingbot), canonical
   URLs, per-route titles/descriptions audit, OG audit on all share surfaces.
5. Schema: `WebSite`, `Organization`, `WebApplication` (the test), `Article` (methodology/explainers),
   `BreadcrumbList`; `FAQPage` markup on explainers for AI parsing (SERP expectation: none).

**C. GEO layer**
6. `llms.txt` (+ `llms-full.txt`) describing the product, the instruments, and the methodology.
7. Server-rendered, statically-served explainer pages (AI crawlers don't run JS): "What is the
   Prestige-Bias Test?" · one page per Hume criterion (5) · methodology page with quotable, cited
   numbers once cohort data exists. These double as the SEO content base and the write-up's siblings.
8. Verify key results/explainer content is present in raw HTML (no client-only rendering).

**D. KPI instrumentation**
9. `docs/kpis.md` = the framework above, wired: a weekly PostHog export script + a tiny script that
   renders current Tier 2/3 numbers into a status table the PM can read in 30 seconds.

**E. Launch-asset prep (assets, NOT the event — PM times the event)**
10. Write-up skeleton finalized with placeholder charts wired to the analysis script (charts
    auto-generate when N arrives).
11. Engine-repo extraction checklist executed up to "ready to flip public."

**Non-goals this session:** the launch posting itself; new instruments; anything paid.

## 4. Channel research findings (passive/semi-passive, beyond SEO)
- **OSF or SSRN preprint** of the methodology → indexed by Google Scholar, citable in grad apps;
  highest credibility-per-hour of anything on this list. Queue after the write-up exists.
- **GitHub-native discovery** (Track 6): repo topics/keywords, a strong social-preview image, README
  demo GIF; npm publish of the engine gets package-registry search for free.
- **Dataset publication** (HuggingFace/Kaggle) once N and anonymization allow — discovery + N1 proof.
  Gate: privacy review + consent language first. NOT before.
- **Structured university ask** (retry the failed outreach, differently): not "any feedback?" but a
  5-minute demo + ONE specific question ("does the calibration framing hold up?") to 2–3 named people;
  Columbia BA program showcase/newsletter if available.
- **Product Hunt / directories:** events and marginal, respectively. Optional, after launch, never before.
- Rejected as astroturf-adjacent: unprompted subreddit drops without maker-disclosure, Wikipedia
  self-citation, review-swap rings (N3 + platform ToS).

## 5. PM decision points (answer before or in the next session)
- [PM-1] Confirm the 2026-09-15 deadline and Tier 2/3 targets (my defaults are deliberately modest).
- [PM-2] Delicacy battery: build it into the 09-15 scope (stronger portfolio, more work)
- [PM-3] SEO/GEO scope cap: I propose a hard timebox of ONE build session for §3.B+C; overflow queues
  behind launch assets. Approve.
