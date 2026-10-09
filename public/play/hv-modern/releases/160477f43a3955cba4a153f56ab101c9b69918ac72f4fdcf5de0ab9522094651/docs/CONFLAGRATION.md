# Conflagration: existing Fire target progression

New-series ability policy `conflagration-candidate-v1`, rules v29. This is an
original local implementation of a bounded source-backed ability, not recovered
historical source or verified original-server behavior.

## Sourced table and implemented scope

[Abilities revision64891](https://ehwiki.org/index.php?title=Abilities&oldid=64891),
re-read through [current Abilities](https://ehwiki.org/wiki/Abilities) on8October2026,
lists the following incremental AP costs and target caps. Its slot table places
spell abilities in Major slots.

| Rank | Level | AP increment | Fiery Blast cap | Inferno cap | Flames of Loki cap |
| --- | --- | --- | --- | --- | --- |
|1|50|3|4|—|—|
|2|100|4|4|6|—|
|3|150|5|5|6|—|
|4|200|6|5|6|8|
|5|250|8|5|6|9|
|6|300|10|5|7|9|
|7|400|12|5|7|10|

Only ranks1–3 are purchasable here, costing12AP total. The full seven-row table
is retained as immutable metadata; ranks4–7 cost36 additional AP in the source
but affect only higher-tier spells that are not implemented. They cannot be
purchased or imported as owned ranks in this bounded checkpoint.

Rank2 does not raise Fire above four targets. Its Inferno benefit is unfinished;
within this candidate it is the sequential prerequisite to rank3. That limitation
is shown on the ability card and again before purchase. Sequential purchasing is
the existing explicit local AP policy. No Inferno, Flames of Loki, new spell,
additional slot, free AP or resource grant is implied.

## Ownership, assignment and battle policy

Conflagration competes for owned Major capacity: five initial slots, expandable through the separately documented [Mastery purchases](MASTERY-SLOTS.md). Owning ranks without
assignment has no effect. New series use caps3/4/4/5 for unassigned/ranks1/2/3.
Old active series, including between-wave pauses, keep their original cap3 or
legacy single-target behavior until they end. Purchase, assignment, removal and
reset remain blocked during any active series. Reset returns exactly paid
incremental AP and uses the existing limited single-reset allowance; trainedAP
and levelAP accounting remain shared and conserved.

`getFireProfile(state)` reports the current-series rank, target cap, base cap,
source-based resource mode and whether the ability policy is enabled. UI previews
separate current effect from proposed rank/new-series effects.

The only combat change is the number of selected living targets. Selection
remains the existing authored order: chosen target first, then remaining living
enemies in roster order, up to the cap. MP cost, cast time, cooldown, accuracy,
damage, mitigation, Searing eligibility/probability/draw timing/expiry and
single-final-floor policies are unchanged. More selected targets naturally consume
more of the existing per-target draws; unrelated targets receive none. Existing
source uncertainties stay explicit.

## Strict migration

Every valid predecessor keeps all prior balances, ranks, slots, jobs, receipts
and active policies. Migration adds only `conflagration:0` and the current
ownership-model/version fields. The Spirit predecessor validator retains exactly
seven ownership keys and its original rank caps. Earlier validators remain strict.
All pre-v29 envelopes reject the future ownership field, even zero, and future
battle ability tag before widening, using its fixed historical identifier rather than a moving current-model alias. Existing pre-v27 rejection of future Spirit
policies remains tied to the historical Spirit identifier rather than changing
meaning whenever the current identifier advances.

The saved57-control manifest records distinct historical snapshots accepted by
exact frozen predecessor c5494ac across14 versions. Tests compare every normalized
field against predecessor hashes after reversing only the declared version/model/
zero-key change, and reject future fields/tags for each control. Stored historical
fixture bytes are unchanged. Separate recorded predecessor Fire traces preserve
complete events, enemy state, balances and RNG in practice and a dense Arena.

## Validation and delivery

Run `npm run check`, `npm run build`, `npm run verify:checkpoint`.
Coverage includes all level boundaries, purchase/reset and trainedAP conservation,
Major contention, stale review/ownership/save-failure paths, rank2 disclosure,
current/old series and wave pauses, target ordering, command replay/reload, and
an independent256-seed draw/damage oracle covering death, miss, glance, critical
and Searing branches. Synthetic controlled battle states and funded profiles are
labeled test inputs, not original account observations.

Five declared runtime/presentation modules change: abilities, combat-resources
(metadata only), data, engine and app. Twenty-five other modules, corrected CSS,
original artwork and prior fixture bytes retain exact accepted c5494ac bytes.
The release manifest separately verifies copied and transformed build files.
Independent source review and native acceptance remain separate gates.

Freeze detonation/slow scheduling, Protection uncertainties, periodic restoratives,
Killzone and Defend conflicts remain deferred in the full backlog.
