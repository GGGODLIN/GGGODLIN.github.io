# Bounded ordered command receipts

`src/command-ledger.js` provides a finite, save-local command receipt contract.
It replaces an indefinitely growing list of arbitrary command IDs with a
monotonic ordered-command watermark and a bounded cache of complete results.
This keeps receipt history from eventually exhausting the 5 MB save budget.
Other save data still needs its own size policy; this module does not impose a
bound on the complete game save.

## Persisted shape and limits

```js
{
  model: 'ordered-commands-v1',
  highWater: 0,
  receipts: [],
  evictedLegacy: 0,
  evictedOrdered: 0,
}
```

- `highWater` is the greatest successfully committed ordered sequence
- Tokens are exact typed objects `{ seq: positiveSafeInteger }`; neither raw
  numbers nor strings are ordered tokens
- The cache retains at most **128 records** and **262,144 UTF-8 bytes** for
  `JSON.stringify(receipts)`, including array brackets and commas
- Eviction removes complete oldest records until both limits hold; events and
  results are never partially truncated
- A single receipt that cannot fit as `[receipt]` is rejected, even when the
  cache is empty
- All counters are nonnegative safe integers; append never decreases them
- Retained ordered sequences are a contiguous suffix ending at `highWater`;
  `evictedOrdered === highWater - retainedOrderedCount`
- An empty ordered suffix is permitted: the watermark still rejects every
  consumed sequence. Normal successful appends always retain their new receipt
- Legacy records precede all ordered records and have globally unique retained
  legacy IDs. Once an ordered record has been evicted, no legacy record can
  remain, because eviction is oldest-first. Ordered and legacy identities
  occupy separate namespaces

Ordered and legacy records respectively have these exact keys:

```js
{ kind: 'ordered', seq, battleId, actionId, targetId, result }
{ kind: 'legacy', id, battleId, actionId, targetId, result }
```

Ordered battle IDs must be canonical `training-N` or `arena-N`, where `N` is a
positive safe integer without leading zeroes. Future modes require an explicit
validator update. Legacy `battleId` may also be `null`, meaning historical
provenance is unknown. Action IDs must come from `ACTIONS` in `src/data.js`.
Legacy IDs and non-null targets are nonempty strings of at most 200 JavaScript
UTF-16 code units; IDs are opaque strings, regardless of their contents.

The module accepts plain objects with `Object.prototype` or a null prototype,
and dense ordinary arrays. It rejects accessors, custom prototypes, symbol
keys, hidden extra properties, sparse arrays, and unknown schema fields.
It validates data rather than sanitizing it, and does not invoke getters to
obtain required fields. The persistence boundary remains plain JSON, not
untrusted executable JavaScript objects or proxies.

## Exact successful results

The only saved result shape is `{ ok: true, events: [...] }`. No duplicate flag,
execution flag, error, or other metadata is stored with that result. Each event
must contain only these fields:

- Required nonempty strings: `id` (up to 200 code units), `text` (up to 2,000),
  `type` (up to 40)
- Optional nonnegative safe integers: `amount`, `hp`, `mp`, `sp`
- Optional boolean: `critical`
- Optional nonempty strings up to 200 code units: `targetId`, `actor`, `itemId`
- Optional `resource`: exactly `hp`, `mp`, or `sp`
- Optional `recovered`: exactly `{ hp, mp, sp }`, all signed safe integers

Signed recovery preserves existing out-of-combat maximum reconciliation, which
can lower a resource. Natural-regeneration events can instead carry `mp` and
`sp` directly. There is no arbitrary event-count cutoff: the complete receipt
must fit the total byte budget. String field limits use JavaScript code units;
the cache budget independently measures actual encoded JSON UTF-8 bytes.

## Public API

All read helpers leave their inputs unchanged. Returned tokens and replay
results are detached copies. No helper silently trims an imported ledger.

### `createCommandLedger()`

Returns a fresh ledger with zero counters and no receipts.

### `validateCommandLedger(ledger)`

Returns a boolean after checking exact shapes, values, ordering, uniqueness,
counter reconciliation, and both retention limits. Validation exceptions are
treated as invalid data.

### `validateCommandEvent(event)`

Returns a boolean using the exact strict event schema above. Gameplay history
and log validators can share this predicate; it catches invalid object
inspection without mutating or normalizing the event.

### `nextCommandToken(ledger)`

Returns `{ seq: ledger.highWater + 1 }` for a valid unexhausted ledger, otherwise
`null`. This is a read, not a reservation. A failed gameplay action can retry
the same next sequence. At `Number.MAX_SAFE_INTEGER`, no new token can be
allocated and the sequence never wraps around; retained results remain
replayable.

### `inspectCommand(ledger, token, actionId, targetId)`

- Exactly the next ordered sequence returns
  `{ ok: true, execute: true, targetId: targetId ?? null }`
- A retained identity with matching action and target returns a detached
  `{ ok: true, events: [...], duplicate: true }`
