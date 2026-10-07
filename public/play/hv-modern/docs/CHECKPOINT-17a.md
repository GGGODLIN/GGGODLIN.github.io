# Checkpoint 17a — confirmed replacement persistence

Narrow correction on checkpoint17 only. Import and reset now stage the candidate save and verify the primary write before changing the current game, migration consent flags, original archive, selected item, modal, route, feedback or success message.

On a failed primary or modern backup write the previous in-memory game and saved primary remain; a pending schema1 preview stays read-only. The selected import and modal remain available for a retry. The error is reported without a success toast. If a confirmed legacy replacement succeeds but its full browser backup cannot fit, the existing archive warning is shown rather than hidden by generic success copy.

Eight bounded tests execute the actual app replacement helper against the real save writer and injected storage failures. This is a UI transaction-order correction, not a change to combat, rewards, migrations or retention limits. Source and live UI independent verification remain separate gates.
