# Ability ownership and slots

`src/abilities.js` implements an original, bounded ownership candidate: `mastery-slots-candidate-v1`, with the unchanged `conflagration-candidate-v1` battle policy. It maintains purchased ranks, their assignment to slots, and a finite free-reset counter. It does not reproduce a full ability tree or claim exact original-server behavior.

## Source evidence and uncertainty

The accessible live pages were checked on 2026-10-07. Their footers identified these revisions:

- [Character/Abilities, revision 64563](https://ehwiki.org/index.php?title=Character/Abilities&oldid=64563): one AP per level; purchasing and activating abilities are separate interactions
- [Abilities, revision 64891](https://ehwiki.org/index.php?title=Abilities&oldid=64891): tank rank data, slot categories, assignment-required benefits, and reset descriptions
- [Leveling Up, revision 65211](https://ehwiki.org/index.php?title=Leveling_Up&oldid=65211): AP on level gains and Mastery at each ten-level boundary through level 500

The supported public table entries are:

| Ability | Rank 1 gate / incremental AP / total bonus | Rank 2 gate / incremental AP / total bonus |
| --- | --- | --- |
| HP Tank | Level 0 / 1 / +10% maximum HP | Level 25 / 2 / +20% maximum HP |
| MP Tank | Level 0 / 1 / +10% maximum MP | Level 30 / 2 / +20% maximum MP |
| SP Tank | Level 0 / 1 / +10% maximum SP | Level 40 / 2 / +20% maximum SP |

The source starts characters with five Major and five Supportive slots. General abilities use Major slots. An owned ability needs an assignment to confer benefits. The source includes additional ranks and abilities; the complete ten-rank Tank tables are now recorded in [COMPLETE-TANKS](COMPLETE-TANKS.md).

The reset prose says the first ten single-ability resets are free, while its table uses an ambiguous `<10` row. The named policy `ten-free-single-resets-candidate-v1` follows the prose: exactly ten successful resets. This boundary is a candidate interpretation, not independently verified account behavior. No paid reset is attempted after the allowance runs out.

### Inferred level-one entitlement

`levelAP = current level` includes one initial point at level 1. The one-point-per-level statement supports this model, but an initial level-one account balance was not directly verified from an account screenshot. `ABILITY_POLICY.levelOneAPStatus` records `inferred-initial-point`. No training, donation, Hath, or external allowance is inferred.

Level AP is derived from the current level exactly once; separately validated completed Ability Boost adds trained AP. Existing `levelRewards` entries are historical records, not an additional budget. Mastery is `floor(level / 10) + trainedMastery`, where trained Mastery comes only from validated completed [Manifest Destiny](MANIFEST-DESTINY.md) ranks; the current capacity-purchase model derives allocated Mastery from the two slot lengths and source tables. See [MASTERY-SLOTS](MASTERY-SLOTS.md) for purchase-only scope and historical five-slot migration. A fresh level-20 candidate therefore has 20 AP and 2 unallocated Mastery; buying all three first ranks leaves 17 AP. These are candidate entitlements, not new EXP or battle rewards.

## State and conservation

`createAbilityState(enabled = true)` returns a fresh ledger:

```js
{
  model: 'mastery-slots-candidate-v1',
  entitlementMode: 'level-candidate',
  purchased: { hpTank: 0, mpTank: 0, spTank: 0, betterCure: 0, betterHealthPots: 0, betterManaPots: 0, betterSpiritPots: 0, conflagration: 0 },
  majorSlots: [null, null, null, null, null],
  supportiveSlots: [null, null, null, null, null],
  freeSingleResetsUsed: 0
}
```

`enabled = false` creates the same empty shape with `entitlementMode: 'legacy-disabled'`. Its ownership and reset counter must stay zero, every slot stays empty, summary entitlements are zero, and all changes are blocked. The helper does not silently convert legacy attributes or compensate an old save.

- A purchased Tank rank is an integer0–10 (Better Cure0–3; each potion ability0–5; Conflagration0–3), and every owned rank must satisfy its current level gate
- Rank costs are cumulative: tank rank1 accounts for1AP and rank2 for3AP; Better Cure ranks1/2/3 account for2/5/10AP total
- `spentAP` is the sum of purchased rank costs, whether assigned or unassigned
- `unspentAP = totalAP - spentAP`; overspent saves are invalid
- Each assignment is a known, currently owned ability identity, present at most once across the correct Major or Supportive family
- Both arrays are distinct and contain5–20 own entries within the shared Mastery budget; they start with five. Supportive accepts an owned Better Cure; Major accepts owned Tanks, Potion abilities or Conflagration
- `freeSingleResetsUsed` is a persisted integer 0–10

There is no separately writable AP balance or Mastery balance, fabricated proficiency, reward multiplier, training count, or timestamp. Reloading a valid JSON save preserves purchased ranks, assignment identity, and used resets.

## Effects and retained base values

`abilityVitalMultipliers(state)` returns a fresh object with exactly `{ hp, mp, sp }`. Empty, invalid, or legacy-disabled inputs return `{ hp: 1, mp: 1, sp: 1 }`. Valid slotted first and second ranks return 1.1 and 1.2 for their respective pool. Owning a rank without assigning it has no effect; rank two replaces the first total bonus rather than multiplying or adding both rank effects.

This pure helper neither reads battle-policy pins nor changes player resources. The engine owns battle-version compatibility, applying multipliers to maxima, and out-of-combat resource reconciliation. Consumers must still reject invalid saves: neutral multipliers are a safe fallback, not permission to accept bad state.

The pre-ability C14 fixture retains authored base pools, including level-20 `baseHp = 376`, `baseMp = 86`, and `baseSp = 20`. Those values are not promoted to verified HV base formulas. The proposed maximum policy is `floor(basePool * tankMultiplier)`, recorded in `ABILITY_POLICY.maximumRounding`; it is an unverified rounding candidate. With all first ranks assigned, those particular bases yield maximum pools 413, 94, and 22. Base pools remain 376, 86, and 20. Base-dependent spells, restoratives, and regeneration must continue to use base fields rather than the newly increased maxima. This module performs no rounding or resource refill itself.

## API

All state APIs expect the ledger under `state.abilities` and level under `state.player.level`. Relevant records are plain objects or null-prototype records. Only required fields are read; unrelated Credits, HP/MP/SP/OC, equipment, EXP balances, clocks, inventory, history, counters, and RNG are not inspected or changed.

- `ABILITY_POLICY`: frozen model identity, candidate labels, bounds, reset allowance, and source URLs
- `TANK_ABILITIES`: deeply frozen definitions keyed by `hpTank`, `mpTank`, and `spTank`; each includes `id`, `name`, `pool`, `slotType: 'major'`, `furtherRanks: 'none'`, and its `ranks` array
- `createAbilityState(enabled = true)`: independent initial data; a nonboolean argument throws `TypeError`
- `validateAbilityState(abilities, level, enabled = true, trainedAP = 0, trainedMastery = 0)`: nonmutating boolean validation of the exact nested schema, level 1–500, gates, AP conservation, assignments, reset count, and entitlement mode
- `getAbilitySummary(state)`: `{ ok: true, enabled, levelAP, trainedAP, totalAP, spentAP, unspentAP, levelMastery, trainedMastery, masteryPoints, allocatedMasteryPoints, unallocatedMasteryPoints, freeSingleResetsRemaining }`, or `{ ok: false, error }`
- `quoteAbilityPurchase(state, id)`: `{ ok: true, id, fromRank, toRank, cost, minLevel, bonusPercent }`. A known but level-locked or unaffordable next rank returns that metadata with `ok: false` and `error`. A Tank request beyond rank10 fails with `capped: true`; Better Cure beyond rank3 also reports `capped: true`
- `purchaseAbilityRank(state, id)`: revalidates the current request, purchases exactly one next rank, and returns the current quote. It does not assign the ability
- `assignAbility(state, id, slotIndex)`: places the ability in an empty zero-based slot within its owned family capacity (indices0–19 at full expansion) and returns `{ ok: true, id, slotIndex }`
- `unassignAbility(state, slotIndex, slotType = 'major')`: removes its assignment and returns `{ ok: true, id, slotIndex }`; ownership, spent AP, and reset count are unchanged
- `resetAbility(state, id)`: clears all purchased ranks and any assignment of that ability, refunds its cumulative cost, and consumes one free reset. Success returns `{ ok: true, id, fromRank, toRank: 0, refundedAP, cost: -refundedAP, freeSingleResetsRemaining }`
- `abilityVitalMultipliers(state)`: read-only factors as described above; has no `ok` wrapper

Read helpers permit a minimal `{ player: { level }, abilities }` state. If `progression` is supplied, its own `kind` must agree with the entitlement mode: `experience-ledger` for enabled, `legacy-fixture` for disabled. All mutators and purchase quotes require `experience-ledger`. This module does not duplicate EXP-ledger validation or derive level from EXP; those remain full-game validation responsibilities.

## Atomicity and explicit local restrictions

1. Every mutator and purchase quote rejects `battle.status === 'active'`, including the `round-complete` pause. Terminal `victory`, `defeat`, and `fled`, or absent/null battle, are permitted. Malformed battle metadata fails closed
2. Assigning an already assigned identity fails, including the same slot. Moving it requires an explicit unslot followed by assignment. Occupied destinations are not implicitly replaced
3. Unassigning an empty slot and resetting an unowned ability fail without spending a reset. There is no supportive-slot assignment API
4. All affected data properties are checked for writability before any change. A reset with one read-only target cannot partly refund AP, clear a slot, or increment its counter
5. Purchase quotes are detached snapshots, not reserved AP. A subsequent purchase rechecks current gates and affordability. Each successful call purchases the next rank; there is no command-receipt/replay protocol in this bounded module
6. Strict own enumerable JSON data is required for the ledger and its purchased map. Unknown keys, symbols, accessors, inherited data, sparse or out-of-range slot arrays, invalid ranks, and type coercion are rejected. Inspected getters are never evaluated. JavaScript proxies and adversarial host objects are outside the contract

Rank operations write only purchased ranks, matching slot entries and the reset counter. Mastery purchasing appends one empty slot without changing assignments or that counter. Successful and failed operations leave player resources, Credits, EXP, stamina, consumables, time, event IDs, and RNG untouched. Saving, UI confirmation, full-game migration, and resource reconciliation belong to the caller.

Client-side validation is not tamper-proof. A coherently rewritten or rolled-back local save can reset its history; this code does not promise server authority.

## Deferred scope

The remainder of the ability tree, remaining supportive abilities, Mastery refunds, augments, full resets, paid single resets, multiple personas, external entitlements, and proficiency-based effects remain deferred. No formula is invented to fill those gaps.

## Verification

Run `node --test tests/abilities.test.js` for the focused suite, or `npm run check` for repository regression checks. Tests cover the actual level-20 fixture and later recorded level rewards; all 27 ownership combinations at every level 1–500; precise rank gates and cost conservation; assignment-only effects; duplicate/occupied/wrong-slot rejection; active battles and round pauses; ten-reset exhaustion and reload; legacy restrictions; stale quotes; malformed/getter/read-only inputs; atomic failure; and no unrelated resource/time/RNG mutations. These tests verify this documented candidate, not unseen original-server mechanics.

## Full-game integration and migration

The engine derives a funded EXP-ledger profile's level and next-level threshold from its stored EXP before accepting ability entitlement. Legacy fixture profiles retain their separate disabled ledger. Migration creates no purchased ranks, assigned effect, Credits, consumable or EXP; existing level reward records are not summed into AP. A pre-ability active series pins `abilityRules: none-v1` through its end.

Rank/assignment engine wrappers use a draft, then reconcile out-of-combat maxima and validate before commit. Mastery-capacity purchases use a separate direct transaction and do not refill resources. Purchases accept the quoted prior rank as a stale-confirmation guard. Tank maxima use integer tenths and one final floor; at current authored bases376/86/20, three first-rank assignments yield413/94/22. Unslotting and resetting reconcile through existing outside recovery, without changing potion counts or other ledgers.

Cure's retained fixture reads baseHp; Focus reads baseMp; the source-based potion module already reads baseHp/baseMp. For this profile, health potion amount376, mana potion43, Cure126 and Focus4 remain unchanged by tanks, before caps and separate natural regeneration.

An exact frozen C14 engine replay preserves prior events/resources/RNG. Integration tests cover ownership-only behavior, assignment/maxima, restoration bases, reset exhaustion, rank gates, AP/Mastery level crossings, active-series locks and legacy rejection. Actual C13a browser exports also migrated with player, inventory, equipment, potions, EXP and activities unchanged.

## C19 Better Cure

[Abilities](https://ehwiki.org/wiki/Abilities#Supportive), observed revision64891, supplies Better Cure rank1 Lv1/cost2/potency70/CD4 and rank2 Lv35/additionalcost3/potency85/CD3. It belongs to Supportive, with five initial green slots. Learning and activation remain distinct. That historical checkpoint deferred rank3. The complete-Cure checkpoint now adds the documented Lv65/+5AP/potency100/CD2 rank; see COMPLETE-CURE.md.

`ALL_ABILITIES` adds this definition without changing `TANK_ABILITIES`. `activeCureRank(state)` returns the valid assigned rank or0. Quotes for Cure return `potencyPercent` and `cooldown`, rather than a tank bonus. `validateLegacyAbilityState` checks the exact old three-key ownership map and empty Supportive slots; `migrateLegacyAbilityState` then clones it, adds only betterCure:0, and changes model. It preserves tank ownership, slots and used resets without extra AP.

The engine pins `curativeRules` per series and preserves all earlier active Cure/RNG outcomes. See [CURATIVE](./CURATIVE.md) for the zero-proficiency fixture, unknown base potency, actual healing comparison and rounding boundary. Tank maximum changes never inflate Cure's baseHP input.

## Reconstructed paid AP extension

Current total AP is explicit `levelAP + trainedAP`; trained AP is derived only from the validated completed Ability Boost ranks, capped by player level and500. Supplied malformed Training ledgers fail rather than default to zero; minimal standalone ability API states without Training keep zero trained AP. Ownership, assignments, gates and reset prices are unchanged. See [ABILITY-BOOST](ABILITY-BOOST.md).

## Complete Tank extension

The previous two-rank table above is historical prefix evidence. All ten Tank ranks now use the separately recorded source gates and incremental costs,36AP per full Tank. Existing lower ranks and active policies are preserved. See [COMPLETE-TANKS](COMPLETE-TANKS.md) for current models, strict migration and exact multiplier boundaries.

## Full paid Training budget

Current `trainedAP` is the validated completed Boost rank0–min(level,500). The previous ability models retain their original strict migration bounds; they do not accept future Training grants. See [FULL-ABILITY-BOOST](FULL-ABILITY-BOOST.md).

## Complete Better Cure

All three sourced candidate ranks are implemented with distinct per-rank and cumulative AP prices. Model complete-cure-candidate-v1 adds strict complete-Tank/Cure2 migration and preserves all historical active policies. See [COMPLETE-CURE](COMPLETE-CURE.md); fixed proficiency and rounding limits remain.

## Potion-only General abilities

The five-rank Better Health Pots and Better Mana Pots tables now cover only the existing Potion items. Draught/Elixir effects remain unfinished and are disclosed before AP purchase. See [POTION-ABILITIES](POTION-ABILITIES.md) for incremental costs, Major activation, exact old-model migration and unchanged item timing. Potion slots do not change maxima.

## Instantaneous Spirit Potion extension

Better Spirit Pots adds five sourced candidate ranks (26AP total) with Major-slot activation and zero ownership on migration. That earlier checkpoint started with five Major slots for six implemented Major abilities; current [Mastery purchases](MASTERY-SLOTS.md) can expand owned capacity. Exact baseSP fractions are preserved before one final candidate floor. See [SPIRIT-POTION](SPIRIT-POTION.md); periodic Draught/Elixir effects remain unfinished.

## Manifest Destiny extension

Rules v31 preserves the current ability ownership and combat policy IDs. Completed Manifest ranks add a separately validated Mastery allowance, capped by ten and floor(level/50); pending jobs add none. Historical ledgers migrate with zero rank and retain their prior budgets. Maximum supported entitlement is60, below63 for both full capacity tables; no compensating grants or Mastery refunds are introduced. See [MANIFEST-DESTINY](MANIFEST-DESTINY.md).
