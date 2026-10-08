# Checkpoint 03 · 2026-10-07

Parallel iteration while checkpoint 02 undergoes independent hosted-preview QA. This checkpoint is not automatically published.

## Combat experience

- Defend, Focus and Spirit Stance now have visible status chips, with remaining duration explicitly in player actions
- Completed player-hit events produce short target damage feedback; the display does not reveal future enemy actions or change resolution
- A last-resolution strip shows actual net HP/MP/OC change and elapsed internal units
- Left/right arrow keys select a living target without submitting a combat action
- Dialogs are named by their visible heading for assistive technologies

## Save reliability

- Extracted the actual browser save adapter into a testable module
- Validate the new state before overwriting the existing valid primary save
- Preserve a meaningfully different backup instead of replacing it during unchanged saves/page exit
- Corrupt-primary recovery, unreadable-original retention, storage denial/quota error and invalid-new-state cases tested
- All save limits use one 5,000,000-byte UTF-8 limit, including import and engine restore

## Remaining long-session limitation

Action receipts and encounter history are still unbounded. At the size cap, the new adapter refuses to overwrite the last valid save and displays an error; it does not silently prune history. The prototype still needs a versioned compaction/migration strategy before long-duration progression can be called durable. This is not a complete solution to indefinite save growth.

## Verification

49 deterministic/static/storage tests and syntax checks pass. Static build succeeds. No browser pass is claimed for this new checkpoint; checkpoint 02 remains the parent's frozen preview target until separately approved.
