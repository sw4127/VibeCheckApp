# Analytics — event dictionary & canonical funnel

Sink: Vercel Web Analytics (free tier), client-side, no DB, no PII. Attribution (`ref/src/from/utm_*`) captured once per session from the entry URL (sessionStorage) and auto-attached to every event (`src/lib/analytics.ts`).

## Events
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
