# CLAUDE.md — Project Context for Claude Code

## Pivot of record (2026-07-11) — READ FIRST
**`restructuring_decision_memo_2026-07-11.md` is the authoritative product strategy.** Approved by the PM/owner in session zero (2026-07-11). It SUPERSEDES the sections now parked under "Legacy (superseded — kept for history)" at the bottom of this file, plus the spec sections stamped `SUPERSEDED` in `vibe_check_mvp_spec.md`. The $3.99 viral-funnel model is concluded dead (memo §0, C1) — do not propose reviving, preserving, or incrementally fixing it.

**What we're building now (memo D1–D6):** a **taste gym** — the product *evaluates and cultivates* taste against Hume's five criteria; it never predicts personality, mood, or psychological states (D1). Measurement = performance tasks where the user can be wrong, not self-report (D2). **v1 flagship = the Prestige-Bias Test**; the delicacy battery ships second but is *visible-and-locked* in v1 (D3). Free = the assessment + headline scores; paid = the training arc / progression (D4; pricing open, memo §9.1). Hume narrates each instrument — depth is unlocked, never buried (D5). Analytics = a psychometrics pipeline (IRT, signal detection, calibration/Brier); the proprietary asset is our self-generated response dataset (D6). Project identity: resume-competitive product artifact; revenue = proof of viability, not income (memo C4).

**Standing rules (every session):**
- Every proposal must cite the memo decision (D1–D6) or guardrail (N1–N3) it serves; if none applies, say so instead of proposing it.
- **N2 anti-theater is live:** never justify a design by "we already built this" (sunk cost) or "it showcases the pipeline" (resume theater). Value claims come only from measurement rigor.
- **N3 honesty:** no fabricated percentiles, norms, or claims; provisional norms are labeled provisional.
- The existing workflow rules (plan first, smallest slice, wait for approval, self-verify) and cost guardrails remain fully in force.

**Rule amendments approved by owner (memo §8):**
1. **"No database / stateless" is sunset** (§8.1): progression requires accounts + persistent results. Propose the *lightest* persistent store at implementation time; flag any recurring cost before adopting it — cost guardrails still apply.
2. **"No music playback" is amended** (§8.2): playback of **public-domain / Creative-Commons audio with our own manipulations ONLY** is now permitted (delicacy trials). The ban on licensed/copyrighted audio and licensed metadata stays.

**Payments note:** the Merchant-of-Record constraint (mainland-China tax resident; no Stripe — see "Payments update" below) still stands for whatever paid tier ships; the **$3.99 price point is superseded** and progression-tier pricing is an open question (memo §9.1).

## Roles
- **The user is the Product Manager.** They drive product and design decisions; they are newer to engineering, so explain tradeoffs in plain language and teach as you go.
- **You (Claude Code) are the Lead Full-Stack Engineer.**

## What we're building
See **"Pivot of record (2026-07-11)"** above — the taste gym per memo D1–D6. The historical spec, engine details, and build history live in `vibe_check_mvp_spec.md` (superseded sections are stamped); naming ("Vibe Check"?) is an open question, memo §9.5. *(The original description moved to Legacy below.)*

## Stack (locked for v1 — keep it lean, free/low-cost tiers)
- **Next.js (App Router) + Tailwind CSS**, hosted on **Vercel** free tier.
- **LLM:** Anthropic API. Free Vibe Check on a cheap/short call; premium report on a stronger model. Keys in `.env` only.
- ~~**Payments:** Stripe Checkout / Payment Link at $2.99.~~ *[Superseded: Stripe by the "Payments update" (MoR/Dodo); the price by the 2026-07-11 pivot — pricing open per memo §9.1.]*
- **Share card:** `@vercel/og` (Satori — server-side SVG → PNG via edge function), keyed by a deterministic input hash so it's CDN-cacheable and doubles as the OG unfurl image. Card is typography-driven; **no album art / no copyrighted imagery**. (Client-side `html-to-image` was rejected: downloads are unreliable in IG/TikTok in-app browsers, and Satori only supports a CSS subset, so the card is built in constrained inline-style JSX.)
- ~~**No database for v1** — the app is stateless.~~ *[SUNSET 2026-07-11, owner-approved per memo §8.1: progression requires persistence. Lightest viable store to be proposed at implementation; recurring costs flagged first.]*
- **No ~~music playback and no~~ licensed music database or licensed/copyrighted audio.** *[AMENDED 2026-07-11, owner-approved per memo §8.2: playback of public-domain/CC audio with our own manipulations ONLY is permitted (delicacy trials). The licensed/copyrighted ban stays.]*

