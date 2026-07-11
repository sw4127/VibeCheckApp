# Red-Team Resolution Protocol (standing rule for Claude Code sessions)

Problem this solves: red-team sections bury PM asks in prose; asks get missed; blockers rot silently.

## Rule for Claude Code (add to every session; reference this file)

Every session output that contains a red-team/confession section MUST end with a block in exactly
this format — and any ask NOT in this block is deemed not asked:

```
== DECISIONS NEEDED ==
[RT-1] <one-line question, phrased so "yes/no/pick one" answers it>
       Severity: BLOCKER | SHIP-RISK | POLISH
       Options: (a) ... (b) ... (c) ...
       Default if PM silent for 7 days: <option> (must be the most reversible option)
       Serves: <memo D#/N# citation>
[RT-2] ...
== END DECISIONS ==
```

Rules:
- One decision per item. No compound asks.
- BLOCKER = critical path stops without an answer. SHIP-RISK = launches worse without an answer.
  POLISH = cosmetic; the default is fine.
- Defaults must be reversible choices, never one-way doors (pricing, data schema, deletions = no default, PM must answer).
- Anything red-teamed but NOT decision-relevant goes in the prose, not the block.

## Rule for the PM

- Only the block requires your response. Answer by ID ("RT-1: b"). Ignore prose guilt.
- If a session output has a red-team section but no block, reply: "Re-emit per docs/redteam-protocol.md."
- Paste any confusing red-team section into the Cowork seminar (Claude) for translation into this format.

## Paste-ready instruction for the next Claude Code session

> Adopt docs/redteam-protocol.md as a standing output convention: every red-team/confession section
> must end with the == DECISIONS NEEDED == block defined there. Re-emit the currently pending
> red-team asks in that format now, so no open ask is lost.
