# Checkpoint 13 — outgoing formulas and inspectable quality rolls

Date: 2026-10-07. Rules `persistent-0.91-training-v9`, schema 1. Includes C12a and audited C10c import hardening. Intended release is the existing approved testing demo; this source checkpoint performs no publication.

## Product changes

- New series use published logarithmic physical/magic bases, Fire's base tier-one ×4 multiplier, and integer 80–120% final damage rolls
- New Arena clear equipment has quality-first, per-positive-stat rolls with visible range, rolls and mean in the workbench
- Original seven templates stay recognizable; Average/Superior/Exquisite weights 50/35/15, uniform template choice, uniform inclusive rolls and anchor-to-stat projection are explicitly authored/unverified
- Existing items are never rerolled. An already active older series pins both the old offensive model and old fixed-template equipment reward until settlement, preserving its RNG continuation
- Character sheet displays fractional outgoing bases. Spell help now states the effective Spirit cost factor

## Scope preserved

No player attribute rebalance, new item reward quantity, free external benefit, new market or extra daily Arena entry. Incoming damage, resource maxima, hit chance and single-critical chance are still authored fixtures. Cure potency does not change indirectly. Full gear slots/scaling/affixes, abilities, proficiency, crafting and the complete backlog remain outstanding.

## Verification

`npm run check`: 210 tests passed, zero failures. `npm run build` and `git diff --check` passed.

New coverage: logarithmic vectors, all roll endpoints, mitigation layers, Spirit physical/magic distinction, engine RNG ordering, exact C12a action replay and complete active-Arena reward/RNG replay; generator input/metadata/ID validation, roll projection, seven-template endpoints, no mutation, old-item preservation, first equip/organization/reload without reroll, duplicate settlement and 20 seeded real clears.

Tests pin selected old engine baseline fixtures explicitly to their legacy policies; dedicated tests exercise modern actions and all three new Arena clear paths. The complete first-three-Arena loop still conserves XP, Credits, stamina, daily attempts and one reward per clear.

No browser route was retried. Independent exact-commit source/migration gate and affected live UI review remain pending at freeze. Public-page evidence and limitations: COMBAT-OFFENSE.md, EQUIPMENT-GENERATION.md, RULES.md.
