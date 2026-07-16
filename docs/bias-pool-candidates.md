# Prestige-Bias Pool — Candidate Clips (v1 draft for PM review)

Status: RESEARCH DRAFT. Claude (Cowork) owns checklist §A/§B; PM owns §C/§D + red-team.
Honesty note (N3): "License" below = what the source publishes as of research date (2026-07).
**Every license must be re-confirmed on the linked page at download time** and the proof URL
recorded in `items.ts` source notes. Nothing here is committed until the PM passes C/D.

Design targets (enforced by bias.test.ts): ≥8 items · 2–3 swaps · |up−down| ≤ 2 · ≥1 swap each direction.
Fidelity rule: modern recordings only — no 78rpm/acoustic-era transfers (fidelity confound, checklist D).

---

## Tier 1 — strongest candidates (license clarity + fidelity)

**1. Bach, Goldberg Variations — a middle variation (e.g., Var. 13), Kimiko Ishizaka**
License: **CC0** · Proof: opengoldbergvariations.org (also FMA/Internet Archive mirrors)
Genre/era: Baroque keyboard, modern studio recording.
Reception note: canonical masterwork; the recording itself is a documented, acclaimed open project.
Proposed role: **down-swap** (dismissive blurb on a strong work) — labelIsTrue: false, direction: down.
Draft blurb (down): "A crowd-funded amateur recording; often cited as an example of why great works need great labels."
⚠️ Do NOT use the opening Aria (too recognizable, checklist C.3). PM must ear-check the chosen variation for recognizability.

**2. Bach, Well-Tempered Clavier Bk 1 — a less-famous prelude/fugue (NOT the C-major BWV 846), Kimiko Ishizaka**
License: **CC0 — VERIFIED 2026-07-11** on archive.org/details/bach-well-tempered-clavier-book-1
("Rights: Released under CC0 1.0 Universal" + a bundled LICENSE PDF in the item; direct MP3/FLAC download, no login).
**Preferred download source for the pipeline: archive.org (direct URLs + machine-readable license), not FMA (login-walled).**
Proposed role: true label, direction: up.
Draft blurb (up): "From a recording project so admired it was placed in the public domain as a cultural gift."

**3. Chopin, Nocturne Op. 15 No. 3 in G minor — Musopen catalog performer**
License: verify on musopen.org piece page (**PD or CC0 preferred; if CC-BY-SA → engineer flag**)
Reception note: the un-famous sibling of famous nocturnes; documented as under-programmed.
Proposed role: true label, direction: down.
Draft blurb (down): "The nocturne recital programmers skip; even devoted Chopin listeners rarely defend it."

**4. Debussy, Préludes Book 1 — "Voiles" — Musopen catalog performer**
License: verify on musopen.org piece page.
Proposed role: true label, direction: up.
Draft blurb (up): "A cornerstone of modern piano writing; routinely taught as a model of atmosphere built from almost nothing."

**5. Brahms, Intermezzo Op. 117 No. 1 — Musopen catalog performer**
License: verify on musopen.org piece page.
Proposed role: true label, direction: up. (Backup role: swap-up target if the pool needs it.)
Draft blurb (up): "Described in the composer's own circle as a lullaby to his sorrows; a late-life masterpiece in miniature."
⚠️ Moderately recognizable to classical listeners — PM recognizability check decides.

**6. Chris Zabriskie — deep-catalog track (avoid the YouTube-worn hits, e.g., pick from a later album)**
License: **CC-BY 4.0** · Proof: teamopen.cc/chris + the FMA/artist page per track. Attribution required (TASL + "excerpt").
Genre: ambient/post-rock, modern production.
Proposed role: **up-swap** (prestige blurb on a lesser-known work) — labelIsTrue: false, direction: up.
Draft blurb (up): "Festival-commissioned; the closing piece of an award-winning installation about memory."
⚠️ PM check C.3 hard: Zabriskie tracks are common YouTube background music — reject any that feels familiar.
**Shortlist rule (of record, 2026-07-11):** shortlist ONLY from the deep-catalog albums *Music from
Neptune Flux* or *Direct to Video*. **Hard exclusions (C.3 pre-fail):** the *Cylinders* series,
"Prelude No. 2," "The Temperature of the Air on the Bow of the Kaleetan," "I Am a Man Who Will
Fight for Your Honor." Filters: instrumental · ≥60s source length (window headroom) · production
that sits level with the pool (no lo-fi outlier).

