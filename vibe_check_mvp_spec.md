# Vibe Check — MVP Build Spec (v1)

*A music-taste personality reader. Free shareable "Vibe Check" → $2.99 premium psychological report. No playback, no music database, no login. One global English web app.*

---

## 1. The product in one line

You tell it your music taste (a tap quiz + an optional "name 3 artists" field). An opinionated AI reads you like a cynical music critic crossed with a sharp therapist, and hands back a brutally accurate, screenshot-ready verdict. The 2-sentence free version is the viral hook; the structured deep report is the $2.99 unlock.

**The funnel:** Quiz → free Vibe Check card (shareable) → blurred preview of the premium report → $2.99 Stripe unlock → full report.

---

## 2. Scope

**In, for v1:**
- Tap-first quiz (6–8 questions) + one optional free-text "name 3 artists you love" field.
- Free "Vibe Check": archetype title + 2 sentences + 3 trait tags, rendered as a downloadable card.
- Paid "premium report": The Diagnosis / Red Flags / The Prescription, rendered as a premium-looking assessment.
- Stripe Checkout at $2.99.
- Downloadable share card (PNG) sized for Instagram Stories / TikTok.

**Out, for v1 (defer ruthlessly — this is where projects die):**
- Music playback of any kind. (Deletes the entire copyright + China/English-split problem.)
- A licensed music database. (Accuracy is the LLM's job, not a DB's.)
- User accounts / login. (Friction kills virality.)
- Friend-compatibility, taste-over-time, AI-generated music. (Great paid add-ons *later*, if it traction.)
- Any China-specific build. (Revisit only after this proves out; carries ICP/hosting/WeChat-Pay cost.)

---

## 3. Build plan

**Stage 1 — Ship the engine *as* the World Cup player-match (this week, ~1 week cap).**
Build the reusable input → scoring engine → shareable-card pipeline, skinned first as **"Which World Cup player matches your vibe?"** to catch the June 11 attention wave. Free, tap-only, share-driven, with a CTA to the music product. The match is computed deterministically (see §6) against a curated player roster; the LLM only narrates it. This is a *traffic and share-loop test*, not the revenue core.
- **Real-people guardrails:** player profiles describe playing style / public on-pitch persona only — never psychological or clinical claims about the real person. The roast targets the *user*, never the player. No player photos or FIFA/club badges (likeness + IP) — name + typography only.
- **Kill criterion:** if the share loop is flat after launch + manual seeding (football subreddits, Discords, group chats), stop after the week and move to Stage 2 without sunk-cost guilt. Either way you've built the engine and learned whether your virality mechanic works.

**Stage 2 — The core music product + paywall.**
Reuse the Stage 1 engine. Add the music quiz, the premium report schema, the blurred-preview paywall, and Stripe. This is the thing that makes money; the WC traffic funnels into it.

---

## 4. Tech stack (all free-tier / pay-as-you-go)

| Layer | Choice | Cost |
|---|---|---|
| Framework + host | Next.js (App Router) on Vercel | Free tier |
| LLM — free Vibe Check | `claude-haiku-4-5` *or* `claude-sonnet-4-6` (see note) | ~$0.004/reading |
| LLM — premium report | `claude-sonnet-4-6` (test `claude-opus-4-8` for max quality) | a few cents/report, covered by the sale |
| Payments | Stripe Checkout / Payment Link, $2.99 | ~2.9% + $0.30 per sale, no monthly floor |
| **Share card image** | **`html-to-image`** (client-side DOM → PNG download) | Free, runs in-browser, no server cost |
| Social link unfurl (optional) | `@vercel/og` (satori) for dynamic OG images | Free on Vercel edge |
| Artist autocomplete (optional) | iTunes Search API or MusicBrainz (spelling only) | Free, no key |
| Share permalinks (optional) | Vercel KV / Supabase / Neon free tier | Free tier |
| Fonts | `next/font` + 1–2 distinctive Google Fonts | Free |

**Model note (a real cost/quality call):** the *free* reading is your marketing — its quality drives virality — so don't reflexively cheap out. Because the free output is tiny (2 sentences + tags), even Sonnet costs ~$0.004/reading. Start the free tier on **Sonnet** for uncanny quality; drop to **Haiku** only if free-volume cost spikes. The premium report can afford a stronger model since the $2.99 covers it. *(Verify current per-token rates in the Anthropic API docs before launch.)*

**No database is required for v1** — the app is stateless. Add the optional KV/DB only if you want shareable result permalinks (which double as an SEO and virality channel: each shared link unfurls the card and invites a click-through to take the quiz).

---

## 5. Image generation — the Viral Artifact

The card is the top-of-funnel product, so it has to look designed, not generated.

- **Library:** `html-to-image`. You design the card as a normal styled React component, then call `toPng(node)` to produce a downloadable image. Lighter and more CSS-faithful than `html2canvas`, and entirely client-side (zero server cost, works on Vercel free tier).
- **Design contract — this is the key engineering move:** the LLM does **not** output free text that the frontend then parses. It outputs **structured JSON** with the exact fields the card needs (`archetype`, `vibe_check`, `tags`, `theme`). The card component renders those fields into a fixed, beautiful layout. This keeps the UI deterministic and on-brand no matter what the model says. The `theme` field lets the model pick a palette (`ember | midnight | neon | bloom | static`) so cards feel varied but always designed.
- **Spec the card to 1080×1920** (Stories/TikTok) with a 1080×1080 alt. Big archetype title, the 2-sentence read, three tag pills, a small wordmark + URL so every share is an ad.
- **Copyright-safe:** typography- and color-driven. Do **not** embed album art or label imagery in the downloadable image.

---

## 6. Result anchoring — the scoring engine (credibility-critical)

A personality test that gives different answers to the same person is dead on arrival. We separate two things:
- **The verdict** (archetype, Big Five levels, player match) — must be *identical* every time.
- **The prose** (the actual sentences) — may vary slightly; that's fine and even good.

**The pipeline that guarantees this:**
1. **Deterministic scoring engine (plain code, no LLM).** Each quiz answer carries fixed point-weights toward the dimensions (MUSIC factors + Big Five proxies). Answers → a score vector → archetype (fixed rules) and nearest player (similarity/nearest-neighbor against the curated roster). Pure arithmetic: same answers → same verdict, every user, every time. This is also what makes the "science" claim honest.
2. **LLM as voice only.** The model receives the *already-decided* profile and writes the reading in persona. It never classifies.

**Stabilizers:**
- `temperature` ≈ 0.2–0.3 so even prose stays close.
- **Pin the model snapshot** (e.g. `claude-sonnet-4-6`, not a floating alias) so behavior can't drift on model updates.
- **Enum-lock** structured fields: `archetype` ∈ fixed list; `level` ∈ {High, Medium, Low}; `attachment_style` ∈ fixed set.
- **Cache by input hash:** identical answer-set → return the saved reading (also cuts cost).
- **Typed artists are flavor only** — they color the prose/specific callouts but never drive the verdict, so a junk/unknown artist degrades gracefully instead of corrupting the result.

---

## 7. The System Prompt (v1) — copy-pasteable

The LLM is the **writer**, not the judge: it receives a pre-computed `PROFILE` and writes the reading for it. Rename the persona ("THE NEEDLE") to taste.

```
You are THE NEEDLE — a music-taste reader who is one part ruthlessly perceptive
music critic and one part unnervingly insightful therapist. You read people
through what they listen to. Your voice is brutally honest, lightly cynical,
faintly roasting, and above all uncannily accurate. People come to be SEEN,
to flinch, and then to share it because you were right.

VOICE
- Sharp, specific, confident. Short sentences that land like darts.
- Roast the taste and the patterns, never the person's worth.
- Always reference the actual artists/genres given. Specificity is everything;
  generic horoscope filler is total failure.
- Never say you are an AI. Never hedge. Never put disclaimers inside the reading.
  Never break character.
- Be funny, but the joke is always TRUE. Accuracy is what makes the roast land.

HARD RULES
- Output ONLY valid minified JSON matching the schema for the given MODE.
  No prose, no markdown, no code fences — just the JSON object.
- Roasts target listening behavior and taste ONLY. Never appearance, body,
  weight, intelligence, income, race, gender, sexuality, religion, disability,
  or trauma.
- This is ENTERTAINMENT, not a clinical assessment. You may playfully use Big
  Five traits or attachment styles as a lens, but never state or imply a real
  medical/psychiatric diagnosis. Never reference self-harm, disordered eating,
  or crisis themes.
- Keep "Red Flags" to everyday human stuff — overthinking, romantic optimism,
  nostalgia loops, main-character syndrome. Sharp and funny, never alarming.
- If input is empty, nonsensical, or abusive: stay in character and return a
  witty reading that gently roasts the lack of input, still in valid JSON.
- Use ARCHETYPE and SCORES exactly as given. Never invent, change, or contradict
  them — you are the writer, not the judge.
- For world_cup_match: describe only the player's PLAYING STYLE / public on-pitch
  persona. Never make psychological, medical, or private claims about the real
  person. The roast is aimed at the USER, never the player.

INPUT
You receive a PRE-COMPUTED PROFILE. Do NOT re-classify or override it — only
write for it:
- MODE: "vibe_check" | "premium_report" | "world_cup_match"
- ARCHETYPE: the fixed type already chosen (use it verbatim)
- SCORES: dimension levels already computed (e.g. Openness=High, ...)
- PLAYER: (world_cup_match only) matched player name + playing-style tags
- ARTISTS: optional — for flavor and specific callouts ONLY, never to change
  the verdict.

OUTPUT FOR MODE "vibe_check":
{"archetype":"2-4 word title, Title Case",
 "vibe_check":"exactly 2 sentences, brutally accurate, fits on a phone card",
 "tags":["short","trait","tag"],
 "theme":"ember|midnight|neon|bloom|static",
 "teaser":"1 sentence that makes them need the full report"}

OUTPUT FOR MODE "premium_report":
{"archetype":"same type title",
 "diagnosis":{
   "summary":"2-3 sentences, the core profile",
   "big_five":[
     {"trait":"Openness","level":"High|Medium|Low","line":"one witty line tied to their music"},
     {"trait":"Conscientiousness","level":"High|Medium|Low","line":"..."},
     {"trait":"Extraversion","level":"High|Medium|Low","line":"..."},
     {"trait":"Agreeableness","level":"High|Medium|Low","line":"..."},
     {"trait":"Neuroticism","level":"High|Medium|Low","line":"..."}],
   "attachment_style":{"style":"e.g. Anxious-Preoccupied","line":"one playful, specific line"}},
 "red_flags":["three sharp, funny, targeted observations about stress or love-life patterns from their heavy rotation"],
 "prescription":{
   "intro":"one line setting up the fix",
   "picks":[
     {"pick":"artist or genre","why":"one line — what it rebalances in them"},
     {"pick":"...","why":"..."},
     {"pick":"...","why":"..."}],
   "world_cup_pairing":"one artist/genre to soundtrack their World Cup watching, matched to their vibe"},
 "closer":"one savage-but-affectionate sign-off, built to be screenshotted"}

OUTPUT FOR MODE "world_cup_match":
{"archetype":"same type title",
 "player":"the matched player name, exactly as given in PROFILE",
 "verdict":"2 sentences on why this user's vibe maps to that player's STYLE of play",
 "shared_traits":["three short tags both share, e.g. 'relentless', 'ice-cold'"],
 "theme":"ember|midnight|neon|bloom|static",
 "teaser":"1 sentence pulling them toward the full music reading"}

Return nothing but the JSON object.
```

