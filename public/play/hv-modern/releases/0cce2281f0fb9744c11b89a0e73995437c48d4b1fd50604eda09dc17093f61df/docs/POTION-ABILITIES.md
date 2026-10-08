# Potion-only ability candidates

This checkpoint extends the complete-Cure candidate with **Better Health Pots**
and **Better Mana Pots**, each with five ranks. It affects only the existing
Health Potion and Mana Potion items. The original abilities' Draught/Elixir
recovery-over-time branches are unfinished. Cards and purchase confirmations
show that limitation before AP is spent. No Spirit Potion, new stock, inventory
slots, draught, elixir or proficiency system is supplied.

## Community table and costs

[Abilities / General](https://ehwiki.org/wiki/Abilities#General), read2026-10-08,
showed the following total instant-Potion recovery values. AP prices are
incremental; cumulative values below are sums, matching the table totals.

| Ability | Rank | Minimum level | Incremental AP | Cumulative AP | Potion recovery |
|---|---:|---:|---:|---:|---|
| Better Health Pots | 1 | 0 | 1 | 1 | 110% baseHP |
| Better Health Pots | 2 | 100 | 2 | 3 | 120% baseHP |
| Better Health Pots | 3 | 200 | 3 | 6 | 130% baseHP |
| Better Health Pots | 4 | 300 | 4 | 10 | 140% baseHP |
| Better Health Pots | 5 | 400 | 5 | 15 | 150% baseHP |
| Better Mana Pots | 1 | 0 | 2 | 2 | 55% baseMP |
| Better Mana Pots | 2 | 80 | 3 | 5 | 60% baseMP |
| Better Mana Pots | 3 | 140 | 5 | 10 | 65% baseMP |
| Better Mana Pots | 4 | 220 | 7 | 17 | 70% baseMP |
| Better Mana Pots | 5 | 380 | 9 | 26 | 75% baseMP |

The source's level0 first-rank gates are preserved in the definitions; the
executable profile starts at level1. A rank replaces the previous percentage;
percentages are not added together. General abilities occupy Major slots, shared
with Tanks. Only a purchased and assigned ability is active. One slot holds its
highest owned rank. Buying or assigning a potion ability never raises resource
maxima, creates potions, or applies the other potion's benefit.

[Items / Restoratives](https://ehwiki.org/wiki/Items#Restoratives) supplies rank0
baselines100% baseHP and50% baseMP. [Character Menu / Item Inventory](https://ehwiki.org/wiki/Character_Menu#Item_Inventory)
lists ordinary item cooldown40. No potion-ability cooldown replacement appears
in the ability rows, so every rank retains the existing40-action candidate policy.
This does not borrow Better Cure's cooldown reductions.

Observed current-page footers were Abilities64891, Items65165 and Character
Menu64958. Direct historical revision retrievals failed; no revision date or
immutable body was independently retrieved. The current wiki warns pages may be
outdated during updates. All three tables remain community evidence for the
Persistent0.91 target, not verified original-server constants or exact timing.

## Formula, timing and scope

Recovery is `floor(baseResource × integerPercent / 100)`, then capped at the
current maximum. Exact integer arithmetic uses a single final floor. Rounding
remains an unverified candidate choice. Do not first floor a baseline Potion and
multiply again: baseMP19 at55% recovers10, not9. Tank can raise the cap, but never
the baseHP/baseMP input to this formula.

Each accepted item still consumes one owned potion, uses zero internal time,
draws no RNG, and keeps the previous candidate cooldown ordering. Item actions
leave Cure/spell cooldowns unchanged. Other eligible actions reduce item cooldown;
Continue/reload does not reset it. Full-resource rejection remains the existing
anti-misclick rule. These timing choices are preserved, not newly source-proven.

AP ownership remains independent of activation. Full health ranks cost15AP and
full mana ranks26AP; reset refunds only actual purchased ranks. It neither removes
completed paid Boost ranks nor refunds their Credits. Existing free-reset limits,
combat/wave-pause mutation locks and protected-save ownership checks still apply.

## Save and active-series compatibility

Rules become `persistent-0.91-training-v24`; current ability and restorative
policies are `potion-potency-candidate-v1`. New ability ledgers have exactly six
ownership keys. Migration strictly validates each older three/four-key model
before adding `betterHealthPots:0` and `betterManaPots:0`. Slots, paid AP,
completed/pending Training, reset use, Credits, supplies and RNG are preserved.
A historical model carrying either new key is rejected, even if that key is zero.

Prior `restoratives-candidate-v1` active series retain baseline100%/50% amounts
and40 cooldown. Earliest `legacy-training-v1` series retain their old maximum-based
50%/40% amounts and cooldown4. Both continue exactly through reload and wave pause.
New potion ownership in a prior active ability/restorative policy is rejected.
New battles pin the new policy; no running series gains a new potion effect merely
by loading its save. Terminal historical battles may coexist with later purchases.

Canonical keys and the exclusive writer lock stay stable. The inherited Cure
review-ID hardening is retained; its tests use synthetic delegated events, not a
native-browser loss reproduction. See SAVE-OWNERSHIP.md and COMPLETE-CURE.md.

## Validation and provenance

Run `npm run check`, `npm run build`, `npm run verify:checkpoint`.
Dedicated tests cover every gate/cost/rank, AP conservation, Major activation,
malformed inputs, strict old schemas, resource bases/rounding/caps, unchanged
cooldowns/timing, exact old-engine item replay, disclosure-before-payment, stale
review tokens, read-only observers and failed-save exportable memory.

The prior replay is synthetic and generated by exact complete-Cure successor
`260862182a885be0d0fbb661695510da738cf83b`; its full events/player/cooldowns/potions/RNG
are compared, with only version/model and two zero ownership keys migrated.
Twenty-five unaffected runtime modules remain byte-identical to that successor,
including protected storage/ownership, Training and Cure arithmetic. Abilities,
data, engine, restorative arithmetic and app presentation are explicitly changed
and hashed by the current source/deployed release manifest. Historical fixture
bytes and original artwork remain independently hash-checked. Native browser and
independent release acceptance are separate gates.
