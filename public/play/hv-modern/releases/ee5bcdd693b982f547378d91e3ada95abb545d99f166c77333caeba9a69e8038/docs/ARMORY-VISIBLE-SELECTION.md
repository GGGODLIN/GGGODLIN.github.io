# Armory visible selection

This UI-only checkpoint keeps the workbench aligned with the displayed equipment
list. The source baseline is frozen focus successor
`5685b401463669493cc66406c7b9c0fb799b4e50`; no rules or save version changes.

Previously, the workbench selected from the entire inventory before container,
category and name filtering. Source/event tests reproduced hidden-item controls
for empty results and mismatched details for nonempty filters. Browsing itself
preserved game data; no item loss, permission bypass or native-browser defect is
claimed from those VM observations.

## Selection contract

The existing organizer supplies container and name filtering in its existing
pinned-first stable order. The existing category predicate is then applied. One
raw visible list supplies both rows and workbench selection:

- Preserve the current selected ID while it remains visible.
- Otherwise select the first visible item, or set the UI selection to null.
- Only that selected item supplies effective stats, eligibility, comparisons,
  identity/provenance and explicit item-action targets.
- Empty results render an empty workbench with no hidden item's equip, pin,
  transfer, protection or Soulbind controls. Clear filters is an explicit browse
  action: it clears name search/category, retains the chosen container and returns
  focus to search. It does not move or equip anything.

Container changes retain and honor search/category together. Pinning keeps a
still-visible selection despite ordering changes. Explicit move/equip/protection
and Soulbind operations retain their existing rules and outcomes. A pending
Soulbind UI review closes if reconciliation leaves its reviewed item; payment,
quote and confirmation rules do not change. This is UI intent invalidation, not
an allegation of a native cancelled-purchase or storage-loss exploit.

No selection is persisted. Browsing does not assign first-wear levels, refill
resources, spend currency, collect Training, change RNG/counters or write saves.
Search keeps its existing focus/caret behavior. There is no new sorting mode,
automatic transfer, remembered selection per container, selling or crafting rule.

## Tests and realm boundary

The Node app harness runs production app handlers in a VM with actual ESM modules
in the host realm. Browser app/modules ordinarily share one realm. The organizer's
strict record check rejects a VM object literal passed directly into the host,
which previously produced an artificial empty list in that harness.

A QA-only harness bridge now translates **only this VM's plain-object options**
into a null-prototype record, preserving all own property descriptors. It does not
invoke getters or normalize arrays/custom prototypes, and it never changes the
production organizer or its validation. Accessor options retain the production
behavior: ignored without evaluation, with defaults used. Separate tests record
host=7, direct cross-realm=0, correctly bridged=7 and verify no game/storage writes.
This harness correction is distinct from the real source-level selection defect.

Regression cases retain the thirteen-case baseline, including empty and populated
storage/category/search, active row/action correspondence, craft/identity empty
views, explicit clear, repeated navigation, pin/transfer continuity, ownership
and interrupted reviews. Complete game/export/storage snapshots remain compared;
VM markup/focus checks are not native layout, keyboard or accessibility acceptance.

Run `npm run check`, `npm run build` and `npm run verify:checkpoint`. Only app.js
changes among runtime modules; all thirty other modules, the entire stylesheet,
original artwork and historical fixtures remain pinned. Source/build acceptance and native browser acceptance are separate gates.
