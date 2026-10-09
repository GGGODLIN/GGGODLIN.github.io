# Manifest Destiny: source qualification

Research date: 2026-10-08 UTC. Public community-documentation qualification for Persistent. The source findings and the local implementation contract are distinguished below; no original-account price query was performed.

## Finding

Manifest Destiny has a consistent documented contract: ten ranks, one Mastery point per completed rank, 24 hours per rank, and eligibility at each fifty-level boundary. Its linear prices have no observed rounding or table disagreement.

| Source read successfully | Observed footer revision | Relevant evidence |
| --- | --- | --- |
| [Training](https://ehwiki.org/wiki/Training) | [65215](https://ehwiki.org/index.php?title=Training&oldid=65215) | Overview row, level-limit footnote b, Costs formula, Values constants |
| [Abilities: Mastery Sources](https://ehwiki.org/wiki/Abilities#Mastery_Sources) | [64891](https://ehwiki.org/index.php?title=Abilities&oldid=64891) | One Mastery per training rank, capped by player level/50 |
| [Leveling Up](https://ehwiki.org/wiki/Leveling_Up#Certain_Levels) | [65211](https://ehwiki.org/index.php?title=Leveling_Up&oldid=65211) | Explicit rank 1–10 gates at levels 50–500 |

Revision links above were obtained from the current pages' footers. Their historical bodies, timestamps, and diffs were not independently fetched. Previously blocked revision/history/forum routes were not retried. This is community-documentation evidence, not original-server verification or proof of unchanged Persistent 0.91 behavior.

## Exact documented calculation and derived schedule

[Training Costs](https://ehwiki.org/wiki/Training#Costs) defines the next purchase using current completed rank `N`:

`round((base_cost + level_cost * N) ^ (1 + exponent * N))`

Manifest Destiny constants: `base_cost = 1,000,000`, `level_cost = 1,000,000`, `exponent = 0`.

Thus for purchased rank `r = N + 1`, `price(r) = 1,000,000 × r`; cumulative expenditure through rank `r` is `500,000 × r × (r + 1)`. Integer eligibility is `r <= min(10, floor(playerLevel / 50))`. The gates below are also explicitly enumerated by Leveling Up. Prices and cumulative totals were recomputed with JavaScript arithmetic from the published constants, not copied from an original-account price list.

| Purchased rank | Minimum level | Incremental Credits | Cumulative Credits |
| ---: | ---: | ---: | ---: |
| 1 | 50 | 1,000,000 | 1,000,000 |
| 2 | 100 | 2,000,000 | 3,000,000 |
| 3 | 150 | 3,000,000 | 6,000,000 |
| 4 | 200 | 4,000,000 | 10,000,000 |
| 5 | 250 | 5,000,000 | 15,000,000 |
| 6 | 300 | 6,000,000 | 21,000,000 |
| 7 | 350 | 7,000,000 | 28,000,000 |
| 8 | 400 | 8,000,000 | 36,000,000 |
| 9 | 450 | 9,000,000 | 45,000,000 |
| 10 | 500 | 10,000,000 | 55,000,000 |

The computed first price, last price, and total equal Training's published 1,000,000 / 10,000,000 / 55,000,000. With exponent zero, all unrounded prices are integers: half-up, ties-to-even, floor, and ceiling yield identical results. The source's general rounding convention is therefore immaterial to these ten prices.

## Corroboration and lifecycle

[Chinese Training](https://ehwiki.org/wiki/Training/Chinese), footer [57768](https://ehwiki.org/index.php?title=Training/Chinese&oldid=57768), agrees on Manifest Destiny's constants, endpoints, total, duration, cap, gate, and reward. [Japanese Training](https://wikiwiki.jp/hentaiverse/Training) agrees on the summary values and links its cost explanation to EHWiki. These are corroborating community copies, not independent measurements. The unrelated Ability Boost/Adept Learner discrepancies recorded in `training-progression-research.md` do not occur in this row.

Chinese Training also corroborates one active training at a time, full refund on abort, no reversal/refund after completion, and revisiting Training after elapsed completion to receive the effect. The exact boundary between elapsed completion and an unclaimed job is not fully specified; no late-abort behavior is inferred.

Both Training versions say combat may continue after initiation. They do not establish whether initiation, cancellation, or collection is permitted during an active battle. Any inherited candidate restriction on those actions, deadline equality rule, clock handling, or battle/save reconciliation remains a local contract requiring its own acceptance; it is not newly source-verified here.

## Sourced entitlement boundaries

[Abilities](https://ehwiki.org/wiki/Abilities#Mastery_Sources) distinguishes level-earned Mastery from trained Mastery. For supported levels 1–500, the source-backed entitlement calculation would be `floor(level / 10) + completedManifestDestinyRanks`, with training ranks constrained as above. A level gate permits training; it does not award a rank automatically. No reward should be inferred from merely starting or paying for a job.

At level 500 with all ten completed ranks, this produces 60 Mastery. Major and Supportive maximum capacities cost 36 + 27 = 63 under the [Abilities Uses table](https://ehwiki.org/wiki/Abilities#Uses), so even this addition leaves a three-point shortfall. Do not compensate for it. Donations, Hath, external grants, augments, Personas, slot refunds/full resets, and Isekai behavior remain outside this qualification. No legacy profile is evidenced to own purchased Manifest Destiny ranks merely because of its level or saved balance.

## Local implementation contract

Save rules v31 adds `manifestDestinyRank` to the strict
`manifest-training-candidate-v1` ledger. Every prior supported envelope migrates
with zero completed ranks, preserving its existing paid Adept/Ability Boost job,
rank, deadline and receipt. Future fields, model names or Manifest job identities
inside historical envelopes are rejected before migration. The predecessor
level-capped Training validator is preserved under `src/compat/`.

Completed Manifest rank is the only trained Mastery entitlement source. Total
Mastery is level-earned floor(level/10) plus validated completed Manifest ranks;
there is no editable Mastery balance or automatic slot purchase. Pending and
elapsed-but-uncollected jobs grant no point. AP, Adept EXP, all battle policy IDs,
resources, items, activity counters and RNG are unchanged by this training.
Mastery slot purchase remains a separate exact-price action with shared budget.
No training grants a Major/Supportive slot, assigns an ability, or refills HP/MP/SP.

The existing shared one-job lifecycle remains: start charges one rank's quoted
price, before-deadline cancellation refunds exactly its paid Credits, and an
owner-authorized Training visit outside unfinished battle collects completion
once. No auto-renewal, queue, completed-rank refund or full reset is added. The
before-deadline-only refund and active/paused-battle restrictions are inherited
local candidate policies, not newly verified original-server behavior. Starting a
job does not stop ordinary combat; its real-time countdown continues while the
player fights, but collection waits until the series ends and Training is visited.

Versioned source tests cover the complete ten-rank schedule, level/cost/deadline
boundaries, mixed-family work and refunds, unchanged historical paid jobs, strict
future-field rejection, ownership/persistence failure, extra-capacity accounting
and the intentional60-versus63 limit. Time-based tests use explicitly synthetic
clocks; native QA may import a labelled mature job and must not claim to have
waited a real24hours. Original artwork and all unrelated combat kernels remain
pinned to the accepted predecessor.

Run `npm run check`, `npm run build` and `npm run verify:checkpoint` before
packaging. Source/build acceptance and actual native browser acceptance are
separate gates. This remains a community-source candidate, not an original-server
reproduction claim.
