# Adept Learner training ledger

This document preserves the original Adept-only ledger contract for migration reference. Shared-ledger differences and AP accounting are documented in [ABILITY-BOOST](ABILITY-BOOST.md) and [FULL-ABILITY-BOOST](FULL-ABILITY-BOOST.md); the current third family and Mastery accounting are in [MANIFEST-DESTINY](MANIFEST-DESTINY.md). Queues, automatic repetition, time acceleration and starter training ranks remain absent.

## Sources and limits

- [Training, revision 65215](https://ehwiki.org/index.php?title=Training&oldid=65215): Adept Learner grants +1% EXP per completed rank, has a maximum of 300 ranks, and takes one hour per rank. Only one training can run at a time. Aborting refunds the payment; completed training cannot be undone. Combat can continue during training, and the player must revisit Training to receive its benefit.
- [Experience Points, revision 65116](https://ehwiki.org/index.php?title=Experience_Points&oldid=65116): training is part of the additive `1 + hath_perk_bonus + training_bonus` group, separate from the other EXP multipliers. With no Hath bonus, rank N supplies `1 + N/100`, reaching **4×** at rank 300. This is an entitlement for later combat EXP, not an immediate EXP award.

These are retrieved wiki revisions, not independent server validation. The game's Persistent 0.91 version does not establish that every wiki formula is server-exact.

The source's printed price formula, for current completed rank N, is:

```js
Math.round((100 + 50 * N) ** (1 + 0.000417446 * N))
```

The implementation names this `adept-printed-formula-r65215-candidate-v1`. Ranks 1–5 cost 100, 150, 201, 252, and 303 Credits. The printed formula produces 49,999 Credits for rank 300 and 5,126,663 Credits for all 300 ranks. The source table instead lists 50,000 and 5,126,661. Neither the endpoint nor aggregate is patched. The printed decimal exponent and JavaScript's rounding are not claims about the server's internal precision.

Two deliberate local boundaries resolve gaps in the inspected source:

1. Cancellation refunds the recorded full payment only **strictly before** the deadline. At or after the deadline, an uncollected job is nonrefundable and waits for a Training visit. The source does not explicitly settle this elapsed-but-unvisited transition.
2. All changes require an out-of-combat profile, including collection and cancellation. An active battle's wave pause remains inside the series. Training continues to elapse while combat runs, but collection waits for the series to end. The engine snapshots completed ranks on the next battle's entry; this is a local candidate boundary, not verified original mid-battle behavior.

## Persisted schema

The complete training ledger is stored at `game.training`:

```js
{
  model: 'adept-training-candidate-v1',
  adeptRank: 0,
  active: null,
  revision: 0,
  lastAction: null,
  lastChangeAt: null
}
```

An active job has exactly these keys:

```js
{
  id: 'adeptLearner',
  fromRank: 0,
  paidCredits: 100,
  startedAt: 1767225600000,
  endsAt: 1767229200000
}
```

After a change, exactly one latest-action receipt is retained:

```js
{
  type: 'start', // 'start', 'cancel', or 'complete'
  expectedRevision: 0,
  fromRank: 0,
  paidCredits: 100,
  startedAt: 1767225600000,
  endsAt: 1767229200000,
  at: 1767225600000
}
```

The next receipt replaces the previous one. There is no growing history, deferred reward queue, accumulated offline count, or background job list. A cancellation receipt retains enough of the cancelled job to validate and acknowledge its refund without reconstructing the player's unrelated finances. A completion receipt grants no currency or EXP.

`lastChangeAt` equals the receipt's `at`. `expectedRevision` equals the resulting ledger revision minus one. An active job is paired with a matching start receipt. Completed rank is 0–300; the job's source rank is 0–299. Job price is recomputed against the explicitly versioned formula, and the deadline must be exactly 3,600,000 milliseconds after its start.

A fresh ledger is the only revision-zero representation. Active revisions are odd, terminal revisions are even. Rank N requires at least 2N revisions; an active job at rank N requires at least 2N+1; a cancelled job at rank N requires at least 2N+2. A job from rank N cannot have started earlier than N full hours after epoch zero. These are provable minimums, not an attempt to reconstruct discarded history. The maximum revision is the even `Number.MAX_SAFE_INTEGER - 1`, so every accepted start leaves room for one settlement.

## API

`src/training.js` exports:

- `TRAINING_POLICY`: frozen model IDs, limits, source links, and candidate boundaries; `battleModel` is `adept-exp-candidate-v1`
- `createTrainingState()`: independent, empty ledger; no grants
- `validateTrainingState(training)`: boolean, strict ledger-only validation; never repairs or migrates data
- `adeptTrainingCost(rank)`: positive integer candidate price for ranks 0–299; throws `RangeError` outside that domain, including rank 300
- `quoteAdeptTraining(state, nowMs, expectedRevision)`: read-only quote requiring the current revision, eligible profile, sufficient Credits, no active job, and no active battle
- `startAdeptTraining(state, nowMs, expectedRevision)`: atomically debits the quoted price and persists one exact-hour job
- `cancelAdeptTraining(state, nowMs, expectedRevision)`: before the deadline, atomically refunds the recorded payment and clears the job
- `visitTraining(state, nowMs)`: at or after the deadline, grants exactly one completed rank and clears the job; earlier visits or visits without a job are unchanged successes
- `getTrainingView(state, nowMs)`: detached, read-only presentation data; it never completes a job

Runtime calls accept a whole game object but inspect only their owned ledger plus own-data player `credits`/`level`, progression `kind`, and battle `status`. They require `progression.kind === 'experience-ledger'`, nonnegative safe-integer Credits, and integer player levels 1–500. There is no Adept rank-versus-player-level restriction. Full EXP-ledger validity remains the engine's responsibility. A missing battle property or `battle: null` means no combat; terminal battle statuses are `victory`, `defeat`, and `fled`. An active status locks changes regardless of phase.

Every runtime failure returns `{ok:false, code, error}`. An insufficient-Credits quote additionally retains the price/deadline preview. Success from a mutating API, including no-ops and retries, has:

```js
{
  ok: true,
  changed: false,
  duplicate: false,
  revision: 0,
  adeptRank: 0,
  cost: 0,
  refund: 0,
  completedRanks: 0,
  creditsDelta: 0,
  expMultiplier: 1,
  active: null, // detached job when present
  receipt: null // detached latest receipt when present
}
```

`cost`, `refund`, `completedRanks`, and `creditsDelta` describe **this call's actual changes**. On an acknowledged retry they are all zero, even though `receipt.paidCredits` records the original price. A newly completed rank returns `completedRanks: 1`; this is a multiplier entitlement only.

A successful quote includes `id`, `costModel`, `expectedRevision`, `revision`, `fromRank`, `toRank`, `cost`, `durationMs`, `startedAt`, `endsAt`, `expMultiplierBefore`, and `expMultiplierAfter`.

The view includes `model`, `battleModel`, `costModel`, `revision`, `adeptRank`, `maxRank`, `expBonusPercent`, `expMultiplier`, `nextCost`, `credits`, `active`, `activeBattle`, `readyToComplete`, `status`, `remainingMs`, `canStart`, `canCancel`, `canCollect`, and `warning`. Status is `idle`, `training`, `ready`, or `capped`. At the cap, `nextCost` is null. Exact deadline remains `active.endsAt`. Eligibility reflects game rules, balances, and numeric limits; write-protected inputs are rejected by mutation preflight rather than by a read-only view.

## Time, collection and retries

The caller supplies all epoch-millisecond timestamps. This module never reads a system clock. Times are nonnegative safe integers through **253402300799999**, the final millisecond of four-digit UTC year 9999, matching the other local clock contracts. A start must leave room for its full hour. Backwards observations relative to the last change or active start are rejected, including otherwise matching retries. Reads do not update `lastChangeAt`.

Persisted deadlines survive reloads and offline time. Reading the view, quoting another start, serializing, and reloading cannot grant ranks. A Training-page timer may call `visitTraining` while the page is visible; no other page or load path should collect automatically. A very late visit still grants exactly one rank, never all elapsed hours. Collection's completed-rank change occurs only once; duplicate visits are no-ops and do not advance revisions or timestamps.

Start and cancel share one optimistic `expectedRevision`. A fresh request must match the current ledger revision. Only the retained receipt can acknowledge a retry: its action type and previous expected revision must match. `nowMs` is an observation clock, not a second purchase parameter, so later nondecreasing timestamps may retry the same operation. A matching retry succeeds without further debit, refund, collection, or writes, including during combat or on frozen data. A conflicting action using the same retained revision fails; older and future revisions fail. Quotes never replay old receipts.

## Atomicity and strict data boundaries

Owned records must be plain own-enumerable data records with exact keys. Both ordinary and null prototypes are supported; custom prototypes, inherited fields, accessors, symbol keys, hidden keys, surplus ledger/job/receipt keys, forbidden prototype-related keys, and coercible substitutes are rejected. Canonical numeric scalars reject negative zero, fractional values, unsafe integers, NaN, and infinity. Descriptors are inspected before values, so rejected getters are not invoked. Proxies and host objects are outside this JSON-data API.

Before any change, the module validates all inputs and prospective bounds, preflights writability of every destination, and constructs detached result data. Insufficient funds, unsafe refunds, time overflow, stale revisions, read-only fields, and malformed state leave the input unchanged. A terminal revision ceiling preserves room to settle every accepted job. Training never changes RNG, EXP, stamina, AP, inventory, battle state, history, or event counters.

This ledger validator proves local consistency, not provenance or tamper resistance. Whole-save validation, migrations, command/event integration, persistence and any stronger trust boundary are engine-owned. Older saves must receive an empty ledger rather than starting ranks or simulated rewards. Existing active series must preserve their prior behavior under the engine's legacy `none-v1`/rank-zero battle snapshot. New series use the completed-rank snapshot with the EXP multiplier applied before the existing sum-then-ceil candidate; do not multiply an already rounded payout.

## Focused verification

Run `node --test tests/training.test.js`. The suite covers price anchors and the unpatched aggregate, ordinary and cap progression, exact deadlines, offline representations, retained and conflicting retries, insufficient funds, overflow, immutable/getter/malformed inputs, active battle and wave-pause locks, safe time bounds, no collection elsewhere, duplicate visits, bounded retention, and isolation from unrelated game data. Engine persistence, battle EXP integration, and UI flows belong to their respective integration suites.

## Reconstructed shared-ledger extension

Current model is `shared-training-candidate-v1`, with first Ability Boost rank and one shared slot. The previous Adept schema described above is retained solely for strict migration; see [ABILITY-BOOST](ABILITY-BOOST.md) for current receipt IDs, AP entitlement and conservation.
