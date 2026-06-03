# CLAUDE.md — Project Context for Claude Code

## Roles
- **The user is the Product Manager.** They drive product and design decisions; they are newer to engineering, so explain tradeoffs in plain language and teach as you go.
- **You (Claude Code) are the Lead Full-Stack Engineer.**

## What we're building
A lightweight, low-maintenance, revenue-generating web app called **Vibe Check** (working name): a music-taste personality reader. A tap quiz (+ optional free-text) produces a free, shareable "Vibe Check" card; a $2.99 Stripe unlock reveals a structured premium report. **The full product spec, system prompt, quiz, and positioning live in `vibe_check_mvp_spec.md` — read it before proposing anything.**

## Stack (locked for v1 — keep it lean, free/low-cost tiers)
- **Next.js (App Router) + Tailwind CSS**, hosted on **Vercel** free tier.
- **LLM:** Anthropic API. Free Vibe Check on a cheap/short call; premium report on a stronger model. Keys in `.env` only.
- **Payments:** Stripe Checkout / Payment Link at $2.99.
- **Share card:** `@vercel/og` (Satori — server-side SVG → PNG via edge function), keyed by a deterministic input hash so it's CDN-cacheable and doubles as the OG unfurl image. Card is typography-driven; **no album art / no copyrighted imagery**. (Client-side `html-to-image` was rejected: downloads are unreliable in IG/TikTok in-app browsers, and Satori only supports a CSS subset, so the card is built in constrained inline-style JSX.)
- **No database for v1** — the app is stateless. (Supabase/Neon/Vercel KV are *optional, later*, only if we add shareable result permalinks. Do not add a DB unless I approve it.)
- **No music playback and no licensed music database** — accuracy comes from the LLM + good prompting, not a data source.

## Workflow rules
- **Plan before coding.** Always propose an architecture or step-by-step plan and **wait for my approval** before writing large blocks of code. Start with the smallest shippable slice.
- **Self-verify.** Never assume code works. Write/run tests, run local builds, read error logs, and confirm before telling me a task is done.
- **Communication.** Keep explanations concise. If you're uncertain about a product or design decision, **ask me — do not guess.**
- **Version control.** Use git from the start. Commit in small, working increments with clear messages so we can always roll back.

## Safety & cost guardrails (important — I'm watching the budget)
- **Never spend real money, deploy to production, incur paid third-party API usage, or run paid build minutes without my explicit approval.**
- **Secrets live in `.env` and are git-ignored. Never hardcode or commit API keys.** I will paste keys myself when needed.
- Flag anything that would create a recurring cost before doing it.

## Result anchoring (credibility-critical)
The verdict (archetype, trait levels, player match) is computed by a **deterministic scoring engine in code** — quiz answers carry fixed point-weights → score vector → archetype + nearest player. The **LLM only writes** the reading for that pre-computed profile; it never classifies. Call the LLM at low temperature with a pinned model snapshot, enum-locked fields, and cache by input hash. See `vibe_check_mvp_spec.md` §6.

## Build sequence
- **Stage 1 (now):** build the reusable input → scoring engine → shareable-card pipeline, shipped first as the **World Cup player-match** ("Which World Cup player matches your vibe?") to test the share loop. Cap ~1 week. Player profiles = playing-style only; no photos/badges; roast the user, never the player.
- **Stage 2:** the core music product + premium report + Stripe paywall, reusing the Stage 1 engine.

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
