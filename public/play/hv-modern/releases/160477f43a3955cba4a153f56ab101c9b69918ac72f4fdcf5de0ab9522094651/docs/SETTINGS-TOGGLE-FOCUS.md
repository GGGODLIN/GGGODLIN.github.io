# Settings motion-toggle focus continuity

Independent candidate based on `7e697a3b381d06903371ac906c97567f5947cc5c`. No publication or native acceptance is implied.

## Defect and narrow fix

The actual app, executed in a replacement-aware VM DOM, loses its focused settings motion toggle when `renderModal()` replaces the overlay. The existing boundary Tab guard cannot recover focus outside the dialog. Six regressions reproduce this on the parent: pointer, Enter and Space activation, each in writable and unsupported-lock read-only sessions.

After the existing preference toggle/save/render, focus the live replacement toggle only while Settings remains open. The pointer path also focuses the toggle when the platform did not focus the clicked button. Ordinary `focus()` is used; no preventScroll or delayed callback. No generic modal restoration, Tab interception, new shortcut, CSS, markup, game engine, storage schema or other modal policy changes.

## Verification

Run `node --test tests/settings-toggle-focus.test.js`, `npm run check`, `npm run build`, and `npm run verify:checkpoint` on Node 20 or later. No dependencies to install.

Fourteen focused tests cover six repeated toggles per activation/ownership combination, live node identity, preference value and exactly one preference write per activation, byte-identical complete serialized game and every non-preference storage entry, existing forward/reverse Tab boundary wrap, Escape/close/navigation/popstate dismissal, no queued focus stealing, and help/log/actions-help/reset modal exclusion. The narrow-focus source hash is intentionally updated; existing CSS and negative tests are unchanged.

The VM explicitly models keyboard-generated click after Enter/Space. It does not execute browser default keyboard activation or default Tab movement. Passing event tests must not be represented as native-browser proof.

## Native acceptance still pending

At desktop and narrow widths, open Settings and toggle by pointer, Enter and Space repeatedly. Verify focus ring on the live toggle, Tab and Shift+Tab traversal inside the dialog, boundary wrapping, scrolling/visibility, closing and navigation, and read-only observer behavior. Restore the original save after testing. Screen-reader behavior, native event defaults and layout remain unverified. No browser, external write, publication or user-computer action occurred for this checkpoint.
