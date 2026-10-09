# Checkpoint 14 — sourced potions and NPC health supplies

Rules: persistent-0.91-training-v10, schema1. Includes the C13a battle-identity and atomic Arena settlement correction.

New series use Health Potion100% baseHP, Mana Potion50% baseMP and40-turn item cooldown. Explicit base versus maximum resource fields avoid granting future tank bonuses twice. Final fractional rounding is a documented candidate. Existing active series retain their exact old potion behavior through completion; no stock is refilled by migration or victory.

The new supply counter exchanges earned in-game Credits for Health Potions at the documented NPC price of50 each. The page shows quantity, total, inventory and a confirmation step. Cancel is free. Funds, caps, active-series restrictions and monotonic purchase revisions are checked before mutation; a repeated last confirmation is a no-op, older requests reject. Only the explicitly sourced always-available health item is sold. No player stock, mana supply, discount, free item or real payment is invented.

A bounded purchase ledger retains only its latest receipt. NPC purchases do not advance time/RNG, heal the player or touch Arena/EXP/equipment ledgers. Failed and stale operations preserve the entire state.

Verification:250 checks passed before merging C13a;256 checks after integration, static build and whitespace checks passed. Tests include a complete Arena earning→purchase→reload flow, cancellation-equivalent read-only quotes, exactly funded/insufficient/cap/malformed cases, duplicates, combat/intermission restriction, strict receipt import checks, old-save empty-ledger migration, actual C13 engine potion replay,40-turn boundaries and cross-wave preservation. Independent exact-SHA source and affected live UI checks remain pending at freeze.

Source details: RESTORATIVES.md and SUPPLIES.md. Full game scope remains in BACKLOG.md. This source checkpoint does not publish itself.
