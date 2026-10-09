# Full-length bounded Grindfest ledger

`src/grindfest.js` provides entry, won-round EXP/stamina, and terminal-series accounting for the complete **1000-round** Grindfest. It is an original, local, source-informed candidate. It does not shorten the mode, simulate an authenticated account, or claim server-exact reward timing. The engine owns combat generation and applies each returned reward delta to the player/EXP ledger exactly once.

## Public sources and fidelity boundary

Canonical pages were checked on 7 October 2026. Revision links identify the source snapshot; live pages are fallback reading locations.

- [Grindfest, revision 65054](https://ehwiki.org/index.php?title=Grindfest&oldid=65054), [live page](https://ehwiki.org/wiki/Grindfest): 1000 rounds; one stamina entry fee in addition to ordinary round costs; Grindfest EXP multiplier 1×; 5000 Credits for a full clear. The source describes a random rising monster count up to ten. The stated initial 50%(?) damage and 0.4%(?) increase per round carry uncertainty marks. Monster-count progression and damage generation belong to the engine's explicitly authored/source-uncertain candidate, not this ledger
- [Stamina, revision 65230](https://ehwiki.org/index.php?title=Stamina&oldid=65230), [live page](https://ehwiki.org/wiki/Stamina): battle entry requires at least two stamina; Great starts at 60 and gives 2× EXP with 0.03 stamina per won round; Normal starts at one and costs 0.02. Exhaustion below one suppresses EXP, Credits and drops. Defeat/flee does not charge the unfinished current round. Recovery is one stamina per hour, including time in battle
- [Experience Points, revision 65116](https://ehwiki.org/index.php?title=Experience_Points&oldid=65116), [live page](https://ehwiki.org/wiki/Experience_Points): monster EXP is `(3 + clamp(level, 1, 300)^1.193 / 6) * (1 + powerLevel / 500) * multipliers`. Complete rounds earn EXP; later defeat/flee does not remove it. The source marks rounding after summing the round as uncertain

Normal difficulty and Grindfest use 1×. External bonuses contribute zero. Each round uses the ceiling of the summed monster expression after the stamina multiplier (2/1/0). Tests establish numerical parity with the existing Arena candidate for its supported one to three monsters; Grindfest accepts one to ten. Level and Power Level must be explicit nonnegative safe integers. Levels zero and above 300 clamp to one and 300 respectively. This module does not accept extra caller-supplied multipliers.

Regular item drops, crystals, special boss rewards and RiddleMaster remain **deferred, not implemented**. There are no manufactured materials, participation Credits, guaranteed gear, or equipment entitlements. The fixed full-clear Credits are the only series reward; per-round EXP remains available separately.

## Shared stamina and local timing

Stamina stays in the existing activity record validated by `src/arena.js`. Grindfest does not duplicate a stamina balance. Regeneration uses the existing `regenerateStamina` and `staminaStatus` on detached clones. All time is injected epoch milliseconds; the module never calls `Date.now()` or reads a server clock.

- Preview projects regeneration without writing either record. Opening and cancelling the confirmation incurs no cost
- Entry requires regenerated stamina ≥2 and immediately spends one point. The entry fee can move a character from Great to Normal before round one
- A new won-round settlement regenerates first, chooses EXP and round cost using pre-consumption stamina, then spends the round cost
- A terminal settlement regenerates before checking full-clear credit eligibility. A victory pays 5000 only when this post-regeneration stamina is ≥1
- Recovery is continuous and capped at 99, with nine-decimal stamina rounding. Its timing and threshold-event order are explicit local candidates, not a server timing claim
- The baseline 0.02 won-round deduction continues below one stamina, capped by the remaining balance. That exhausted-round deduction is an explicit candidate choice inherited from the Arena accounting, not an independently verified penalty system
- Defeat/flee keeps the entry charge and completed-round EXP/costs, adds no current-round cost, and pays no series reward
- New actions reject times before the shared regeneration anchor. Retained round/terminal retries accept an otherwise valid older timestamp and remain complete no-ops, even after later regeneration
- Entry is repeatable with no local daily limit, but requires a new increasing canonical `grindfest-N` identifier and sufficient stamina each time

A reserved Arena blocks Grindfest entry and settlement. An already active Grindfest blocks a second entry. The engine must reciprocally block starting Arena/training while Grindfest is active; this ledger cannot change another module's public entry function.

## Strict bounded state

`createGrindfestState()` returns:

```js
{ model: 'grindfest-local-v1', entries: 0, clears: 0, current: null }
```

The first entry creates `current`; each later authorized entry replaces the previous terminal current while retaining lifetime `entries` and `clears`. Only a current series summary and its most recent round receipt are retained:

```js
{
  battleId: 'grindfest-1',       // positive canonical safe-integer ordinal
  enteredAt: nowMs,
  entryStamina: 99,             // regenerated balance BEFORE the entry fee
  status: 'active',             // or 'victory', 'defeat', 'fled'
  completedRounds: 0,           // integer 0..1000
  xpAwarded: 0,                 // safe-integer cumulative EXP in this series
  staminaSpent: 1,              // entry fee + won-round costs, not net of regeneration
  creditsAwarded: 0,            // 0 until terminal; victory can pay 5000
  lastSettledAt: nowMs,         // entry, latest won round, or terminal time
  staminaAtSettlement: null,    // terminal stamina, otherwise null
  lastRound: null               // the newest round receipt, otherwise null
}
```

A round receipt is exactly:

```js
{ battleId, round, xp, staminaCost, staminaBefore, staminaAfter, staminaStatus, settledAt }
```

No 1000-element list or ever-growing series history is stored. The state is under 1000 serialized characters in the covered full-clear and 400-series tests; only bounded scalar digit growth is expected. The existing engine save importer may add a fresh Grindfest state to older imports without changing the old Arena schema or historical receipts.

`validateGrindfestState` validates this record alone. Operations additionally validate the shared activity state and ensure the latest Grindfest time does not exceed its shared regeneration anchor. Retained receipts must match the current ID, round number, timing, stamina status/cost and summary bounds. A one-round summary must equal its one retained receipt. A zero-round series has no round receipt or EXP, and has exactly one stamina spent. Active and losing current series require a remaining nonclear entry; victory requires 1000 completed rounds and at least one lifetime clear.

These bounded summaries cannot reconstruct discarded monster inputs or historical rewards. Validation is a structural/accounting consistency boundary, not proof against save tampering or a cryptographic audit log.

## API

- `GRINDFEST_POLICY`: frozen full-length/source/candidate/deferred-system metadata
- `createGrindfestState()`: fresh state, independent of clocks or stamina
- `validateGrindfestState(state)`: read-only boolean validation
- `previewGrindfest(activity, state, nowMs)`: read-only `eligible`, `available`, `disabled`, `code`, `reason`, `reasons`, projected `stamina`, `staminaAfterEntry`, `staminaStatus`, `nextCredits: 5000` and policy fields. `ok` describes valid projection, while `eligible` describes entry availability. Invalid inputs return `ok: false` and disable entry. `nextCredits` is the conditional nominal full-clear award, not a guaranteed reward
- `reserveGrindfest(activity, state, { battleId, nowMs })`: atomically applies regeneration, spends one stamina and increments entries exactly once. Returns zero EXP/Credits/equipment and the entry stamina delta. Repeating entry is rejected without charging again
- `settleGrindfestRound(activity, state, { battleId, round, monsters, nowMs })`: call after a fully won round. `monsters` must be a dense array of one to ten records exactly shaped `{ level, powerLevel }`; normalize combat objects before calling. Requires the next sequential round. Returns the round receipt and EXP delta, with zero Credits/equipment
- `settleGrindfestSeries(activity, state, { battleId, status, nowMs })`: closes the current series. Victory requires all 1000 settled rounds; defeat/flee requires fewer than 1000. Returns zero EXP/current-round cost/equipment, plus the conditional 5000-Credit clear delta

The latest round duplicate returns `duplicate: true`, `originalXp` and zero reward/cost deltas. Any older-than-retained round rejects with `stale-round`, so pruning never allows replay awards. An exact terminal retry returns `originalCredits` and zero deltas. Conflicting terminal status, stale series ID, cross-kind ID, or an ID that is not strictly newer for entry rejects without mutation. Gaps in increasing IDs are allowed for the engine's shared battle sequence.

Only the engine should apply a successful, nonduplicate delta to the player balance and persist the entire update. There is no player mutation, distributed transaction, concurrent-tab lock, I/O, drop generation, or global random source inside this module.

## Atomicity and test coverage

Every mutating API validates both input records and strict command fields before cloning, calculation, result validation, and writable-property preflight across both records. Only then are the two top-level stamina fields and three Grindfest mutable fields written. Nested records/receipts are replaced instead of modified. Failure, including EXP overflow or read-only fields on either record, applies no regeneration, reward, fee, counter, or receipt mutation. Returned receipts do not alias saved receipts.

Unknown keys, symbols, accessors, non-enumerable properties, inherited record prototypes, sparse/decorated monster arrays, unsafe amounts, malformed IDs, invalid clocks and inconsistent receipt links reject. Inputs are ordinary JSON-shaped records; adversarial proxies or host objects are outside the supported API contract. Duplicates still require valid state, commands and monster input shape.

Run:

```sh
node --check src/grindfest.js
node --test tests/grindfest.test.js
```

The suite covers preview/cancel purity, exact entry/Great/Normal/exhausted boundaries, injected clock rollback and in-battle recovery, Arena exclusion, sequential rounds, full 1000-round clears, repeated same-day series, replay prevention, partial losses, exhausted full clears, formula parity and ten-monster sums, bounded serialized retention, malformed cross-links and commands, getters/symbols, read-only atomicity, overflow, and frozen nested receipt replacement.