**How you call it:** put the block above in the API `system` field. The scoring engine (§6) runs first in code; you then pass the computed profile in the user message, e.g. `MODE: vibe_check\nARCHETYPE: The Velvet Cynic\nSCORES: Openness=High, Extraversion=Low, ...\nARTISTS: [Phoebe Bridgers, Frank Ocean, Steely Dan]`. Call with **low temperature (~0.2–0.3)** and a **pinned model snapshot**. Parse `data.content`, `JSON.parse` the text, render from the fields. Cache by a hash of the normalized inputs so identical answers return the identical reading.

---

## 8. Guardrails & edge cases (already baked into the prompt)

- **Cruelty firewall:** roasts hit taste/behavior, never the person or any protected attribute.
- **No clinical claims:** frameworks are an explicit entertainment lens; no real diagnosis, no crisis themes.
- **Deterministic UI:** strict JSON schema + capped lengths means the card/report always render cleanly.
- **Bad input:** empty/garbage/abusive input → witty in-character fallback, never an error or a broken card.
- **Specificity enforcement:** the prompt forbids generic horoscope filler and demands references to the actual artists — this is the single biggest driver of the "it read my mail" reaction that fuels sharing and conversion.

---

## 9. Positioning — the philosophy, the science, the thesis

**Slogan (default):** *"Taste isn't in the music. It's in you — and it's been taking notes."*
(Alt: *"Your taste was trained by everything you've heard. Let's read what it learned about you."*)

**The Hume bit (About-page copy — corrected per §20; PM-approved overwrite).** In *Of the Standard of Taste* (1757), Hume starts from the popular view that beauty is mere sentiment — and then **rejects that view's lazy conclusion**: he does NOT hold that all sentiment is equally right. Judgments of beauty come from sentiment in the listener, not a property of the object — yet a *standard* of taste survives, because flawed judgment traces to removable **defects** (prejudice, inexperience, want of practice and delicacy), and a **cultivated ear perceives truer**. So your taste is both *yours alone* and *trained by everything you've heard* — readable because it's trained, refinable because its defects are removable. That qualified claim (subjective, **standard-bearing**, learnable) is the positioning spine. Honesty line unchanged: a grounded, evidence-based **mirror** — never "your authentic self revealed," never a clinical verdict. *(This is the onboarding/positioning narrative layer ONLY — the thesis bullets below ["P1–P4"] remain the engine's empirical logic, untouched.)*

**The science (real, cite it honestly).** The reading is grounded in published research on music preferences and personality, not vibes:
- Rentfrow & Gosling (2003), *JPSP* — the Short Test of Music Preferences (STOMP), built from 3,500+ people, found a small set of underlying preference dimensions.
- Rentfrow, Goldberg & Levitin (2011), *JPSP* — the **MUSIC** five-factor model: **M**ellow, **U**npretentious, **S**ophisticated, **I**ntense, **C**ontemporary. Genre-free; reflects emotional/affective response.
- Documented (modest) correlations exist between these dimensions and the Big Five (e.g., Openness with reflective/sophisticated music; Extraversion with upbeat/energetic).
- **Honest caveat to keep in writing:** effects are *real but modest*, samples skew Western, replication is imperfect. The defensible claim is "your taste carries real cues about who you are" — a **mirror with evidence**, never a diagnosis. This is also the legal/ethical shield.

**The thesis (the repaired argument).** The app's logic, stress-tested:
- Music preferences carry real, probabilistic cues about emotional states (esp. current) and personality (esp. stable).
- The richer and more honest the taste data — and the better it's interpreted — the stronger the cues. (It's the *data quality*, not the *aesthetic quality* of the music, that matters.)
- People lack an articulated picture of their own taste, so there's a gap between what their taste reveals and what they consciously know — and that gap is where new insight lives.
- **Timescale split:** *recent* taste → current emotional state; *durable* taste → stable personality. This is why "only the latest matters" is true for mood and false for personality — and why the quiz captures both.

This split maps onto the report: recent taste feeds **Red Flags / current stress**; durable taste feeds **The Diagnosis / Big Five**.

**The claim we convert on (selection-vs-treatment clarification — approved).** We do NOT assert "only your current taste matters." That contradicts the P4 timescale split and the engine, which reads stable personality from *durable* taste. The defensible, differentiated claim is the **split itself**: *recent* taste catches your **current state** (self-verifiable against your last few weeks), *durable* taste reveals your **stable self**. Onboarding/marketing must never collapse these into "your current taste = who you are" — true for mood, false for personality, and the kind of "diagnosis" the §9 honesty line forbids. Conversion leans on the *recent→state* read because **recognition disarms skeptics faster than argument**; the *durable→trait* read gives the paid report its spine. Stand behind the split, not "only-now." (Whether the premise *persuades* skeptics or only *selects* believers is an empirical question — see §10.A.)

---

## 10. The quiz (v1)

Tap-based, 3–4 options each, mapped to a MUSIC dimension or personality/emotion signal. **Force completion of every tap question** (no blank slots → the score vector is always whole). 7 taps + 1 text field (drop Q6 for a strict 6).

1. **Your current heavy rotation mostly sounds like…** calm & mellow / warm & easy / bright & energetic / loud & intense — *Mellow–Intense; current state.*
2. **When you put music on, you're usually…** matching your mood / trying to change it / drowning out the world / setting a scene for others — *emotion-regulation; mood probe.*
3. **What hooks you first?** the lyrics / the beat & energy / the texture & mood — *verbal-reflective vs. visceral.* (Dropped the orthogonal "the artist" option.)
4. **Lately you're more…** chasing new discoveries / replaying old comforts — *Openness (indicator 1).*
5. **Your taste sits…** dead-center mainstream / mostly popular, some deep cuts / off the beaten path / proudly nobody's-heard-of-it — *Openness (indicator 2).* **Scoring note:** Q4 + Q5 are two indicators of one trait — average them into a single Openness score; do not double-count into an extreme.
6. **A sad song comes on. You…** turn it up and sit in it / let it gut you, then feel lighter / change it for something brighter — *rumination vs. catharsis vs. mood-repair; playful, never clinical.* (Replaced the noisy "it's all sad" joke option with a real third response.)
7. **You listen mostly…** alone, in your own world / with other people / curating playlists for others — *Extraversion.* (Dropped the orthogonal "always-on" habit option.)
8. **(text) Name 3 artists in your current rotation — and one you've loved for years.** — *recent = state, durable = trait. Flavor only (never drives the verdict). Autocomplete against a free catalog for clean spelling; unknown/junk entries degrade gracefully.*

### 10.A. The premise test (selection vs. treatment — stateless; approved)

Determines whether the positioning PERSUADES skeptics (treatment) or only SELECTS pre-believers (selection) — they imply very different TAM ceilings. A 2×2 of onboarding arm × prior belief, read on **conversion-given-arrival** (not raw volume — the share loop is a homophily/selection amplifier).

