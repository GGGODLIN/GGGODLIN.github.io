# Armory whole-loadout preview

Independent candidate based on documentation successor `27e33fbd0eafe7db1e402cfdd4e3fa254830a21e`. The accepted published source `99e4f52851d2730269ddfa4346f8b8b52f5e72aa` is not modified or superseded by publication here. Native-browser acceptance remains pending.

## What the player sees

The existing same-slot equipment comparison stays visible. Below it, “依目前本機規則，換裝後面板” shows current totals, projected totals and signed net differences for physical/magic attack, defense, burden, speed, accuracy and HP/MP/SP maxima. All displaced items are named. A two-handed weapon explicitly removes the offhand contribution; a return to one-hand never automatically restores a shield.

This is a projection of the current prototype formulas, not a newly sourced original-server 0.91 rule. The existing Soulbind candidate scaling, three-slot sample model and equipment restrictions remain unchanged. Values display at most three decimals while calculations retain precision. Resource maxima are panel values, not a promise to heal by browsing.

Already-equipped, stored, above-level, combat and between-wave blocked items show the existing eligibility reason instead of hypothetical after-values. Empty filtered lists have no preview. Search/category/container selection and all focus targets remain unchanged.

## Read-only implementation

`src/loadout-preview.js` asks the existing `getEquipmentEligibility`, creates only a projected equipment map and (for unassigned first wear) a copied item with the projected level, then asks the existing `getStats` for before/after. It does not call `equipItem`, restore a save, persist, read a wall clock, collect Training, or call recovery. Its return values contain no mutable item references. Engine, combat, save schema/storage and balance modules are byte-identical to the parent.

First-wear assignment is stated but not performed. Bound equipment uses existing effective values and original binding records. The explicit equip button continues its existing real-command behavior, including outside-combat recovery; preview does not execute that behavior.

## Verification boundary

New tests compare every projected statistic and exact unrounded delta with `equipItem`/`getStats` on an independent copy, including first-wear, two-hand/shield removal, one-hand return, armor and Soulbind. Deep-frozen inputs and byte-identical saves protect read-only behavior, including low resources and an elapsed paid Training job. Denial cases and repeated reads are covered. App-harness tests verify rendered values, empty/blocked selection, no save writes and no first-wear mutation. Existing selection/filter/focus suites remain required.

The narrow-focus test's exact app-source pin is advanced to this candidate; its CSS, native-focus checks and mutation-negative guards remain intact. Historical fixtures and all runtime baseline pins remain unchanged. Node VM tests do not establish native layout, scrolling, keyboard, focus visibility or browser acceptance. Independent QA and native validation must occur before release.

Candidate verification on 2026-10-09: `npm run check` passed 1,279 tests (zero skipped/failed); `npm run build` and `npm run verify:checkpoint` passed. These are implementation checks, not independent QA or native acceptance. The external artifact manifest binds the exact commit, build release ID and archive SHA-256 values without embedding a self-referential source hash.
