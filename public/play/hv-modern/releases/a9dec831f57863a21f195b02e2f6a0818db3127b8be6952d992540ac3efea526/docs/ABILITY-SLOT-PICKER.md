# Explicit empty-slot assignment

This presentation-only checkpoint exposes the already implemented exact-index
Major and Supportive assignment APIs. It changes no ability, Mastery, Training,
save schema, combat policy, target ordering or original-rule claim.

A learned, unassigned ability offers a labelled native selector containing only
empty positions already owned in its own family. The placeholder requires an
explicit choice. The separate Assign button names the destination using one-based
slot numbers; the existing engine receives the corresponding zero-based index.
No slot is purchased automatically. Occupied slots are not replaced, abilities
are not swapped or moved, and an assigned ability must first use the existing
Unslot action before another assignment.

Selecting a position is temporary interface state. It must not call the full
render/Training-collection path, the engine, storage or the clock. Only activating
the current Assign button commits. A stale choice, occupied target, changed rank
or capacity, lost ownership, unrelated modal or changed view rejects without
falling back to a different empty slot. Navigation, import, ownership changes and
pagehide discard the choice; reloading does not restore unsaved UI selections.

Confirmed assignment calls the unchanged engine wrapper, including its existing
candidate outside-combat resource recovery. It can refill HP/MP/SP to resulting
maxima and create the existing recovery event. This is different from Mastery
capacity purchases, which do not refill resources. Neither selecting nor assigning
adds AP, Mastery, rank ownership or capacity. Active and paused series remain locked.

Native select keyboard behavior is preserved; choosing with arrows/Enter/Space
must not perform the assignment or trigger battle shortcuts. A labelled explicit
button commits once. Scoped styling preserves the accepted CSS prefix, existing
combat rows and Fire preview labels. Native layout acceptance uses supported cloud
window sizes; source/VM tests do not certify physical touch or assistive technology.

## Verification and scope

Run `npm run check`, `npm run build` and `npm run verify:checkpoint` against the
final frozen source. All thirty gameplay/storage modules, original artwork and
inherited fixtures remain byte-identical to accepted Manifest d3ea577. Only app
presentation changes, with appended picker CSS. Source/build and native browser
acceptance are separate gates.

Inherited UI tests that previously clicked Assign directly must now make their
intended slot choice explicitly before the click. Their original effects, AP,
resources, protection and replay assertions remain unchanged. Negative disabled,
observer, active-series and detached-event tests must not be given implicit
choices that hide the new gate. Detached-listener probes remain synthetic
hardening checks, not claims of a reproduced native-browser defect.
