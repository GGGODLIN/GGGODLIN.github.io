# Cross-screen Training status and keyboard ownership

This UI-only checkpoint extends versioned-release baseline
`d0b2139d336f605371deca488f7bac83067850cf`. Gameplay, Training costs/durations,
AP accounting, storage keys and rules version are unchanged.

## Training visibility

While a job exists, the header links to Training and shows the actual Adept or
Ability Boost identity plus remaining wall time. At expiry it shows readiness;
during an active battle, including inter-wave pause, it explicitly says collection
must wait until the series ends. Cancelled/collected jobs remove the indicator.
A backward/invalid observation clock shows a check-clock message rather than
pretending the job has finished.

Timer updates on other screens are presentation only: no collection, saving,
combat action or ledger/time mutation. Collection remains in the existing
Training-page visit path with its modal, migration-consent and active-battle
guards. The countdown changes text in place; a ready-state transition preserves
a focused header button. The narrow layout hides only the long job name while
retaining time/readiness and a complete accessible button label.

A failed collection save retains the current in-memory result and the existing
save-error disclosure; the header does not claim the durable save succeeded.
Browser background timer throttling can delay a display update. No notification,
automation, server clock, cross-tab authority or background collection was added.

## Keyboard ownership

`ignoreBattleHotkey(event)` prevents the global battlefield listener from consuming
keystrokes that belong to a focused native control, link, summary, editable area,
or interactive ARIA widget, including nested descendants. It also ignores repeat,
control/alt/meta modifiers, composition and already-prevented events. The helper
itself never calls preventDefault or changes event/DOM data.

Modal Escape/Tab handling still runs first. Background battlefield shortcuts
remain:1–7/H/M actions, left/right target selection and Space to continue a wave.
A focused Training button can therefore receive its normal browser keyboard
activation without also advancing the battle beneath it. Explicit noneditable
contenteditable islands are respected; malformed synthetic host objects are not
a substitute for native browser testing.

## Verification boundary

New pure keyboard tests and actual-app VM tests exercise controls, nesting,
editable inheritance, modifiers/IME, all seven views, countdown/ready/cancel,
combat and failed-save boundaries, DOM text-only refresh, focus retention,
background shortcuts and modal Escape/Tab noninterference. Full inherited tests
and the content-versioned build/integrity gate remain enabled.

VM tests do not prove native keyboard default activation, mobile viewport fit,
real focus cycling, background-tab timing or BFCache behavior. These remain
separate browser QA cases. No physical-phone acceptance is inferred.