## Workflow rules
- **Plan before coding.** Always propose an architecture or step-by-step plan and **wait for my approval** before writing large blocks of code. Start with the smallest shippable slice.
- **Self-verify.** Never assume code works. Write/run tests, run local builds, read error logs, and confirm before telling me a task is done.
- **Communication.** Keep explanations concise. If you're uncertain about a product or design decision, **ask me — do not guess.**
- **Version control.** Use git from the start. Commit in small, working increments with clear messages so we can always roll back.

### Standing task loop (owner-approved append 2026-07-17, RT-1a — applies to EVERY task, EVERY session)
Follow all 7 steps; the PM reviews the git diff after every task, and nothing is "done" until steps 4–6 appear in the reply. If a session's work somehow skipped the loop, run steps 5–6 retroactively before closing.
1. **NORTH STAR (start):** restate the core advantage in one line — *a measured, honest number about your taste that nothing else can give you* (recast 2026-07-11 with the pivot; carried by the shareable stat card and managed friction) — and say how this task serves it. If it doesn't, flag that before doing it.
2. **PLAN + ALTERNATIVE:** propose your approach AND one different approach, and argue for the one you'd reject. Wait for PM approval — don't just defend your first instinct.
3. **BUILD** the smallest slice.
4. **PROVE IT (no self-report):** paste the actual test run, build output, or real generated outputs for 3 diverse inputs. "Should work" is not acceptable.
5. **RED-TEAM YOURSELF:** as a hostile reviewer who assumes this is lazy and mediocre, list the 3 worst things about what you just built, then fix them.
6. **CONFESSION:** list everything stubbed, mocked, hardcoded, skipped, or NOT verified. Hidden shortcuts are worse than admitted ones.
7. **NORTH STAR (end):** did this measurably improve reading quality, shareability, or friction? If it only added gold-plating, say so and propose cutting it.

Red-team asks surface per `docs/redteam-protocol.md` (the `== DECISIONS NEEDED ==` block); asks outside the block are deemed not asked.

## Safety & cost guardrails (important — I'm watching the budget)
- **Never spend real money, deploy to production, incur paid third-party API usage, or run paid build minutes without my explicit approval.**
- **Secrets live in `.env` and are git-ignored. Never hardcode or commit API keys.** I will paste keys myself when needed.
- Flag anything that would create a recurring cost before doing it.

