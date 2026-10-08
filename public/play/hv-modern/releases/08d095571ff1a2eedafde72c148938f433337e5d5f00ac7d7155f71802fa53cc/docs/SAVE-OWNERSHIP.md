# Protected save ownership repair

This checkpoint is based on live C26 (`9897128ed177f476e4f85543ae20de5f90f27cc9`). Gameplay, payload schema, rules revision 20, paid first-rank Ability Boost and the existing Tank ranks are unchanged. Unpublished full-Tank/full-Boost work is not included.

## Problem and guarantees

Previously, two tabs could load the same save and silently replace each other's progress. Even pagehide wrote stale memory. An already-open C23/C25/C26 client also used the same key as newer releases. Optimistic comparisons alone cannot stop those unmodified clients.

The repaired app uses:

- Canonical primary `vesper.persistent.protected.v2` and backup `vesper.persistent.protected.v2.backup`.
- Stable exclusive Web Lock `vesper.persistent.protected.v2.writer` for all cooperating repaired releases. These names must stay stable across future versioned release URLs.
- Legacy keys `vesper.persistent.prototype.v1` and its `.backup` retained without writes or deletion. Old clients can still change their own legacy fork but cannot address the protected namespace.
- `ifAvailable: true`, no queue, no stealing, no localStorage lease or unlocked fallback. Unsupported, denied or unavailable locks give read-only access with export.
- A writer reloads the latest durable protected state while holding the lock, before enabling mutations. With no protected lineage it copies the selected valid legacy raw bytes exactly, or creates a fresh save. A protected backup establishes lineage even if primary is absent; unreadable protected data does not silently fall back to older legacy progress.
- Each write requires branded current ownership and the exact expected primary bytes. The check occurs before touching either backup or primary. A conflicting readback or write error freezes mutation and preserves exportable in-memory progress.
- Pagehide releases ownership and invalidates pending imports without writing game progress. Pageshow/retry acquires and reloads only if there is no sticky conflict or unsaved memory. Repeated/overlapping acquisition requests share their generation. Pending file reads cannot apply across close, navigation or ownership changes.

A second repaired tab is an observer. Close/navigate away from the writer, then use “取得寫入權並載入最新” in the observer to reload and continue. A dirty/conflicted tab stays frozen until its user exports and explicitly reloads. There is no automatic merge of old-tab progress or unsaved forks. Legacy raw export and current-memory export remain available.

## Scope and limits

Web Locks serialize cooperating clients in the same browser origin/storage context. They are a secure-context browser facility; this app does not change permissions, browser settings or network policy. Native browser validation is a separate release gate; synthetic tests are not proof of every browser's lifecycle behavior.

This is not a transaction or tamper-proof storage system. Arbitrary scripts/devtools/extensions writing the protected key without the lock can still race synchronous localStorage writes; exact comparisons detect many such changes but do not provide cross-process compare-and-swap. Quota errors, browser storage clearing, private-mode lifecycle, device loss and differing origins are not solved. A backup write followed by a failed primary write is not atomic rollback. Export backups remain important. UI preferences keep their previous shared key and do not contain paid gameplay state.

Source references: [Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API), [LockManager.request](https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request).

## Reproducible verification and provenance

Run `npm run check`, `npm run build`, and `npm run verify:checkpoint`.

`tests/save-ownership.test.js` covers direct storage/ownership contracts; `tests/save-ownership-ui.test.js` covers actual app flows and an unmodified C26 writer. `tests/fixtures/pre-repair-c26-runtime` is exact historical C26 JavaScript for tests only, including its known unsafe save behavior; it is excluded from distribution. Its manifest records every hash. Existing storage/UI assertions were adapted only for mandatory ownership and deliberate no-pagehide-write semantics; they remain enabled.

`evidence/save-repair-runtime-baseline.json` freezes 26 C26 gameplay/payload/keyboard modules. Only app/storage plumbing and generated release metadata are outside that byte-identity baseline. All current source/deployed modules, including storage and save-owner, are covered by the normal release manifest and graph verifier. Historical original art and replay fixtures remain hash-checked.

Before promotion, independently validate source, stage the exact immutable release plus byte-identical preview entry, and exercise real old/new/observer tabs on the same demo origin. Preserve canonical and legacy user data during browser testing. Only then switch the normal root entry and current manifest following RELEASE-DEPLOYMENT.md.
