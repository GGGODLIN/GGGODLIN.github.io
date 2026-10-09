# Checkpoint16 — versioned source resource maxima

Rules persistent-0.91-training-v12; schema1. Includes frozen C15 abilities, C14 supplies and C13a hardening.

Fresh profiles now use the canonical public HP/MP/SP base candidates. At Lv20/six attributes14 the bases are784/44/17.8, with spendable maxima784/44/17; first-rank Tanks yield862/48/19. SP is not prematurely rounded before the Tank multiplier. Server rounding and the source page's accuracy warning remain explicit.

Existing saves retain legacy maxima, current resources and slotted effects. The character page identifies the preserved model and offers a read-only preview; switching requires an outside-combat confirmation, warns that MP may fall, and offers export first. It does not change attributes, EXP/AP, gear, Credits, consumables, activity rewards or RNG. There is no live downgrade switch. Active battles/intermissions cannot change models; saved terminal records keep their historical model.

318 checks, syntax, static build and diff checks passed. Coverage includes16 pure-module tests with27,000 rational oracle cases, fresh defaults, source Tank and restorative effects, atomic confirmation/no-op preview/repeat rejection, strict profile/battle model imports and exact whole tanked-C15 Arena reward/RNG replay. Historical C12–C15 resource contract tests now explicitly select their legacy model; the complete new-profile three-Arena loop continues to run against current defaults.

Independent exact-commit source and affected live UI verification remain pending. VITALS.md records formulas, public revisions, conflict and compatibility policy. No source/art is overwritten and this checkpoint does not publish itself.
