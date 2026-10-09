# Bulk Armory organization checkpoint

Independent candidate from frozen `1e40b2a35775c90dff7e5932fbd4774996fff03e`. Native-browser acceptance is pending. The inherited core damaged-bootstrap recovery gate remains **UNVERIFIED / HOLD independently**; this checkpoint does not close it or authorize publication.

## Source and fidelity

The [current community Armory Organize section](https://ehwiki.org/wiki/The_Armory#Organize), identified for this task as revision 65341, was read on 2026-10-09. It describes selecting multiple equipment, a separate apply command, unchanged/enable/clear choices, pin priority, exclusive protected/locked status and clearing those two statuses together. [Versioned reference](https://ehwiki.org/index.php?title=The_Armory&oldid=65341#Organize) is retained for provenance. This is community documentation, not original Persistent 0.91 code, an original-server trace or proof of historical equivalence. The UI terminology, atomic validation and ephemeral visible-only selection are explicit local implementation choices.

## Interaction contract

- Each visible row has a native, labeled checkbox beside its separate inspection button. Workbench inspection and bulk selection are independent.
- Pin offers unchanged, enable, clear. Protection offers unchanged, protected, locked, clear both. Defaults leave existing mixed flags alone; no toggle inference is applied to a mixed selection.
- A live selected/visible count and explicit apply button identify the batch. Apply is disabled without a selection or with both options unchanged. Successful application clears selection and resets options, so another click cannot repeat the batch.
- A render intersects selection with the actual container, category and search list. Hidden rows cannot be submitted; stale hidden membership at application rejects the entire batch. Clearing a filter never silently restores old checkmarks.
- Leaving Armory, import/reset review, page lifecycle and ownership loss clear transient selection. Selection/options never appear in saved game payloads. Existing item IDs, inventory array order and item references are preserved.
- Native checkbox/select keyboard behavior is retained. Focus follows the live replacement of the same bulk control and falls back to search if it disappears or becomes disabled. Narrow-screen CSS stacks assignment fields and wraps buttons; these are source/model checks pending native layout acceptance.

## Atomic assignment and protected saving

`assignEquipmentOrganization(state, itemIds, {pin, protection})` in `src/armory.js` is the sole bulk mutation. It preflights complete IDs, options, the inventory's organization metadata and every targeted writable field before any assignment. Malformed, duplicate, missing or read-only targets reject the whole batch. Accessors are rejected without evaluation under the module's ordinary JSON-shaped-data contract; proxies/adversarial host objects remain outside it. Existing flag structure is reused; there is no migration or schema change.

The API reports whether anything changed. An unchanged batch does not write saves. A changed batch writes once through the existing owner, conflict and recovery guards. Save failure retains exportable changed memory, freezes further mutation and reports the error rather than claiming success; durable source bytes are not presented as updated. No alternate owner lock or recovery path was added.

Bulk selections, option changes and application render without collecting Training as a side effect. Active combat and actual between-wave pauses allow these flags while preserving the complete battle state, resources, RNG, event and command counters, progression, rolls, bindings, equipped IDs and containers. Existing outside-bulk Training collection behavior is unchanged.

There is no bulk storage, equip, sale, salvage, crafting, reward, level assignment, equipment generation or new policy.

## Verification

Run `node --test tests/armory-bulk.test.js tests/armory-bulk-ui.test.js`, `npm run check`, `npm run build` and `npm run verify:checkpoint`. Full frozen/restore results and package hashes belong to the canonical external manifest. Inherited evidence remains unchanged; a new runtime manifest identifies intentional app/Armory/CSS changes, while engine, storage, owner, art and replay baselines retain exact-byte checks.

The production-module event harness and replacement-aware DOM model are not a browser. Native checkbox activation, Tab order, visual focus/scroll, narrow layout, Web Locks lifecycle, file pickers and multi-tab ordering remain acceptance gates. No user browser, native storage or remote deployment was accessed.
