# First paid Ability Boost and shared Training

New reconstructed source, 2026-10-08. Built separately on Searing checkpoint
`715d325d08bc45e4894bca8b32c7ffaca9f1afa9`; this does not recover the missing
historical Ability Boost implementation or tests.

## Public evidence and bounded scope

[Training revision65215](https://ehwiki.org/index.php?title=Training&oldid=65215),
rechecked today, lists Ability Boost as +1AP, two hours, initial100 Credits, with
500 total ranks capped by character level. It also describes one concurrent
training, full cancellation refund before completion, and revisiting Training
to receive the finished benefit.

[Character/Abilities revision64563](https://ehwiki.org/index.php?title=Character/Abilities&oldid=64563)
separately describes level-earned AP and purchased training AP, while buying an
ability and assigning it remain different operations.

This checkpoint implements only the first paid Boost rank. The later499 ranks,
price curve and their boundary verification remain on the full backlog. There
is no replacement freeAP, starter grant, external perk or automatic ability
purchase/assignment. The completed paid rank is the sole new AP entitlement.

## State and accounting

`shared-training-candidate-v1` retains the Adept ledger and adds
`abilityBoostRank:0|1`. Adept and Boost share one `active` job and global revision.
Receipts include the training ID so that an Adept request cannot replay or cancel
a Boost transaction, or vice versa.

- Confirmed start pays exactly100 earned in-game Credits and stores a two-hour
  deadline. It grants no AP, EXP, item or resource refill.
- One active job blocks both alternatives. No queue or auto-renewal exists.
- Cancellation strictly before the deadline refunds the exact recorded debit
  once. At/after the deadline it cannot refund, even if not yet collected.
- Visiting Training out of combat collects one finished rank exactly once.
  Waiting, serializing, viewing a quote or loading a save does not grant the AP.
- The ability summary exposes `levelAP` and `trainedAP` separately. Total is
  their sum; spent ownership is deducted once regardless of assignment.
  Resetting an ability returns only its invested AP, never refunds Training or
  removes the trained entitlement. Slot behavior and free-reset limits do not change.

New rules version is `persistent-0.91-training-v20`. Actual C22a/C23 Adept saves
validate against the retained old ledger before migration. Migration adds only
Boost rank0 and an explicit Adept receipt ID, preserving Credits, rank, pending
start/deadline, revision, battle, RNG and rewards. Older pre-Training versions
still migrate to an empty current ledger. Unexpected new fields in an old schema
are rejected. Every original active combat policy remains pinned.

## Candidate and trust boundaries

Local time is injectable and not a trusted server clock. Backward action time,
unsafe/fractional timestamps, refund overflow and read-only mutation destinations
are rejected atomically. The model validates mixed completed training durations
and revision lower bounds, but a coherently rewritten local file is not
cryptographic proof of payment or elapsed time.

As before, start/cancel/collection are camp-only. A battle includes inter-wave
pauses. Completed Adept affects the next series; Boost only funds ownership and
does not activate anything. These activation and deadline boundaries remain
explicit conservative local policies, not unseen original-server acceptance.

A failed browser save retains current in-memory state and reports the failure;
it does not guarantee persistence after closing the tab. Cross-tab authority,
server accounts and offline synchronization remain unimplemented.

## Verification

New pure-ledger, AP-budget, engine and actual-app VM tests cover shared-slot
locking, kind-bound replay, debit/refund/collect timing, earned-Credit purchase,
separate AP attribution, owner/slot/reset conservation, malformed data/getters,
read-only destinations, failed saves and stale/cancelled dialogs. A real frozen
C23 pending Adept/active-battle trace preserves exact command events/resources/RNG.
All inherited cases stay enabled. VM behavior does not establish native keyboard,
mobile layout or browser acceptance; independent QA remains a separate gate.
