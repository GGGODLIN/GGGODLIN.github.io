# Explicit recovery with a missing protected primary

This independent local checkpoint is based on frozen `3f487c1932212a3ad2f3ebe1f68feea4bbe14847`. It changes only application/save plumbing, tests and verification documentation. Engine mechanics, rules, payload schemas, lock implementation, original art and historical evidence remain unchanged. No publication or native-browser acceptance is claimed.

## Verified dead end

If the canonical protected primary was absent and the applicable legacy primary, legacy backup or protected backup was unreadable, bootstrap correctly refused to create a save. The application incorrectly treated this preservation refusal as failed ownership and released its acquired exclusive lock. Consequently even user-confirmed valid import/reset was unreachable. The same unreadable bytes in an existing canonical primary already supported deliberate recovery. No automatic loss or new corruption was observed.

## Narrow repair

- Bootstrap still returns `ok:false` and `readonly:true` for missing-primary unreadable lineage, and writes nothing. A separate `recoveryOnly:true` result exists only after branded exclusive ownership is verified and readable storage reports that exact state. Unsupported/denied locks, unavailable storage and actual write conflicts never receive this outcome.
- The application keeps the real acquired lock and the latest under-lock source bytes. `preserveBadSave` continues to block ordinary game controls, hotkeys and Training collection. Only existing import/reset review and explicit confirmation can create the canonical save. Review, cancellation, retry, page return and stale file completion do not create one.
- The unreadable load records every key consulted, including absent keys. Recovery verifies this immutable snapshot both in the application guard and immediately at the storage write boundary, together with exact expected-null canonical bytes and current branded ownership. Legacy lineage checks both legacy keys plus absent protected keys. An existing protected backup establishes its own lineage, so unrelated later legacy writes are intentionally irrelevant.
- A successful explicit recovery writes only the new canonical primary. The legacy namespace and retained protected-backup bytes are untouched. A failed write preserves visible memory and original raw export; a safe ownership retry can reopen recovery. A real conflict remains sticky and requires explicit reload.
- A first-time welcome acknowledgement must not attempt ordinary persistence while preservation blocks gameplay: that used to mark unchanged placeholder memory dirty and prevent later recovery. It now calls ordinary persistence only if the normal write guard permits it.

`save-owner.js` is unchanged. There is no lock bypass, steal, lease, automatic overwrite, schema broadening, silent legacy fallback or changed game rule. The `recoveryOnly` outcome is not a successful automatic migration.

## Regression and integrity evidence

`tests/explicit-save-recovery.test.js` adds 51 actual-production event-model/storage cases. All pass on the candidate; the exact parent has 47 failures and four passing controls. The focused new plus existing storage/ownership/recovered-UI suites pass 108/108. Coverage includes all three failing lineages; confirmed import/reset; blocked ordinary gameplay; exact original export; cancellation and page return; late file reads; quota failure and retry; missing/denied/occupied locks; changed canonical and each relevant lineage key during review or reading; ownership loss inside snapshot verification; first-time welcome; existing canonical recovery and valid backup migration.

Two historical exact-byte pins necessarily changed: current application source for the inherited focus guard, and current storage for release preservation. The old evidence files are not rewritten. `evidence/explicit-save-recovery-runtime.json` declares and pins the two intentional current runtime files. All other inherited runtime, CSS, art and replay preservation checks remain active. Full frozen/restore counts and exact source/build/archive hashes are recorded in the external canonical package manifest.

Run `npm run check`, `npm run build`, and `npm run verify:checkpoint`.

## Limits and remaining gate

The app harness executes real handlers/modules against test-local storage and a lock-lifetime model. It does not demonstrate real file-picker behavior, native DOM disabled-state application, browser Web Locks lifecycle, BFCache or cross-tab storage event ordering. Native supported-browser acceptance is still pending; previous focus-related native gates also remain open. No user browser or user storage was accessed.

Web Locks serialize cooperating clients only. Exact snapshot comparisons are not atomic cross-process compare-and-swap against arbitrary scripts/extensions; this retains the existing documented storage limitation. Browser clearing, quota, profile/origin changes and device loss remain possible. Export backups are still important.
