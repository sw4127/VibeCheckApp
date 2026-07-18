# Instrument Defenses — the Prestige Test (of record, 2026-07-18)

Origin: PM red-team challenge ("second pass just tests short-term memory"). Ruling: NOT fatal —
direction of the confound is protective, and the design pre-cancels uniform drift. But the defense
must be PUBLIC: this content goes on the methodology page, the /learn FAQ, and the prepared HN
comment, because every sharp reader will raise it.

## Objection 1: "Participants remember the melody — the second pass measures memory, not bias."
**Answer (three layers):**
1. **Memory is anchoring, and anchoring opposes sway.** Remembering the clip and your own first
   rating pulls the second rating toward consistency. Memory cannot manufacture label-correlated
   movement; it suppresses movement. Measured sway is therefore a conservative floor (N3-friendly).
2. **Uniform second-pass drift cancels by design.** Re-exposure effects (familiarity lift, fatigue,
   regression to the mean) hit items regardless of label direction. The pool enforces direction
   balance (|up − down| ≤ 2, bias.test.ts contract), so the signed sway computation differences
   drift out; only label-correlated movement survives.
3. **Each user is their own control** — the same-items design is the standard within-subject
   paradigm of the label/price-bias literature; it is why no external ground truth is needed.

## Objection 2: "Takers guess the game and perform (compliance or defiance)."
**Answer:** purpose is not revealed until the debrief; defiance is itself measured (the contrarian
verdict names it as bias, not immunity). Residual demand effects are acknowledged on the methodology
page rather than denied.

## Approved hardening — v1.1 control items (send to CC as an RT decision)
Add 1–2 unlabeled re-rated items: rated in both passes with NO label either time. Yields a per-user
drift baseline subtracted from the sway stat → converts Objection 1 from caveat to published control.
Constraints: keeps session ≤ ~7 min; item schema gets `isControl: true`; excluded from verdict copy;
disclosed on the methodology page.

## Roadmap upgrade (post-norms, needs IRT data): between-form design
Different-but-difficulty-matched clips blind vs labeled, killing re-exposure entirely. Requires item
parameters from the accumulated dataset (D6) — impossible before norming, natural after. Record it as
the instrument's planned v2 in the write-up (it demonstrates the pipeline's purpose).

## Standing lesson (RT protocol addendum)
A confound objection must state its DIRECTION (does it inflate or deflate the measured effect?).
Deflating confounds are caveats; inflating confounds are emergencies. This one deflates.
