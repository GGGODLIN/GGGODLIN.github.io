# EXP allocation candidate

This is original, executable prototype code in `src/progression.js`. It is **not a claim of server-exact HentaiVerse behavior**. The source describes an allocation curve; the integer rounding, refund accounting, lifetime/unspent relationship, and numeric limits below are explicit candidate decisions.

## Sources and verification boundary

- Intended versioned formula source: [Character Stats, revision 65166, Experience Point Allocation](https://ehwiki.org/index.php?title=Character_Stats&oldid=65166#Experience_Point_Allocation)
- Intended versioned threshold source: [Level Table, revision 55267](https://ehwiki.org/index.php?title=Level_Table&oldid=55267)
- The historical URLs were not retrievable by the web fetch used during this implementation. The accessible [current Character Stats page](https://ehwiki.org/wiki/Character_Stats#Experience_Point_Allocation) corroborated the formula and ±1/±10/±100 allocation controls. The accessible [Level and Rank Table/Chinese](https://ehwiki.org/wiki/Level_and_Rank_Table/Chinese) corroborated cumulative EXP thresholds of 9,193 at level 20 and 10,506 at level 21. This does not establish exact historical-version equivalence or server behavior.

The source curve is:

```text
F(n) = (n + 1) ^ (2.5475566751265 ^ (1 + n / 950))
raw marginal cost n → n + 1 = F(n + 1) − F(n)
```

The raw 22 → 23 marginal is approximately **443.05050168459366**. No evidence retrieved here establishes the server's integer rounding or exact refund calculation.

## Centralized candidate policy: `ceil-cumulative-v1`

The single rounding implementation is `attributeCumulativeCost(n)`:

```text
C(n) = ceil(F(n) − F(0))
C(0) = 0
signed cost(current → next) = C(next) − C(current)
```

This normalization and rounding are prototype choices. For example, C(22) is 3,507 and C(23) is 3,950, so the candidate charges **443 EXP** for 22 → 23. Independently rounding the raw marginal upward would charge 444; this module deliberately does not use that different policy.

Refunds reverse the same cumulative difference. That is a symmetric **unverified candidate**, not a verified original refund rule. Bulk and sequential changes telescope to identical integer costs, and an allocation/refund round trip cannot mint or lose EXP. No original-game refund rate limit, daily allowance, cooldown, or reset time is asserted or simulated here.

Playable attributes are limited to integers from **1 through 500**. These are explicit prototype boundaries, not claims about the original game's minimum or cap. The cost helper additionally accepts zero as a mathematical reference. At 500, C(n) is 178,448,400,638, and all six attributes total 1,070,690,403,828, safely below JavaScript's maximum safe integer. EXP amounts must be nonnegative safe integers. This range guard does not establish server rounding fidelity or eliminate all floating-point precision differences in the raw exponentiation.

## Ledger invariants and API

The six allocation fields are exactly `str`, `dex`, `agi`, `end`, `int`, and `wis`. Their values represent this model's EXP-backed attributes; equipment, artifacts, Isekai, and other external bonuses must not be inserted into this ledger.

```js
{
  kind: 'experience-ledger',
  earned: 9193,
  allocated: 6540,
  unspent: 2653,
  roundingPolicy: 'ceil-cumulative-v1'
}
```

- `allocated = Σ C(attribute)` across the six attributes
- `earned = allocated + unspent`
- Allocation and refund never change `earned`
- `earned` is modeled as a lifetime counter. Its independence from spending, and its relationship to leveling EXP, are **inferred prototype modeling choices**, not verified server accounting
- There is no XP-award function, drop table, level-up automation, or reward fabrication in this module

Exports:

- `attributeCumulativeCost(n)` returns the candidate integer cost from mathematical zero. It throws `RangeError` for unsupported inputs
- `createExperienceLedger(attributes, earned)` returns a new fully funded ledger without changing the attributes. Malformed inputs throw `TypeError`; insufficient total EXP throws `RangeError`. It never fills a budget deficit
- `validateExperienceLedger(attributes, ledger)` returns a boolean, checking exact fields, policy identity, ranges, safe integers, allocation sum, and conservation
- `quoteAttributeChange(attributes, key, delta, unspent)` returns frozen standalone metadata and never mutates its inputs. Only ±1, ±10, and ±100 are accepted. Positive `cost` spends EXP and negative `cost` refunds it. A valid but unaffordable change returns `ok: false`, an error, and its `cost`, `from`, and `to`; there is no partial purchase or clamping
- `applyAttributeChange(attributes, ledger, key, delta)` validates and quotes before writing. Success mutates the selected attribute plus `allocated` and `unspent`, then returns the quote. Failure returns `ok: false` and an error without any write. `earned`, `kind`, and policy identity do not change
- `EXPERIENCE_POLICY` exposes frozen candidate labels, limits, allowed deltas, policy ID, and intended source URL
- `LEVEL_20_REFERENCE` exposes frozen level 20/21 threshold metadata only

Inputs are ordinary JSON-shaped data records, including null-prototype records. Unknown fields, inherited fields, accessors, symbols, non-integers, non-finite values, and unsafe amounts are rejected. Mutating calls preflight writable properties to reject frozen/read-only records without partially applying an edit. JavaScript Proxy objects and adversarial host objects are outside this data contract.

The caller remains responsible for combat-time rejection, derived-stat/resource reconciliation, save migrations, and user-facing confirmation where appropriate. A quote is a current snapshot, not a reserved purchase: apply recomputes and revalidates against current state.

## Coherent new-profile fixture and legacy boundary

The new-profile fixture uses level **20** and explicit lifetime EXP **9,193**, with all six attributes at **14**:

```text
C(14) = 1090
allocated = 6 × 1090 = 6540
unspent = 9193 − 6540 = 2653
next reference threshold = 10506 (level 21)
threshold gap = 1313
```

The balanced attributes and initial budget assignment are authored prototype fixture choices. The numeric thresholds come from the references above. They do not mean a battle awarded this EXP, nor do they supply an XP reward mechanism. Allocation can change the attributes without changing the fixture's lifetime EXP or level metadata.

Existing saves must retain their separate legacy-fixture treatment. This module does not convert old attribute points, rebalance old attributes, raise earned EXP to fund them, or issue compensation. Creating a ledger with an insufficient explicit earned total fails instead of silently granting currency. Any later migration needs its own documented policy and tests.

## Verification

Run `node --test tests/progression.test.js` for the focused suite, or `npm test` for the repository's full regression suite. Tests establish adherence to this recorded candidate policy, not fidelity to an unavailable server implementation.

Coverage includes the raw 22 → 23 value and deliberate rounding distinction, zero normalization, bounds, fixture coherence, read-only quotes, all supported bulk directions, sequential equivalence, symmetric round trips, exact-balance purchases, atomic insufficient-fund rejection, invalid keys/fields/amounts, read-only targets, serialized validation, exact allocation sums, and lifetime-counter conservation.
