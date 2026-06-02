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

**The Hume bit (About-page copy).** In *Of the Standard of Taste* (1757), Hume argued that judgments of beauty come from sentiment in the listener, not a property of the object — yet taste is not arbitrary: it can be refined through exposure, comparison, and practice. So your taste is both *yours alone* and *trained by everything you've heard* — which is exactly why it's readable. That dual claim (subjective **and** learnable) is the philosophical spine of the product.

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

---

## 11. Open questions for next session

1. Name + wordmark (drives card design and domain).
2. Blurred-preview paywall copy — the exact unlock-screen words are a conversion lever worth A/B testing.
3. Final palette + card layout for the five `theme` values.
4. The archetype taxonomy (~12–24 named types) and the answer→score point-weights — the heart of the deterministic engine.
5. The curated World Cup player roster (~16–32) with hand-assigned style profiles.

---

## 10. Open questions for next session

1. Name + wordmark (drives card design and domain).
2. Blurred-preview paywall copy — the exact unlock-screen words are a conversion lever worth A/B testing.
3. Final palette + card layout for the five `theme` values.
