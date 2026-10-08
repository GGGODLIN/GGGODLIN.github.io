# Checkpoint 04 · 2026-10-07

## Source-supported gameplay correction

Nonfinal waves no longer auto-advance. The engine now persists a `round-complete` phase and waits for explicit Continue or Space. While waiting, combat commands, replacement battles, equipment changes, attribute allocation and camp recovery reject without changing state. Continue generates only the next wave, preserving resources, cooldowns, effects, player turns and elapsed units.

Source: [Battles, revision 64927, Victory](https://ehwiki.org/index.php?title=Battles&oldid=64927#Victory). This is a 0.91-era community statement, not original-server verification. The training encounter remains two authored waves, not a shortened original arena.

Rules version advances to training-v2. A narrow tested migration accepts prior training-v1 saves: preserve resources, receipts and past progress, add `combat` phase where absent, and apply the explicit Continue boundary to future clears. Unknown versions are still rejected. No retroactive rewards or resource compensation.

## Checks

56/56 automated checks, JavaScript syntax and portable static build pass. Seven new tests cover saved intermission, resource/time preservation, prohibited actions, repeated/premature Continue, invalid states and prior-save migration.

Browser verification is pending; checkpoint 02 remains the parent's independent test-preview target. This checkpoint is not self-published.

## Research limits retained

Character_Stats publishes HP/MP/SP equations but warns that derived formulas may be inaccurate; an older translated HP formula also differs. Those candidate formulas are recorded as research, not silently promoted to confirmed values. Next narrowly supported candidate: immediate out-of-combat recovery, excluding between-wave recovery and consumable refills.
