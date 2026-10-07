# Checkpoint 02 · 2026-10-07

Fix checkpoint, suitable for the parent's authorized testing-only preview publication and subsequent independent browser QA. No publication is performed by this source task.

## Changes since checkpoint 01

- Fixed item-protection autosave corruption: `setItemProtected` validates the requested item and boolean flag; restore accepts that explicitly mutable field while still rejecting altered fixture equipment stats
- Added three regressions for protection → save/reload → combat → save/reload, invalid mutation rejection and forged-stat rejection
- Added a readable skill/cooldown reference dialog usable on touchscreens, including reasons unavailable actions are disabled
- Aligned import maximum with the engine's 5 MB validation limit

## Verification

41/41 automated checks pass: 33 baseline engine, 3 protection regressions and 5 static checks. JavaScript syntax and portable static build pass. Checkpoint 01's protection bug was independently reproduced by the QA reviewer; this checkpoint includes the fix.

Browser visual/layout and interactive lifecycle validation remain unverified. The direct dot-cloud localhost route is blocked by a browser extension; no alternate address, browser or security-setting bypass is attempted. The parent will arrange the user-authorized demo preview and independent online UI QA. Do not describe this as complete system fidelity or a fully tested release.
