# Background modal opener focus across action renders

Local-only follow-on to frozen `33fc1a7ad311b0664d73555cca01c461875897f9`, retaining its live-modal focus repair and `ce1f1419c15ced5188622f51ce809dbb890c1698` dismissal return. Native acceptance and publication remain **HOLD**.

## Confirmed scope and evidence boundary

The earlier 36-case actual-source investigation found the same pre-existing background focus gap in ce1 and 33fc. A successful combat action schedules full app replacements at 250 ms (busy reset) and 900 ms (feedback clear). When a background opener owns focus before replacement, the original app removes it without focusing its successor. Escape can correctly return to Log and then a later render removes that returned control.

Two separate native trials on 33fc observed the rapid Scan → Log → Escape → Help sequence fail, with AX root focus. Inputs were sequential awaited named locator `.press('Enter')` calls, not separate manually issued focus and Enter steps. Those trials did not instrument focus/event/timer ordering, so they do not establish the exact native causal interleaving or native parent behavior. This patch repairs the established source/model gap; it does not claim to have verified the native failure's exact cause or its native repair.

## Minimal repair

`render()` captures only the actually focused, connected, focusable background opener immediately before replacing `#app`. The bounded commands are Help, both distinct Log controls, all three Settings controls, Actions Help and enabled Flee review. Capture requires no open modal, a focused/visible active document, and the same view/hash as the previously rendered page. Tracking the rendered view/hash prevents navigation from carrying old-page controls into a new page with similar markup.

After replacement, read-only controls and existing focus helpers run normally. Restoration requires unchanged view/hash, modal lifecycle and focus interaction epochs, no new modal or other current focus, and an active/visible document. Exact tag, id, aria-label, href and dataset values identify the unique replacement; only the dynamic `saveOwner` value is excluded, as in the existing modal return identity. Missing, duplicate, disabled, hidden, inert, aria-hidden, aria-disabled, negative-tabindex or invisible replacements have no fallback. The latest actual focus always wins. `pagehide` disables this restoration; `pageshow` permits newly current focus again. These flags are ephemeral and never persisted.

No combat timer is cancelled or rescheduled. There is no deferred focus request, global Enter interception, invented modal state, stored opener retry, or changed game/save/resource logic. Existing modal capture/restore, dismissal fallback, Settings, Armory, ability slot and Fire-preview helpers remain unchanged. Generated markup, CSS, original art and all gameplay modules are preserved byte-for-byte.

## Regression evidence

`tests/background-opener-focus.test.js` executes real imported app modules, production delegated handlers and actual scheduled callbacks against parsed production controls. `tests/helpers/background-focus-dom.js` explicitly models detachment, focusin and eligible control selection. Enter's browser default is modeled by activating only a still-live focused enabled button; no browser is used.

The 66 cases cover the original 18-case route/order matrix at 250/900 ms, all eight distinct opener identities (Flee only at 900 ms after the real busy reset), repeated successful actions, Escape-returned and newer focus, body/outside/other-control focus, actual click/popstate navigation, pagehide/pageshow, document blur/visibility, read-only transitions, and defensive invalid/ambiguous/missing replacements plus in-render modal/navigation/focus interruptions. Defensive hooks are explicitly labeled unit conditions, not invented reachable or native flows. Snapshots compare complete serialized game, every storage value and write count around presentation-only operations. Scan cannot be repeated on an already scanned target; the consecutive-action case uses enabled Defend through the production handler and verifies turn advancement.

The exact same new regression suite runs against frozen predecessor app sources via `BACKGROUND_APP_SOURCE=file:///absolute/path/to/src/app.js`. The helper only dispatches focusin for source versions that register that listener; it does not add listeners or alter production code. Separate existing live-modal/return-focus/Settings/Armory regressions remain required.

The only inherited test adaptation advances the narrow-layout suite's whole-app SHA pin to the new presentation-only source. All CSS, layout, successful-assignment focus and mutation-detection assertions are retained. No older frozen fixture or historical source is modified.

## Required native acceptance, not performed here

Verify the exact rapid Scan → Log → Escape → Help locator sequence and ordinary real keyboard Tab/focus → Enter near both remaining callbacks, plus settled controls. Use wide and narrow layouts where the target is actually visible; do not manufacture disabled Flee availability. Verify focus ring, scroll, normal Tab navigation, modal containment, observer/read-only behavior and save restoration. This source/model checkpoint does not claim native keyboard default activation, CSS layout, assistive technology or desktop/narrow acceptance.

No browser, user computer, upload, public deployment or private remote write was performed. Full-history/source/art/build/patch archives and fresh-restore results accompany the local checkpoint.
