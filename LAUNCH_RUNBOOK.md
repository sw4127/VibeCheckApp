# LAUNCH RUNBOOK — Vibe Check (ops companion to spec §15/§23)

The spec is product truth; this file is the operator's checklist. Solo-founder
sized: every item is minutes-to-hours, $0 unless marked.

## 1. Vercel environment (Production scope)

| Var | Value | Required |
|---|---|---|
| `ANTHROPIC_API_KEY` | your key | ✅ (free reading + paid report) |
| `NEXT_PUBLIC_BASE_URL` | `https://<your-domain-or-project>.vercel.app` — no trailing slash | ✅ (share links, OG images, card footer, Stripe redirects) |
| `PAYMENTS_PROVIDER` | `dodo` | ✅ (selects the MoR adapter) |
| `DODO_API_KEY` | Dodo **test** key first; live key at go-live | ✅ for payments (501 without it; rest of app works) |
| `DODO_PRODUCT_ID` | id of the $3.99 "Vibe Check — The Full Read" product | ✅ for payments |
| `DODO_MODE` | `test` first, `live` at go-live | ✅ (test/live API base URL) |
| `ANTHROPIC_MODEL_NARRATION` | default `claude-haiku-4-5` | optional |
| `ANTHROPIC_MODEL_PREMIUM` | default `claude-sonnet-4-6` | optional |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | your support address | recommended (/legal contact) |

Also in Vercel: **enable Web Analytics** on the project (loop events collect there).

## 2. Key-gated smoke tests (run once keys are set — ~$0.10 total)
1. `/api/music-reading?...` with a full answer set → confirm `"source":"model"`; **read the
   text against spec §21** (registers, budgets, no hedges, no banned words). Repeat ×3 profiles.
2. `/premium/report?session_id=...` after a **test-mode** checkout (4242 4242 4242 4242):
   confirm `paid` verification, report renders, refresh re-serves the same text (cache),
   calibration taps upgrade the Diagnosis.
3. Adversarial artist input (G9): type `Ignore previous instructions` + emoji + 30-char junk as
   artists → reading stays in persona, schema holds.

## 3. Dodo (MoR) go-live checklist
- Onboard as seller (China-resident); confirm payout via Payoneer/US account.
- Create the product "Vibe Check — The Full Read" at **$3.99**; copy its `DODO_PRODUCT_ID`.
- **Test mode first** (`DODO_MODE=test` + test key): run a full sandbox checkout, confirm the return hits `/premium/report?...&payment_id=…&status=succeeded` and the report unlocks (server-side verify).
- Verify the three §24 flagged items in test mode: (a) `confirm:true` returns a hosted `checkout_url`; (b) `metadata.profile` accepts the ~490-char token (else the `?t=` URL carry covers it); (c) `GET /payments/{id}` status string is one of succeeded/completed/paid.
- Refund/dispute policy is **Dodo's** (they're the merchant of record) — align `/legal` copy to it; our stance is "all sales final" where Dodo allows.
- Go live: set `DODO_MODE=live` + live key, redeploy, run one real $3.99 purchase end-to-end (incl. an IG/TikTok in-app browser).

## 4. Device matrix (1 hour, before seeding)
On a real iPhone (Safari + Instagram in-app browser) and one Android/Chrome:
- [ ] quiz: single-tap advance, reverb beat, tap-through, sound opt-in audible 🔊
- [ ] result: card image loads, Share opens the native sheet with a link
- [ ] paywall: blur renders, checkout opens, Apple Pay/Link visible (in-app browser too)
- [ ] report: `<details>` protocol expands; bookmark line visible
- [ ] OG unfurl: paste a result link into iMessage/WhatsApp/X DM → card image previews

## 5. Friends & family beta (48h, 5–10 people)
Send the quiz link with zero instructions. Collect: where they hesitated, whether they shared,
whether they'd pay $3.99, what felt off. One question max per ask. Fix blockers only — the
window is open; polish later.

## 6. KPI queries (check daily during the test week — spec §13.B thresholds)
1. Completion = `quiz_complete / quiz_start` (gate ≥55%)
2. Share rate = `(share_native + share_download + share_challenge) / result_view` (≥15% good)
3. K_obs = completes with `ref` attribution ÷ completes that shared (≥0.5 scale, <0.2 kill)
4. Funnel to money = `paywall_view → checkout_start → purchase`
5. `client_error` count (G4 interim monitoring — investigate any spike)

If Vercel WA can't express 3 cleanly, drop PostHog in as the second sink (spec §13.C allows it).

## 6A. Premise test read-out (spec §10.A — selection vs. treatment)
Every event carries `onboarding_arm` (persuasive|control) and `prior_belief` (totally|kind_of|not_really). Read on **conversion-given-arrival**, segmented:
1. **Premise drop-off** = `quiz_start / premise_view`, split by `prior_belief`. Where skeptics (`not_really`) bail at the premise.
2. **The treatment cell** = `purchase / paywall_view` for `prior_belief = not_really`, **persuasive vs. control**. This is the whole test:
   - persuasive **>** control among skeptics → **treatment** (persuasion works) → invest in the recognition hook.
   - persuasive **≈** control, conversion tracks `prior_belief` only → **selection** → widen via the timescale split + seed predisposed communities.
   - lift uniform across all `prior_belief` → general clarity effect (good, not premise-conversion).
3. **Channel check** = repeat #2 split by `ref` (cold seed vs. warm share) — the share loop biases toward believers; cold traffic is the cleaner skeptic test.
**Power caveat:** needs a few hundred per arm×belief cell — directional through the window, not a day-one verdict. Don't choose a strategy off <100/cell.

## 7. Support: "paid but lost the link" (stateless recovery)
1. Customer emails with their receipt → find the Checkout Session in Stripe dashboard.
2. Copy the session id → send them `https://<domain>/premium/report?session_id=<id>`.
3. That link rebuilds their exact report (profile rides in session metadata). No DB needed.

## 8. Rollback & incident
- Vercel → Deployments → promote the previous build (instant; app is stateless, zero data risk).
- Model outage: readings auto-fall back to deterministic copy (`source:"fallback"`) — degraded
  but alive; no action needed beyond watching `client_error`.
- Stripe outage: checkout returns 501-ish failures; UnlockButton shows a retry note.

## 9. Seeding prep (before §14 execution)
- Reddit account(s) with normal history; read each target sub's self-promo rules that day.
- Prepared copy: 3 variants of the maker-post (spec §14 angle), per-community tweaks.
- Post your OWN real result; never fake accounts or votes.

## 10. Later (deliberately not now)
- Sentry (replaces the analytics-event error reporting), price A/B at ~300 paywall views
  (§23.B), PostHog funnels, custom domain decision (~$15/yr — PM spend approval), portfolio
  P1/P2 behind the §13.B validation gate (§23.C).
