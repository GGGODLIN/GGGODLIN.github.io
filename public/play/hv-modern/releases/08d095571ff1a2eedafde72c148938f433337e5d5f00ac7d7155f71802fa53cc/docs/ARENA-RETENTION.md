# Bounded Arena audit retention

The schema2 activity representation uses `retentionModel: 'bounded-arena-v1'`. This is a local storage and validation change, not a new Arena, reward rule, or server-fidelity claim. The three definitions and all gameplay formulas, level gates, stamina thresholds, UTC reset rules, credits, equipment entitlements, and source assumptions in [ARENA.md](ARENA.md) remain unchanged. That earlier document's six-field state, unbounded audit arrays, nullable reservation ID, and four-argument reservation signature describe the frozen schema1 contract only. This document supersedes those data-contract sections for current activity state.

## Current state

```js
{
  stamina: 99,
  lastRegenAt: nowMs,
  attempts: {},
  clears: {},
  settledRounds: [],
  settledSeries: [],
  retentionModel: 'bounded-arena-v1',
  archivedClears: {},
  currentBattleId: null
}
```

- `attempts[arenaId][entryDay]` keeps the existing UI-facing nesting, but contains only the latest entry day for each Arena. At most three attempts exist for the current three-Arena catalog
- `settledRounds` contains only the current/latest Arena series' complete round receipts, in contiguous round order. Its bound is that Arena's sourced round count, currently at most six
- `settledSeries` contains zero or one terminal receipt for that same series. A reservation has no terminal receipt; a completed series has exactly one
- `currentBattleId` identifies the current/latest Arena series even if the engine has subsequently run training. IDs have canonical `arena-N` form, with a positive safe-integer `N`, no leading zeros or alternate numeric spellings
- `clears[arenaId]` is the exact lifetime successful-clear count. `archivedClears[arenaId]` counts victories whose detailed receipts were pruned. Omitted counters mean zero; present counters must be positive safe integers
- For every Arena, `clears = archivedClears + retainedTerminalVictory`. First-clear attribution on the retained victory agrees with whether that Arena has any archived clears
- A null `currentBattleId` requires empty attempts, receipts, and both clear-counter objects. This is the pre-Arena state; stamina and its clock can still have changed

Only detailed audit history is discarded. Lifetime unlock and first/repeat-reward accounting remain exact. This is bounded by catalog size and current-series round count, with only normal numeric digit growth. It is not a historical event browser, tamper-proof ledger, cross-tab lock, or distributed transaction.

## Reservation and settlement

The only changed existing API signature is:

```js
reserveArena(activity, arenaId, playerLevel, nowMs, battleId)
```

The caller must supply its globally allocated next battle ID before entering. The Arena ordinal must exceed the previous `currentBattleId` ordinal. Gaps are permitted because training shares the engine's global sequence. Reservation immediately binds the exact ID; null-ID wildcard matching is removed.

After eligibility succeeds, the next reservation atomically:

1. Folds the previous terminal victory into its Arena's archived clear counter
2. Discards the previous series' round and terminal receipts
3. Preserves the latest attempt for every other Arena and replaces the entering Arena's prior attempt
4. Stores the new canonical current ID and its original UTC entry day
5. Applies the unchanged projected stamina recovery

No pruning occurs merely because training starts, the UI changes screens, recovery runs, or a new UTC day arrives. An active overnight Arena retains its original entry day and blocks a second reservation until explicitly finished.

The other existing exports and return shapes are unchanged. `settleArenaRound` and `settleArenaSeries` require the exact retained current ID and matching Arena/reservation links. Retrying a retained round or identical terminal result returns `duplicate: true` with zero reward and cost deltas, even if later recovery has advanced the clock. A contradictory terminal retry rejects. Once the next Arena has pruned a series, all calls using the stale ID reject without mutation; they do not reconstruct or replay old payouts.

A retained attempt for another Arena continues to block that Arena on its UTC entry day after its detailed receipts disappear. The nondecreasing `lastRegenAt` anchor prevents a clock rollback from reopening discarded older days. New actions reject backward timestamps; the existing read-only rollback result from stamina regeneration remains unchanged.

## Schema1 migration

```js
migrateActivityState(oldActivity, currentBattle = null) // new valid state or null
```

The helper first validates the *complete* old activity using the exact frozen validator in `src/compat/arena-schema1.js`. An invalid old receipt cannot become acceptable merely because it would be pruned. The caller must first validate the full schema1 save, then validate schema2 engine-wide history and global-next-ID links; this helper does not replace either full-save check.

Migration copies authoritative stamina, recovery time, lifetime clears, and retained receipts. It never recomputes historical EXP, credits, loot, or player balances, and never mutates the old object.

Selection and accounting:

- If an old reservation is open, retain that Arena series. A null reservation ID can be bound only using a supplied plain-data `currentBattle` with matching `arenaId` and `entryDay`, canonical `id`, `kind: 'arena'`, and `status: 'active'`. Any supplied current battle must match an already-bound reservation too. An already-bound reservation can migrate without this optional argument
- Otherwise retain the last old terminal receipt and that series' round receipts
- Keep only each Arena's latest UTC-day attempt, including the active reservation when present
- Derive `archivedClears` by subtracting the retained terminal victory from the old lifetime counts, never by recalculating reward amounts
- Validate the entire resulting bounded activity; return `null` if its IDs, counts, links, ordering, or other invariants do not hold

Fresh saves, reservations before their first win, partially completed active series, completed victories, and fled/defeated series are supported. A null reservation without a verified active battle is rejected rather than assigned an invented ID.

## Validation and atomicity

The current validator rejects accessor and hidden non-enumerable record fields, and checks exact top-level keys and model identifier, finite stamina, allowed times, known Arena keys, at most one latest attempt per Arena, canonical unique attempt IDs no newer than the current ID, matching attempt dates, and at most one reservation bound to the current ID. Historical terminal attempts may lack detailed receipts, but historical victories require archived clear evidence.

Every retained receipt belongs to the current ID and its matching attempt. Round receipts retain the original EXP/stamina/time-value checks and contiguous ordering. Terminal receipts retain original status, completion, credit, first-clear, and time invariants. Counters reconcile against the retained victory and reject zero, negative, fractional, unknown, or unsafe counts.

All writes copy nested records, preflight writable top-level fields, validate the complete next state, and then commit. Eligibility failures, stale IDs, malformed inputs, read-only fields, and counter overflow apply no partial regeneration, pruning, attempt change, or reward receipt. As before, inputs are ordinary JSON-shaped data, not adversarial proxies or host objects.

## Verification and limits

Run:

```sh
node --test tests/arena-bounded.test.js tests/arena.test.js
```

The original 28 schema1 tests import the frozen compatibility module without other edits. The bounded suite covers the new initial shape, exact source-definition and payout parity across all three Arenas, 180 complete daily loops, retained/stale retries, same-day blocks after pruning, overnight entry, rollback, loss/flee, threshold and exhaustion parity, canonical IDs, migration before and after settlement, invalid old history, read-only failures, safe-integer overflow, malformed archives, and JSON restoration.

This change supports only the current early-Arena catalog. A future 1,000-round activity needs its own deliberately bounded active-series representation and validation design; no such activity or extra reward mechanic is enabled here.
