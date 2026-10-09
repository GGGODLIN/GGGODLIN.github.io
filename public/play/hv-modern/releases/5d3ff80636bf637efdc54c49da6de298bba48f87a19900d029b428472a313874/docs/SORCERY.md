# Sorcery: all five ranks, existing Fiery Blast

This version completes the five sourced Sorcery ranks for the currently implemented Fire spell. It does not implement Freeze, Shockblast or Gale, elemental proficiency growth, or certify original Persistent 0.91 behavior. The underlying monster statistics, opposed hit model, random sampling, floating logarithmic magic base, final floor and scheduler tie order remain local candidates.

## Community sources and costs

The current EHWiki [Abilities](https://ehwiki.org/wiki/Abilities#Elemental) footer revision64891 and [Spell Damage](https://ehwiki.org/wiki/Spell_Damage) footer revision65272 were read during qualification on 2026-10-08. Revision IDs identify community pages, not game versions. Historical oldid bodies and official0.91 rule equivalence were not verified. [Action Speed](https://ehwiki.org/wiki/Action_Speed), footer64923, distinguishes ticks from turns and marks unenhanced tier-one factor1.2 uncertain; it remains the inherited rank-zero candidate.

| Rank | Required level | Incremental AP | Total AP | Total spell coefficient | Action units |
|---|---:|---:|---:|---:|---:|
| 0 | Existing Fire gate | 0 | 0 | 4 | 120 |
| 1 | 70 | 1 | 1 | 4.10 | 115 |
| 2 | 140 | 2 | 3 | 4.15 | 110 |
| 3 | 210 | 3 | 6 | 4.20 | 106 |
| 4 | 280 | 4 | 10 | 4.23 | 103 |
| 5 | 350 | 5 | 15 | 4.25 | 100 |

Only ownership assigned to an owned Major slot activates an effect in a new series. Sequential purchase and the existing ten free single-reset allowance are unchanged candidate policies. No AP, Mastery, Credits, inventory or capacity is granted. AP from completed paid Ability Boost remains accounted separately. This bounded registry's legally gated Sorcery purchases do not currently exhaust level AP; insufficient-budget rejection is verified through existing generic ledger boundaries rather than inventing an impossible valid character.

## Arithmetic and timing

These are total coefficients replacing4, not additions or multipliers of4. New enhanced Fire represents coefficients with integer numerators410/415/420/423/425 over100 and multiplies the existing raw magic base before the existing elemental, critical, glance, mitigation and roll stages, with one final damage floor. Raw logarithmic base precision is still JavaScript floating arithmetic; this is not an exact server formula claim. Physical attacks and Cure do not use this parameter. Default400 retains precisely the prior multiplication order.

Enhanced cast factors are absolute replacements, implemented as exact115/110/106/103/100 integer units. In particular rank2 never evaluates ceil(100*1.1), which could incorrectly produce111. Unenhanced and historical timing keeps the prior arithmetic. No new speed/proficiency/interference/conservation/Channeling modifier is introduced.

Conflagration still determines the same3/4/4/5 target cap and selected-first authored ordering. Fire MP cost, cooldown, hit and critical algorithms, Searing probability/duration and enemy deadline scheduling are unchanged. More damage can kill before a proc draw; shorter time can cross fewer enemy/tick deadlines. Those consequential differences are expected, so enhanced whole-state equality to rank-zero is not a valid oracle. Tests instead assert the explicit damage, draws and time boundaries; historical replays require complete equality.

## Save and series boundary

Rules version32 and `sorcery-candidate-v1` ownership/ability-series policy distinguish this increment. A newly started series stores `sorceryRankAtEntry`; active validation requires exact assigned rank, lawful entry-level gate and compatible existing offense/resource rules. The rank stays pinned across wave continuation, reload, defeat and terminal records. Historical active series keep their old policy and must not contain future Sorcery ownership or pinned fields; old terminal records may coexist with later legal purchases.

Every predecessor envelope rejects future fields and tags before migration. The previous Mastery model uses its frozen eight-key validator, including bought slot capacity and completed Manifest Mastery. Migration adds only unowned Sorcery rank0 and advances the ownership/save identifiers. Old battles are not relabelled or given a new field. No resource refill, purchase, reset counter, trained reward or assignment is inferred.

The frozen predecessor fixture and103 accepted historical controls retain authentic bytes, provenance and normalized replay hashes. Missing positive fixtures for historical versions13–17 remain a disclosed coverage gap; rejection matrices alone do not invent those positive cases.

## Preservation and verification

The accepted Armory selection and complete narrow-focus CSS remain. All original art and inherited fixtures are preserved. `evidence/sorcery-runtime-baseline.json` declares five changed modules; the other26 runtime modules and entire stylesheet are hash-checked. The source release stub is transformed only by the established build, recorded separately in its release manifest.

Run `npm run check`, `npm run build`, `npm run verify:checkpoint`. Independent source review and native browser acceptance are separate from developer checks. Synthetic high-level fixtures and matured paid jobs must be labelled as such; no synthetic grant is part of normal gameplay.