**7. Komiku or Monplaisir (Rrrrrose Azerty) — one track**
License: **CC0** · Proof: FMA artist page per track.
Genre: playful electronic / game-adjacent — maximum genre contrast in the pool.
Proposed role: **up-swap** candidate (acclaim blurb on a modest work) or true-label down.
Draft blurb (up-swap): "A minimalist study praised on year-end experimental lists for doing more with less."
Draft blurb (true down): "Background music in the most literal sense; composed at volume, released in bulk."
**Shortlist rule (of record, 2026-07-11):** shortlist ONLY from *Tale on the Late* — the mellow,
composerly album where an acclaim blurb reads credible; the bouncy *It's time for adventure!*
volumes would fight their own prestige label. Same filters as item 6: instrumental · ≥60s ·
production level with the pool.
**RT-9 decision (PM, 2026-07-11): option (b)** — this item is the third swap (up-swap: acclaim
blurb on a modest work). Pool rebalances to 3 swaps, 5-up/3-down (contract-passing).

**8. Jason Shaw (Audionautix) — one acoustic/folk track**
License: **CC-BY 4.0** · Proof: audionautix.com/creative-commons-music (credit "music by audionautix.com").
Genre: acoustic/folk, modern production.
Proposed role: true label, direction: down.
Draft blurb (down): "Stock production music, written to be inoffensive; the audio equivalent of a waiting room."

## Tier 2 — verify-then-use (license mixed at source)

**9. Kai Engel — track from a CC-BY album ("Idea" era) — NOT the CC-BY-NC albums**
License: **CC-BY only if the specific track page says so — several albums are NC (off-limits, paid tier).**
⚠️ Checked 2026-07-11: the FMA "Idea" ALBUM page says "check individual tracks" — license lives at track level,
and FMA downloads are login-walled. Prefer the artist's archive.org mirrors; verify license per track there.
Genre: cinematic/neoclassical. Proposed role: flexible filler, direction as balance requires.

**10. Dee Yan-Key — one jazz/neoclassical track**
License: verify per track — much of the catalog is **CC-BY-SA** → engineer sign-off required (share-alike).
Genre: jazz — fills the pool's jazz gap. Proposed role: true label, direction: up.
Draft blurb (up): "A schoolteacher by day whose nocturnal recordings developed a quiet cult following."  *(true-flavored — verify facts before use)*

**11. Lorenzo's Music — one indie-rock track**
License: **CC-BY-SA 4.0** (lorenzosmusic.com) → engineer sign-off required.
Genre: indie rock with vocals — only vocal candidate; PM decides if vocals belong in v1 at all (lyrics add a comprehension variable).

## Backups (2–3 required by checklist)

**B1.** Second Ishizaka WTC prelude (CC0) — instant swap-in, same pipeline.
**B2.** Second Musopen piece (e.g., Satie Gnossienne No. 4 — No. 1 is too famous) — verify license.
**B3.** Second Komiku/Monplaisir track (CC0).

---

## Pool balance check (proposed v1 = items 1–8)
- Swaps: #1 (down-swap), #6 (up-swap), #7 (up-swap option) → 2–3 swaps, both directions ✓
- Directions: up = 2,4,5,6(,7) · down = 1,3,8 → |up−down| ≤ 2 ✓ (tune with #7's role)
- Genres: baroque, romantic, impressionist, ambient, electronic, folk ✓ · Fidelity: all modern ✓

## Blurb rules applied (checklist B)
No real critics/publications named; no fabricated quotes; dismissals target reception/work, never a person's
character; swap blurbs are the sanctioned deception, confessed on the debrief screen with true attribution.

## PM to-do (checklist C/D per item)
1. Download each candidate from the proof source; confirm the license line on the page; save the URL.
2. First-listen recognizability check (C.3) — reject anything familiar.
3. Pick the 20s window (D.1: something judgeable) — note start/end timestamps per item.
4. Blurb believability pass (C.1) — flag any line that reads fake to you.
5. Hand the trimmed list to Claude Code for loudness normalization + `items.ts` wiring.
