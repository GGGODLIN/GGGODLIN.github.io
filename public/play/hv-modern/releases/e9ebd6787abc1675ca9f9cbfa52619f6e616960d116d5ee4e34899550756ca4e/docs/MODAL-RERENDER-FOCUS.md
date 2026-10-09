# Live modal focus across background rendering

Local-only candidate based on frozen `ce1f1419c15ced5188622f51ce809dbb890c1698`. Existing dismissal return, Settings motion-toggle and Armory focus behavior remain intact. Native browser acceptance remains pending.

## Reproduction and minimal repair

The production Scan action schedules existing 250 ms busy-clear and 900 ms feedback-clear renders. Opening Log, Help, Settings or Actions Help before either remaining callback leaves the modal open but replaces its focused Close control. A Flee review is also reachable after busy clears and before 900 ms. The existing initial-focus callback has already finished, so all nine reachable combinations lose their live focused control. Escape still returns to the opener; the gap occurs while the modal remains open.

`renderModal` captures only a currently connected, focusable control inside the same modal lifecycle immediately before synchronous replacement. After markup and read-only state are applied, it restores only one exact matching tag, ID, aria-label, href and stable dataset identity. No index fallback, opener fallback or new deferred task is used. Ambiguous, removed, disabled, hidden, inert, aria-hidden, negative-tabindex and non-layout replacements are rejected. If the user has moved focus outside the overlay, nothing is restored.

A rendered lifecycle epoch prevents focus from one modal being carried into another, even if their controls share a command. The existing initial-focus timer retains its close/reopen/navigation/pagehide epoch guard. It now also checks intervening focusin activity and a newly active external control. The activity counter covers the case where the user-selected external control was itself subsequently removed by a render. This is presentation-only transient state and is never persisted.

No action scheduling, battle rules, values, engine modules, save formats, preferences, mutation logic, CSS, generated markup or original art are changed. Full renders continue to refresh modal content; no stale modal snapshot is retained.

## Verification boundaries

`tests/modal-rerender-focus.test.js` runs the production app and registered handlers with actual parsed controls, retaining the existing separate DOM model. It covers nine Scan/timer/modal races, live Close and reverse-Tab containment, game/storage immutability, exact Settings controls, Log select identity, repeated renders, outside focus, intervening focus then detachment, pagehide/navigation, modal replacement, and unsafe or ambiguous targets. The prior modal-dismissal, toggle and Armory suites remain required.

The test model does not prove native browser activation, normal Tab traversal, layout, focus ring visibility, scroll position, assistive technology or desktop/narrow acceptance. No browser, user computer, public deployment, private backup write or upload was used or authorized. The checkpoint remains HOLD pending independent review and native acceptance.

## Prior regression-contract adaptations

The narrow-layout suite's exact whole-app SHA is advanced to this presentation-only source; its layout, CSS and successful-assignment native focus assertions remain unchanged. Four Settings regression cases previously required no focus call at all on unrelated modal rerenders. That requirement described the newly repaired gap, so those assertions now require the live current Help/Log/Actions Help/Reset Close control to retain focus, while still forbidding any return to the absent Settings toggle. No engine, storage, state or layout assertion was removed.
