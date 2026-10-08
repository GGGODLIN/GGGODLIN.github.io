# Fire / Searing Skin candidate

New reconstructed checkpoint, 2026-10-08. This is newly written source and tests,
not the missing historical C23 implementation. Baseline is verified recovery
`f67ba8401d793734f4282bb8217f5ef3d7c892f8`.

## Evidence and bounded scope

[Spells revision 65260](https://ehwiki.org/index.php?title=Spells&oldid=65260),
freshly checked 2026-10-08, describes Fire's Searing Skin with10% target damage
reduction and3-tick duration. Its first-tier25% proc rate is an observed average,
not independently verified current-server behavior. Cold resistance−25 is also
documented, but this implementation has no Cold spell: that interaction and
cross-element explosions remain explicitly deferred. This is not a damage-over-
time effect. Existing Fire damage, targets, cost and cooldown are unchanged.

[Action Speed revision 64923](https://ehwiki.org/index.php?title=Action_Speed&oldid=64923)
describes spell proc durations on100-unit ticks. Item turns use no internal time.
The source does not settle exact application, refresh or simultaneous-event
ordering. Those details below are named candidate choices.

## Explicit local choices

- An independently successful Fire hit on a surviving target can proc, including
  a glancing hit. Misses, physical attacks and killed targets draw no proc RNG.
- Exactly one new random draw occurs after that target's impact/damage draw and
  before the next target is processed; draw below0.25 succeeds. Adding this draw
  intentionally changes future RNG only for new-policy series.
- Status applies before resolving the casting action's elapsed time. Its deadline
  is current shared tick+3, so the cast itself may cross a tick and leave2 shown.
  This is a crossed-global-tick policy, not necessarily300 units after impact.
- Reapplication replaces the deadline with current tick+3; it never stacks10%
  reductions or adds durations together.
- Expiry is processed at the tick boundary before an enemy attack tied to that
  timestamp, matching the existing tick-first scheduler candidate. Zero-time
  items neither age effects nor trigger enemies.
- For the original enemy physical-attack fixture, multiply damage by0.9 after its
  existing mitigation/Defend factors, then apply the single final floor and
  existing minimum1. Exact original-server multiplier/rounding order is unverified.
- Dead targets, completed waves and terminal outcomes retain no enemy effects.
  This prevents statuses crossing to new enemies. No enemy spell system is
  claimed; every implemented enemy attack is the original physical fixture.

## State, migration and visibility

Rules version is `persistent-0.91-training-v19`. Every battle has `statusRules`
and `enemyEffects`. New battles pin `searing-skin-candidate-v1`. Every supported
older save is migrated with `none-v1` and an empty map, preserving its entire
active-series behavior and RNG. Only its next battle enables this candidate.
Old-version imports that already contain these new fields are rejected rather
than silently normalizing them.

The strict map uses living current enemy IDs with exactly `{ expiresAtTick }`.
Dead, unknown, expired, excessive, hidden, accessor, symbol or malformed records
are rejected. Disabled/terminal series require an empty map. Save/import size,
transactional commits, exact command replay and all existing ledger checks still
apply. Proc rolls, expiry and logs happen on the draft before commit.

The UI displays only the already-applied status and remaining ticks. It does not
reveal enemy HP, level, attack, resistance or future actions without Scan, and
adds no intent prediction. All rendered effect values use normal escaping.

## Coverage

- Pure kernel: probability endpoints, strict/pure/descriptor-first validation,
  integer bounds, duration refresh and expiry, factors and malformed records
- Integration: real frozen C22a practice/Arena/Grindfest command replays; exact
  resources, events, enemies, RNG and settlement remain unchanged after migration
- Proc draw count on hit/glance/miss/kill; refresh;99/100 boundary; zero-time items;
  multi-tick cast; same-time expiry/attack; final floor/Defend/minimum1; repeated
  command; save reload; invalid imports; death/wave/defeat/flee; failed-commit rollback
- Actual-app VM status rendering, Scan boundary and cleanup tests

No native browser/mobile/visual test or official original-server acceptance is
implied. Full system backlog, unresolved formulas, Persistent-only scope and
inert external privileges remain unchanged.
