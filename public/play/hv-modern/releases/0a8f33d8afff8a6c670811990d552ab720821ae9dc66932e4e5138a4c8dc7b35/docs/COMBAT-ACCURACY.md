# Critical sequence and the unresolved accuracy resolver

Policy `critical-sequence-candidate-v1`, checkpoint18. This is a gameplay increment, not a complete reconstruction of the hit system.

## Evidence register

Canonical pages read 2026-10-07, with observed footer revisions:

- [Battles, Criticals](https://ehwiki.org/wiki/Battles#Criticals),64927: two attack passes gate player critical eligibility. The first critical check uses half accuracy, capped50%; follow-up checks use quarter accuracy, capped25%, stopping at first failure or nine criticals. Base bonus is additive: `1 + 0.5 × count`, at most5.5. This is not `1.5^count`. Monster criticals follow a separate rule and are unchanged here.
- [Damage, Damage Avoidance](https://ehwiki.org/wiki/Damage#Damage_Avoidance),64962: zero/one/two successful evade rolls produce full/half/no damage; only the no-evade outcome is marked critical-eligible. Block/parry also use two contests, and resist three. Their probability function and general ordering are absent. Treating the two attack passes as complements of the evade contests is an inference; this implementation adds no separate evade gate.
- [Character Stats, Accuracy](https://ehwiki.org/wiki/Character_Stats#Accuracy),65166: accuracy is an opposing stat, not a directly published hit probability. The page contradicts itself with DEX/WIS coefficients0.5 and0.05. We deliberately do not select either as verified.
- [Skills, Innate Skills](https://ehwiki.org/wiki/Skills#Innate_Skills),65273: Focus doubles Magic Accuracy; propagation into critical checks is unstated. The prototype preserves its prior next-action Focus lifetime and doubles the fixture input, explicitly an inference.

The official0.91 forum thread returned403; no bypass was attempted. Canonical wiki prose remains a candidate until checked against authorized original-game samples.

## Implemented fixture boundary

The existing authored input `P = clamp(88 + DEX × 0.25,88,98)%` is retained and labeled **per-contest success fixture**, not original Accuracy. Fire still uses this same fixture; WIS-based true magic accuracy waits for a resolved source. Equipment does not gain invented accuracy stats.

For each target, independently:

1. Draw two Bernoulli fixture contests with probabilityP (Focus doubles the Fire input, probability capped1)
2. Neither succeeds: miss. One succeeds: half-damage glance, no critical. Both succeed: critical-eligible
3. Local candidate converts this fixture input to first probability `min(P/2,0.5)`, then repeated `min(P/4,0.25)`. These **probability inputs are authored**, not a claim that the unknown original opposing-stat function divides this way
4. Critical bonus, glance multiplier, mitigations and the existing80–120% damage draw are multiplied before one final floor

Critical count is source-supported. The input conversion, deterministic draw order, uniform RNG, final rounding, authored monsters, missing block/parry/resist, incoming damage and proc effects remain explicit gaps. No unknown proficiency, gear Accuracy, zero-stat enemy model or free ability is silently supplied.

## Persistence and presentation

Each battle series pins `accuracyRules`. Every pre-C18 save retains its original single-hit/8%-single-critical path through that entire active series, preserving exact RNG and loot. The next series uses the new policy. Completed logs are never recalculated.

New damage events contain numeric `criticalHits`0..9 plus boolean `glancing`, cross-validated with the prior `critical` flag. UI feedback and escaped log text distinguish glances and multi-critical counts. No future roll or enemy decision is exposed.

Tests include boundary draw sequences, first/next caps, nine-count stop, final-only rounding, per-target replay and duplicate no-op, strict imported metadata, and actual frozen C17 training/Arena continuations through victory and rolled equipment.