## Result anchoring (credibility-critical)
*[Re-scoped 2026-07-11: the principle — deterministic computation in code, LLM never classifies — carries into the memo's instruments (D2/D6, N3); the archetype/player-match specifics below describe the legacy product.]*
The verdict (archetype, trait levels, player match) is computed by a **deterministic scoring engine in code** — quiz answers carry fixed point-weights → score vector → archetype + nearest player. The **LLM only writes** the reading for that pre-computed profile; it never classifies. Call the LLM at low temperature with a pinned model snapshot, enum-locked fields, and cache by input hash. See `vibe_check_mvp_spec.md` §6.

## Build sequence
See **"Pivot of record (2026-07-11)"** above — memo D3: v1 = Prestige-Bias Test; delicacy battery second (visible-and-locked in v1); full five-criteria battery = roadmap. *(The old Stage 1/Stage 2 sequence moved to Legacy below.)*

## Design quality bar — Definition of Done (check EVERY screen, EVERY pass)
No UI is "done" until it passes all of these. On any UI work, audit each item explicitly and report **pass / weak** per item — treat anything "weak" as not done. This rubric always applies, on top of whatever specific fixes I ask for in a given session.
- **Hierarchy:** one clear focal point per screen, not everything competing.
- **Typography:** a real type scale (size/weight contrast) and ONE branded display font carried across all screens — not flat, not generic.
- **Restraint:** one accent color in play, generous whitespace, no clutter and no dead voids.
- **Emotional payoff:** the result screen feels like a REVEAL, not a form submit.
- **Shareability:** a 22-year-old would post the result card to their story unprompted.
- **Craft:** consistent spacing rhythm, alignment, and corner radii; satisfying selected / hover / tap states and micro-interactions (the quiz answer cards especially must have a real selected state).
- **Consistency:** landing, quiz, and card read as one product — same color system, type, and voice.
- **Mobile-first:** designed for phone width first; max-width container on desktop; never floating in a void.
- **Voice:** the cynical, brutally-accurate brand persona shows up in the copy, not just neutral chrome.
- **Renders via Satori:** the card is generated by `@vercel/og`, so the branded display font must be bundled as a font file and all card styling must stay within Satori's supported CSS subset (flexbox-based; no arbitrary CSS).

## Keeping this file intact
- Do **not** delete, trim, or rewrite existing sections of `CLAUDE.md` or `vibe_check_mvp_spec.md` without my explicit approval. Append, or propose an edit and wait — never silently overwrite. (The Design Quality Bar was lost once in a regeneration; don't let it happen again.)
- If you believe a section is outdated, flag it to me rather than removing it.

## Payments update (supersedes the Stripe/$2.99 mentions in §Stack)
*[2026-07-11: the MoR constraint below still stands; the $3.99 price and the stateless verify-on-return design are superseded — progression-tier pricing/auth are open questions, memo §9.1–9.2.]*
The seller is a mainland-China tax resident and **cannot use Stripe**. Payments are now a **Merchant-of-Record (Dodo Payments)** behind a provider-agnostic adapter (`src/lib/payments/`, `PAYMENTS_PROVIDER` env). Hosted redirect checkout at **$3.99**, stateless verify-on-return (no DB), webview-survivable. The MoR is the legal seller (handles tax/refunds/disputes). Full design + the test-mode items to verify live: **spec §24**.

## Build log (append-only — detail in spec)
- **World Cup quiz refresh (shipped, main):** +9 breakout footballers as playing-style archetypes + host-nation colour cues (USA/CAN/MEX +4) via the IP-safe `NATIONS` card system. Trademark-safe (§13.D), playing-style-only (§3). Detail: **spec §25**.
- **§10.A online-voice experiment (in progress):** a transparent "extremely-online" voice variant for the FREE read; vector-gated slang (≤2 tokens earned by axis levels; `six-seven`/`rizzless` held). Slice 1 = the variant (default-off), Slice 2 = wire the 50/50 A/B. Detail: **spec §26**.
- **Fluid design system + transition polish (shipped, main `649cace`, 2026-06-23):** football (bright) + music (dark, drifts toward the leading archetype's hue) converged on ONE shared `FluidField` ambient-mesh primitive (`src/components/`); the share cards now match the quizzes (funnel cohesion). Dark↔bright "flash-bang" fixed via an eased `--app-bg` luminance floor + content cross-fade (native View Transitions rejected — not in stable React 19.2). Result reading computed in-process to dodge the SSR self-fetch HTML→JSON crash. Colour logic = analogous harmony / whole-field hue rotation per phase / silver for the `static` archetype / vignette depth; IP-safe geometric motifs (maple leaf · starburst · solar-ring). Detail: **spec §27**.
- **Algorithm overhaul — tracks A+B, spines, composed-identity matrix (shipped+pushed, main `c99b93a`, 2026-07-02):** centroid rebalance w/ regression gates (0 unreachable, ≤3.0x, named moderate types) · 20 hand-authored archetype spines (LAW/TELLS/REFRAME/SPLIT/CLOSER) surfaced free+paid · opt-in weighted answers (95/70/50, music only) · paid free-text C/A/N translator + verbatim receipts (§6-safe) · football↔music bridge · A1 paywall hook (deterministic floor + cached Haiku polish) · A2 `/fan-verdict` (31 players, shareable, attributed) · per-IP burst guard on the unbounded LLM routes · the {CORE}×{MODIFIER}×{TILT} matrix with composite-keyed narration (~250 cached reads cover all 3,456 combos; the shareable handle stays the core per decision B). Detail: **spec §28**.
- **Strategy pivot + funnel fix (2026-07-07):** traffic-constrained per the real funnel (n=29, spec §29); order = funnel fix ∥ WC-window seeding → launch blockers → KB seed (§30) → ecosystem fake-doors (§23.C gate). Shipped: the bridged 5-tap music quiz (progressive profiling via the authored WC→music prior; §6 intact; seeded axes disclosed), continuation CTA, paywall entry-path tagging. North-star tiebreaker recorded: prefer acquirability (traction · proprietary data · documented metrics · transferable ops · niche brand); diligence docs live in `docs/`. Detail: **spec §29–30**.
- **Taste-gym pivot — session zero (2026-07-11):** `restructuring_decision_memo_2026-07-11.md` (D1–D6, N1–N3) approved by owner and declared authoritative; CLAUDE.md restructured (Pivot of record + Legacy), no-DB rule sunset (memo §8.1), playback rule amended to PD/CC-only (§8.2), superseded spec sections stamped (§3, §12, §13, §13b, §14, §16, §20, §29). No product code this session. Next: v1 = Prestige-Bias Test (D3).
- **Prestige-Bias v1 build sprint (shipped+pushed, main `3a61332`→`1315e48`, 2026-07-12):** deterministic bias engine (signed sway toward labels, swapped-only sub-stats, edge-artifact-proof swayShare, strict share codec) · the 5-beat `/bias` flow (Hume frame → blind → bridge → labeled → reveal → MANDATORY debrief w/ swap disclosure) · stateless share loop (`/bias/result?b=&l=` + `/api/bias-card` recompute from raw ratings — unforgeable, N3) · ClipPlayer real-audio seam (PD/CC files per §8.2; load-failure keeps the rating gate locked). Zero LLM calls; item pool = placeholders pending the pool of record. Decisions: `docs/rt-answers-2026-07-11.md` (RT-1..8; **memo §9.7 RESOLVED** — /bias takes the homepage, redirects only); standing output convention `docs/redteam-protocol.md`; launch gates `docs/launch-checklist.md`. Detail: **spec §31**.

- **KPIs + passive discovery session (shipped, main `3189ac8`→`572ed96`, 2026-07-16):** executed `docs/next-session-brief-2026-07-16.md` in full. Slice A ops hardening — silent-analytics-no-op killed (`/api/health` env booleans, build-time ANALYTICS-DARK warning, dev banner); E2E QA: all 7 bias-funnel events verified firing in order; **RT-4 resolved: PostHog live in prod (key inlined, capture 200)**. Slices B+C (one-session timebox per PM-3a) — robots/sitemap/canonicals/metadataBase, default OG image (share cards verified unclobbered), JSON-LD (WebSite/Org/WebApplication/Article/FAQPage), `/learn` reading room (index + 7 static explainers: 5 criteria + prestige test + methodology), `llms.txt`+`llms-full.txt`; raw-HTML audit passed. Slice D — `docs/kpis.md` of record (**PM rulings 2026-07-17: 09-15 deadline confirmed (RT-1a); delicacy battery IN 09-15 scope (RT-2a)**), PostHog KPI-status + dataset-export scripts (loud-fail, dev-excluded, `data/` git-ignored). Slice E — `render-charts.mjs` wires every fillable write-up [CHART] slot (2 new chart scripts + pool-v3.json w/ vitest drift guard); engine package audited to ready-to-flip-public (`docs/engine-extraction-checklist.md`; publication stays owner-gated). Known issue queued: ClipPlayer setState-in-render console error (chip spawned). 932 tests green.

- **v1.1 control items + launch URLs + ring fix (2026-07-19):** PM rulings RT-1a (2 controls: backups b3+b1, already licensed/ear-passed), RT-2a (residual drift correction: adj = raw − d̄·(nUp−nDown)/n — never full subtraction), RT-3a (HN story URL clean; ?ref= on comment links only), RT-4b (repo name locked `sw4127/hume-taste-engine`; creation blocked by tool permission — PM runs `gh repo create hume-taste-engine --private`). Shipped: pool v4 (10 clips = 8 scored + 2 unlabeled controls; v3 links die gracefully) · engine controlDrift/rawPct/adjusted headline w/ 3 worked-example tests · control disclosure in debrief + methodology + /learn + llms.txt (N3, no silent machinery) · launch-kit URLs of record w/ per-channel ?ref (all 4 values verified landing; prod PostHog capture verified w/ ref=hn) · OG unfurls verified on /learn + /learn/methodology (absolute og:image 200) · ClipPlayer ring now tracks FULL clip w/ arming notch at true threshold position (two facts, two signals) — fixed replay-from-ended and ring-freeze-in-throttled-tabs found during verification; the queued setState-in-render console error is gone (bank() side effects moved out of the state updater). 944 tests green. Copy count updated everywhere (ten clips, ~5 min); kit copy revised per PM authorization.

## Legacy (superseded — kept for history)
*Everything below is superseded by the **Pivot of record (2026-07-11)** / `restructuring_decision_memo_2026-07-11.md`. Kept verbatim per the keep-intact rule; do not build from these.*

### [Legacy] What we're building
A lightweight, low-maintenance, revenue-generating web app called **Vibe Check** (working name): a music-taste personality reader. A tap quiz (+ optional free-text) produces a free, shareable "Vibe Check" card; a $2.99 Stripe unlock reveals a structured premium report. **The full product spec, system prompt, quiz, and positioning live in `vibe_check_mvp_spec.md` — read it before proposing anything.**

### [Legacy] Build sequence
- **Stage 1 (now):** build the reusable input → scoring engine → shareable-card pipeline, shipped first as the **World Cup player-match** ("Which World Cup player matches your vibe?") to test the share loop. Cap ~1 week. Player profiles = playing-style only; no photos/badges; roast the user, never the player.
- **Stage 2:** the core music product + premium report + Stripe paywall, reusing the Stage 1 engine.

### [Legacy] Recalibration — revenue-first (superseded 2026-07-11; was: "supersedes Build sequence + the $2.99 mentions")
- **One integrated product; Stage 2 (the paid core) is the PRIORITY.** The World Cup card is the free viral FRONT-DOOR that funnels into the paid music report — not a standalone launch. We ship ONE product during the tournament window where every shared card points at something that can take money.
- **Funnel:** free WC/vibe card (spreads) → "want the full read on what your taste reveals?" → premium report unlock.
- **Acquisition:** the organic share loop is our ONLY channel (paid ads are dead at this price point).
- **Pricing:** the unlock is **$3.99 (launch; A/B vs $4.99)** — see spec §13. The "$2.99" in §"What we're building" and §Stack above is superseded.
- **Free-tier model + cost:** free/WC narration runs on **Haiku + aggressive caching** — the tap-only quiz has a finite verdict space, so generate each narration once, cache by input hash, serve it statically → free-tier API cost ≈ $0. The **stronger model (Sonnet/Opus) is reserved for the PAID report.** Supersedes any "free tier on Sonnet" note in the spec.
- **Build order:** PAID path first (premium report + paywall + webview-survivable Stripe Link checkout + blurred-preview firewall), then the free top-of-funnel that feeds it (music quiz → deterministic engine → free card → share loop), reusing the Stage-1 @vercel/og card + engine.
