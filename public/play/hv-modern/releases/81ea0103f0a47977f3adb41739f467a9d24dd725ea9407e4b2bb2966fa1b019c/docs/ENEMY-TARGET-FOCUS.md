# Enemy target focus candidate

Local successor of frozen pixel commit 9dbcf3e34786bffc993940ce1d204babca8b7ff6. The frozen checkout is untouched; held 3a is not merged. Native acceptance of this successor is **UNVERIFIED / HOLD**. No publication is authorized by this checkpoint.

## Reproduction before implementation

The existing replacement-aware DOM harness ran the actual delegated target button handler. Selecting the second living enemy produced exactly the engine's `selectTarget` serialized state, detached the focused button, and left no active harness control. The regression failed before the fix.

Separate cloud-browser baseline QA on 9db reported genuine Tab to the second enemy, Enter, then next Tab returning to top-level Battle navigation. The third enemy repeated this with Space. Full exported state matched two frozen `selectTarget` calls byte for byte; the original saved game was restored. No claim that body was focused follows from those browser snapshots. The baseline browser report did not establish timer-race or dense-roster behavior.

## Scope

Only an already-focused, enabled living enemy button is retained across synchronous replacement, using the same target identity in the same battle and view/hash. Restoration follows read-only disabling and modal rendering, with `preventScroll`. The existing dense-roster viewport helper remains byte-identical.

No fallback target, automatic selection, queued focus, key handler or click-handler change. No engine/rule/storage/schema/artwork change. Nothing restores after modal/navigation, hidden/inactive document, ownership loss, target death/disappearance/disablement, changed battle, deliberate focus movement or ambiguous replacement. Existing modal-focus interaction tracking guards synchronous interference.

The exact bounded successor substitutions reverse to the SHA-256 of the frozen pixel source; all other source/style/art hashes remain exact. The older four-pixel-substitution behavior projection still validates inherited historical receipts. No receipt was weakened or rewritten.

## Verification

Run `npm run check`, `npm run build`, and `npm run verify:checkpoint` from this repository; no install is required (Node built-ins only). `npm start` serves the built normal entry at the server's printed URL. This candidate has source/event-model validation only until independent browser acceptance.

Focused coverage includes repeated modeled Enter/Space clicks; exact engine state and existing backup/primary writes; production Scan 250/900 ms repaints with serialized-state/storage purity; current target versus earlier target; modal/navigation/page lifecycle/visibility/focus loss; ownership disabling; dead/missing/inactive/battle-change cases; unavailable/ambiguous replacement controls; and unchanged viewport helper geometry. Geometry and native key synthesis are models, not browser acceptance.

## Native QA handoff

Use only this candidate's normal built entry and verify the release marker. Back up original progress first through ordinary export. Use genuine Tab/Enter/Space on ordinary and dense living enemy rosters, repeated same/different target selection, and production Scan/Defend 250/900 ms repaint races. Check the focus ring and next Tab/Shift+Tab, roster versus page scroll, and deliberate focus moves to another target/control. Check modal open/close, navigation/Back, hidden/inactive page, missing/dead/disabled targets, ownership changes and new battles without fallback. Export and compare full state against the same reference engine actions, then restore the original save through ordinary import and verify by reload/export. Do not infer body focus solely from missing active snapshot markers.

## Restore package

The companion full-history Git bundle contains the candidate branch and its reachable ancestry only. Restore with `git clone -b candidate/enemy-target-focus enemy-target-focus-full-history.bundle restored`, then run the three commands above. The source archive includes tracked source, original artwork, tests, docs, evidence and build scripts. The compiled archive contains the matching portable `dist` entry and immutable release. Git history restoration and rebuild must match the candidate's release ID before any acceptance claim.
