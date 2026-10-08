# Manifest checkpoint regression adaptations

The predecessor is frozen `67222024c781bf4fb374718e741f2d286427765a`.
No inherited fixture bytes are changed. New fixture files record that exact
predecessor and index its accepted historical envelopes.

Changes to inherited assertions are limited to these explicit contracts:

1. Current save rules advance from v30 to v31. Current Training changes model and
   gains `manifestDestinyRank: 0`. Full historical replay expectations add exactly
   those migration fields; all other state, events, paid prices and receipts
   remain compared. Historical hash tests remove the new field and restore the
   predecessor model/version before comparing the original stored hash.
2. Tests constructing historical envelopes from a current game must remove the
   future Manifest field and use the historical Training model. Frozen strict
   validators still reject that future field, even when zero. Positive historical
   controls and corruption rejection assertions remain present.
3. Ability summaries now expose `levelMastery` and `trainedMastery` separately;
   original AP, total Mastery, spending and remaining-budget assertions remain.
   Existing zero-rank controls explicitly expect trained Mastery zero.
4. Release-integrity tests now use the declared Manifest runtime baseline: five
   intentional source changes and25 byte-identical modules. A separate check
   proves the new compatibility module is the exact predecessor Training source
   with only the two relative import paths corrected. Build graph, storage keys,
   artwork and historical fixture checks remain required.
5. Owner-bound Training reviews now close on pagehide, rather than leaving a
   disabled confirmation visible. The inherited Boost test captures its complete
   valid token/family/revision before release, requires the review and button to
   be gone, then invokes both detached valid and bare stale event payloads. All
   no-mutation and primary/backup/no-write assertions remain. This is an explicit
   UI lifecycle change, not merely schema formatting, and the detached-listener
   test is synthetic event coverage, not a reproduced native-browser defect.

These adaptations do not loosen save validation or change original gameplay
expectations to make a failing implementation pass. New tests separately cover
paid Manifest progression, shared-job conservation, deadlines, complete historical
acceptance/rejection controls and the intentional60-versus63 Mastery limit.
