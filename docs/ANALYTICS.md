# Analytics — event dictionary & canonical funnel

Sinks: Vercel Web Analytics (pageviews; custom events Pro-only) + **PostHog free cloud (primary for funnels/D6)**, both client-side, no DB, no PII. Attribution (`ref/src/from/utm_*`) captured once per session from the entry URL (sessionStorage) and auto-attached to every event (`src/lib/analytics.ts`).

**Ops self-check:** `/api/health` reports env completeness (booleans only). Missing analytics env now fails LOUD: build-time warning (next.config.ts) + dev banner + console warning (`src/components/EnvBanner.tsx`). Silent no-op class killed 2026-07-16 (brief §3.A2).

## Bias funnel (taste gym flagship — the D6 dataset)
| Event | Fires | Props |
|---|---|---|
| `landing_view` | `/` mount | `variant: "gym"` |
| `bias_frame_view` | `/bias` Hume frame shown | — |
| `bias_start` | blind pass begun | — |
| `bias_blind_complete` | 8th blind rating | — |
| `bias_labeled_complete` | 8th labeled rating | `pct`, `verdict` |
| `bias_result` | verdict computed (interim D6 record) | `pool`, `poolVersion`, `hash`, `blind`/`labeled` CSVs, `listen_b`/`listen_l` CSVs, `pct`, `swappedPct`, `swayShare`, `edges`, `verdict` |
| `bias_debrief_view` | mandatory debrief shown | — |
| `bias_result_view` | `/bias/result` (own + shared links) | `pct`, `verdict` |
| `bias_locked_tier_tap` | locked delicacy machine tapped | — |
| `client_error` | route error boundary (site-wide, incl. the gym) | `digest`, `message`, `path` |

Canonical funnel: `landing_view → bias_frame_view → bias_start → bias_blind_complete → bias_labeled_complete → bias_result → bias_debrief_view`.
**E2E QA 2026-07-16:** full scripted local session — every event above fired in order (dev `[track]` log). **Prod wire verified 2026-07-16:** deployed bundle carries the PostHog key; `landing_view` capture observed returning HTTP 200 from `us.i.posthog.com`.
QA/dev sessions: enter with `?ref=dev` so analysis scripts can exclude them from norms (N3).

## Events (legacy funnel — WC/music)
| Event | Fires | Props |
|---|---|---|
| `landing_view` | `/` mount | attribution |
| `fan_verdict_picker` / `fan_verdict_view` | `/fan-verdict` | `player` |
| `premise_view` | music quiz Q0 shown (cold entrants only) | `variant` |
| `quiz_start` | WC: mount · music: Q0 answered, or mount when `bridged` | `variant`, `bridged`, `prior_belief` (auto) |
| `quiz_complete` | last tap | `variant`, `archetype`, `player` (WC), `bridged` |
| `result_view` | result page | `variant`, `archetype`, `player`, `source` (model/fallback/local), `voice` |
| `sharpen_read` | artist field submitted | `artists` (count) |
| `share_native` / `share_challenge` / `share_download` | share actions | — |
| `paywall_view` | `/premium/preview` | `profile` = `"token"` (real user) or sample id (direct) |
| `paid_calibration` | C/A/N taps or free-text | `taps`, `via` |
| `purchase` | verified unlock, once per order (sessionStorage guard) | `profile`, `source` |
| `fakedoor_*` | reserved for §23.C demand gates | — |

## Canonical funnel
`landing_view → quiz_start(wc) → quiz_complete(wc) → result_view(wc) → quiz_start(music) → quiz_complete(music) → result_view(music) → paywall_view → purchase`
Thresholds: §13.B (completion ≥55–60% · share ≥15%/8% · K_obs ≥0.5/<0.2). Funnel snapshots live in `docs/analytics/` (page-level export committed; prefer PostHog funnels for step rates — Vercel WA custom events are Pro-only (see OPERATIONS.md)).
