# Checkpoint 05 · 2026-10-07

## Source-supported out-of-combat recovery

HP, MP and SP recover immediately to their current maxima after the entire series ends through final victory, defeat or successful fleeing. The combat outcome and final combat vitals are recorded first, so a defeated character's last HP=0 remains distinguishable from the fully recovered out-of-combat character.

Source: [Battles, revision 64927, Recovering](https://ehwiki.org/index.php?title=Battles&oldid=64927#Recovering), a 0.91-era public community statement. This rule replaces the authored manual camp-recovery assumption. It does not verify the still-provisional resource-maxima formulas.

Recovery does not change Overcharge, consumables, rewards, attributes, external bonuses, RNG, turn count, ticks or elapsed time. Repeated calls do nothing after full recovery. Between-wave waiting remains an active series and cannot recover or change equipment. Outside-battle equipment/attribute changes and battle entry reconcile resources to current maxima.

## Save compatibility

Rules version advances to training-v3. Existing v1/v2 data is validated before migration. Active battles and between-wave resources are preserved; terminal series receive the documented outside recovery while preserving their old final vitals. Unknown versions and malformed legacy resources remain rejected. No compensatory items or rewards are granted.

## Checks

63/63 automated checks pass, including seven new recovery regressions. Syntax and portable static build pass. Visual/browser checks remain separate and pending for this checkpoint. No publication by this implementation worker.