- An omitted or `undefined` target on a retained retry resolves to the saved
  target. Explicit `null` is a real payload value and must match
- A consumed but evicted ordered sequence returns `receipt-expired`; it never
  becomes executable again
- A valid ordered sequence above the next sequence returns
  `command-sequence-gap`
- A retained identity used for a different action or target returns
  `command-payload-conflict`
- Every string token is retry-only, even in a fresh ledger. An unknown legacy
  string returns `legacy-command-retired` and never executes. For example,
  `"1"`, `"ordered:1"`, and `'{"seq":1}'` cannot impersonate `{ seq: 1 }`

Eligible inspection does not establish gameplay legality or mutate the game.
The engine must resolve a new command's current target and validate its action
as usual. Since duplicates are save-global, retries should be inspected before
checking whether the current battle remains active.

### `appendCommandReceipt(ledger, token, payload)`

`payload` has exactly `{ battleId, actionId, targetId, result }`; it must contain
an explicit normalized target string or `null`. Only the eligible next ordered
sequence and a complete successful result can be appended. Returns `{ ok:
true }` on success or a failure object on rejection.

The function prepares and validates the new cache, complete receipt, eviction
counters, and destination property writability before changing the ledger.
Rejected results, oversize results, stale or conflicting tokens, counter
overflow, and read-only fields leave the original ledger unchanged. Frozen
nested receipts can be read and retained because append replaces the array
rather than editing old records. Stored new results are detached from the
caller's result object.

Appending an already-retained matching identity returns
`command-already-committed`; callers should return the replay obtained during
inspection rather than append a duplicate.

**Engine integration must also be atomic:** execute on a draft, append the
receipt to that draft, validate the whole draft, then commit game state. If
append fails after an action, abandon the entire draft. This module can
guarantee atomic mutation only of the ledger it receives, not unrelated game
state mutated before the call.

### `migrateLegacyReceipts(oldReceipts, currentBattleId = null, currentBattleReceiptIds = [])`

Accepts schema-1 records with exactly `{ id, actionId, targetId, result }` and
returns a new ledger with `highWater: 0`, `evictedOrdered: 0`, and the newest
complete bounded legacy tail. It validates all old records, including records
that will be evicted. `evictedLegacy` records how many were omitted. A malformed
history, duplicate ID, unrepresentable individual receipt, or invalid
provenance input returns `null`; the original input is unchanged.

`currentBattleReceiptIds` is an array of unique existing legacy IDs. Those IDs
are assigned the supplied canonical current battle ID; all other records get
`battleId: null`. With a null battle ID the provenance list must be empty.
No provenance is guessed from legacy ID text. Historical strings resembling
typed tokens remain ordinary legacy IDs.

The game migrator should separately validate schema-1 battle/global receipt
consistency before calling this helper. Migration should be persisted with the
new game schema; it does not rewrite or infer missing historical battle facts.

## Failure codes

Failures have `{ ok: false, code, error, events: [] }`, where `code` is stable and
`error` is descriptive text. Callers should branch on `code` rather than text.

- `invalid-command-ledger`: invalid imported or resulting ledger
- `invalid-command-token`: invalid token shape or bounds
- `invalid-command-payload`: unsupported action or invalid target at inspection
- `command-sequence-gap`: a future sequence skips an unconsumed command
- `receipt-expired`: consumed ordered sequence whose saved result was evicted
- `legacy-command-retired`: unknown or evicted retry-only legacy ID
- `command-payload-conflict`: retained identity bound to a different payload
- `invalid-command-receipt`: append payload or successful result is invalid
- `command-already-committed`: append attempted for an already-retained identity
- `command-receipt-too-large`: one complete receipt exceeds the byte budget
- `command-ledger-read-only`: destination ledger properties cannot be committed

## Scope of the guarantee

This is a **finite-result replay contract**, not infinite replay of arbitrary
IDs. Within one consistently retained save lineage, accepted ordered commands
cannot execute twice: cached retries return their saved result, and older
consumed sequences fail closed after their results expire. Allocation and
execution remain synchronous and ordered within that game instance.

It does **not** provide globally exactly-once execution. Importing an earlier
save or restoring a local backup rolls back the watermark and can reopen
commands that were consumed only in the newer save. Independent concurrent
tabs can allocate the same next sequence and overwrite one another's saves.
Preventing rollback, cross-tab lost updates, or execution across separate save
branches requires a separate authoritative transactional store or coordination
protocol; this local cache makes no such claim.

## Verification

Run `node --test tests/command-ledger.test.js`. The focused suite covers typed
tokens, reload and detached replay, sequence gaps/conflicts/expiration, legacy
IDs that resemble tokens, migration provenance, count and exact UTF-8 byte
boundaries, complete oversized-result rejection, sequence and counter
exhaustion, strict event/schema validation, no getter execution, and atomic
read-only refusal.
