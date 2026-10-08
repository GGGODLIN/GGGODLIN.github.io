# Protected progression integration candidate

This separate, unpublished branch integrates held progression commit
`ec207e70ef9dd780f3366501903243c60cd0c1d4` with gated source repair
`0bd3aca79ca05b03d01a7d3d7c08c34cc075be5a`. The original repair, C27 Tank and held
C28 tags remain immutable. Historical gate logs describe those commits, not this
new integration. Source checks do not authorize or establish publication.

## Included behavior

- Full HP/MP/SP Tank rank tables, prerequisites and per-rank AP ownership costs
  from COMPLETE-TANKS.md, preserving lower ranks and old active battle policy.
- Full level-capped Ability Boost candidate from FULL-ABILITY-BOOST.md: next rank
  no higher than min(500, player level), incremental formula debit, two-hour paid
  jobs, shared Training slot and exact-once completion/refunds. Formula/source
  discrepancies remain explicit, with no free AP or external-account perks.
- Identical protected storage and Web Lock implementation from SAVE-OWNERSHIP.md.
  Canonical keys and lock name are stable across both versions. Every existing
  UI mutation gate and render-driven Training collection retains ownership checks.

The integration preserves the held progression runtime bytes and protected repair
storage/ownership bytes. App changes combine existing presentation for higher
ranks with the repair's mutation guards. A composite manifest declares the
source commit and SHA256 for each of 29 immutable runtime modules; generated
release metadata and the integrated app have normal source/deployed hash checks.

## Reentry and failure boundaries

New tabs cannot mutate while another cooperating release owns the save. After
release, acquisition reloads current canonical state before quotes or collection.
A due job remains uncollected by observers. Failed persistence retains exportable
memory and freezes further mutation; pagehide never flushes that stale memory.

A prior protected C26 app cannot parse the newer rules payload. It must preserve
that canonical data and block ordinary gameplay instead of silently downgrading
it. Its original explicit recovery/reset confirmation remains an intentional
replacement path, not an automatic migration. Close an older owner tab to let the
newer release acquire the lock. Old unprotected clients remain isolated in their
legacy namespace. No cross-version automatic merge is provided.

## Verification

Run `npm run check`, `npm run build`, and `npm run verify:checkpoint`.
`protected-progression.test.js` exercises high-rank UI ownership and failed-save
flows; `protected-version-reentry.test.js` executes both exact protected C26 and
current app modules with shared storage/locks. The two old runtime fixtures are
for tests only and never deployed. Historical progression/replay and source hash
checks remain enabled. Independent integration QA and actual release/browser
acceptance remain required before any deployment claim.
