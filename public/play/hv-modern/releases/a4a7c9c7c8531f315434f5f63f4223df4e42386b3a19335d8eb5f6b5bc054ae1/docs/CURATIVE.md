# Better Cure and the retained baseline fixture

Policy `better-cure-candidate-v1`, checkpoint19. This increment connects AP ownership, Supportive loadout and combat healing.

## Sourced subset

Public pages read2026-10-07:

- [Abilities, Supportive](https://ehwiki.org/wiki/Abilities#Supportive), observed revision64891: first rank Lv1,2AP,potency70,CD4; second rank Lv35,another3AP,potency85,CD3. These are total rank effects, not additive potency or cooldown reductions. Assignment is required; use one of five initial Supportive slots. Major tank slots are separate. Third rank is retained in the backlog
- [Spells, Curative](https://ehwiki.org/wiki/Spells#Curative), observed revision65260: Cure unlocks at Lv5/base Supportive proficiency0. Its healing formula uses baseHP, potency and proficiency/level. Base mana cost remains20%level, before existing modifiers. The displayed variable “AP” is interpreted as the70/85 potency value, not the2/3 points spent; this is a semantic inference
- [Proficiencies](https://ehwiki.org/wiki/Proficiencies#Magic_Proficiencies), observed revision58042: effectiveness is80% at proficiency0,100% at level,150% at twice level. Real proficiency grows with use; exact growth is not implemented here

`heal = floor(baseHP × potency/100 × min(1.5, max(0.8 + 0.2P/L, 1 + 0.5(P−L)/L)))`

The implementation uses exact decimal-rational integer arithmetic so650HP ×70% atP=L produces455 rather than a binary-floating454. One final floor is the prototype's explicit unverified rounding choice. The current executable profile uses **fixed Supportive proficiency0**, openly shown in the ability card and action description, with growth unimplemented. No proficiency equal to level or free reward is supplied. Therefore the two ranks heal56%/68% of baseHP before the cap, not70%/85%.

## Baseline gap and choice

The source does not specify unequipped Cure potency. Until resolved, the unslotted Cure retains its earlier authored `floor(0.30 × baseHP + 0.40 × healingMagicFixture)` and baseCD5. Only a learned and slotted Better Cure switches to the sourced candidate. Learning alone changes neither healing nor cooldown; unequipping restores the baseline while preserving AP expenditure.

For a fresh Lv20 character, baseHP784 yields baseline249HP/CD5 versus rank1 439HP/CD4. HP Tank changes maximum health, not these quantities. The confirmation shows the actual before/after healing, because an extreme magic-heavy authored baseline can exceed the sourced model. No artificial minimum is added to disguise that difference. This mixed model is not claimed to reproduce full original Cure balance.

## Compatibility and invariants

Older ability ledgers are strictly validated before adding the unowned Better Cure key. Purchased tanks, AP costs, assigned slots, reset allowance, EXP, gear, Credits, supplies and RNG remain unchanged. The engine accepts their old battle ability policy and pins legacy Cure until that entire series ends. Schema1 retention consent stays in effect; schema2 C17/C18 model migration creates no rewards.

Cure casting stays locked belowLv5 even if an affordable rank was learned. Equipment/ability changes remain blocked during combat and wave pause. Rank2 requiresLv35 and total5AP; no immediate unlock through learning. Item actions do not advance Cure's non-item cooldown. Normal resource costs, targetless casting, caps and20u candidate action time remain in their existing modules.

Paid/full resets, additional ranks, proficiency growth, complete spellbook and Persona remain in the full backlog.
