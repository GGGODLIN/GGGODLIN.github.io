# Versioned HP/MP/SP calculation

`src/vitals.js` exports `VITAL_POLICY` and the pure `calculateVitals` function. The model must be chosen explicitly. These policies separate a source-backed candidate from the original prototype fixture; neither claims exact original-server behavior.

## Source and unresolved evidence

`source-vitals-candidate-v1` selects the [current canonical Character Stats vitals section](https://ehwiki.org/wiki/Character_Stats#Vitals), read on 2026-10-07 with footer revision [65166](https://ehwiki.org/index.php?title=Character_Stats&oldid=65166#Vitals).

- Base HP = 500 + 10 × level + 6 × END
- Base MP = 10 + level + WIS
- Base SP = 1 + (STR + DEX + AGI + END + INT + WIS) / 5

The page warns that derived-stat formulas can be inaccurate. The [older Russian translation](https://ehwiki.org/wiki/Character_Stats/Russian) has an HP constant of 50, while the current canonical page has 500. That discrepancy remains unresolved; choosing canonical 500 is an explicit candidate decision. The translation's indexed result was visible during this check, but fetching its full page failed, so no translation revision is claimed. Original-server rounding is also unverified.

Only the supplied primary attributes and validated Tank factors enter this function. No external perks, equipment HP/MP/SP bonuses, automatic attributes, abilities, or rewards are added. The caller must supply only legitimately available attributes and earned, equipped Tank effects.

## API and strict data contract

```js
calculateVitals({
  level: 20,
  attributes: { str: 14, dex: 14, agi: 14, end: 14, int: 14, wis: 14 },
  model: VITAL_POLICY.model,
  multipliers: { hp: 1.1, mp: 1, sp: 1.1 },
});
// { baseHp: 784, baseMp: 44, baseSp: 17.8,
//   maxHp: 862, maxMp: 44, maxSp: 19 }
```

- `VITAL_POLICY.id` and `.model`: `source-vitals-candidate-v1`
- `VITAL_POLICY.legacy`: `legacy-vitals-fixture-v1`
- `level`: safe integer from 1 through 500
- `attributes`: exactly the six lowercase keys above, each a safe integer from 1 through 100000
- `multipliers`: optional; omission means all 1. If supplied, exactly `hp`, `mp`, `sp`, each the number 1, 1.1, or 1.2. These are the currently represented Tank ranks, not permission to apply them without ownership and slot checks
- Input and nested records must contain only own, enumerable data properties on plain or null-prototype objects. Arrays, class instances, inherited fields, getters, symbols, extra keys, coercible strings, nonfinite values and incomplete records are rejected
- Shape/type errors throw `TypeError`; unsupported numeric values or model identifiers throw `RangeError`. Explicit `multipliers: undefined` is invalid; omit the field to request defaults
- Returns a fresh plain object with exactly `baseHp`, `baseMp`, `baseSp`, `maxHp`, `maxMp`, `maxSp`. No input mutation, I/O, clocks, randomness, or external-state reads

Every attribute is validated under both policies, even if the legacy formula does not use it.

## Rounding and base/max separation

For the source candidate, HP and MP bases are integers; SP can retain fifths, such as 17.8. The implementation keeps SP as `(5 + sum(attributes)) / 5`, carries that exact integer numerator through Tank multiplication, and floors once at the final maximum. Tank factors are encoded as rational tenths 10/10, 11/10, or 12/10. Floating-point multiplier conversion and premature SP flooring are not used. All intermediate integer numerators remain safely representable within the validated bounds.

At level 20 with every attribute 14:

| Policy | Tank factor for every pool | Base HP / MP / SP | Maximum HP / MP / SP |
| --- | --- | --- | --- |
| Source candidate | 1 | 784 / 44 / 17.8 | 784 / 44 / 17 |
| Source candidate | 1.1 | 784 / 44 / 17.8 | 862 / 48 / 19 |
| Source candidate | 1.2 | 784 / 44 / 17.8 | 940 / 52 / 21 |
| Legacy fixture | 1 | 376 / 86 / 20 | 376 / 86 / 20 |
| Legacy fixture | 1.1 | 376 / 86 / 20 | 413 / 94 / 22 |
| Legacy fixture | 1.2 | 376 / 86 / 20 | 451 / 103 / 24 |

Flooring source base SP first would turn the 1.1 example into 18 instead of 19. Restoration rules that refer to a base resource must continue to receive the base field, not its Tank-increased maximum. This module does not set restoration potency or heal/refill any current resource.

## Legacy compatibility

`legacy-vitals-fixture-v1` preserves the prototype's authored formulas:

- Base HP = floor(150 + 9 × END + 5 × level)
- Base MP = floor(30 + 2 × INT + 2 × WIS)
- Base SP = floor(10 + 0.75 × WIS)

The integer attribute/level contract makes the HP/MP base floors implicit. The SP base floor is retained explicitly before the rational Tank factor and final floor, preserving existing fixture behavior. This intentional legacy exception is not evidence about source-game rounding.

## Integration and migration recommendation

Fresh profiles should select the source candidate. Existing profiles should retain the legacy identifier until an explicit out-of-combat opt-in. Pin the chosen policy for an entire battle series, including intermissions and resumed saves. A restore or new wave must not silently change formulas; an explicit model field must remain separate from other rules-version choices.

Migration must not rebalance attributes, alter EXP, change items or grant abilities. A higher maximum alone is not a grant of current HP/MP/SP. Any resource adjustment, outside-combat recovery, user confirmation and save/battle pinning belongs to the integrating engine and must be documented and tested there. This pure module performs none of those state transitions.

## Verification

Run `node --test tests/vitals.test.js`. Tests cover both endpoint ranges, exact level-20 vectors, all six attribute contributions, separate base/max fields, all SP fifths, all 500 levels and 27 Tank combinations against an independent BigInt oracle, legacy Wisdom residues, strict data/model validation, getter rejection and immutable input handling. These checks establish the versioned calculation contract, not equivalence to an original server.

## Integrated profile policy

Fresh `createGame(seed)` profiles use the source candidate. The explicit second argument `{vitalRules: VITAL_POLICY.legacy}` is retained for compatibility fixtures and controlled comparisons, not exposed as a live downgrade button.

Every migrated pre-C16 profile receives the legacy identifier and retains its resource values, including previously learned/slotted Tank effects. Each active series pins the profile model; changing it in combat or at a wave pause is forbidden. Terminal battle records retain their historical model even after an outside upgrade.

`getVitalUpgradeQuote(state)` is a read-only before/after preview. The character page shows exact current and proposed maxima, warns that MP can fall, offers a save export, and requires confirmation. `upgradeVitalModel` rechecks eligibility and commits a validated draft. It changes only the model and reconciles current resources through existing outside recovery; EXP, attributes, AP, gear, supplies, stock, Credits, Arena receipts and RNG are preserved. The interface provides no return-to-legacy action.

The exact frozen C15 tanked Arena fixture replays potion actions, full rounds, Credits, item metadata and RNG unchanged under the preserved legacy policy. Tests also exercise fresh-source defaults, fractional-SP Tank rounding, source-base potion/Cure amounts, stale and repeated upgrades, active-wave restrictions and invalid-model imports. Older resource-contract tests name the legacy model explicitly rather than changing their historical expected numbers.
