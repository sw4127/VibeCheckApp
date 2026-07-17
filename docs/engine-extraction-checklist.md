# Engine-Repo Extraction Checklist — executed to "ready to flip public"

Status: EXECUTED 2026-07-16 (brief §3.E11 — serves C2/N1; Tier-1 KPI gate RT-13a).
Package: `packages/hume-taste-engine` (extracted 2026-07-12, launch-checklist item 4a).
**The flip itself is NOT in this checklist's authority — publication (GitHub repo public / npm)
is an outward-facing action that needs explicit owner approval.**

## Verified this session (all pass)

- [x] **MIT license present** — `LICENSE`, "Copyright (c) 2026 Siqi Wang".
- [x] **README complete** — instrument description, API surface, honest-measurement notes,
      architecture diagram (mermaid, renders on GitHub — added this session).
- [x] **Standalone compile** — `npx tsc --noEmit --strict` on `src/index.ts` exits 0; no app
      imports (`@/...`) anywhere in the package (scanned).
- [x] **No secrets** — scanned for key/token/password patterns: clean.
- [x] **Copy sync** — `src/bias.ts` is byte-identical to the app's `src/engine/bias.ts` except
      the intentional 2-line EXTRACTED-COPY banner (diffed this session). Source of truth stays
      in the app until first publish, per the package `$comment`.
- [x] **package.json hygiene** — name, description, keywords, `license: MIT`, `private: true`
      (the safety latch — publication requires flipping it deliberately).

## Remaining at flip time (owner-approved publication session)

- [x] **Owner approval recorded 2026-07-17 (RT-3a):** mechanics approved for the next session —
      standalone repo, tests ported, PM reviews the final repo BEFORE it turns public.
- [ ] Decide repo shape: standalone repo (clean history, no app code) vs. monorepo-public.
      Standalone recommended: the app contains the item pool + swap fictions, which should NOT
      be public while the instrument is live (test integrity).
- [ ] Port the engine + codec test files (they live in the app suite today; a public repo ships
      its tests). Currently: bias engine/codec tests pass in the app (930-test suite green).
- [ ] Fix the README's `../../ARCHITECTURE.md` relative link (breaks outside the monorepo).
- [ ] `private: true` → versioned publish decision (GitHub first; npm optional, N2-check it).
- [ ] Repo topics/keywords + social-preview image (channel-research item, brief §4).
- [ ] README demo: link the write-up + a `--demo` chart render (SYNTHETIC-watermarked, N3).

## Test-integrity note (of record)

The public engine is content-free math — publishing it does NOT reveal which labels are swapped.
The item pool (`src/content/bias/`, manifest, swap fictions) stays private while the instrument
collects cohort data. This boundary is what makes "open core + hosted instrument" (memo §7)
workable.
