# Bias Pool Gatekeeping Checklist (PM sign-off per item)

Owner: PM. Applies to every item in `src/content/bias/items.ts`, v1 and all future pool changes.
Principle: the PM gatekeeps **experiment validity and legality, not aesthetics**. There is no correct
rating in this instrument — the user is their own control (memo D2). Quality designations for swaps
come from documented consensus (reviews, awards, reception history), cited, never from our taste (N3).

## Per-item checklist — all boxes required before commit

### A. License (the expensive-mistake category)
- [ ] The **recording** (not just the composition) is PD, CC0, or CC-BY. *(PD composition ≠ PD recording — a modern performance of Beethoven is copyrighted.)*
- [ ] License is **not** CC-NC (we have a paid tier = commercial use) and **not** CC-ND (we trim clips = derivative).
- [ ] CC-BY-SA only with engineer sign-off (share-alike obligations on our edits).
- [ ] Proof URL of the license saved in the item's source note (Musopen / IMSLP / LoC Jukebox / Wikimedia page).
- [ ] `attribution` field follows TASL (Title, Author, Source, License) + "excerpt/trimmed" noted for CC works.

### B. Truth & safety (N3 + defamation line)
- [ ] `trueArtist` and debrief attribution are factually true.
- [ ] Fake blurbs are **never attributed to real critics or real publications** (unattributed framing or fictional sources only).
- [ ] Dismissal blurbs target the work's *reception*, never a real person's character; no fabricated quotes anywhere.
- [ ] Swap designations ("strong work" / "lesser work") backed by a citable reception record, noted in the source note.

### C. Manipulation credibility (PM-as-layman is the ideal judge)
- [ ] The blurb would convince *you*. If it reads fake to a non-expert, rewrite.
- [ ] Prestige signals sound like real acclaim vocabulary (awards, critical-consensus phrasing) without naming real sources.
- [ ] Swapped items: you did NOT recognize the piece on first listen. If the PM recognizes it, it is too famous to swap.

### D. Stimulus sanity (layman ear-checks)
- [ ] The 20-second window contains something judgeable (melodic phrase / hook, not intro drone or silence).
- [ ] Recording fidelity is roughly consistent with the rest of the pool (no clip whose hiss/loudness makes users rate audio quality instead of music).
- [ ] Loudness roughly normalized across the pool (engineer runs the check; PM ear-confirms).

## Pool-level checks (beyond what bias.test.ts enforces)
- [ ] Variety of era/genre/mood across items — no monoculture.
- [ ] Genuine quality spread per documented reception (some acclaimed, some middling) so ratings have variance.
- [ ] 2–3 approved backup items pass the same checklist (swaps for post-launch issues).

## PM one-time research list (~2–3 hours total)
1. CC license tiers + the PD-recording distinction: Creative Commons license chooser + "TASL" attribution guide.
2. Source catalogs: Musopen (commissioned PD recordings), IMSLP CC performances, Library of Congress National Jukebox, Wikimedia Commons audio, Free Music Archive (filter CC-BY only).
3. Prestige vocabulary: skim how Gramophone / AllMusic / year-end lists praise and dismiss — for *tone*, not for quoting.
4. NOT needed: music theory, canon knowledge, performance criticism.
