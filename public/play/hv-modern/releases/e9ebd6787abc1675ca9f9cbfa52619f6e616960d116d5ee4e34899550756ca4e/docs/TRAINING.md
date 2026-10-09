# Adept Learner: paid real-time training

Checkpoint22 adds an earned-Credits → one-hour study → permanent EXP benefit loop. Later extensions implement [all level-capped Ability Boost ranks](FULL-ABILITY-BOOST.md) and [ten Manifest Destiny ranks](MANIFEST-DESTINY.md), sharing one paid job slot; the remaining Training catalog is preserved in the backlog. This document describes the unchanged Adept behavior.

## Evidence and explicit choices

Canonical public pages read2026-10-07:

- [Training](https://ehwiki.org/wiki/Training), observed revision65215: Adept grants+1%EXP per completed rank, has300ranks, takes1hour per rank, and permits one training at a time. Aborting refunds payment; completed training is nonrefundable. Battles may continue while training runs. After leaving Training, revisit it when the time has elapsed to receive the benefit
- [Experience Points](https://ehwiki.org/wiki/Experience_Points),65116: training belongs to the additive training/Hath group, before the separate stamina/difficulty/mode factors. With external bonuses disabled, rankN supplies `1+N/100`, reaching4× at300. The page marks sum-then-ceil rounding as uncertain

Cost for completed rankN → N+1 is the printed candidate:

`round((100 + 50N) ** (1 + 0.000417446N))`

First costs are100,150,201,252,303Credits. AtN=299 the formula produces49,999, and its total is5,126,663; the wiki table instead gives50,000 and5,126,661. The implementation preserves the printed formula and JavaScript positive-number nearest rounding, names the policy, and does not silently alter a few prices to fit the aggregate. Internal source precision/tie handling remain unverified.

Elapsed-but-uncollected cancellation and exact mid-battle activation are not documented. This slice adopts two conservative, visible choices: cancellation only strictly before the deadline; all training mutations/collection are out of combat, including wave pause. A learned rank is snapshotted when the next series starts. These are local candidates, not verified original-server boundaries.

## Playable behavior

A normal First Blood clear provides100Credits, enough for rank1. Preview/canceling a start confirmation costs nothing. Confirming deducts the quoted price and records a deadline exactly3,600,000milliseconds later. This is wall time, not battle turns/ticks. There is no time acceleration, starter rank, queue, repeat order, direct EXP grant or material substitute.

The deadline persists across closing/reloading and offline time. Visiting Training after it expires collects exactly one rank. The same check can run while that screen remains visible, but never through an open confirmation modal, a pending old-save retention decision or an active battle. Outside that screen, elapsed time alone does not add a rank. Countdown redraws do not write saves or advance gameplay.

Before expiry, an explicit cancellation returns the recorded payment once. At/after expiry, refund is unavailable under the declared conservative policy. Stale confirmations must be reviewed again. Insufficient funds, concurrent jobs, rankcap, invalid/backwards recorded training time, refund overflow and read-only state fail without partial changes.

The benefit multiplies unrounded won-round EXP before its existing final ceiling. Example: twoLv20/PL100 monsters atGreat stamina yield43EXP without Adept and44 with rank1; one such monster still yields22 in both cases. Do not multiply an already rounded22 by1.01 and ceil again. An actual Learning Curves fixture yields130→132EXP, while Credits and equipment rewards stay unchanged. Unrewarded practice still gives noEXP.

## Compatibility and limits

Prior profiles receive an empty Training ledger, no rank, job, refund or currency. Old active series receive a pinned `none-v1`/rank0 policy and replay exactly. Current series persist their entry rank; completing a later study does not rewrite a finished series or its receipts. Soulbound anchors, material purchases and existing assets remain intact.

The ledger keeps one job and one latest-action receipt. Local timestamps are injected and bounded to four-digit UTC years; they are not a trusted online clock. A coherently edited/rolled-back local save can cheat, so no server authority or cross-tab guarantee is claimed. Existing per-mode reward limits, authored encounters and missing drops remain separate gaps.

See [TRAINING-LEDGER](./TRAINING-LEDGER.md) for the exact record/API contract. Ability Boost, Scavenger, Luck and other training families remain unimplemented rather than receiving placeholder bonuses.
