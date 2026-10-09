# Bounded ordinary-Arena candidate

`src/arena.js` supplies the activity and reward-accounting layer for nine complete ordinary Arenas. The six later additions and their source/compatibility boundaries are specified in [ORDINARY-ARENAS](ORDINARY-ARENAS.md). It is an original local implementation, not an authenticated client or a server-exact reproduction. The combat engine owns battles, applying returned rewards to the existing EXP ledger, allocating attributes, and constructing any authored equipment fixture. Training must never reserve an Arena or call its reward settlement functions.

## Verified public sources

Read on 7 October 2026. Direct historical fetches of Arena, Stamina, and Experience Points failed, but the accessible current pages identified the exact revision IDs below in their permanent links. The detail pages and Dawn page were accessible. Public documentation is evidence, not a server implementation or account observation.

- [Arena, revision 64924](https://ehwiki.org/index.php?title=Arena&oldid=64924), also [accessible page](https://ehwiki.org/wiki/Arena): level and prior-clear requirements, one attempt per UTC day regardless of outcome, entry-day accounting over midnight, clear credits, and guaranteed equipment. A preceding challenge that has retired no longer prevents the lowest available challenge from unlocking
- [First Blood, revision 55263](https://ehwiki.org/index.php?title=First_Blood&oldid=55263): level 1, waves `[1, 1]`, first/repeat credits `100/20`, retires at 140
- [Learning Curves, revision 55262](https://ehwiki.org/index.php?title=Learning_Curves&oldid=55262): level 10, waves `[1, 1, 2, 2]`, credits `1000/200`, retires at 150
- [Graduation, revision 55261](https://ehwiki.org/index.php?title=Graduation&oldid=55261): level 20, waves `[2, 2, 2, 2, 3, 3]`, credits `2000/400`, retires at 165
- [Dawn, revision 59286](https://ehwiki.org/index.php?title=Dawn_of_a_New_Day&oldid=59286): reset occurs at 00:00 UTC even while a challenge is in progress
- [Stamina, revision 65230](https://ehwiki.org/index.php?title=Stamina&oldid=65230), also [accessible page](https://ehwiki.org/wiki/Stamina): maximum 99; entry requires at least 2. Great begins at 60, doubles EXP, and spends 0.03 per won round; Normal starts at 1 and spends 0.02. Exhaustion suppresses EXP, credits, and drops. Defeat/flee has no charge for that unfinished round. Recovery is one point per hour, accruing during combat although the visible counter updates outside it
- [Experience Points, revision 65116](https://ehwiki.org/index.php?title=Experience_Points&oldid=65116), also [accessible page](https://ehwiki.org/wiki/Experience_Points): complete rounds award EXP; later loss does not erase completed-round EXP. Monster EXP uses `(3 + clamp(level, 1, 300)^1.193 / 6) * (1 + powerLevel / 500) * multipliers`. The source itself marks rounding after summing a round as uncertain

## Explicit local choices and unresolved fidelity

- New-profile stamina 99 is an authored initial fixture, not a recovered account balance
- Every time-dependent API requires injected epoch milliseconds. There is no `Date.now()` call, server clock, real Dawn award, session authentication, or external account eligibility in this module. UTC day keys use four-digit ISO years from 1970 through 9999
- Recovery is modeled continuously, rounded to nine fractional digits. Regeneration runs before reward eligibility and round consumption. This timing and threshold-event ordering are candidate decisions, not verified server scheduling. Capped recovery is discarded instead of banked
- `regenerateStamina(..., { inBattle: true })` still accrues internal stamina. Its `displayDeferred` flag lets the engine keep an appropriate battle-time presentation. No combat-time accrual is silently lost
- Normal difficulty and these Arenas each contribute 1×. External bonuses contribute zero. Great contributes 2×. The module does not accept a caller-provided multiplier that could silently inject a forum, gallery, donor, training, or Isekai bonus
- Round EXP is the ceiling of the summed monster formula, never the sum of individually rounded rewards. The uncertain rounding is named `ceil-sum-of-round-candidate`
- Monster identity, statistics, and Power Level are supplied by the caller and must be labeled authored fixture data where unsourced. This module verifies the complete sourced monster count, not server monster generation
- Below one internal stamina point, all reward paths are suppressed. This bounded candidate continues the baseline 0.02 won-round stamina deduction, capped at remaining stamina; that sub-one deduction is not independently verified. No RiddleMaster puzzle, hidden failure count, penalty rate, or accelerated penalty drain is fabricated
- An exhausted victory still records the completed challenge and consumes its first-clear designation. That accounting choice is explicit; no positive clear reward is paid while exhausted
- A rewarded victory returns one equipment entitlement. The engine now materializes it using the separately documented quality-roll fixture; old active series retain their fixed-template reward policy. Sample-pool selection/weights are authored and must not be presented as the original game's rarity or drop distribution. This module manufactures no equipment. Monster drops, token chances, and a complete loot generator remain pending
- Loss/flee has no clear credits or equipment entitlement. Earned previous-round EXP stays earned. There is no fabricated participation reward

## Data and integration contract

Creation returns six JSON fields:

```js
{
  stamina: 99,
  lastRegenAt: nowMs,
  attempts: {},       // attempts[arenaId][entryDay] = reservation
  clears: {},         // clears[arenaId] = successful clear count
  settledRounds: [], // ordered immutable-by-contract reward receipts
  settledSeries: []  // terminal result receipts
}
```

A reservation stores `{ entryDay, enteredAt, battleId, status }`. `battleId` begins as `null`, binds when the first round or terminal loss is settled, and must remain unique. `status` is `reserved`, `victory`, `defeat`, or `fled`. Only one reservation may remain open, including over midnight. Failed or abandoned battles must be explicitly settled; simply leaving a screen does not refund the attempt.

- `ARENAS`: frozen definitions with `id`, `name`, `minLevel`, `maxLevelExclusive`, `roundCounts`, `rounds`, `monsterCount`, `firstCredits`, `repeatCredits`, `xpMultiplier`, `source`, `detailSource`, and `status`
- `createActivityState(nowMs)`: constructs a fresh authored profile; invalid times throw
- `utcDay(nowMs)`: returns `YYYY-MM-DD`; invalid times throw
- `validateActivityState(activity)`: read-only boolean validation, including the relationships among reservations, ordered rounds, terminal receipts, first/repeat credits, and clear counts
- `previewActivities(activity, playerLevel, nowMs)`: read-only array of definitions plus `eligible`, `available`, `disabled`, `reason`, `code`, `reasons`, `entryDay`, projected `stamina`, `staminaStatus`, `priorCleared`, `attemptedToday`, `clears`, and `nextCredits`
- `regenerateStamina(activity, nowMs, { inBattle = false })`: applies recovery and returns its delta/status. Backward time neither modifies the recovery anchor nor awards recovery
- `reserveArena(activity, arenaId, playerLevel, nowMs)`: validates first, then atomically applies recovery and reserves the entry-day attempt; returns `{ ok, entryDay, definition, stamina }`
- `calculateRoundExperience(monsters, stamina)`: pure candidate EXP calculation; monsters need explicit integer `level` and nonnegative safe-integer `powerLevel`. Returns EXP, raw sum, and multiplier without awarding anything
- `settleArenaRound(activity, { battleId, arenaId, round, monsters, nowMs })`: call exactly when a full round is won. The function requires sequential rounds and the exact defined monster count. It commits stamina and a receipt, returning the EXP delta. It does not change player EXP
- `settleArenaSeries(activity, { battleId, arenaId, status, entryDay, nowMs })`: victory requires all defined rounds. Returns clear credits and `equipmentDropCount`, closes the entry-day reservation, and records unlock history. It does not change player credits or inventory
- `staminaStatus(stamina)`: returns `Great`, `Normal`, or `Exhausted`; invalid input throws

Successful retries return `duplicate: true` and zero reward/cost deltas. Original rewards are available in `originalXp`/`originalCredits`; equipment entitlements also return zero on repeat. A repeated original call remains a no-op even if later recovery has advanced the clock. New actions reject backward timestamps.

The caller must apply each successful, nonduplicate delta to its corresponding player/EXP ledger exactly once, together with persisting the resulting state. This module does not supply a distributed transaction, concurrent-tab lock, or tamper-proof local storage. Preserving receipts across JSON saves is essential.

## Validation and atomicity

Inputs are ordinary JSON-shaped records, not adversarial proxies or host objects. The validator rejects unknown state keys, inherited/accessor properties, sparse receipt arrays, invalid times, duplicate receipts, orphaned battles, skipped rounds, mismatched terminal outcomes, forged clear counts, and unsafe amounts. Invalid actions return `{ ok: false, code, error }` without applying even otherwise-due regeneration. Writable top-level fields are checked before committing any mutation; nested records are copied rather than edited in place.

Run `node --test tests/arena.test.js`. Coverage includes full wave counts, sequential unlocks, first/repeat credits, loss/flee accounting, midnight crossing, regeneration during battle, cap and rollback, stamina thresholds, candidate rounding, exhaustion, malformed state, atomic rejection, receipt idempotence, and JSON persistence.
