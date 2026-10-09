# Checkpoint 06 · 2026-10-07

Combined C03–C05 gameplay/reliability increment plus the minor navigation defect reported by independent live C02 QA.

## QA-reported fix

Resetting from the equipment workbench previously displayed Battle but left `#armory` in the address. Reload returned to the old view. Reset and confirmed import now replace the current hash with `#battle`; regular navigation still pushes history and repeated selections do not create duplicate entries.

The navigation adapter is tested for supported bookmarks, reset/import from several views, reload agreement and ordinary history behavior. This source fix awaits live browser re-verification; it does not retroactively mark C02 as fixed.

## Included increments

- Actual resolved combat feedback and explicit action-duration status chips
- Save validation-before-overwrite and eight storage lifecycle regressions
- Explicit saved between-wave Continue, with no in-series refills or gear changes
- Sourced immediate out-of-combat HP/MP/SP recovery without potion/OC/reward changes
- Validated v1/v2 → v3 save migration

## Validation

66/66 deterministic, static, storage and navigation tests pass; JavaScript syntax and static build pass. Parent/independent reviewer should freeze this exact commit for browser QA and publication. No publication by this worker.