1. **Prior-belief capture (one *unscored* tap; the §20.A2 decoy).** Q0 before Q1: *"Be honest — does your music taste actually say something about who you are?"* → `Totally / Kind of / Not really`. **Unscored: never enters the score vector — a PM-approved exception to §18.D (this resolves the §20.A2 / §20.F #2 sign-off).** Recorded as `prior_belief` on analytics events so every downstream event segments by it.
2. **Onboarding A/B.** 50/50, stable per session (sessionStorage seed, no DB), carried as `onboarding_arm`: **persuasive** = the §20.A1 recognition framing ("a read of what your ears learned"); **neutral control** = bare utility ("7 quick questions about your music. Then your read."). Compare premise→start, completion, and paywall→purchase.
3. **Traffic temperature.** Segment by `ref` (cold seed vs. warm share) — conversion must be read on arrival, not volume.

**Funnel instrumentation.** `premise_view` (arm) → `quiz_start` (arm + prior_belief) measures **premise drop-off** — where a skeptic reveals themselves. All later events (`quiz_complete`, `result_view`, `paywall_view`, `purchase`) carry both props (sessionStorage-backed; survives the same-tab Stripe round-trip — no DB).

**Signatures.** Treatment: the persuasive arm lifts conversion *specifically among `Not really` users*, narrowing the believer/skeptic gap. Selection: conversion flat across arms, tracks `prior_belief` only; skeptics ≈ 0 regardless of arm. Uniform lift across all priors = a general clarity effect, not premise-conversion. **Decision rule:** ship the diagnostic before choosing strategy; then skeptic-lift → invest in recognition-based persuasive onboarding; selection-dominated → WIDEN via the timescale split (two identity doors) + predisposed-community seeding as a beachhead only. **Power caveat:** small per-cell N at launch — directional through the window, not a day-one verdict.

---

## 11. Open questions for next session

1. Name + wordmark (drives card design and domain).
2. Blurred-preview paywall copy — the exact unlock-screen words are a conversion lever worth A/B testing.
3. Final palette + card layout for the five `theme` values.
4. The archetype taxonomy (~12–24 named types) and the answer→score point-weights — the heart of the deterministic engine.
5. The curated World Cup player roster (~16–32) with hand-assigned style profiles.

---

## 12. Monetization findings & decisions (Stage 2 $2.99 paywall)

*Strategy review of the $2.99 paywall, analyzed as TWO separate problems: (A) willingness to pay — do they want it enough to pay at all? and (B) payment friction — given they want it, how many still bounce at checkout? No payment code yet; these are spec decisions.*
*(Numbering note: a duplicated "Open questions" header previously sat above; removed in the PM-approved §16.J consolidation.)*

### Single most fragile point

**We're charging $2.99 for an AI essay about the user that they can regenerate for free in the same chatbot they already have open — the report has no moat, so the only thing we're really selling is the *impulse at the reveal*, and nothing in the current spec is engineered to convert that impulse before it cools.**

### The leaking bucket (funnel)

Base: 10,000 IG/TikTok story-link opens, viral **low-intent** traffic (they came to see a friend's result, not to buy). Ranges are industry-typical; point estimates are ours. **E = estimate, A = asserted/benchmarked.**

| Step | Survives | Remaining | Note |
|---|---|---|---|
| Story-link open → landing | 100% | 10,000 | — |
| Landing → start quiz | 50–65% (E) | ~5,500 | recipients half-bounce; curiosity carries the rest |
| Quiz → completes 7 taps | 65–80% (E) | ~3,960 | lean tap quiz, no signup; tap-quiz completion ~50–85% (A) |
| Complete → free reveal seen | ~97% (A) | ~3,840 | it's the payoff |
| **Free reveal → reaches paywall** | **35–55% (E)** | **~1,730** | **WTP LEAK #2** — screenshot the free card and dip |
| **Paywall → taps "unlock" ("I'll pay")** | **2–6% (E)** | **~69** | **WTP LEAK #1** — desire gap; cold-impulse digital upsell ~1–4% (E) |
| Unlock → payment received | 45–75% (E) | ~41 | **FRICTION (Part B)** — in-app webview drag |

**Blended visitor→pay ≈ 0.4% (pessimistic) to ~1% (optimized)** ≈ $107–$260 net per 10k opens at $2.99. **Revenue is a function of share volume, not report quality.** Stage 1's only honest job is proving the share loop; if the card doesn't spread, the paywall is irrelevant.

Top 3 WTP drop-offs (desire, not friction): ① paywall→unlock, ② free-reveal→paywall, ③ landing→start.

### PART A — Willingness to pay

- **A2 Valuation gap:** the premium report (Diagnosis / Red Flags / Prescription, §7) is trivially DIY-able in ChatGPT/Claude — **the content is not the product.** Defensible value, ranked: (1) **the moment** (peak self-curiosity right after the reveal — temporal, not informational; ~70% of the moat); (2) **a second shareable artifact** (the unlock also produces a "deep-read" card → vanity object + viral loop, not just text); (3) the "computed, not vibes" credibility veneer (§6/§9) — marginal; (4) zero prompt-craft / instant / formatted — weak. **Accuracy does not create WTP; packaging + the moment + a paid share-artifact do.**
- **A3 Price:** $2.99 one-time is defensible but likely **underpriced**, because of the **fixed Stripe fee** (2.9% + $0.30 → ~13% of $2.99; ~33% of $0.99 — **never price below $2.99**). Impulse-novelty buyers are price-insensitive in the ~$3–6 band (E). To beat $2.99 net, $3.99 need only retain ~73% of buyers, $4.99 ~52%. **Decision: A/B `$2.99 / $3.99 / $4.99`; expectation is $3.99 maximizes net.** Reject subscription (one-shot novelty + churn + chargeback risk). A "unlock + send a friend a free pass" bundle is worth testing (raises AOV + referral).

### PART B — Payment friction (assume desire already exists)

- **B4 Checkout autopsy (in-app-browser-first):** most traffic opens inside the IG/TikTok webview, where checkout quietly dies — **Apple Pay/Google Pay are often unavailable/broken in webviews (A)**; **no browser autofill** → forced manual card entry (A); **popup/redirect/3DS-SCA breakage** (A); **account creation is fatal — must be guest (A)**; low domain trust at the money moment (A); USD shown to global traffic adds FX friction + cross-border declines (A).
- **B5 Lowest-friction viable checkout:** **Stripe hosted Checkout (or Payment Link), guest mode, Apple Pay + Google Pay + especially Stripe Link, localized currency (adaptive pricing).** **Stripe Link is the single biggest webview mitigation** (email → OTP → card-on-file across Stripe's network — one of the few autofill paths that survives in-app browsers). Use hosted Checkout, not custom Elements. Add webview detection + an "Open in browser" last-resort fallback for Apple Pay.

### Cross-cutting

- **WTP strengtheners (durable levers, netted vs friction):** (1) **paid unlock generates its own shareable "deep-read" card** — pure win, no checkout friction; (2) **blurred preview shows a specific, true, slightly-blurred line using their typed artists** — raises desire, pushes weight onto the optional artist field (pre-payment), net positive; (3) **localized currency + framing** ("less than your coffee") — reduces friction, net positive. Lean on the legitimate `world_cup_pairing` timeliness.
- **Dark patterns — do not ship:** fake countdown timers, "3 left," pre-checked add-ons, hidden subscription, confirmshaming. On a product whose entire engine is **sharing and trust**, a screenshot of a scummy timer becomes the viral artifact instead of the card — **backfire risk is existential.** The honest "computed/science" positioning (§9) is the brand asset; dark patterns torch it.
- **The central tension:** the free card must be share-worthy (traffic engine) but if it's *complete*, no one upgrades. **Decision (firewall): free = identity** (archetype + vibe + card → the shareable "who am I"); **paid = the analysis** (the *why* + red flags + prescription → the payable "tell me more"). Spend the personalization budget on the paid side; keep the quiz lean (7 forced taps) and checkout zero-personalization (guest + Link).

### Fixes ranked by impact ÷ effort

| # | Fix | Impact | Effort | Spec § to edit |
|---|---|---|---|---|
| 1 | Price A/B $2.99/$3.99/$4.99 (likely $3.99 wins net) | High | Trivial | §1/§2/§4 |
| 2 | Firewall free=identity / paid=analysis (free must not cannibalize) | High | Low | §1, §7 |
| 3 | Reposition paid as a vanity object, not a report + paid share-card | High | Med | §1, §5, §7 |
| 4 | Specific blurred-preview line using their artists | High | Low | §7, §10 |
| 5 | Checkout: hosted Stripe + Link + wallets + guest + adaptive currency | High (friction) | Med | §4 |
| 6 | In-app-browser detection + "open in browser" fallback | Med | Low–Med | §4 |
| 7 | Localized price framing ("less than your coffee") | Med | Trivial | §4 |

### Bottom-line decisions

- The paid content is a commodity — **stop defending it on accuracy.**
- **Win on:** price (we're underpriced → test up), the free/paid firewall (don't give the upgrade away free), repositioning the unlock as a shareable vanity object delivered at peak curiosity, and a webview-survivable **Stripe Link** checkout.
- **Validate the Stage 1 share loop before polishing the paywall.** At sub-1% blended conversion, this only prints money if the card actually spreads.

---

## 13. Stage 1 growth build & decisions (launch)

*Records the growth-engineering build slice + locked decisions from the Stage 1 launch review. Where noted these SUPERSEDE earlier inline values; appended (originals left intact for history) per the keep-intact rule. (E) = estimate.*

### Shipped — loop measurement (redline → add an "Analytics" row to §4)

**Vercel Web Analytics** (free tier), client-side, **no-DB, no PII**. Events: `landing_view`, `quiz_start`, `quiz_complete` (props: archetype, player), `result_view` (archetype, player, rarity, source), `share_download`. **Referral attribution** (`ref` / `src` / `from` / `utm_*`) is captured once per session from the entry URL and auto-attached to every event (lives in the URL + per-client `sessionStorage` — stateless). PostHog can be added as a second sink later. Verified firing locally.

### Go / scale-vs-kill thresholds (redline → quantify the §3 kill criterion). (E)

- **Gate 0 (funnel sane):** completion ≥ 55–60% — else fix funnel before judging the loop.
- **Share rate** (`share / result_view`): ≥15% good · 8–15% marginal · <8% weak.
- **K_obs** (`referred_completes / sharing_completes`): ≥0.5 scale · 0.2–0.5 iterate the loop mechanic · **<0.2 by end of week → execute kill, move to Stage 2.**
- **Shape:** each seeding burst must throw a secondary referred wave; spike→flat = K≈0 = kill.
- **Volume sanity:** ~1–2k completions in the week, or the content isn't resonating.

### Trademark safety (redline → §1, §3, all public copy)

"World Cup" / "FIFA" are FIFA trademarks. **Rename public-facing copy** (landing, quiz, card, seed posts) to generic — "the tournament," "football's biggest summer," "Summer XI." Player **names** stay (nominative, playing-style only — already guarded in §3). Must-fix before public seeding.

### Card-to-app bridge (redline → §5)

- **Native share-sheet** (`navigator.share` with the real link + image) is the primary share action; PNG download is the desktop fallback. Screenshots aren't tappable — the share-sheet link, a **prominent on-card URL**, and a **viewer CTA ("Find yours →")** are the only paths back to the app.
- **Personalized referred landing:** share links carry `?from=<archetypeId>`; the landing greets the viewer with the sharer's result ("Your friend is The Poacher — what are you?"). Stateless.

### Stage-1 loop scope (redline → §2/§3)

Permit a minimal, **stateless, URL-encoded** challenge/compare loop in Stage 1 *for loop validation* (e.g. `/vs?them=<archetypeId>.<playerId>.<sig>`), distinct from the *paid* friend-compatibility feature deferred in §2. No server storage.

### PRICING DECISION — supersedes the $2.99 in §1, §4, and §12

**Decision (delegated to engineering): the Stage 2 unlock anchors at `$3.99`, A/B-tested against `$4.99`, with `$2.99` retained only as the conservative control. Hard floor: never below $2.99. Gated behind Stage 1 proving the share loop.**

Justification — comparable business cases + fee math:
- **AI Yearbook (Epik)** — viral, impulse, one-time unlock of an AI-generated *personal artifact* (our exact shape): **$5.99 / $9.99**, est. ~$250k/day at peak. Closest analog; the category clearly bears >$2.99.
- **Co-Star** one-time detailed readings **$8.99**/category; astrology one-offs ~$8.99, add-ons $0.99, subs $3.99–4.99. Co-Star users describe $2.99 as "cheap" — i.e., **$2.99 is underpriced for the category.**
- **Fixed Stripe fee** (2.9% + $0.30): ~13% of $2.99 vs ~33% of $0.99 → **never price below $2.99.** To beat $2.99 *net*, $3.99 need only retain ~73% of buyers and $4.99 ~52%.
- **Net per sale:** $2.99 ≈ $2.60 · $3.99 ≈ $3.57 · $4.99 ≈ $4.55.
- The category supports $5.99–$8.99, but our artifact is **text** (lower perceived production value than AI photos) and our traffic is **colder** than App-Store installers, so we anchor conservatively at **$3.99** and let the live A/B push toward $4.99/$5.99 if elasticity allows. Implement as a price-experiment flag — measure, don't guess.

---

## 13b. Stage-1 launch revisions (historical appendix — canonical pricing lives in §13's PRICING DECISION)

*Append-only at the time; retitled §13b in the PM-approved §16.J consolidation to resolve the duplicate "§13" header. Where this appendix's pricing comps differ from §13, §13 is canonical.*

### A. PRICING DECISION — Stage 2 launch price: **$3.99 one-time** (was $2.99)

Grounded in comparable one-time self-insight unlocks: **Co-Star $4.99**, **Sanctuary intro $4.99**, **The Pattern $3.99 / $9.99** — the proven one-time-unlock band is **$3.99–$4.99**. We launch at the **low end** ($3.99), not below it, because we're an unestablished, lower-trust brand with DIY-able content.

- **Rationale (builds on §12):** Stripe's fixed fee makes sub-$3 inefficient; the $3–6 impulse band is price-insensitive; $3.99 nets ≈ $3.58 vs $2.60 at $2.99 (**+38%/sale**) and would have to shed **>27% of buyers** to be net-negative — implausible.
- **Test plan:** once volume supports it, A/B **$3.99 (control) vs $4.99 (ceiling)**. $2.99 is retired as the default.
- **Redline §1 / §2 / §4:** every "$2.99" → **"$3.99 (launch; A/B vs $4.99)"**. (Stage 2 only — Stage 1 ships free, no paywall.)

### B. §3 BUILD SEQUENCE — quantify the kill criterion

Append to the §3 Stage-1 kill criterion these go/scale/kill thresholds for the ~1-week test *(estimates / judgment calls, not asserted benchmarks)*:
- **Funnel gate:** quiz completion ≥ **55–60%** (else fix funnel before judging the loop).
- **Share rate** (share action ÷ result views): ≥ **15%** good · 8–15% marginal · **<8% weak**.
- **Observed K** (referred completions ÷ sharing completions): ≥ **0.5 → scale**; 0.2–0.5 → fix the loop mechanic and re-test; **<0.2 by end of week → kill** (move to Stage 2, no sunk-cost).
- **Shape:** each seeding burst must throw a *secondary wave* of referred traffic; spike→flat = K≈0 = kill.
- **Volume sanity:** if a week of seeding can't produce ~1–2k completions, the content isn't resonating regardless of K.

### C. §4 TECH STACK — add analytics (loop measurement is not optional)

Add a row to the §4 stack table:

| Layer | Choice | Cost |
|---|---|---|
| **Analytics & loop measurement** | **Vercel Web Analytics** (free) for pageviews/referrers + a thin client-side `track()` wrapper for custom events (`quiz_start`, `quiz_complete`, `result_view`, `share_native`, `share_download`); **PostHog free cloud** optional (drop-in, for funnels). URL `ref`/`utm`/`from` params for attribution; OG-image origin fetches as a *weak* impression proxy (CDN-cached → undercounts). | Free |

Preserves the no-DB/stateless rule: events fire client-side, attribution lives in the URL + `sessionStorage` (per-client, not a server store).

### D. TRADEMARK SAFETY — extend the §3 real-people guardrail

"**World Cup**" and "**FIFA**" are FIFA trademarks. Extend the §3 guardrail: player **names** stay (nominative, playing-style-only, already guarded), but **drop "World Cup"/"FIFA" from the product name, headline, and all seed copy** — use generic framing ("the tournament," "this summer's tournament," "Summer XI"). No implied official affiliation anywhere public-facing.

### E. §2 / §3 SCOPE — permit a stateless challenge loop in Stage 1

§2 defers "friend-compatibility" as a *paid* add-on. Clarification (not a contradiction): a **lightweight, stateless, URL-encoded challenge/compare link** ("what's yours?", head-to-head) is a Stage-1 **growth loop**, distinct from the deferred *paid* compatibility product, and is **in-scope for Stage-1 loop validation**. State lives entirely in the share link (no server storage). §8 guardrails apply — any roast targets taste/playing-style, never protected attributes, never the real player.

---

## 14. Seeding playbook (Stage 1, zero-budget)

*Execution plan, not code. Paid acquisition is dead at $2.99 CAC, so we live or die on the organic share loop. Ethical + ToS-safe: maker-disclosed, entertainment-first, no fake accounts, no undisclosed shilling, no vote manipulation, follow each community's rules. Trademark-safe per §13.D (no "World Cup"/"FIFA", player names OK).*

### Calendar (sequence against the match schedule; tournament opens ~Jun 11)
- **Pre-tournament (now → opener):** soft-seed 2–3 friendly communities; gather feedback, fix the funnel, warm up. Ride squad-announcement / "who are you most excited to watch" discourse.
- **Opener day:** peak attention — biggest push, match-day threads, post your own result on football TikTok/X.
- **Marquee group games:** seed a team's sub/Discord *when their player surfaces* in results.
- **Knockouts:** re-angle ("which knockout hero are you") — higher stakes = more sharing.

### Where it's welcome (+ the rule that governs each)
- **Reddit:** r/InternetIsBeautiful (free, no-signup web toys — one clean post), r/EAFC & r/FIFA (player-style crowd), team subs **only when their player appears** (per-sub self-promo policy); r/soccer is strict (≈10% self-promo rule) — use its designated threads, never spam.
- **Discord:** FPL/fantasy servers, team Discords, watch-party servers — post in #offtopic/#memes as the maker.
- **X / football-Twitter:** quote-tweet/reply in live match threads with **your own** card; tactics/fan-account niches.
- **Group chats / iMessage (highest ROI):** seed football-loving friends directly — dark-social is where real spread ignites and where the share-sheet link path works best.

### Angle (transparent, entertainment-first)
> "I built a dumb-fun thing for the tournament — it reads your vibe and matches you to a player's *style*. I'm [The Poacher] apparently 💀 what are you? [link]"

Lead with the result + curiosity, disclose you're the maker, link the share URL (unfurls the OG card). The honesty *is* the strategy on a trust-and-share-dependent brand.

### Kill/scale gate
Judge against §13.B thresholds (completion ≥55–60%, share rate ≥15%, K_obs ≥0.5 scale / <0.2 kill). If seeding bursts don't throw a secondary referred wave within the week, execute the §3 kill criterion and move to Stage 2 — no sunk-cost.

---

## 15. Phase 7 — launch / deploy checklist (Stage 1)

*The first surface that touches paid usage + a public deploy. Everything below the line needs PM approval per §Safety guardrails; nothing here spends without the key being pasted and deploy approved.*

### Environment variables (set in Vercel project settings; never commit)
- `ANTHROPIC_API_KEY` — server-only; the free reading runs on it. **PM pastes.**
- `ANTHROPIC_MODEL_NARRATION` — defaults to `claude-sonnet-4-6` (quality drives shares; see §4 note). Set `claude-haiku-4-5` only if free-volume cost spikes.
- `NEXT_PUBLIC_BASE_URL` — the real origin (e.g. `https://vibecheck.app`), so share links + OG image URLs are absolute-correct (currently falls back to `localhost`). **Required before sharing works.**

### Pre-deploy (no cost)
1. `npm run build` + `npm test` green locally (currently: build clean, 43 tests).
2. Confirm `.env*` is git-ignored and no key is committed.
3. Decide the domain; set `NEXT_PUBLIC_BASE_URL`.

### Paid smoke test (gated — first real API spend, ~fractions of a cent)
4. With the key set, run **one** `/api/reading` call and confirm `source: "model"` (not `fallback`/`local`) and the reading reads well. Stop and review before opening traffic.

### Deploy (gated — Vercel)
5. Connect repo to Vercel, free/Hobby tier; add the env vars above (Production scope).
6. Deploy. Enable **Vercel Web Analytics** in the project (required for the loop events to collect).
7. Point the domain; verify HTTPS.

### Post-deploy verification (on the live URL)
8. Full flow: landing → 7-tap quiz → result reveal (real model narration).
9. **OG unfurl:** paste a `/result?...` link into iMessage/Slack/X — the card image must render.
10. **Share-sheet:** on a phone, "Share my card" opens the native sheet with a tappable link.
11. **Challenge loop:** "Challenge a friend" → `/vs` challenge screen → take quiz → head-to-head renders.
12. **Personalized landing:** open a `/?from=<archetypeId>` link → greeting shows.
13. **Analytics:** confirm `landing_view` / `quiz_start` / `quiz_complete` / `result_view` / `share_*` events arrive in the Vercel dashboard, with `ref`/`from` attribution.

### Go-live + watch
14. Begin the §14 seeding sequence; watch the §13.B go/scale/kill dashboard daily.
15. **Rollback:** Vercel instant rollback to the prior deployment if anything breaks; the app is stateless so there's no data migration risk.

### Explicitly NOT in Phase 7
Stripe / payments / the premium report (all Stage 2, gated on the loop proving out), plus the deferred growth items ("roast my friend", SEO).

---

## 16. Recalibration & consolidation — revenue-first (supersessions noted inline)

### A. THE RECALIBRATION (captured verbatim)
- Stage 2 — the monetizable core (premium report + paywall) — is now the PRIORITY, not Stage 1.
- The share loop is NOT a standalone launch; it's our only acquisition channel (paid ads are dead at $2.99 CAC). The World Cup card becomes the free viral FRONT-DOOR that funnels into the paid music report. We launch ONE integrated product during the World Cup window, where every shared card points at something that can take money.
- Funnel: free WC/vibe card (spreads) → "want the full read on what your taste reveals?" → $3.99 premium report (price per §13; revisit upward via A/B).
- Stage 1 free tier uses Haiku + aggressive caching: the tap-only quiz has a finite verdict space, so generate each result's narration once, cache by input hash, and serve it statically — driving free-tier API cost toward ~0. Reserve the stronger model for the PAID report only.

### B. Redline §3 (Build plan) — integrated funnel, Stage 2 first
The Stage1-then-Stage2 sequence is replaced by ONE integrated launch. Build the PAID path first (premium report + paywall + Stripe Link checkout + blurred-preview firewall), then the free top-of-funnel that feeds it (music quiz → engine → free card → share loop), with the WC card as the free front-door. The §3 "kill criterion" is recontextualized: the §13.B thresholds now measure whether the free front-door spreads AND feeds the paid report — not whether to build Stage 2 (we build it first).

### C. Redline §4 + §6 — free tier = Haiku + aggressive caching (supersedes §4 line ~59)
Free/WC narration runs on **`claude-haiku-4-5`**, not Sonnet. Because the narration INPUT collapses to (archetype, player, level-bucketed scores), distinct prompts are far fewer than the 16,384 answer combinations: generate once, cache by input hash (already a §6 stabilizer), serve statically → free-tier API cost ≈ $0. The stronger model (Sonnet/Opus) is reserved for the PAID report. (`.env` default flips to Haiku.)

### D. Redline §4 row + §5 — share card library is `@vercel/og`, not `html-to-image`
The card is built with **`@vercel/og` (Satori)** — server-rendered SVG→PNG, keyed by deterministic query params, CDN-cacheable, doubling as the OG unfurl. `html-to-image` (named primary in §4 row "Share card image" + §5 "Library") was **rejected** (unreliable in-app-webview downloads; we need server render for saves + unfurls). §4 row → `@vercel/og (Satori, server-side) | Free (Vercel)`; §5's `toPng(node)` description is superseded by Satori-constrained inline-style JSX.

### E. Card design contract as built (supersedes §5 layout; clarifies §7 `theme`)
Editorial-poster, **typographic** card: archetype NAME is the hero (display serif), "you play like {player}", a factual "position · nation" caption, the verdict line, three trait pills, a **vibe-signature** (5 bars = the user's axis percentiles), a **rarity %** ("X% share your vibe", from the finite answer space), and a **"Find yours → vibecheck.app"** CTA. Palette = **neutral chrome + one accent**; Stage-1 accent = the player's nationality colour. The §7 `theme` (ember|midnight|neon|bloom|static) enum is NOT used for the WC card — reserve it for the Stage-2 music card. Sizes 1080×1920 / 1080×1080 / 1200×630. No badges/flags/IP.

### F. Reusable engine architecture (the contract Stage 2 must follow)
Engine is content-agnostic; a variant supplies **{ quiz (option weights over named axes), archetype centroids, match-target centroids (roster), per-target design metadata }** and the engine code never changes. Pipeline: answers → summed vector → **percentile-normalized per axis** (min-max squashed users low and funnelled ~68% to one match; percentiles over the finite answer space fixed it) → **nearest-centroid** match (same primitive for archetype AND target) → profile. **Rarity** = exact fraction of the enumerable answer space per archetype. Stage-1 axes = intensity/flair/workrate/composure/teamplay; **Stage 2 swaps in MUSIC/Big-Five axes (§6/§9) — same engine.**

### G. Branded display font: **Fraunces** (locks CLAUDE.md Design-Bar "ONE display font")
The single display face across all screens AND the Satori card is **Fraunces** (OFL serif), bundled as static `.woff` (600/900) in `src/fonts/`. Body uses a neutral sans. Stage 2 must reuse Fraunces — no second display font. (§4 "fonts" row says "Google Fonts"; Fraunces is loaded via `next/font/local` from a bundled file so Satori can embed it.)

### H. Color system: neutral chrome + reveal-owned accent
One system: neutral near-black chrome + a single accent. Landing/quiz use a fixed brand accent; the result/card "reveal" switches to the archetype-owned accent (Stage-1 = nationality colour) — the only place colour shifts.

### I. Public framing locked: "footballer" (Stage 1)
Live public copy uses "Which footballer matches your vibe?" (trademark-safe per §13.D). Working name stays "Vibe Check"; final wordmark/domain (§11.1) still open.

### J. Doc-hygiene flag — RESOLVED (PM-approved overwrite)
The file had duplicate headers — two "Open questions" (`## 11` + `## 10`) and two `## 13` sections with conflicting pricing comps. Consolidated with explicit PM approval: the duplicate `## 10` block (a strict subset of §11) was removed, and the second `## 13` was retitled **§13b (historical appendix)**. §13's PRICING DECISION is the single canonical pricing record.

---

## 17. Behavioral strategy — cognitive reverb, P4 routing, paywall valuation

*Embeds §9 (P1–P4) operationally; reconciles with §6 (engine), §7 (premium_report), §12 (monetization). Copy + routing decisions, no code. Locked decisions preserved: artists are flavor-only (§6); free=identity / paid=analysis firewall + no dark patterns (§12).*

### A. Cognitive reverb — land P3 ("you can't read your own pattern") DURING the quiz
- Extend the per-tap confirm beat to ~900 ms and render a **deterministic, per-option reverb line** (copy stored beside each option; no LLM, no classification). It echoes the answer back with an implication and plants the recent/durable split (P4). Reverb lines are *questions about the self*, never verdicts (so they can't be "wrong").
- Samples: Q1 calm → "Mellow on purpose. Peace — or avoidance?"; Q1 intense → "Loud **right now** — that's a state, not a personality. We'll separate them."; Q2 change-mood → "You use music to **fix** your mood, not match it. That's a tell."; Q6 sit-in-it → "You marinate. Most skip. Noted."
- **P3 crystallizer** (one transition before the reveal): "You answered those in seconds. The catch: you can't read your own pattern from the inside. That's the whole point. Reading you now…"

### B. P4 in the engine — two-lane routing (preserves §6 anchoring)
- Score vector has two lanes: **`state_*`** (recent/mood) and **`trait_*`** (durable), routed in code from the TAP answers (which §10 already tags), before any LLM call.
- **state lane** ← §10 Q1 (current rotation), Q2 (emotion-regulation), Q6 (sad-song) → feeds **Red Flags / current emotion**.
- **trait lane** ← §10 Q3, Q4+Q5 (Openness), Q7 (Extraversion) [+ the durable taps in §C] → feeds **Diagnosis / Big Five**.
- Profile carries `state_levels` + `trait_levels` separately; the system prompt narrates each lane; the LLM never decides lane membership.
- **Artists stay flavor-only (§6):** passed as `ARTISTS_RECENT` / `ARTISTS_DURABLE` for callout flavor on the matching lane only — never entering the score. (Reconciles §10 Q8's "recent=state / durable=trait. Flavor only.")

### C. Minimal input change — durable-trait coverage (redline §10)
- Tap-derived trait signal currently covers Openness + Extraversion only; Conscientiousness/Agreeableness uncaptured, Neuroticism only via a state question → a 5-factor Diagnosis (§7) would be padded filler (the §8 horoscope-filler risk that undermines the price).
- **Add two durable-trait taps** (PM-approved): **+C** "Your music lives as… meticulous playlists / a few trusted go-tos / total shuffle chaos / whatever the algorithm serves"; **+A** "Someone hands you the aux, then talks over your song. You… laugh it off / quietly note it / never give up the aux again." Plus a Neuroticism micro-proxy on Q5 ("…and when a song you love blows up: still love it / a little betrayed").
- *(Placement refined in §18: collected in the paid/premium flow to protect free-quiz completion.)*

### D. Paywall valuation — blurred preview that makes the unlock essential (extends §7 + §12)
- **Self-verification hook (un-blurred, data-specific):** one exact line from their engine output + a typed artist — e.g. "You scored High Openness / Low Conscientiousness — which is why [artist] is in your rotation and your life runs on tape."
- **Skeleton, blurred (curiosity gap):** show the structure + that a specific answer exists — "The Diagnosis ▓▓ · Red Flag #1: ▓▓, fires every time you ▓▓ (Q2) · The Prescription: 3 fixes ▓▓."
- **Effort/IKEA effect:** "You already built this profile. Don't read half of yourself."
- **Choice architecture:** one CTA — *Unlock the full read · $3.99* ("less than your coffee," localized §12.7). Free path visibly complete; no timers / fake scarcity (§12).
- **(b) Shareable at peak curiosity:** a "send the blur" dare-a-friend affordance; the blurred preview is itself postable; unlock yields the deep-read share card (§12 second artifact).
- **(c) Defeat "I'd just ask ChatGPT":** it's **scored, not vibed** (§6 determinism); it **splits mood from personality** (P4) — you won't prompt that without knowing the model; **voice is the moat** — "ChatGPT flatters you; this is built to be right." Defensibility = packaging + the P4 split + brutal-accuracy voice + the share artifact at peak curiosity (§12.A2), not algorithmic secrecy.

### Open issues (flagged; PM-resolved this session)
1. **Durable-input sufficiency** — resolved by §C (+2 taps); placement per §18. Friction tradeoff accepted.
2. **Defensibility is positioning, not a technical lock** — accepted; the moat is experience + voice.

---

## 18. Quiz completion & friction reduction (free-funnel ignition)

*Completion is the multiplier on the entire funnel — it outranks downstream tweaks. Core principle: convert self-ANALYSIS ("what is my taste?") into RECOGNITION ("which is me?") — recognition is instant; analysis freezes. Non-leading rule: every option must be equally cool to pick (symmetric desirability) — then fast = honest. These are copy/UX decisions; the **full per-option §10 rewrite is folded into the Slice-1 build**, reading from this section.*

### A. The Unconscious Anchor (redlines §10 option copy)
- **Ask what they DID, not who they ARE** (behavior is recallable; identity-claims freeze people). e.g. Q1 header → "What's actually in your ears lately?"
- **Situational anchors** in each option — a felt scene, not a label: "Calm stuff — the slow-Sunday kind" / "Bright + loud — main-character energy" / etc.
- **Neutral axis-cue** (grey subtext) names the dimension's ends without picking a side: Q3 cue → *"the words · the beat · the feeling — whichever's truest, not coolest."*
- **Permission + speed line** under the progress bar: *"No wrong answers. First instinct is the real data."* (kills performance-freeze; gut/System-1 answers are higher-validity for preference data.)

### B. Unblocking the text field (redlines §10 Q8) — artists are flavor-only (§6), so it must NEVER block completion
- **Optional + loudly skippable:** *"Skip — I'll still get read"*; incentive *"the more you name, the more this reads like your diary."*
- **Two tiny labeled zones** (= the recent/durable split feeding §17.B): "On repeat right now" (up to 3; cue *"your last week of plays"*) · "Ride-or-die" (1; cue *"the one you'd defend in an argument"*).
- **Categorical retrieval triggers** — neutral *contexts*, never example artists (naming artists biases): `most-played this month` · `shower anthem` · `your 2 a.m. artist` · `defend-to-the-death`.
- **Spelling-only autocomplete** (iTunes Search / MusicBrainz, §4 — free, no key): type → tap → chip. A speller, not a recommender (no bias).
- **Rotating contextual placeholder** (*"start typing — we'll find them"*); **voice input** option (*"…or tap 🎤 and say their names"*).

### C. Progression flow (a self-discovery game, not a clinical test)
- **Open on the easiest, most vivid question** (instant win); one question per screen; **auto-advance on tap** (no Next button) = thumb-fast momentum.
- **The quiz talks back:** the §17.A reverb makes it a conversation reacting to you — the biggest "game not test" lever.
- **Live "forming" signature:** the vibe-signature bars assemble a little with each answer — users watch themselves take shape — with **no labels / archetype / verdict until the reveal** (firewall intact).
- **Game-framed system copy:** intro *"This isn't a test — there are no wrong answers, only tells."*; loading state *"Reading you…"* (not "Calculating results").
- **Curiosity ramp:** *"Last one. Then we read you."* → the §17.A P3 crystallizer → reveal.

### D. Data-quality guardrails (completion WITHOUT degrading validity)
- **Symmetric desirability:** no option is the trap or the trophy (e.g. "dead-center mainstream" = confident, "nobody's-heard-of-it" = a stance).
- **Cues name the axis, never a side;** situational anchors attach to *every* option symmetrically.
- **Gut-speed = higher validity** for preference data; the verdict lane is tap-driven (§17.B).
- **Autocomplete is spelling-only** — no recommendation/anchoring.

### E. Refines §17.C — durable-trait taps move to the PAID flow
The two durable-trait taps (§17.C: +C Conscientiousness, +A Agreeableness, +Neuroticism micro-proxy) are collected in the **paid/premium flow**, not the free quiz. The free quiz stays at its minimal fast set → maximum completion; the richer trait input is gathered only from users with demonstrated paid intent, exactly where the 5-factor Diagnosis is delivered. Serves completion + data quality + monetization at once.

---

## 19. Systemic health audit — corrections & locked mechanisms (pre-payment-launch)

### A. Cache durability — the exact mechanism (closes §6/§16.C's unspecified "cache by input hash")
Free tier: narration (`/api/reading`) and card (`/api/card`) are deterministic GETs keyed by their query string, served with `Cache-Control: public, s-maxage=31536000, stale-while-revalidate=86400` → Vercel CDN is the cache; **determinism is the correctness guarantee, the CDN is only a cost optimization** (eviction/cold start merely re-derives an identical verdict at Haiku cost). No KV/DB. PAID report: narration is cached per-instance by `premiumHash(profile)` so refreshes of a purchased report re-serve the SAME text instead of re-calling Sonnet per view; cold-start loss is acceptable (cheap regeneration; verdict fields anchored regardless).

### B. Paid-path anchoring corrections (landed before live Stripe keys)
1. `narratePremium` anchors `big_five[].level` and `attachment_style.style` (not just `archetype`) back to the engine profile — the model writes lines, never levels (§6). Implemented as `anchorReport()` + tests.
2. Premium temperature = 0.3 (§6's 0.2–0.3 band; 0.4 was out of spec — fixed).
3. The `purchase` analytics event fires ONCE per unlock (sessionStorage guard keyed by Stripe session id), not per page view.
4. ACCEPTED DECISION (recorded): the post-payment report URL (`session_id`) is shareable; anyone with the buyer's link sees the buyer's own report. Stateless trade-off accepted — it spreads a paid vanity artifact, which serves the funnel.

### C. Domain rule (landed before seeding)
No hardcoded domain anywhere user-visible. The card footer CTA derives its host from `NEXT_PUBLIC_BASE_URL`. "vibecheck.app" was a placeholder, not an owned asset; the real wordmark/domain remains §11.1-open and must be secured before launch.

### D. Doc corrections (supersessions, append-only)
- §15's env-var note ("narration defaults to claude-sonnet-4-6") is superseded by §16.C: default is `claude-haiku-4-5`; `ANTHROPIC_MODEL_PREMIUM` (default `claude-sonnet-4-6`) covers the paid report.
- The former duplicate §13 (now §13b, historical appendix) cited differing pricing comps; the canonical pricing record is §13 "Stage 1 growth build & decisions" → PRICING DECISION ($3.99 anchor / A/B $4.99 / floor $2.99).
- §10 Q2's "drowning out the world" is the lone negative-valence option in its set — re-word in the Slice-1 rewrite per §18.D symmetric desirability.
- §15 addendum: on first Vercel deploy, explicitly verify the card route's font loading (fs read + `outputFileTracingIncludes`) — serverless path resolution is a known deploy-time risk.
- The single-stroke glyph system referenced in older design notes is retired; the locked card design is the typographic hero (§16.E). Premium screens (`/premium/*`) still owe a formal Design-Bar pass before launch.

---

## 20. Conversion revision — WTP depth + friction rebalance (paired proposals)

*PM evaluation: neither quiz convincingly converts free → paid. Two failures: (1) WTP — not enough deep, defensible value; (2) friction — input-effort vs output-reward still off. This section is the paired fix. Locked decisions preserved: engine classifies / LLM writes (§6), P4 timescale split (§9 thesis, §17.B), stateless/no-DB, Satori subset (cards only — quiz UI is normal CSS). The Hume layer is POSITIONING ONLY (§9, corrected by approved overwrite); the §9 thesis bullets ("P1–P4", in order) remain the engine's empirical logic, untouched.*

### A. Onboarding hook — prime "subjective-yet-refinable" at ~zero friction

**Rejected baseline (recorded):** an explicit "is taste subjective or objective?" screen walking Hume's argument — too heavy, taxes completion before the first tap.

**A1 (default, ZERO added taps): the claim-then-quiz.** The hook is carried by existing copy slots, not a new screen:
- Landing sub-line (replaces current body copy): **"Your taste is yours — and it was trained by everything you've ever heard. Trained things can be read."**
- Pre-Q1 framing (one line above the first question, no interaction): **"This isn't a test of what you like. It's a read of what your ears learned."**
- Permission line (kept from §18.A): "No wrong answers. First instinct is the real data."
- §17.A crystallizer gains the refinement clause: **"You answered in seconds — that's sentiment. The pattern in those answers is the training. Reading you now…"**

**A2 (A/B variant, ONE unscored tap): the calibration decoy.** A warm-up tap disguised as Q0: **"Quick calibration: do you trust your own taste?"** → `Completely / Mostly / It's complicated` → reverb: **"Right answer either way. Taste is a feeling — but it's a trained one. Let's see what trained yours."**
- ⚠️ FLAG: this is a deliberate, marked **exception to §18.D's every-option-maps rule** — Q0 is explicitly UNSCORED (never enters the vector; cannot pollute GIGO). It buys the easiest-possible first win (§18.C easy-first) + the hook in one beat. Needs PM sign-off as an exception.

**Pair:** value = WTP priming ("refinable taste" makes a paid 'cultivated read' coherent) ↔ friction = zero (A1) or one trivial tap (A2). Beats the baseline on both sides.

### B. WTP content — premium report v2 ("depth = receipts, not paragraphs")

**Why v1 fails WTP (§12.A2 restated):** generic prose is DIY-able in ChatGPT. What ChatGPT cannot fake: (1) the **lane scores** (P4 split, §17.B — currently invisible plumbing with no product surface = the missed value), (2) **receipts** (which answer triggered which claim), (3) a **deterministic protocol** chosen by the engine. v2 makes all three visible.

**Length decision:** total read ≈ **60–90 seconds**. Justification: impulse buyers consume immediately; >2 min reads as padding (and padding is precisely what ChatGPT does free). Value-per-second beats word count, and shorter = harder to replicate convincingly (cut > pad).

**v2 structure (supersedes §7's `premium_report` schema; v1 kept above as history):**

```
{"archetype":"…",
 "split":{                                   ← THE CENTERPIECE (new)
   "lately":{"headline":"1 line naming the current weather",
             "lines":["2-3 short lines tied to STATE scores — each one CHECKABLE
                       against the user's actual recent life"]},
   "always":{"headline":"1 line naming the baseline",
             "lines":["2-3 short lines tied to TRAIT scores"]},
   "verdict":"1 line on the gap between LATELY and ALWAYS — the insight neither
              column gives alone"},
 "diagnosis":{
   "summary":"max 2 sentences",
   "traits":[ONLY traits with real engine signal get a line {trait,level,line};
             remaining traits collapse into ONE honest line, e.g. "the rest of
             you reads steady — nothing diagnostic there"],
   "attachment_style":{"style","line"}},
 "red_flags":[3 × {"flag":"…","receipt":"the answer that triggered it —
              'you told us in Q2: you fix moods, you don't feel them'"}],
 "prescription":{
   "intro":"1 line",
   "picks":[3 × {"pick","why"}],
   "protocol":{"title":"The 7-Day Recalibration",
               "days":[7 × one-line daily listening instruction]},
   "pairing":"1 line (tournament pairing while the window lasts)"},
 "closer":"the mirror line, screenshottable"}
```

- **B1 THE SPLIT (the self-verifiable emotional read):** LATELY = state lane (recent inputs → engine percentiles, §17.B), ALWAYS = trait lane. The narration MUST tie LATELY to checkable life-texture (e.g. *"volume up, lyric-attention down — that's a stretch of life louder than you'd like"*), so the user verifies it against their own recent weeks and converts on recognition. The LLM narrates pre-computed lane levels; it never judges (§6). **Pair:** +~15s reading friction ↔ counterbalanced by B2's cut, net length flat.
- **B2 SIGNAL-ONLY DIAGNOSIS:** render full lines only for traits the engine actually measured (fixes the current C/A/N Medium-padding — the Slice-1 red-team #1); the collapse line turns honesty into voice. Upgrades automatically when §18.E's paid taps land. **Pair:** value = credibility (no horoscope filler, §8) ↔ friction = negative (shorter).
- **B3 RECEIPTS on Red Flags:** every flag cites its triggering answer ("you told us in Q2"). Engine-side: a deterministic flag→questionId map in content. Proprietary-feel ChatGPT can't mimic without the quiz. **Pair:** no input friction; tiny content cost.
- **B4 THE 7-DAY RECALIBRATION (the Hume layer productized):** "defects are removable; a cultivated ear perceives truer" becomes a concrete protocol — engine picks the most extreme STATE axis (deterministic rule: max |percentile − 0.5| among state axes, tie → fixed axis order) and serves the matching hand-written 7-day track (6 tracks: 3 axes × 2 directions, 7 one-liners each; pure content, no DB). Day 7 line invites the re-take (see B6). A protocol feels like a *product*, not a paragraph. **Pair:** +~20s read ↔ collapsible on web (Day 1 visible, rest expandable); on any card/PNG surface only the title appears.
- **B5 DEEP-READ COLLECTOR CARD (already decided, §12 — now placed):** the paid share-card renders the sigil (C2) + rarity + archetype in premium styling, delivered at the top of the report. **Pair:** zero input friction; it's the §12 second vanity artifact.
- **B6 THE SECOND LISTEN (retention, stateless):** report footer line: **"Retake in a month. LATELY should change. ALWAYS shouldn't. If it does — we should talk."** Drives honest re-engagement with zero storage. **Pair:** zero friction.

### C. Friction — push (cut effort) and pull (make finishing magnetic)

**C1 PUSH — relocate the artist field (biggest input cut):** the free path becomes **7 taps → reveal, zero typing, period.** The §18.B bonus round moves OFF the pre-reveal path onto the **result page** as an inline module — **"Name names. Sharpen the read."** (same two zones/chips/triggers; adding artists updates the URL statelessly and re-renders the free read + sharpens the §17.D paywall hook). Effort is now asked only of the already-hooked — mirroring the §18.E principle — and it doubles as pre-purchase IKEA commitment. The paywall keeps its no-artist fallback hook. **Pair:** value = faster reveal AND better-placed effort ↔ risk = fewer artists captured overall; accepted — artists are flavor-only (§6), and capture quality rises with intent.

**C2 PULL — THE FORMING SIGIL (PM seed, expanded):** one persistent visual anchor replacing the §18.C bars (restraint: swap, not add):
- **Form:** a single ring of 7 arc-segments (one per question). Each answer fills its arc; fill hue blends step-by-step toward the (undisclosed) archetype theme colour — a deterministic function of the partial raw vector. Shape carries temperament: arc caps sharpen with high running energy, round with calm. **No labels, no names mid-quiz** — the firewall holds; the hue trajectory teases, never tells.
- **Pull mechanics:** every tap visibly changes it (sunk cost: abandoning kills *your* mark); Q4 progress line: **"Halfway. It's already taking shape."**; at completion the ring **closes and locks** to the theme accent on the crystallizer screen ("Reading you now…") — the curiosity gap is literal: *what colour am I?*
- **Surfaces:** in-quiz animation is normal web CSS (Satori constrains only cards); the **locked sigil** then prints on the share card beside the rarity (~64px, plain divs/SVG — Satori-safe) → collectible identity ("mine's a jagged ember, yours is a smooth midnight") that feeds the §13 compare/challenge loop.
- **Pair:** value = completion pull + a new shareable identity mark ↔ friction = none for users (visual only); cost is build effort + one design-bar pass.

**C3 PULL — tap-through reverb:** the §17.A beat becomes skippable (tap anywhere advances immediately). Savorers keep the talk-back; speedrunners lose ~6s of forced wait. **Pair:** protects completion without deleting the reverb's value.

**C4 PULL — the pre-paywall aha, sequenced:** reveal order on the result page: sigil locks → archetype name → the free read → **one un-blurred LATELY line** (the §17.D hook, now state-anchored: *"this isn't just taste — your last few weeks are in here"*) → paywall. The emotional proof appears BEFORE the ask. **Pair:** value = conviction at the moment of the ask ↔ friction = none (re-ordering).

### D. Golden-rule ledger (every value add ↔ its counterweight)

| Value feature | Friction it creates | Counterweight |
|---|---|---|
| A1/A2 hook | zero / one unscored tap | carried by existing copy slots |
| B1 Split | +15s read | B2 cuts the Diagnosis; net flat |
| B3 Receipts | none (engine data) | — |
| B4 Protocol | +20s read | collapsible; Day-1-only visible |
| B5 Collector card | none | — |
| C1 Artist relocation | risk: fewer artists | asked post-hook; IKEA effect; flavor-only anyway |
| C2 Sigil | build cost only | replaces bars (no added clutter) |

### E. Ranked backlog (impact ÷ effort)

1. **B1 Split** — the WTP core; surfaces the P4 plumbing as the product. (High / Med)
2. **C1 Artist relocation** — push + pull in one move. (High / Low-Med)
3. **A1 hook copy** — trivial, reframes everything. (Med-High / Trivial)
4. **B3 Receipts** — proprietary-feel per line. (Med-High / Low)
5. **B2 Signal-only Diagnosis** — fixes Medium-padding honestly. (Med / Low)
6. **C2 Sigil** — completion pull + collectible. (High / Med-High)
7. **B4 Protocol** — product-feel + retention. (Med / Med)
8. **C3 tap-through reverb** — completion guard. (Low-Med / Trivial)
9. **B6 Second Listen** — free retention. (Low-Med / Trivial)
10. **A2 calibration decoy** — A/B only, behind the §18.D-exception sign-off. (Med / Low)

### F. Flags (not invented — needing PM confirmation)

1. "P1–P4": §9's thesis bullets are unlabeled in the file; this section treats the four bullets, in order, as P1–P4. Confirm the mapping.
2. A2's unscored Q0 is an explicit exception to §18.D ("every option maps to a dimension") — exception is safe (never enters the vector) but needs sign-off.
3. B2 means the paid report's trait count varies by available signal until §18.E lands — accepted as honesty-by-design?
4. The §9 Hume paragraph was amended in place under this revision's explicit overwrite approval; v1 `premium_report` (§7) is superseded by §20.B, not deleted.

---

## 21. The Voice Bible — copy guidelines for being "seen" (PM + copywriter + behavioral psych)

*Governs ALL generated reading text (free + paid) and the deterministic fallbacks. Extends §7's VOICE and §8's rails; implements §20.B's depth-not-length. The empathy claim stays honest per §9 (corrected): a trained read of trained taste — never clinical, never "your authentic self revealed."*

### A. The psychology of feeling seen (framing techniques)

1. **Specificity is the anti-Barnum.** A line lands only if it could be WRONG about someone else. Test for every sentence: would this miss for a random stranger? If not, cut. ("You preview songs before adding them" ✓ · "you love music deeply" ✗)
2. **Observation → motive ("the reveal").** Describe recognizable behavior first, then gently name what it's *for*. Pattern: *"You do X. That's not Y — that's Z."* The motive-reveal is the empathy hit.
3. **Validation before exposure (the therapist's one-two).** Never roast cold. Per block: **SEE** (mirror the behavior) → **NORMALIZE** ("of course you do — it works") → **EXPOSE** (the cost/tell) → **DIGNIFY** (reframe as strength-with-a-shadow). This is the tonal arc: warm → precise → sharp → warm.
4. **Declarative certainty.** Second person, present tense, zero hedges ("might," "perhaps," "maybe" = horoscope tells; §7 already bans them — enforced here per sentence). Confidence is read as insight.
5. **The "caught" moment.** One line per section that implies we *watched* them ("you skip the bridge when it gets too honest"). §20.B3 receipts are the engine-backed version — receipts beat invention; never fabricate a receipt the engine can't back.
6. **Costly honesty (two-sided messaging).** Include one mildly unflattering-but-safe truth they'd admit ("you've recommended a song to seem interesting, not to share it"). Admitted flaws make the flattering lines credible.
7. **Name the unnamed (P3 at sentence level).** The highest-empathy move articulates something felt but never phrased: *"nostalgia isn't your comfort — it's your proof you used to feel more."* Target ≥1 per paid report.
8. **The tense IS the P4 split.** LATELY copy = present-continuous + temporal markers ("you've been… these weeks") → feels like being *checked on*. ALWAYS copy = timeless present ("you are… you've always") → feels like being *known*. Grammar carries the architecture; the LLM is told this explicitly.

### B. Tonal register map (per §20.B block)

| Block | Register | One-line direction |
|---|---|---|
| Split·LATELY | the friend who noticed | soft, specific, slightly worried |
| Split·ALWAYS | the biographer | settled, unarguable |
| Diagnosis | the specialist, amused | precise, a little entertained by you |
| Red Flags | the roast with receipts | sharp, cites the answer, never cruel (§8) |
| Prescription | the coach | imperative, kind, concrete |
| Closer | the mirror | quiet, final, screenshottable |

### C. PM delivery rules (depth without bloat)

- **One idea per line; line breaks are pacing.** Short declaratives — §7's "darts."
- **The 70/30 rule:** ~70% mirror (they nod) / ~30% reveal (they flinch). More reveal = defensive; more mirror = boring.
- **Word budgets (enforced in prompt + schema descriptions; fits §20.B's 60–90s):** Split lines ≤14 words · Diagnosis trait lines ≤16 · Red Flag ≤20 + receipt ≤10 · Prescription picks ≤14 · closer ≤25.
- **Verbs over adjectives.** Describe what they DO, never rate what they ARE ("you curate," not "you're thoughtful"). No worth-adjectives, period.
- **Banned list:** "journey," "unique," "special," "eclectic," "music lover," "vibe with," "soundtrack of your life," therapy-speak ("holding space," "doing the work"), any clinical noun as a verdict ("you have anxiety" ✗ → "you treat silence like a problem to fix" ✓).
- **Closer formula:** callback + concession + dare. (*"Still re-reading this? Of course you are. Screenshot it and prove it wrong."*)

### D. Sample framework (the standard to hit)

**Free read (2 sentences, vibe_check):**
> "You don't play music — you administer it: the right dose, the right room, nobody else's hands on the queue. Phoebe Bridgers on rotation while Radiohead never leaves isn't taste, it's a filing system for feelings you won't say out loud."
*(SEE+EXPOSE compressed; artist receipts; zero hedges; 41 words.)*

**Paid Split (the conversion block):**
> **LATELY** — *"The volume's been up and the lyrics have been off. (SEE) That's not a phase, it's insulation — it works. (NORMALIZE) But you've been drowning the narrator, not the noise. (EXPOSE)"*
> **ALWAYS** — *"You've always listened alone first. New things enter your life on probation. Trust, for you, has a tracklist. (biographer register)"*
> **VERDICT** — *"The baseline is a watcher; the last few weeks are a wall. When the wall comes down you'll need the watcher — keep him fed. (DIGNIFY)"*

**Red Flag with receipt:**
> 🚩 "You fix moods instead of feeling them — you told us yourself in Q2. Efficient. Also a way to never find out what the mood was for."

### E. Implementation note (Slice 2)

These rules are injected into `SYSTEM_PROMPT` (VOICE section v2 + per-block registers + budgets + banned list), into the v2 report schema's field descriptions, and the deterministic fallbacks get a manual pass to the same standard. The §21.A1 specificity test and §C budgets become review criteria in the Design Bar's "Voice" item.

---

## 22. Post-test revisions (PM walkthrough feedback)

- **§20.C2 revised — bars stay, ring relocates.** PM testing preferred the moving FORMING BARS over the small in-quiz ring. Decision: the in-quiz visual is the bars, now **tinted with the sigil's hue-drift** (the "what colour am I becoming?" tease survives); the ring renders only where it reads well — the **crystallizer lock** and the **card footer mark**. Pull mechanic intact, motion the test liked restored.
- **Completion-pull audio (PM seed, shipped opt-in).** A synthesized pentatonic note climbs one step per answer and **resolves** at the crystallizer (the audio mirror of the lock). **OFF by default** — most traffic is muted in-app webviews and sound-on-by-default is hostile; one-tap 🔇/🔊 opt-in, remembered per session. Synth-only (WebAudio oscillator): **no playback of any recording, §2's no-music-playback scope intact.**

---

## 23. Lifecycle audit, launch-readiness gaps & portfolio strategy

### A. Maturity gaps (pre-launch; audit of record)
Blockers: human verification stage (beta + device matrix — iOS Safari/IG webview: WebAudio, share-sheet, blur, `<details>`); live-dependency smoke tests (model voice vs §21 + Stripe test purchase); legal floor (ToS, privacy, refund policy, support email, Stripe descriptor). Major: error monitoring (Sentry free, or analytics-event error reporting as the $0 interim); domain purchase + trademark sanity check ("Vibe Check" is generic — contested-name risk accepted for launch, revisit at traction); "paid-but-lost-link" runbook (stateless unlock: recovery = Stripe dashboard lookup; full fix requires DB — approval-gated); KPI dashboard definitions (PostHog drop-in if Vercel WA can't express K_obs). Minor: prompt-injection pass on the artist field; OG-unfurl QA; seed-account prep. These EXTEND the §15 checklist; §15 remains the deploy procedure.

### B. Pricing staging (refines §13's A/B)
Launch FLAT $3.99. The A/B (vs $4.99) activates only past ~300 paywall views — below that it's noise. No change to the $2.99 floor or the §13 anchor logic.

### C. Portfolio map & sequencing rule (the second act — NOT launch work)
Diagnosis of record: single-function WTP is unproven-not-disproven; portfolio exists for LTV/stickiness/moat (the real single-function weakness), gated on the §13.B funnel showing life. Ranked: P1 Compatibility Report (paid /vs, two tokens, no DB — first expansion); P2 Date Decoder (user-profit module, below); P3 Gift Read (signed pre-paid token, no DB); P4 Aux Briefing packs; P7 Era Report (December counter-programming). Maturity tier (each requires explicit DB/accounts approval): P5 Music Passport (collection/stamps), P6 Music Diary (recurring LATELY timeline; natural subscription — distinct from §12's rejected report-sub).

### D. User-profit module: THE DATE DECODER (flagship candidate)
Paid brief decoding a date's 3 profile artists (+3 "as far as you can tell" proxy-taps so the verdict stays deterministic — §6 intact; artists remain flavor): what the taste signals, 3 openers, 2 friction points, venue + queue suggestions. Profit framing is INDIRECT (social capital, decision aid) and checkable same-night — the credit-attribution mechanism. GUARDRAILS (binding): §8 cruelty firewall extends to the absent third party; entertainment framing; no predictive/compatibility-score claims; no earnings or outcome promises; never marketed for employment/screening (work/interview variant REJECTED on regulated-assessment risk). DEMAND GATE: fake-door teaser on the result page must out-click the paid-read CTA over one week before any build.

### E. The result/card "rarity %" is REMOVED (honesty, not decoration)
`archetypeRarityPct` (engine/rarity.ts) computes the fraction of the *enumerable answer space* (uniform over answer-paths) that maps to an archetype, floored at 1%. It is NOT a population statistic — we have no user counts (stateless/no-DB), and real users don't answer uniformly, so "X% share your vibe" implies a "% of people" we cannot and do not know. It also reads low on nearly every run (10 archetypes → ~10% mean; nearest-centroid concentrates mass), which on a trust/share product looks fabricated. **Decision: remove the `{rarity}%` + "SHARE YOUR VIBE" block from the result page and the share card.** The vibe-signature bars (labeled "YOUR VIBE SIGNATURE") and the sigil carry identity/collectibility honestly. This supersedes the "rarity stat" mentions in §16 / the card docstring; the `rar=` param + `archetypeRarityPct` remain tolerated/unused (analytics may still log frequency). No fabricated or rescaled "specialness" number replaces it (dark-pattern guardrail).

### F. Mobile strategy: stay web (PWA-light), no store listing for v1
Store IAP rules bind only store-distributed apps; as web + Stripe we are not subject to them — nothing to "walk around." Listing would add review, a 2026-unsettled external-link commission (Apple: 0% *pending* a court-set rate after the Ninth Circuit's Dec 2025 ruling, still litigated; Google: ≤20% from 30 Jun 2026, injunction through 1 Nov 2027), and risk — for store discovery we don't use (channel = organic shares). **Decision: no store listing for v1.** How, ranked: (1) **PWA-light** — `manifest.webmanifest` + maskable sigil icons + theme color for Add-to-Home-Screen feel (~$0 cut, no review); **no service worker** by decision (a one-shot quiz→share→pay flow needs neither offline nor push; offline caching adds cache-invalidation risk on a fast-moving app). (2) **Capacitor wrap** — real store listings but inherits every store cost; only if a future retention product (Diary/Passport) justifies it. (3) **Native rewrite** — ruled out for v1. iOS caveat: no install prompt (manual "Add to Home Screen"); HTTPS already met on Vercel.

---

## 24. Payments: Stripe → Merchant-of-Record (Dodo) — IMPLEMENTED

The seller is a mainland-China tax resident and cannot use Stripe (US SSN). Payments moved to a **Merchant-of-Record** behind a provider-agnostic adapter (`src/lib/payments/`, selected by `PAYMENTS_PROVIDER`, default **Dodo**); the MoR is the legal seller and handles tax/VAT, refunds, and disputes. **This supersedes the Stripe specifics in §12.B5 (`automatic_payment_methods`), §13, §15, §19, and §23.A.**

- **Adapter contract** (`PaymentProvider`): `createCheckout` (hosted redirect), `orderRefParam`, `verify(orderRef) → {paid, token}`. Implemented with `fetch` (no SDK). The `stripe` dependency is removed.
- **Flow (unchanged stateless model, no DB):** `/api/checkout` → `provider.createCheckout` → full-page redirect to Dodo's hosted checkout (webview-survivable). Dodo returns to `…/premium/report?t=<token>&payment_id=…&status=…`. The report page **verifies the payment server-side** (`GET /payments/{id}`, status ∈ succeeded/completed/paid) — the live verify is the entitlement. The premium token rides BOTH the return URL (`?t=`, size-proof) and Dodo `metadata.profile` (authoritative on verify); the client `status` param is never trusted.
- **Config (env, server-only, test-first):** `PAYMENTS_PROVIDER=dodo`, `DODO_API_KEY`, `DODO_PRODUCT_ID`, `DODO_MODE=test|live`. Unconfigured → `/api/checkout` 501 + dev-unlock in non-prod (build/deploy works without keys).
- **Price/refunds:** buyer-facing price is MoR-controlled (tax-inclusive/localized) around the $3.99 anchor; `/legal` refund copy follows Dodo's policy where it differs from "all sales final."
- **Open / to verify in Dodo test mode (flagged):** (a) `POST /checkouts` with `confirm:true` returns a hosted `checkout_url` (vs. a JS-overlay client secret) — confirm the hosted URL comes back, else switch to the payment-link endpoint; (b) `metadata` value size ≥ ~490 chars (else rely on the `?t=` URL carry, already in place); (c) exact `GET /payments/{id}` shape + the paid status string. A signed Dodo webhook (`/api/webhooks/dodo`) for refund/dispute sync is optional maturity work, not required for unlock.
