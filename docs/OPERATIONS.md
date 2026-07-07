# Operations — env, deploy, transferability

## Env vars (Vercel project settings; never committed)
| Var | Purpose | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | narration/hook/calibrate | server-only; removing it degrades ALL reads to deterministic fallbacks ($0, site stays whole) |
| `ANTHROPIC_MODEL_NARRATION` / `ANTHROPIC_MODEL_PREMIUM` | model pins | default haiku-4-5 / sonnet-4-6 |
| `NEXT_PUBLIC_BASE_URL` | share/OG absolute origin | required for correct unfurls |
| `PAYMENTS_PROVIDER`, `DODO_PAYMENT_LINK`, `DODO_API_KEY`, `DODO_MODE` | MoR checkout (spec §24) | unconfigured → 501 + dev-unlock in non-prod |
| `NEXT_PUBLIC_VOICE_AB` | §26 voice experiment gate | dormant |

## Deploy
Push to `main` → Vercel auto-deploy. Pre-deploy gate: `npm run build` + `npx vitest run` green. Card-route font tracing per spec §19.D.

## Transferability flags (diligence)
- **Dodo account is personal** (mainland-China founder constraint, spec §24). Buyer path: their own MoR/Stripe behind the provider-agnostic adapter (`src/lib/payments/`).
- **Vercel + GitHub on personal accounts**; repo transfer + env re-entry is the whole migration.
- **Domain not owned** — `NEXT_PUBLIC_BASE_URL` is the only binding (spec §19.C). "Vibe Check" name is generic/contested (spec §23.A) — treat brand as replaceable.
- **Key rotation:** swap `ANTHROPIC_API_KEY` in Vercel env; nothing else references it.
