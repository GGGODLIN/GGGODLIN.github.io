# Modal dismissal return focus

Independent local-only candidate based on Settings motion-toggle checkpoint `d3f8778784b89608bd699b84241df5c3ea5d605a`. That checkpoint stays frozen. No engine, save/schema, rule, balance, runtime dependency, markup or CSS changes.

## Lifecycle inventory

- `settings`, `help`, `actions-help`, `log`: main controls open; Close/footer completion/Escape dismiss without state changes. Settings motion toggle replaces overlay controls and retains its existing synchronous toggle focus. Log filtering replaces overlay content.
- `reset`, `import`: Settings chains to reset or asynchronous validated import review. Cancel/Close/Escape returns to the original main Settings opener, rather than a removed modal button. Successful reset/import retains the existing save-and-navigation flow, without focus restoration.
- `ownership-reload`: recovery banner opens; keep-current/Close/Escape returns; confirmed reload retains browser reload.
- `enter-arena`, `enter-grindfest`: Activities review; cancel returns; successful entry navigates to battle and does not restore an Activities trigger.
- `vitals`, `mastery-slot`, `ability-buy`, `ability-reset`: Character review; cancel returns; success mutates through existing handlers and does not replay focus onto obsolete controls.
- `training-start`, `training-cancel`: Training review, with refresh/review replacement; cancel returns; actual start/cancel preserves its existing persistence and render lifecycle.
- `soul-fragments`, `supply`: Supplies review; cancel returns; confirm retains existing trade/persistence/render flow.
- `soulbind`: Armory review, protection checkbox and refreshed quote; cancel returns; selection reconciliation can close programmatically without focus restoration; shop navigation and actual binding remain non-restoring.
- `flee`: battle review; continue/Close/Escape returns; confirmed retreat retains existing action/render handling.
- `welcome`, `audit-upgrade`: may open automatically without an opener. Escape is still blocked. Welcome acceptance and audit migration acceptance preserve existing mutation flows. Audit decline is non-destructive and restores only after its required render, using the same safe fallback.
- Navigation, popstate, subview/product/quantity changes, programmatic confirmation and pagehide do not request return focus. Pagehide invalidates queued initial focus even when the modal itself stays open.

## Minimal implementation

Presentation-only ephemeral state records the opener, view/hash, and stable control identity. The delegated click handler supplies the actual clicked control during that synchronous event, so pointer activation does not depend on browser pointer-focus policy; a `finally` clears it even on an early return. Programmatic opens may use an existing main-screen focused control. Modal-to-modal replacement retains the main origin.

An explicit non-destructive dismissal restores synchronously after overlay removal. A still-live enabled/visible/tabbable opener wins. If a main render replaced it, an exact unique match of tag, ID, aria-label, dataset and href may be used. The mutable `data-save-owner` status is deliberately excluded from identity. In particular the rail and avatar Settings controls have different labels. Ambiguous, missing, disabled, hidden, inert, aria-hidden, negative-tabindex or non-layout controls cannot receive restoration. The fallback is the enabled visible navigation control for the unchanged current view; if none exists, nothing is focused. Changed view/hash suppresses restoration entirely.

`closeModal()` defaults to no restoration; ordinary Close/Escape opt in. There is no deferred return-focus timer. Initial modal focus carries a monotonically increasing lifecycle token; close, reopen or pagehide makes older callbacks inert. It also respects focus already moved inside the current modal.

## Evidence and limits

`tests/modal-return-focus.test.js` runs production app source/imports and registered click/key/navigation handlers. Its separate model parses actual generated control markup, tracks live/detached identities, and rejects detached/disabled/hidden focus. It covers writer/read-only sessions; repeated pointer and explicitly modeled Enter/Space clicks; Close/completion/Escape; canceled review flows; chain replacement; background rerender; unsafe/ambiguous/missing controls; modal keyboard blocking; initial-focus races; navigation/pagehide; and no extra game, preference or storage writes.

Keyboard click synthesis, DOM layout/visibility, normal Tab traversal, native focus rings, scrolling, desktop/narrow viewports and screen-reader output remain unverified in a native browser. The model is not native acceptance. No public deployment, native/user-computer operation, upload, private backup write or publication is authorized by this checkpoint. Existing source tests for slot assignment, Armory browse and Settings toggle focus remain in the aggregate check.
