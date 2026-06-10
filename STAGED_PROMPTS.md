# Staged Prompt Playbook — Solo Profitable App

A phase-by-phase set of prompts to hand to Claude Code, distilled from a full build cycle.
Fill in `<…>`. Send them in order; some you'll re-run each iteration (Design, Monetization, Growth).

---

## Operating principles (the transferable part)

1. **Building is the easy part now; distribution and a payable problem are the bottleneck.** Favor ideas with a built-in share loop or a cheap channel — and an unfair advantage.
2. **Let constraints kill ideas fast.** No audience → you need virality/SEO/a platform. Near-zero budget → no marketplaces, social networks, or heavy infra. Short timeline → no network-effects plays.
3. **Persist, don't rely on memory.** Durable rules → `CLAUDE.md`; decisions & findings → `spec.md`; commit to git; **review every diff.** Agents forget and silently overwrite — assume it.
4. **For LLM products, split the verdict from the voice.** Compute anything the user judges in deterministic code; let the LLM only write. Anchor with low temp, pinned model, enums, caching.
5. **For AI apps, the output IS the product.** Engineer the persona and a strict structured output your UI renders deterministically.
6. **Keep a persistent Definition of Done** so polish doesn't regress. Separate the durable rubric (lives in `CLAUDE.md`) from this-round fixes (live in the prompt).
7. **Quality comes from iteration + references + self-critique loops,** not one-shot prompts. Show references; demand pass/weak self-audits and screenshots.
8. **WTP and payment friction are different problems.** And validate the distribution loop *before* polishing the paywall.
9. **Measure the loop even when stateless** — URL/UTM params, OG-image fetch counts, free analytics — and set a go/kill threshold up front.
10. **Stay ethical and safe.** No astroturfing or ToS evasion; copyright/trademark/likeness-safe; secrets in `.env`; never spend without approval. On a share-driven product, trust *is* the growth engine.

---

## Stage 0 — Ruthless idea selection
*Use once, before committing.*
```
Act as a skeptical solo-founder advisor. My constraints: budget <$>, timeline
<>, audience <none / list>, skills <>. Score each idea below against:
1) the specific painful problem + exactly who has it (narrow is better);
2) my unfair advantage / cheap access to that audience;
3) evidence people already pay to solve it;
4) how the first 10–50 users find it with ~$0;
5) the thinnest version that still delivers value.
Ruthlessly eliminate the weak ones, name the single best bet (or a pivot), and
tell me honestly if none are strong. Ideas: <list>.
```

## Stage 1 — Write the MVP spec
*Produces `spec.md`, your source of truth.*
```
Write a lean MVP spec for <chosen idea> and save it as `spec.md`. Include:
one-line product + the funnel; in/out scope (defer ruthlessly); a build sequence
(smallest testable loop first, monetization later); a lean free-tier stack;
unit economics per sale; and — if LLM-powered — the deterministic-scoring-vs-
LLM-writer architecture plus the exact system prompt with a strict output schema.
Keep it tight and buildable solo within <timeline>. Don't write app code yet.
```

## Stage 2 — Kickoff plan
*Start of the first build session.*
```
Read `CLAUDE.md` and `spec.md` in full. Propose a step-by-step plan for
<Stage 1 / the first slice>. Don't write code yet — wait for my approval. Start
with the smallest shippable slice.
```

## Stage 3 — Reproducibility / anchoring review (LLM apps)
*Run before users can see a "verdict."*
```
Audit how we generate the user-facing verdict. Is it reproducible — same input,
same output — or can it drift between runs and lose credibility? Move ALL
classification into deterministic code so the LLM is only the writer. Specify
temperature, a pinned model snapshot, enum-locked fields, and input-hash caching.
Propose the spec edits; don't implement yet.
```

## Stage 4 — Design-director polish
*Re-run each visual iteration. Attach screenshots.*
```
Switch into demanding design-director mode. Screenshots attached. Do NOT write
code yet.
STEP 1 — Run the FULL Design Quality Bar from CLAUDE.md against every screen;
report pass/weak per item with a one-line reason. Skip nothing; anything "weak"
is a defect even if I didn't list it.
STEP 2 — Then prioritize these specific fixes: <this round's issues>. For
open-ended visual choices, propose 2–3 directions and wait for my pick.
AFTER each pass: screenshot, re-run the full Bar, fix what's still weak, and only
then call it done. For references, either search current examples and show me 3,
or match the ones I paste here: <refs>.
```

## Stage 5 — Monetization gatekeep
*Before writing payment code.*
```
Act as a ruthless consumer-monetization economist. Read `spec.md` + `CLAUDE.md`.
Analysis only — no code. Treat WILLINGNESS-TO-PAY and PAYMENT-FRICTION as two
separate problems.
A) WTP: walk the real funnel with per-step drop-off estimates; name the 3 biggest
   drop-off points; is the paid value defensible or trivially DIY-able for free;
   is <price> / the structure right?
B) FRICTION: autopsy checkout from "I'll pay" to money received, accounting for
   in-app-browser traffic (broken autofill / saved cards); recommend the
   lowest-friction viable checkout.
Then 3 high-impact, low-dev WTP strengtheners — for EACH, net out the friction it
ADDS, and flag any dark pattern + its backfire risk. Lead with the single most
fragile point; give a funnel table; rank fixes by impact ÷ effort tied to spec
sections. Don't be polite or validate me.
```

## Stage 6 — Growth & loop measurement
*Zero-budget organic launch.*
```
Act as a growth marketer + growth engineer; zero budget, organic only. Read
`spec.md` + `CLAUDE.md` including any monetization findings, and stay consistent
with them. Actionable tactics tied to code/UI changes, not theory.
0) PROVE THE LOOP first: define the viral coefficient and the 2–3 metrics that
   show spread; how to instrument them on a stateless app (URL/UTM params,
   OG-image fetch counts, free analytics); set a go/kill threshold.
1) SEEDING: zero-dollar, ToS-safe, transparent (no fake accounts / astroturfing /
   rule evasion); name specific welcoming communities + the value-first angle;
   keep copy trademark-safe.
2) CARD-TO-APP BRIDGE: screenshots on Stories/TikTok aren't tappable — engineer
   how a viewer actually reaches the app; the curiosity trigger on the shared
   artifact; a webview-safe instant landing.
3) NETWORK EFFECTS: turn one user into 3 more (compare / challenge mechanics)
   WITHIN the stateless rule (encode state in the URL); keep brand guardrails.
For each tactic, name the code/UI change, tie it to a spec section, rank by
impact ÷ effort, and flag must-ship-before-launch vs. later.
```

---

## Recurring habits (use between stages)

**Persist findings before moving on:**
```
Before we move on, append your full analysis/decisions to `spec.md` under
"<section name>", verbatim (tables and rankings included). Commit to git and
confirm it's saved. Append — don't overwrite anything.
```

**After any session that touched `CLAUDE.md` or `spec.md`:** open the git diff yourself and skim it. The agent forgets and overwrites; the diff is your safety net.
