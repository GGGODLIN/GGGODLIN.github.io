# Mastery slot purchasing candidate

Rules v30 introduces an ownership-ledger model, `mastery-slots-candidate-v1`.
The battle ability policy remains `conflagration-candidate-v1`: this checkpoint
changes capacity purchasing, not spell, damage, timing or RNG rules.

## Sources and complete costs

Public pages were read on 8 October 2026 and identified these footer revisions:
[Abilities64891](https://ehwiki.org/index.php?title=Abilities&oldid=64891),
[Leveling Up65211](https://ehwiki.org/index.php?title=Leveling_Up&oldid=65211), and
[Character/Abilities64563](https://ehwiki.org/index.php?title=Character/Abilities&oldid=64563).
These are community documentation, not authenticated original-server verification.
Each family starts with five free slots. Numbered slot prices are incremental;
cumulative columns below are arithmetic sums.

| Capacity | Major price | Major total | Supportive price | Supportive total |
| --- | --- | --- | --- | --- |
|1–5|0|0|0|0|
|6|1|1|1|1|
|7|1|2|1|2|
|8|1|3|1|3|
|9|1|4|1|4|
|10|2|6|1|5|
|11|2|8|1|6|
|12|2|10|1|7|
|13|2|12|2|9|
|14|2|14|2|11|
|15|3|17|2|13|
|16|3|20|2|15|
|17|3|23|2|17|
|18|4|27|3|20|
|19|4|31|3|23|
|20|5|36|4|27|

Mastery entitlement remains exactly the existing `floor(level/10)` for enabled
profiles, from zero through fifty. One shared budget pays both families; allocated
Mastery is the sum of their cumulative costs. Ability Boost supplies AP only.
Historical level-reward rows do not grant a second allowance. No Manifest Destiny,
donation, external entitlement or compensating thirteen-point grant is introduced:
full expansion of both families costs63, exceeding the50 level-earned maximum.
Legacy-disabled profiles keep zero entitlement and their original five empty slots.

## Persistent and transaction contract

Owned capacity is each existing assignment array's length, constrained to5–20.
No second writable balance or ownership counter is stored. An empty owned slot is
`null`; an assignment must remain owned, unique and in the correct family. Spend
and remaining Mastery are read-only derived values.

`quoteMasterySlotPurchase(state, family)` returns the selected family's current
count, next slot, fixed cost, total/allocated/remaining budget and after-purchase
balance. `purchaseMasterySlot(state, family, expectedCount)` requires an explicit
current count, revalidates the complete shared budget, and appends exactly one
null slot. Invalid family/count, stale count, insufficient budget, cap, battle or
read-only fields fail without mutation. Quotes never reserve a point.

The engine uses a direct cloned transaction, not the resource-reconciling ability
mutation path. A successful purchase changes only the selected slot array; it does
not refill HP/MP/SP, alter AP/ranks/assignments/credits, collect Training, change
stamina, advance clocks, increment command/event counters or draw RNG. Existing
assignment/removal and single-ability AP resets preserve capacity and Mastery
spend. Their prior resource-reconciliation behavior is not silently redefined.

The UI separates AP from Mastery and shows shared total, allocated and available
Mastery alongside each family's owned count/20 and next price. Confirmation binds
a simple review token, family and count and expires if either family's capacity
or the displayed shared budget changes. The engine independently checks current
budget at commit. Ownership loss and persistence failure retain the protected-save
behavior, including exportable unsaved memory.

## Refund boundary

Sources mention that a full ability reset clears unlocked slots, but do not
establish an exact Mastery refund amount or individual-slot resale contract.
This version implements purchases only: slot refunds and full resets are not
available. That limitation is disclosed before confirmation. It is not a claim
that original-game purchases are irreversible. Removing an ability or using the
existing single-ability reset does not sell its slot or return Mastery.

## Migration and battle preservation

Each predecessor validator remains frozen to exactly five slots per family.
Pre-v30 expanded arrays are rejected before widening. A valid prior profile gets
only its current ownership-model/rules-version metadata updated; no slot or point
is appended. AP ownership keys and ranks are unchanged. Old active Conflagration3
retains its five-target cap because the combat-policy identifier is unchanged.
All prior ability-policy allowances and future-tag rejection remain in force.

Recorded fixtures produced by exact c4c7b42 code cover active five-target Fire,
paid/completed Boost1 plus pending paid Boost2, and between-wave pauses. Their
funding and controlled enemy setups are explicitly synthetic; migrations preserve
all fields after only model/version normalization, including resources, paid jobs,
complete events and RNG. Prior stored fixture bytes are unchanged.

## Verification and presentation

Run `npm run check`, `npm run build`, `npm run verify:checkpoint`.
Tests cover all256 capacity pairs across levels1–500 and trained-AP controls,
every paid threshold,20-slot caps, cross-family exhaustion/stale reviews, no
refill, assignment/reset conservation, descriptor safety, historical imports,
writer loss, interrupted reviews, import/reload and failed persistence/export.

Four runtime/presentation modules intentionally change: abilities, data, engine
and app. Twenty-six other runtime modules and original artwork retain accepted
Conflagration bytes. Existing corrected CSS is retained as an exact prefix; only
Mastery layout/control styles are appended. Source checks do not certify native
layout or physical touch use; independent source and supported-width browser
acceptance remain separate gates.

Full resets, Mastery refunds, augments, Personas, Manifest Destiny, external perks,
Freeze/Protection source gaps and the broader game backlog remain deferred.
