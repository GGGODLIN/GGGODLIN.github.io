# Bounded saves and explicit legacy conversion

Schema2 / rules `persistent-0.91-training-v13` replaces indefinitely growing audit arrays. No gameplay formula, balance, reward quantity, equipment roll, AP entitlement, or source-vitals choice changes in this checkpoint.

## Retained information

- Up to128 complete command results, also capped at256KiB of UTF-8 JSON. Results are evicted whole; individual results are never truncated
- Latest64 terminal battle summaries, with exact archived outcome counters. Training victory totals remain conserved
- Latest100 battle-log events, also capped at128KiB, with an omitted-line count
- Latest attempt for each Arena and the current/latest Arena's round/terminal receipts. Lifetime clear totals remain exact
- Full current character, EXP/AP, inventory and item identities/rolls, supplies, stamina, daily eligibility, battle scheduler, resources, cooldowns, RNG and pending series state

The [Battles log section](https://ehwiki.org/wiki/Battles#Battle_Log), observed footer64927 on2026-10-07, describes an original display window of100 lines. Our byte limits, archive counters and receipt protocol are local engineering policies, not original-server rules. No reward is reconstructed from retained logs.

The previous “full battle log” wording is replaced by “recent battle chronicle.” The CSS enemy-card class is now namespaced so enemy-hit log rows do not inherit card dimensions.

## Command contract

Use `nextCommandToken(game)` to obtain a typed `{seq}` token and supply it to `performAction`. Retain the same token for a retry. Successful sequences are contiguous and advance a persisted high-water mark; failed actions never consume a token. A retained exact retry returns its original result without re-execution. A conflicting payload, expired sequence or future gap is rejected without mutation. Omitting a token is a convenience for a new command, not a retry identity.

Legacy string IDs are retry-only. If their original result remains in the migrated tail, it can be returned exactly; otherwise the string is rejected as retired. Strings are never parsed into modern tokens, so even an old ID that resembles a new sequence cannot collide with the new typed namespace.

This intentionally replaces the impossible promise of bounded storage plus indefinite exact replay for arbitrary strings. See COMMAND-LEDGER.md. The guarantee applies within one unchanged save lineage and one writer. Restoring an old backup, editing a save, branching copies or concurrent tabs is not globally exactly-once behavior.

## Validation and commit order

All size-growing battle transitions (entry, player action and Continue) operate on a draft. Receipt append and audit compaction happen only on successful drafts. The complete resulting state, cross-record invariants and5,000,000-byte limit are checked before commit. A failure leaves the prior state, RNG, resources and receipts unchanged.

Compaction does not happen in `serializeGame`; serialization remains pure. Unknown extensions in current-schema payloads are rejected rather than allowed to grow without a limit. The old schema1 Arena validator is preserved at `src/compat/arena-schema1.js` solely to validate old audit links before conversion.

Schema1 conversion first checks the full supported old state, including duplicated receipt copies and Arena history. It then establishes archived counters, binds an old null reservation only to its verified current battle, and retains bounded recent details. Current battle mechanics and event/RNG outcomes remain pinned to their original policies. Historical fixture JSON files are unchanged; replay tests submit new typed tokens while comparing the original gameplay results.

## No silent overwrite of the original

Loading an old local save prepares a converted preview without any storage write. The UI opens a retention disclosure and offers a complete raw-original download. Until the player confirms, the original remains untouched and gameplay controls are read-only. Declining keeps this state and an always-visible route back to the decision.

The player explicitly confirms before old detail retention changes. The app attempts to retain the complete old raw file in the browser backup. If quota makes that impossible, only this confirmed legacy replacement may continue, with a visible warning; the original remains available to download for the lifetime of that open page. Ordinary modern-save backup failures still prevent overwrite.

Importing a schema1 file likewise discloses retention changes before confirmation, and the selected original file is never modified. Keep that file as the complete archive. Saved balances and cumulative achievements are preserved; old audit detail is not claimed to remain in the compact active save.

## Oversized legacy recovery

Normal imports remain limited to5,000,000 UTF-8 bytes. The separate `recoverLegacyGame` path accepts only supported schema1 files, at most20,000,000 bytes, and runs the same full validation before conversion. Modern oversized files do not enter this recovery path. Output must satisfy the normal5MB limit. The UI identifies this as legacy recovery, not a larger unlimited normal-save allowance.

## Evidence

-1,200 completed training series:89,248 bytes at400 series and92,565 at1,200;128 recent receipts and64 summaries, with1,136 archived outcomes
- A synthetic valid legacy archive exceeding5MB recovers through the explicit path, retaining player/items/RNG and all cumulative outcomes
- A1,000-item structural capacity fixture remains complete and save-valid
- Frozen schema1 activity tests stay unchanged; new bounded activity tests cover180 days across all three Arenas and plateau at3 attempts /6 round receipts /1 terminal receipt
- Eight actual cloud-QA exports from C10c through C16a preserve their C16a-normalized core and round-trip under schema2
- Storage tests cover read-only preview, confirmation gates, exact raw export availability, quota failures, primary failures and legacy backup fallback

These are local implementation checks. Full longer activities are still not enabled; adding one requires its own source, size and settlement validation.
