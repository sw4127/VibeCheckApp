# Launch Post Kit (of record — authored by product, 2026-07-17)

Strategy: **Option A confirmed** — the site is the link; repo + methodology ride in the first comment
(serves Tier-2 sessions KPI; repo costs one click, a README landing costs a session).
**Gate: DO NOT POST until launch-checklist item 1 is green (pb4/pb8 ear pass, pb6 professional review).**
Voice note: HN/Reddit launch copy is NOT the Examiner — it's the maker speaking: plain, honest,
technical, zero marketing gloss. The Examiner lives inside the product.

---

## URLs of record (filled 2026-07-19; entry-channel attribution per PM RT-3a)

- **Story/submission URL (HN): CLEAN, no params** — `https://vibe-check-app-sepia.vercel.app/`
  (HN etiquette: tracking params on the story URL read as spam; ?ref= goes on comment links only).
- HN first-comment links: append `?ref=hn`.
- r/samplesize body link: `https://vibe-check-app-sepia.vercel.app/bias?ref=rs`
- r/InternetIsBeautiful link: `https://vibe-check-app-sepia.vercel.app/bias?ref=iib`
- r/LetsTalkMusic link: `https://vibe-check-app-sepia.vercel.app/bias?ref=ltm`
- Engine repo: `https://github.com/sw4127/hume-taste-engine` — **name locked; repo PRIVATE /
  pending creation+flip, both owner-gated.** Do not post the HN comment until it is public.

The `?ref=` value is captured once per session by the existing entry-path tagging
(`captureAttribution()` in `src/lib/analytics.ts`) and rides every PostHog event as `ref`.

---

## Hacker News — Show HN

**Title options (pick one, ≤80 chars, no clickbait):**
1. `Show HN: A blind test of how much famous names sway your music ratings`
2. `Show HN: Rate music blind, then labeled – measure your prestige bias (Hume, 1757)`
3. `Show HN: I built a test that catches your ratings following the famous name`

*Recommendation: #2 — the mechanism is the hook, and "Hume, 1757" earns the HN-history click.*

**Body:**

> In 1757 David Hume argued that prejudice corrupts aesthetic judgment — that we praise the name,
> not the work. I built an instrument that measures that, on you.
>
> How it works: you rate 10 short music clips blind. Then you rate them again — eight now carry
> labels (artist, acclaim, dismissal), two stay deliberately unlabeled as drift controls. Some
> labels are true; some are deliberately swapped (every deception is confessed on a debrief screen
> at the end, with the real attributions). Your score is the measured gap between your blind and
> labeled ratings, corrected by your own drift on the unlabeled controls. About 6 minutes, no signup.
>
> Technical notes: scoring is fully deterministic — no LLM anywhere in the loop; the share links
> carry raw ratings and recompute server-side, so a score can't be forged by editing the URL.
> Audio is public-domain/CC recordings (license proofs in the repo). The psychometrics engine
> (item schema, signed sway scoring, calibration hooks) is open source — link in the comments.
>
> Honest limitations: norms are provisional (the response dataset is young — early takers ARE the
> norming cohort, which is part of why I'm posting). Item pool is v4 and versioned; old links die
> cleanly rather than serving stale items.
>
> I'd genuinely value: critiques of the instrument design (what would make the sway measure more
> rigorous?), and your debrief-screen reaction — the moment the labels confess is the product.

**Prepared first comment (post immediately after submission):**

> Links for the curious:
> – Methodology write-up: https://vibe-check-app-sepia.vercel.app/learn/methodology?ref=hn
> – Engine repo (MIT): https://github.com/sw4127/hume-taste-engine *(private until owner flip — do not post before it's public)*
> – What Hume actually wrote (our reading room): https://vibe-check-app-sepia.vercel.app/learn?ref=hn
>
> Design decisions that might interest HN: the blind/labeled gap makes each user their own control,
> so the headline number needs no external ground truth; swapped-label items are the core signal and
> the direction balance is enforced by tests; edge ratings (0/10) are excluded from the sway sub-stat
> to kill an artifact, and that exclusion is disclosed in the debrief. Responses are stored anonymized
> for norming — that dataset (item difficulty, calibration curves) is the roadmap: an IRT-calibrated
> delicacy battery (manipulated-audio discrimination trials) ships next.
> Anticipating the obvious objection — "isn't the second pass just memory?": remembering your own
> first rating anchors you toward consistency, which suppresses movement rather than creating it,
> and uniform re-exposure drift cancels because label directions are balance-enforced; only
> label-correlated movement survives the signed computation. On top of that, two clips are never
> labeled in either pass — they measure each taker's own re-listen drift directly, and the residual
> that drift would leave in the score is subtracted. Full defense on the methodology page.
> Ask me anything about the psychometrics — the parts I'm least sure about are the most useful to hear about.

**Etiquette rules:** post once, Tue–Thu ~8–10am ET; never ask anyone to upvote (HN detects voting
rings); reply to every substantive comment in the first 3 hours; concede valid criticism immediately
and log it as an issue — HN rewards that more than defense.

---

## Reddit variant 1 — r/samplesize (norming-cohort fit, rules-native)

**Title:** `[Casual] How much do famous names sway your music ratings? Rate 10 clips blind, then labeled (~6 min, no signup)`

**Body:**

> Maker here (disclosure: I built this). It's a free test based on Hume's 1757 essay on taste:
> you rate short clips blind, then rate them again with artist/acclaim labels — some labels are
> deliberately false, and the end screen confesses every lie and shows your real attributions.
> Your result is the measured gap between your two passes.
> No signup, no email, ~6 minutes. Responses are stored anonymized and become the norming dataset
> (you're scored against provisional norms and it says so — early takers literally build the curve).
> Happy to answer anything about the scoring or the audio licensing.
> https://vibe-check-app-sepia.vercel.app/bias?ref=rs

## Reddit variant 2 — r/InternetIsBeautiful (free, no-signup rule fits)

**Title:** `A test that measures how much famous names sway your music taste — rate blind, then labeled, see the gap`

**Body:** one paragraph, same disclosure ("I made this"), no methodology dump — let the debrief do
the talking. Post only AFTER the HN run so any traffic spike lands on a warmed deployment.

## Reddit variant 3 (optional, discussion-first) — r/LetsTalkMusic

Text post, question-led: "Hume claimed we praise the name, not the work — I built a blind test of it
on myself and got +X%. What would you expect yours to be?" Maker disclosure in the first line.
Only worth it if you'll actively hold the discussion thread.

---

## Sequencing
1. PM sign-offs (pb4/pb8/pb6) → checklist item 1 green.
2. CC builds the server-rendered write-up page (charts auto-slot when N arrives; none synthetic — N3).
3. HN post (one attempt; if it dies quietly, that's allowed — do NOT repost same-week).
4. 24–48h later: r/samplesize → r/InternetIsBeautiful.
5. Every post day: watch /api/health + PostHog live view; the KPI export script gives the N count.
